import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStats } from './useStats';
import { recordDailyResult } from '../persistence/dailyState';

const TODAY = '2026-05-24';
const TODAY_MS = new Date('2026-05-24T12:00:00Z').getTime();

describe('useStats', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(TODAY_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns exactly four levels in order [4, 5, 6, 8]', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.levels.map((l) => l.gridSize)).toEqual([4, 5, 6, 8]);
  });

  it('all levels have null bestScore and averageScore when nothing played', () => {
    const { result } = renderHook(() => useStats());
    for (const level of result.current.levels) {
      expect(level.bestScore).toBeNull();
      expect(level.averageScore).toBeNull();
    }
  });

  it('streak is 0 when nothing played', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.streak).toEqual({ current: 0, best: 0 });
  });

  it('reflects recorded results for the correct level', () => {
    recordDailyResult(4, TODAY, { moves: 12, elapsedMs: 60000 });
    const { result } = renderHook(() => useStats());
    const easyLevel = result.current.levels.find((l) => l.gridSize === 4)!;
    expect(easyLevel.played).toBe(1);
    expect(easyLevel.bestScore).toBe(12);
    expect(easyLevel.averageScore).toBe(12);
    expect(easyLevel.today).toEqual({ moves: 12, elapsedMs: 60000 });
  });

  it('unplayed levels still return null bestScore and averageScore when others have data', () => {
    recordDailyResult(4, TODAY, { moves: 10, elapsedMs: 5000 });
    const { result } = renderHook(() => useStats());
    for (const level of result.current.levels.filter((l) => l.gridSize !== 4)) {
      expect(level.bestScore).toBeNull();
      expect(level.averageScore).toBeNull();
    }
  });
});
