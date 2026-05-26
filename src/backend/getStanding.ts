import { supabase } from './supabaseClient';

export async function getStanding(
  day: string,
  gridSize: 4 | 5 | 6 | 8,
  moves: number,
  elapsedMs: number,
): Promise<{ rank: number; total: number } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_standing', {
      p_day: day,
      p_grid_size: gridSize,
      p_moves: moves,
      p_elapsed_ms: elapsedMs,
    });
    if (error) return null;
    if (
      data === null ||
      data === undefined ||
      typeof data !== 'object' ||
      typeof (data as Record<string, unknown>).rank !== 'number' ||
      typeof (data as Record<string, unknown>).total !== 'number'
    ) {
      return null;
    }
    return data as { rank: number; total: number };
  } catch {
    return null;
  }
}
