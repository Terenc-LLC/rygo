import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadInProgress,
  saveInProgress,
  deleteInProgress,
  IN_PROGRESS_KEY,
  type InProgressBlob,
} from './inProgress';
import type { Board } from '../engine/types';

// 2026-05-24 in UTC
const FIXED_DATE_MS = Date.UTC(2026, 4, 24, 12, 0, 0); // 2026-05-24T12:00:00Z

function makeBlob(overrides?: Partial<InProgressBlob>): InProgressBlob {
  const board: Board = [
    ['red', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
  ];
  return {
    version: 1,
    date: '2026-05-24',
    gridSize: 4,
    board,
    phase: 'playing',
    activeColor: 'red',
    moveCount: 7,
    patternVisible: false,
    accumulatedMs: 8400,
    savedAt: FIXED_DATE_MS,
    ...overrides,
  };
}

describe('inProgress persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loadInProgress returns null when key is absent', () => {
    expect(loadInProgress()).toBeNull();
  });

  it('round-trip: saveInProgress then loadInProgress returns the blob', () => {
    const blob = makeBlob();
    saveInProgress(blob);
    const loaded = loadInProgress();
    expect(loaded).toEqual(blob);
  });

  it('loadInProgress returns null for corrupt JSON', () => {
    localStorage.setItem(IN_PROGRESS_KEY, '{corrupt json{{');
    expect(loadInProgress()).toBeNull();
  });

  it('loadInProgress returns null for future schema version', () => {
    const blob = makeBlob({ version: 99 as 1 });
    saveInProgress(blob);
    expect(loadInProgress()).toBeNull();
  });

  it('loadInProgress returns null when date is not today (stale attempt)', () => {
    const blob = makeBlob({ date: '2026-05-23' }); // yesterday
    saveInProgress(blob);
    expect(loadInProgress()).toBeNull();
  });

  it('loadInProgress returns null for non-object JSON', () => {
    localStorage.setItem(IN_PROGRESS_KEY, '"just a string"');
    expect(loadInProgress()).toBeNull();
  });

  it('deleteInProgress removes the key', () => {
    saveInProgress(makeBlob());
    deleteInProgress();
    expect(localStorage.getItem(IN_PROGRESS_KEY)).toBeNull();
  });

  it('deleteInProgress is a no-op when key is absent', () => {
    expect(() => deleteInProgress()).not.toThrow();
  });

  it('saveInProgress is a no-op when localStorage throws', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => { throw new Error('QuotaExceeded'); });
    expect(() => saveInProgress(makeBlob())).not.toThrow();
    setItemSpy.mockRestore();
  });

  it('loadInProgress is a no-op when localStorage.getItem throws', () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => { throw new Error('SecurityError'); });
    expect(loadInProgress()).toBeNull();
    getItemSpy.mockRestore();
  });

  it('loadInProgress returns null for blob missing required fields', () => {
    localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify({ version: 1, date: '2026-05-24' }));
    expect(loadInProgress()).toBeNull();
  });

  it('all phase values are stored and loaded correctly', () => {
    for (const phase of ['idle', 'pattern-revealed', 'playing'] as const) {
      localStorage.clear();
      saveInProgress(makeBlob({ phase }));
      expect(loadInProgress()?.phase).toBe(phase);
    }
  });
});
