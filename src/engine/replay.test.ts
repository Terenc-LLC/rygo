import { describe, it, expect } from 'vitest';
import { replayEventLog, applyEvent } from './replay';
import type { EventReplayState } from './replay';
import type { GameEvent } from './types';
import type { GeneratedPuzzle } from './generator';

function makePuzzle(target: string[][]): GeneratedPuzzle {
  const board = target.map(row => row.map(c => c)) as GeneratedPuzzle['target'];
  return { target: board, solution: [], gridSize: 2, seed: 'test' } as unknown as GeneratedPuzzle;
}

function makePuzzle4(target: string[][]): GeneratedPuzzle {
  const board = target.map(row => row.map(c => c)) as GeneratedPuzzle['target'];
  return { target: board, solution: [], gridSize: 4, seed: 'test' } as unknown as GeneratedPuzzle;
}

const baseState: EventReplayState = {
  board: [['empty', 'empty'], ['empty', 'empty']],
  activeColor: null,
  moveCount: 0,
  hasRevealed: false,
};

describe('applyEvent — select (TER-221: color switches are +0)', () => {
  it('switching to a new color is +0', () => {
    const s = applyEvent(baseState, { type: 'select', color: 'red' });
    expect(s.activeColor).toBe('red');
    expect(s.moveCount).toBe(0);
  });

  it('re-selecting the already-active color is +0 (no-op)', () => {
    const s0 = { ...baseState, activeColor: 'red' as const, moveCount: 2 };
    const s1 = applyEvent(s0, { type: 'select', color: 'red' });
    expect(s1.moveCount).toBe(2);
    expect(s1.activeColor).toBe('red');
  });

  it('switching color updates activeColor and stays at same moveCount', () => {
    const s0 = { ...baseState, activeColor: 'red' as const, moveCount: 3 };
    const s1 = applyEvent(s0, { type: 'select', color: 'green' });
    expect(s1.activeColor).toBe('green');
    expect(s1.moveCount).toBe(3);
  });
});

describe('applyEvent — reveal / hide (backward-compat: both +0 after TER-221)', () => {
  it('first reveal is +0 and sets hasRevealed', () => {
    const s = applyEvent(baseState, { type: 'reveal' });
    expect(s.moveCount).toBe(0);
    expect(s.hasRevealed).toBe(true);
  });

  it('second reveal (hasRevealed=true) is still +0', () => {
    const s0 = { ...baseState, hasRevealed: true, moveCount: 1 };
    const s1 = applyEvent(s0, { type: 'reveal' });
    expect(s1.moveCount).toBe(1);
  });

  it('hide is +0 (no-op)', () => {
    const s0 = { ...baseState, hasRevealed: true, moveCount: 2 };
    const s1 = applyEvent(s0, { type: 'hide' });
    expect(s1.moveCount).toBe(2);
  });
});

describe('applyEvent — tap (placement)', () => {
  it('tap on empty cell with active color counts +1 and places the color', () => {
    const s0: EventReplayState = {
      board: [['empty', 'empty'], ['empty', 'empty']],
      activeColor: 'red',
      moveCount: 0,
      hasRevealed: true,
    };
    const s1 = applyEvent(s0, { type: 'tap', row: 0, col: 0 });
    expect(s1.moveCount).toBe(1);
    expect(s1.board[0][0]).toBe('red');
  });

  it('tap on a same-color cell clears via applyClear and counts +1', () => {
    const s0: EventReplayState = {
      board: [['red', 'empty'], ['empty', 'empty']],
      activeColor: 'red',
      moveCount: 1,
      hasRevealed: true,
    };
    const s1 = applyEvent(s0, { type: 'tap', row: 0, col: 0 });
    expect(s1.moveCount).toBe(2);
    expect(s1.board[0][0]).toBe('empty');
  });

  it('tap that is a board no-op under the overwrite hierarchy still counts +1', () => {
    const s0: EventReplayState = {
      board: [['red', 'empty'], ['empty', 'empty']],
      activeColor: 'yellow',
      moveCount: 1,
      hasRevealed: true,
    };
    const s1 = applyEvent(s0, { type: 'tap', row: 0, col: 0 });
    expect(s1.moveCount).toBe(2);
    expect(s1.board[0][0]).toBe('red');
  });
});

describe('replayEventLog', () => {
  it('empty event log returns empty board and zero moves', () => {
    const puzzle = makePuzzle([['red', 'green'], ['yellow', 'red']]);
    const { board, moveCount } = replayEventLog(puzzle, []);
    expect(moveCount).toBe(0);
    expect(board[0][0]).toBe('empty');
  });

  it('reveal and hide are both +0 (backward-compat)', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'reveal' },
      { type: 'hide' },
      { type: 'reveal' }, // re-reveal
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    // All +0
    expect(moveCount).toBe(0);
  });

  it('no-op select (same color twice) charges zero in both cases', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' },   // +0
      { type: 'select', color: 'red' },   // +0 (no-op)
      { type: 'select', color: 'green' }, // +0
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    expect(moveCount).toBe(0);
  });

  it('same-color clear counts +1 and removes the cell', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' }, // +0, activeColor = red
      { type: 'tap', row: 0, col: 0 },  // +1, places red
      { type: 'tap', row: 0, col: 0 },  // +1, same-color: clears
    ];
    const { board, moveCount } = replayEventLog(puzzle, events);
    expect(moveCount).toBe(2);
    expect(board[0][0]).toBe('empty');
  });

  it('non-overwriting tap (yellow on red) still counts +1', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' },    // +0
      { type: 'tap', row: 0, col: 0 },     // +1, places red
      { type: 'select', color: 'yellow' }, // +0
      { type: 'tap', row: 0, col: 0 },     // +1, board no-op
    ];
    const { board, moveCount } = replayEventLog(puzzle, events);
    expect(moveCount).toBe(2);
    expect(board[0][0]).toBe('red');
  });

  it('realistic full sequence — color switches do not add to moveCount', () => {
    const puzzle = makePuzzle([['red', 'yellow'], ['red', 'green']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' },     // +0
      { type: 'tap', row: 0, col: 0 },      // +1
      { type: 'select', color: 'yellow' },  // +0
      { type: 'tap', row: 0, col: 1 },      // +1
      { type: 'select', color: 'green' },   // +0
      { type: 'tap', row: 1, col: 1 },      // +1
      { type: 'select', color: 'red' },     // +0
      { type: 'tap', row: 1, col: 0 },      // +1
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    // 4 taps × 1 = 4
    expect(moveCount).toBe(4);
  });

  it('old-blob sequence with reveal/hide still replays correctly (+0 for each)', () => {
    // Simulates replaying a pre-TER-221 event log that contains reveal/hide events.
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'reveal' },                   // +0 (old: was +0 for first)
      { type: 'hide' },                     // +0 (old: was +1)
      { type: 'select', color: 'red' },     // +0 (old: was +1)
      { type: 'tap', row: 0, col: 0 },      // +1
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    // New scoring: 0+0+0+1 = 1
    expect(moveCount).toBe(1);
  });

  it('event log that reaches the target yields board === target', () => {
    const target = [
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
    ];
    const puzzle = makePuzzle4(target);
    const events: GameEvent[] = [{ type: 'select', color: 'red' }];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        events.push({ type: 'tap', row: r, col: c });
      }
    }
    const { board } = replayEventLog(puzzle, events);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        expect(board[r][c]).toBe('red');
      }
    }
  });
});
