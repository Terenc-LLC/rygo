# RYGO — Shareable Result Cards (Dynamic Unfurl) + SEO/Social Meta

> **Status:** v1.0 — approved (June 5, 2026)
> **Owner:** Opus (architecture) / Chris (approval)
> **Feature:** Personalized link-unfurl share cards (Approach "B-server") + homepage SEO/social meta hardening
> **Relationship to prior work:** Replaces the text-only Web Share output. Keeps the homepage's static OG card as the default; adds a per-result dynamic card for completed-puzzle shares.

## 1. Decisions (locked, Chris — June 5, 2026)

* **Positioning / tagline:** "The daily color-logic puzzle" — used in both the SEO `<title>` and the brand tagline.
* **SEO `<title>`:** `RYGO — The daily color-logic puzzle`
* **Meta description:** "RYGO is a free daily color-logic puzzle. Rebuild the day's pattern in the fewest moves using three colors, each with its own reach. New puzzle every day."
* **Result card fields:** date, moves, par outcome (Under / Even / Over par), puzzle size (Easy/Normal/Hard/Extreme + dimensions). **Not** included: time, streak, rank, puzzle number.
* **Share artifact:** B-server — a per-result link whose page serves a dynamically generated `og:image`, so the card **unfurls** (iMessage / X / Slack / Discord) and is tappable back to the site.
* **Result-link `og:title`:** branded ("RYGO — The daily color-logic puzzle"); the image carries the personal result.
* **Domain casing:** retain existing mixed-case `https://playRYGO.com` across meta and share URLs (no lowercase migration).
* **Card variant:** single **dark** card for unfurls; no light variant.
* **Par-unknown:** if par hasn't resolved at share time, omit the par line gracefully.
* **Spoiler-free constraint stands:** the card shows score-class info, never the board.

## 2. Goals / non-goals

**Goals**
* Sharing a completed result produces a personalized, branded card that unfurls anywhere a link unfurls.
* The card is the click target → every share drives traffic back to playRYGO.com.
* Harden the homepage's SEO + social metadata (currently thin) so the generic "come play" link unfurls well and the site ranks.

**Non-goals**
* No accounts, no server-side result storage. Stays anonymous / device-local.
* No board reproduction in the card (spoiler-free).
* No light-mode card variant for the unfurl.

## 3. Architecture overview

Two surfaces share one brand core (name, voice, visual template, fallback image, colors):

| Surface | URL | Meta job | Indexed | Rendered |
| --- | --- | --- | --- | --- |
| Homepage | `https://playRYGO.com/` | SEO + default social card | **Yes** | Static `index.html` tags |
| Per-result share page | `https://playRYGO.com/s/<payload>` | Personalized unfurl only | **No** (`noindex`) | Serverless-rendered head + dynamic `og:image` |

**Unfurl flow for a result link:**
1. Player completes a puzzle → client encodes the result into a compact payload → builds `https://playRYGO.com/s/<payload>`.
2. Player shares via the Share button → `navigator.share({ text, url })` (URL = the `/s` link).
3. Recipient's app scrapes `/s/<payload>` → serverless returns HTML with OG/Twitter tags; `og:image` = `/api/og?p=<payload>`; page is `noindex`.
4. The app fetches `/api/og?p=<payload>` → serverless renders the personalized PNG → app draws the unfurl card.
5. Recipient taps the card → opens `/s/<payload>` → page redirects to `/` so they land in the game.

**Why serverless (not the SPA):** OG scrapers don't execute JavaScript, so per-result tags must be server-rendered. The Vite SPA can't set crawl-visible meta from JS. The homepage is fine as static tags; only `/s` and `/api/og` need functions.

## 4. Homepage meta hardening (static `index.html`)

Current state is thin: only `og:title`, `og:image`, `og:url`, `twitter:card`. Target set (mixed-case domain retained):

```html
<title>RYGO — The daily color-logic puzzle</title>
<link rel="canonical" href="https://playRYGO.com/" />
<meta name="description" content="RYGO is a free daily color-logic puzzle. Rebuild the day's pattern in the fewest moves using three colors, each with its own reach. New puzzle every day." />
<meta name="theme-color" content="#14110E" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="RYGO" />
<meta property="og:title" content="RYGO — The daily color-logic puzzle" />
<meta property="og:description" content="A free daily color-logic puzzle. Rebuild the day's pattern in the fewest moves. New puzzle every day." />
<meta property="og:image" content="https://playRYGO.com/rygo-share-card-dark.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://playRYGO.com/" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="RYGO — The daily color-logic puzzle" />
<meta name="twitter:description" content="A free daily color-logic puzzle. Rebuild the day's pattern in the fewest moves. New puzzle every day." />
<meta name="twitter:image" content="https://playRYGO.com/rygo-share-card-dark.png" />
```

Notes:
* **`og:image:width/height`:** confirm the actual `rygo-share-card-dark.png` dimensions and set to match (standard OG is 1200×630).
* **Optional (nice-to-have):** JSON-LD `WebApplication`/`Game` structured data for richer search results. Not required for v1.
* Independent of the dynamic pipeline; improves the generic link unfurl immediately — ship first.

