import type { JSX } from 'react';
import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';

interface StatsScreenProps {
  onBack: () => void;
}

export function StatsScreen({ onBack }: StatsScreenProps): JSX.Element {
  const { streak, levels } = useStats();

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4 w-full max-w-sm mx-auto">
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
        <h1 className="text-base font-semibold text-ink dark:text-paper">Stats</h1>
        <div className="w-12" />
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-center">
        {streak.current === 0 ? (
          <p className="text-sm text-ink dark:text-paper">Play today to start a streak</p>
        ) : (
          <p className="text-sm font-semibold text-ink dark:text-paper">
            🔥 {streak.current}-day streak · best {streak.best}
          </p>
        )}
      </div>

      {levels.map((levelStats) => (
        <StatCard key={levelStats.gridSize} stats={levelStats} />
      ))}
    </div>
  );
}
