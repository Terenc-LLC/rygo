import { describe, it, expect } from 'vitest';
import { buildParRow, shouldSkipRow, utcDateStr } from './compute-par.ts';

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
