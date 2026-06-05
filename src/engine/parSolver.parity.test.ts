/**
 * Parity tests — pins parSolver's internal apply functions to the canonical
 * applyMove from placement.ts so that any future semantics drift fails CI.
 *
 * TER-226: parSolver reimplements applyRed/applyYellow/applyGreen on its own
 * Flat (Uint8Array) board representation instead of calling applyMove. These
 * tests assert that, over many random boards and all valid (row, col) positions,
 * the solver's result matches the canonical engine for all three colors and all
 * four grid sizes.
 *
 * Yellow note: applyYellow accepts a target board and returns null when R2 would
 * be violated (yellow would permanently block a green-target cell). R2 is a
 * solver-pruning rule, not a placement semantics difference. Tests suppress R2
 * by passing an all-empty target, so only placement semantics are exercised.
 *
 * Null-return semantics: both applyRed/Yellow/Green return null when the move
 * is a no-op (R3: no cells change). In that case the effective result equals
 * the original board, which also equals what applyMove returns.
 */

import { describe, it, expect } from 'vitest';
import { _solverTestSeam } from './parSolver.ts';
import { applyMove } from './placement.ts';
import type { Board, CellState } from './types.ts';

const { boardToFlat, flatToBoard, applyRed, applyYellow, applyGreen } = _solverTestSeam;

const GRID_SIZES = [4, 5, 6, 8] as const;
const BOARDS_PER_SIZE = 30;
const CELL_VALUES: CellState[] = ['empty', 'red', 'yellow', 'green'];

// Deterministic LCG so the test suite is reproducible.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function randomBoard(size: number, rng: () => number): Board {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () =>
      CELL_VALUES[Math.floor(rng() * 4)],
    ) as Board[number],
  ) as Board;
}

// ── Parity tests ───────────────────────────────────────────────────────────

for (const size of GRID_SIZES) {
  describe(`${size}×${size} solver/engine parity`, () => {
    const rng = makeRng(size * 1_000 + 226);
    const boards = Array.from({ length: BOARDS_PER_SIZE }, () => randomBoard(size, rng));
    // All-empty target suppresses R2 (no green-target cells → no R2 violations).
    const emptyTarget = new Uint8Array(size * size);

    it(`red — applyRed matches applyMove across ${BOARDS_PER_SIZE} random boards`, () => {
      for (const board of boards) {
        const flat = boardToFlat(board);
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            const solverResult = applyRed(flat, row * size + col);
            // null → R3 no-op; effective board equals original.
            const effectiveBoard = flatToBoard(solverResult ?? flat, size);
            expect(effectiveBoard).toEqual(applyMove(board, 'red', row, col));
          }
        }
      }
    });

    it(`yellow — applyYellow matches applyMove across ${BOARDS_PER_SIZE} random boards`, () => {
      for (const board of boards) {
        const flat = boardToFlat(board);
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            // emptyTarget → R2 never fires; any null is R3 (nothing writable).
            const solverResult = applyYellow(flat, row, col, size, emptyTarget);
            const effectiveBoard = flatToBoard(solverResult ?? flat, size);
            expect(effectiveBoard).toEqual(applyMove(board, 'yellow', row, col));
          }
        }
      }
    });

    it(`green — applyGreen matches applyMove across ${BOARDS_PER_SIZE} random boards (pre-populated)`, () => {
      for (const board of boards) {
        const flat = boardToFlat(board);
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            // Pre-populated boards exercise the blocking semantics most likely to diverge.
            const solverResult = applyGreen(flat, row, col, size);
            const effectiveBoard = flatToBoard(solverResult ?? flat, size);
            expect(effectiveBoard).toEqual(applyMove(board, 'green', row, col));
          }
        }
      }
    });
  });
}
