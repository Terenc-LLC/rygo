import type { JSX } from 'react';
import type { Board, CellState } from '../engine/types';
import { Square, Triangle, Circle } from './Shapes';

const THUMB_COLS: Record<4 | 5 | 6 | 8, string> = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  8: 'grid-cols-8',
};

const CELL_BG: Record<CellState, string> = {
  empty: 'bg-stone-300 dark:bg-gray-800',
  red: 'bg-rygo-red',
  yellow: 'bg-rygo-yellow',
  green: 'bg-rygo-green',
};

const SHAPE_TEXT: Record<CellState, string> = {
  empty: '',
  red: 'text-paper',
  yellow: 'text-ink',
  green: 'text-paper',
};

function ThumbCell({ state }: { state: CellState }): JSX.Element {
  const shapeClass = `w-3/4 aspect-square ${SHAPE_TEXT[state]}`;
  return (
    <div className={`aspect-square rounded-sm flex items-center justify-center ${CELL_BG[state]}`}>
      {state === 'red' && <Square className={shapeClass} />}
      {state === 'yellow' && <Triangle className={shapeClass} />}
      {state === 'green' && <Circle className={shapeClass} />}
    </div>
  );
}

interface RefThumbnailProps {
  board: Board;
  size: 4 | 5 | 6 | 8;
}

// Read-only minimap of the target pattern. Fixed at w-28 (112 px) for all sizes.
// Cell sizes: 4×4 ≈26 px, 5×5 ≈21 px, 6×6 ≈17 px, 8×8 ≈12 px.
// At 8×8 (Extreme) the 12 px cells are below the stated ~15 px shape-legibility
// threshold — this is flagged as an open question in the TER-221 Linear comment.
export function RefThumbnail({ board, size }: RefThumbnailProps): JSX.Element {
  return (
    <div
      role="img"
      aria-label="Target pattern reference"
      data-testid="ref-thumbnail"
      className={`w-28 grid ${THUMB_COLS[size]} gap-0.5`}
    >
      {board.map((row, r) =>
        row.map((cell, c) => (
          <ThumbCell key={`${r}-${c}`} state={cell} />
        ))
      )}
    </div>
  );
}
