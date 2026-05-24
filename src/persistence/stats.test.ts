import { describe, it, expect } from 'vitest';
import { previousDayKey, computeGlobalStreak, computeLevelSummary } from './stats';
import type { DailyState } from './dailyState';

function makeState(overrides: Partial<DailyState['daily']> = {}): DailyState {
  return {
    version: 1,
    daily: {
      '4': {},
      '5': {},
      '6': {},
      '8': {},
      ...overrides,
    },
  };
}

function result(moves: number, elapsedMs = 1000) {
  return { moves, elapsedMs, completedAt: Date.now() };
}

describe('previousDayKey', () => {
  it('steps back one day within a month', () => {
    expect(previousDayKey('2026-05-24')).toBe('2026-05-23');
  });

  it('crosses a month boundary', () => {
    expect(previousDayKey('2026-05-01')).toBe('2026-04-30');
    expect(previousDayKey('2026-03-01')).toBe('2026-02-28');
  });

  it('crosses a year boundary', () => {
    expect(previousDayKey('2026-01-01')).toBe('2025-12-31');
  });

  it('handles a leap-year February boundary', () => {
    expect(previousDayKey('2024-03-01')).toBe('2024-02-29');
  });
});

describe('computeGlobalStreak', () => {
  const today = '2026-05-24';

  it('returns 0/0 when no plays exist', () => {
    const state = makeState();
    expect(computeGlobalStreak(state, today)).toEqual({ current: 0, best: 0 });
  });

  it('counts current streak when today is done', () => {
    const state = makeState({
      '4': {
        '2026-05-22': result(10),
        '2026-05-23': result(8),
        '2026-05-24': result(9),
      },
    });
    expect(computeGlobalStreak(state, today)).toEqual({ current: 3, best: 3 });
  });

  it('applies grace rule — today not done does not break the streak', () => {
    // today = 2026-05-24 not in the set; yesterday and day before are
    const state = makeState({
      '5': {
        '2026-05-22': result(10),
        '2026-05-23': result(8),
      },
    });
    const result2 = computeGlobalStreak(state, today);
    expect(result2.current).toBe(2);
  });

  it('breaks streak when yesterday is also missing (gap)', () => {
    const state = makeState({
      '4': {
        '2026-05-21': result(10),
        '2026-05-22': result(8),
      },
    });
    // today = 2026-05-24; yesterday = 2026-05-23 not in set → current = 0
    expect(computeGlobalStreak(state, today).current).toBe(0);
  });

  it('unions across levels for the streak', () => {
    // two levels on different days — combined they are consecutive
    const state = makeState({
      '4': { '2026-05-23': result(10) },
      '6': { '2026-05-24': result(7) },
    });
    expect(computeGlobalStreak(state, today).current).toBe(2);
  });

  it('reports best streak as the longest consecutive run', () => {
    // Run of 2 then gap then run of 3
    const state = makeState({
      '4': {
        '2026-05-01': result(10),
        '2026-05-02': result(8),
        '2026-05-10': result(9),
        '2026-05-11': result(7),
        '2026-05-12': result(6),
      },
    });
    expect(computeGlobalStreak(state, today).best).toBe(3);
  });

  it('best streak equals current when there is only one run', () => {
    const state = makeState({
      '8': {
        '2026-05-22': result(20),
        '2026-05-23': result(18),
        '2026-05-24': result(16),
      },
    });
    const { current, best } = computeGlobalStreak(state, today);
    expect(current).toBe(3);
    expect(best).toBe(3);
  });
});

describe('computeLevelSummary', () => {
  const today = '2026-05-24';

  it('returns null values when no plays exist', () => {
    const state = makeState();
    expect(computeLevelSummary(state, 4, today)).toEqual({
      played: 0,
      bestScore: null,
      averageScore: null,
      today: null,
    });
  });

  it('counts played as the number of recorded days', () => {
    const state = makeState({
      '4': {
        '2026-05-22': result(10),
        '2026-05-23': result(8),
      },
    });
    expect(computeLevelSummary(state, 4, today).played).toBe(2);
  });

  it('picks bestScore as fewest moves', () => {
    const state = makeState({
      '5': {
        '2026-05-20': result(15),
        '2026-05-21': result(9),
        '2026-05-22': result(12),
      },
    });
    expect(computeLevelSummary(state, 5, today).bestScore).toBe(9);
  });

  it('computes averageScore rounded to 1 decimal place', () => {
    const state = makeState({
      '6': {
        '2026-05-20': result(10),
        '2026-05-21': result(11),
        '2026-05-22': result(12),
      },
    });
    expect(computeLevelSummary(state, 6, today).averageScore).toBe(11);
  });

  it('rounds averageScore correctly to 1 dp', () => {
    // (10 + 11) / 2 = 10.5
    const state = makeState({
      '8': {
        '2026-05-20': result(10),
        '2026-05-21': result(11),
      },
    });
    expect(computeLevelSummary(state, 8, today).averageScore).toBe(10.5);
  });

  it('averageScore handles non-trivial rounding', () => {
    // (10 + 11 + 12) / 3 = 11.0
    // (10 + 11 + 13) / 3 = 11.333... → rounds to 11.3
    const state = makeState({
      '4': {
        '2026-05-20': result(10),
        '2026-05-21': result(11),
        '2026-05-22': result(13),
      },
    });
    expect(computeLevelSummary(state, 4, today).averageScore).toBe(11.3);
  });

  it('returns today result when today has a record', () => {
    const state = makeState({
      '4': {
        '2026-05-23': result(10),
        '2026-05-24': result(7, 50000),
      },
    });
    const summary = computeLevelSummary(state, 4, today);
    expect(summary.today).toEqual({ moves: 7, elapsedMs: 50000 });
  });

  it('returns null for today when today has no record', () => {
    const state = makeState({
      '4': { '2026-05-23': result(10) },
    });
    expect(computeLevelSummary(state, 4, today).today).toBeNull();
  });

  it('does not mix data between levels', () => {
    const state = makeState({
      '4': { '2026-05-23': result(10) },
      '5': { '2026-05-23': result(20) },
    });
    expect(computeLevelSummary(state, 4, today).bestScore).toBe(10);
    expect(computeLevelSummary(state, 5, today).bestScore).toBe(20);
  });
});
