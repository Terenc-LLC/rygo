// GENERATED — do not edit. Source: src/engine/parSolver.ts. Regenerate: npm run sync-engine
/**
 * Production par solver — A* with full memoization.
 *
 * Placements-only search. Pruning rules (provably safe):
 *   R1: Never place red at a non-red target cell (red overwrites all, permanent).
 *   R2: Never place yellow at (r,c) if any writable cell (empty|green) in its
 *       plus-reach has target = 'green'. Yellow permanently sets that cell to
 *       yellow; only clearing can restore it, and clearing is never needed on
 *       an R1/R2-safe optimal path (see placement-only verification in tests).
 *   R3: Skip any move whose board footprint is empty (no cells change).
 *
 * Heuristic (admissible and consistent — decreases ≤1 per move):
 *   h = redMismatch
 *     + minYellowCover(yellowMask)  — exact DP table when k≤26 target-yellow cells
 *     + ⌈greenMismatch / (2N−1)⌉   — admissible green lower bound
 *
 * The yellow min-cover DP (bitmask DP over target-yellow cells, k≤26) is
 * pre-computed once per puzzle and reused across all A* nodes.
 *
 * Algorithm: A* with a Map-based closed set keyed by board state. Once a state
 * enters the closed set the recorded g is optimal (consistent heuristic). The
 * open set is a binary min-heap sorted by f = g + h.
 */

import type { Board } from './types.ts';

// ── Internal board representation ─────────────────────────────────────────
const EMPTY = 0, RED = 1, YELLOW = 2, GREEN = 3;
type Flat = Uint8Array;

function boardToFlat(board: Board): Flat {
  const size = board.length;
  const flat = new Uint8Array(size * size);
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      flat[r * size + c] = v === 'red' ? RED : v === 'yellow' ? YELLOW : v === 'green' ? GREEN : EMPTY;
    }
  return flat;
}

// Pack board as a number (n≤25) or string (n>25) for Map keying.
// n≤25: base-4 encoding, ≤2^50, safe in float64.
// n>25: char-code string, unique per unique byte sequence.
function encodeBoard(b: Flat, n: number): number | string {
  if (n <= 25) {
    let v = 0;
    for (let i = n - 1; i >= 0; i--) v = v * 4 + b[i];
    return v;
  }
  return String.fromCharCode.apply(null, b as unknown as number[]);
}

// ── Yellow min-cover DP ───────────────────────────────────────────────────

interface YellowTables {
  table: Uint8Array;      // table[mask] = min plus-stamps to cover all 1-bits in mask
  cellIdxs: Uint16Array;  // flat indices of target-yellow cells, in bit order
  k: number;              // number of target-yellow cells
}

function buildYellowTables(target: Flat, size: number): YellowTables {
  const cells: number[] = [];
  for (let i = 0; i < target.length; i++)
    if (target[i] === YELLOW) cells.push(i);
  const k = cells.length;
  const cellIdxs = new Uint16Array(cells);

  if (k === 0) return { table: new Uint8Array(1), cellIdxs, k };
  // k>26 → 2^k states exceed ~64 MB; return empty table so callers use ⌈k/5⌉.
  if (k > 26) return { table: new Uint8Array(0), cellIdxs, k };

  const posOf = new Map<number, number>();
  for (let i = 0; i < k; i++) posOf.set(cells[i], i);

  // Coverage bitmask for each plus center: which target-yellow cells does it cover?
  const activeCenters: number[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let mask = 0;
      for (const [r, c] of [
        [row, col], [row - 1, col], [row + 1, col],
        [row, col - 1], [row, col + 1],
      ] as [number, number][]) {
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const bit = posOf.get(r * size + c);
        if (bit !== undefined) mask |= 1 << bit;
      }
      if (mask !== 0) activeCenters.push(mask);
    }
  }

  // DP: table[s] = min stamps to cover all 1-bits in s.
  // Iterate s 0→(2^k - 1); each valid transition S → S & ~coverMask produces
  // a strictly smaller index, so all dependencies resolve in one forward pass.
  const states = 1 << k;
  const table = new Uint8Array(states).fill(255);
  table[0] = 0;
  for (let s = 1; s < states; s++) {
    for (const cm of activeCenters) {
      if ((cm & s) === 0) continue;
      const sub = table[s & ~cm];
      if (sub !== 255 && sub + 1 < table[s]) table[s] = sub + 1;
    }
  }
  return { table, cellIdxs, k };
}

function yellowMaskBits(b: Flat, cellIdxs: Uint16Array): number {
  let mask = 0;
  for (let i = 0; i < cellIdxs.length; i++)
    if (b[cellIdxs[i]] !== YELLOW) mask |= 1 << i;
  return mask;
}

// ── Heuristic ─────────────────────────────────────────────────────────────

