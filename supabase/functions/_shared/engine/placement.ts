// GENERATED — do not edit. Source: src/engine/placement.ts. Regenerate: npm run sync-engine
/*
 * Overwrite hierarchy — what a placed color can fill:
 *
 *   placing red    → overwrites empty, green, yellow, red  (always)
 *   placing yellow → overwrites empty, green               (not red or yellow)
 *   placing green  → overwrites empty only                 (not red, yellow, or green)
 *
 * Reach patterns (board indexed [row][col], orthogonal only, no diagonals):
 *
 *   red    → { (row, col) }
 *   yellow → { (row, col) } ∪ up/down/left/right neighbours, clipped to grid bounds
 *   green  → the placed cell, then propagates in each cardinal direction; propagation
 *            stops at the first non-empty cell (blocker excluded) or the grid edge.
 *            Green's reach is board-state-dependent.
 */

import type { Board, CellState, Color } from './types.ts';

function canOverwrite(existing: CellState, placing: Color): boolean {
  if (placing === 'red') return true;
  if (placing === 'yellow') return existing === 'empty' || existing === 'green';
  return existing === 'empty';
}

// Exported so clearColor (TER-147) can reuse the same reach logic.
export function reachCells(board: Board, color: Color, row: number, col: number): [number, number][] {
  const rows = board.length;
  const cols = board[0].length;

  if (color === 'red') {
    return [[row, col]];
  }
  if (color === 'yellow') {
    return (
      [
        [row, col],
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ] as [number, number][]
    ).filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols);
  }
  // green: placed cell always included; propagate outward in each cardinal direction,
  // stopping before the first non-empty cell. Reach is computed on the original board
  // so pre-existing blockers halt propagation regardless of what applyMove writes.
  const cells: [number, number][] = [[row, col]];
  for (let r = row - 1; r >= 0; r--) {
    if (board[r][col] !== 'empty') break;
    cells.push([r, col]);
  }
  for (let r = row + 1; r < rows; r++) {
    if (board[r][col] !== 'empty') break;
    cells.push([r, col]);
  }
  for (let c = col - 1; c >= 0; c--) {
    if (board[row][c] !== 'empty') break;
    cells.push([row, c]);
  }
  for (let c = col + 1; c < cols; c++) {
    if (board[row][c] !== 'empty') break;
    cells.push([row, c]);
  }
  return cells;
}

export function clearCells(board: Board, color: Color, row: number, col: number): [number, number][] {
  if (board.length === 0 || board[0].length === 0) {
    throw new RangeError('Board is malformed: empty dimensions');
  }
  const rows = board.length;
  const cols = board[0].length;
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    throw new RangeError(`(${row}, ${col}) is out of bounds for a ${rows}×${cols} board`);
  }
  if (board[row][col] !== color) {
    throw new Error(`clearCells: cell (${row}, ${col}) is '${board[row][col]}', expected '${color}'`);
  }

  if (color === 'red') {
    return [[row, col]];
  }
  if (color === 'yellow') {
    // Plus footprint — filter to only cells that are currently yellow.
    return (
      [
        [row, col],
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ] as [number, number][]
    ).filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === 'yellow');
  }
  // green: propagate cardinal through green cells only; stop at first non-green or grid edge.
  // Asymmetry vs reachCells: placement stops at non-empty; clearing stops at non-green.
  const cells: [number, number][] = [[row, col]];
  for (let r = row - 1; r >= 0; r--) {
    if (board[r][col] !== 'green') break;
    cells.push([r, col]);
  }
  for (let r = row + 1; r < rows; r++) {
    if (board[r][col] !== 'green') break;
    cells.push([r, col]);
  }
  for (let c = col - 1; c >= 0; c--) {
    if (board[row][c] !== 'green') break;
    cells.push([row, c]);
  }
  for (let c = col + 1; c < cols; c++) {
    if (board[row][c] !== 'green') break;
    cells.push([row, c]);
  }
  return cells;
}

export function applyClear(board: Board, color: Color, row: number, col: number): Board {
  const cells = clearCells(board, color, row, col);
  const next: Board = board.map(r => [...r]);
  for (const [r, c] of cells) {
    next[r][c] = 'empty';
  }
  return next;
}

export function applyMove(board: Board, color: Color, row: number, col: number): Board {
  if (board.length === 0 || board[0].length === 0) {
    throw new RangeError('Board is malformed: empty dimensions');
  }
  const rows = board.length;
  const cols = board[0].length;
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    throw new RangeError(
      `(${row}, ${col}) is out of bounds for a ${rows}×${cols} board`,
    );
  }

  const next: Board = board.map(r => [...r]);
  for (const [r, c] of reachCells(board, color, row, col)) {
    if (canOverwrite(next[r][c], color)) {
      next[r][c] = color;
    }
  }
  return next;
}
