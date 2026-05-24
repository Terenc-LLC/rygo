import { useState } from 'react';
import { DifficultyPicker } from './components/DifficultyPicker';
import { GameScreen } from './components/GameScreen';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import { generatePuzzle, dailySeed } from './engine/generator';
import type { GeneratedPuzzle } from './engine/generator';

type AppView = 'difficulty' | 'game';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<AppView>('difficulty');
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);

  const handleSelectDifficulty = (size: 4 | 5 | 6 | 8) => {
    setPuzzle(generatePuzzle(dailySeed(new Date()), size));
    setView('game');
  };

  return (
    <>
      <div className="fixed top-0 right-0 z-50 p-3 pt-[env(safe-area-inset-top,12px)] pr-[env(safe-area-inset-right,12px)]">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <main className="min-h-screen bg-paper dark:bg-ink pt-14 pb-8">
        {view === 'difficulty' && (
          <DifficultyPicker onSelect={handleSelectDifficulty} />
        )}
        {view === 'game' && puzzle !== null && (
          <GameScreen
            puzzle={puzzle}
            mode="daily"
            onPickDifficulty={() => setView('difficulty')}
          />
        )}
      </main>
      <footer className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
        Last shipped:{' '}
        <a
          href="https://linear.app/terenc/issue/TER-153"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          TER-153
        </a>{' '}
        — Win-state validation sweep
      </footer>
    </>
  );
}
