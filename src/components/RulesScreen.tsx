import type { JSX } from 'react';
import { Square, Triangle, Circle } from './Shapes';

interface RulesScreenProps {
  onBack: () => void;
}

type Cell = 'empty' | 'red' | 'yellow' | 'green';

const BG: Record<Cell, string> = {
  empty: 'bg-stone-300 dark:bg-gray-800',
  red: 'bg-rygo-red',
  yellow: 'bg-rygo-yellow',
  green: 'bg-rygo-green',
};

const SHAPE_TEXT: Record<Cell, string> = {
  empty: '',
  red: 'text-paper',
  yellow: 'text-ink',
  green: 'text-paper',
};

const CELL_LABEL: Record<Cell, string> = {
  empty: 'Empty',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
};

function CellShape({ state }: { state: Cell }) {
  const cls = `w-1/2 aspect-square ${SHAPE_TEXT[state]}`;
  if (state === 'red') return <Square className={cls} />;
  if (state === 'yellow') return <Triangle className={cls} />;
  if (state === 'green') return <Circle className={cls} />;
  return null;
}

function MiniCell({ state, row, col }: { state: Cell; row: number; col: number }) {
  return (
    <div
      role="img"
      aria-label={`${CELL_LABEL[state]} cell at row ${row}, column ${col}`}
      className={`aspect-square rounded-sm flex items-center justify-center ${BG[state]}`}
    >
      <CellShape state={state} />
    </div>
  );
}

function MiniGrid({ board, testId }: { board: Cell[][]; testId?: string }) {
  const cols = board[0]?.length ?? 0;
  return (
    <div
      data-testid={testId}
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {board.map((row, rowIdx) =>
        row.map((state, colIdx) => (
          <MiniCell
            key={`${rowIdx}-${colIdx}`}
            state={state}
            row={rowIdx + 1}
            col={colIdx + 1}
          />
        ))
      )}
    </div>
  );
}

function ColorEntry({
  color,
  name,
  shape,
  reach,
}: {
  color: Cell;
  name: string;
  shape: string;
  reach: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-11 flex-none">
        <MiniCell state={color} row={1} col={1} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink dark:text-paper">
          {name} — {shape}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{reach}</p>
      </div>
    </div>
  );
}

