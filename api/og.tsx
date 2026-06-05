/** @jsxImportSource react */
import { ImageResponse } from '@vercel/og';
import { decodeResult } from '../src/share/resultCodec';

export const config = {
  runtime: 'edge',
};

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
  return (
    <div
      style={{
        display: 'flex',
        width: '1200px',
        height: '630px',
        backgroundColor: '#14110E',
        position: 'relative',
        fontFamily: '"JetBrains Mono"',
      }}
    >
      {/* Dot grid texture */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(245%2C243%2C238%2C0.04)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Perimeter frame */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: '14px solid rgba(245, 243, 238, 0.12)',
        }}
      />
      {/* Inner content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '56px 72px',
          justifyContent: 'space-between',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              color: 'rgba(245, 243, 238, 0.5)',
              fontSize: '20px',
              letterSpacing: '0.18em',
              fontWeight: 400,
            }}
          >
            RYGO DAILY
          </span>
          {dateStr && (
            <span
              style={{
                color: 'rgba(245, 243, 238, 0.5)',
                fontSize: '20px',
                letterSpacing: '0.12em',
                fontWeight: 400,
              }}
            >
              {dateStr}
            </span>
          )}
        </div>

        {/* Brand lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* Vertical stoplight mark */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '9px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '14px 12px',
              border: '2px solid rgba(245, 243, 238, 0.14)',
            }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#D8463A' }} />
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E6B73B' }} />
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2E9D5C' }} />
          </div>
          {/* Wordmark */}
          <span
            style={{
              fontWeight: 600,
              fontSize: '80px',
              color: '#F5F3EE',
              letterSpacing: '-0.02em',
            }}
          >
            RYGO
          </span>
        </div>

        {/* Result block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Size label */}
          {sizeLabel && (
            <span
              style={{
                color: 'rgba(245, 243, 238, 0.5)',
                fontSize: '22px',
                letterSpacing: '0.18em',
                fontWeight: 400,
              }}
            >
              {sizeLabel}
            </span>
          )}
          {/* Hero moves */}
          {moves !== null && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '128px',
                  color: '#F5F3EE',
                  lineHeight: 0.9,
                }}
              >
                {moves}
              </span>
              <span
                style={{
                  fontSize: '32px',
                  color: 'rgba(245, 243, 238, 0.65)',
                  letterSpacing: '0.15em',
                  fontWeight: 400,
                  paddingBottom: '10px',
                }}
              >
                MOVES
              </span>
            </div>
          )}
          {/* Par outcome — omitted when par absent */}
          {outcome && (
            <span
              style={{
                fontSize: '24px',
                color: outcome.under ? '#2E9D5C' : '#F5F3EE',
                letterSpacing: '0.12em',
                fontWeight: 400,
              }}
            >
              {outcome.label}
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              color: 'rgba(245, 243, 238, 0.3)',
              fontSize: '18px',
              letterSpacing: '0.05em',
              fontWeight: 400,
            }}
          >
            playRYGO.com
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const p = searchParams.get('p') ?? '';
  const payload = decodeResult(p);

  const [fontRegular, fontSemiBold] = await Promise.all([
    fetch(`${origin}/fonts/JetBrainsMono-Regular.woff`).then((r) => r.arrayBuffer()),
    fetch(`${origin}/fonts/JetBrainsMono-SemiBold.woff`).then((r) => r.arrayBuffer()),
  ]);

  const fontConfig = [
    { name: 'JetBrains Mono', data: fontRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: fontSemiBold, weight: 600 as const, style: 'normal' as const },
  ];

  if (!payload) {
    // Render brand-only default card — never a broken image
    return new ImageResponse(
      <Card dateStr={null} sizeLabel={null} moves={null} outcome={null} />,
      {
        width: 1200,
        height: 630,
        fonts: fontConfig,
        headers: { 'Cache-Control': 'public, max-age=3600' },
      },
    );
  }

  const { d, s, m, p: par } = payload;
  const outcome = par !== undefined ? parOutcomeLabel(m, par) : null;

  return new ImageResponse(
    <Card
      dateStr={formatDate(d)}
      sizeLabel={SIZE_LABELS[s] ?? `${s}×${s}`}
      moves={m}
      outcome={outcome}
    />,
    {
      width: 1200,
      height: 630,
      fonts: fontConfig,
      headers: { 'Cache-Control': 'public, immutable, max-age=31536000' },
    },
  );
}
