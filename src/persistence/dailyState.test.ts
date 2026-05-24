import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  todayKey,
  loadState,
  isCompletedToday,
  getResult,
  recordDailyResult,
  msUntilNextUtcDay,
} from './dailyState';

describe('todayKey', () => {
  it('formats a UTC date as YYYY-MM-DD', () => {
    const d = new Date('2026-05-24T12:00:00Z');
    expect(todayKey(d)).toBe('2026-05-24');
  });

  it('pads single-digit month and day', () => {
    const d = new Date('2026-01-03T00:00:00Z');
    expect(todayKey(d)).toBe('2026-01-03');
  });

  it('uses UTC, not local time — a moment before midnight UTC is still the previous day', () => {
    const d = new Date('2026-05-24T23:59:59Z');
    expect(todayKey(d)).toBe('2026-05-24');
  });

  it('a moment at UTC midnight starts a new day', () => {
    const d = new Date('2026-05-25T00:00:00Z');
    expect(todayKey(d)).toBe('2026-05-25');
  });

  it('defaults to the current time when no date is provided', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T08:00:00Z'));
    expect(todayKey()).toBe('2026-05-24');
    vi.useRealTimers();
  });
});

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns a fresh empty state when localStorage is empty', () => {
    const state = loadState();
    expect(state.version).toBe(1);
    expect(state.daily).toEqual({ '4': {}, '5': {}, '6': {}, '8': {} });
  });

  it('returns a valid stored state', () => {
    const stored = {
      version: 1,
      daily: {
        '4': { '2026-05-24': { moves: 11, elapsedMs: 84200, completedAt: 1748102400000 } },
        '5': {},
        '6': {},
        '8': {},
      },
    };
    localStorage.setItem('rygo:state', JSON.stringify(stored));
    const state = loadState();
    expect(state.version).toBe(1);
    expect(state.daily['4']['2026-05-24'].moves).toBe(11);
    expect(state.daily['4']['2026-05-24'].elapsedMs).toBe(84200);
  });

  it('returns empty state for corrupt JSON', () => {
    localStorage.setItem('rygo:state', '{bad json');
    const state = loadState();
    expect(state.daily).toEqual({ '4': {}, '5': {}, '6': {}, '8': {} });
  });

  it('returns empty state when stored object has no version field', () => {
    localStorage.setItem('rygo:state', JSON.stringify({ daily: {} }));
    const state = loadState();
    expect(state.daily).toEqual({ '4': {}, '5': {}, '6': {}, '8': {} });
  });

  it('returns empty state when version is newer than understood', () => {
    localStorage.setItem('rygo:state', JSON.stringify({ version: 99, daily: {} }));
    const state = loadState();
    expect(state.daily).toEqual({ '4': {}, '5': {}, '6': {}, '8': {} });
  });

  it('backfills missing level keys from a partial stored state', () => {
    localStorage.setItem(
      'rygo:state',
      JSON.stringify({ version: 1, daily: { '4': {}, '5': {} } })
    );
    const state = loadState();
    expect(state.daily['6']).toEqual({});
    expect(state.daily['8']).toEqual({});
  });

  it('handles localStorage.getItem throwing by returning empty state', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const state = loadState();
    expect(state.daily).toEqual({ '4': {}, '5': {}, '6': {}, '8': {} });
    vi.restoreAllMocks();
  });
});

describe('isCompletedToday', () => {
  it('returns false when there is no record for the level+day', () => {
    const state = { version: 1, daily: { '4': {}, '5': {}, '6': {}, '8': {} } };
    expect(isCompletedToday(state, 4, '2026-05-24')).toBe(false);
  });

  it('returns true when there is a record for the level+day', () => {
    const state = {
      version: 1,
      daily: {
        '4': { '2026-05-24': { moves: 11, elapsedMs: 84200, completedAt: 1000 } },
        '5': {},
        '6': {},
        '8': {},
      },
    };
    expect(isCompletedToday(state, 4, '2026-05-24')).toBe(true);
  });

  it('returns false for a different day even when another day is recorded', () => {
    const state = {
      version: 1,
      daily: {
        '4': { '2026-05-23': { moves: 8, elapsedMs: 60000, completedAt: 1000 } },
        '5': {},
        '6': {},
        '8': {},
      },
    };
    expect(isCompletedToday(state, 4, '2026-05-24')).toBe(false);
  });

  it('completing one level does not affect other levels', () => {
    const state = {
      version: 1,
      daily: {
        '4': { '2026-05-24': { moves: 11, elapsedMs: 84200, completedAt: 1000 } },
        '5': {},
        '6': {},
        '8': {},
      },
    };
    expect(isCompletedToday(state, 5, '2026-05-24')).toBe(false);
    expect(isCompletedToday(state, 6, '2026-05-24')).toBe(false);
    expect(isCompletedToday(state, 8, '2026-05-24')).toBe(false);
  });
});

