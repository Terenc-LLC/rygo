/**
 * TER-217 spike — benchmark runner
 *
 * Generates ≥10 distinct real seeds per grid size, solves each puzzle,
 * and prints a per-size results table plus structural property analysis.
 *
 * Usage:
 *   npx tsx spike/solver/benchmark.ts
 *
 * Sizes tested: 4, 5, 6, 8  (generator only supports these; 7×7 not supported
 * by the production generator — see findings note).
 *
 * Timeout: 60 s per puzzle for 4–6, 120 s for 8×8.
 */

import { generatePuzzle, dailySeed } from '../../src/engine/generator.ts';
import { reachCells } from '../../src/engine/placement.ts';
import { solve, boardToFlat } from './solver.ts';
import type { Board } from '../../src/engine/types.ts';

const SIZES: Array<4 | 5 | 6 | 8> = [4, 5, 6, 8];
const NUM_SEEDS = 15;
const TIMEOUT_BY_SIZE: Record<number, number> = { 4: 30_000, 5: 30_000, 6: 60_000, 8: 90_000 };

// Generate NUM_SEEDS dates starting from 2026-01-01
function makeSeeds(n: number): string[] {
  const seeds: string[] = [];
  const base = new Date('2026-01-01T00:00:00Z');
  for (let i = 0; i < n; i++) {
    const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    seeds.push(dailySeed(d));
  }
  return seeds;
}

// ── Structural property checks ─────────────────────────────────────────────

function countColors(board: Board) {
  const counts = { red: 0, yellow: 0, green: 0 };
  for (const row of board) for (const cell of row) {
    if (cell !== 'empty') counts[cell]++;
  }
  return counts;
}

// Check: "Red is 1-cell" — every red target cell is individual (trivially true by definition).
// The interesting question is whether red placements map 1:1 to red target cells.
// Since red = single-cell, this is always true. Verify no clearing is needed.

// Check: "Yellow ≈ minimum set cover with plus-shaped stamps"
// Compute greedy lower bound for yellow: ceil(yellowCount / 5)
// and greedy actual: how many plusses needed to cover all yellow cells.
function yellowSetCoverLB(board: Board, size: number): { lb: number; greedyUB: number } {
  const yellowCells = new Set<string>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'yellow') yellowCells.add(`${r},${c}`);
    }
  }
  const lb = Math.ceil(yellowCells.size / 5);

  // Greedy set cover: at each step pick the plus-center that covers the most uncovered yellow cells
  let covered = new Set<string>();
  let stamps = 0;
  while (covered.size < yellowCells.size) {
    let bestCount = 0;
    let bestCenter = [-1, -1];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const plus = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        let count = 0;
        for (const [pr, pc] of plus) {
          if (pr >= 0 && pr < size && pc >= 0 && pc < size) {
            const key = `${pr},${pc}`;
            if (yellowCells.has(key) && !covered.has(key)) count++;
          }
        }
        if (count > bestCount) { bestCount = count; bestCenter = [r, c]; }
      }
    }
    if (bestCount === 0) break;
    const [br, bc] = bestCenter;
    const plus = [[br, bc], [br - 1, bc], [br + 1, bc], [br, bc - 1], [br, bc + 1]];
    for (const [pr, pc] of plus) {
      if (pr >= 0 && pr < size && pc >= 0 && pc < size) covered.add(`${pr},${pc}`);
    }
    stamps++;
  }
  return { lb, greedyUB: stamps };
}

// Check: "Green blocking — does clearing materially enlarge search?"
// We measure max green reach per placement and flag cases where a cell is blocked.
function greenReachStats(board: Board, size: number) {
  const empty: Board = Array.from({ length: size }, () => Array(size).fill('empty'));
  let totalReach = 0, count = 0, maxReach = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'green') {
        const reach = reachCells(empty, 'green', r, c).length;
        totalReach += reach;
        count++;
        if (reach > maxReach) maxReach = reach;
      }
    }
  }
  return { avgReach: count ? (totalReach / count).toFixed(1) : '—', maxReach };
}

