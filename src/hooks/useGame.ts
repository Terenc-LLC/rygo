import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { Board, Color } from '../engine/types';
import type { GeneratedPuzzle } from '../engine/generator';
import { applyMove, applyClear } from '../engine/placement';
import type { InProgressBlob } from '../persistence/inProgress';

export type GamePhase = 'idle' | 'pattern-revealed' | 'playing' | 'validating' | 'complete';

export interface GameView {
  phase: GamePhase;
  gridSize: 4 | 5 | 6 | 8;
  current: Board;
  target: Board;
  patternVisible: boolean;
  elapsedMs: number;
  moveCount: number;
  activeColor: Color | null;
}

export interface GameActions {
  revealPattern: () => void;
  hidePattern: () => void;
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
  | { type: 'REVEAL_PATTERN'; now: number }
  | { type: 'HIDE_PATTERN' }
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
    return {
      phase: resume.phase,
      current: resume.board,
      activeColor: resume.activeColor,
      elapsedMs: resume.accumulatedMs,
      moveCount: resume.moveCount,
      accumulatedMs: resume.accumulatedMs,
      runStartedAt: null, // set via RESUME_TIMER on mount
    };
  }
  return {
    phase: 'idle',
    current: emptyBoard(gridSize),
    activeColor: null,
    elapsedMs: 0,
    moveCount: 0,
    accumulatedMs: 0,
    runStartedAt: null,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'REVEAL_PATTERN': {
      if (state.phase === 'idle') {
        return {
          ...state,
          phase: 'pattern-revealed',
          // Only set runStartedAt if not already running (e.g., post-reset in daily mode)
          runStartedAt: state.runStartedAt ?? action.now,
        };
      }
      if (state.phase === 'playing') {
        return { ...state, phase: 'pattern-revealed', moveCount: state.moveCount + 1 };
      }
      return state;
    }
    case 'HIDE_PATTERN': {
      if (state.phase === 'pattern-revealed') {
        return { ...state, phase: 'playing', moveCount: state.moveCount + 1 };
      }
      return state;
    }
    case 'SELECT_COLOR': {
      if (state.activeColor === action.color) return state;
      return { ...state, activeColor: action.color, moveCount: state.moveCount + 1 };
    }
    case 'PLACE_AT': {
      if (state.phase !== 'playing' || state.activeColor === null) return state;
      if (state.current[action.row][action.col] === state.activeColor) {
        // Same-color tap: clear via this color's reach. Clearing cannot complete the puzzle:
        // all targets are fully covered (TER-146), and a clear produces empty cells — so
        // this path deliberately skips the completion check.
        return {
          ...state,
          current: applyClear(state.current, state.activeColor, action.row, action.col),
          moveCount: state.moveCount + 1,
        };
      }
      const newBoard = applyMove(state.current, state.activeColor, action.row, action.col);
      const isComplete = boardsMatch(newBoard, action.target);
      if (isComplete) {
        // Freeze the clock atomically with the completion
        const frozen =
          state.accumulatedMs +
          (state.runStartedAt !== null ? clampDelta(action.now, state.runStartedAt) : 0);
        return {
          ...state,
          current: newBoard,
          moveCount: state.moveCount + 1,
          phase: 'validating',
          elapsedMs: frozen,
          accumulatedMs: frozen,
          runStartedAt: null,
        };
      }
      return {
        ...state,
        current: newBoard,
        moveCount: state.moveCount + 1,
      };
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
  const hasResume = !!(options?.resume);

  // Start the clock immediately when resuming from an in-progress blob.
  useEffect(() => {
    if (hasResume) {
      dispatch({ type: 'RESUME_TIMER', now: Date.now() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK', now: Date.now() });
    }, 100);
    return () => clearInterval(id);
  }, []);

  const revealPattern = useCallback(() => {
    dispatch({ type: 'REVEAL_PATTERN', now: Date.now() });
  }, []);

  const hidePattern = useCallback(() => {
    dispatch({ type: 'HIDE_PATTERN' });
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
    patternVisible: state.phase === 'pattern-revealed',
    elapsedMs: state.elapsedMs,
    moveCount: state.moveCount,
    activeColor: state.activeColor,
    revealPattern,
    hidePattern,
    selectColor,
    placeAt,
    completeValidation,
    reset,
    bankTime,
    resumeTimer,
  };
}
