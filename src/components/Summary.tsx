import { useState } from 'react';
import type { JSX } from 'react';
import { buildShareString } from '../share/shareString';
import { displayedPar } from '../display/parDisplay';

interface SummaryProps {
  gridSize: 4 | 5 | 6 | 8;
  moveCount: number;
  elapsedMs: number;
  date: string;
  mode: 'daily' | 'practice';
  streak: number | null;
  standing?: { rank: number; total: number } | null;
  /** Resolved daily par — available after TER-222; displayed in TER-223. */
  dailyPar?: { par: number; proven: boolean } | null;
  onPlayAgain: () => void;
  onPickDifficulty: () => void;
}

const GRID_LABEL: Record<4 | 5 | 6 | 8, string> = {
  4: 'Easy (4×4)',
  5: 'Normal (5×5)',
  6: 'Hard (6×6)',
  8: 'Extreme (8×8)',
};

const LEVEL_LABEL: Record<4 | 5 | 6 | 8, 'Easy' | 'Normal' | 'Hard' | 'Extreme'> = {
  4: 'Easy',
  5: 'Normal',
  6: 'Hard',
  8: 'Extreme',
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function Summary({
  gridSize,
  moveCount,
  elapsedMs,
  date,
  mode,
  streak,
  standing,
  dailyPar,
  onPlayAgain,
  onPickDifficulty,
}: SummaryProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const dp = displayedPar(dailyPar?.par ?? null);
  const parOutcome = dp !== null
    ? (() => {
        const delta = moveCount - dp;
        if (delta < 0) return { text: `−${Math.abs(delta)} Under par`, under: true };
        if (delta === 0) return { text: 'Even par', under: false };
        return { text: `+${delta} Over par`, under: false };
      })()
    : null;

  const shareText = buildShareString({
    date,
    gridSize,
    label: LEVEL_LABEL[gridSize],
    moves: moveCount,
    elapsedMs,
    streak,
    mode,
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // user canceled or share failed — no error UI
      }
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      setShowFallback(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-ink dark:text-paper">Puzzle Complete! 🎉</h2>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 w-full flex flex-col gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Difficulty</p>
          <p className="text-lg font-semibold text-ink dark:text-paper">{GRID_LABEL[gridSize]}</p>
        </div>
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Score</p>
            <p className="text-4xl font-bold text-ink dark:text-paper">{moveCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">moves</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
            <p className="text-4xl font-bold text-ink dark:text-paper">{formatTime(elapsedMs)}</p>
          </div>
        </div>
      </div>
      {/* Par outcome row — reserves height so layout is stable while par resolves */}
      <div className="min-h-[1.5rem] flex items-center justify-center" data-testid="par-outcome-row">
        {parOutcome !== null && (
          <p
            className={`text-sm font-medium ${parOutcome.under ? 'text-rygo-green' : 'text-ink dark:text-paper'}`}
            data-testid="par-outcome-text"
          >
            {parOutcome.text}
          </p>
        )}
      </div>
      {standing != null && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center" data-testid="standing-line">
          #{standing.rank} of {Math.max(standing.rank, standing.total)} today
        </p>
      )}
      <button
        onClick={handleShare}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
        data-testid="share-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {copied ? 'Copied!' : 'Share'}
      </button>
      {showFallback && (
        <textarea
          readOnly
          value={shareText}
          className="w-full rounded-xl p-3 text-sm bg-gray-100 dark:bg-gray-800 text-ink dark:text-paper resize-none"
          rows={5}
          data-testid="share-fallback"
        />
      )}
      <div className="flex gap-3 w-full">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 px-4 rounded-xl bg-gray-200 dark:bg-gray-700 text-ink dark:text-paper font-semibold"
        >
          Play again
        </button>
        <button
          onClick={onPickDifficulty}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold"
        >
          Change difficulty
        </button>
      </div>
    </div>
  );
}
