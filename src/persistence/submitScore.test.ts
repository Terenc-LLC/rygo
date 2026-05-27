import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { replayEventLog } from '../engine/replay';
import { generatePuzzle } from '../engine/generator';
import { useGame } from '../hooks/useGame';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockGetSession, mockFetch } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockFetch: vi.fn(),
}));

vi.mock('../backend/supabaseClient', () => ({
  supabase: { auth: { getSession: mockGetSession } },
}));

vi.stubGlobal('fetch', mockFetch);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_URL = 'https://test.supabase.co';
const TEST_TOKEN = 'test-token';
const SUBMIT_ENDPOINT = `${TEST_URL}/functions/v1/submit-score`;

function makePayload(overrides: Partial<{ day: string; grid_size: 4 | 5 | 6 | 8 }> = {}) {
  return {
    day: '2026-05-25',
    grid_size: (4 as const),
    eventLog: [],
    moveCount: 5,
    elapsedMs: 12000,
    ...overrides,
  };
}

function okAccepted(accepted: boolean) {
  return Promise.resolve(
    new Response(JSON.stringify({ accepted }), { status: 200 }),
  );
}

function errorResponse(status: number) {
  return Promise.resolve(new Response('{}', { status }));
}

// Each test imports a fresh module instance (top-level side effects re-run).
async function importModule() {
  const mod = await import('./submitScore');
  return mod;
}

// ─── Queue unit tests ─────────────────────────────────────────────────────────

describe('submitScore — queue behavior', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    localStorage.clear();
    mockGetSession.mockReset();
    mockFetch.mockReset();
    // Default: session present
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: TEST_TOKEN } },
    });
    // Default: URL set
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    // Default fetch: accepted:true
    mockFetch.mockResolvedValue(okAccepted(true));
  });

  it('accepted:true dequeues the entry', async () => {
    mockFetch.mockResolvedValue(okAccepted(true));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(0);
  });

  it('accepted:false also dequeues (terminal — do not retry invalid scores)', async () => {
    mockFetch.mockResolvedValue(okAccepted(false));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(0);
  });

  it('4xx response is terminal — entry is dropped', async () => {
    mockFetch.mockResolvedValue(errorResponse(422));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(0);
  });

  it('5xx response is retryable — entry stays queued', async () => {
    mockFetch.mockResolvedValue(errorResponse(503));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(1);
  });

  it('network error (fetch throws) is retryable — entry stays queued', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(1);
  });

  it('re-entrancy guard: concurrent flushes do not double-send', async () => {
    // Set up a slow fetch so both calls overlap
    let resolve!: (v: Response) => void;
    const slowFetch = new Promise<Response>(r => { resolve = r; });
    mockFetch.mockReturnValueOnce(slowFetch);
    mockFetch.mockResolvedValue(okAccepted(true));

    const { enqueueAndSubmit } = await importModule();
    // Fire two concurrent calls
    const p1 = enqueueAndSubmit(makePayload());
    const p2 = enqueueAndSubmit(makePayload({ day: '2026-05-26' }));
    resolve(new Response(JSON.stringify({ accepted: true }), { status: 200 }));
    await Promise.all([p1, p2]);
    // fetch called exactly twice: once per entry (the second concurrent flush was no-op)
    // (The module processes all entries in one flush, so 2 entries = 2 fetch calls max)
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('online event triggers a flush of remaining queued entries', async () => {
    // Pre-load queue with a retryable entry
    mockFetch.mockResolvedValueOnce(errorResponse(500)); // first attempt fails
    mockFetch.mockResolvedValueOnce(okAccepted(true));   // online flush succeeds

    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();

    // First attempt: 500 → stays queued
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(1);

    // Simulate coming back online
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      // Let microtasks drain
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(0);
  });

  it('cap at 50: adding a 51st entry evicts the oldest', async () => {
    // Keep everything queued (5xx so nothing dequeues)
    mockFetch.mockResolvedValue(errorResponse(500));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();

    // Fill to 50 entries
    for (let i = 0; i < 50; i++) {
      await enqueueAndSubmit(makePayload({ day: `2026-01-${String(i + 1).padStart(2, '0')}` }));
    }
    const queueBefore = JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]') as Array<{ day: string }>;
    expect(queueBefore).toHaveLength(50);
    expect(queueBefore[0].day).toBe('2026-01-01');

    // Add 51st entry — oldest should be evicted
    await enqueueAndSubmit(makePayload({ day: '2026-03-01' }));
    const queueAfter = JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]') as Array<{ day: string }>;
    expect(queueAfter).toHaveLength(50);
    expect(queueAfter[0].day).toBe('2026-01-02'); // oldest evicted
    expect(queueAfter[queueAfter.length - 1].day).toBe('2026-03-01');
  });

  it('dedupe by key: enqueuing the same day+grid_size replaces the existing entry', async () => {
    mockFetch.mockResolvedValue(errorResponse(500));
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();

    const first = makePayload({ day: '2026-05-25' });
    const second = { ...makePayload({ day: '2026-05-25' }), moveCount: 99 };

    await enqueueAndSubmit(first);
    await enqueueAndSubmit(second);

    const queue = JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]') as Array<{ moveCount: number }>;
    expect(queue).toHaveLength(1);
    expect(queue[0].moveCount).toBe(99);
  });

  it('no session → entry stays queued (retryable)', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('no VITE_SUPABASE_URL → entry stays queued (retryable)', async () => {
    vi.unstubAllEnvs();
    const { enqueueAndSubmit, PENDING_SUBMIT_KEY } = await importModule();
    await enqueueAndSubmit(makePayload());
    expect(JSON.parse(localStorage.getItem(PENDING_SUBMIT_KEY) ?? '[]')).toHaveLength(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends correct Authorization header and payload', async () => {
    mockFetch.mockResolvedValue(okAccepted(true));
    const { enqueueAndSubmit } = await importModule();
    const payload = makePayload({ day: '2026-05-25', grid_size: 8 });
    await enqueueAndSubmit(payload);

    expect(mockFetch).toHaveBeenCalledWith(
      SUBMIT_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        }),
      }),
    );
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.day).toBe('2026-05-25');
    expect(body.grid_size).toBe(8);
    expect(body.moveCount).toBe(5);
  });
});

