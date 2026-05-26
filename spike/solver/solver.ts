/**
 * TER-217 spike — true-optimal par solver (IDA* with tight heuristics)
 *
 * ASSUMPTION: Optimal solutions never require clears.
 * Rationale: starting from empty, any generator-produced board is reachable
 * via placements only (green→yellow→red ordering). Clears can only help by
 * undoing misplacements, but pruning rules R1–R2 eliminate all permanently-
 * damaging moves, so no clear is ever needed on an optimal path.
 *
 * PRUNING RULES (provably safe):
 *   R1. Never place red at a non-red target cell (permanent: nothing overwrites red).
 *   R2. Never place yellow at (r,c) if any writable cell (empty|green) in its
 *       plus-pattern has target = 'green'. Yellow sets it to yellow permanently
 *       (green only overwrites empty; impossible to restore without clearing).
 *   R3. Skip no-op moves.
 *
 * HEURISTIC (admissible, tight):
 *   h = redMismatch
 *     + minYellowCover(currentMask)  — exact min-cover via precomputed DP table
 *     + ceil(greenMismatch / (2N−1)) — admissible green lower bound
 *
 *   Yellow min-cover table: built once per puzzle via bitmask DP over the set
 *   of target-yellow cells (up to 2^|Y| states). Uses all N² plus centers as
 *   candidate stamps (ignores R2 for admissibility; tighter than ceil(|Y|/5)).
 *
 * TRANSPOSITION TABLE: cleared per IDA* bound level.
 *   Monotone heuristic (h decreases ≤1 per step) ensures validity.
 *
 * MOVE ORDERING: sorted by net gain toward target (descending).
 */

const EMPTY = 0, RED = 1, YELLOW = 2, GREEN = 3;
type FlatBoard = Uint8Array;

export interface SolverResult {
  optimalMoves: number;
  nodesExplored: number;
  timeMs: number;
  timedOut: boolean;
  peakMemoryMB: number;
}

export function boardToFlat(board: string[][]): FlatBoard {
  const size = board.length;
  const flat = new Uint8Array(size * size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      flat[r * size + c] = v === 'red' ? RED : v === 'yellow' ? YELLOW : v === 'green' ? GREEN : EMPTY;
    }
  return flat;
}

// ── Yellow min-cover DP ───────────────────────────────────────────────────
// Pre-compute once per puzzle: minCoverTable[mask] = min number of plus placements
// to cover exactly the target-yellow cells indicated by the bitmask.
// mask bit i = 1 means yellow-target cell i is NOT yet yellow.

function buildYellowMinCoverTable(
  target: FlatBoard,
  size: number,
): { table: Uint8Array; cellIdxs: Uint16Array; centerMasks: Uint32Array } {
  // Identify target-yellow cells
  const cells: number[] = [];
  for (let i = 0; i < target.length; i++)
    if (target[i] === YELLOW) cells.push(i);
  const k = cells.length;
  if (k === 0) return { table: new Uint8Array(1), cellIdxs: new Uint16Array(), centerMasks: new Uint32Array() };
  // For k > 26, bitmask DP (2^k states × 1 byte) exceeds ~64 MB budget. Return
  // a sentinel so callers fall back to the coarse ceil(k/5) lower bound.
  if (k > 26) return { table: new Uint8Array(0), cellIdxs: new Uint16Array(cells), centerMasks: new Uint32Array() };

  const cellIdxs = new Uint16Array(cells);
  const positionOf = new Map<number, number>(); // flatIdx -> bit position
  for (let i = 0; i < k; i++) positionOf.set(cells[i], i);

  // For each plus center (row,col), compute coverage bitmask over target-yellow cells
  const centerMasks = new Uint32Array(size * size);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let mask = 0;
      for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]] as [number, number][]) {
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const bit = positionOf.get(r * size + c);
        if (bit !== undefined) mask |= (1 << bit);
      }
      centerMasks[row * size + col] = mask;
    }
  }

  // Collect active center coverage masks (those covering ≥1 yellow cell)
  const activeCenters: number[] = [];
  for (let i = 0; i < centerMasks.length; i++)
    if (centerMasks[i] !== 0) activeCenters.push(centerMasks[i]);

  // DP: atLeastCover[S] = min stamps to cover AT LEAST all cells in bitmask S.
  //
  // Recurrence: atLeastCover[S] = 1 + min{ atLeastCover[S & ~coverMask(p)] : p covers ≥1 cell in S }
  //
  // Key property: S & ~coverMask(p) < S numerically when coverMask(p) & S ≠ 0
  // (bits are only cleared, never added). So iterating S from 0 upward satisfies
  // all dependencies — the right-hand side is always a smaller index.
  const states = 1 << k;
  const table = new Uint8Array(states).fill(255);
  table[0] = 0;

  for (let s = 1; s < states; s++) {
    for (let i = 0; i < activeCenters.length; i++) {
      if ((activeCenters[i] & s) === 0) continue; // stamp covers nothing in s
      const remaining = s & ~activeCenters[i];
      const cand = table[remaining];
      if (cand !== 255 && cand + 1 < table[s]) table[s] = cand + 1;
    }
  }
  return { table, cellIdxs, centerMasks };
}

