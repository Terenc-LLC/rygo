import type { GameEvent } from '../_shared/engine/types.ts';
import { generatePuzzle, dailySeed } from '../_shared/engine/generator.ts';
import { replayEventLog } from '../_shared/engine/replay.ts';

export const MAX_EVENTS = 2000;
export const ELAPSED_FLOOR_MS = 1500;
export const ELAPSED_CEILING_MS = 7_200_000;
// Floor date for accepted submissions. Chris confirms the actual launch date at deploy.
export const LAUNCH_DAY = '2026-05-25';

export type GridSize = 4 | 5 | 6 | 8;

export interface SubmitPayload {
  grid_size: GridSize;
  day: string;
  eventLog: GameEvent[];
  moveCount: number;
  elapsedMs: number;
}

export type ValidationResult =
  | { accepted: true }
  | { accepted: false; reason: string };

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

function isValidGameEvent(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const ev = e as Record<string, unknown>;
  switch (ev.type) {
    case 'select':
      return (
        typeof ev.color === 'string' &&
        (ev.color === 'red' || ev.color === 'yellow' || ev.color === 'green')
      );
    case 'reveal':
    case 'hide':
      return true;
    case 'tap':
      return (
        typeof ev.row === 'number' &&
        Number.isInteger(ev.row) &&
        ev.row >= 0 &&
        typeof ev.col === 'number' &&
        Number.isInteger(ev.col) &&
        ev.col >= 0
      );
    default:
      return false;
  }
}

// Validates and parses the raw request body. Throws BadRequestError on malformed input.
export function parsePayload(body: unknown): SubmitPayload {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestError('Body must be a JSON object');
  }
  const b = body as Record<string, unknown>;

  // grid_size
  const { grid_size, day, eventLog, moveCount, elapsedMs } = b;
  if (grid_size !== 4 && grid_size !== 5 && grid_size !== 6 && grid_size !== 8) {
    throw new BadRequestError('grid_size must be 4, 5, 6, or 8');
  }

  // day — format check
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new BadRequestError('day must be a YYYY-MM-DD string');
  }
  // Calendar validity via round-trip (catches 2026-02-30 etc.)
  const dt = new Date(`${day}T00:00:00Z`);
  if (isNaN(dt.getTime())) {
    throw new BadRequestError('day is not a valid date');
  }
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  if (`${y}-${m}-${d}` !== day) {
    throw new BadRequestError('day is not a valid calendar date');
  }

  // eventLog
  if (!Array.isArray(eventLog)) {
    throw new BadRequestError('eventLog must be an array');
  }
  for (const event of eventLog) {
    if (!isValidGameEvent(event)) {
      throw new BadRequestError('eventLog contains an invalid event');
    }
    // Bounds-check tap coordinates against the parsed grid_size.
    // isValidGameEvent only checks non-negative integers; an out-of-bounds tap
    // would reach applyMove/applyClear and throw a RangeError (→ 500), which is
    // retryable. It must be a terminal 400 instead.
    const ev = event as Record<string, unknown>;
    if (ev.type === 'tap') {
      if ((ev.row as number) >= grid_size || (ev.col as number) >= grid_size) {
        throw new BadRequestError(
          `tap event out of bounds for grid_size ${grid_size}`,
        );
      }
    }
  }

  // moveCount
  if (typeof moveCount !== 'number' || !Number.isInteger(moveCount) || moveCount < 0) {
    throw new BadRequestError('moveCount must be a non-negative integer');
  }

  // elapsedMs
  if (typeof elapsedMs !== 'number' || !Number.isInteger(elapsedMs) || elapsedMs < 0) {
    throw new BadRequestError('elapsedMs must be a non-negative integer');
  }

  return {
    grid_size: grid_size as GridSize,
    day,
    eventLog: eventLog as GameEvent[],
    moveCount,
    elapsedMs,
  };
}

// Pure validation pipeline: day bounds → eventLog cap → replay → elapsed bounds.
// Throws BadRequestError only for future day (security-relevant 400).
// Returns ValidationResult for all other accept/reject outcomes.
export function validateSubmission(
  payload: SubmitPayload,
  serverToday: string,
): ValidationResult {
  const { grid_size, day, eventLog, moveCount, elapsedMs } = payload;

  // Step 4: day bounds — future day is a hard 400 (prevents future board seeding)
  if (day > serverToday) {
    throw new BadRequestError(`day ${day} is in the future (server today: ${serverToday})`);
  }
  // Before launch floor → validation reject
  if (day < LAUNCH_DAY) {
    return { accepted: false, reason: `day ${day} is before launch floor (${LAUNCH_DAY})` };
  }

  // Step 5: eventLog cap
  if (eventLog.length > MAX_EVENTS) {
    return {
      accepted: false,
      reason: `eventLog length ${eventLog.length} exceeds cap ${MAX_EVENTS}`,
    };
  }

  // Step 6: replay
  const puzzle = generatePuzzle(dailySeed(new Date(`${day}T00:00:00Z`)), grid_size);
  const { board: finalBoard, moveCount: replayMoveCount } = replayEventLog(puzzle, eventLog);

  // Board must match target exactly
  const target = puzzle.target;
  for (let r = 0; r < target.length; r++) {
    for (let c = 0; c < target[r].length; c++) {
      if (finalBoard[r][c] !== target[r][c]) {
        return { accepted: false, reason: 'board does not match target after replay' };
      }
    }
  }

  // Claimed moveCount must match server-recomputed count
  if (replayMoveCount !== moveCount) {
    return {
      accepted: false,
      reason: `moveCount mismatch: claimed ${moveCount}, computed ${replayMoveCount}`,
    };
  }

  // Step 7: elapsedMs bounds — reject, do NOT clamp
  if (elapsedMs < ELAPSED_FLOOR_MS) {
    return {
      accepted: false,
      reason: `elapsedMs ${elapsedMs} is below floor ${ELAPSED_FLOOR_MS}`,
    };
  }
  if (elapsedMs > ELAPSED_CEILING_MS) {
    return {
      accepted: false,
      reason: `elapsedMs ${elapsedMs} exceeds ceiling ${ELAPSED_CEILING_MS}`,
    };
  }

  return { accepted: true };
}
