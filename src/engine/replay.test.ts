import { describe, it, expect } from 'vitest';
import { replayEventLog, applyEvent } from './replay';
import type { EventReplayState } from './replay';
import type { GameEvent } from './types';
import type { GeneratedPuzzle } from './generator';

// Minimal 2×2 puzzle helper. The solver seeds it ourselves so tests are predictable.
function makePuzzle(target: string[][]): GeneratedPuzzle {
  const board = target.map(row => row.map(c => c)) as GeneratedPuzzle['target'];
  return { target: board, solution: [], gridSize: 2, seed: 'test' } as unknown as GeneratedPuzzle;
}

// Convenience: build a GeneratedPuzzle that wraps a 4×4 target produced by the real generator.
// Most tests need only the gridSize / target, not the solution.
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

describe('applyEvent — select', () => {
  it('switching to a new color costs +1', () => {
    const s = applyEvent(baseState, { type: 'select', color: 'red' });
    expect(s.activeColor).toBe('red');
    expect(s.moveCount).toBe(1);
  });

  it('re-selecting the already-active color is +0 (no-op)', () => {
    const s0 = { ...baseState, activeColor: 'red' as const, moveCount: 2 };
    const s1 = applyEvent(s0, { type: 'select', color: 'red' });
    expect(s1.moveCount).toBe(2);
    expect(s1.activeColor).toBe('red');
  });

  it('switching color updates activeColor', () => {
    const s0 = { ...baseState, activeColor: 'red' as const };
    const s1 = applyEvent(s0, { type: 'select', color: 'green' });
    expect(s1.activeColor).toBe('green');
    expect(s1.moveCount).toBe(1);
  });
});

describe('applyEvent — reveal / hide', () => {
  it('first reveal is free (+0) and sets hasRevealed', () => {
    const s = applyEvent(baseState, { type: 'reveal' });
    expect(s.moveCount).toBe(0);
    expect(s.hasRevealed).toBe(true);
  });

  it('second reveal (hasRevealed=true) costs +1', () => {
    const s0 = { ...baseState, hasRevealed: true, moveCount: 1 };
    const s1 = applyEvent(s0, { type: 'reveal' });
    expect(s1.moveCount).toBe(2);
  });

  it('hide costs +1', () => {
    const s0 = { ...baseState, hasRevealed: true, moveCount: 2 };
    const s1 = applyEvent(s0, { type: 'hide' });
    expect(s1.moveCount).toBe(3);
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
    expect(s1.board[0][0]).toBe('empty'); // cleared
  });

  it('tap that is a board no-op under the overwrite hierarchy still counts +1', () => {
    // yellow cannot overwrite red — board is unchanged but moveCount increments
    const s0: EventReplayState = {
      board: [['red', 'empty'], ['empty', 'empty']],
      activeColor: 'yellow',
      moveCount: 1,
      hasRevealed: true,
    };
    const s1 = applyEvent(s0, { type: 'tap', row: 0, col: 0 });
    expect(s1.moveCount).toBe(2);
    expect(s1.board[0][0]).toBe('red'); // unchanged — yellow can't overwrite red
  });
});

describe('replayEventLog', () => {
  it('empty event log returns empty board and zero moves', () => {
    const puzzle = makePuzzle([['red', 'green'], ['yellow', 'red']]);
    const { board, moveCount } = replayEventLog(puzzle, []);
    expect(moveCount).toBe(0);
    expect(board[0][0]).toBe('empty');
  });

  it('first reveal is free; second reveal costs +1', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'reveal' },
      { type: 'hide' },
      { type: 'reveal' }, // re-reveal
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    // reveal(+0) + hide(+1) + reveal(+1) = 2
    expect(moveCount).toBe(2);
  });

  it('no-op select (same color twice) only charges once', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' },   // +1 (null → red)
      { type: 'select', color: 'red' },   // +0 (no-op)
      { type: 'select', color: 'green' }, // +1
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    expect(moveCount).toBe(2);
  });

  it('same-color clear counts +1 and removes the cell', () => {
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' }, // +1, activeColor = red
      { type: 'tap', row: 0, col: 0 },  // +1, places red
      { type: 'tap', row: 0, col: 0 },  // +1, same-color: clears
    ];
    const { board, moveCount } = replayEventLog(puzzle, events);
    expect(moveCount).toBe(3);
    expect(board[0][0]).toBe('empty');
  });

  it('non-overwriting tap (yellow on red) still counts +1', () => {
    // Place red first, then try to overwrite with yellow — board no-op but +1 score
    const puzzle = makePuzzle([['red', 'empty'], ['empty', 'empty']]);
    const events: GameEvent[] = [
      { type: 'select', color: 'red' },    // +1
      { type: 'tap', row: 0, col: 0 },     // +1, places red
      { type: 'select', color: 'yellow' }, // +1
      { type: 'tap', row: 0, col: 0 },     // +1, board no-op — yellow can't overwrite red
    ];
    const { board, moveCount } = replayEventLog(puzzle, events);
    expect(moveCount).toBe(4);
    expect(board[0][0]).toBe('red'); // unchanged
  });

  it('realistic full sequence produces same moveCount as the reducer would', () => {
    // 2×2 target: [[red, yellow], [empty, green]]... but replayEventLog doesn't check
    // completion, so target doesn't need to match. We verify the move count formula.
    const puzzle = makePuzzle([['red', 'yellow'], ['red', 'green']]);
    const events: GameEvent[] = [
      { type: 'reveal' },                   // +0 (first reveal free)
      { type: 'hide' },                     // +1
      { type: 'select', color: 'red' },     // +1
      { type: 'tap', row: 0, col: 0 },      // +1
      { type: 'select', color: 'yellow' },  // +1
      { type: 'tap', row: 0, col: 1 },      // +1
      { type: 'reveal' },                   // +1 (re-reveal)
      { type: 'hide' },                     // +1
      { type: 'select', color: 'green' },   // +1
      { type: 'tap', row: 1, col: 1 },      // +1
      { type: 'select', color: 'red' },     // +1
      { type: 'tap', row: 1, col: 0 },      // +1
    ];
    const { moveCount } = replayEventLog(puzzle, events);
    // 0+1+1+1+1+1+1+1+1+1+1+1 = 11
    expect(moveCount).toBe(11);
  });

  it('event log that reaches the target yields board === target', () => {
    // 4×4 target — red only for simplicity (red overwrites everything)
    const target = [
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red'],
    ];
    const puzzle = makePuzzle4(target);
    // Red plus shape from center covers 5 cells; 4 taps from different positions cover all 16
    // More practically: red has reach 1, so we need a tap for each cell.
    // Let's just do a sequence of 16 taps with red (red always overwrites).
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