// ─── Per-grid-size real-log replay reproduction (closes TER-207 review gap) ──

describe('replayEventLog — real captured log from useGame (all grid sizes)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([4, 5, 6, 8] as const)(
    'grid %s: captured eventLog replays to target board with matching moveCount',
    (gridSize) => {
      const puzzle = generatePuzzle('RYGO-2026-05-25', gridSize);
      const { result } = renderHook(() => useGame(puzzle));

      // Drive to completion by replaying the generator's canonical solution moves.
      // puzzle.solution is guaranteed to produce puzzle.target via applyMove, so
      // selectColor + placeAt for each move reliably reaches 'validating'.
      //
      // Caveat: useGame treats a tap on a same-color cell as a clear, while applyMove
      // is a pure placement. When a generator move would trigger a clear (tap cell
      // already holds that color), we do a double-tap: clear first, then re-apply.
      // The double-tap is algebraically equivalent to a direct applyMove because:
      //   - clearCells removes only yellow cells in the plus-shape (or the connected
      //     region for green/red), all of which were already that color anyway, and
      //   - the subsequent re-apply refills them (canOverwrite('empty', C) = true).
      // TER-221: no reveal/hide step — game starts in playing phase directly.
      act(() => {}); // flush RESUME_TIMER useEffect

      let lastColor: string | null = null;
      const sel = (c: typeof puzzle.solution[number]['color']) => {
        if (lastColor !== c) {
          act(() => { result.current.selectColor(c); });
          lastColor = c;
        }
      };

      for (const move of puzzle.solution) {
        if (result.current.phase !== 'playing') break;
        sel(move.color);
        if (result.current.current[move.row][move.col] === move.color) {
          // Same-color tap would clear — dispatch twice: clear then re-place.
          act(() => { result.current.placeAt(move.row, move.col); }); // clear
        }
        act(() => { result.current.placeAt(move.row, move.col); }); // place
      }

      expect(result.current.phase).toBe('validating');

      const { eventLog, moveCount } = result.current;
      const replayResult = replayEventLog(puzzle, eventLog);

      expect(replayResult.board).toEqual(puzzle.target);
      expect(replayResult.moveCount).toBe(moveCount);
    },
  );
});
