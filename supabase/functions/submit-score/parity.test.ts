// Generator-parity fixture test.
// Verifies that _shared/engine/generator.ts (the Deno copy) produces byte-identical
// output to the client generator (src/engine/generator.ts) for every committed fixture
// entry. A divergence here means the validator would reject every legitimate score.
import { generatePuzzle } from '../_shared/engine/generator.ts';
import type { Board } from '../_shared/engine/types.ts';

interface FixtureEntry {
  seed: string;
  gridSize: 4 | 5 | 6 | 8;
  target: Board;
}

function boardsEqual(a: Board, b: Board): boolean {
  if (a.length !== b.length) return false;
  for (let r = 0; r < a.length; r++) {
    if (a[r].length !== b[r].length) return false;
    for (let c = 0; c < a[r].length; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

const fixturePath = new URL('./parity-fixture.json', import.meta.url);
const fixtureText = await Deno.readTextFile(fixturePath);
const fixture: FixtureEntry[] = JSON.parse(fixtureText);

for (const entry of fixture) {
  Deno.test(
    `parity: seed="${entry.seed}" gridSize=${entry.gridSize}`,
    () => {
      const puzzle = generatePuzzle(entry.seed, entry.gridSize);
      if (!boardsEqual(puzzle.target, entry.target)) {
        throw new Error(
          `Generator parity failure for seed="${entry.seed}" gridSize=${entry.gridSize}.\n` +
            `Deno target:   ${JSON.stringify(puzzle.target)}\n` +
            `Client target: ${JSON.stringify(entry.target)}`,
        );
      }
    },
  );
}