## 5. Per-result payload encoding

**Stateless, self-describing payload — no server storage.** Fits the no-accounts/device-local ethos; the OG endpoint is a pure render with no DB.

| Key | Meaning | Example |
| --- | --- | --- |
| `v` | schema/template version (cache-busting on card redesign) | `1` |
| `d` | date (YYYYMMDD) | `20260605` |
| `s` | puzzle size (4/5/6/8) | `4` |
| `m` | moves | `9` |
| `p` | par (omit if unknown at share time) | `7` |

* Serialize as a compact delimited string, then **base64url** → ~20–30 char path segment. Versioned via `v`.
* **Par outcome derived server-side** from `m` vs `p` (`m<p` → "Under par", `m===p` → "Even par", `m>p` → "Over par"). If `p` absent, omit the par line.
* Values are client-supplied and spoofable — **accepted** for casual sharing (no stakes, no storage).

## 6. `/api/og` — dynamic card renderer

* Vercel serverless/edge function using `@vercel/og` (Satori → SVG → PNG).
* Decodes `p=<payload>`; renders the **dark framed card** with real values: formatted date, size label (e.g. "Easy · 4×4"), moves as the hero number, par-outcome line (green when under par; ink/paper otherwise). Reuses the approved framed-dark layout (PR #84) reproduced in Satori-compatible JSX/flexbox.
* **Fonts:** embed the brand mono face (JetBrains Mono) in the function; Satori needs font bytes at render time.
* **Output:** 1200×630 PNG.
* **Caching:** deterministic by `(payload, v)` → `Cache-Control: public, immutable, max-age=31536000`. Card redesigns bump `v`.
* **Error handling:** unparseable payload → render the generic default card (never a broken image).

## 7. `/s/<payload>` — share page (unfurl target)

* Serverless function (Vercel rewrite `/s/:payload`). Returns minimal HTML:
  * `og:title` = branded line; `og:description`; `og:url` = the `/s` link; `og:image` = `/api/og?p=<payload>`; full Twitter tags.
  * `<meta name="robots" content="noindex">` — infinite/ephemeral pages stay out of the index. (`noindex` does not block unfurls; OG scraping is independent of indexing.)
  * Body: tiny "Opening RYGO…" with redirect to `/` (meta-refresh + JS) so a human who taps the card lands in the game.
* On bad payload → serve homepage meta as a graceful fallback.

## 8. Client integration (Share button)

* New util `src/share/shareUrl.ts`: `encodeResult(input) → payload`, `buildShareUrl(input) → https://playRYGO.com/s/<payload>`.
* `Summary.handleShare`:
  * Native: `navigator.share({ text: shareText, url: shareUrl })` → recipient gets the unfurled personalized card **plus** the spoiler-free text.
  * Clipboard fallback: copy `${shareText}\n${shareUrl}`.
  * Textarea fallback: include the URL.
* `buildShareString` drops the trailing bare `playRYGO.com` line (URL now travels in the `url` field). Update `shareString` tests.
* **Par timing:** encode `p` only when resolved; card degrades gracefully.

## 9. Privacy / trust

* No PII; no accounts; no server-side result storage. Payload = date/size/moves/par only.
* Result pages `noindex`. Values spoofable (accepted). No board, no spoilers.

## 10. Proposed issue breakdown (milestone: M4 — Polish)

1. **Homepage meta hardening** — static `index.html`: SEO `<title>`, description, full OG + Twitter set, canonical, `theme-color`; verify `og:image` dimensions. *Small. Independent. Ship first.*
2. **Result encoding + share-URL + Summary integration (client)** — `shareUrl.ts`, `navigator.share({text,url})`, clipboard/textarea fallbacks, drop bare-domain line, tests. *Depends only on the §5 contract; unfurls once #3+#4 ship.*
3. **`/api/og` dynamic card renderer** — `@vercel/og` + Satori card template + brand font embed + caching. *Main effort.*
4. **`/s/:payload` share page + `vercel.json` rewrites** — server-rendered meta, `noindex`, redirect-to-app; ensure SPA fallback excludes `/s` and `/api`. *Depends on #3's URL contract.*

Recommended order: **#1 now → #3 → #4 → #2** (#3 and #4 may be combined if preferred). #2 can land any time but only unfurls once #3+#4 are live.

## 11. Risks / tradeoffs

* **First Vercel serverless functions in this repo** (separate from Supabase edge functions). Same host; deploys with the Vercel pipeline.
* **`@vercel/og` + font embedding** — bundle size and cold-start latency on first scrape; mitigated by immutable caching keyed by payload.
* **Satori CSS subset** — the framed-dark card must be reproduced in Satori-compatible flexbox/JSX (no arbitrary CSS). Main implementation cost.
* **Cache-busting** — template changes require bumping `v`.
* **Spoofable values** — accepted; casual share, no stakes, no storage.