const BLOCKING_BEFORE: Cell[][] = [
  ['empty', 'empty', 'empty', 'empty'],
  ['empty', 'red', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty'],
];

const BLOCKING_AFTER: Cell[][] = [
  ['green', 'empty', 'empty', 'empty'],
  ['green', 'red', 'empty', 'empty'],
  ['green', 'empty', 'empty', 'empty'],
  ['green', 'empty', 'empty', 'empty'],
];

export function RulesScreen({ onBack }: RulesScreenProps): JSX.Element {
  return (
    <div
      className="flex flex-col gap-6 px-4 py-4 w-full max-w-sm mx-auto"
      data-testid="rules-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onBack}
          aria-label="Back to difficulty picker"
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-paper transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1 className="text-base font-semibold text-ink dark:text-paper">How to play</h1>
        <div className="w-12" />
      </div>

      {/* Goal */}
      <section aria-labelledby="rules-goal-heading" data-testid="rules-goal">
        <h2
          id="rules-goal-heading"
          className="text-sm font-semibold text-ink dark:text-paper mb-1"
        >
          Goal
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Recreate the target pattern using the fewest moves. Moves are your score — time is the
          tiebreaker.
        </p>
      </section>

      {/* Three colors */}
      <section aria-labelledby="rules-colors-heading" data-testid="rules-colors">
        <h2
          id="rules-colors-heading"
          className="text-sm font-semibold text-ink dark:text-paper mb-3"
        >
          The three colors
        </h2>
        <div className="flex flex-col gap-3">
          <ColorEntry
            color="red"
            name="Red"
            shape="Square"
            reach="Fills only the cell you tap — 1 cell."
          />
          <ColorEntry
            color="yellow"
            name="Yellow"
            shape="Triangle"
            reach="Fills the tapped cell plus the four orthogonally adjacent cells (plus shape)."
          />
          <ColorEntry
            color="green"
            name="Green"
            shape="Circle"
            reach="Spreads outward in all four directions until it hits an occupied cell or the grid edge."
          />
        </div>
      </section>

      {/* Green blocking */}
      <section aria-labelledby="rules-blocking-heading" data-testid="rules-blocking">
        <h2
          id="rules-blocking-heading"
          className="text-sm font-semibold text-ink dark:text-paper mb-2"
        >
          Green blocking
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Any occupied cell stops green from spreading further in that direction. Cells beyond the
          blocker are not filled.
        </p>
        <div className="flex items-center gap-3" data-testid="blocking-diagram">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">Red placed</p>
            <MiniGrid board={BLOCKING_BEFORE} testId="blocking-diagram-before" />
          </div>
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 text-gray-400 flex-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
              Green placed left of red
            </p>
            <MiniGrid board={BLOCKING_AFTER} testId="blocking-diagram-after" />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Green spreads freely up and down the column, but the red cell stops it from going right —
          columns 3 and 4 in that row stay empty.
        </p>
      </section>

      {/* Overwrite hierarchy */}
      <section aria-labelledby="rules-overwrite-heading" data-testid="rules-overwrite">
        <h2
          id="rules-overwrite-heading"
          className="text-sm font-semibold text-ink dark:text-paper mb-2"
        >
          Overwrite hierarchy
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Red dominates everything. Yellow only beats green. Green only fills empty cells.
        </p>
        <div className="overflow-x-auto" data-testid="overwrite-table">
          <table
            className="w-full text-xs border-collapse"
            aria-label="Overwrite hierarchy: what each color can overwrite"
          >
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th scope="col" className="text-left py-1.5 pr-2 font-normal">
                  Placing ↓
                </th>
                <th scope="col" className="px-2 py-1.5 font-normal text-center">
                  Empty
                </th>
                <th scope="col" className="px-2 py-1.5 font-normal text-center">
                  Green
                </th>
                <th scope="col" className="px-2 py-1.5 font-normal text-center">
                  Yellow
                </th>
                <th scope="col" className="px-2 py-1.5 font-normal text-center">
                  Red
                </th>
              </tr>
            </thead>
            <tbody className="text-ink dark:text-paper">
              {(
                [
                  { name: 'Red', results: ['✅', '✅', '✅', '✅'] },
                  { name: 'Yellow', results: ['✅', '✅', '❌', '❌'] },
                  { name: 'Green', results: ['✅', '❌', '❌', '❌'] },
                ] as const
              ).map(({ name, results }) => (
                <tr key={name} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <th scope="row" className="text-left py-1.5 pr-2 font-semibold">
                    {name}
                  </th>
                  {results.map((r, i) => (
                    <td
                      key={i}
                      className="px-2 py-1.5 text-center"
                      aria-label={r === '✅' ? 'fills or overwrites' : 'no effect'}
                    >
                      {r}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Clearing */}
      <section aria-labelledby="rules-clearing-heading" data-testid="rules-clearing">
        <h2
          id="rules-clearing-heading"
          className="text-sm font-semibold text-ink dark:text-paper mb-1"
        >
          Clearing
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Tap a cell that already holds the{' '}
          <strong className="text-ink dark:text-paper">active color</strong> to clear it. Clearing
          follows the same reach and blocking rules as placement, but only removes cells of that
          color — other colors in the reach area stay untouched.
        </p>
      </section>

      {/* Scoring */}
      <section aria-labelledby="rules-scoring-heading" data-testid="rules-scoring">
        <h2
          id="rules-scoring-heading"
          className="text-sm font-semibold text-ink dark:text-paper mb-2"
        >
          Scoring
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Every meaningful action costs{' '}
          <strong className="text-ink dark:text-paper">+1 move</strong>. Your total moves are your
          score — lower is better.
        </p>
        <ul className="text-sm space-y-1.5">
          {(
            [
              { cost: '+1', desc: 'Placing a color (on an empty cell or a different color)' },
              { cost: '+1', desc: 'Clearing a cell (tap active color on a matching cell)' },
              { cost: '+1', desc: 'Switching to a different color in the picker' },
              { cost: '+1', desc: 'Re-revealing the pattern (after the first look)' },
              { cost: '+1', desc: 'Hiding the pattern to return to your board' },
              { cost: 'Free', desc: 'First reveal — the only free action' },
              { cost: '0', desc: 'Tapping the already-active color in the picker' },
            ] as const
          ).map(({ cost, desc }) => (
            <li key={desc} className="flex items-start gap-2">
              <span className="text-ink dark:text-paper font-semibold flex-none w-8">{cost}</span>
              <span className="text-gray-600 dark:text-gray-300">{desc}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
