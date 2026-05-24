import { loadState, todayKey } from '../persistence/dailyState';
import { computeGlobalStreak, computeLevelSummary } from '../persistence/stats';

export interface LevelStats {
  gridSize: 4 | 5 | 6 | 8;
  played: number;
  bestScore: number | null;
  averageScore: number | null;
  today: { moves: number; elapsedMs: number } | null;
}

export interface StatsView {
  streak: { current: number; best: number };
  levels: LevelStats[];
}

export function useStats(): StatsView {
  const state = loadState();
  const today = todayKey();

  const streak = computeGlobalStreak(state, today);
  const levels: LevelStats[] = ([4, 5, 6, 8] as const).map((size) => ({
    gridSize: size,
    ...computeLevelSummary(state, size, today),
  }));

  return { streak, levels };
}
