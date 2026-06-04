import type { JSX } from 'react';
import type { Board, CellState } from '../engine/types';
import { Square, Triangle, Circle } from './Shapes';

interface GridProps {
  board: Board;
  onCellTap?: (row: number, col: number) => void;
  size: 4 | 5 | 6 | 8;
}

const GRID_COLS: Record<4 | 5 | 6 | 8, string> = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  8: 'grid-cols-8',
};

const STATE_LABEL: Record<CellState, string> = {
  empty: 'Empty',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
};

const CELL_BG: Record<CellState, string> = {
  empty: 'bg-stone-400 dark:bg-gray-800',
  red: 'bg-rygo-red',
  yellow: 'bg-rygo-yellow',
  green: 'bg-rygo-green',
};

// Shape fill is via text-* so SVG fill="currentColor" picks it up.
const SHAPE_TEXT: Record<CellState, string> = {
  empty: '',
  red: 'text-paper',
  yellow: 'text-ink',
  green: 'text-paper',
};

function CellShape({ state }: { state: CellState }) {
  const cls = `w-1/2 aspect-square ${SHAPE_TEXT[state]}`;
  if (state === 'red') return <Square className={cls} />;
  if (state === 'yellow') return <Triangle className={cls} />;
  if (state === 'green') return <Circle className={cls} />;
  return null;
}

export function Grid({ board, onCellTap, size }: GridProps): JSX.Element {
  const interactive = onCellTap !== undefined;

  return (
    <div className={`w-full grid ${GRID_COLS[size]} gap-1 p-px bg-paper dark:bg-ink rounded-md`}>
      {board.map((row, rowIdx) =>
        row.map((state, colIdx) => (
          <button
            key={`${rowIdx}-${colIdx}`}
            aria-label={`${STATE_LABEL[state]} cell at row ${rowIdx + 1}, column ${colIdx + 1}`}
            disabled={!interactive}
            onClick={interactive ? () => onCellTap(rowIdx, colIdx) : undefined}
            className={[
              'aspect-square rounded-md flex items-center justify-center transition-[transform,background-color,color] duration-150',
              CELL_BG[state],
              interactive ? 'cursor-pointer active:scale-95' : 'cursor-default',
            ].join(' ')}
          >
            <CellShape state={state} />
          </button>
        ))
      )}
    </div>
  );
}
