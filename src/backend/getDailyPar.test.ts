import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDailyPar } from './getDailyPar';

// ── Supabase mock ──────────────────────────────────────────────────────────

const state = vi.hoisted(() => ({
  supabase: null as null | { from: ReturnType<typeof vi.fn> },
  selectData: null as unknown,
  selectError: null as unknown,
}));

vi.mock('./supabaseClient', () => ({
  get supabase() {
    return state.supabase;
  },
}));

// ── Board-hash mock: derive expected hash from the real engine ─────────────
// getDailyPar calls generatePuzzle + boardHash internally for the drift guard.
// We expose the real implementations and capture results via a spy, so the
// "hash match" tests use the genuine hash string for a given (date, gridSize).

import { generatePuzzle } from '../engine/generator';
import { boardHash } from '../engine/boardHash';

function realHash(dateStr: string, gridSize: 4 | 5 | 6 | 8): string {
  return boardHash(generatePuzzle(`RYGO-${dateStr}`, gridSize).target);
}

// ── Query-builder builder ──────────────────────────────────────────────────

function makeFrom(data: unknown, error: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  };
  return vi.fn().mockReturnValue(chain);
}

// ── Tests ──────────────────────────────────────────────────────────────────

const DATE = '2026-05-27';
const SIZE = 4 as const;

describe('getDailyPar — supabase null', () => {
  beforeEach(() => { state.supabase = null; });

  it('returns null immediately without querying', async () => {
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });
});

describe('getDailyPar — supabase live', () => {
  beforeEach(() => {
    state.supabase = { from: makeFrom(null, null) };
  });

  it('returns { par, proven } when data is valid and hash matches', async () => {
    const hash = realHash(DATE, SIZE);
    state.supabase = {
      from: makeFrom({ par: 9, proven: true, generation_hash: hash }, null),
    };
    const result = await getDailyPar(DATE, SIZE);
    expect(result).toEqual({ par: 9, proven: true });
  });

  it('returns { par, proven: false } for a soft-par row', async () => {
    const hash = realHash(DATE, SIZE);
    state.supabase = {
      from: makeFrom({ par: 11, proven: false, generation_hash: hash }, null),
    };
    const result = await getDailyPar(DATE, SIZE);
    expect(result).toEqual({ par: 11, proven: false });
  });

  it('returns null when data is null (row missing)', async () => {
    state.supabase = { from: makeFrom(null, null) };
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });

  it('returns null on a Supabase error', async () => {
    state.supabase = { from: makeFrom(null, { message: 'db error' }) };
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });

  it('returns null on generation_hash mismatch (drift guard)', async () => {
    state.supabase = {
      from: makeFrom(
        { par: 9, proven: true, generation_hash: 'wrong_hash_from_old_engine' },
        null,
      ),
    };
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });

  it('returns null when par is not a number', async () => {
    const hash = realHash(DATE, SIZE);
    state.supabase = {
      from: makeFrom({ par: '9', proven: true, generation_hash: hash }, null),
    };
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });

  it('returns null when proven is not a boolean', async () => {
    const hash = realHash(DATE, SIZE);
    state.supabase = {
      from: makeFrom({ par: 9, proven: 1, generation_hash: hash }, null),
    };
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });

  it('returns null when generation_hash is missing from row', async () => {
    state.supabase = {
      from: makeFrom({ par: 9, proven: true }, null),
    };
    expect(await getDailyPar(DATE, SIZE)).toBeNull();
  });

  it('returns null without throwing on a thrown network error', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockRejectedValue(new Error('network failure')),
    };
    state.supabase = { from: vi.fn().mockReturnValue(chain) };
    await expect(getDailyPar(DATE, SIZE)).resolves.toBeNull();
  });

  it('queries the correct table, date, and grid_size', async () => {
    const hash = realHash(DATE, 5);
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { par: 10, proven: true, generation_hash: hash },
        error: null,
      }),
    };
    const fromFn = vi.fn().mockReturnValue(chain);
    state.supabase = { from: fromFn };
    await getDailyPar('2026-05-27', 5);
    expect(fromFn).toHaveBeenCalledWith('daily_par');
    expect(chain.select).toHaveBeenCalledWith('par, proven, generation_hash');
    const eqCalls = chain.eq.mock.calls as [string, unknown][];
    expect(eqCalls).toContainEqual(['date', '2026-05-27']);
    expect(eqCalls).toContainEqual(['grid_size', 5]);
  });
});
