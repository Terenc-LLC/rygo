import { useState, useEffect, useRef } from 'react';
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

function OverlayCell({ state }: { state: CellState }): JSX.Element {
  const shapeClass = `w-3/4 aspect-square ${SHAPE_TEXT[state]}`;
  return (
    <div className={`aspect-square rounded-md flex items-center justify-center ${CELL_BG[state]}`}>
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
// Tapping the thumbnail opens a full-screen overlay where cells are well above
// the ~15 px legibility threshold for all sizes.
export function RefThumbnail({ board, size }: RefThumbnailProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Focus close button on open; restore focus to trigger on close.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    return () => {
      returnFocusRef.current?.focus();
    };
  }, [open]);

  // Esc key dismisses overlay.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleOpen = () => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Enlarge target pattern"
        aria-haspopup="dialog"
        data-testid="ref-thumbnail"
        className={`w-28 grid ${THUMB_COLS[size]} gap-0.5 p-px bg-grid-line dark:bg-ink cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
        onClick={handleOpen}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <ThumbCell key={`${r}-${c}`} state={cell} />
          ))
        )}
      </button>

      {open && (
        <div
          data-testid="ref-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Target pattern enlarged"
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Decorative backdrop */}
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

          {/* Content — stop propagation so inner taps don't dismiss */}
          <div
            className="relative z-10 flex flex-col items-center gap-4 p-6 rounded-2xl bg-paper dark:bg-ink shadow-2xl w-[min(90vw,_360px)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-semibold text-ink dark:text-paper uppercase tracking-wide">
                Target Pattern
              </p>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close"
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div
              role="img"
              aria-label="Target pattern"
              data-testid="ref-overlay-board"
              className={`w-full grid ${THUMB_COLS[size]} gap-1 p-px bg-grid-line dark:bg-ink rounded-md`}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <OverlayCell key={`${r}-${c}`} state={cell} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
