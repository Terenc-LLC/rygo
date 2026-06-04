import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminMetrics } from './getAdminMetrics';

const state = vi.hoisted(() => ({
  supabase: { rpc: vi.fn() } as { rpc: ReturnType<typeof vi.fn> } | null,
}));

vi.mock('./supabaseClient', () => ({
  get supabase() {
    return state.supabase;
  },
}));

const VALID_METRICS = {
  unique_players: 42,
  total_submissions: 150,
  by_day: [
    { day: '2026-06-03', players: 10, submissions: 30 },
    { day: '2026-06-02', players: 8, submissions: 25 },
  ],
};

describe('getAdminMetrics — supabase live', () => {
  beforeEach(() => {
    state.supabase = { rpc: vi.fn() };
  });

  it('returns parsed AdminMetrics on successful RPC', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: VALID_METRICS, error: null });
    const result = await getAdminMetrics();
    expect(result).toEqual(VALID_METRICS);
  });

  it('calls rpc with the correct function name', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: VALID_METRICS, error: null });
    await getAdminMetrics();
    expect(state.supabase!.rpc).toHaveBeenCalledWith('get_admin_metrics');
  });

  it('returns null when RPC returns an error', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: null, error: { message: 'rpc error' } });
    expect(await getAdminMetrics()).toBeNull();
  });

  it('returns null when data is null', async () => {
    state.supabase!.rpc.mockResolvedValue({ data: null, error: null });
    expect(await getAdminMetrics()).toBeNull();
  });

  it('returns null when unique_players is missing', async () => {
    const bad = { total_submissions: 10, by_day: [] };
    state.supabase!.rpc.mockResolvedValue({ data: bad, error: null });
    expect(await getAdminMetrics()).toBeNull();
  });

  it('returns null when total_submissions is missing', async () => {
    const bad = { unique_players: 5, by_day: [] };
    state.supabase!.rpc.mockResolvedValue({ data: bad, error: null });
    expect(await getAdminMetrics()).toBeNull();
  });

  it('returns null when by_day is not an array', async () => {
    const bad = { unique_players: 5, total_submissions: 10, by_day: null };
    state.supabase!.rpc.mockResolvedValue({ data: bad, error: null });
    expect(await getAdminMetrics()).toBeNull();
  });

  it('returns null when unique_players is non-numeric', async () => {
    const bad = { unique_players: '42', total_submissions: 10, by_day: [] };
    state.supabase!.rpc.mockResolvedValue({ data: bad, error: null });
    expect(await getAdminMetrics()).toBeNull();
  });

  it('returns metrics with empty by_day array', async () => {
    const empty = { unique_players: 0, total_submissions: 0, by_day: [] };
    state.supabase!.rpc.mockResolvedValue({ data: empty, error: null });
    expect(await getAdminMetrics()).toEqual(empty);
  });

  it('returns null when RPC rejects — never throws', async () => {
    state.supabase!.rpc.mockRejectedValue(new Error('network failure'));
    await expect(getAdminMetrics()).resolves.toBeNull();
  });
});

describe('getAdminMetrics — supabase null (env vars absent)', () => {
  beforeEach(() => {
    state.supabase = null;
  });

  it('returns null immediately — no rpc call made', async () => {
    expect(await getAdminMetrics()).toBeNull();
  });
});