// ── Per-size result accumulation ───────────────────────────────────────────

interface PuzzleResult {
  seed: string;
  size: number;
  optimalMoves: number;
  generatorMoves: number;
  timeMs: number;
  peakMemoryMB: number;
  nodesExplored: number;
  timedOut: boolean;
  redCount: number;
  yellowCount: number;
  greenCount: number;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.max(0, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const seeds = makeSeeds(NUM_SEEDS);
  const allResults: PuzzleResult[] = [];

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  TER-217 Spike — True-Optimal Par Solver Benchmark');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Sizes: ${SIZES.join(', ')}   Seeds: ${NUM_SEEDS}   Timeouts: 4/5→30s  6×6→60s  8×8→90s\n`);

  for (const size of SIZES) {
    const timeout = TIMEOUT_BY_SIZE[size];
    console.log(`\n── ${size}×${size} ────────────────────────────────────────────────────────`);
    console.log(`${'Seed'.padEnd(20)} ${'Opt'.padStart(4)} ${'Gen'.padStart(4)} ${'ms'.padStart(8)} ${'Nodes'.padStart(12)} ${'Mem MB'.padStart(7)} ${'Status'.padStart(10)}`);
    console.log('─'.repeat(75));

    for (const seed of seeds) {
      const puzzle = generatePuzzle(seed, size);
      const result = solve(puzzle.target as unknown as string[][], timeout);
      const counts = countColors(puzzle.target);

      const row: PuzzleResult = {
        seed,
        size,
        optimalMoves: result.optimalMoves,
        generatorMoves: puzzle.solution.length,
        timeMs: result.timeMs,
        peakMemoryMB: result.peakMemoryMB,
        nodesExplored: result.nodesExplored,
        timedOut: result.timedOut,
        redCount: counts.red,
        yellowCount: counts.yellow,
        greenCount: counts.green,
      };
      allResults.push(row);

      const status = result.timedOut ? '⏱ TIMEOUT' : '✓ OPTIMAL';
      const opt = result.timedOut ? '  —' : String(result.optimalMoves).padStart(3);
      console.log(
        `${seed.padEnd(20)} ${opt.padStart(4)} ${String(puzzle.solution.length).padStart(4)} ` +
        `${String(result.timeMs).padStart(8)} ${String(result.nodesExplored).padStart(12)} ` +
        `${String(result.peakMemoryMB).padStart(7)} ${status.padStart(10)}`
      );
    }
  }

  // ── Aggregate table ────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  Per-Size Aggregate Results');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(
    `${'Size'.padEnd(6)} ${'Solved'.padStart(7)} ${'medOpt'.padStart(7)} ${'medGen'.padStart(7)} ` +
    `${'medMs'.padStart(8)} ${'p95Ms'.padStart(8)} ${'maxMs'.padStart(8)} ${'medMem'.padStart(8)} ${'OptProven'.padStart(10)}`
  );
  console.log('─'.repeat(80));

  for (const size of SIZES) {
    const rows = allResults.filter(r => r.size === size);
    const solved = rows.filter(r => !r.timedOut);
    const timedOut = rows.filter(r => r.timedOut);

    const optTimes = solved.map(r => r.timeMs).sort((a, b) => a - b);
    const allTimes = rows.map(r => r.timeMs).sort((a, b) => a - b);
    const optMoves = solved.map(r => r.optimalMoves).sort((a, b) => a - b);
    const genMoves = solved.map(r => r.generatorMoves).sort((a, b) => a - b);
    const mems = rows.map(r => r.peakMemoryMB).sort((a, b) => a - b);

    const pct = `${solved.length}/${rows.length}`;
    const medOptStr = optMoves.length ? String(median(optMoves)) : '—';
    const medGenStr = genMoves.length ? String(median(genMoves)) : '—';
    const medMsStr = optTimes.length ? String(Math.round(median(optTimes))) : '—';
    const p95MsStr = allTimes.length ? String(percentile(allTimes, 95)) : '—';
    const maxMsStr = allTimes.length ? String(Math.max(...allTimes)) : '—';
    const medMemStr = mems.length ? String(Math.round(median(mems))) : '—';
    const proven = timedOut.length === 0 ? 'YES' : `NO (${timedOut.length} TO)`;

    console.log(
      `${String(size + '×' + size).padEnd(6)} ${pct.padStart(7)} ${medOptStr.padStart(7)} ${medGenStr.padStart(7)} ` +
      `${medMsStr.padStart(8)} ${p95MsStr.padStart(8)} ${maxMsStr.padStart(8)} ${medMemStr.padStart(8)} ${proven.padStart(10)}`
    );
  }

