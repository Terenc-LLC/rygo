import { useState, useCallback } from 'react';
import { DifficultyPicker } from './components/DifficultyPicker';
import { GameScreen } from './components/GameScreen';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { generatePuzzle, dailySeed } from './engine/generator';
import type { GeneratedPuzzle } from './engine/generator';
import {
  loadState,
  recordDailyResult,
  isCompletedToday,
  getResult,
  todayKey,
} from './persistence/dailyState';

type AppView = 'difficulty' | 'game';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<AppView>('difficulty');
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [gameMode, setGameMode] = useState<'daily' | 'practice'>('daily');
  const [currentLevel, setCurrentLevel] = useState<4 | 5 | 6 | 8 | null>(null);
  // Day key captured at puzzle launch — travels with the session so a post-midnight
  // finish records under the day the attempt started.
  const [dayKey, setDayKey] = useState<string>('');
  const [dailyState, setDailyState] = useState(() => loadState());

  const handleSelectDifficulty = (size: 4 | 5 | 6 | 8) => {
    const key = todayKey();
    const completed = isCompletedToday(dailyState, size, key);
    setCurrentLevel(size);
    setDayKey(key);
    setGameMode(completed ? 'practice' : 'daily');
    setPuzzle(generatePuzzle(dailySeed(new Date()), size));
    setView('game');
  };

  const handleDailyComplete = useCallback(
    (result: { moves: number; elapsedMs: number }) => {
      if (currentLevel === null) return;
      recordDailyResult(currentLevel, dayKey, result);
      setDailyState(loadState());
    },
    [currentLevel, dayKey],
  );

  // Build completed-today map for DifficultyPicker using the current UTC day.
  const today = todayKey();
  const completedToday: Partial<Record<4 | 5 | 6 | 8, { moves: number; elapsedMs: number }>> = {};
  for (const size of [4, 5, 6, 8] as const) {
    const result = getResult(dailyState, size, today);
    if (result) {
      completedToday[size] = { moves: result.moves, elapsedMs: result.elapsedMs };
    }
  }

  return (
    <>
      <div className="fixed top-0 right-0 z-50 p-3 pt-[env(safe-area-inset-top,12px)] pr-[env(safe-area-inset-right,12px)]">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <main className="min-h-screen bg-paper dark:bg-ink pt-14 pb-8">
        {view === 'difficulty' && (
          <DifficultyPicker
            onSelect={handleSelectDifficulty}
            completedToday={completedToday}
          />
        )}
        {view === 'game' && puzzle !== null && (
          <GameScreen
            puzzle={puzzle}
            mode={gameMode}
            onPickDifficulty={() => setView('difficulty')}
            onDailyComplete={handleDailyComplete}
          />
        )}
      </main>
      <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
        Last shipped:{' '}
        <a
          href="https://linear.app/terenc/issue/TER-142"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          TER-142
        </a>{' '}
        — Daily play tracking + once-per-day lock
      </footer>
    </>
  );
}
