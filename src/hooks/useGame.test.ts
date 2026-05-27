import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGame } from './useGame';
import type { GeneratedPuzzle } from '../engine/generator';
import type { Board, GameEvent } from '../engine/types';

// Minimal 4×4 puzzle: placing red at (0,0) achieves the target.
function makeTestPuzzle(): GeneratedPuzzle {
  const target: Board = [
    ['red', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
    ['empty', 'empty', 'empty', 'empty'],
  ];
  return {
    target,
    solution: [{ color: 'red', row: 0, col: 0 }],
    gridSize: 4,
    seed: 'test',
  };
}

describe('useGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in playing phase with moveCount 0 and elapsedMs 0', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.activeColor).toBeNull();
  });

  it('timer starts immediately on mount (no reveal needed)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    // Flush the RESUME_TIMER useEffect
    act(() => {});

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(100);
  });

  it('SELECT_COLOR to a different color does NOT increment moveCount (TER-221 scoring)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });

    expect(result.current.moveCount).toBe(0);
    expect(result.current.activeColor).toBe('red');
  });

  it('SELECT_COLOR to the same color is a no-op (no move charged)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); }); // +0
    act(() => { result.current.selectColor('red'); }); // no-op

    expect(result.current.moveCount).toBe(0);
  });

  it('SELECT_COLOR to two different colors charges 0 moves total', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });    // +0
    act(() => { result.current.selectColor('yellow'); }); // +0

    expect(result.current.moveCount).toBe(0);
  });

  it('placeAt requires activeColor set; no-op without it', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.placeAt(0, 0); }); // no activeColor → no-op

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.current[0][0]).toBe('empty');
  });

  it('placeAt with activeColor updates the board and increments moves by 1', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); }); // +0
    act(() => { result.current.placeAt(1, 1); });      // +1

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(1);
    expect(result.current.current[1][1]).toBe('red');
  });

  it('when placement makes board match target, phase becomes validating (not complete)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(0, 0); });

    expect(result.current.phase).toBe('validating');
  });

  it('completeValidation transitions from validating to complete', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(0, 0); });

    expect(result.current.phase).toBe('validating');

    act(() => { result.current.completeValidation(); });

    expect(result.current.phase).toBe('complete');
  });

  it('completeValidation is a no-op outside validating', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.completeValidation(); }); // playing phase — no-op
    expect(result.current.phase).toBe('playing');
  });

  it('timer stops and elapsedMs is preserved through validating → complete', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => {}); // flush RESUME_TIMER
    act(() => { result.current.selectColor('red'); });
    act(() => { vi.advanceTimersByTime(300); });

    act(() => { result.current.placeAt(0, 0); }); // → validating, elapsedMs frozen
    const elapsedAtValidating = result.current.elapsedMs;
    expect(result.current.phase).toBe('validating');
    expect(elapsedAtValidating).toBeGreaterThan(0);

    act(() => { vi.advanceTimersByTime(500); }); // timer should NOT advance in validating
    expect(result.current.elapsedMs).toBe(elapsedAtValidating);

    act(() => { result.current.completeValidation(); }); // → complete
    expect(result.current.phase).toBe('complete');
    expect(result.current.elapsedMs).toBe(elapsedAtValidating);
  });

  it('tapping a same-color cell clears it and increments moveCount', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); }); // +0
    act(() => { result.current.placeAt(1, 1); });       // +1 → 1
    expect(result.current.current[1][1]).toBe('red');
    expect(result.current.moveCount).toBe(1);

    act(() => { result.current.placeAt(1, 1); }); // clear → +1 → 2
    expect(result.current.current[1][1]).toBe('empty');
    expect(result.current.moveCount).toBe(2);
    expect(result.current.phase).toBe('playing');
  });

  it('tapping a different-color cell still places (regression)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); }); // +0
    act(() => { result.current.placeAt(2, 2); });       // +1
    expect(result.current.current[2][2]).toBe('red');
    expect(result.current.moveCount).toBe(1);
    expect(result.current.phase).toBe('playing');
  });

  it('reset returns to playing with cleared counters and empty board', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(1, 1); });
    expect(result.current.moveCount).toBe(1);

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.current[1][1]).toBe('empty');
    expect(result.current.activeColor).toBeNull();
  });

  it('reset without keepClock zeros the timer (practice behavior)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => {}); // flush RESUME_TIMER
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.elapsedMs).toBeGreaterThan(0);

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('playing');
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.moveCount).toBe(0);
  });

  it('reset with keepClock preserves the running timer (daily restart behavior)', () => {
    const { result } = renderHook(() =>
      useGame(makeTestPuzzle(), { keepClockOnReset: true }),
    );

    act(() => {}); // flush RESUME_TIMER
    act(() => { vi.advanceTimersByTime(500); });
    const elapsedBeforeReset = result.current.elapsedMs;
    expect(elapsedBeforeReset).toBeGreaterThan(0);

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(elapsedBeforeReset);
  });

  it('bankTime stops the timer and accumulates; resumeTimer restarts it', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => {}); // flush RESUME_TIMER
    act(() => { vi.advanceTimersByTime(300); });
    const beforeBank = result.current.elapsedMs;
    expect(beforeBank).toBeGreaterThan(0);

    act(() => { result.current.bankTime(); });
    const bankedValue = result.current.elapsedMs;

    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.elapsedMs).toBe(bankedValue);

    act(() => { result.current.resumeTimer(); });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.elapsedMs).toBeGreaterThan(bankedValue);
  });

  it('resuming from an in-progress blob restores state and continues the clock', () => {
    const target: Board = [
      ['red', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
    ];
    const puzzle = makeTestPuzzle();
    const priorLog: GameEvent[] = [{ type: 'select', color: 'red' }];
    const resume = {
      version: 2 as const,
      date: '2026-05-24',
      gridSize: 4 as const,
      board: target,
      phase: 'playing' as const,
      activeColor: 'red' as const,
      moveCount: 1,
      patternVisible: false,
      accumulatedMs: 12000,
      savedAt: 0,
      eventLog: priorLog,
    };

    const { result } = renderHook(() => useGame(puzzle, { resume }));

    act(() => {}); // flush RESUME_TIMER

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(1);
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(12000);
    expect(result.current.eventLog).toEqual(priorLog);

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.elapsedMs).toBeGreaterThan(12000);
  });

  it('pathological negative delta (clock set back) is treated as zero', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => {}); // flush RESUME_TIMER
    act(() => { vi.advanceTimersByTime(200); });
    const before = result.current.elapsedMs;

    act(() => { vi.setSystemTime(0); });
    act(() => { vi.advanceTimersByTime(100); });

    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.current.elapsedMs).toBeLessThanOrEqual(before);
  });

  it('realistic placement-only sequence: 3 placements + 2 color switches = 3 moves', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });    // +0
    act(() => { result.current.placeAt(1, 1); });         // +1 → 1
    act(() => { result.current.placeAt(1, 2); });         // +1 → 2
    act(() => { result.current.placeAt(1, 3); });         // +1 → 3
    act(() => { result.current.selectColor('yellow'); }); // +0
    act(() => { result.current.placeAt(2, 0); });         // +1 → 4
    act(() => { result.current.placeAt(2, 1); });         // +1 → 5

    expect(result.current.moveCount).toBe(5);
  });

  // ─── eventLog tests ───────────────────────────────────────────────────────

  it('eventLog starts empty', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    expect(result.current.eventLog).toEqual([]);
  });

  it('SELECT_COLOR appends a select event; moveCount stays 0', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.selectColor('red'); });
    expect(result.current.eventLog).toEqual([{ type: 'select', color: 'red' }]);
    expect(result.current.moveCount).toBe(0);
  });

  it('SELECT_COLOR to the same color appends a select event but does NOT increment moveCount', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.selectColor('red'); }); // no-op, still appended
    expect(result.current.eventLog).toEqual([
      { type: 'select', color: 'red' },
      { type: 'select', color: 'red' },
    ]);
    expect(result.current.moveCount).toBe(0);
  });

  it('PLACE_AT appends a tap event with correct row/col', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(2, 3); });
    const log = result.current.eventLog;
    expect(log[log.length - 1]).toEqual({ type: 'tap', row: 2, col: 3 });
  });

  it('PLACE_AT on a same-color cell (clear path) still appends a tap event', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(1, 1); }); // place
    act(() => { result.current.placeAt(1, 1); }); // clear (same color)
    const log = result.current.eventLog;
    expect(log[log.length - 2]).toEqual({ type: 'tap', row: 1, col: 1 });
    expect(log[log.length - 1]).toEqual({ type: 'tap', row: 1, col: 1 });
    expect(result.current.current[1][1]).toBe('empty');
  });

  it('PLACE_AT without activeColor does NOT append a tap event', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.placeAt(0, 0); }); // no activeColor → no-op
    expect(result.current.eventLog).toEqual([]);
  });

  it('event ordering matches action sequence across a realistic flow', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(1, 0); });
    act(() => { result.current.selectColor('yellow'); });

    const expected: GameEvent[] = [
      { type: 'select', color: 'red' },
      { type: 'tap', row: 1, col: 0 },
      { type: 'select', color: 'yellow' },
    ];
    expect(result.current.eventLog).toEqual(expected);
  });

  it('RESET (practice, no keepClock) clears the eventLog', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(1, 0); });
    expect(result.current.eventLog.length).toBe(2);

    act(() => { result.current.reset(); });
    expect(result.current.eventLog).toEqual([]);
    expect(result.current.moveCount).toBe(0);
  });

  it('RESET with keepClock (daily) also clears the eventLog', () => {
    const { result } = renderHook(() =>
      useGame(makeTestPuzzle(), { keepClockOnReset: true }),
    );
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(1, 0); });
    expect(result.current.eventLog.length).toBe(2);

    act(() => { result.current.reset(); });
    expect(result.current.eventLog).toEqual([]);
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it('resume rehydrates eventLog; subsequent actions continue appending', () => {
    const priorLog: GameEvent[] = [
      { type: 'select', color: 'red' },
    ];
    const board: Board = [
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
    ];
    const resume = {
      version: 2 as const,
      date: '2026-05-24',
      gridSize: 4 as const,
      board,
      phase: 'playing' as const,
      activeColor: 'red' as const,
      moveCount: 0,
      patternVisible: false,
      accumulatedMs: 5000,
      savedAt: 0,
      eventLog: priorLog,
    };

    const { result } = renderHook(() => useGame(makeTestPuzzle(), { resume }));
    act(() => {}); // flush RESUME_TIMER

    expect(result.current.eventLog).toEqual(priorLog);

    act(() => { result.current.placeAt(1, 1); });
    expect(result.current.eventLog).toEqual([
      ...priorLog,
      { type: 'tap', row: 1, col: 1 },
    ]);
  });

  it('background→resume→complete sequence yields a complete, ordered log', () => {
    const priorLog: GameEvent[] = [
      { type: 'select', color: 'red' },
    ];
    const board: Board = [
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
    ];
    const resume = {
      version: 2 as const,
      date: '2026-05-24',
      gridSize: 4 as const,
      board,
      phase: 'playing' as const,
      activeColor: 'red' as const,
      moveCount: 0,
      patternVisible: false,
      accumulatedMs: 5000,
      savedAt: 0,
      eventLog: priorLog,
    };

    const { result } = renderHook(() => useGame(makeTestPuzzle(), { resume }));
    act(() => {});

    // Complete the puzzle: target has red at (0,0); active color is already 'red'
    act(() => { result.current.placeAt(0, 0); }); // → validating
    expect(result.current.phase).toBe('validating');

    const finalLog = result.current.eventLog;
    expect(finalLog).toEqual([
      ...priorLog,
      { type: 'tap', row: 0, col: 0 },
    ]);
    // select(+0) + tap(+1) = 1
    expect(result.current.moveCount).toBe(1);
  });
});
