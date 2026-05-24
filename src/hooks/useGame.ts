import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { Board, Color } from '../engine/types';
import type { GeneratedPuzzle } from '../engine/generator';
import { applyMove, applyClear } from '../engine/placement';

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
}

interface GameState {
  phase: GamePhase;
  current: Board;
  activeColor: Color | null;
  elapsedMs: number;
  moveCount: number;
  timerStartedAt: number | null;
}

type Action =
  | { type: 'REVEAL_PATTERN'; now: number }
  | { type: 'HIDE_PATTERN' }
  | { type: 'SELECT_COLOR'; color: Color }
  | { type: 'PLACE_AT'; row: number; col: number; target: Board; now: number }
  | { type: 'COMPLETE_VALIDATION' }
  | { type: 'RESET'; gridSize: 4 | 5 | 6 | 8 }
  | { type: 'TICK'; now: number };

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

function makeInitialState(gridSize: 4 | 5 | 6 | 8): GameState {
  return {
    phase: 'idle',
    current: emptyBoard(gridSize),
    activeColor: null,
    elapsedMs: 0,
    moveCount: 0,
    timerStartedAt: null,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'REVEAL_PATTERN': {
      if (state.phase === 'idle') {
        return { ...state, phase: 'pattern-revealed', timerStartedAt: action.now };
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
      return {
        ...state,
        current: newBoard,
        moveCount: state.moveCount + 1,
        phase: isComplete ? 'validating' : state.phase,
        elapsedMs:
          isComplete && state.timerStartedAt !== null
            ? action.now - state.timerStartedAt
            : state.elapsedMs,
      };
    }
    case 'COMPLETE_VALIDATION': {
      if (state.phase === 'validating') {
        return { ...state, phase: 'complete' };
      }
      return state;
    }
    case 'RESET': {
      return makeInitialState(action.gridSize);
    }
    case 'TICK': {
      if (
        (state.phase === 'pattern-revealed' || state.phase === 'playing') &&
        state.timerStartedAt !== null
      ) {
        return { ...state, elapsedMs: action.now - state.timerStartedAt };
      }
      return state;
    }
  }
}

export function useGame(puzzle: GeneratedPuzzle): GameView & GameActions {
  const [state, dispatch] = useReducer(reducer, puzzle.gridSize, makeInitialState);
  const puzzleRef = useRef(puzzle);
  puzzleRef.current = puzzle;

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
    dispatch({ type: 'RESET', gridSize: puzzleRef.current.gridSize });
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
  };
}
