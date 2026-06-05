import { describe, it, expect } from 'vitest';
import { buildShareUrl } from './shareUrl';
import { decodeResult } from './resultCodec';
import { PAR_SLACK } from '../display/parDisplay';

describe('buildShareUrl', () => {
  it('returns a URL starting with https://playRYGO.com/s/', () => {
    const url = buildShareUrl({ date: '2026-06-05', gridSize: 5, moves: 14, dailyPar: { par: 12 } });
    expect(url).toMatch(/^https:\/\/playRYGO\.com\/s\//);
  });

  it('round-trips with par — decoded d/s/m/p match inputs', () => {
    const url = buildShareUrl({ date: '2026-06-05', gridSize: 5, moves: 14, dailyPar: { par: 12 } });
    const payload = url.replace('https://playRYGO.com/s/', '');
    const decoded = decodeResult(payload);
    expect(decoded).toMatchObject({ d: '20260605', s: 5, m: 14, p: 12 + PAR_SLACK });
  });

  it('round-trips without par (dailyPar null) — p is omitted', () => {
    const url = buildShareUrl({ date: '2026-06-05', gridSize: 4, moves: 8, dailyPar: null });
    const payload = url.replace('https://playRYGO.com/s/', '');
    const decoded = decodeResult(payload);
    expect(decoded).toMatchObject({ d: '20260605', s: 4, m: 8 });
    expect(decoded?.p).toBeUndefined();
  });

  it('round-trips without par (dailyPar undefined) — p is omitted', () => {
    const url = buildShareUrl({ date: '2026-06-05', gridSize: 6, moves: 20 });
    const payload = url.replace('https://playRYGO.com/s/', '');
    const decoded = decodeResult(payload);
    expect(decoded?.p).toBeUndefined();
  });

  it('strips dashes from date: YYYY-MM-DD → YYYYMMDD', () => {
    const url = buildShareUrl({ date: '2026-01-31', gridSize: 8, moves: 30, dailyPar: null });
    const payload = url.replace('https://playRYGO.com/s/', '');
    const decoded = decodeResult(payload);
    expect(decoded?.d).toBe('20260131');
  });

  it('encodes displayed par (raw + PAR_SLACK), not raw par', () => {
    const raw = 10;
    const url = buildShareUrl({ date: '2026-06-05', gridSize: 5, moves: 12, dailyPar: { par: raw } });
    const payload = url.replace('https://playRYGO.com/s/', '');
    const decoded = decodeResult(payload);
    expect(decoded?.p).toBe(raw + PAR_SLACK);
  });
});
