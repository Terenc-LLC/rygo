export type Color = 'red' | 'yellow' | 'green';
export type CellState = 'empty' | Color;
export type Board = CellState[][]; // [row][col]
export type Move = { color: Color; row: number; col: number };
export type GameEvent =
  | { type: 'select'; color: Color }
  | { type: 'reveal' }
  | { type: 'hide' }
  | { type: 'tap'; row: number; col: number };
