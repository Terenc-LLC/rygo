export interface ResultPayload {
  v: number;
  d: string;     // YYYYMMDD
  s: 4 | 5 | 6 | 8;
  m: number;     // moves
  p?: number;    // par (optional — omit when unknown at share time)
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(str: string): string {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

// Format: "1|YYYYMMDD|size|moves" or "1|YYYYMMDD|size|moves|par"
export function encodeResult(input: Omit<ResultPayload, 'v'>): string {
  const parts: string[] = ['1', input.d, String(input.s), String(input.m)];
  if (input.p !== undefined) parts.push(String(input.p));
  return toBase64Url(parts.join('|'));
}

export function decodeResult(encoded: string): ResultPayload | null {
  if (!encoded) return null;
  try {
    const str = fromBase64Url(encoded);
    const parts = str.split('|');
    if (parts.length < 4 || parts.length > 5) return null;

    const v = parseInt(parts[0], 10);
    const d = parts[1];
    const s = parseInt(parts[2], 10);
    const m = parseInt(parts[3], 10);
    const p = parts[4] !== undefined ? parseInt(parts[4], 10) : undefined;

    if (!isFinite(v) || !isFinite(m)) return null;
    if (p !== undefined && !isFinite(p)) return null;
    if (![4, 5, 6, 8].includes(s)) return null;
    if (!/^\d{8}$/.test(d)) return null;
    if (m < 0 || (p !== undefined && p < 0)) return null;

    return { v, d, s: s as 4 | 5 | 6 | 8, m, p };
  } catch {
    return null;
  }
}
