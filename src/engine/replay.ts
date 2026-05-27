import type { Board, Color, GameEvent } from './types.ts';
import type { GeneratedPuzzle } from './generator.ts';
import { applyMove, applyClear } from './placement.ts';

export interface ReplayResult {
  board: Board;
  moveCount: number;
}

// Internal state threaded through applyEvent. Exported so useGame can delegate
// board + score transitions without duplicating the rule set.
export interface EventReplayState {
  board: Board;
  activeColor: Color | null;
  moveCount: number;
  // Tracks whether the first reveal has already occurred.
  // First reveal is free (+0); every subsequent reveal counts +1.
  hasRevealed: boolean;
}

// Pure single-event rule set. Called by replayEventLog and the useGame reducer.
// Does NOT detect completion — the caller is responsible for comparing board to target.
//
// TER-221 scoring change (reverses TER-150): color switches are now +0.
// reveal/hide events still exist in old blobs — they are +0 for backward compat.
export function applyEvent(state: EventReplayState, event: GameEvent): EventReplayState {
  switch (event.type) {
    case 'select': {
      if (state.activeColor === event.color) return state; // no-op re-tap, +0
      return { ...state, activeColor: event.color }; // color switch now +0
    }
    case 'reveal': {
      // Always +0; hasRevealed tracked for backward-compat with old event logs.
      return { ...state, hasRevealed: true };
    }
    case 'hide': {
      return state; // +0 (no-op — always-visible pattern; kept for old-blob compat)
    }
    case 'tap': {
      if (state.activeColor === null) return state;
      const { row, col } = event;
      if (state.board[row][col] === state.activeColor) {
        // Same-color tap: clear via this color's reach. Always +1.
        return {
          ...state,
          board: applyClear(state.board, state.activeColor, row, col),
          moveCount: state.moveCount + 1,
        };
      }
      // Placement — counts +1 even if the overwrite hierarchy makes it a board no-op.
      return {
        ...state,
        board: applyMove(state.board, state.activeColor, row, col),
        moveCount: state.moveCount + 1,
      };
    }
  }
}

function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<'empty'>(size).fill('empty'));
}

// Replays an ordered GameEvent[] against a puzzle's initial empty board,
// returning the final board and the recomputed move count.
// Does NOT check for completion — the caller compares board to puzzle.target.
export function replayEventLog(puzzle: GeneratedPuzzle, events: GameEvent[]): ReplayResult {
  let state: EventReplayState = {
    board: emptyBoard(puzzle.gridSize),
    activeColor: null,
    moveCount: 0,
    hasRevealed: false,
  };
  for (const event of events) {
    state = applyEvent(state, event);
  }
  return { board: state.board, moveCount: state.moveCount };
}
