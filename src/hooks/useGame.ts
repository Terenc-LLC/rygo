import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { Board, Color, GameEvent } from '../engine/types';
import type { GeneratedPuzzle } from '../engine/generator';
import { applyEvent } from '../engine/replay';
import type { InProgressBlob } from '../persistence/inProgress';

// TER-221: removed 'idle' and 'pattern-revealed' — game starts directly in 'playing'.
export type GamePhase = 'playing' | 'validating' | 'complete';

export interface GameView {
  phase: GamePhase;
  gridSize: 4 | 5 | 6 | 8;
  current: Board;
  target: Board;
  elapsedMs: number;
  moveCount: number;
  activeColor: Color | null;
  eventLog: GameEvent[];
}

export interface GameActions {
  selectColor: (c: Color) => void;
  placeAt: (row: number, col: number) => void;
  completeValidation: () => void;
  reset: () => void;
  bankTime: () => void;
  resumeTimer: () => void;
}

interface GameState {
  phase: GamePhase;
  current: Board;
  activeColor: Color | null;
  elapsedMs: number;
  moveCount: number;
  accumulatedMs: number;
  runStartedAt: number | null;
  eventLog: GameEvent[];
}

// Max elapsed time per continuous run — caps foreground-sleep deltas that didn't
// fire a pause event (e.g., iOS backgrounding without visibilitychange).
const MAX_RUN_DELTA_MS = 7_200_000; // 2 hours

function clampDelta(now: number, startedAt: number): number {
  const d = now - startedAt;
  if (d < 0) return 0;
  return Math.min(d, MAX_RUN_DELTA_MS);
}

type Action =
  | { type: 'SELECT_COLOR'; color: Color }
  | { type: 'PLACE_AT'; row: number; col: number; target: Board; now: number }
  | { type: 'COMPLETE_VALIDATION' }
  | { type: 'RESET'; gridSize: 4 | 5 | 6 | 8; keepClock: boolean }
  | { type: 'TICK'; now: number }
  | { type: 'BANK_TIME'; now: number }
  | { type: 'RESUME_TIMER'; now: number };

function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<'empty'>(size).fill('empty'));
}

