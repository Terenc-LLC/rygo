import { supabase } from './supabaseClient';
import { generatePuzzle } from '../engine/generator';
import { boardHash } from '../engine/boardHash';

export interface DailyPar {
  par: number;
  proven: boolean;
}

/**
 * Fetches today's par for the given grid size from the daily_par table.
 *
 * Verifies the generation_hash against the client's own puzzle so a stale or
 * drifted row is never served as valid par. Returns null on any failure —
 * callers must treat null as "par unavailable" and degrade gracefully.
 *
 * @param dateStr  UTC date in YYYY-MM-DD format (same key used for the puzzle seed)
 * @param gridSize active grid size
 */
export async function getDailyPar(
  dateStr: string,
  gridSize: 4 | 5 | 6 | 8,
): Promise<DailyPar | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('daily_par')
      .select('par, proven, generation_hash')
      .eq('date', dateStr)
      .eq('grid_size', gridSize)
      .maybeSingle();

    if (error || data == null) return null;

    const { par, proven, generation_hash } = data as {
      par: unknown;
      proven: unknown;
      generation_hash: unknown;
    };

    if (typeof par !== 'number' || typeof proven !== 'boolean' || typeof generation_hash !== 'string') {
      return null;
    }

    // Drift guard: reject if the stored hash doesn't match the client's board.
    const expectedHash = boardHash(generatePuzzle(`RYGO-${dateStr}`, gridSize).target);
    if (generation_hash !== expectedHash) return null;

    return { par, proven };
  } catch {
    return null;
  }
}
