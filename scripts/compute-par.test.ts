import { describe, it, expect, vi } from 'vitest';
import { buildParRow, shouldSkipRow, utcDateStr, solveWithFallback } from './compute-par.ts';
import { generatePuzzle, type GeneratedPuzzle } from '../src/engine/generator.ts';
import type { SolverResult } from '../src/engine/parSolver.ts';

// ── buildParRow ────────────────────────────────────────────────────────────

describe('buildParRow', () => {
  it('uses solver par and proven=true when solver proves the result', () => {
    const row = buildParRow('2026-05-27', 4, { proven: true, par: 8 }, 11, 'abc');
    expect(row).toEqual({
      date: '2026-05-27',
      grid_size: 4,
      par: 8,
      proven: true,
      generation_hash: 'abc',
    });
  });

  it('falls back to generator moves and proven=false on solver timeout', () => {
    const row = buildParRow('2026-05-28', 8, { proven: false }, 22, 'def');
    expect(row).toEqual({
      date: '2026-05-28',
      grid_size: 8,
      par: 22,
      proven: false,
      generation_hash: 'def',
    });
  });

  it('stores the generation_hash verbatim', () => {
    const hash = 'rryyggryygryryyy';
    const row = buildParRow('2026-06-01', 5, { proven: true, par: 7 }, 10, hash);
    expect(row.generation_hash).toBe(hash);
  });

  it('proven par takes priority over a lower generatorMoves value', () => {
    // Solver found par=6; generator used 8 moves — proven par wins.
    const row = buildParRow('2026-06-01', 4, { proven: true, par: 6 }, 8, 'h');
    expect(row.par).toBe(6);
    expect(row.proven).toBe(true);
  });

  it('fallback par equals generatorMoves exactly', () => {
    const row = buildParRow('2026-06-01', 6, { proven: false }, 14, 'h');
    expect(row.par).toBe(14);
  });
});

// ── shouldSkipRow ──────────────────────────────────────────────────────────

describe('shouldSkipRow', () => {
  it('returns true when hashes match — row is current, skip re-compute', () => {
    expect(shouldSkipRow('abc123', 'abc123')).toBe(true);
  });

  it('returns false when hashes differ — engine drifted, must recompute', () => {
    expect(shouldSkipRow('old_hash', 'new_hash')).toBe(false);
  });

  it('returns false when existingHash is null — no row yet', () => {
    expect(shouldSkipRow(null, 'any_hash')).toBe(false);
  });

  it('returns false when existingHash is undefined', () => {
    expect(shouldSkipRow(undefined, 'any_hash')).toBe(false);
  });

  it('returns false on empty string existing hash (not a valid hash)', () => {
    expect(shouldSkipRow('', 'any_hash')).toBe(false);
  });
});

// ── solveWithFallback ─────────────────────────────────────────────────────

describe('solveWithFallback', () => {
  it('returns { proven: false } for 8×8 without calling the solver', () => {
    const puzzle = generatePuzzle('RYGO-2026-01-01', 8);
    const spy = vi.fn<[GeneratedPuzzle['target'], 4 | 5 | 6 | 8, { budgetMs: number }], SolverResult>(
      () => ({ proven: true, par: 1 }),
    );
    const result = solveWithFallback(puzzle, 30_000, spy);
    expect(result).toEqual({ proven: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns the solver result for sizes 4/5/6 when no error is thrown', () => {
    const puzzle = generatePuzzle('RYGO-2026-01-01', 4);
    const stub = vi.fn<[GeneratedPuzzle['target'], 4 | 5 | 6 | 8, { budgetMs: number }], SolverResult>(
      () => ({ proven: true, par: 7 }),
    );
    const result = solveWithFallback(puzzle, 30_000, stub);
    expect(result).toEqual({ proven: true, par: 7 });
    expect(stub).toHaveBeenCalledOnce();
  });

  it('returns { proven: false } when the solver throws — never propagates the error', () => {
    const puzzle = generatePuzzle('RYGO-2026-01-01', 5);
    const throwingSolver = vi.fn<[GeneratedPuzzle['target'], 4 | 5 | 6 | 8, { budgetMs: number }], SolverResult>(
      () => { throw new Error('simulated OOM'); },
    );
    expect(() => solveWithFallback(puzzle, 30_000, throwingSolver)).not.toThrow();
    expect(solveWithFallback(puzzle, 30_000, throwingSolver)).toEqual({ proven: false });
  });

  it('passes the puzzle target, gridSize, and budgetMs to the solver', () => {
    const puzzle = generatePuzzle('RYGO-2026-01-01', 6);
    const spy = vi.fn<[GeneratedPuzzle['target'], 4 | 5 | 6 | 8, { budgetMs: number }], SolverResult>(
      () => ({ proven: false }),
    );
    solveWithFallback(puzzle, 12_345, spy);
    expect(spy).toHaveBeenCalledWith(puzzle.target, 6, { budgetMs: 12_345 });
  });
});

// ── utcDateStr ─────────────────────────────────────────────────────────────

describe('utcDateStr', () => {
  it('returns the base date with offset=0', () => {
    const base = new Date('2026-05-27T00:00:00Z');
    expect(utcDateStr(base, 0)).toBe('2026-05-27');
  });

  it('advances correctly across a month boundary', () => {
    const base = new Date('2026-05-27T00:00:00Z');
    expect(utcDateStr(base, 14)).toBe('2026-06-10');
  });

  it('zero-pads month and day', () => {
    const base = new Date('2026-01-01T00:00:00Z');
    expect(utcDateStr(base, 0)).toBe('2026-01-01');
  });

  it('advances correctly across a year boundary', () => {
    const base = new Date('2026-12-28T00:00:00Z');
    expect(utcDateStr(base, 7)).toBe('2027-01-04');
  });
});
