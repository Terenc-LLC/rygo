import type { JSX } from 'react';
import { LevelButton } from './LevelButton';

interface DifficultyPickerProps {
  onSelect: (size: 4 | 5 | 6 | 8) => void;
  onShowStats?: () => void;
  onShowRules?: () => void;
  onShowSettings?: () => void;
  completedToday?: Partial<Record<4 | 5 | 6 | 8, { moves: number; elapsedMs: number }>>;
}

const LEVELS: { size: 4 | 5 | 6 | 8; label: string }[] = [
  { size: 4, label: 'Easy' },
  { size: 5, label: 'Normal' },
  { size: 6, label: 'Hard' },
  { size: 8, label: 'Extreme' },
];

export function DifficultyPicker({ onSelect, onShowStats, onShowRules, onShowSettings, completedToday }: DifficultyPickerProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => onShowStats?.()}
          aria-label="Show stats"
          className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        </button>
        <div className="px-6">
          <img src="/rygo-lockup-light.svg" alt="RYGO" className="h-16 dark:hidden" />
          <img src="/rygo-lockup-dark.svg" alt="RYGO" className="h-16 hidden dark:block" />
        </div>
        <div className="w-10" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-center">
        Recreate the pattern. Use your memory.
      </p>
      <div className="flex flex-col gap-3 w-full">
        {LEVELS.map(({ size, label }) => (
          <LevelButton
            key={size}
            size={size}
            label={label}
            onSelect={() => onSelect(size)}
            completedToday={completedToday?.[size]}
          />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onShowRules?.()}
          aria-label="How to play"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-paper transition-colors py-1"
        >
          How to play
        </button>
        <button
          onClick={() => onShowSettings?.()}
          aria-label="Settings"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-ink dark:hover:text-paper transition-colors py-1"
        >
          Settings
        </button>
      </div>
    </div>
  );
}
