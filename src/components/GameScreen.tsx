import { useState, useRef, useEffect } from 'react';
import type { JSX } from 'react';
import type { GeneratedPuzzle } from '../engine/generator';
import { useGame } from '../hooks/useGame';
import { Grid } from './Grid';
import { ColorPicker } from './ColorPicker';
import { Summary } from './Summary';
import { RefThumbnail } from './RefThumbnail';
import type { InProgressBlob } from '../persistence/inProgress';
import { saveInProgress, deleteInProgress, IN_PROGRESS_KEY } from '../persistence/inProgress';
import { loadState, todayKey } from '../persistence/dailyState';
import { computeGlobalStreak } from '../persistence/stats';
import { enqueueAndSubmit } from '../persistence/submitScore';
import { getStanding } from '../backend/getStanding';
import { getDailyPar } from '../backend/getDailyPar';
import { displayedPar } from '../display/parDisplay';
import { useGameFeedback } from '../hooks/useGameFeedback';
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
  const [standing, setStanding] = useState<{ rank: number; total: number } | null>(null);
  const [dailyPar, setDailyPar] = useState<{ par: number; proven: boolean } | null>(null);
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
    const accMs = overrideAccumulatedMs ?? g.elapsedMs;
    return {
      version: 2,
      date: effectiveDayKey,
      gridSize: puzzle.gridSize,
      board: g.current,
      phase: 'playing', // always 'playing' — idle/pattern-revealed phases removed in TER-221
      activeColor: g.activeColor,
      moveCount: g.moveCount,
      patternVisible: false,
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
      const { phase } = gameRef.current;
      if (phase === 'playing') {
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

  // Fetch par at mount so it's ready in the status bar from move one.
  useEffect(() => {
    void getDailyPar(effectiveDayKey, puzzle.gridSize).then(result => setDailyPar(result));
  }, [effectiveDayKey, puzzle.gridSize]);

  // Report, submit, and read standing on daily completion exactly once.
  const { phase } = game;
  useEffect(() => {
    if (phase !== 'complete' || mode !== 'daily' || hasReportedCompletion.current) return;
    hasReportedCompletion.current = true;
    let cancelled = false;

    deleteInProgress();
    onDailyComplete?.({ moves: game.moveCount, elapsedMs: game.elapsedMs });

    const submitPromise = enqueueAndSubmit({
      grid_size: puzzle.gridSize,
      day: effectiveDayKey,
      eventLog: game.eventLog,
      moveCount: game.moveCount,
      elapsedMs: game.elapsedMs,
    });

    void getStanding(effectiveDayKey, puzzle.gridSize, game.moveCount, game.elapsedMs).then(
      result => { if (!cancelled && result) setStanding(result); },
    );

    // Corrective re-read after submit settles: own row (and any concurrent peers) are committed.
    void submitPromise
      .catch(() => {})
      .then(() => getStanding(effectiveDayKey, puzzle.gridSize, game.moveCount, game.elapsedMs))
      .then(result => { if (!cancelled && result) setStanding(result); });

    return () => { cancelled = true; };
  }, [phase, mode, onDailyComplete, puzzle.gridSize, effectiveDayKey, game.eventLog, game.moveCount, game.elapsedMs]);

  const underPar = dailyPar != null && game.moveCount < (displayedPar(dailyPar.par) ?? Infinity);
  useGameFeedback({ moveCount: game.moveCount, phase: game.phase, underPar });

  if (game.phase === 'complete') {
    const streak =
      mode === 'daily' ? computeGlobalStreak(loadState(), todayKey()).current : null;
    return (
      <div className="screen-fade">
        <Summary
          gridSize={game.gridSize}
          moveCount={game.moveCount}
          elapsedMs={game.elapsedMs}
          date={effectiveDayKey}
          mode={mode}
          streak={streak}
          standing={standing}
          dailyPar={dailyPar}
          onPlayAgain={() => {
            game.reset();
            game.resumeTimer();
          }}
          onPickDifficulty={onPickDifficulty}
        />
      </div>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Solved!</p>
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

  // ── playing phase ──────────────────────────────────────────────────────────
  const dp = displayedPar(dailyPar?.par ?? null);

  const handleRestart = () => {
    if (mode === 'daily') {
      saveInProgress({
        version: 2,
        date: effectiveDayKey,
        gridSize: puzzle.gridSize,
        board: emptyBoard(puzzle.gridSize),
        phase: 'playing',
        activeColor: null,
        moveCount: 0,
        patternVisible: false,
        accumulatedMs: game.elapsedMs,
        savedAt: Date.now(),
        eventLog: [],
      });
    }
    game.reset();
    // Timer restarts immediately — resumeTimer is a no-op if keepClock preserved a
    // running clock (daily mode); for practice it starts fresh from 0.
    game.resumeTimer();
  };

  const handleQuit = () => {
    if (mode === 'daily') {
      game.bankTime();
      saveInProgress(buildBlob());
    }
    onPickDifficulty();
  };

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-4 w-full max-w-sm mx-auto">
      {/* Header cluster: reference thumbnail + score/par/time side by side */}
      <div className="flex items-start gap-3 w-full">
        <RefThumbnail board={game.target} size={game.gridSize} />
        <div className="flex flex-col flex-1 gap-2 pt-1">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</p>
              <p className="text-2xl font-bold text-ink dark:text-paper" data-testid="score-value">
                {game.moveCount}
              </p>
            </div>
            {/* Par display slot — min-w reserves space to prevent reflow regardless of par state */}
            <div className="min-w-[4rem]" data-testid="par-slot">
              {dp !== null && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Par</p>
                  <p className="text-2xl font-bold text-ink dark:text-paper">{dp}</p>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
            <p className="text-xl font-bold text-ink dark:text-paper" data-testid="timer-value">
              {formatTime(game.elapsedMs)}
            </p>
          </div>
        </div>
      </div>

      {/* Play grid */}
      <Grid
        board={game.current}
        size={game.gridSize}
        onCellTap={(r, c) => game.placeAt(r, c)}
      />

      <ColorPicker activeColor={game.activeColor} onSelectColor={game.selectColor} />

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
