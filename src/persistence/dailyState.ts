const STORAGE_KEY = 'rygo:state';
const CURRENT_VERSION = 1;

export type GridSize = 4 | 5 | 6 | 8;

export interface DailyResult {
  moves: number;
  elapsedMs: number;
  completedAt: number;
}

export interface DailyState {
  version: number;
  daily: {
    [level: string]: {
      [day: string]: DailyResult;
    };
  };
}

function emptyState(): DailyState {
  return {
    version: CURRENT_VERSION,
    daily: { '4': {}, '5': {}, '6': {}, '8': {} },
  };
}

/** UTC YYYY-MM-DD for the given date (defaults to now). Shared with dailySeed. */
export function todayKey(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Load and validate rygo:state from localStorage. Returns empty state on any error. */
export function loadState(): DailyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyState();
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).version !== 'number'
    ) {
      return emptyState();
    }
    const { version } = parsed as { version: number };
    // Treat a future schema version as unreadable — degrade to empty.
    if (version > CURRENT_VERSION) return emptyState();
    const state = parsed as DailyState;
    if (typeof state.daily !== 'object' || state.daily === null) {
      state.daily = {};
    }
    // Ensure all known grid-size keys exist so callers never hit undefined.
    for (const level of ['4', '5', '6', '8']) {
      if (typeof state.daily[level] !== 'object' || state.daily[level] === null) {
        state.daily[level] = {};
      }
    }
    return state;
  } catch {
    return emptyState();
  }
}

function saveState(state: DailyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable or quota exceeded — silent no-op.
  }
}

/** True if the given level has a completion record for the given UTC day. */
export function isCompletedToday(state: DailyState, level: GridSize, day: string): boolean {
  return !!(state.daily[String(level)]?.[day]);
}

/** Returns the stored result for (level, day), or null if none. */
export function getResult(state: DailyState, level: GridSize, day: string): DailyResult | null {
  return state.daily[String(level)]?.[day] ?? null;
}

/**
 * Record a daily result under (level, day). First-write-wins — a second call
 * for the same (level, day) is silently ignored. localStorage errors no-op.
 */
export function recordDailyResult(
  level: GridSize,
  day: string,
  result: { moves: number; elapsedMs: number },
): void {
  try {
    const state = loadState();
    // Never write to a schema version we don't understand.
    if (state.version > CURRENT_VERSION) return;
    const key = String(level);
    if (!state.daily[key]) state.daily[key] = {};
    if (!state.daily[key][day]) {
      state.daily[key][day] = {
        moves: result.moves,
        elapsedMs: result.elapsedMs,
        completedAt: Date.now(),
      };
      saveState(state);
    }
  } catch {
    // Silent no-op.
  }
}

/** Milliseconds until the next UTC midnight from the given timestamp (defaults to now). */
export function msUntilNextUtcDay(now?: number): number {
  const ms = now ?? Date.now();
  const d = new Date(ms);
  const nextMidnight = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + 1,
  );
  return nextMidnight - ms;
}
