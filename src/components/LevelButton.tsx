import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { msUntilNextUtcDay } from '../persistence/dailyState';

interface LevelButtonProps {
  size: 4 | 5 | 6 | 8;
  label: string;
  onSelect: () => void;
  completedToday?: { moves: number; elapsedMs: number };
}

const SIZE_LABEL: Record<4 | 5 | 6 | 8, string> = {
  4: '4×4',
  5: '5×5',
  6: '6×6',
  8: '8×8',
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function LevelButton({ size, label, onSelect, completedToday }: LevelButtonProps): JSX.Element {
  const [countdown, setCountdown] = useState<number | null>(
    completedToday ? msUntilNextUtcDay() : null
  );

  useEffect(() => {
    if (!completedToday) return;
    setCountdown(msUntilNextUtcDay());
    const id = setInterval(() => {
      const remaining = msUntilNextUtcDay();
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(id);
  }, [completedToday]);

  if (completedToday) {
    return (
      <button
        onClick={onSelect}
        aria-label={`${label} — completed. Practice replay`}
        className="w-full py-5 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-ink dark:text-paper flex items-center justify-between active:scale-95 transition-transform duration-100"
      >
        <div className="text-left">
          <p className="text-xl font-bold">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{SIZE_LABEL[size]} grid</p>
          <p
            className="text-sm font-medium text-rygo-green mt-1"
            data-testid={`result-${size}`}
          >
            {completedToday.moves} moves · {formatTime(completedToday.elapsedMs)}
          </p>
          {countdown !== null && (
            <p
              className="text-xs text-gray-400 dark:text-gray-500 mt-0.5"
              data-testid={`countdown-${size}`}
            >
              Next puzzle in {formatCountdown(countdown)}
            </p>
          )}
        </div>
        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium" aria-hidden="true">
          Practice
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="w-full py-5 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-ink dark:text-paper flex items-center justify-between active:scale-95 transition-transform duration-100"
    >
      <div className="text-left">
        <p className="text-xl font-bold">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{SIZE_LABEL[size]} grid</p>
      </div>
      <span className="text-gray-400 dark:text-gray-500 text-2xl" aria-hidden="true">›</span>
    </button>
  );
}
