import { supabase } from './supabaseClient';

export interface AdminMetrics {
  unique_players: number;
  total_submissions: number;
  by_day: { day: string; players: number; submissions: number }[];
}

export async function getAdminMetrics(): Promise<AdminMetrics | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc('get_admin_metrics');
    if (error) return null;
    if (
      data === null ||
      data === undefined ||
      typeof data !== 'object' ||
      typeof (data as Record<string, unknown>).unique_players !== 'number' ||
      typeof (data as Record<string, unknown>).total_submissions !== 'number' ||
      !Array.isArray((data as Record<string, unknown>).by_day)
    ) {
      return null;
    }
    return data as AdminMetrics;
  } catch {
    return null;
  }
}
