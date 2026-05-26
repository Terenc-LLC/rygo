import { useState, useRef, useEffect } from 'react';
import type { JSX } from 'react';
import type { GeneratedPuzzle } from '../engine/generator';
import { useGame } from '../hooks/useGame';
import { Grid } from './Grid';
import { ColorPicker } from './ColorPicker';
import { Summary } from './Summary';
import type { InProgressBlob } from '../persistence/inProgress';
import { saveInProgress, deleteInProgress, IN_PROGRESS_KEY } from '../persistence/inProgress';
import { loadState, todayKey } from '../persistence/dailyState';
import { computeGlobalStreak } from '../persistence/stats';
import { enqueueAndSubmit } from '../persistence/submitScore';
import type { Board } from '../engine/types';

interface GameScreenProps {
  puzzle: GeneratedPuzzle;
  mode?: 'daily' | 'practice';
  dayKey?: string;
  resume?: InProgressBlob;
  onPickDifficulty: () => void;
  onDailyComplete?: (result: { moves: number; elapsedMs: number }) => void;
}

// Total sweep budget in ms; per-row delay = SWEEP_MS / rowCount.
const SWEEP_MS = 850;

// Grid-cols Tailwind class per size — used for the glow overlay grid.
const GRID_COLS_CLASS: Record<4 | 5 | 6 | 8, string> = {
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  8: 'grid-cols-8',
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<'empty'>(size).fill('empty'));
}

const PHASE_LABEL: Record<string, string> = {
  idle: 'Tap to reveal',
  'pattern-revealed': 'Memorize the pattern',
  playing: 'Place colors to match',
  validating: 'Solved!',
  complete: '',
};

