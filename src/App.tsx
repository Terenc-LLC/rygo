import { useState, useCallback } from 'react';
import { DifficultyPicker } from './components/DifficultyPicker';
import { GameScreen } from './components/GameScreen';
import { RulesScreen } from './components/RulesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StatsScreen } from './components/StatsScreen';
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
import { loadInProgress } from './persistence/inProgress';
import type { InProgressBlob } from './persistence/inProgress';

type AppView = 'difficulty' | 'game' | 'stats' | 'rules' | 'settings';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<AppView>('difficulty');
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [gameMode, setGameMode] = useState<'daily' | 'practice'>('daily');
  const [currentLevel, setCurrentLevel] = useState<4 | 5 | 6 | 8 | null>(null);
  const [dayKey, setDayKey] = useState<string>('');
  const [dailyState, setDailyState] = useState(() => loadState());
  const [resumeBlob, setResumeBlob] = useState<InProgressBlob | undefined>(undefined);

  const handleSelectDifficulty = (size: 4 | 5 | 6 | 8) => {
    const key = todayKey();
    const completed = isCompletedToday(dailyState, size, key);
    setCurrentLevel(size);
    setDayKey(key);
    const isDailyMode = !completed;
    setGameMode(isDailyMode ? 'daily' : 'practice');

    // Check for an in-progress attempt only in daily mode (practice never resumes)
    let blob: InProgressBlob | undefined = undefined;
    if (isDailyMode) {
      const loaded = loadInProgress();
      // loadInProgress already validates version and date === todayKey()
      // Also ensure gridSize matches the selected level
      if (loaded && loaded.gridSize === size) {
        blob = loaded;
      }
    }
    setResumeBlob(blob);

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
        <div key={view} className="screen-fade">
          {view === 'difficulty' && (
            <DifficultyPicker
              onSelect={handleSelectDifficulty}
              onShowStats={() => setView('stats')}
              onShowRules={() => setView('rules')}
              onShowSettings={() => setView('settings')}
              completedToday={completedToday}
            />
          )}
          {view === 'stats' && <StatsScreen onBack={() => setView('difficulty')} />}
          {view === 'rules' && <RulesScreen onBack={() => setView('difficulty')} />}
          {view === 'settings' && <SettingsScreen onBack={() => setView('difficulty')} />}
          {view === 'game' && puzzle !== null && (
            <GameScreen
              puzzle={puzzle}
              mode={gameMode}
              dayKey={dayKey}
              resume={resumeBlob}
              onPickDifficulty={() => setView('difficulty')}
              onDailyComplete={handleDailyComplete}
            />
          )}
        </div>
      </main>
    </>
  );
}