function boardsMatch(a: Board, b: Board): boolean {
  for (let r = 0; r < a.length; r++) {
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

interface InitArgs {
  gridSize: 4 | 5 | 6 | 8;
  resume?: InProgressBlob;
}

function makeInitialState({ gridSize, resume }: InitArgs): GameState {
  if (resume) {
    // All InProgressPhase values ('idle', 'pattern-revealed', 'playing') map to 'playing'
    // since idle/pattern-revealed phases no longer exist after TER-221.
    return {
      phase: 'playing',
      current: resume.board,
      activeColor: resume.activeColor,
      elapsedMs: resume.accumulatedMs,
      moveCount: resume.moveCount,
      accumulatedMs: resume.accumulatedMs,
      runStartedAt: null, // set via RESUME_TIMER on mount
      eventLog: resume.eventLog,
    };
  }
  return {
    phase: 'playing',
    current: emptyBoard(gridSize),
    activeColor: null,
    elapsedMs: 0,
    moveCount: 0,
    accumulatedMs: 0,
    runStartedAt: null,
    eventLog: [],
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_COLOR': {
      // Always append the event — the server applies +0 for no-op selects on replay.
      const rs = applyEvent(
        { board: state.current, activeColor: state.activeColor, moveCount: state.moveCount, hasRevealed: true },
        { type: 'select', color: action.color },
      );
      return { ...state, activeColor: rs.activeColor, moveCount: rs.moveCount, eventLog: [...state.eventLog, { type: 'select' as const, color: action.color }] };
    }
    case 'PLACE_AT': {
      if (state.phase !== 'playing' || state.activeColor === null) return state;
      const newEventLog = [...state.eventLog, { type: 'tap' as const, row: action.row, col: action.col }];
      const rs = applyEvent(
        { board: state.current, activeColor: state.activeColor, moveCount: state.moveCount, hasRevealed: true },
        { type: 'tap', row: action.row, col: action.col },
      );
      // Targets are fully covered (TER-146) so a clear (empty cells) can never match.
      if (boardsMatch(rs.board, action.target)) {
        const frozen =
          state.accumulatedMs +
          (state.runStartedAt !== null ? clampDelta(action.now, state.runStartedAt) : 0);
        return {
          ...state,
          current: rs.board,
          moveCount: rs.moveCount,
          phase: 'validating',
          elapsedMs: frozen,
          accumulatedMs: frozen,
          runStartedAt: null,
          eventLog: newEventLog,
        };
      }
      return { ...state, current: rs.board, moveCount: rs.moveCount, eventLog: newEventLog };
    }
    case 'COMPLETE_VALIDATION': {
      if (state.phase === 'validating') {
        return { ...state, phase: 'complete' };
      }
      return state;
    }
    case 'RESET': {
      const base = makeInitialState({ gridSize: action.gridSize });
      if (action.keepClock) {
        return {
          ...base,
          accumulatedMs: state.accumulatedMs,
          runStartedAt: state.runStartedAt,
          elapsedMs: state.elapsedMs,
        };
      }
      return base;
    }
    case 'TICK': {
      if (state.runStartedAt !== null) {
        return {
          ...state,
          elapsedMs: state.accumulatedMs + clampDelta(action.now, state.runStartedAt),
        };
      }
      return state;
    }
    case 'BANK_TIME': {
      if (state.runStartedAt === null) return state;
      const banked = state.accumulatedMs + clampDelta(action.now, state.runStartedAt);
      return {
        ...state,
        accumulatedMs: banked,
        runStartedAt: null,
        elapsedMs: banked,
      };
    }
    case 'RESUME_TIMER': {
      if (state.runStartedAt !== null) return state;
      if (state.phase === 'validating' || state.phase === 'complete') return state;
      return { ...state, runStartedAt: action.now };
    }
  }
}

export function useGame(
  puzzle: GeneratedPuzzle,
  options?: { resume?: InProgressBlob; keepClockOnReset?: boolean },
): GameView & GameActions {
  const [state, dispatch] = useReducer(
    reducer,
    { gridSize: puzzle.gridSize, resume: options?.resume },
    makeInitialState,
  );
  const puzzleRef = useRef(puzzle);
  puzzleRef.current = puzzle;
  const keepClockOnReset = options?.keepClockOnReset ?? false;

  // Timer starts immediately on mount (fresh game or resume).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    dispatch({ type: 'RESUME_TIMER', now: Date.now() });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK', now: Date.now() });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const selectColor = useCallback((c: Color) => {
    dispatch({ type: 'SELECT_COLOR', color: c });
  }, []);

  const placeAt = useCallback((row: number, col: number) => {
    dispatch({
      type: 'PLACE_AT',
      row,
      col,
      target: puzzleRef.current.target,
      now: Date.now(),
    });
  }, []);

  const completeValidation = useCallback(() => {
    dispatch({ type: 'COMPLETE_VALIDATION' });
  }, []);

  const reset = useCallback(() => {
    dispatch({
      type: 'RESET',
      gridSize: puzzleRef.current.gridSize,
      keepClock: keepClockOnReset,
    });
  }, [keepClockOnReset]);

  const bankTime = useCallback(() => {
    dispatch({ type: 'BANK_TIME', now: Date.now() });
  }, []);

  const resumeTimer = useCallback(() => {
    dispatch({ type: 'RESUME_TIMER', now: Date.now() });
  }, []);

  return {
    phase: state.phase,
    gridSize: puzzle.gridSize,
    current: state.current,
    target: puzzle.target,
    elapsedMs: state.elapsedMs,
    moveCount: state.moveCount,
    activeColor: state.activeColor,
    eventLog: state.eventLog,
    selectColor,
    placeAt,
    completeValidation,
    reset,
    bankTime,
    resumeTimer,
  };
}