function calcH(b: Flat, target: Flat, size: number, yt: YellowTables): number {
  let red = 0, yel = 0, grn = 0;
  for (let i = 0; i < b.length; i++) {
    if (b[i] !== target[i]) {
      switch (target[i]) {
        case RED:    red++; break;
        case YELLOW: yel++; break;
        case GREEN:  grn++; break;
      }
    }
  }
  const yLB = yt.table.length > 0
    ? yt.table[yellowMaskBits(b, yt.cellIdxs)]
    : Math.ceil(yel / 5);
  return red + yLB + Math.ceil(grn / (2 * size - 1));
}

// ── Apply-and-copy helpers ────────────────────────────────────────────────

function applyRed(b: Flat, idx: number): Flat | null {
  if (b[idx] === RED) return null; // R3: no-op
  const nb = b.slice();
  nb[idx] = RED;
  return nb;
}

// Applies yellow at (row,col). Returns null on R2 violation or R3 no-op.
function applyYellow(b: Flat, row: number, col: number, size: number, target: Flat): Flat | null {
  const toWrite: number[] = [];
  for (const [r, c] of [
    [row, col], [row - 1, col], [row + 1, col],
    [row, col - 1], [row, col + 1],
  ] as [number, number][]) {
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    const idx = r * size + c, cur = b[idx];
    if (cur === EMPTY || cur === GREEN) {
      if (target[idx] === GREEN) return null; // R2: would permanently block a green target
      toWrite.push(idx);
    }
  }
  if (toWrite.length === 0) return null; // R3: nothing to write
  const nb = b.slice();
  for (const idx of toWrite) nb[idx] = YELLOW;
  return nb;
}

// Applies green at (row,col). Returns null on R3 no-op.
// Placed cell is filled only if empty; propagation continues through empty
// cells in each cardinal direction, stopping before the first non-empty cell.
function applyGreen(b: Flat, row: number, col: number, size: number): Flat | null {
  const toWrite: number[] = [];
  const base = row * size + col;
  if (b[base] === EMPTY) toWrite.push(base);
  for (let r = row - 1; r >= 0; r--) { const i = r * size + col; if (b[i] !== EMPTY) break; toWrite.push(i); }
  for (let r = row + 1; r < size; r++) { const i = r * size + col; if (b[i] !== EMPTY) break; toWrite.push(i); }
  for (let c = col - 1; c >= 0; c--) { const i = row * size + c; if (b[i] !== EMPTY) break; toWrite.push(i); }
  for (let c = col + 1; c < size; c++) { const i = row * size + c; if (b[i] !== EMPTY) break; toWrite.push(i); }
  if (toWrite.length === 0) return null; // R3: no empty cells in reach
  const nb = b.slice();
  for (const idx of toWrite) nb[idx] = GREEN;
  return nb;
}

// ── Min-heap ──────────────────────────────────────────────────────────────

interface HeapNode { f: number; g: number; board: Flat; }

class MinHeap {
  private data: HeapNode[] = [];
  get size(): number { return this.data.length; }

  push(node: HeapNode): void {
    this.data.push(node);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[p].f <= this.data[i].f) break;
      const tmp = this.data[p]; this.data[p] = this.data[i]; this.data[i] = tmp;
      i = p;
    }
  }

  pop(): HeapNode | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        let s = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < this.data.length && this.data[l].f < this.data[s].f) s = l;
        if (r < this.data.length && this.data[r].f < this.data[s].f) s = r;
        if (s === i) break;
        const tmp = this.data[s]; this.data[s] = this.data[i]; this.data[i] = tmp;
        i = s;
      }
    }
    return top;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export type SolverResult = { proven: true; par: number } | { proven: false };

// Closed-set cap to prevent OOM in offline use. Calibrated for offline job
// (Node.js); well under Deno edge-function limits for 4×4/5×5 sizes that
// actually solve.
const MAX_CLOSED = 4_000_000;