  // ── Structural property analysis ───────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  Structural Property Analysis (sample: 4×4 first 5 puzzles)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const sampleSeeds = seeds.slice(0, 5);
  for (const size of SIZES) {
    console.log(`\n  ${size}×${size}:`);
    console.log(`  ${'Seed'.padEnd(20)} ${'Red'.padStart(4)} ${'Yel'.padStart(4)} ${'Grn'.padStart(4)} ${'YlbLB'.padStart(6)} ${'YlbUB'.padStart(6)} ${'GrnAvgRch'.padStart(10)}`);
    for (const seed of sampleSeeds) {
      const puzzle = generatePuzzle(seed, size);
      const counts = countColors(puzzle.target);
      const { lb, greedyUB } = yellowSetCoverLB(puzzle.target, size);
      const { avgReach } = greenReachStats(puzzle.target, size);
      console.log(
        `  ${seed.padEnd(20)} ${String(counts.red).padStart(4)} ${String(counts.yellow).padStart(4)} ` +
        `${String(counts.green).padStart(4)} ${String(lb).padStart(6)} ${String(greedyUB).padStart(6)} ${String(avgReach).padStart(10)}`
      );
    }
  }

  // ── Go/no-go summary ───────────────────────────────────────────────────────
  const results8 = allResults.filter(r => r.size === 8 && !r.timedOut);
  const solved8 = results8.length;
  const total8 = allResults.filter(r => r.size === 8).length;

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  Go/No-Go: 8×8 True-Optimal Offline');
  console.log('═══════════════════════════════════════════════════════════════\n');
  if (solved8 === total8) {
    const times = results8.map(r => r.timeMs).sort((a, b) => a - b);
    console.log(`  VERDICT: GO — all ${total8} puzzles solved optimally`);
    console.log(`  Median: ${Math.round(median(times))}ms, p95: ${percentile(times, 95)}ms, max: ${Math.max(...times)}ms`);
  } else {
    const times8 = allResults.filter(r => r.size === 8).map(r => r.timeMs).sort((a, b) => a - b);
    console.log(`  VERDICT: NO-GO (current IDA*) — ${solved8}/${total8} solved within ${TIMEOUT_BY_SIZE[8]/1000}s`);
    console.log(`  Of those solved: median ${solved8 ? Math.round(median(results8.map(r => r.timeMs))) : '—'}ms`);
    console.log(`  Overall (incl timeouts): median ${Math.round(median(times8))}ms, max ${Math.max(...times8)}ms`);
    console.log('  → Recommend reviewing 6×6 results; 8×8 needs algorithmic improvement for offline use.');
  }

  const results6 = allResults.filter(r => r.size === 6 && !r.timedOut);
  const solved6 = results6.length;
  const total6 = allResults.filter(r => r.size === 6).length;
  if (solved6 === total6) {
    const times = results6.map(r => r.timeMs).sort((a, b) => a - b);
    console.log(`\n  6×6: GO — all ${total6} puzzles solved, median ${Math.round(median(times))}ms`);
  } else {
    console.log(`\n  6×6: PARTIAL — ${solved6}/${total6} solved within timeout`);
  }

  console.log('\n  NOTE: Generator does not support 7×7 (valid sizes: 4|5|6|8).');
  console.log('  NOTE: Clearing moves excluded from search (see solver.ts assumption comment).\n');
}

main().catch(console.error);
