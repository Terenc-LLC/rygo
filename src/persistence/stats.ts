import type { DailyState } from './dailyState';

export function previousDayKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  const prev = new Date(Date.UTC(year, month - 1, day - 1));
  const y = prev.getUTCFullYear();
  const m = String(prev.getUTCMonth() + 1).padStart(2, '0');
  const d = String(prev.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function nextDayKey(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, '0');
  const d = String(next.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeGlobalStreak(
  state: DailyState,
  today: string,
): { current: number; best: number } {
  const allDays = new Set<string>();
  for (const level of ['4', '5', '6', '8']) {
    for (const day of Object.keys(state.daily[level] ?? {})) {
      allDays.add(day);
    }
  }

  if (allDays.size === 0) return { current: 0, best: 0 };

  // Current streak: grace rule — today-not-done does not break the streak.
  let current = 0;
  let cursor = allDays.has(today) ? today : previousDayKey(today);
  while (allDays.has(cursor)) {
    current++;
    cursor = previousDayKey(cursor);
  }

  // Best streak: longest consecutive run in the sorted union set.
  const sorted = Array.from(allDays).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev !== null && day !== nextDayKey(prev)) {
      run = 0;
    }
    run++;
    if (run > best) best = run;
    prev = day;
  }

  return { current, best };
}

export function computeLevelSummary(
  state: DailyState,
  size: 4 | 5 | 6 | 8,
  today: string,
): {
  played: number;
  bestScore: number | null;
  averageScore: number | null;
  today: { moves: number; elapsedMs: number } | null;
} {
  const map = state.daily[String(size)] ?? {};
  const entries = Object.values(map);
  const played = entries.length;

  if (played === 0) {
    return { played: 0, bestScore: null, averageScore: null, today: null };
  }

  const bestScore = Math.min(...entries.map((e) => e.moves));
  const averageScore =
    Math.round((entries.reduce((sum, e) => sum + e.moves, 0) / played) * 10) / 10;

  const todayEntry = map[today];
  const todayResult = todayEntry
    ? { moves: todayEntry.moves, elapsedMs: todayEntry.elapsedMs }
    : null;

  return { played, bestScore, averageScore, today: todayResult };
}