export function solveOptimalPar(
  target: Board,
  gridSize: 4 | 5 | 6 | 8,
  options: { budgetMs: number },
): SolverResult {
  const n = gridSize * gridSize;
  const flatTarget = boardToFlat(target);
  const yt = buildYellowTables(flatTarget, gridSize);

  // Pre-compute red target indices (R1: only ever place red at red-target cells).
  const redIdxs: number[] = [];
  for (let i = 0; i < n; i++)
    if (flatTarget[i] === RED) redIdxs.push(i);

  const initialBoard = new Uint8Array(n);
  const h0 = calcH(initialBoard, flatTarget, gridSize, yt);

  const deadline = Date.now() + options.budgetMs;
  if (Date.now() >= deadline) return { proven: false };

  const heap = new MinHeap();
  heap.push({ f: h0, g: 0, board: initialBoard });

  const closed = new Map<number | string, number>();
  let nodeCount = 0;

  while (heap.size > 0) {
    const node = heap.pop()!;
    const key = encodeBoard(node.board, n);

    // Skip stale heap entries: a shorter path to this state was processed first.
    const prev = closed.get(key);
    if (prev !== undefined && prev <= node.g) continue;
    closed.set(key, node.g);

    const h = node.f - node.g;
    if (h === 0) return { proven: true, par: node.g };

    nodeCount++;
    if ((nodeCount & 0x3fff) === 0 && Date.now() > deadline) return { proven: false };
    if (closed.size >= MAX_CLOSED) return { proven: false };

    const b = node.board;
    const ng = node.g + 1;

    // ── Red (R1: target-red cells only) ─────────────────────────────────
    for (const idx of redIdxs) {
      const nb = applyRed(b, idx);
      if (nb === null) continue;
      const nk = encodeBoard(nb, n);
      const cp = closed.get(nk);
      if (cp !== undefined && cp <= ng) continue;
      heap.push({ f: ng + calcH(nb, flatTarget, gridSize, yt), g: ng, board: nb });
    }

    // ── Yellow (R2 + R3, scored for move ordering) ───────────────────────
    type YE = [number, number, number]; // [score, row, col]
    const yMoves: YE[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // Quick R2 + R3 pre-check before scoring
        let hasWritable = false, violatesR2 = false;
        for (const [r, c] of [
          [row, col], [row - 1, col], [row + 1, col],
          [row, col - 1], [row, col + 1],
        ] as [number, number][]) {
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
          const idx = r * gridSize + c, cur = b[idx];
          if (cur === EMPTY || cur === GREEN) {
            hasWritable = true;
            if (flatTarget[idx] === GREEN) { violatesR2 = true; break; }
          }
        }
        if (!hasWritable || violatesR2) continue;
        // Net yellow-target cells gained (positive = good)
        let score = 0;
        for (const [r, c] of [
          [row, col], [row - 1, col], [row + 1, col],
          [row, col - 1], [row, col + 1],
        ] as [number, number][]) {
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) continue;
          const idx = r * gridSize + c, cur = b[idx];
          if (cur === EMPTY || cur === GREEN)
            score += flatTarget[idx] === YELLOW ? 1 : -1;
        }
        yMoves.push([score, row, col]);
      }
    }
    yMoves.sort((a, z) => z[0] - a[0]);
    for (const [, row, col] of yMoves) {
      const nb = applyYellow(b, row, col, gridSize, flatTarget);
      if (nb === null) continue;
      const nk = encodeBoard(nb, n);
      const cp = closed.get(nk);
      if (cp !== undefined && cp <= ng) continue;
      heap.push({ f: ng + calcH(nb, flatTarget, gridSize, yt), g: ng, board: nb });
    }

    // ── Green (R3, scored for move ordering) ────────────────────────────
    type GE = [number, number, number]; // [score, row, col]
    const gMoves: GE[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const idx = row * gridSize + col;
        // Quick check: at least one cell in the immediate 5-neighborhood is empty
        const hasEmpty =
          b[idx] === EMPTY ||
          (row > 0 && b[idx - gridSize] === EMPTY) ||
          (row < gridSize - 1 && b[idx + gridSize] === EMPTY) ||
          (col > 0 && b[idx - 1] === EMPTY) ||
          (col < gridSize - 1 && b[idx + 1] === EMPTY);
        if (!hasEmpty) continue;
        // Score = net target-green cells gained in reach
        let score = 0;
        const addScore = (i: number) => {
          if (b[i] === EMPTY) score += flatTarget[i] === GREEN ? 1 : -1;
        };
        addScore(idx);
        for (let r = row - 1; r >= 0; r--) { if (b[r * gridSize + col] !== EMPTY) break; addScore(r * gridSize + col); }
        for (let r = row + 1; r < gridSize; r++) { if (b[r * gridSize + col] !== EMPTY) break; addScore(r * gridSize + col); }
        for (let c = col - 1; c >= 0; c--) { if (b[row * gridSize + c] !== EMPTY) break; addScore(row * gridSize + c); }
        for (let c = col + 1; c < gridSize; c++) { if (b[row * gridSize + c] !== EMPTY) break; addScore(row * gridSize + c); }
        gMoves.push([score, row, col]);
      }
    }
    gMoves.sort((a, z) => z[0] - a[0]);
    for (const [, row, col] of gMoves) {
      const nb = applyGreen(b, row, col, gridSize);
      if (nb === null) continue;
      const nk = encodeBoard(nb, n);
      const cp = closed.get(nk);
      if (cp !== undefined && cp <= ng) continue;
      heap.push({ f: ng + calcH(nb, flatTarget, gridSize, yt), g: ng, board: nb });
    }
  }

  // Search space fully exhausted without finding solution (should not occur
  // for valid generator-produced puzzles; budget or cap fires first in practice).
  return { proven: false };
}
