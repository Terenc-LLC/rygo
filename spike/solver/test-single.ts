import { generatePuzzle, dailySeed } from '../../src/engine/generator.ts';
import { solve } from './solver.ts';

const seeds = [
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
];

for (const size of [4, 5, 6, 8] as const) {
  console.log(`\n── ${size}×${size} ────────────────────────────────────────────`);
  for (const dateStr of seeds) {
    const seed = dailySeed(new Date(`${dateStr}T00:00:00Z`));
    const puzzle = generatePuzzle(seed, size);
    const result = solve(puzzle.target as unknown as string[][], 30_000);
    const status = result.timedOut ? `TIMEOUT (>${result.timeMs}ms)` : `${result.optimalMoves} moves`;
    console.log(`  ${seed}  gen:${puzzle.solution.length}  opt:${status}  ${result.timeMs}ms  ${result.nodesExplored} nodes`);
  }
}
