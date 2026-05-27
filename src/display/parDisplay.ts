export const PAR_SLACK = 1;

export function displayedPar(raw: number | null): number | null {
  if (raw === null) return null;
  return raw + PAR_SLACK;
}
