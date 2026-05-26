import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStanding } from './getStanding';

// Hoisted mutable state lets us toggle supabase between non-null and null per describe block.
const state = vi.hoisted(() => ({
  supabase: { rpc: vi.fn() } as { rpc: ReturnType<typeof vi.fn> } | null,
}));

vi.mock('./supabaseClient', () => ({
  get supabase() {
    return state.supabase;
  },
}));

describe('getStanding — supabase live', () => {
  beforeEach(() => {
    state.supabase = { rpc: vi.fn() };
  });

  it('returns { rank, total } on a successful RPC call', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: { rank: 3, total: 42 }, error: null });
    const result = await getStanding('2026-05-26', 5, 12, 95000);
    expect(result).toEqual({ rank: 3, total: 42 });
  });

  it('calls rpc with p_-prefixed param names', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: { rank: 1, total: 1 }, error: null });
    await getStanding('2026-05-26', 4, 8, 60000);
    expect(state.supabase!.rpc).toHaveBeenCalledWith('get_standing', {
      p_day: '2026-05-26',
      p_grid_size: 4,
      p_moves: 8,
      p_elapsed_ms: 60000,
    });
  });

  it('passes both moves and elapsedMs so the tiebreak resolves correctly', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: { rank: 2, total: 5 }, error: null });
    await getStanding('2026-05-26', 8, 20, 120000);
    const args = state.supabase!.rpc.mock.calls[0][1] as Record<string, unknown>;
    expect(args.p_moves).toBe(20);
    expect(args.p_elapsed_ms).toBe(120000);
  });

  it('returns null when RPC returns an error', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: null, error: { message: 'rpc error' } });
    expect(await getStanding('2026-05-26', 5, 10, 80000)).toBeNull();
  });

  it('returns null when data is null', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: null, error: null });
    expect(await getStanding('2026-05-26', 5, 10, 80000)).toBeNull();
  });

  it('returns null when data is missing rank', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: { total: 10 }, error: null });
    expect(await getStanding('2026-05-26', 5, 10, 80000)).toBeNull();
  });

  it('returns null when data is missing total', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: { rank: 1 }, error: null });
    expect(await getStanding('2026-05-26', 5, 10, 80000)).toBeNull();
  });

  it('returns null when data has non-numeric rank/total', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: { rank: '1', total: '10' }, error: null });
    expect(await getStanding('2026-05-26', 5, 10, 80000)).toBeNull();
  });

  it('returns null when RPC rejects (network error) — never throws', async () => {
    state.supabase!.rpc.mockRejectedValue(new Error('network failure'));
    await expect(getStanding('2026-05-26', 5, 10, 80000)).resolves.toBeNull();
  });
});

describe('getStanding — supabase null (env vars absent)', () => {
  const captureRpc = vi.fn();

  beforeEach(() => {
    captureRpc.mockReset();
    state.supabase = null;
  });

  it('returns null immediately — no rpc call made', async () => {
    // supabase is null, so getStanding must return null before touching rpc.
    const result = await getStanding('2026-05-26', 5, 10, 80000);
    expect(result).toBeNull();
    expect(captureRpc).not.toHaveBeenCalled();
  });
});
