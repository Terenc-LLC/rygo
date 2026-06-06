/** @jsxImportSource react */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import { ImageResponse } from '@vercel/og';
import { decodeResult } from '../src/share/resultCodec.js';

const SIZE_LABELS: Record<number, string> = {
  4: 'EASY · 4×4',
  5: 'NORMAL · 5×5',
  6: 'HARD · 6×6',
  8: 'EXTREME · 8×8',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDate(d: string): string {
  const year = d.slice(0, 4);
  const monthIndex = parseInt(d.slice(4, 6), 10) - 1;
  const day = d.slice(6, 8);
  return `${MONTHS[monthIndex] ?? ''} ${day} · ${year}`;
}

function parOutcomeLabel(m: number, p: number): { label: string; under: boolean } {
  const delta = m - p;
  if (delta < 0) return { label: `${delta} UNDER PAR`, under: true };
  if (delta === 0) return { label: 'EVEN PAR', under: false };
  return { label: `+${delta} OVER PAR`, under: false };
}

function FullMark({ width, height }: { width: number; height: number }) {
  return (
    <svg viewBox="0 0 48 132" width={width} height={height}>
      <rect x="1.25" y="1.25" width="45.5" height="129.5" rx="6" ry="6" fill="none" stroke="#F5F3EE" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="11" fill="#D8463A" />
      <circle cx="24" cy="66" r="11" fill="#E6B73B" />
      <circle cx="24" cy="108" r="11" fill="#2E9D5C" />
    </svg>
  );
}

function GhostMark({ width, height }: { width: number; height: number }) {
  return (
    <svg viewBox="0 0 48 132" width={width} height={height}>
      <rect x="1.25" y="1.25" width="45.5" height="129.5" rx="6" ry="6" fill="none" stroke="rgba(245,243,238,0.08)" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="11" fill="rgba(216,70,58,0.10)" />
      <circle cx="24" cy="66" r="11" fill="rgba(230,183,59,0.10)" />
      <circle cx="24" cy="108" r="11" fill="rgba(46,157,92,0.10)" />
    </svg>
  );
}

function Card({
  dateStr,
  sizeLabel,
  moves,
  outcome,
}: {
  dateStr: string | null;
  sizeLabel: string | null;
  moves: number | null;
  outcome: { label: string; under: boolean } | null;
}) {
  if (moves !== null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#14110E', position: 'relative', fontFamily: '"JetBrains Mono"' }}>
        {/* Inner border frame */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, border: '10px solid rgba(245,243,238,0.09)' }} />
        {/* Upper zone */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '52px 72px 34px 72px', flexShrink: 0 }}>
          {/* Row 1: header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.22em', color: 'rgba(245,243,238,0.36)' }}>RYGO DAILY</span>
            <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.12em', color: 'rgba(245,243,238,0.36)' }}>{dateStr}</span>
          </div>
          {/* Row 2: lockup + difficulty */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <FullMark width={29} height={79.75} />
              <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em', color: '#F5F3EE' }}>RYGO</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.22em', color: 'rgba(245,243,238,0.36)' }}>{sizeLabel}</span>
          </div>
        </div>
        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(245,243,238,0.11)', marginLeft: 72, marginRight: 72, flexShrink: 0 }} />
        {/* Lower zone */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '30px 72px 46px 72px', position: 'relative' }}>
          {/* Ghost mark — declared before score block so it renders behind */}
          <div style={{ position: 'absolute', right: 72, top: 30 }}>
            <GhostMark width={90} height={247.5} />
          </div>
          {/* Score block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span style={{ fontSize: 268, fontWeight: 600, color: '#F5F3EE', lineHeight: 1 }}>{moves}</span>
              <span style={{ fontSize: 34, fontWeight: 400, letterSpacing: '0.18em', color: 'rgba(245,243,238,0.52)' }}>MOVES</span>
            </div>
            {outcome !== null && (
              <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '0.04em', color: outcome.under ? '#2E9D5C' : 'rgba(245,243,238,0.82)' }}>{outcome.label}</span>
            )}
          </div>
          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.07em', color: 'rgba(245,243,238,0.26)' }}>playRYGO.com</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#14110E', position: 'relative', fontFamily: '"JetBrains Mono"' }}>
      {/* Inner border frame */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, border: '10px solid rgba(245,243,238,0.09)' }} />
      {/* Upper zone */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '52px 72px 34px 72px', flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.22em', color: 'rgba(245,243,238,0.36)' }}>RYGO DAILY</span>
        <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.08em', color: 'rgba(245,243,238,0.26)' }}>playRYGO.com</span>
      </div>
      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'rgba(245,243,238,0.11)', marginLeft: 72, marginRight: 72, flexShrink: 0 }} />
      {/* Lower zone */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, padding: '44px 72px 52px 72px', gap: 22, position: 'relative' }}>
        {/* Ghost mark — declared before lockup so it renders behind */}
        <div style={{ position: 'absolute', right: 72, bottom: 52 }}>
          <GhostMark width={72} height={198} />
        </div>
        {/* Lockup row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FullMark width={44} height={121} />
          <span style={{ fontSize: 80, fontWeight: 600, letterSpacing: '-0.02em', color: '#F5F3EE' }}>RYGO</span>
        </div>
        {/* Tagline */}
        <span style={{ fontSize: 26, fontWeight: 400, letterSpacing: '0.12em', color: 'rgba(245,243,238,0.52)' }}>The daily color-logic puzzle</span>
      </div>
    </div>
  );
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https';
  const host = (req.headers['x-forwarded-host'] as string) ?? req.headers.host ?? 'localhost';
  const base = `${proto}://${host}`;
  const url = new URL(req.url ?? '/', base);
  const p = url.searchParams.get('p') ?? '';
  const payload = decodeResult(p);

  const [fontRegular, fontSemiBold] = await Promise.all([
    fetch(`${base}/fonts/JetBrainsMono-Regular.woff`).then((r) => r.arrayBuffer()),
    fetch(`${base}/fonts/JetBrainsMono-SemiBold.woff`).then((r) => r.arrayBuffer()),
  ]);

  const fontConfig = [
    { name: 'JetBrains Mono', data: fontRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: fontSemiBold, weight: 600 as const, style: 'normal' as const },
  ];

  const cacheControl = payload
    ? 'public, immutable, max-age=31536000'
    : 'public, max-age=3600';

  let image: ImageResponse;
  if (!payload) {
    image = new ImageResponse(
      <Card dateStr={null} sizeLabel={null} moves={null} outcome={null} />,
      { width: 1200, height: 630, fonts: fontConfig },
    );
  } else {
    const { d, s, m, p: par } = payload;
    const outcome = par !== undefined ? parOutcomeLabel(m, par) : null;
    image = new ImageResponse(
      <Card
        dateStr={formatDate(d)}
        sizeLabel={SIZE_LABELS[s] ?? `${s}×${s}`}
        moves={m}
        outcome={outcome}
      />,
      { width: 1200, height: 630, fonts: fontConfig },
    );
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', cacheControl);
  res.statusCode = 200;

  try {
    const buf = Buffer.from(await image.arrayBuffer());
    res.end(buf);
  } catch {
    // arrayBuffer() may not work in all Node environments; fall back to piping the web stream
    Readable.fromWeb(image.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
  }
}
