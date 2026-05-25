import type { Board, Color, GameEvent } from '../engine/types';
import { todayKey } from './dailyState';

export const IN_PROGRESS_KEY = 'rygo:inprogress';
const CURRENT_VERSION = 2;

export type InProgressPhase = 'idle' | 'pattern-revealed' | 'playing';

export interface InProgressBlob {
  version: 2;
  date: string;
  gridSize: 4 | 5 | 6 | 8;
  board: Board;
  phase: InProgressPhase;
  activeColor: Color | null;
  moveCount: number;
  patternVisible: boolean;
  accumulatedMs: number;
  savedAt: number;
  eventLog: GameEvent[];
}

/** Load the in-progress blob. Returns null if absent, stale (wrong day), corrupt, or version > 2.
 *  A v1 blob (no eventLog field) is loaded safely with eventLog defaulting to []. */
export function loadInProgress(): InProgressBlob | null {
  try {
    const raw = localStorage.getItem(IN_PROGRESS_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).version !== 'number'
    ) {
      return null;
    }
    const blob = parsed as Record<string, unknown>;
    const version = blob.version as number;
    if (version > CURRENT_VERSION) return null;
    if (blob.date !== todayKey()) return null;
    // Basic shape validation
    if (
      !blob.board ||
      !Array.isArray(blob.board) ||
      typeof blob.moveCount !== 'number' ||
      typeof blob.accumulatedMs !== 'number'
    ) {
      return null;
    }
    // Normalize: v1 blobs lack eventLog — default to [].
    const eventLog: GameEvent[] = Array.isArray(blob.eventLog) ? blob.eventLog as GameEvent[] : [];
    return { ...(blob as unknown as InProgressBlob), version: 2, eventLog };
  } catch {
    return null;
  }
}

/** Persist the in-progress blob. Silent on localStorage errors. */
export function saveInProgress(blob: InProgressBlob): void {
  try {
    localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(blob));
  } catch {
    // localStorage unavailable or quota exceeded — silent no-op.
  }
}

/** Delete the in-progress blob (called on completion). Silent on errors. */
export function deleteInProgress(): void {
  try {
    localStorage.removeItem(IN_PROGRESS_KEY);
  } catch {
    // Silent no-op.
  }
}