export function GameScreen({
  puzzle,
  mode = 'daily',
  dayKey,
  resume,
  onPickDifficulty,
  onDailyComplete,
}: GameScreenProps): JSX.Element {
  const game = useGame(puzzle, {
    resume: mode === 'daily' ? resume : undefined,
    keepClockOnReset: mode === 'daily',
  });
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const hasReportedCompletion = useRef(false);

  // Stable ref to game so event handlers always see the latest state.
  const gameRef = useRef(game);
  gameRef.current = game;

  const effectiveDayKey = dayKey ?? todayKey();

  // Build the in-progress blob from current game state (called at save points).
  const buildBlob = (overrideAccumulatedMs?: number): InProgressBlob => {
    const g = gameRef.current;
    // Use provided override (e.g. pre-computed before a reset), else use elapsedMs
    // which is within 100ms of the real banked value (last TICK).
    const accMs = overrideAccumulatedMs ?? g.elapsedMs;
    return {
      version: 2,
      date: effectiveDayKey,
      gridSize: puzzle.gridSize,
      board: g.current,
      phase: (g.phase === 'idle' || g.phase === 'pattern-revealed' || g.phase === 'playing')
        ? g.phase
        : 'playing',
      activeColor: g.activeColor,
      moveCount: g.moveCount,
      patternVisible: g.phase === 'pattern-revealed',
      accumulatedMs: accMs,
      savedAt: Date.now(),
      eventLog: g.eventLog,
    };
  };

  // Page-lifecycle: bank + persist on hidden/pagehide, resume on visible.
  useEffect(() => {
    if (mode !== 'daily') return;

    const handleHide = () => {
      gameRef.current.bankTime();
      // Only persist in phases where the attempt is still in progress.
      // Skipping 'validating' (solved but not yet tapped) and 'complete' prevents
      // writing a solved-board blob that would strand the user on resume with no
      // way to submit the result. bankTime above is a no-op in those phases
      // (runStartedAt is already null post-freeze), so it's always safe to call.
      const { phase } = gameRef.current;
      if (phase === 'idle' || phase === 'pattern-revealed' || phase === 'playing') {
        saveInProgress(buildBlob());
      }
    };

    const handleShow = () => {
      gameRef.current.resumeTimer();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleHide();
      } else {
        handleShow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Report and submit daily completion exactly once when phase first becomes 'complete'.
  const { phase } = game;
  useEffect(() => {
    if (phase === 'complete' && mode === 'daily' && !hasReportedCompletion.current) {
      hasReportedCompletion.current = true;
      deleteInProgress();
      onDailyComplete?.({ moves: game.moveCount, elapsedMs: game.elapsedMs });
      void enqueueAndSubmit({
        grid_size: puzzle.gridSize,
        day: effectiveDayKey,
        eventLog: game.eventLog,
        moveCount: game.moveCount,
        elapsedMs: game.elapsedMs,
      });
    }
  }, [phase, mode, onDailyComplete, puzzle.gridSize, effectiveDayKey, game.eventLog, game.moveCount, game.elapsedMs]);

  if (game.phase === 'complete') {
    const streak =
      mode === 'daily' ? computeGlobalStreak(loadState(), todayKey()).current : null;
    return (
      <Summary
        gridSize={game.gridSize}
        moveCount={game.moveCount}
        elapsedMs={game.elapsedMs}
        date={effectiveDayKey}
        mode={mode}
        streak={streak}
        onPlayAgain={game.reset}
        onPickDifficulty={onPickDifficulty}
      />
    );
  }

  if (game.phase === 'validating') {
    const perRowDelay = SWEEP_MS / game.gridSize;
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-4 w-full max-w-sm mx-auto">
        <div className="flex items-center justify-between w-full px-1 py-2">
          <div className="text-center min-w-16">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</p>
            <p className="text-2xl font-bold text-ink dark:text-paper" data-testid="score-value">
              {game.moveCount}
            </p>
          </div>
          <div className="text-center flex-1 px-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">{PHASE_LABEL['validating']}</p>
          </div>
          <div className="text-center min-w-16">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
            <p className="text-2xl font-bold text-ink dark:text-paper" data-testid="timer-value">
              {formatTime(game.elapsedMs)}
            </p>
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          Solved! Puzzle complete.
        </div>

        <div className="relative w-full">
          <Grid board={game.current} size={game.gridSize} />
          {!prefersReducedMotion.current && (
            <div
              className={`absolute inset-0 grid ${GRID_COLS_CLASS[game.gridSize]} gap-1 pointer-events-none`}
            >
              {Array.from({ length: game.gridSize }, (_, rowIdx) =>
                Array.from({ length: game.gridSize }, (_, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="aspect-square rounded-md"
                    style={{
                      animationName: 'rowGlow',
                      animationDuration: '350ms',
                      animationDelay: `${rowIdx * perRowDelay}ms`,
                      animationFillMode: 'both',
                      animationTimingFunction: 'ease-in-out',
                      boxShadow: 'inset 0 0 0 3px #2E9D5C',
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={game.completeValidation}
          className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-ink dark:text-paper font-semibold active:scale-95 transition-transform duration-100"
          aria-label="Continue to summary"
        >
          Tap to continue
        </button>
      </div>
    );
  }

  const clearTransitionTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTransition = (action: () => void) => {
    clearTransitionTimer();
    setTransitioning(true);
    action();
    timerRef.current = window.setTimeout(() => {
      setTransitioning(false);
      timerRef.current = null;
    }, 1000);
  };

  const handleRevealToggle = () => {
    if (game.phase === 'idle' || game.phase === 'playing') {
      startTransition(game.revealPattern);
    } else if (game.phase === 'pattern-revealed') {
      startTransition(game.hidePattern);
    }
  };

  const handleRestart = () => {
    clearTransitionTimer();
    setTransitioning(false);
    if (mode === 'daily') {
      // Save in-progress with the cleared board state. The clock is kept by RESET (keepClock=true).
      // We construct the blob manually since the reducer hasn't updated yet.
      saveInProgress({
        version: 2,
        date: effectiveDayKey,
        gridSize: puzzle.gridSize,
        board: emptyBoard(puzzle.gridSize),
        phase: 'idle',
        activeColor: null,
        moveCount: 0,
        patternVisible: false,
        accumulatedMs: game.elapsedMs, // within 100ms of real banked value
        savedAt: Date.now(),
        eventLog: [], // RESET clears the log; post-reset blob starts fresh
      });
    }
    game.reset();
  };

  const handleQuit = () => {
    clearTransitionTimer();
    if (mode === 'daily') {
      // Bank time and persist before navigating away.
      game.bankTime();
      saveInProgress(buildBlob());
    }
    onPickDifficulty();
  };

  const isPlaying = game.phase === 'playing';

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between w-full px-1 py-2">
        <div className="text-center min-w-16">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</p>
          <p className="text-2xl font-bold text-ink dark:text-paper" data-testid="score-value">
            {game.moveCount}
          </p>
        </div>
        <div className="text-center flex-1 px-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">{PHASE_LABEL[game.phase]}</p>
        </div>
        <div className="text-center min-w-16">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
          <p className="text-2xl font-bold text-ink dark:text-paper" data-testid="timer-value">
            {formatTime(game.elapsedMs)}
          </p>
        </div>
      </div>

      <div className="w-full">
        {transitioning ? (
          <div className="flex items-center justify-center h-48">
            <p
              className="text-lg text-gray-500 dark:text-gray-400"
              data-testid="transition-blank"
            >
              Get ready...
            </p>
          </div>
        ) : game.patternVisible ? (
          <Grid board={game.target} size={game.gridSize} />
        ) : (
          <Grid
            board={game.current}
            size={game.gridSize}
            onCellTap={isPlaying ? (r, c) => game.placeAt(r, c) : undefined}
          />
        )}
      </div>

      <button
        onClick={handleRevealToggle}
        className="w-full py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-ink dark:text-paper font-semibold active:scale-95 transition-transform duration-100"
      >
        {game.patternVisible ? 'Hide / Start Solving' : 'Reveal Pattern'}
      </button>

      {!game.patternVisible && (
        <ColorPicker activeColor={game.activeColor} onSelectColor={game.selectColor} />
      )}

      <div className="flex gap-3 mt-1">
        <button
          onClick={handleRestart}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-ink dark:text-paper text-sm font-medium active:scale-95 transition-transform duration-100"
        >
          Restart
        </button>
        <button
          onClick={handleQuit}
          className="text-sm text-gray-400 dark:text-gray-500 underline"
        >
          Quit
        </button>
      </div>
    </div>
  );
}

// Re-export for tests that need to inspect localStorage key.
export { IN_PROGRESS_KEY };
