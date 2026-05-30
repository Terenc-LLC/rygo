// GENERATED — do not edit. Source: src/engine/generator.ts. Regenerate: npm run sync-engine
import type { Board, Color, Move } from './types.ts';
import { applyMove } from './placement.ts';

export interface GeneratedPuzzle {
  target: Board;
  solution: Move[];
  gridSize: 4 | 5 | 6 | 8;
  seed: string;
}

// mulberry32 — zero-dependency deterministic PRNG (seed: uint32 → () => float in [0,1))
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

// djb2-style hash: string → uint32
function hashSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Color weights: red 0.40, yellow 0.40, green 0.20.
// Green raised from 0.15 to 0.20: TER-149 blocking limits green's effective reach on
// non-empty boards, so green needs a higher draw probability to appear reliably.
// Starting hypothesis only — retune with real-play data.
const RED_THRESHOLD = 0.40;
const YELLOW_THRESHOLD = 0.80; // red + yellow = 0.40 + 0.40

function sampleColor(rng: () => number): Color {
  const r = rng();
  if (r < RED_THRESHOLD) return 'red';
  if (r < YELLOW_THRESHOLD) return 'yellow';
  return 'green';
}

function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<'empty'>(size).fill('empty'));
}

function boardsEqual(a: Board, b: Board): boolean {
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[0].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

// Trivial-puzzle rejection (kept as defense-in-depth; some checks cannot trigger
// under full-coverage + all-3-colors rules but are retained for safety):
//   1. All cells are empty.
//   2. All cells are the same non-empty color.
//   3. More than 85% of cells are a single color.
//   4. The first move alone produces the target (effectively a 1-move puzzle).
function isTrivial(target: Board, solution: Move[], size: number): boolean {
  const total = size * size;
  const counts = { empty: 0, red: 0, yellow: 0, green: 0 };
  for (const row of target) for (const cell of row) counts[cell]++;

  if (counts.empty === total) return true;

  const threshold = total * 0.85;
  for (const color of ['red', 'yellow', 'green'] as const) {
    if (counts[color] === total) return true;
    if (counts[color] > threshold) return true;
  }

  const afterFirst = applyMove(emptyBoard(size), solution[0].color, solution[0].row, solution[0].col);
  if (boardsEqual(afterFirst, target)) return true;

  return false;
}

// Starting solution-length ranges (v1.5 — TER-248 difficulty retune). The generator draws
// a starting L from this range, then appends additional moves until full coverage + all 3
// colors are met. Floors raised ~2–4 vs v1.4 to produce harder dailies under the M6
// always-visible-pattern model (challenge is routing, not memory).
export const MOVE_RANGE: Record<4 | 5 | 6 | 8, [number, number]> = {
  4: [8, 11],
  5: [10, 14],
  6: [13, 18],
  8: [18, 26],
};

// Maximum total solution length (starting L + all appended moves).
// If this cap is reached before the board satisfies all constraints, abort and retry.
// v1.5 (TER-248): 4×4 raised 14→16, 6×6 raised 24→26, 8×8 raised 36→40 to keep the
// cap-exceeded rate ≤ 5% with the higher starting-L floors; 5×5 unchanged.
export const MOVE_CAP: Record<4 | 5 | 6 | 8, number> = {
  4: 16,
  5: 18,
  6: 26,
  8: 40,
};

// Test instrumentation: counts puzzles that required more than one attempt,
// and tracks the maximum number of attempts any single puzzle required.
// Reset before a bulk test run; read after to assess cap-exceeded rate and retry depth.
let _capExceededPuzzleCount = 0;
let _maxAttemptsObserved = 0;
export function _resetCapStats(): void {
  _capExceededPuzzleCount = 0;
  _maxAttemptsObserved = 0;
}
export function _getCapExceededPuzzleCount(): number { return _capExceededPuzzleCount; }
export function _getMaxAttemptsObserved(): number { return _maxAttemptsObserved; }

function tryGenerate(seed: string, gridSize: 4 | 5 | 6 | 8, attempt: number): GeneratedPuzzle | null {
  // Each attempt uses a distinct internal RNG seed so retries explore different boards.
  const rng = mulberry32(hashSeed(`${seed}/${attempt}`));
  const [minMoves, maxMoves] = MOVE_RANGE[gridSize];
  const startingL = minMoves + Math.floor(rng() * (maxMoves - minMoves + 1));
  const cap = MOVE_CAP[gridSize];

  // Phase 1: Generate startingL random moves.
  const solution: Move[] = [];
  for (let i = 0; i < startingL; i++) {
    solution.push({
      color: sampleColor(rng),
      row: Math.floor(rng() * gridSize),
      col: Math.floor(rng() * gridSize),
    });
  }

  // Phase 2: Append moves until full coverage + all 3 colors, or cap exceeded.
  // Re-simulates from scratch on each iteration (simpler than incremental updates).
  // Phase A: cover empty cells first. Phase B: fix missing colors.
  // Empty cells are selected randomly (not scan order) to preserve board entropy.
  while (true) {
    let target = emptyBoard(gridSize);
    for (const move of solution) {
      target = applyMove(target, move.color, move.row, move.col);
    }

    const emptyCells: [number, number][] = [];
    const colorPresent = { red: false, yellow: false, green: false };
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = target[r][c];
        if (cell === 'empty') {
          emptyCells.push([r, c]);
        } else {
          colorPresent[cell] = true;
        }
      }
    }

    const fullyCovered = emptyCells.length === 0;
    const allThreeColors = colorPresent.red && colorPresent.yellow && colorPresent.green;

    if (fullyCovered && allThreeColors) {
      if (isTrivial(target, solution, gridSize)) return null;
      return { target, solution, gridSize, seed };
    }

    if (solution.length >= cap) return null;

    if (emptyCells.length > 0) {
      // Phase A: pick a random empty cell. If green is absent from the current board,
      // force green — Phase B cannot place green on a fully-covered board, so this is
      // the only window to guarantee it appears. Cell index is rng-derived (deterministic).
      const idx = Math.floor(rng() * emptyCells.length);
      const [row, col] = emptyCells[idx];
      const color = !colorPresent.green ? 'green' : sampleColor(rng);
      solution.push({ color, row, col });
    } else {
      // Phase B: board is fully covered but a color is missing.
      // Priority order: red → yellow → green (first missing in that order).
      const missingColor: Color = !colorPresent.red ? 'red' : !colorPresent.yellow ? 'yellow' : 'green';

      // Find cells where placing missingColor would be effective:
      //   red    → overwrites any cell (red > all)
      //   yellow → overwrites green cells (yellow > green; no empties remain)
      //   green  → overwrites empty only; no empties in a fully-covered board → no candidates
      // Skip cells already holding missingColor (placement would be a no-op for them).
      const candidates: [number, number][] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const cell = target[r][c];
          if (cell === missingColor) continue;
          if (missingColor === 'red') {
            candidates.push([r, c]);
          } else if (missingColor === 'yellow' && cell === 'green') {
            candidates.push([r, c]);
          }
          // green: no candidates when board is fully covered → fall through to return null
        }
      }

      if (candidates.length === 0) return null;

      const idx = Math.floor(rng() * candidates.length);
      const [row, col] = candidates[idx];
      solution.push({ color: missingColor, row, col });
    }
  }
}

export function generatePuzzle(seed: string, gridSize: 4 | 5 | 6 | 8): GeneratedPuzzle {
  // Cap at 100 attempts. With the Phase A green guarantee this should be unreachable —
  // a throw here signals a bug (unsatisfiable seed/size combo) rather than a tuning issue.
  const MAX_ATTEMPTS = 100;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = tryGenerate(seed, gridSize, attempt);
    if (result !== null) {
      if (attempt > 0) _capExceededPuzzleCount++;
      if (attempt + 1 > _maxAttemptsObserved) _maxAttemptsObserved = attempt + 1;
      return result;
    }
  }
  throw new Error(
    `generatePuzzle: exhausted ${MAX_ATTEMPTS} attempts — seed="${seed}" gridSize=${gridSize}. This is a bug; report seed and gridSize.`
  );
}

export function dailySeed(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `RYGO-${y}-${m}-${d}`;
}
