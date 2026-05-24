import type { JSX } from 'react';
import type { LevelStats } from '../hooks/useStats';

const LEVEL_LABELS: Record<4 | 5 | 6 | 8, string> = {
  4: 'Easy',
  5: 'Normal',
  6: 'Hard',
  8: 'Extreme',
};

interface StatCardProps {
  stats: LevelStats;
}

export function StatCard({ stats }: StatCardProps): JSX.Element {
  const { gridSize, played, bestScore, averageScore, today } = stats;
  const label = LEVEL_LABELS[gridSize];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 w-full">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      {played === 0 ? (
        <p className="text-sm text-ink dark:text-paper">No plays yet — try it!</p>
      ) : today !== null ? (
        <>
          <p className="text-sm font-medium text-ink dark:text-paper">
            Today: {today.moves} moves{' '}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              {today.moves <= bestScore! ? 'New best!' : `+${today.moves - bestScore!} from your best`}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Best {bestScore} · Avg {averageScore} · Played {played}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-ink dark:text-paper">
            Best {bestScore} · Avg {averageScore} · Played {played}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Not played today</p>
        </>
      )}
    </div>
  );
}
