import {
  BadRequestError,
  ELAPSED_CEILING_MS,
  ELAPSED_FLOOR_MS,
  LAUNCH_DAY,
  MAX_EVENTS,
  parsePayload,
  validateSubmission,
} from './validate.ts';
import { generatePuzzle, dailySeed } from '../_shared/engine/generator.ts';
import { replayEventLog } from '../_shared/engine/replay.ts';
import type { GameEvent } from '../_shared/engine/types.ts';

// ── Assertion helpers (no external deps) ────────────────────────────────────

function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(msg ?? `\nExpected: ${e}\n  Actual: ${a}`);
  }
}

function assertThrowsBadRequest(fn: () => void, msgIncludes?: string): void {
  try {
    fn();
    throw new Error('Expected BadRequestError to be thrown');
  } catch (err) {
    if (!(err instanceof BadRequestError)) {
      throw new Error(`Expected BadRequestError but got: ${err}`);
    }
    if (msgIncludes && !(err as Error).message.toLowerCase().includes(msgIncludes.toLowerCase())) {
      throw new Error(
        `Expected error message to include "${msgIncludes}", got: "${(err as Error).message}"`,
      );
    }
  }
}

// ── Event-log builder from generator solution ────────────────────────────────

type SolutionMove = { color: 'red' | 'yellow' | 'green'; row: number; col: number };

function solutionToEventLog(solution: SolutionMove[]): GameEvent[] {
  const events: GameEvent[] = [];
  let activeColor: string | null = null;
  for (const move of solution) {
    if (move.color !== activeColor) {
      events.push({ type: 'select', color: move.color });
      activeColor = move.color;
    }
    events.push({ type: 'tap', row: move.row, col: move.col });
  }
  return events;
}

// Build a known-good payload from the generator solution for a given seed/size.
function goodPayload(
  seed: string,
  gridSize: 4 | 5 | 6 | 8,
  elapsedMs = ELAPSED_FLOOR_MS + 1000,
): {
  grid_size: 4 | 5 | 6 | 8;
  day: string;
  eventLog: GameEvent[];
  moveCount: number;
  elapsedMs: number;
} {
  const puzzle = generatePuzzle(seed, gridSize);
  const eventLog = solutionToEventLog(puzzle.solution as SolutionMove[]);
  const { moveCount } = replayEventLog(puzzle, eventLog);
  // Extract YYYY-MM-DD from the seed ("RYGO-2026-05-25" → "2026-05-25")
  const day = seed.slice(5); // works for our daily seeds
  return { grid_size: gridSize, day, eventLog, moveCount, elapsedMs };
}

// ── parsePayload tests ────────────────────────────────────────────────────────

Deno.test('parsePayload: valid payload parses successfully', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4);
  const parsed = parsePayload(raw);
  assertEquals(parsed.grid_size, 4);
  assertEquals(parsed.day, '2026-05-25');
});

Deno.test('parsePayload: rejects non-object body', () => {
  assertThrowsBadRequest(() => parsePayload('string'), 'JSON object');
  assertThrowsBadRequest(() => parsePayload(42), 'JSON object');
  assertThrowsBadRequest(() => parsePayload([]), 'JSON object');
  assertThrowsBadRequest(() => parsePayload(null), 'JSON object');
});

Deno.test('parsePayload: rejects invalid grid_size', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(() => parsePayload({ ...raw, grid_size: 7 }), 'grid_size');
  assertThrowsBadRequest(() => parsePayload({ ...raw, grid_size: 'four' }), 'grid_size');
  assertThrowsBadRequest(() => parsePayload({ ...raw, grid_size: null }), 'grid_size');
});

Deno.test('parsePayload: rejects invalid day format', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(() => parsePayload({ ...raw, day: '25-05-2026' }), 'YYYY-MM-DD');
  assertThrowsBadRequest(() => parsePayload({ ...raw, day: 'today' }), 'YYYY-MM-DD');
  assertThrowsBadRequest(() => parsePayload({ ...raw, day: 20260525 }), 'YYYY-MM-DD');
});

Deno.test('parsePayload: rejects invalid calendar date (overflow)', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  // 2026-02-30 does not exist — JS parses it as 2026-03-02, round-trip catches it
  assertThrowsBadRequest(() => parsePayload({ ...raw, day: '2026-02-30' }), 'calendar');
});

Deno.test('parsePayload: rejects missing fields', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(() => parsePayload({ ...raw, eventLog: undefined }), 'array');
  assertThrowsBadRequest(() => parsePayload({ ...raw, moveCount: undefined }), 'non-negative integer');
  assertThrowsBadRequest(() => parsePayload({ ...raw, elapsedMs: undefined }), 'non-negative integer');
});

Deno.test('parsePayload: rejects negative moveCount', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(() => parsePayload({ ...raw, moveCount: -1 }), 'non-negative integer');
});

Deno.test('parsePayload: rejects non-integer moveCount', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(() => parsePayload({ ...raw, moveCount: 3.5 }), 'non-negative integer');
});

Deno.test('parsePayload: rejects negative elapsedMs', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(() => parsePayload({ ...raw, elapsedMs: -100 }), 'non-negative integer');
});

Deno.test('parsePayload: rejects eventLog with unknown event type', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(
    () => parsePayload({ ...raw, eventLog: [{ type: 'unknown' }] }),
    'invalid event',
  );
});

Deno.test('parsePayload: rejects eventLog with malformed tap (missing row)', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(
    () => parsePayload({ ...raw, eventLog: [{ type: 'tap', col: 0 }] }),
    'invalid event',
  );
});

