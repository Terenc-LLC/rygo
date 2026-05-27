import type { Board } from './types.ts';

const CHAR: Record<'empty' | 'red' | 'yellow' | 'green', string> = {
  empty: 'e',
  red: 'r',
  yellow: 'y',
  green: 'g',
};

// Compact, human-readable board fingerprint: one char per cell in row-major order.
// Used as a generation_hash in daily_par to detect engine drift between the
// compute job and the client — if hashes diverge the client degrades gracefully.
export function boardHash(board: Board): string {
  return board.flatMap(row => row.map(cell => CHAR[cell])).join('');
}
