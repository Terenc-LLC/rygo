export function buildShareString(input: {
  date: string;
  gridSize: 4 | 5 | 6 | 8;
  label: 'Easy' | 'Normal' | 'Hard' | 'Extreme';
  moves: number;
  elapsedMs: number;
  streak: number | null;
  mode: 'daily' | 'practice';
}): string {
  const { date, label, gridSize, moves, elapsedMs, streak, mode } = input;

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const time = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const header =
    mode === 'practice'
      ? `RYGO · ${date} · ${label} (${gridSize}×${gridSize}) · Practice`
      : `RYGO · ${date} · ${label} (${gridSize}×${gridSize})`;

  const lines = [header, `${moves} moves · ${time}`];

  if (mode === 'daily' && streak != null && streak > 0) {
    lines.push(`🔥 ${streak}-day streak`);
  }

  return lines.join('\n');
}
