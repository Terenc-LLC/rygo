/**
 * TER-222 offline daily-par pipeline — GitHub Actions compute script.
 *
 * Precomputes par for the next LOOKAHEAD_DAYS game-days (today inclusive),
 * for all four grid sizes. Upserts into the `daily_par` Supabase table using
 * the service role key. Idempotent: rows with a matching generation_hash are
 * skipped; rows with a mismatched hash (engine drift) are re-computed and
 * overwritten.
 *
 * Usage:
 *   npx tsx scripts/compute-par.ts
 *
 * Required environment variables:
 *   SUPABASE_URL             — project URL (not the anon-key URL)
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (never commit this)
 */

import { createClient } from '@supabase/supabase-js';
import { generatePuzzle, type GeneratedPuzzle } from '../src/engine/generator.ts';
import { solveOptimalPar, type SolverResult } from '../src/engine/parSolver.ts';
import { boardHash } from '../src/engine/boardHash.ts';

// ── Constants ──────────────────────────────────────────────────────────────

export const LOOKAHEAD_DAYS = 14;
export const BUDGET_MS = 30_000;
const SIZES = [4, 5, 6, 8] as const;

// ── Pure helpers (exported for tests) ─────────────────────────────────────

export interface ParRow {
  date: string;
  grid_size: 4 | 5 | 6 | 8;
  par: number;
  proven: boolean;
  generation_hash: string;
}

/** Returns the YYYY-MM-DD UTC date string for a given epoch offset in days. */
export function utcDateStr(base: Date, offsetDays: number): string {
  const d = new Date(base.getTime() + offsetDays * 86_400_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Builds the row to upsert given a solver result and the generator's fallback par. */
export function buildParRow(
  dateStr: string,
  gridSize: 4 | 5 | 6 | 8,
  result: SolverResult,
  generatorMoves: number,
  hash: string,
): ParRow {
  return {
    date: dateStr,
    grid_size: gridSize,
    par: result.proven ? result.par : generatorMoves,
    proven: result.proven,
    generation_hash: hash,
  };
}

/**
 * Returns true when the existing DB hash matches the newly-computed hash,
 * meaning the stored par is still valid for this board — safe to skip.
 */
export function shouldSkipRow(existingHash: string | null | undefined, newHash: string): boolean {
  return existingHash != null && existingHash === newHash;
}

/**
 * Runs the solver for sizes 4/5/6 and returns a soft-par fallback for size 8.
 *
 * Two safety layers:
 * - 8×8: always returns { proven: false } without calling the solver. The
 *   solver OOMs on 8×8 before the time budget fires (heap exhaustion is
 *   uncatchable), which would crash the whole run. 8×8 is soft-par by design
 *   and attempting a solve buys nothing.
 * - 4/5/6: wraps the solver call in try/catch so any thrown error (unexpected
 *   solver bug, etc.) degrades to soft par for that puzzle rather than
 *   aborting the run.
 *
 * The optional `solver` parameter exists for testing — pass a stub to verify
 * the error-fallback path without needing module-level mocks.
 */
export function solveWithFallback(
  puzzle: GeneratedPuzzle,
  budgetMs: number,
  solver: (target: GeneratedPuzzle['target'], size: GeneratedPuzzle['gridSize'], opts: { budgetMs: number }) => SolverResult = solveOptimalPar,
): SolverResult {
  if (puzzle.gridSize === 8) {
    return { proven: false };
  }
  try {
    return solver(puzzle.target, puzzle.gridSize, { budgetMs });
  } catch {
    return { proven: false };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const today = new Date();
  // Truncate to UTC midnight so offsets align with game days.
  const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  let skipped = 0, proven = 0, fallback = 0, errors = 0;

  for (let offsetDays = 0; offsetDays < LOOKAHEAD_DAYS; offsetDays++) {
    const dateStr = utcDateStr(base, offsetDays);
    const seed = `RYGO-${dateStr}`;

    for (const size of SIZES) {
      const puzzle = generatePuzzle(seed, size);
      const hash = boardHash(puzzle.target);

      // Check for an existing row with the same hash — skip if current.
      const { data: existing } = await sb
        .from('daily_par')
        .select('generation_hash')
        .eq('date', dateStr)
        .eq('grid_size', size)
        .maybeSingle();

      if (shouldSkipRow(existing?.generation_hash, hash)) {
        process.stdout.write(`  ${dateStr} ${size}×${size} — skip (hash match)\n`);
        skipped++;
        continue;
      }

      const start = Date.now();
      const result = solveWithFallback(puzzle, BUDGET_MS);
      const elapsed = Date.now() - start;

      const row = buildParRow(dateStr, size, result, puzzle.solution.length, hash);

      const { error } = await sb.from('daily_par').upsert(row, {
        onConflict: 'date,grid_size',
      });

      if (error) {
        console.error(`  ${dateStr} ${size}×${size} — upsert error: ${error.message}`);
        errors++;
        continue;
      }

      const tag = result.proven ? `proven par=${row.par}` : `fallback par=${row.par} (gen=${puzzle.solution.length})`;
      process.stdout.write(`  ${dateStr} ${size}×${size} — ${tag} (${elapsed}ms)\n`);
      if (result.proven) proven++; else fallback++;
    }
  }

  console.log(`\nDone. proven=${proven} fallback=${fallback} skipped=${skipped} errors=${errors}`);
  if (errors > 0) process.exit(1);
}

// Run when executed directly (not imported by tests).
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  main().catch(err => { console.error(err); process.exit(1); });
}
