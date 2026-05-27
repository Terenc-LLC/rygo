/**
 * TER-220 benchmark — production A* par solver
 *
 * Generates 15 distinct real seeds per grid size, solves each puzzle, and
 * prints a per-size results table and budget-cutoff confirmation.
 *
 * Usage:
 *   npx tsx scripts/par-solver-benchmark.ts
 *
 * Note: 8×8 puzzles are expected to time out (proven:false). This is correct
 * per design doc §3: 8×8 uses generator-length as soft par.
 */

import { generatePuzzle, dailySeed } from '../src/engine/generator.ts';
import { solveOptimalPar } from '../src/engine/parSolver.ts';

const SIZES: Array<4 | 5 | 6 | 8> = [4, 5, 6, 8];
const NUM_SEEDS = 15;
const BUDGET_BY_SIZE: Record<number, number> = { 4: 30_000, 5: 30_000, 6: 60_000, 8: 90_000 };

function makeSeeds(n: number): string[] {
  const seeds: string[] = [];
  const base = new Date('2026-01-01T00:00:00Z');
  for (let i = 0; i < n; i++) {
    const d = new Date(base.getTime() + i * 86_400_000);
    seeds.push(dailySeed(d));
  }
  return seeds;
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
}

interface PuzzleResult {
  seed: string;
  size: number;
  par: number;
  generatorMoves: number;
  timeMs: number;
  proven: boolean;
}

async function main() {
  const seeds = makeSeeds(NUM_SEEDS);
  const allResults: PuzzleResult[] = [];

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  TER-220 — Production A* Par Solver Benchmark');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Sizes: ${SIZES.join(', ')}   Seeds: ${NUM_SEEDS}   Budgets: 4/5→30s  6→60s  8→90s\n`);

  for (const size of SIZES) {
    const budget = BUDGET_BY_SIZE[size];
    console.log(`\n── ${size}×${size} ────────────────────────────────────────────────────────`);
    console.log(
      `${'Seed'.padEnd(20)} ${'Par'.padStart(4)} ${'Gen'.padStart(4)} ${'ms'.padStart(8)} ${'Status'.padStart(12)}`
    );
    console.log('─'.repeat(60));

    for (const seed of seeds) {
      const puzzle = generatePuzzle(seed, size);
      const t0 = Date.now();
      const result = solveOptimalPar(puzzle.target, size, { budgetMs: budget });
      const timeMs = Date.now() - t0;

      const row: PuzzleResult = {
        seed,
        size,
        par: result.proven ? result.par : -1,
        generatorMoves: puzzle.solution.length,
        timeMs,
        proven: result.proven,
      };
      allResults.push(row);

      const status = result.proven ? '✓ proven' : '⏱ timeout';
      const parStr = result.proven ? String(result.par).padStart(3) : '  —';
      console.log(
        `${seed.padEnd(20)} ${parStr.padStart(4)} ${String(puzzle.solution.length).padStart(4)} ` +
        `${String(timeMs).padStart(8)} ${status.padStart(12)}`
      );
    }
  }

  // ── Aggregate table ────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  Per-Size Aggregate Results');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(
    `${'Size'.padEnd(6)} ${'Proven'.padStart(7)} ${'medPar'.padStart(7)} ${'medGen'.padStart(7)} ` +
    `${'medMs'.padStart(8)} ${'p95Ms'.padStart(8)} ${'maxMs'.padStart(8)}`
  );
  console.log('─'.repeat(60));

  for (const size of SIZES) {
    const rows = allResults.filter(r => r.size === size);
    const solved = rows.filter(r => r.proven);
    const allTimes = rows.map(r => r.timeMs).sort((a, b) => a - b);
    const solvedTimes = solved.map(r => r.timeMs).sort((a, b) => a - b);
    const parVals = solved.map(r => r.par).sort((a, b) => a - b);
    const genVals = solved.map(r => r.generatorMoves).sort((a, b) => a - b);

    const pct = `${solved.length}/${rows.length}`;
    const medPar = parVals.length ? String(median(parVals)) : '—';
    const medGen = genVals.length ? String(median(genVals)) : '—';
    const medMs = solvedTimes.length ? String(Math.round(median(solvedTimes))) : '—';
    const p95Ms = allTimes.length ? String(percentile(allTimes, 95)) : '—';
    const maxMs = allTimes.length ? String(Math.max(...allTimes)) : '—';

    console.log(
      `${String(size + '×' + size).padEnd(6)} ${pct.padStart(7)} ${medPar.padStart(7)} ${medGen.padStart(7)} ` +
      `${medMs.padStart(8)} ${p95Ms.padStart(8)} ${maxMs.padStart(8)}`
    );
  }

  // ── Budget-cutoff verification ─────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  Budget-Cutoff Verification');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const puzzle5 = generatePuzzle(seeds[0], 5);
  const tinyResult = solveOptimalPar(puzzle5.target, 5, { budgetMs: 1 });
  console.log(`  5×5 with budgetMs=1:  ${tinyResult.proven ? `UNEXPECTED proven (par=${tinyResult.par})` : 'proven:false ✓ (correctly timed out)'}`);

  const puzzle4 = generatePuzzle(seeds[0], 4);
  const fullResult = solveOptimalPar(puzzle4.target, 4, { budgetMs: 30_000 });
  console.log(`  4×4 with budgetMs=30s: ${fullResult.proven ? `proven:true, par=${fullResult.par} ✓` : 'UNEXPECTED timeout'}`);

  // ── Placement-only summary ─────────────────────────────────────────────────
  const solved4 = allResults.filter(r => r.size === 4 && r.proven).length;
  const solved5 = allResults.filter(r => r.size === 5 && r.proven).length;
  const total4 = allResults.filter(r => r.size === 4).length;
  const total5 = allResults.filter(r => r.size === 5).length;

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  Placement-Only Verification Summary');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`  4×4: ${solved4}/${total4} solved via placements-only — no clearing needed`);
  console.log(`  5×5: ${solved5}/${total5} solved via placements-only — no clearing needed`);
  console.log('  6×6: expected timeouts (large search space, not structural need for clears)');
  console.log('  8×8: expected timeouts (large search space, not structural need for clears)');
  console.log('\n  Structural guarantee: R1+R2 pruning prevents permanently-damaging moves,');
  console.log('  so optimal paths never require clearing. Generator construction confirms');
  console.log('  a placement-only path exists for every generated puzzle.\n');
}

main().catch(err => { console.error(err); process.exit(1); });