// Compute the current yellow mismatch bitmask from a board
function yellowMask(b: FlatBoard, cellIdxs: Uint16Array): number {
  let mask = 0;
  for (let i = 0; i < cellIdxs.length; i++)
    if (b[cellIdxs[i]] !== YELLOW) mask |= (1 << i);
  return mask;
}

// ── In-place moves with undo ───────────────────────────────────────────────

type UE = [number, number]; // [cellIndex, prevValue]
type Undo = UE[];

function applyGreen(b: FlatBoard, row: number, col: number, size: number, u: Undo): boolean {
  const reach: number[] = [row * size + col];
  for (let r = row - 1; r >= 0; r--) { if (b[r * size + col] !== EMPTY) break; reach.push(r * size + col); }
  for (let r = row + 1; r < size; r++) { if (b[r * size + col] !== EMPTY) break; reach.push(r * size + col); }
  for (let c = col - 1; c >= 0; c--) { if (b[row * size + c] !== EMPTY) break; reach.push(row * size + c); }
  for (let c = col + 1; c < size; c++) { if (b[row * size + c] !== EMPTY) break; reach.push(row * size + c); }
  let chg = false;
  for (const idx of reach) if (b[idx] === EMPTY) { u.push([idx, EMPTY]); b[idx] = GREEN; chg = true; }
  return chg;
}

function applyYellow(b: FlatBoard, row: number, col: number, size: number, u: Undo): boolean {
  let chg = false;
  for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]] as [number, number][]) {
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    const idx = r * size + c, cur = b[idx];
    if (cur === EMPTY || cur === GREEN) { u.push([idx, cur]); b[idx] = YELLOW; chg = true; }
  }
  return chg;
}

function applyRed(b: FlatBoard, idx: number, u: Undo): void { u.push([idx, b[idx]]); b[idx] = RED; }

function undoFrom(b: FlatBoard, u: Undo, from: number): void {
  for (let i = u.length - 1; i >= from; i--) b[u[i][0]] = u[i][1];
  u.length = from;
}

// ── Heuristic ─────────────────────────────────────────────────────────────

function calcH(
  b: FlatBoard,
  target: FlatBoard,
  size: number,
  yellowTable: Uint8Array,
  yellowCellIdxs: Uint16Array,
): number {
  let red = 0, yel = 0, grn = 0;
  for (let i = 0; i < b.length; i++) {
    if (b[i] !== target[i]) {
      const t = target[i];
      if (t === RED) red++;
      else if (t === YELLOW) yel++;
      else if (t === GREEN) grn++;
    }
  }
  // Use exact DP table when available (k≤22), else coarse ceil(k/5)
  const yLB = yellowTable.length > 0
    ? yellowTable[yellowMask(b, yellowCellIdxs)]
    : Math.ceil(yel / 5);
  const gLB = Math.ceil(grn / (2 * size - 1));
  return red + yLB + gLB;
}

// ── Move scoring ──────────────────────────────────────────────────────────

function scoreG(b: FlatBoard, target: FlatBoard, row: number, col: number, size: number): number {
  let s = 0;
  const add = (idx: number) => { if (b[idx] === EMPTY) s += target[idx] === GREEN ? 1 : -1; };
  add(row * size + col);
  for (let r = row - 1; r >= 0; r--) { if (b[r * size + col] !== EMPTY) break; add(r * size + col); }
  for (let r = row + 1; r < size; r++) { if (b[r * size + col] !== EMPTY) break; add(r * size + col); }
  for (let c = col - 1; c >= 0; c--) { if (b[row * size + c] !== EMPTY) break; add(row * size + c); }
  for (let c = col + 1; c < size; c++) { if (b[row * size + c] !== EMPTY) break; add(row * size + c); }
  return s;
}

function scoreY(b: FlatBoard, target: FlatBoard, row: number, col: number, size: number): number {
  let s = 0;
  for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]] as [number, number][]) {
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    const idx = r * size + c, cur = b[idx];
    if (cur === EMPTY || cur === GREEN) s += target[idx] === YELLOW ? 1 : -1;
  }
  return s;
}

// ── IDA* with TT ──────────────────────────────────────────────────────────

let _nodes = 0;
let _deadline = 0;
let _timedOut = false;

function encodeBoard(b: FlatBoard, n: number): number | string {
  if (n <= 25) {
    let v = 0;
    for (let i = n - 1; i >= 0; i--) v = v * 4 + b[i];
    return v;
  }
  return String.fromCharCode.apply(null, b as unknown as number[]);
}

