import { encodeResult } from './resultCodec';
import { displayedPar } from '../display/parDisplay';

export function buildShareUrl(input: {
  date: string;
  gridSize: 4 | 5 | 6 | 8;
  moves: number;
  dailyPar?: { par: number } | null;
}): string {
  const d = input.date.replace(/-/g, '');
  const p = displayedPar(input.dailyPar?.par ?? null) ?? undefined;
  const payload = encodeResult({ d, s: input.gridSize, m: input.moves, p });
  return `https://playRYGO.com/s/${payload}`;
}
