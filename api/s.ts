import type { IncomingMessage, ServerResponse } from 'node:http';

const TITLE = 'RYGO — The daily color-logic puzzle';
const DESCRIPTION =
  'A free daily color-logic puzzle. Rebuild the day’s pattern in the fewest moves. New puzzle every day.';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https';
  const host = (req.headers['x-forwarded-host'] as string) ?? req.headers.host ?? 'localhost';
  const base = `${proto}://${host}`;
  const url = new URL(req.url ?? '/', base);
  const p = url.searchParams.get('p') ?? '';

  const ogImage = `${base}/api/og?p=${encodeURIComponent(p)}`;
  const shareUrl = `${base}/s/${encodeURIComponent(p)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${TITLE}</title>
  <meta name="robots" content="noindex" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="RYGO" />
  <meta property="og:title" content="${TITLE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${TITLE}" />
  <meta name="twitter:description" content="${DESCRIPTION}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta http-equiv="refresh" content="0;url=/" />
</head>
<body>
  <p>Opening RYGO…</p>
  <script>window.location.replace('/');</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(html);
}