describe('getResult', () => {
  it('returns null when no record exists', () => {
    const state = { version: 1, daily: { '4': {}, '5': {}, '6': {}, '8': {} } };
    expect(getResult(state, 4, '2026-05-24')).toBeNull();
  });

  it('returns the stored result', () => {
    const record = { moves: 11, elapsedMs: 84200, completedAt: 1748102400000 };
    const state = {
      version: 1,
      daily: { '4': { '2026-05-24': record }, '5': {}, '6': {}, '8': {} },
    };
    expect(getResult(state, 4, '2026-05-24')).toEqual(record);
  });
});

describe('recordDailyResult', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T10:00:00Z'));
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('records a result and persists it to localStorage', () => {
    recordDailyResult(4, '2026-05-24', { moves: 11, elapsedMs: 84200 });
    const state = loadState();
    const result = state.daily['4']['2026-05-24'];
    expect(result).toBeDefined();
    expect(result.moves).toBe(11);
    expect(result.elapsedMs).toBe(84200);
    expect(result.completedAt).toBe(new Date('2026-05-24T10:00:00Z').getTime());
  });

  it('is idempotent: second call for the same (level, day) does not overwrite', () => {
    recordDailyResult(4, '2026-05-24', { moves: 11, elapsedMs: 84200 });
    recordDailyResult(4, '2026-05-24', { moves: 5, elapsedMs: 30000 });
    const result = loadState().daily['4']['2026-05-24'];
    expect(result.moves).toBe(11);
  });

  it('records different levels independently', () => {
    recordDailyResult(4, '2026-05-24', { moves: 11, elapsedMs: 84200 });
    recordDailyResult(5, '2026-05-24', { moves: 14, elapsedMs: 90000 });
    const state = loadState();
    expect(state.daily['4']['2026-05-24'].moves).toBe(11);
    expect(state.daily['5']['2026-05-24'].moves).toBe(14);
    expect(state.daily['6']['2026-05-24']).toBeUndefined();
  });

  it('records different days independently', () => {
    recordDailyResult(4, '2026-05-23', { moves: 8, elapsedMs: 60000 });
    recordDailyResult(4, '2026-05-24', { moves: 11, elapsedMs: 84200 });
    const state = loadState();
    expect(state.daily['4']['2026-05-23'].moves).toBe(8);
    expect(state.daily['4']['2026-05-24'].moves).toBe(11);
  });

  it('silently no-ops when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() =>
      recordDailyResult(4, '2026-05-24', { moves: 11, elapsedMs: 84200 })
    ).not.toThrow();
    vi.restoreAllMocks();
  });
});

describe('msUntilNextUtcDay', () => {
  it('returns ms until midnight UTC from noon UTC', () => {
    const noonUtc = new Date('2026-05-24T12:00:00Z').getTime();
    const ms = msUntilNextUtcDay(noonUtc);
    expect(ms).toBe(12 * 60 * 60 * 1000); // 12 hours
  });

  it('returns ~24h at the start of a UTC day', () => {
    const startOfDay = new Date('2026-05-24T00:00:00Z').getTime();
    const ms = msUntilNextUtcDay(startOfDay);
    expect(ms).toBe(24 * 60 * 60 * 1000);
  });

  it('returns near-zero ms just before midnight UTC', () => {
    const almostMidnight = new Date('2026-05-24T23:59:59.900Z').getTime();
    const ms = msUntilNextUtcDay(almostMidnight);
    expect(ms).toBe(100);
  });

  it('defaults to Date.now() when no argument is given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T18:00:00Z'));
    const ms = msUntilNextUtcDay();
    expect(ms).toBe(6 * 60 * 60 * 1000); // 6 hours
    vi.useRealTimers();
  });
});
