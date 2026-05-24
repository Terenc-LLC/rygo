import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGame } from './useGame';
import type { GeneratedPuzzle } from '../engine/generator';
import type { Board } from '../engine/types';

// Minimal 4×4 puzzle: placing red at (0,0) achieves the target.
// Red reach = 1 cell only, so one placement on an empty board
// produces exactly this target.
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

  it('starts in idle phase with moveCount 0 and elapsedMs 0', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));
    expect(result.current.phase).toBe('idle');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.patternVisible).toBe(false);
    expect(result.current.activeColor).toBeNull();
  });

  it('first revealPattern transitions to pattern-revealed, does not increment moves, starts timer', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => {
      result.current.revealPattern();
    });

    expect(result.current.phase).toBe('pattern-revealed');
    expect(result.current.patternVisible).toBe(true);
    expect(result.current.moveCount).toBe(0);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(100);
  });

  it('HIDE_PATTERN increments moveCount by 1', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free
    act(() => { result.current.hidePattern(); });   // +1

    expect(result.current.moveCount).toBe(1);
    expect(result.current.phase).toBe('playing');
  });

  it('second revealPattern (after hidePattern) increments moves', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free → 0
    act(() => { result.current.hidePattern(); });   // +1 → 1
    act(() => { result.current.revealPattern(); }); // +1 → 2

    expect(result.current.phase).toBe('pattern-revealed');
    expect(result.current.moveCount).toBe(2);
  });

  it('SELECT_COLOR to a different color increments moveCount by 1', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); }); // +1

    expect(result.current.moveCount).toBe(1);
    expect(result.current.activeColor).toBe('red');
  });

  it('SELECT_COLOR to the same color is a no-op (no move charged)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); }); // +1 → 1
    act(() => { result.current.selectColor('red'); }); // no-op → 1

    expect(result.current.moveCount).toBe(1);
  });

  it('SELECT_COLOR to two different colors charges 2 moves', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.selectColor('red'); });    // +1 → 1
    act(() => { result.current.selectColor('yellow'); }); // +1 → 2

    expect(result.current.moveCount).toBe(2);
  });

  it('selectColor plus placeAt each charge 1 move in playing phase', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free
    act(() => { result.current.hidePattern(); });   // +1 → 1

    act(() => { result.current.selectColor('red'); }); // +1 → 2
    act(() => { result.current.placeAt(1, 1); });       // +1 → 3 (not (0,0) — puzzle stays incomplete)

    expect(result.current.moveCount).toBe(3);
  });

  it('placeAt while idle is a no-op (board and phase unchanged; selectColor still charges)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => {
      result.current.selectColor('red'); // +1
      result.current.placeAt(0, 0);     // no-op in idle
    });

    expect(result.current.phase).toBe('idle');
    expect(result.current.moveCount).toBe(1);
    expect(result.current.current[0][0]).toBe('empty');
  });

  it('placeAt while pattern-revealed is a no-op', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free
    act(() => {
      result.current.selectColor('red'); // +1
      result.current.placeAt(0, 0);     // no-op in pattern-revealed
    });

    expect(result.current.phase).toBe('pattern-revealed');
    expect(result.current.moveCount).toBe(1);
    expect(result.current.current[0][0]).toBe('empty');
  });

  it('placeAt after selectColor and hidePattern updates the board and increments moves', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free → 0
    act(() => { result.current.hidePattern(); });   // +1 → 1
    act(() => { result.current.selectColor('red'); }); // +1 → 2
    act(() => { result.current.placeAt(1, 1); });       // +1 → 3

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(3);
    expect(result.current.current[1][1]).toBe('red');
  });

  it('when placement makes board match target, phase becomes validating (not complete)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });
    act(() => { result.current.hidePattern(); });
    act(() => { result.current.selectColor('red'); });

    // Place red at (0,0) — matches the one-cell target
    act(() => { result.current.placeAt(0, 0); });

    expect(result.current.phase).toBe('validating');
  });

  it('completeValidation transitions from validating to complete', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });
    act(() => { result.current.hidePattern(); });
    act(() => { result.current.selectColor('red'); });
    act(() => { result.current.placeAt(0, 0); });

    expect(result.current.phase).toBe('validating');

    act(() => { result.current.completeValidation(); });

    expect(result.current.phase).toBe('complete');
  });

  it('completeValidation is a no-op outside validating', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.completeValidation(); }); // idle phase — no-op
    expect(result.current.phase).toBe('idle');
  });

  it('timer stops and elapsedMs is preserved through validating → complete', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });
    act(() => { result.current.hidePattern(); });
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

    act(() => { result.current.revealPattern(); }); // free → 0
    act(() => { result.current.hidePattern(); });   // +1 → 1
    act(() => { result.current.selectColor('red'); }); // +1 → 2
    // Place red at (1,1)
    act(() => { result.current.placeAt(1, 1); }); // +1 → 3
    expect(result.current.current[1][1]).toBe('red');
    expect(result.current.moveCount).toBe(3);

    // Tap (1,1) again with red active → clearing branch
    act(() => { result.current.placeAt(1, 1); }); // +1 → 4
    expect(result.current.current[1][1]).toBe('empty');
    expect(result.current.moveCount).toBe(4);
    expect(result.current.phase).toBe('playing');
  });

  it('tapping a different-color cell still places (regression)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free → 0
    act(() => { result.current.hidePattern(); });   // +1 → 1
    act(() => { result.current.selectColor('red'); }); // +1 → 2
    // Tap (2,2) which is empty — not same color as active (empty !== red) → placement path
    act(() => { result.current.placeAt(2, 2); }); // +1 → 3
    expect(result.current.current[2][2]).toBe('red');
    expect(result.current.moveCount).toBe(3);
    expect(result.current.phase).toBe('playing');
  });

  it('reset returns to idle with cleared counters and empty board', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); }); // free → 0
    act(() => { result.current.hidePattern(); });   // +1 → 1
    act(() => { result.current.selectColor('red'); }); // +1 → 2
    act(() => { result.current.placeAt(1, 1); });       // +1 → 3
    expect(result.current.moveCount).toBe(3);

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.current[1][1]).toBe('empty');
    expect(result.current.activeColor).toBeNull();
  });

  it('reset without keepClock zeros the timer (practice behavior)', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.elapsedMs).toBeGreaterThan(0);

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.moveCount).toBe(0);
  });

  it('reset with keepClock preserves the running timer (daily restart behavior)', () => {
    const { result } = renderHook(() =>
      useGame(makeTestPuzzle(), { keepClockOnReset: true }),
    );

    act(() => { result.current.revealPattern(); });
    act(() => { vi.advanceTimersByTime(500); });
    const elapsedBeforeReset = result.current.elapsedMs;
    expect(elapsedBeforeReset).toBeGreaterThan(0);

    act(() => { result.current.reset(); });

    expect(result.current.phase).toBe('idle');
    expect(result.current.moveCount).toBe(0);
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(elapsedBeforeReset);
  });

  it('bankTime stops the timer and accumulates; resumeTimer restarts it', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });
    act(() => { vi.advanceTimersByTime(300); });
    const beforeBank = result.current.elapsedMs;
    expect(beforeBank).toBeGreaterThan(0);

    act(() => { result.current.bankTime(); });
    const bankedValue = result.current.elapsedMs;

    // Timer should be frozen — advancing time does NOT change elapsedMs
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current.elapsedMs).toBe(bankedValue);

    // Resume: clock restarts from the banked value
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
    const resume = {
      version: 1 as const,
      date: '2026-05-24',
      gridSize: 4 as const,
      board: target,
      phase: 'playing' as const,
      activeColor: 'red' as const,
      moveCount: 5,
      patternVisible: false,
      accumulatedMs: 12000,
      savedAt: 0,
    };

    const { result } = renderHook(() => useGame(puzzle, { resume }));

    // On mount, RESUME_TIMER fires (in useEffect) after render
    act(() => {});

    expect(result.current.phase).toBe('playing');
    expect(result.current.moveCount).toBe(5);
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(12000);

    // Clock should be running — advancing time increases elapsedMs
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.elapsedMs).toBeGreaterThan(12000);
  });

  it('pathological negative delta (clock set back) is treated as zero', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });
    act(() => { vi.advanceTimersByTime(200); });
    const before = result.current.elapsedMs;

    // Set system time backwards
    act(() => { vi.setSystemTime(0); });
    act(() => { vi.advanceTimersByTime(100); }); // tick with now=100 < runStartedAt

    // elapsedMs should not go negative — stays at the banked value (0 added)
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.current.elapsedMs).toBeLessThanOrEqual(before);
  });

  it('realistic 8-move sequence: Reveal(0) → Hide(+1) → SelectRed(+1) → Place×3(+3) → SelectYellow(+1) → Place×2(+2) = 8', () => {
    const { result } = renderHook(() => useGame(makeTestPuzzle()));

    act(() => { result.current.revealPattern(); });    // 0
    act(() => { result.current.hidePattern(); });      // +1 → 1
    act(() => { result.current.selectColor('red'); }); // +1 → 2
    act(() => { result.current.placeAt(1, 1); });      // +1 → 3
    act(() => { result.current.placeAt(1, 2); });      // +1 → 4
    act(() => { result.current.placeAt(1, 3); });      // +1 → 5
    act(() => { result.current.selectColor('yellow'); }); // +1 → 6
    act(() => { result.current.placeAt(2, 0); });      // +1 → 7
    act(() => { result.current.placeAt(2, 1); });      // +1 → 8

    expect(result.current.moveCount).toBe(8);
  });
});
