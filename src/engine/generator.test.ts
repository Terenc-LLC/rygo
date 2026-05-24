import { describe, expect, it } from 'vitest';
import {
  generatePuzzle,
  dailySeed,
  MOVE_RANGE,
  MOVE_CAP,
  _resetCapStats,
  _getCapExceededPuzzleCount,
  _getMaxAttemptsObserved,
} from './generator';
import { applyMove } from './placement';
import type { Board } from './types';

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

const SIZES = [4, 5, 6, 8] as const;

describe('generatePuzzle — determinism', () => {
  it('same seed + gridSize always produces the same puzzle', () => {
    for (const size of SIZES) {
      const a = generatePuzzle('determinism-test', size);
      const b = generatePuzzle('determinism-test', size);
      expect(a.solution).toEqual(b.solution);
      expect(boardsEqual(a.target, b.target)).toBe(true);
      expect(a.seed).toBe('determinism-test');
    }
  });

  it('10 different seeds produce 10 different puzzles', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const p = generatePuzzle(`seed-${i}`, 4);
      seen.add(JSON.stringify(p.target));
    }
    expect(seen.size).toBeGreaterThanOrEqual(9);
  });

  it('RYGO-prefixed daily seed is deterministic across calls', () => {
    const a = generatePuzzle('RYGO-2026-05-03', 5);
    const b = generatePuzzle('RYGO-2026-05-03', 5);
    expect(boardsEqual(a.target, b.target)).toBe(true);
    expect(a.solution).toEqual(b.solution);
  });
});

describe('generatePuzzle — solution correctness', () => {
  for (const size of SIZES) {
    it(`${size}×${size}: applying solution to empty board produces target`, () => {
      const { target, solution } = generatePuzzle('solution-correctness', size);
      let board = emptyBoard(size);
      for (const move of solution) {
        board = applyMove(board, move.color, move.row, move.col);
      }
      expect(boardsEqual(board, target)).toBe(true);
    });
  }
});

describe('generatePuzzle — solution length', () => {
  for (const size of SIZES) {
    it(`${size}×${size}: solution length is >= starting min ${MOVE_RANGE[size][0]} and <= cap ${MOVE_CAP[size]}`, () => {
      const { solution } = generatePuzzle('length-test', size);
      expect(solution.length).toBeGreaterThanOrEqual(MOVE_RANGE[size][0]);
      expect(solution.length).toBeLessThanOrEqual(MOVE_CAP[size]);
    });
  }
});

describe('generatePuzzle — 5×5 grid', () => {
  it('generates a 5×5 target board', () => {
    const { target } = generatePuzzle('5x5-test', 5);
    expect(target.length).toBe(5);
    expect(target[0].length).toBe(5);
  });

  it('5×5 solution length is within starting range [8, 12] up to cap 18', () => {
    const { solution } = generatePuzzle('5x5-length', 5);
    expect(solution.length).toBeGreaterThanOrEqual(MOVE_RANGE[5][0]);
    expect(solution.length).toBeLessThanOrEqual(MOVE_CAP[5]);
  });
});

describe('generatePuzzle — full coverage + all 3 colors + non-triviality (1000 puzzles)', () => {
  it('all 1000 generated puzzles satisfy full coverage, all 3 colors, and non-triviality; cap-exceeded rate ≤ 5%', () => {
    _resetCapStats();

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      const size = SIZES[i % 4];
      const { target, solution, gridSize } = generatePuzzle(`RYGO-bulk-${i}`, size);
      const total = gridSize * gridSize;
      const counts = { empty: 0, red: 0, yellow: 0, green: 0 };
      for (const row of target) for (const cell of row) counts[cell]++;

      // Full coverage: no empty cells
      expect(counts.empty).toBe(0);

      // All three colors present
      expect(counts.red).toBeGreaterThan(0);
      expect(counts.yellow).toBeGreaterThan(0);
      expect(counts.green).toBeGreaterThan(0);

      // Not all one color, not > 85% one color (defense-in-depth)
      for (const color of ['red', 'yellow', 'green'] as const) {
        expect(counts[color]).not.toBe(total);
        expect(counts[color]).toBeLessThanOrEqual(total * 0.85);
      }

      // First move alone does not produce target
      const afterFirst = applyMove(emptyBoard(gridSize), solution[0].color, solution[0].row, solution[0].col);
      expect(boardsEqual(afterFirst, target)).toBe(false);
    }

    // No infinite loops: bulk test must complete in < 30 seconds
    expect(Date.now() - start).toBeLessThan(30_000);

    // Cap-exceeded rate ≤ 5% of puzzles (escape hatch threshold)
    const capExceededRate = _getCapExceededPuzzleCount() / 1000;
    expect(capExceededRate).toBeLessThanOrEqual(0.05);

    // Max attempts per puzzle stays well under the 100-attempt cap (low single digits expected)
    const maxAttempts = _getMaxAttemptsObserved();
    expect(maxAttempts).toBeLessThanOrEqual(10);
  });
});

describe('dailySeed', () => {
  it('returns RYGO-YYYY-MM-DD format', () => {
    expect(dailySeed(new Date('2026-05-01T00:00:00Z'))).toBe('RYGO-2026-05-01');
  });

  it('is stable for any time of day on the same UTC date', () => {
    const s1 = dailySeed(new Date('2026-05-01T00:00:00Z'));
    const s2 = dailySeed(new Date('2026-05-01T12:30:00Z'));
    const s3 = dailySeed(new Date('2026-05-01T23:59:59Z'));
    expect(s1).toBe(s2);
    expect(s2).toBe(s3);
  });

  it('differs for different UTC dates', () => {
    const a = dailySeed(new Date('2026-05-01T23:00:00Z'));
    const b = dailySeed(new Date('2026-05-02T01:00:00Z'));
    expect(a).not.toBe(b);
  });

  it('pads month and day with leading zeros', () => {
    expect(dailySeed(new Date('2026-01-05T00:00:00Z'))).toBe('RYGO-2026-01-05');
  });
});