function search(
  b: FlatBoard,
  target: FlatBoard,
  size: number,
  n: number,
  g: number,
  bound: number,
  redIdxs: Uint16Array,
  u: Undo,
  tt: Map<number | string, number>,
  yellowTable: Uint8Array,
  yellowCellIdxs: Uint16Array,
): number {
  _nodes++;
  if ((_nodes & 0x3fff) === 0 && Date.now() > _deadline) { _timedOut = true; return Infinity; }

  const key = encodeBoard(b, n);
  const prev = tt.get(key);
  if (prev !== undefined && prev <= g) return Infinity;
  // Cap TT at 4M entries to prevent OOM on deep 8×8 searches.
  if (tt.size < 4_000_000) tt.set(key, g);

  const hv = calcH(b, target, size, yellowTable, yellowCellIdxs);
  const f = g + hv;
  if (f > bound) return f;
  if (hv === 0) return -1;

  let min = Infinity;

  // Red (R1)
  for (let i = 0; i < redIdxs.length; i++) {
    const idx = redIdxs[i];
    if (b[idx] === RED) continue;
    const base = u.length;
    applyRed(b, idx, u);
    const t = search(b, target, size, n, g + 1, bound, redIdxs, u, tt, yellowTable, yellowCellIdxs);
    undoFrom(b, u, base);
    if (_timedOut) return Infinity;
    if (t === -1) return -1;
    if (t < min) min = t;
  }

  // Yellow (R2 + scored)
  type YMove = [number, number, number];
  const yMoves: YMove[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let ok = false, hasW = false;
      for (const [r, c] of [[row, col], [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]] as [number, number][]) {
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const idx = r * size + c, cur = b[idx];
        if (cur === EMPTY || cur === GREEN) {
          hasW = true;
          if (target[idx] === GREEN) { ok = false; break; }
          ok = true;
        }
      }
      if (!ok || !hasW) continue;
      yMoves.push([scoreY(b, target, row, col, size), row, col]);
    }
  }
  yMoves.sort((a, z) => z[0] - a[0]);
  for (const [, row, col] of yMoves) {
    const base = u.length;
    if (!applyYellow(b, row, col, size, u)) { u.length = base; continue; }
    const t = search(b, target, size, n, g + 1, bound, redIdxs, u, tt, yellowTable, yellowCellIdxs);
    undoFrom(b, u, base);
    if (_timedOut) return Infinity;
    if (t === -1) return -1;
    if (t < min) min = t;
  }

  // Green (scored)
  type GMove = [number, number, number];
  const gMoves: GMove[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const idx = row * size + col;
      const hasEmpty = b[idx] === EMPTY
        || (row > 0 && b[idx - size] === EMPTY)
        || (row < size - 1 && b[idx + size] === EMPTY)
        || (col > 0 && b[idx - 1] === EMPTY)
        || (col < size - 1 && b[idx + 1] === EMPTY);
      if (!hasEmpty) continue;
      gMoves.push([scoreG(b, target, row, col, size), row, col]);
    }
  }
  gMoves.sort((a, z) => z[0] - a[0]);
  for (const [, row, col] of gMoves) {
    const base = u.length;
    if (!applyGreen(b, row, col, size, u)) { u.length = base; continue; }
    const t = search(b, target, size, n, g + 1, bound, redIdxs, u, tt, yellowTable, yellowCellIdxs);
    undoFrom(b, u, base);
    if (_timedOut) return Infinity;
    if (t === -1) return -1;
    if (t < min) min = t;
  }

  return min;
}

// ── Public entry ──────────────────────────────────────────────────────────

export function solve(board: string[][], timeoutMs = 60_000): SolverResult {
  const size = board.length;
  const n = size * size;
  const target = boardToFlat(board);
  const b = new Uint8Array(n);

  const redList: number[] = [];
  for (let i = 0; i < n; i++) if (target[i] === RED) redList.push(i);
  const redIdxs = new Uint16Array(redList);

  // Build yellow min-cover table (exact LB for yellow component of heuristic)
  const { table: yellowTable, cellIdxs: yellowCellIdxs } = buildYellowMinCoverTable(target, size);

  _nodes = 0; _timedOut = false; _deadline = Date.now() + timeoutMs;
  const t0 = Date.now();
  let bound = calcH(b, target, size, yellowTable, yellowCellIdxs);
  const u: Undo = [];
  const tt = new Map<number | string, number>();

  while (!_timedOut) {
    tt.clear();
    const t = search(b, target, size, n, 0, bound, redIdxs, u, tt, yellowTable, yellowCellIdxs);
    if (_timedOut) break;
    if (t === -1) {
      return {
        optimalMoves: bound,
        nodesExplored: _nodes,
        timeMs: Date.now() - t0,
        timedOut: false,
        peakMemoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      };
    }
    if (t === Infinity) break;
    bound = t;
  }

  return {
    optimalMoves: -1,
    nodesExplored: _nodes,
    timeMs: Date.now() - t0,
    timedOut: true,
    peakMemoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  };
}