Deno.test('parsePayload: rejects eventLog with malformed select (bad color)', () => {
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(
    () => parsePayload({ ...raw, eventLog: [{ type: 'select', color: 'blue' }] }),
    'invalid event',
  );
});

Deno.test('parsePayload: rejects tap with row >= grid_size', () => {
  // grid_size=4, so row=4 is out of bounds (valid rows: 0–3)
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(
    () => parsePayload({ ...raw, eventLog: [{ type: 'tap', row: 4, col: 0 }] }),
    'out of bounds',
  );
});

Deno.test('parsePayload: rejects tap with col >= grid_size', () => {
  // grid_size=4, so col=4 is out of bounds (valid cols: 0–3)
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  assertThrowsBadRequest(
    () => parsePayload({ ...raw, eventLog: [{ type: 'tap', row: 0, col: 4 }] }),
    'out of bounds',
  );
});

// ── validateSubmission tests ─────────────────────────────────────────────────

// Accept tests use 4×4 and 5×5 where the generator's solution can be used directly
// as an event log (small boards rarely produce same-color-on-same-color moves that would
// diverge between applyMove and applyEvent semantics). Correctness for 6×6 and 8×8 is
// covered by the generator-parity test (parity.test.ts).
Deno.test('validateSubmission: accepts a correct 4×4 replay', () => {
  const payload = parsePayload(goodPayload('RYGO-2026-05-25', 4));
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result, { accepted: true });
});

Deno.test('validateSubmission: accepts a correct 5×5 replay', () => {
  const payload = parsePayload(goodPayload('RYGO-2026-05-25', 5));
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result, { accepted: true });
});

Deno.test('validateSubmission: future day throws BadRequestError (security hard stop)', () => {
  const payload = parsePayload(goodPayload('RYGO-2026-05-25', 4));
  const tomorrow = '2026-05-26';
  const spoofedPayload = { ...payload, day: tomorrow };
  assertThrowsBadRequest(() => validateSubmission(spoofedPayload, '2026-05-25'), 'future');
});

Deno.test('validateSubmission: day before launch floor → accepted:false', () => {
  // Use a date before LAUNCH_DAY
  const pre = '2025-12-31';
  // We need a parseable payload with that date. Build raw and override day.
  const raw = goodPayload('RYGO-2026-05-25', 4) as Record<string, unknown>;
  raw.day = pre;
  const payload = { ...parsePayload(goodPayload('RYGO-2026-05-25', 4)), day: pre };
  const result = validateSubmission(payload, '2026-06-01');
  assertEquals(result.accepted, false);
  if (!result.accepted) {
    const hasLaunchDay = (result.reason ?? '').includes(LAUNCH_DAY);
    if (!hasLaunchDay) throw new Error(`Expected reason to mention LAUNCH_DAY: ${result.reason}`);
  }
});

Deno.test('validateSubmission: eventLog over cap → accepted:false', () => {
  const base = goodPayload('RYGO-2026-05-25', 4);
  const bigLog: GameEvent[] = Array.from({ length: MAX_EVENTS + 1 }, () => ({
    type: 'hide' as const,
  }));
  const payload = parsePayload({ ...base, eventLog: bigLog, moveCount: 0 });
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result.accepted, false);
});

Deno.test('validateSubmission: board mismatch (wrong tap) → accepted:false', () => {
  const base = goodPayload('RYGO-2026-05-25', 4);
  // Truncate the event log — board won't match target
  const shortLog = base.eventLog.slice(0, 2);
  const { moveCount: shortCount } = replayEventLog(
    generatePuzzle('RYGO-2026-05-25', 4),
    shortLog,
  );
  const payload = parsePayload({ ...base, eventLog: shortLog, moveCount: shortCount });
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result.accepted, false);
});

Deno.test('validateSubmission: moveCount mismatch → accepted:false', () => {
  const base = goodPayload('RYGO-2026-05-25', 4);
  // Submit correct board but wrong claimed moveCount
  const payload = parsePayload({ ...base, moveCount: base.moveCount + 999 });
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result.accepted, false);
});

Deno.test('validateSubmission: elapsedMs below floor → accepted:false (reject, not clamp)', () => {
  const base = goodPayload('RYGO-2026-05-25', 4, ELAPSED_FLOOR_MS - 1);
  const payload = parsePayload(base);
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result.accepted, false);
});

Deno.test('validateSubmission: elapsedMs at floor → accepted:true', () => {
  const base = goodPayload('RYGO-2026-05-25', 4, ELAPSED_FLOOR_MS);
  const payload = parsePayload(base);
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result, { accepted: true });
});

Deno.test('validateSubmission: elapsedMs at ceiling → accepted:true', () => {
  const base = goodPayload('RYGO-2026-05-25', 4, ELAPSED_CEILING_MS);
  const payload = parsePayload(base);
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result, { accepted: true });
});

Deno.test('validateSubmission: elapsedMs above ceiling → accepted:false (reject, not clamp)', () => {
  const base = goodPayload('RYGO-2026-05-25', 4, ELAPSED_CEILING_MS + 1);
  const payload = parsePayload(base);
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result.accepted, false);
});

Deno.test('validateSubmission: same-day submit (serverToday === day) is accepted', () => {
  const payload = parsePayload(goodPayload('RYGO-2026-05-25', 4));
  const result = validateSubmission(payload, '2026-05-25');
  assertEquals(result, { accepted: true });
});
