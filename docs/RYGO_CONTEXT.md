# RYGO_CONTEXT.md

> **Source of truth:** `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md` on GitHub main (migrated from Linear in Process v2.4 docs-only PR, May 3, 2026).
> **Read this at the start of every Claude Code session** via `GitHub:get_file_contents` against `main`.
> **Update this at the end of every Claude Code session** as part of the issue's PR (allowlisted sections only). Session-log entries go in [`RYGO_SESSION_LOG.md`](./RYGO_SESSION_LOG.md), not here.

## ⚠️ Editing rules for this document

Code may **only** modify these sections:

* **Session log** — now in [`RYGO_SESSION_LOG.md`](./RYGO_SESSION_LOG.md). Append a new entry at the bottom of that file; never edit older entries.
* **Architecture notes** (add new feature entries; updating existing entries is OK but only with new factual information about what shipped).
* **Issue map** (update status indicators on existing entries: ✅ In Review, ✅ Unblocked, etc. Do NOT mark Done — that's Opus's job after Chris reports a merge, via a docs-only PR.).

Code may **not** modify these sections without explicit Opus instruction (Opus updates these via docs-only PRs):

* Project identity
* Tech stack (Opus updates this when a new dependency lands or a merged change requires it; Code can suggest additions in the session log)
* Source-of-truth documents
* Key design decisions (locked) — including all subsections
* Open questions
* Coding conventions

If Code believes a locked decision needs to change, Code stops and posts a Linear comment asking Opus to open a docs-only PR with the update. **Never silently restructure or remove content from this document.**

**Concurrency note:** since v2.4 (May 3, 2026), this doc lives in git rather than Linear. Parallel branches touching the same sections create surfaced merge conflicts at PR time rather than silent last-write-wins clobbering. The mitigation is unchanged: Chris stages Code launches sequentially, and Opus avoids docs-only PRs while Code is mid-session. (Note, May 24: a Code branch that predates an open Opus docs-only PR can still collide on resolution — land Opus docs PRs before launching the next Code session.)

## Project identity

* **Brand:** **RYGO** (locked May 2, 2026 — codename was "Yergers"). Final brand. See `docs/RYGO_Game-Design-Document.md` v1.5 "Brand identity" section.
* **What it is:** Daily mobile-first logic puzzle game where players recreate a target color pattern using three colors with traffic-light meaning and different placement reach.
* **Linear project ID:** `7cdc0a29-1925-49dd-a731-b3945fabc149` (project name: RYGO)
* **Linear team:** Terenc (key TER, ID `b8807d15-3de1-4c5a-b72e-a9a3872a8e82`) — issue identifiers stay TER-NNN
* **GitHub repo:** `Terenc-LLC/rygo` — [https://github.com/Terenc-LLC/rygo](<https://github.com/Terenc-LLC/rygo>)
* **Production URL:** [https://playRYGO.com](<https://playRYGO.com>) — **live** (Vercel project rename + custom-domain wiring completed May 25, 2026, [TER-151](https://linear.app/terenc/issue/TER-151)). Auto-deploys on push to `main`.

## Tech stack

* **Build tool:** Vite 8
* **Framework:** React 19
* **Language:** TypeScript 6 (strict mode)
* **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js`). Brand color tokens added in [TER-152](https://linear.app/terenc/issue/TER-152).
* **Dark mode:** Class-based. `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`. `class="dark"` set on the html element by default in `index.html`. Toggle UI shipped in [TER-137](https://linear.app/terenc/issue/TER-137).
* **Testing:** Vitest v4 with jsdom environment
* **State:** React local state for MVP. No global state library.
* **Persistence (MVP):** localStorage is the source of truth for all gameplay/retention state — theme preference (key `rygo:theme`; one-time migration shim from `yergers:theme` shipped in [TER-151](https://linear.app/terenc/issue/TER-151)) and daily play history / streaks (key `rygo:state`; shipped in [TER-142](https://linear.app/terenc/issue/TER-142)). **Server-side (M5):** a write-only Supabase `scores` table holds server-verified leaderboard results, written only by the edge function under the service role (clients never write directly); it never holds gameplay/retention state.
* **Backend:** Supabase (paid), introduced for the M5 anonymous daily leaderboard (design doc: `docs/RYGO_Leaderboard-Design.md`). **Best-effort only — gameplay never depends on the network.** Pattern generation stays client-side, daily seed derived from date; leaderboard submission and rank-read are fire-and-forget and must never block, delay, or break a play or the Summary. (Flipped from "None for MVP" in the M5 backend-flip docs PR, May 25, 2026.)
* **Hosting:** Vercel.
* **Package manager:** npm
* **Node:** Developed with Node 25.8.1. Minimum required: Node 20. `engines` field locked in `package.json`: `"node": ">=20"` (added in [TER-201](https://linear.app/terenc/issue/TER-201)).
* **Icon library:** None. Three gameplay shapes (square, triangle, circle) plus theme-toggle icons (sun, moon) implemented inline as React components in `src/components/Shapes.tsx`. Brand mark (vertical stoplight) added to chrome in [TER-151](https://linear.app/terenc/issue/TER-151).
* **Continuous integration:** GitHub Actions workflow at `.github/workflows/ci.yml`. Runs `npm ci → npm run build → npm run test` on every PR against `main` and on every push to `main`. Pinned to Node 20. Job name: `build-and-test` — this is the required status check for branch protection.
* **Brand assets:** unzipped pack lives at `public/` (build-served: favicons, OG card, app icons) and `design/` (export SVGs: mark, lockup, wordmark) in the repo. Source files (Figma originals, RYGO Logo.html design canvas) in a Drive folder linked from this doc once provided.

## Source-of-truth documents

* **RYGO Game Design Document** — `Terenc-LLC/rygo/docs/RYGO_Game-Design-Document.md` on GitHub main. Currently at **v1.9** (May 27, 2026). v1.9 reflects the M6 logic pivot (always-visible reference thumbnail, placements-only scoring, par framing). Was titled "Yergers — Game Design Document" before brand finalization. (Migrated from Linear in v2.4 docs-only PR, May 3, 2026.)
* **RYGO Anonymous Daily Leaderboard (Design Doc)** — `Terenc-LLC/rygo/docs/RYGO_Leaderboard-Design.md` on GitHub main. Source of truth for the M5 leaderboard feature. Approved by Chris May 25, 2026; the "no backend" flip it required is in GDD v1.8 and this doc's Tech stack / Retention scope.
* **Terenc Development Process** — `Terenc-LLC/rygo/docs/Terenc-Development-Process.md` on GitHub main. Currently at **v2.5** (May 25, 2026). Canonical copy per project; org-level synchronization is a manual responsibility until a central terenc-org doc location is established.
* **This context document** — `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md` on GitHub main. Title is `RYGO_CONTEXT.md` (was `YERGERS_CONTEXT.md`). (Migrated from Linear in v2.4 docs-only PR, May 3, 2026.)
* **Session log** — `Terenc-LLC/rygo/docs/RYGO_SESSION_LOG.md` on GitHub main. Append-only record of every Code session and Opus close-out. Split out of the context document in v2.5.

## Key design decisions (locked)

These are settled. Don't re-litigate without raising it explicitly with Opus.

### Brand identity (locked May 2, 2026)

* **Brand:** RYGO (final, May 2, 2026). Replaces codename "Yergers." Domain: [playRYGO.com](<http://playRYGO.com>).
* **Mark:** vertical stoplight — rounded rectangle border (2.5px stroke, 6px corner radius) with three colored dots stacked top-to-bottom (red / yellow / green). Mark ratio 48 × 132.
* **Wordmark:** "RYGO" in JetBrains Mono, weight 600, tracking −0.02em, all caps.
* **Color tokens:**
  * **Ink** `#14110E` — primary foreground / on-light surfaces
  * **Paper** `#F5F3EE` — primary background / on-dark surfaces
  * **RYGO Red** `#D8463A` — top signal dot, also red game cells
  * **RYGO Yellow** `#E6B73B` — middle signal dot, also yellow game cells
  * **RYGO Green** `#2E9D5C` — bottom signal dot, also green game cells
* **Brand palette IS the game palette** (May 2, 2026 — Option 1 from the brand decision). The previous Tailwind starting values (`red-600` / `amber-400` / `green-600`) were placeholders. WCAG AA contrast preserved against the chosen shape fills (Paper or Ink). Locked in design doc v1.5; implementation shipped in [TER-152](https://linear.app/terenc/issue/TER-152).
* **Asset pack** (20 files, see `design/README.md`):
  * SVGs: mark (light/dark), wordmark (light/dark), lockup (light/dark), app icon (light/dark), share card (light/dark)
  * PNGs: app-icon-1024, app-icon-512, favicon-16/32/180, lockup-light/dark, share-card-light/dark
  * `public/` for build-referenced assets; `design/` for export-grade SVGs.
* **Usage rules:** clear space ≥ one mark width; minimum lockup 120px / mark alone 24px; don't recolor signal dots, stretch the mark, swap the typeface, or set the wordmark below weight 500.

### Game mechanics

* **Three colors only:** red 🔴, yellow 🟡, green 🟢.
* **Reach is orthogonal only.** No diagonals.
* **Reach patterns:**
  * **Red** = 1 cell.
  * **Yellow** = plus shape (cell + 4 orthogonal neighbors, clipped to grid).
  * **Green** = the cell, then propagates outward in each of the four cardinal directions; **propagation in a direction stops at the first non-empty cell** or the grid edge. (Blocking: shipped [TER-149](https://linear.app/terenc/issue/TER-149), May 2, 2026.)
* **Blocking** affects only green in practice (red has 1-cell reach; yellow's plus has no cells "beyond" the immediate neighbors). Non-empty cells halt green's propagation in the relevant direction; the blocker is not overwritten and cells beyond it are not affected.
* **Overwrite hierarchy:** red > yellow > green > empty. Red overwrites everything. Yellow overwrites green only. Green only fills empty cells.
* **Clearing (same-color tap)** — when the active color matches the tapped cell's color, the tap clears via that color's reach pattern, with blocking, but only affects same-color cells. Mixed-color cells in the reach footprint are untouched. Cleared cells become empty. (Introduced May 2, 2026 to give players a path back from misplays without an undo stack.)
* **Pattern generation by construction:** generator emits a solution sequence first, simulates it on an empty board, the resulting board IS the target. Solvability is therefore guaranteed.
* **Pattern requirements (May 2, 2026):**
  * **Full coverage** — every cell in the target is colored. No empty cells in any generated target.
  * **All three colors required** — every generated target uses red, yellow, AND green. Two-color targets are rejected and regenerated.
* **Timer starts on game-screen mount** (M6 logic pivot, locked May 27, 2026 in [TER-221](https://linear.app/terenc/issue/TER-221)). The move counter starts at 0. There is no separate "first reveal" — the loop is purely placement and clearing.
* **Timer is an active-play accumulator (locked; lands in [TER-167](https://linear.app/terenc/issue/TER-167)).** Measures active play time: runs while the puzzle is open (including through the transition blanks), banks and pauses when the attempt is set aside (backgrounding, refresh, quit-to-picker) and resumes on return, never resets on Restart, and discards a stale attempt at UTC rollover; the in-progress board is restored on return. (GDD v1.7.)
* **Auto-detection of completion → validation sequence.** When the playable board matches the target exactly, the timer freezes immediately and a ~750–1000ms validation sweep plays; the solved board then holds and the player taps to advance to the Summary (no timed auto-advance; reduced-motion shows the solved board immediately and still requires the tap). (Locked design doc v1.5/v1.6; sweep shipped in [TER-153](https://linear.app/terenc/issue/TER-153); tap-to-advance shipped in [TER-169](https://linear.app/terenc/issue/TER-169), GDD v1.6.)
* **Pattern and playable board are visible side by side at all times** (M6 logic pivot, locked May 27, 2026 in [TER-221](https://linear.app/terenc/issue/TER-221)). The target pattern renders as a small reference thumbnail (`w-28`) next to the play grid in the game-screen header cluster; tapping it opens an accessible `role="dialog"` overlay with shape-legible cells (free look — no move cost, no timer impact). There is no reveal/hide loop and no "Get ready..." blank.

### Difficulty ladder

Four sizes (May 2, 2026 — was three previously; shipped in [TER-145](https://linear.app/terenc/issue/TER-145)):

* **Easy:** 4×4 (16 cells)
* **Normal:** 5×5 (25 cells)
* **Hard:** 6×6 (36 cells)
* **Extreme:** 8×8 (64 cells)

### Scoring

* **Moves are the score.** Time is shown during play (light tension cue) and as the tiebreaker for any leaderboard or aggregate, but does not enter the score formula itself.
* **Display format:** `{moves} moves · {M:SS}` (e.g., `8 moves · 2:14`). The "moves" line is the headline; time is supporting context.
* **Hook surface:** `useGame` exposes `moveCount` and `elapsedMs` separately; the UI labels `moveCount` as "Score." No separate `score` field on the hook — would just be a passthrough rename. If scoring ever evolves to a formula, add the field then.
* **Placements-only scoring (M6 logic pivot, locked May 27, 2026 in [TER-221](https://linear.app/terenc/issue/TER-221); reverses the earlier "every meaningful click counts" rule):**
  * **Placement** (tapping an empty/non-matching cell with a color active) → **+1 move**
  * **Clearing** (tapping a matching-color cell with that color active) → **+1 move**
  * **Color switch** in the picker → **0 moves** (free)
  * **No-op tap** (already-active color, or a tap the overwrite hierarchy rejects) → **0 moves**
  * The pattern is always visible, so there is no reveal/hide cost.
* **Par framing (M6 logic pivot, locked May 27, 2026):**
  * Each daily puzzle has a precomputed `raw par` stored in the Supabase `daily_par` table — proven optimum where the [TER-220](https://linear.app/terenc/issue/TER-220) solver completes within budget, generator solution length as a soft fallback otherwise. Pipeline lives in [TER-222](https://linear.app/terenc/issue/TER-222).
  * The display layer applies a +1 slack: `displayedPar = rawPar + PAR_SLACK` (`PAR_SLACK = 1` in `src/display/parDisplay.ts`). Every par is therefore beatable — the asymmetry between proven and soft pars is invisible to the player.
  * **During play:** the status bar shows `Par {displayedPar}` next to `Score {moveCount}` — no live delta indicator.
  * **Summary:** the result is shown relative to par in golf framing: `−N Under par` (positive accent, brand `rygo-green`), `Even par` (neutral), `+N Over par` (neutral, never styled negatively).
  * The word "optimal" is never used in the par UI. No perfect/optimal badge. The `proven` flag is internal-only and is never surfaced to the player. Shipped in [TER-223](https://linear.app/terenc/issue/TER-223).

### Visual / accessibility (MVP requirement, not polish)

* **Mobile-first.** Portrait phone is the primary design target.
* **Color-blind accessibility is MVP.** Every non-empty cell renders both a background color AND a distinct shape. Color alone is never the sole identifier of state.
* **Color and shape pairings (locked v1.5 with brand palette):**
  * Red → square (Paper `#F5F3EE` fill on RYGO Red `#D8463A` background)
  * Yellow → triangle apex up (Ink `#14110E` fill on RYGO Yellow `#E6B73B` background)
  * Green → circle (Paper `#F5F3EE` fill on RYGO Green `#2E9D5C` background)
* **Color picker buttons** also display the shape, with active color indicated by a non-color cue (border / ring) so the active state is meaningful for color-blind users. **The active-color cue must be visible in both light and dark themes** — not a white/light ring that disappears against a light background.
* **All cells are** `<button>` elements with `aria-label`s describing state and position (e.g., "Red cell at row 2, column 3").
* **Shapes are inline SVGs**, defined in `src/components/Shapes.tsx`.
* **Reference thumbnail tap-to-zoom** (locked May 27, 2026 in the M6 logic pivot). The always-visible `RefThumbnail` stays `w-28` for all grid sizes (no vertical-budget cost). It is a real button (`aria-label="Enlarge target pattern"`, `aria-haspopup="dialog"`) that opens a `role="dialog"` `aria-modal="true"` overlay with cells well above the ~15px shape-legibility threshold for every size. Three dismiss paths (close button, tap-outside, Esc); focus lands on the close button on open and returns to the trigger on close. The enlarge is a free look — no move cost, no event appended, no timer interaction; only reachable during the `playing` phase.
* **No reliance on color alone for any state indicator** anywhere in the UI. (The win-state success cue in [TER-153](https://linear.app/terenc/issue/TER-153) pairs the green glow with a "Solved!" label and an `aria-live` announcement.)
* **Cell size at 8×8 on iPhone SE viewport is ~43px**, marginally below the 44px Apple HIG target. Accepted tradeoff per Chris on May 1, 2026 (the entire cell is the hit target; revisit if real users miss taps).

### Theming

* **Two themes:** dark (default) and light. User-toggleable.
* **Implementation:** Tailwind v4 class-based dark mode via `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`. The `dark` class on the root html element is the source of truth.
* **Default:** dark. Applied via `class="dark"` on the html element in `index.html`.
* **Persistence:** localStorage key `rygo:theme` (migrated from `yergers:theme` in [TER-151](https://linear.app/terenc/issue/TER-151)), values `'dark'` or `'light'`. Persisted value overrides the default on load.
* `prefers-color-scheme` is NOT respected for first-time visitors. Default dark for everyone.
* **Game-content colors are theme-invariant.** Red, yellow, green, and their shape fills are identical in both modes.
* **Surface palette uses brand Ink/Paper (locked v1.5; shipped in** [TER-152](https://linear.app/terenc/issue/TER-152)**):**
  * Light mode page background: Paper `#F5F3EE`
  * Dark mode page background: Ink `#14110E`
  * Light mode primary text: Ink
  * Dark mode primary text: Paper
* **Theme-dependent surfaces** (page bg, page text, empty cells, borders, button bgs, status bar, **active-color picker indicator**): use brand colors via Tailwind v4 `@theme` tokens (defined in [TER-152](https://linear.app/terenc/issue/TER-152)).
* **Theme toggle UI:** small icon-only button in the top-right corner of every screen. Sun icon when in dark mode, moon icon when in light mode. Defined in `src/components/ThemeToggle.tsx`. The `useTheme` hook lives at `src/hooks/useTheme.ts`. Both shipped in [TER-137](https://linear.app/terenc/issue/TER-137).

### Retention scope (MVP+ pre-launch)

* The four retention features — daily play tracking, once-per-day lock per level, per-level stats, and a spoiler-free share button (score + streak, never the board) — are required before public launch but are not strict MVP. Tracked in M3 — Daily ritual (pre-launch) milestone via [TER-142](https://linear.app/terenc/issue/TER-142), [TER-143](https://linear.app/terenc/issue/TER-143), [TER-144](https://linear.app/terenc/issue/TER-144). The per-level score-distribution histogram was descoped from [TER-143](https://linear.app/terenc/issue/TER-143) on May 24, 2026 — the per-level cards ship a today-vs-personal-best comparison instead (four histograms broke the no-scroll requirement); the histogram is deferred to a post-launch stats-v2 pass.
* Anonymous, per-device only; localStorage is the source of truth for gameplay/retention. **M5 adds an optional, best-effort Supabase backend** (anonymous auth + server-verified daily scores) for the leaderboard — it never gates play, stores no PII (anonymous id only), and is fully degradable (offline/failure → result stays local, rank line silently omitted). Named accounts / multi-device sync stay out of scope; the anon-auth foundation makes them an additive upgrade later. (Flipped from "No accounts, no backend, no cloud sync" in the M5 backend-flip docs PR, May 25, 2026; design: `docs/RYGO_Leaderboard-Design.md`.)
* Hard never-repeat puzzle guarantee is NOT in scope — generator's seed space already gives statistically-perfect uniqueness for the relevant time horizon.

## Open questions (do not implement these without Opus + Chris approval)

* Tutorial / first-run experience (interactive walkthrough) — defer to polish (M4). A *static* "How to play" reference screen shipped in [TER-192](https://linear.app/terenc/issue/TER-192) (picker-only, on-demand) — that is reference only, not the interactive first-run tutorial, which remains M4.
* Sound design — design intent locked (percussive wooden tap on placement, three-note R-Y-G ascending chime on completion); implementation deferred to M4.
* Cascade animations — defer to polish (M4). The win-state validation sweep shipped in [TER-153](https://linear.app/terenc/issue/TER-153) (M2); any further cell-fill / completion cascades remain M4.
* Respect `prefers-color-scheme` on first visit — currently no.
* Shapes opt-out toggle — default shapes ON (color-blind accessibility is MVP and stays the default); add an optional user toggle to hide shapes, paired with future CVD-friendly color schemes as the accessible path for players who turn shapes off. Post-launch — needs a settings surface (none exists yet). Note: aggregate "track which choice users make" is not possible under the current no-backend / per-device-localStorage architecture; only the local preference can be stored. (Reframed May 24, 2026 from "always-on for MVP, revisit if users complain.")
* Pattern generator solution-length ranges — v1.5 ranges live ([TER-248](https://linear.app/terenc/issue/TER-248)): 4×4 8–11, 5×5 10–14, 6×6 13–18, 8×8 18–26 (starting L; MOVE_CAP per size in the Pattern generator architecture note). Still to be retuned with real-play data; the per-size feel — especially whether Easy 4×4 stays easy at the longer lengths — remains a Chris manual-verify item.
* Pattern generator color weights (red 0.40 / yellow 0.40 / green 0.20) are a starting hypothesis from [TER-146](https://linear.app/terenc/issue/TER-146) — retune with real-play data.

*(Resolved May 3, 2026: "Migrate context doc from Linear to GitHub" — done in v2.4 docs-only PR. Three Linear last-write-wins clobbering incidents drove the call. Removed from open questions.)*

*(Resolved May 24, 2026: "Add max-attempts cap on the generator rejection-retry loop" — done in [TER-146](https://linear.app/terenc/issue/TER-146): the outer loop is capped at 100 attempts and throws a descriptive seed+gridSize error if exhausted. With the Phase A green guarantee the cap is effectively unreachable; the bulk-1000 test confirms termination. Removed from open questions.)*

## Architecture notes

### Placement engine — UPDATED (`src/engine/placement.ts`)

```ts
export function reachCells(board: Board, color: Color, row: number, col: number): [number, number][]
export function applyMove(board: Board, color: Color, row: number, col: number): Board
```

Pure, immutable. Throws `RangeError` on out-of-bounds. Board indexed `[row][col]`. 96 unit tests total, all passing.

**Blocking semantics (shipped in** [TER-149](https://linear.app/terenc/issue/TER-149)**, May 2, 2026):** `reachCells` replaces the old `targetCells` helper and now takes `board` as its first argument. Green propagates outward from the placed cell in each cardinal direction; propagation stops before the first non-empty cell (blocker not included) or at the grid edge. The placed cell `(row, col)` is always in the reach regardless of what's there — only the propagation phase consults the board. Red (1 cell) and yellow (plus shape, no propagation) are unchanged. `reachCells` is exported for use by other engine functions. **Clearing functions (shipped in** [TER-147](https://linear.app/terenc/issue/TER-147)**, May 2, 2026):** `clearCells(board, color, row, col): [number, number][]` and `applyClear(board, color, row, col): Board` are exported. Green clearing uses its own traversal (stops at first non-green cell, not first non-empty cell — asymmetric with `reachCells`) and does NOT reuse `reachCells`.

### Grid component — UPDATED (`src/components/Grid.tsx`, `src/components/Shapes.tsx`)

```tsx
interface GridProps {
  board: Board;
  onCellTap?: (row: number, col: number) => void;
  size: 4 | 5 | 6 | 8;
}
export function Grid({ board, onCellTap, size }: GridProps): JSX.Element;
```

Three shape components in `Shapes.tsx`: `Square`, `Triangle`, `Circle`. All inline SVG, `viewBox="0 0 100 100"`, `fill="currentColor"`, `aria-hidden="true"`. CSS grid via `grid-cols-{size}` lookup map with `gap-1`. Each cell is a `<button aspect-square rounded-md>` with shape SVG at `w-1/2`. `data-testid` on each shape SVG (`shape-square`, `shape-triangle`, `shape-circle`) for clean RTL test assertions. Tests passing.

`GRID_COLS` lookup map: `{ 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 8: 'grid-cols-8' }`. All four literal class strings are present so Tailwind v4 static analysis detects them. `grid-cols-5` confirmed in `npm run build` CSS output ([TER-145](https://linear.app/terenc/issue/TER-145)).

`Shapes.tsx` also exports `Sun` and `Moon` inline SVG components (shipped in [TER-137](https://linear.app/terenc/issue/TER-137)) for the theme toggle. Both have `data-testid` (`shape-sun`, `shape-moon`).

**Updated (May 2, 2026,** [TER-152](https://linear.app/terenc/issue/TER-152)**):** Cell backgrounds swapped to `bg-rygo-red` / `bg-rygo-yellow` / `bg-rygo-green`. Shape fills swapped to `text-paper` (on red/green) and `text-ink` (on yellow). Class-name assertions in `Grid.test.tsx` updated to match.

**Updated (May 2, 2026,** [TER-148](https://linear.app/terenc/issue/TER-148)**):** Cell `<button>` transitions expanded to `transition-[transform,background-color,color] duration-150` (was `transition-transform duration-100`) to animate color changes smoothly. `active:scale-95` retained for interactive cells only.

**Updated (May 24, 2026,** [TER-168](https://linear.app/terenc/issue/TER-168)**):** Light-mode empty-cell background changed from `bg-gray-100` to `bg-stone-300` (`#D6D3D1`, ~1.35:1 vs Paper) so empty cells and grid lines are visible in light mode. Dark mode (`dark:bg-gray-800`) unchanged.

**Updated (June 2, 2026,** [TER-290](https://linear.app/terenc/issue/TER-290)**):** Grid container given `bg-grid-line dark:bg-ink p-px rounded-md` — the `--color-grid-line` token (`#78716C`, stone-500) shows through the `gap-1` gaps as hairline dark lines in light mode, and the 1px padding creates an outer edge so the board reads as bounded. Empty-cell fill stays `bg-stone-300`; the line carries structure independently. Dark mode uses `dark:bg-ink` (Ink shows through gaps = current behavior, no regression). WCAG 1.4.11 non-text contrast verified: grid-line `#78716C` is **4.33:1 vs Paper** `#F5F3EE` and **3.22:1 vs stone-300** `#D6D3D1` — both ≥ 3:1 required. Same treatment applied to `RefThumbnail` (thumbnail button container and overlay board).

### Page chrome theming — UPDATED (`src/App.tsx`, [TER-152](https://linear.app/terenc/issue/TER-152))

`<main>` uses `bg-paper dark:bg-ink`. Primary text uses `text-ink dark:text-paper`. Page background and text respond to the `dark` class on the html element. Game-content colors (cells, shape fills) remain theme-invariant. Brand tokens defined via Tailwind v4 `@theme` block in `src/index.css`. Shipped in [TER-152](https://linear.app/terenc/issue/TER-152), May 2, 2026.

### Header lockup — READY (`src/components/DifficultyPicker.tsx`)

Two `<img>` tags using `/rygo-lockup-light.svg` (with `dark:hidden`) and `/rygo-lockup-dark.svg` (with `hidden dark:block`) at `h-16` (64 px). Replaces the previous plain-text `<h1>Yergers</h1>`. Wrapped in a `px-6` container to provide clear space ≥ one mark width per brand rules. Shipped in [TER-151](https://linear.app/terenc/issue/TER-151).

### Pattern generator — READY (`src/engine/generator.ts`)

```ts
export function generatePuzzle(seed: string, gridSize: 4 | 5 | 6 | 8): GeneratedPuzzle;
export function dailySeed(date: Date): string; // returns 'RYGO-YYYY-MM-DD' from UTC date
```

Deterministic, seeded puzzle generator. Zero external dependencies. Implementation details:

* **RNG:** mulberry32 (hand-rolled ~10-line PRNG) seeded via a djb2-style string hash. No npm dependency.
* **Algorithm (v1.4 — [TER-146](https://linear.app/terenc/issue/TER-146)):** Generate a starting sequence of L moves → simulate on empty board → if fully covered and all-3-colors, accept (if non-trivial). Otherwise: Phase A — append moves targeting empty cells, forcing green if green is absent from the current board state (guarantees a window for green before the board fills); Phase B — fix any remaining missing non-green colors (red or yellow can overwrite existing cells). Abort attempt if total moves exceed MOVE_CAP; outer loop retries up to 100 times before throwing. Solvability is guaranteed by construction.
* **Color weights:** red 0.40, yellow 0.40, green 0.20. Green raised from 0.15 (TER-149 blocking limits effective reach); Phase A green-forcing closes the structural gap. Starting hypothesis — retune with real-play data.
* **Trivial-puzzle rejection:** rejects and retries if all-empty, all-one-color, >85% single color, or first move alone produces the target. Each retry uses `hash(seed + "/" + attempt)` so retries are independent but output is deterministic from the user-facing seed.
* **Solution length (v1.5 — [TER-248](https://linear.app/terenc/issue/TER-248)):** Starting L — 4×4: 8–11, 5×5: 10–14, 6×6: 13–18, 8×8: 18–26. MOVE_CAP — 4×4: 16, 5×5: 18, 6×6: 26, 8×8: 40. Floors raised ~2–4 vs v1.4 to produce harder dailies under the M6 always-visible-pattern model; MOVE_CAPs for 4×4, 6×6, and 8×8 raised by the minimum needed (1–4 moves) to keep the cap-exceeded retry rate ≤ 5%. 5×5 MOVE_CAP unchanged. Bulk-1000 test: 100% full coverage + all-3-colors, cap-exceeded rate ≤ 5%, max attempts ≤ 10. Actual solution length = starting L + any appended moves (≤ MOVE_CAP).
* **Full coverage + all-3-colors:** every target cell is red/yellow/green (no empty). All three colors appear at least once. Both conditions verified before accepting a puzzle. Bulk-1000 test confirms 100% compliance and cap-exceeded rate ≤ 5%.
* **dailySeed prefix:** `'RYGO-'` (switched from `'YERGERS-'` in [TER-151](https://linear.app/terenc/issue/TER-151)).

### CI / build pipeline — READY (`.github/workflows/ci.yml`)

GitHub Actions workflow runs on every PR against `main` and every push to `main`. Single job `build-and-test` on `ubuntu-latest`, Node 20 (pinned), npm cache enabled. Steps: `npm ci` → `npm run build` → `npm run test`. The job name `build-and-test` is the required status check for branch protection. Vercel deployment continues to auto-deploy on push to `main` independently.

### Par pipeline push trigger — READY (`.github/workflows/compute-par.yml`) [TER-314]

Added a `push` trigger to `.github/workflows/compute-par.yml` filtered to engine paths (`src/engine/**`, excluding test files, plus `scripts/compute-par.ts`). A merge to `main` that changes the generator, placement engine, solver, board-hash, or compute script now kicks off `compute-par` automatically — closing the staleness window where `getDailyPar` silently returned `null` after an engine change (e.g. TER-248 retune). The weekly Monday cron and `workflow_dispatch` are unchanged. Known limitation: solver-only changes that leave generated boards unchanged (same `generation_hash`) still skip re-solve — those continue to need a manual `workflow_dispatch` (deliberate; no `compute-par.ts` change needed here).

Shipped in [TER-314](https://linear.app/terenc/issue/TER-314), June 4, 2026.

### Edge function deploy workflow — READY (`.github/workflows/deploy-functions.yml`) [TER-295]

GitHub Actions workflow that auto-deploys all Supabase edge functions. Triggers: `workflow_dispatch` (for manual or first-run remediation) and `push` to `main` filtered on `paths: ['supabase/functions/**']` — catches both direct function edits and engine-sync changes under `supabase/functions/_shared/`. Single job `ubuntu-latest`: `actions/checkout@v4` → `supabase/setup-cli@v1` → `supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}` (no function name = deploys all functions; future-proof for additional functions). `SUPABASE_ACCESS_TOKEN` passed via step `env`. Required secrets: `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` (both set in repo Settings → Secrets → Actions). CI `build-and-test` does not exercise this workflow; validate via `workflow_dispatch`. No post-deploy smoke test in v1 (D4, deferred — would need synthetic JWT + event log).

### Game state shape

```ts
type CellState = 'empty' | 'red' | 'yellow' | 'green';
type Board = CellState[][];
type Color = 'red' | 'yellow' | 'green';
type Move = { color: Color; row: number; col: number };
type GamePhase = 'playing' | 'validating' | 'complete';
type Theme = 'dark' | 'light';
```

The first four types live in `src/engine/types.ts`. `GamePhase` is exported from `src/hooks/useGame.ts`. `Theme` is exported from `src/hooks/useTheme.ts`.

**Note (May 2, 2026):** `'validating'` GamePhase added in [TER-153](https://linear.app/terenc/issue/TER-153) — sits between `'playing'` and `'complete'` for the win-state validation sweep. [TER-148](https://linear.app/terenc/issue/TER-148) models the pattern↔board transition at the UI layer with a local boolean (not a hook phase) — different architectural choice from [TER-153](https://linear.app/terenc/issue/TER-153) because the transition affects only the visual, not the game state.

**Note (May 26, 2026):** `'idle'` and `'pattern-revealed'` phases removed in [TER-221](https://linear.app/terenc/issue/TER-221). Game starts in `'playing'` immediately; old blobs with the removed phases are silently remapped to `'playing'` on resume.

### useGame hook — UPDATED (`src/hooks/useGame.ts`, [TER-221](https://linear.app/terenc/issue/TER-221))

```ts
export type GamePhase = 'playing' | 'validating' | 'complete';

export interface GameView {
  phase: GamePhase;
  gridSize: 4 | 5 | 6 | 8;
  current: Board;
  target: Board;
  elapsedMs: number;
  moveCount: number;
  activeColor: Color | null;
}

export interface GameActions {
  selectColor: (c: Color) => void;
  placeAt: (row: number, col: number) => void;
  reset: () => void;
  completeValidation: () => void;
  bankTime: () => void;    // added TER-167: bank + stop clock (pause)
  resumeTimer: () => void; // added TER-167: restart clock from banked value
}

export function useGame(
  puzzle: GeneratedPuzzle,
  options?: { resume?: InProgressBlob; keepClockOnReset?: boolean }
): GameView & GameActions;
```

**Timer model updated in [TER-167](https://linear.app/terenc/issue/TER-167):** accumulator-based. Internal state: `accumulatedMs` (banked time) + `runStartedAt` (epoch ms when current run started, null when paused). `elapsedMs` = `accumulatedMs + clampDelta(now, runStartedAt)` on each TICK; frozen at completion (`runStartedAt = null`, `accumulatedMs = frozen`). Replaces the old single-`timerStartedAt` wall-clock. New actions: `BANK_TIME` (pause: `accumulatedMs += clampDelta(now, runStartedAt); runStartedAt = null`), `RESUME_TIMER` (set `runStartedAt = now`). `RESET` accepts `keepClock: boolean` — when true (daily mode), preserves `accumulatedMs`/`runStartedAt`/`elapsedMs`; when false (practice), zeros the timer. `REVEAL_PATTERN` in idle uses `runStartedAt ?? now` so it doesn't restart a clock that's already running (post-reset daily). Pathological deltas clamped: negative → 0, max per run = 7,200,000ms (2 h). Completion check atomically sets `phase = validating`, freezes `elapsedMs`, and clears `runStartedAt`.

`useGame` options: `resume?: InProgressBlob` — initializes state from the blob (board, phase, activeColor, moveCount, accumulatedMs); a `useEffect` dispatches `RESUME_TIMER` unconditionally on every mount (timer starts on game-screen entry — no reveal gate). `keepClockOnReset?: boolean` — wires the RESET keepClock flag. `boardsMatch` is a local unexported helper.

**Notes:**

* **[TER-150](https://linear.app/terenc/issue/TER-150) shipped (May 3, 2026):** Every-click-counts scoring now fully implemented. `SELECT_COLOR` to a different color → +1; re-selecting the same color → 0 (no-op, returns state unchanged). `HIDE_PATTERN` → +1 (added here). `REVEAL_PATTERN` after first → +1 (already there). `PLACE_AT` → +1 (already there). Same-color clearing ([TER-147](https://linear.app/terenc/issue/TER-147)) → +1. 15 unit tests (was 9); 126 total passing.
* [TER-147](https://linear.app/terenc/issue/TER-147) adds clearing semantics (shipped May 2, 2026): `PLACE_AT` branches on `state.current[row][col] === state.activeColor` — true calls `applyClear`, increments `moveCount` by 1, no completion check; false follows existing placement path unchanged.
* **[TER-153](https://linear.app/terenc/issue/TER-153) shipped (May 24, 2026):** the `'validating'` phase and `completeValidation` action are live. When the boards match, `PLACE_AT` sets phase `'validating'` (timer frozen atomically); GameScreen runs the 850ms row-glow sweep, then dispatches `COMPLETE_VALIDATION` to flip phase to `'complete'`. `COMPLETE_VALIDATION` is a no-op outside `'validating'`.
* **[TER-221](https://linear.app/terenc/issue/TER-221) shipped (May 26, 2026):** `REVEAL_PATTERN`/`HIDE_PATTERN` actions and `patternVisible` field removed. `revealPattern`/`hidePattern` removed from `GameActions`. TER-150 scoring **reversed** (authorized by RYGO Logic Pivot Design Doc §4): `SELECT_COLOR` to a different color → +0 (placements-only scoring). `PLACE_AT` and same-color clear remain +1. `RESUME_TIMER` dispatched unconditionally on mount — timer starts at game-screen entry without a reveal gate.

### Completion check

`boardsMatch(a: Board, b: Board): boolean` — local unexported function inside `src/hooks/useGame.ts`. Checks exact cell-by-cell equality. Used in the `PLACE_AT` reducer case to detect game completion atomically.

### Screen architecture and component map — READY (`src/App.tsx`, [TER-137](https://linear.app/terenc/issue/TER-137))

App manages a two-state view machine (`'difficulty' | 'game'`), calls `useTheme()` once, renders `ThemeToggle` in a fixed `z-50` top-right overlay (respects iOS safe-area insets), and passes callbacks to screens.

**Screens:**

* **DifficultyPicker** (`src/components/DifficultyPicker.tsx`) — RYGO lockup at top ([TER-151](https://linear.app/terenc/issue/TER-151)), tagline, four `LevelButton`s: Easy 4×4, Normal 5×5, Hard 6×6, Extreme 8×8 ([TER-145](https://linear.app/terenc/issue/TER-145)). `onShowStats?` no-op stub in top-right header (slot for [TER-143](https://linear.app/terenc/issue/TER-143)). Now also accepts a `completedToday` map and passes each level's recorded result through to its `LevelButton` ([TER-142](https://linear.app/terenc/issue/TER-142)).
* **GameScreen** (`src/components/GameScreen.tsx`) — consumes `useGame(puzzle)`. **Header cluster** (shipped in [TER-235](https://linear.app/terenc/issue/TER-235)): RefThumbnail (`w-28`) on the left, flex column of Score / Par slot (`data-testid="par-slot"`, `min-w-[4rem]` prevents reflow, renders `Par {displayedPar}` when available — wired in [TER-223](https://linear.app/terenc/issue/TER-223)) / Time on the right — both always visible, no reflow between sizes or phases. `ColorPicker` (always shown during play), Restart button (calls `reset()` then `resumeTimer()`), Quit button (calls `onPickDifficulty` directly). `mode?: 'daily' | 'practice'` prop plumbed for [TER-142](https://linear.app/terenc/issue/TER-142); in daily mode fires `onDailyComplete({moves, elapsedMs})` once when `phase === 'complete'`. On `phase === 'validating'`, renders the frozen board with the 850ms row-glow sweep + "Solved!" label + aria-live announcement, all gameplay controls suppressed, and a "Tap to continue" button (`aria-label="Continue to summary"`) that dispatches `completeValidation()` on tap — no auto-advance ([TER-169](https://linear.app/terenc/issue/TER-169)); under `prefers-reduced-motion` the sweep overlay is skipped but the tap is still required. On `phase === 'complete'`, renders `Summary` in place of the game UI. App's global ThemeToggle overlay renders on every screen including the game screen. (Layout rework shipped in [TER-221](https://linear.app/terenc/issue/TER-221); header cluster shipped in [TER-235](https://linear.app/terenc/issue/TER-235); validating branch + sweep shipped in [TER-153](https://linear.app/terenc/issue/TER-153); tap-to-advance shipped in [TER-169](https://linear.app/terenc/issue/TER-169).)

**Sub-components:**

* **LevelButton** (`src/components/LevelButton.tsx`) — large button with `size: 4 | 5 | 6 | 8`, `label`, `onSelect`, `completedToday?: { moves, elapsedMs }`. In completed state ([TER-142](https://linear.app/terenc/issue/TER-142)) shows the recorded result (`{moves} moves · {M:SS}`) plus a live H:MM:SS countdown to the next UTC day and a "Practice" affordance; tapping still calls `onSelect` (which starts practice mode).
* **RefThumbnail** (`src/components/RefThumbnail.tsx`) — read-only minimap of the target board. `w-28` (112px), same color tokens as Grid, non-interactive divs. Always visible alongside the play Grid. Shipped in [TER-221](https://linear.app/terenc/issue/TER-221). Note: 8×8 at 112px → cells ≈12px — below the 15px shape-legibility threshold from design doc §8; flagged in TER-221 Linear comment for design decision.
* **ColorPicker** (`src/components/ColorPicker.tsx`) — red/yellow/green buttons showing color bg + shape icon. Active state: `ring-4 ring-blue-500 ring-offset-2 ring-offset-paper dark:ring-offset-ink` (non-color cue; blue-500 contrasts all three game colors in both themes; shipped in [TER-148](https://linear.app/terenc/issue/TER-148)).
* **Summary** (`src/components/Summary.tsx`) — score (moves), time, grid size (labels: Easy/Normal/Hard/Extreme — updated [TER-145](https://linear.app/terenc/issue/TER-145)), par outcome row (`data-testid="par-outcome-row"`, always rendered for layout stability; shows `−N Under par` / `Even par` / `+N Over par` when `dailyPar` is non-null, empty placeholder when null — shipped in [TER-223](https://linear.app/terenc/issue/TER-223)), Share button (full-width, above the "Play again" + "Change difficulty" row — shipped in [TER-144](https://linear.app/terenc/issue/TER-144)), `flex gap-3` button row with "Play again" + "Change difficulty". Props: `gridSize`, `moveCount`, `elapsedMs`, `date`, `mode`, `streak`, `standing?`, `dailyPar?`. Calls `buildShareString` from `src/share/shareString.ts`; invokes Web Share API (mobile native sheet), else clipboard (`Copied!` label for 2s), else textarea fallback.
* **ThemeToggle** (`src/components/ThemeToggle.tsx`) — receives `theme` and `toggleTheme` as props from App. Shows `Sun` when dark, `Moon` when light. `aria-label` reflects the action.

**Board interactivity:** Grid cells are disabled (`onCellTap` = undefined) in `idle`, `pattern-revealed`, and `validating` phases; enabled only in `playing`.

**Win-state row-glow sweep (shipped in** [TER-153](https://linear.app/terenc/issue/TER-153)**, May 24, 2026):** during `'validating'`, an absolutely-positioned overlay grid (matching `grid-cols-N gap-1`) renders one div per cell carrying the `rowGlow` CSS animation — an inset green ring (`box-shadow inset 0 0 0 3px #2E9D5C`) that fades in/out, staggered per row by `SWEEP_MS / gridSize` (`SWEEP_MS = 850`). Overlay is `pointer-events-none` and does not recolor the cells underneath. `@keyframes rowGlow` lives in `src/index.css`. `prefers-reduced-motion` is captured once at mount in a `useRef`; when set, the overlay is skipped and the hold is 400ms.

**Screen fade transitions (shipped in** [TER-313](https://linear.app/terenc/issue/TER-313)**, June 4, 2026):** CSS-only, no animation library. `@keyframes screenFade` (opacity `0→1` + `translateY(6px→none)`, 180ms ease-out) and `.screen-fade` rule are in `src/index.css` under `@media (prefers-reduced-motion: no-preference)` — under `prefers-reduced-motion: reduce` the class is a no-op (instant). In `App.tsx`, all screen conditionals are wrapped in `<div key={view} className="screen-fade">` inside `<main>`; the `key={view}` remounts the wrapper on every view change so the fade replays. The fixed `ThemeToggle` overlay div sits outside this wrapper and never animates on navigation. In `GameScreen.tsx`, the `phase === 'complete'` branch wraps `<Summary>` in `<div className="screen-fade">` so Summary fades in after the tap-to-advance; the row-glow sweep and "Tap to continue" button are untouched.

### Theme system — READY (`src/hooks/useTheme.ts`, [TER-137](https://linear.app/terenc/issue/TER-137))

```ts
export type Theme = 'dark' | 'light';
export function useTheme(): { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void; };
```

`useState` initializer runs `migrateLegacyKeys()` (migrates any pre-existing `'yergers:theme'` value to `'rygo:theme'` once, idempotent) then reads `localStorage.getItem('rygo:theme')`, defaults to `'dark'`. `useEffect` on `[theme]` calls `document.documentElement.classList.add/remove('dark')` and `localStorage.setItem(...)`. Single `useTheme` call in App; ThemeToggle receives props rather than calling the hook itself.

### Theme palette (light / dark) — UPDATED ([TER-137](https://linear.app/terenc/issue/TER-137), [TER-152](https://linear.app/terenc/issue/TER-152), [TER-168](https://linear.app/terenc/issue/TER-168))

Brand tokens defined in `src/index.css` via `@theme` block. Shipped in [TER-152](https://linear.app/terenc/issue/TER-152), May 2, 2026.

| Surface                  | Light                                                  | Dark                                                 |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| Page background          | `bg-paper` (`#F5F3EE`)                                 | `bg-ink` (`#14110E`)                                 |
| Page / heading text      | `text-ink` (`#14110E`)                                 | `text-paper` (`#F5F3EE`)                             |
| Secondary text / labels  | `text-gray-500`                                        | `text-gray-400`                                      |
| Grid container (lines)   | `bg-grid-line` (`#78716C`, 4.33:1 vs Paper, 3.22:1 vs stone-300) | `bg-ink` (same as page bg — no regression) |
| Empty grid cells         | `bg-stone-300` (`#D6D3D1`, ~1.35:1 vs Paper)           | `bg-gray-800`                                        |
| Default / level buttons  | `bg-gray-100`                                          | `bg-gray-800`                                        |
| Reveal / action buttons  | `bg-gray-200`                                          | `bg-gray-700`                                        |
| Summary card             | `bg-gray-100`                                          | `bg-gray-800`                                        |
| Color picker active ring | `ring-4 ring-blue-500 ring-offset-2 ring-offset-paper` | `ring-4 ring-blue-500 ring-offset-2 ring-offset-ink` |
| Primary action button    | `bg-blue-600 text-white`                               | (same)                                               |
| Game-content cells       | `bg-rygo-red` / `bg-rygo-yellow` / `bg-rygo-green`     | (theme-invariant)                                    |
| Shape fills              | `text-paper` (on red/green), `text-ink` (on yellow)    | (same)                                               |
| Win-state glow overlay   | inset ring `#2E9D5C` (RYGO Green), opacity-pulsed      | (same)                                               |

**Active-ring note:** `ring-white ring-offset-white` was invisible against Paper (`#F5F3EE`) in light mode. Fixed in [TER-148](https://linear.app/terenc/issue/TER-148): changed to `ring-4 ring-blue-500 ring-offset-2 ring-offset-paper dark:ring-offset-ink`. (Empty-cell `bg-gray-100` on Paper light-mode contrast is addressed in [TER-168](https://linear.app/terenc/issue/TER-168).)

### Test infrastructure — UPDATED ([TER-137](https://linear.app/terenc/issue/TER-137))

`src/test/setup.ts` patches `globalThis.localStorage` with a full in-memory `Storage` implementation. Required because Node.js 25 ships a built-in `localStorage` global that is non-functional without `--localstorage-file` and shadows jsdom's implementation in Vitest 4.x test workers. All tests pass under this mock; new localStorage-dependent tests work correctly. **Do not remove this mock — it is necessary for both Node 20 and Node 25 environments.** GameScreen tests additionally stub `window.matchMedia` in `beforeEach` (jsdom lacks it) for the [TER-153](https://linear.app/terenc/issue/TER-153) reduced-motion path.

### Persistence module — READY (`src/persistence/dailyState.ts`, [TER-142](https://linear.app/terenc/issue/TER-142))

```ts
export function todayKey(date?: Date): string           // UTC YYYY-MM-DD; shared with dailySeed
export function loadState(): DailyState                 // safe: returns empty on error/corrupt JSON
export function isCompletedToday(state, level, day): boolean
export function getResult(state, level, day): DailyResult | null
export function recordDailyResult(level, day, result): void  // first-write-wins; silent on errors
export function msUntilNextUtcDay(now?: number): number // countdown driver
```

`rygo:state` localStorage schema (version 1): `{ version: 1, daily: { "4": { "YYYY-MM-DD": { moves, elapsedMs, completedAt } }, "5": {}, "6": {}, "8": {} } }`. Key: grid-size string → UTC day string → result. Version > 1 treated as unreadable (returns empty, writes no-op). All reads/writes wrapped in try/catch. No derived values stored (streaks compute from history in TER-143). 34 unit tests, all passing.

**Data flow (TER-142):** App loads state at startup (`useState(() => loadState())`). DifficultyPicker receives a `completedToday` map (level → `{moves, elapsedMs}`). When a level is completed and `isCompletedToday` is true, tapping it starts practice mode (same seed, `mode: 'practice'`, no recording). GameScreen fires `onDailyComplete({moves, elapsedMs})` exactly once when `phase === 'complete'` and `mode === 'daily'`; App calls `recordDailyResult` and refreshes state. Day key is captured at puzzle launch and travels with the session (post-midnight finishes record under start day). LevelButton in completed state shows recorded result + live H:MM:SS countdown to next UTC day. Cross-midnight staleness gap on the picker (display-only) addressed in [TER-167](https://linear.app/terenc/issue/TER-167) via `loadInProgress()` date validation — a stale in-progress blob is discarded on the next level selection.

### In-progress persistence — READY (`src/persistence/inProgress.ts`, [TER-167](https://linear.app/terenc/issue/TER-167))

```ts
export const IN_PROGRESS_KEY = 'rygo:inprogress';
export interface InProgressBlob {
  version: 1;
  date: string;           // UTC YYYY-MM-DD
  gridSize: 4 | 5 | 6 | 8;
  board: Board;
  phase: 'idle' | 'pattern-revealed' | 'playing';
  activeColor: Color | null;
  moveCount: number;
  patternVisible: boolean;
  accumulatedMs: number;
  savedAt: number;        // epoch ms
}
export function loadInProgress(): InProgressBlob | null;  // null if absent/stale/corrupt/future-version
export function saveInProgress(blob: InProgressBlob): void;
export function deleteInProgress(): void;
```

Separate `rygo:inprogress` key keeps `rygo:state` results schema clean and append-only. `runStartedAt` is NOT persisted — on resume, `runStartedAt = now`. `loadInProgress` validates `date === todayKey()` (stale → null) and `version <= 1` (future → null); all I/O wrapped in try/catch. `saveInProgress` is called on pause (`visibilitychange` hidden / `pagehide`), on Restart (with cleared board state), and on Quit; `deleteInProgress` is called on completion. The pause-save handler guards on phase — it persists only in `{playing}`, never in `validating`/`complete`, so a solved board is never written (would otherwise strand a resumed session with no continue button). 13 unit tests in `inProgress.test.ts` + 2 GameScreen guard tests. Practice mode never calls any of these.

### Stats module — READY (`src/persistence/stats.ts`, `src/hooks/useStats.ts`, [TER-143](https://linear.app/terenc/issue/TER-143))

Pure compute helpers in `src/persistence/stats.ts` (no React, no localStorage access):

```ts
export function previousDayKey(key: string): string;      // 'YYYY-MM-DD' → prior UTC day
export function computeGlobalStreak(state: DailyState, today: string): { current: number; best: number };
export function computeLevelSummary(state: DailyState, size: 4 | 5 | 6 | 8, today: string): {
  played: number;
  bestScore: number | null;      // min moves; null when played === 0
  averageScore: number | null;   // mean moves, rounded to 1 dp; null when played === 0
  today: { moves: number; elapsedMs: number } | null;
};
```

`computeGlobalStreak` unions completed day-keys across all four sizes. **Current:** if today is in the union, walks back via `previousDayKey` counting consecutive days; if today is absent, applies the grace rule (starts walk from `previousDayKey(today)` — today-not-done never breaks the streak). **Best:** sorts the union set and finds the longest consecutive run. `computeLevelSummary` scans one size's day-map from `rygo:state`; all values are `null` (not `NaN`) when `played === 0`.

`src/hooks/useStats.ts` — thin wrapper: calls `loadState()` + `todayKey()`, applies both helpers, returns `StatsView` with exactly four `LevelStats` in `[4, 5, 6, 8]` order.

**Screen architecture (TER-143):** App view-state extended to `'difficulty' | 'game' | 'stats'`. Stats button moved to **top-left** of DifficultyPicker (was a no-op stub on the right; moved left to avoid collision with the fixed ThemeToggle at top-right). Stats button → `'stats'`; Back on StatsScreen → `'difficulty'`.

**StatsScreen** (`src/components/StatsScreen.tsx`) — header with Back button + streak banner + four `StatCard` components. Streak banner: `🔥 N-day streak · best M` or "Play today to start a streak" when current === 0. **StatCard** (`src/components/StatCard.tsx`) — three states: empty (`No plays yet — try it!`), played + today (Today: N moves + delta cue + quiet stat line), played + no today (stat line + Not played today). Delta cue: "New best!" when `today.moves <= bestScore`, else `+N from your best`. All fit an iPhone SE viewport (375×667) without scroll.

### How-to-play screen — READY (`src/components/RulesScreen.tsx`, [TER-192](https://linear.app/terenc/issue/TER-192))

**App view-state (TER-192):** extended to `'difficulty' | 'game' | 'stats' | 'rules'`. `'rules'` → `RulesScreen`; Back returns to `'difficulty'`. Entry point: DifficultyPicker only (not Summary, not GameScreen). DifficultyPicker gains `onShowRules?: () => void` prop; a centered secondary-styled text button (`aria-label="How to play"`) rendered below the four LevelButtons.

**RulesScreen** (`src/components/RulesScreen.tsx`) — static reference screen. Header mirrors StatsScreen (Back button + centered title). Content is sourced directly from GDD v1.7; no rule may be invented or altered. Scrollable. Sections (with `data-testid`s): `rules-goal`, `rules-colors`, `rules-blocking`, `rules-overwrite`, `rules-clearing`, `rules-scoring`.

Diagrams are visual, not ASCII/prose:
- **Green blocking example:** two 4×4 `MiniGrid` components side-by-side (before: red only; after: green placed adjacent to red, showing column fill + eastern block). `data-testid="blocking-diagram"`, `"blocking-diagram-before"`, `"blocking-diagram-after"`.
- **Overwrite hierarchy:** accessible HTML `<table>` (Red / Yellow / Green rows vs Empty / Green / Yellow / Red columns). `data-testid="overwrite-table"`.

**MiniGrid / MiniCell** — local helpers inside `RulesScreen.tsx`. `MiniCell` is a non-interactive `div` with `role="img"` and `aria-label` matching the live Grid format ("Red cell at row N, column N"). `MiniGrid` uses inline `gridTemplateColumns` style (dynamic column count). Same color tokens (`bg-rygo-red` / `bg-rygo-yellow` / `bg-rygo-green` / `bg-stone-300 dark:bg-gray-800`) and shape fills (`text-paper` / `text-ink`) as the live Grid. `BLOCKING_BEFORE` and `BLOCKING_AFTER` boards are module-level constants.

### Admin metrics dashboard — READY (`src/components/AdminDashboard.tsx`, `src/backend/getAdminMetrics.ts`) [TER-311]

Read-only internal admin page at `/tabs`. Option B: unguarded (anyone with the URL), backed by an anon-callable aggregates RPC that returns only aggregate counts (no `user_id`, no PII).

**Routing (no router library):** `src/main.tsx` branches on `window.location.pathname === '/tabs'` — renders `<AdminDashboard />` or `<App />`, both inside `StrictMode`. `vercel.json` adds a targeted rewrite so hard navigation to `/tabs` serves the SPA shell without breaking `/`.

**Migration** (`supabase/migrations/20260604000000_admin_metrics_rpc.sql`): `public.get_admin_metrics()` — `security definer`, `set search_path = ''`, `grant execute … to anon`. Returns a single JSON object: `unique_players`, `total_submissions`, `by_day` (last 90 days, `day / players / submissions`, newest first). Never returns `user_id`.

**Client reader** (`src/backend/getAdminMetrics.ts`): `getAdminMetrics(): Promise<AdminMetrics | null>`. Guards on `supabase !== null`, validates the three required fields (`unique_players: number`, `total_submissions: number`, `by_day: array`), returns `null` on any error or unexpected shape, never throws. Mirrors the `getStanding` / `getDailyPar` pattern.

**Dashboard component** (`src/components/AdminDashboard.tsx`): renders loading state → two totals → per-day table (newest first). Shows "Metrics unavailable" (not blank, not a throw) when `getAdminMetrics` returns `null`. Brand-token styling (`bg-paper dark:bg-ink`, `text-ink dark:text-paper`). No game imports beyond the metrics reader. No authentication — Option B is unguarded by design; genuine protection is a later Option-C escalation.

**Deploy note (Chris-side):** migration must be applied to Supabase before `/tabs` shows live numbers. The RPC must exist; Vercel deploy does not auto-apply migrations.

Shipped in [TER-311](https://linear.app/terenc/issue/TER-311), June 4, 2026.

### Settings persistence — READY (`src/persistence/settings.ts`, `src/hooks/useSettings.ts`, `src/components/SettingsScreen.tsx`, [TER-301](https://linear.app/terenc/issue/TER-301))

**Persistence module** (`src/persistence/settings.ts`): localStorage key `rygo:settings`, versioned blob `{ version: 1, audio: boolean, haptics: boolean }`. `loadSettings()` returns defaults `{ audio: true, haptics: true }` on missing / corrupt JSON / `version > CURRENT_VERSION`; all I/O wrapped in try/catch. `setAudioPref(value)` and `setHapticsPref(value)` each read-then-write so toggling one key never clobbers the other.

**Hook** (`src/hooks/useSettings.ts`): mirrors `useTheme`. Reads blob on init, exposes `{ audio, haptics, setAudio, setHaptics }`. State and persistence only; consumed by `useGameFeedback`.

**SettingsScreen** (`src/components/SettingsScreen.tsx`): header mirrors StatsScreen / RulesScreen (Back button `aria-label="Back to difficulty picker"` + centered "Settings" title). Two labeled toggle rows — Sound (always shown) and Haptics (feature-gated: `'vibrate' in navigator` guard so the row is hidden on iOS Safari and desktop where `vibrate` is absent). Toggles are native `<input type="checkbox" role="switch" aria-label="...">` elements; accessible labels: `"Sound"` and `"Haptics"` (WCAG 2.5.3 Label-in-Name: visible text is contained in the accessible name — updated in [TER-310](https://linear.app/terenc/issue/TER-310)).

**App wiring (TER-301):** `AppView` extended to `'difficulty' | 'game' | 'stats' | 'rules' | 'settings'`. DifficultyPicker gains `onShowSettings?: () => void` and a centered secondary "Settings" text button rendered alongside "How to play" below the four LevelButtons. Back on SettingsScreen returns to `'difficulty'`. Theme toggle unchanged (fixed overlay).

### Audio + haptics feedback engine — READY (`src/audio/sounds.ts`, `src/hooks/useGameFeedback.ts`, [TER-310](https://linear.app/terenc/issue/TER-310))

**Sounds engine** (`src/audio/sounds.ts`): dependency-free Web Audio synthesis. Module-level, lazily-created `AudioContext` singleton (feature-detected via `window.AudioContext` / `window.webkitAudioContext`). When unavailable (jsdom, old browsers, SSR) all four exported methods are safe no-ops. Exports: `resume()` (unlocks a suspended context), `playTap()` (noise burst + bandpass filter, ~40ms wooden click), `playWinChime()` (three ascending sine tones C5→E5→G5, i.e. R→Y→G, total ~0.9s), `playUnderPar()` (triangle wave arpeggio C6→E6→G6 starting ~850ms after the chime). No `<audio>` elements or npm dependencies.

**Feedback hook** (`src/hooks/useGameFeedback.ts`): consumes `useSettings()`. On mount registers a one-time `pointerdown`/`keydown` unlock listener (Web Audio autoplay policy). Two effects track state transitions: (1) **Tap** — fires when `moveCount` increases while `phase === 'playing'`; because the completing move transitions to `'validating'` in the same render, the tap is suppressed on that move with no special case needed. `navigator.vibrate(15)` fires alongside if haptics are on and the API is present. (2) **Win** — fires once on the `'playing' → 'validating'` transition: `playWinChime()` + `navigator.vibrate([50, 50, 100])`; if `underPar` is true at that moment, `playUnderPar()` is also called. All sound gated on `settings.audio`; all vibration gated on `settings.haptics && 'vibrate' in navigator`.

**GameScreen wiring** ([TER-310](https://linear.app/terenc/issue/TER-310)): `useGameFeedback({ moveCount: game.moveCount, phase: game.phase, underPar })` called at the top level of `GameScreen`. `underPar = dailyPar != null && game.moveCount < (displayedPar(dailyPar.par) ?? Infinity)`.

### Event-log capture — READY (`src/hooks/useGame.ts`, `src/persistence/inProgress.ts`) [TER-205]

`GameEvent` type added to `src/engine/types.ts` (also synced to `_shared/engine/types.ts`):

```ts
export type GameEvent =
  | { type: 'select'; color: Color }
  | { type: 'reveal' }
  | { type: 'hide' }
  | { type: 'tap'; row: number; col: number };
```

`useGame`'s `GameState` and `GameView` gain `eventLog: GameEvent[]`. The reducer appends one entry in `SELECT_COLOR` (including no-op re-taps — raw action recorded, server applies score rule on replay) and `PLACE_AT` (placement, clear, and completing). `RESET` empties `eventLog` on both daily-keep-clock and practice paths. (`REVEAL_PATTERN`/`HIDE_PATTERN` no longer appended after [TER-221](https://linear.app/terenc/issue/TER-221); `applyEvent` still handles `reveal`/`hide` events for backward-compat with pre-TER-221 blobs.)

`InProgressBlob` bumped to `version: 2` with `eventLog: GameEvent[]`. `saveInProgress` writes the current log; resume (`useGame` `resume` option) rehydrates it. `loadInProgress` accepts v1 blobs (treats missing `eventLog` as `[]`) and still returns null for `version > 2`. `GameScreen.tsx` updated to pass `eventLog: g.eventLog` in `buildBlob` and `eventLog: []` in the post-reset manual blob.

Nothing reads or submits the log yet — capture + persist + resume only. The first consumer is issue 4 (edge function replay validator).

Shipped in [TER-205](https://linear.app/terenc/issue/TER-205), May 25, 2026.

### Shared replay core — READY (`src/engine/replay.ts`) [TER-206]

```ts
export interface ReplayResult { board: Board; moveCount: number; }
export interface EventReplayState { board: Board; activeColor: Color | null; moveCount: number; hasRevealed: boolean; }
export function applyEvent(state: EventReplayState, event: GameEvent): EventReplayState;
export function replayEventLog(puzzle: GeneratedPuzzle, events: GameEvent[]): ReplayResult;
```

Pure, dependency-free (no React, no localStorage). `applyEvent` is the single rule set for board + move-count transitions; it is used by both `replayEventLog` and the `useGame` reducer so no logic is duplicated. `hasRevealed` tracks whether the first reveal has occurred (backward-compat with pre-TER-221 blobs). `applyEvent` deliberately does NOT detect completion; callers compare the returned board to the target themselves.

**Scoring rules (placements-only, [TER-221](https://linear.app/terenc/issue/TER-221)):**
- `select` (any, including no-op re-tap) → +0.
- `reveal`/`hide` → +0 (always; backward-compat for old event logs).
- `tap` placement → +1.
- `tap` same-color clear → `applyClear`, +1.
- `tap` board no-op under overwrite hierarchy (e.g. yellow on red) → +1.

**Prior scoring (TER-150, reversed by TER-221):** `select` to a different color was +1; re-reveal was +1; `hide` was +1.

`replay.ts` synced into `supabase/functions/_shared/engine/` alongside `types.ts`, `placement.ts`, and `generator.ts`. The drift guard in CI covers it.

**useGame refactor (TER-206):** the reducer's `REVEAL_PATTERN`, `HIDE_PATTERN`, `SELECT_COLOR`, and `PLACE_AT` cases now import and call `applyEvent`; the inline `moveCount + 1` arithmetic and `applyMove` / `applyClear` calls in the reducer are removed. Completion detection remains in the reducer (after the `PLACE_AT` branch). `boardsMatch` is safe to run on both placement and clear results — targets are fully covered (TER-146) so a clear (which produces empty cells) can never match.

Shipped in [TER-206](https://linear.app/terenc/issue/TER-206), May 25, 2026.

### Submit-score edge function — READY (`supabase/functions/submit-score/`) [TER-207]

Supabase Edge Function (Deno) that server-verifies a submitted daily result and writes it under the service role. Write-only: returns `{ accepted: true/false }`, never a rank.

```ts
// validate.ts — pure, no I/O
export const MAX_EVENTS = 2000;
export const ELAPSED_FLOOR_MS = 1500;
export const ELAPSED_CEILING_MS = 7_200_000;
export const LAUNCH_DAY = '2026-05-25'; // Chris confirms at deploy

export class BadRequestError extends Error { ... }
export function parsePayload(body: unknown): SubmitPayload  // throws BadRequestError on malformed
export function validateSubmission(payload: SubmitPayload, serverToday: string): ValidationResult
// throws BadRequestError on future day (security hard stop → 400)
// returns { accepted: false, reason } for verification failures (200)
// returns { accepted: true } on success

// index.ts — HTTP + auth + DB
// Pipeline: OPTIONS/POST → auth JWT → parsePayload → validateSubmission → service-role INSERT
```

**Pipeline (fail-fast in order):** CORS OPTIONS → POST-only check → auth JWT from Authorization header → `parsePayload` (field validation, YYYY-MM-DD format + calendar validity, event type validation, non-negative integers) → `validateSubmission` (future-day 400; pre-launch-floor reject; eventLog cap; `generatePuzzle` + `replayEventLog` board/moveCount match; elapsedMs floor/ceiling reject).

**Response contract:** `200 { accepted: true }` on insert or dedup no-op; `200 { accepted: false, reason? }` on verification failure; `400` on malformed/auth; `500` on DB/unexpected.

**Generator-parity test (`parity-fixture.json` + `parity.test.ts`):** 12 fixture entries (3 seeds × 4 grid sizes) generated by the client generator and committed. A Deno test regenerates each via `_shared/engine/generator.ts` and deep-equals. Guards against silent divergence between browser and Deno generators.

**CI:** `deno test --allow-read` step added after `deno check`, covering parity fixture + 24 pure `validate.ts` unit tests. No network, no secrets.

Shipped in [TER-207](https://linear.app/terenc/issue/TER-207), May 25, 2026.

### Shared-engine delivery — UPDATED (`scripts/sync-engine.mjs`, `supabase/functions/_shared/engine/`) [TER-203, TER-206]

`scripts/sync-engine.mjs` (Node, no deps) copies the three pure engine files — `types.ts`, `placement.ts`, `generator.ts` — from `src/engine/` into `supabase/functions/_shared/engine/`, prepending a generated-file banner to each. Run via `npm run sync-engine`. The `.test.ts` files are NOT synced; the shared copy is runtime engine only.

**Deno compat:** relative imports in `placement.ts` and `generator.ts` now use explicit `.ts` extensions (e.g. `from './types.ts'`). Vite and Vitest tolerate these extensions; the client build is unaffected. The extension change makes the sync a pure byte-copy — no import rewriting required.

**Drift guard in CI:** the `build-and-test` job runs `npm run sync-engine` then `git diff --exit-code -- supabase/functions/_shared/` after tests. Any stale committed copy causes CI to fail with "Engine drift — run `npm run sync-engine` and commit". `denoland/setup-deno@v2` + `deno check supabase/functions/_shared/engine/*.ts` follows, proving the Deno runtime can load and typecheck the engine before the edge function (issue 4) is built on it.

Shipped in [TER-203](https://linear.app/terenc/issue/TER-203), May 25, 2026. `replay.ts` added to FILES in [TER-206](https://linear.app/terenc/issue/TER-206), May 25, 2026.

### Supabase backend — READY (`src/backend/supabaseClient.ts`) [TER-199]

```ts
export const supabase: SupabaseClient | null   // null when env vars absent
export const userIdPromise: Promise<string | null>  // resolves to anon user_id (or null)
```

Initializes the Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. If either env var is absent (CI, local dev without `.env`), the module exports `null` and `userIdPromise` resolves to `null` — no throw, no network call, no console spam. This is the hard non-negotiable: gameplay never depends on the network; callers must guard on `supabase !== null`.

**Anonymous auth bootstrap:** on module load (if client is live), best-effort: `getSession()` reuses an existing localStorage-persisted session; otherwise `signInAnonymously()` creates a new one. Any error is swallowed; `userIdPromise` resolves to `null` on failure. The anon `user_id` is the dedup key for one-result-per-player-per-day-per-level.

**SQL migration:** `supabase/migrations/20260525000000_scores_schema.sql` — `scores` table (`id`, `user_id`, `day`, `grid_size`, `moves`, `elapsed_ms`, `created_at`; unique on `(user_id, day, grid_size)`), RLS enabled with no client INSERT/UPDATE policy, and the read-only `get_standing(day, grid_size, moves, elapsed_ms) → { rank, total }` RPC (`security definer`, `set search_path = ''`). Sort key: moves ASC, elapsed_ms ASC.

Shipped in [TER-199](https://linear.app/terenc/issue/TER-199), May 25, 2026.

### Par solver — READY (`src/engine/parSolver.ts`) [TER-220]

```ts
export type SolverResult = { proven: true; par: number } | { proven: false };

export function solveOptimalPar(
  target: Board,
  gridSize: 4 | 5 | 6 | 8,
  options: { budgetMs: number },
): SolverResult;
```

Pure, deterministic, dependency-free. A* search with a Map-based closed set (full memoization) over flat board states. Returns `{ proven: true, par }` when optimal par is found within budget; returns `{ proven: false }` on timeout or memory cap.

**Algorithm details:** A* with binary min-heap priority queue, board keys encoded as a packed number (n≤25) or char-code string (n>25). Closed-set cap: 4M entries. Deadline check every 16384 nodes. Returns `{ proven: false }` immediately if `budgetMs ≤ 0`.

**Pruning (placements-only search):**
- R1: Red placed only at target-red cells (red is permanent — any other placement is irreversible).
- R2: Yellow skipped if any writable cell (empty|green) in its plus-reach has target=green (yellow permanently sets it to yellow; green cannot overwrite yellow, only clearing can restore — and clearing is never needed on an R1/R2-safe path).
- R3: No-op moves (board unchanged) are discarded.

**Heuristic (admissible, consistent — decreases ≤1 per move):**
`h = redMismatch + minYellowCover(yellowMask) + ⌈greenMismatch / (2N−1)⌉`

**Yellow min-cover DP:** pre-computed once per puzzle. Bitmask DP over target-yellow cells (k≤26 → 2^k states × 1 byte; k>27 falls back to ⌈k/5⌉). Carried through all A* nodes.

**Move ordering:** within each node expansion, yellow and green candidates are sorted by net-target-cells-gained (descending) before being pushed to the heap, reducing average search depth in practice.

**Placement-only optimality:** solveOptimalPar returns the optimum *among placement-only solutions*. R1+R2 plus full-coverage targets make a shorter clear-using solution very unlikely, and all 35 solved 4×4/5×5 puzzles matched placement-only optima — but global optimality (including deliberate place-blocker → green → clear maneuvers) is NOT formally established. The `proven` flag therefore means "optimal among placements," not "provably global optimal." Closing this is tracked in TER-225; no proven/perfect badge ships until then. 6×6/8×8 time out and use soft par.

**Synced to `_shared/engine/parSolver.ts`** via `npm run sync-engine` (parSolver.ts added to FILES in sync-engine.mjs; drift guard in CI covers it).

Benchmark script: `scripts/par-solver-benchmark.ts` — run with `npx tsx scripts/par-solver-benchmark.ts`. Reuses spike seed set (15 seeds per size, RYGO-2026-01-01 through -01-15).

Shipped in [TER-220](https://linear.app/terenc/issue/TER-220), May 26, 2026.

### Daily par pipeline — READY (`scripts/compute-par.ts`, `src/backend/getDailyPar.ts`) [TER-222]

Offline par computation job + client read path. Clients never run the solver; par is a pre-computed number they read from Supabase.

**`daily_par` table** (`supabase/migrations/20260527000000_daily_par_schema.sql`): columns `id`, `date` (date), `grid_size` (smallint), `par` (int), `proven` (bool), `generation_hash` (text), `created_at`/`updated_at` (timestamptz). Unique on `(date, grid_size)`. RLS: public SELECT (`anon_select` policy); no client INSERT/UPDATE (service-role only).

**Compute job** (`.github/workflows/compute-par.yml`): GitHub Actions cron, weekly Monday 02:00 UTC + `workflow_dispatch`. Precomputes 14 days ahead (rolling buffer — a single missed run never strands a game-day). Runs `npx tsx scripts/compute-par.ts` with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` secrets. For each upcoming date × size {4,5,6,8}: derives the puzzle via the shared engine (`RYGO-{date}` seed), runs `solveOptimalPar` with a per-size budget (`BUDGET_MS_BY_SIZE: { 4: 30s, 5: 30s, 6: 90s, 8: 0 }` — [TER-240](https://linear.app/terenc/issue/TER-240) raised 6×6 from 30s; 8×8 is skipped via budget=0 and an in-function guard), upserts to `daily_par`. Proven result → `{par, proven: true}`; timeout → `{par: generator-solution-length, proven: false}`. Idempotent: rows with a matching `generation_hash` are skipped.

**Generation hash** (`src/engine/boardHash.ts`): compact fingerprint — one char per cell in row-major order (`e`/`r`/`y`/`g`). Both the compute job and the client compute it independently from `generatePuzzle().target`. If they diverge (engine drift), the client silently degrades to no-par.

**Client read** (`src/backend/getDailyPar.ts`):
```ts
export interface DailyPar { par: number; proven: boolean; }
export async function getDailyPar(dateStr: string, gridSize: 4 | 5 | 6 | 8): Promise<DailyPar | null>
```
Queries `daily_par` by `(date, grid_size)`, verifies the `generation_hash` against the client's own puzzle, and returns `{par, proven}` or `null`. Never throws. Called in `GameScreen`'s mount `useEffect` (deps `[effectiveDayKey, puzzle.gridSize]`) so par is available from move one in both daily and practice modes; result stored in `dailyPar` state and passed to `Summary` as `dailyPar` prop. ([TER-222](https://linear.app/terenc/issue/TER-222) wired it in the completion effect; [TER-223](https://linear.app/terenc/issue/TER-223) moved it to mount.)

**Graceful degradation**: any failure path (supabase null, DB error, missing row, hash mismatch, type error, network throw) returns null. `Summary` receives `null` and silently omits par — play is never blocked.

**Runner rationale**: GitHub Actions chosen over Supabase scheduled function (design doc §8 open question, resolved in TER-222 Linear comment). 8×8 burns the full 30s budget, which is wrong for a CPU-capped Supabase edge function; a GH Actions runner has no CPU cap and keeps both schedule and job code in version control. Only the `daily_par` table and client read stay in Supabase.

Shipped in [TER-222](https://linear.app/terenc/issue/TER-222), May 27, 2026.

### Par display module — READY (`src/display/parDisplay.ts`) [TER-223]

```ts
export const PAR_SLACK = 1;
export function displayedPar(raw: number | null): number | null;
```

Thin display module: `PAR_SLACK = 1` applies one slack move so every par is beatable. `displayedPar(raw)` returns `raw + PAR_SLACK` or `null`. Offset lives in display, not the DB — `daily_par.par` stays "raw par"; tuning slack is a one-constant change. GameScreen and Summary both import from here.

**Status bar (during play):** `GameScreen` renders `Par {displayedPar}` inside the `data-testid="par-slot"` div when par resolves; empty when null. The `min-w-[4rem]` class on the slot prevents reflow.

**Summary outcome row:** always rendered (empty placeholder when null, for layout stability). When `dailyPar` is non-null: delta = `moveCount − displayedPar`; renders `−N Under par` (`text-rygo-green`), `Even par` (neutral), or `+N Over par` (neutral). Over-par is never styled negatively. No "optimal" language, no badge.

Shipped in [TER-223](https://linear.app/terenc/issue/TER-223), May 27, 2026.

### Client rank read — READY (`src/backend/getStanding.ts`) [TER-215]

```ts
export async function getStanding(
  day: string,
  gridSize: 4 | 5 | 6 | 8,
  moves: number,
  elapsedMs: number,
): Promise<{ rank: number; total: number } | null>
```

Calls `supabase.rpc('get_standing', { p_day, p_grid_size, p_moves, p_elapsed_ms })`. Returns the `{ rank, total }` object directly from `data`; returns `null` on any error, unexpected shape, or when `supabase === null` (no network call). Never throws. Passes both `moves` and `elapsedMs` so the moves-ASC-then-elapsedMs-ASC tiebreak resolves correctly.

`GameScreen` calls it **twice** in its fire-once completion `useEffect` (daily only): once immediately for a fast first paint, and once more chained off `enqueueAndSubmit`'s settlement (`.catch(() => {}).then(...)`) so the corrected count (own row + any concurrent peers committed) heals the display without a page reload. Both `setStanding` calls are guarded: a `null` result never clears a previously-shown standing; a `let cancelled = false` flag (set in the effect cleanup) prevents state updates after unmount. Stores the result in `useState<{ rank: number; total: number } | null>` and passes it to `Summary` as the `standing` prop. Updated in [TER-297](https://linear.app/terenc/issue/TER-297).

`Summary` renders `#R of N today` when `standing` is non-null, where N = `max(rank, total)`. The clamp prevents a briefly low `total` (own row not yet counted by the time the RPC fires) from showing a nonsensical denominator. Omits the line silently on `null`. No spinner and no reserved slot.

Shipped in [TER-215](https://linear.app/terenc/issue/TER-215), May 26, 2026.

## Coding conventions

* TypeScript strict mode on. No `any` without an explicit comment justifying it.
* In `react-jsx` mode (tsconfig), `JSX` namespace is not global — import it: `import type { JSX } from 'react'`
* Pure logic (placement engine, generator, completion check, clearing helper) lives in `src/engine/` and is fully unit-tested with Vitest.
* React components live in `src/components/`.
* React hooks live in `src/hooks/`.
* Persistence modules live in `src/persistence/` (introduced in [TER-142](https://linear.app/terenc/issue/TER-142)).
* Audio synthesis modules live in `src/audio/` (introduced in TER-310).
* No business logic in components.
* Tailwind v4 for all styling. CSS-based config (no `tailwind.config.js`). Brand tokens (`ink`, `paper`, `rygo-red`, `rygo-yellow`, `rygo-green`, `grid-line`) defined via `@theme` block in `index.css` ([TER-152](https://linear.app/terenc/issue/TER-152), `grid-line` added in [TER-290](https://linear.app/terenc/issue/TER-290)). No CSS modules.
* Mobile-first: design at portrait phone width first, adapt up.
* Use `dark:` variants only on surfaces that actually change between themes. Game-content colors don't need dark variants.

## Issue map (M1, M2, M3, M4, M5)

### M1 — Foundation (✅ complete)

* [TER-132](https://linear.app/terenc/issue/TER-132) — ✅ Done. Project scaffolded with Vite 8 + React 19 + TS 6 + Tailwind v4 + Vitest 4.
* [TER-133](https://linear.app/terenc/issue/TER-133) — ✅ Done. Color placement engine with 24 unit tests.
* [TER-134](https://linear.app/terenc/issue/TER-134) — ✅ Done. Pattern generator (deterministic, seeded, dependency-free; 13 tests).
* [TER-135](https://linear.app/terenc/issue/TER-135) — ✅ Done. Mobile-first Grid component with shape-based accessibility and dark/light support.
* [TER-138](https://linear.app/terenc/issue/TER-138) — ✅ Done. CI workflow + branch protection live.
* [TER-139](https://linear.app/terenc/issue/TER-139) — ✅ Done. Octagon → Square swap.
* [TER-140](https://linear.app/terenc/issue/TER-140) — ✅ Done. Page bg/text theme-aware fix.
* [TER-141](https://linear.app/terenc/issue/TER-141) — ✅ Done. Persistent "last shipped" footer.

### M2 — Playable MVP (✅ complete)

* [TER-136](https://linear.app/terenc/issue/TER-136) — ✅ Done. useGame hook (state, timer, move counter, auto-completion).
* [TER-137](https://linear.app/terenc/issue/TER-137) — ✅ Done. Full game UI + theme toggle. M2 baseline shipped.
* [TER-145](https://linear.app/terenc/issue/TER-145) — ✅ Done. Difficulty ladder expansion to 4 sizes (4×4 / 5×5 / 6×6 / 8×8).
* [TER-149](https://linear.app/terenc/issue/TER-149) — ✅ Done. Placement engine: blocking semantics for green's reach.
* [TER-151](https://linear.app/terenc/issue/TER-151) — ✅ Done. Yergers → RYGO rebrand (rename, lockup, localStorage migration, asset wiring).
* [TER-147](https://linear.app/terenc/issue/TER-147) — ✅ Done. Same-color clearing mechanic (engine + hook).
* [TER-152](https://linear.app/terenc/issue/TER-152) — ✅ Done. RYGO brand palette tokens (Tailwind v4 `@theme` block, swap utilities to brand tokens, contrast verification).
* [TER-148](https://linear.app/terenc/issue/TER-148) — ✅ Done. Game-screen UX cleanup (quit dialog removed, Restart button, light-mode active-ring fix, transition blank, click-feedback).
* [TER-150](https://linear.app/terenc/issue/TER-150) — ✅ Done. Every-click-counts scoring (color switch, hide pattern); subsequently **reversed in [TER-221](https://linear.app/terenc/issue/TER-221)** (M6 logic pivot, May 26, 2026) — scoring is now placements-only.
* [TER-146](https://linear.app/terenc/issue/TER-146) — ✅ Done. Generator v1.4: full coverage + all 3 colors + retune (Phase A green guarantee, 100-attempt cap).
* [TER-153](https://linear.app/terenc/issue/TER-153) — ✅ Done. Win-state validation sequence (`'validating'` GamePhase + green row-glow sweep + Solved! label before Summary).

### M3 — Daily ritual (pre-launch) (✅ complete)

* [TER-142](https://linear.app/terenc/issue/TER-142) — ✅ Done. Daily play tracking + once-per-day lock + localStorage foundation.
* [TER-143](https://linear.app/terenc/issue/TER-143) — ✅ Done. Stats screen (global streak + per-level self-comparison). Shipped May 24, 2026.
* [TER-144](https://linear.app/terenc/issue/TER-144) — ✅ Done. Share button on Summary (spoiler-free: score + streak, never the board). Shipped May 24, 2026.
* [TER-167](https://linear.app/terenc/issue/TER-167) — ✅ Done. Persistent daily-attempt timer (accumulator clock, pause/resume across sessions, resume in-progress board). Shipped May 24, 2026.

### M4 — Polish (post-launch)

* [TER-154](https://linear.app/terenc/issue/TER-154) **(parent)** — M4 Feel polish: haptic feedback, audio cues (R-Y-G chime + percussive tap), screen transitions, breathing-room layout pass. Sub-issues filed when M4 starts.
* [TER-301](https://linear.app/terenc/issue/TER-301) — ✅ Done. Settings surface: SettingsScreen + persisted Sound/Haptics toggles (no consumers yet). `rygo:settings` blob, `useSettings` hook, Settings button on DifficultyPicker, `AppView` extended. Shipped June 2, 2026 (PR #73).
* [TER-310](https://linear.app/terenc/issue/TER-310) — ✅ Done. Audio + haptics feedback engine: `src/audio/sounds.ts` Web Audio synthesis (tap click, R-Y-G win chime, under-par accent), `src/hooks/useGameFeedback.ts` orchestrator consuming `useSettings`, wired into `GameScreen`. WCAG 2.5.3 Label-in-Name fix in `SettingsScreen` (aria-labels now `"Sound"` / `"Haptics"`). Shipped June 4, 2026 (PR #74).
* [TER-313](https://linear.app/terenc/issue/TER-313) — ✅ Done. Screen fade transitions (CSS-only, reduced-motion-instant): `@keyframes screenFade` + `.screen-fade` in `index.css`, keyed `<div key={view}>` wrapper in `App.tsx`, Summary wrapper in `GameScreen.tsx`. Shipped June 4, 2026 (PR #77).

### M5 — Anonymous daily leaderboard (pre-launch feature)

First backend for RYGO. Design: `docs/RYGO_Leaderboard-Design.md` (approved May 25, 2026). Hard-ordered. Launch-prep housekeeping is complete: dev-footer removal and `engines` lock shipped in [TER-201](https://linear.app/terenc/issue/TER-201), and the Vercel rename + playRYGO.com wiring is done (Chris-side ops, [TER-151](https://linear.app/terenc/issue/TER-151)). Issues filed by Opus in order; TER-NNN numbers slot in here as they're created.

1. [TER-199](https://linear.app/terenc/issue/TER-199) — ✅ Done. **Backend foundation** — Supabase wiring, `scores` schema + RLS, `get_standing` RPC, anonymous-auth bootstrap on first launch. (Also the source for the "unique players" count: distinct `user_id`.)
2. [TER-203](https://linear.app/terenc/issue/TER-203) — ✅ Done. **Shared-engine delivery** — sync `src/engine/` (+ generator) into `supabase/functions/_shared/` with a CI hash-guard; drift = CI failure.
3. [TER-205](https://linear.app/terenc/issue/TER-205) — ✅ Done. **`useGame` event-log capture** — ordered meaningful-click log in the reducer + plumbed into the `rygo:inprogress` blob and resume path. ⚠️ Highest-risk item: touches the load-bearing hook and the TER-167 resume blob.
4a. [TER-206](https://linear.app/terenc/issue/TER-206) — ✅ Done. **Shared replay core** — pure `src/engine/replay.ts` (`applyEvent` + `replayEventLog`); `useGame` reducer delegates board+score transitions to it; synced to `_shared/engine/`. 270 existing tests stay green; 16 direct `replayEventLog` tests added (286 total).
4b. [TER-207](https://linear.app/terenc/issue/TER-207) — ✅ Done. **Edge function** — `supabase/functions/submit-score/` replay validator: pure `validate.ts` (parse → day bounds → eventLog cap → replay → elapsed bounds) + `index.ts` (CORS/auth/DB). Generator-parity fixture (12 entries, 3 seeds × 4 sizes) + 36 Deno tests (24 validate unit + 12 parity). CI extended with `deno test` step.
5. [TER-213](https://linear.app/terenc/issue/TER-213) — ✅ Done. **Client submit** — fire-and-forget on completion + `rygo:pending-submit` retry queue.
6. [TER-215](https://linear.app/terenc/issue/TER-215) — ✅ Done. **Client read** — rank-on-Summary via `get_standing`.

*(Deferred: standalone full-leaderboard view; named accounts / multi-device sync; realtime updates.)*

### M6 — Logic pivot (in progress)

1. [TER-220](https://linear.app/terenc/issue/TER-220) — ✅ Done. Production par solver (A* + memoization, placements-only, proven flag, yellow min-cover DP).
2. [TER-221](https://linear.app/terenc/issue/TER-221) — ✅ Done. Logic-loop rework (always-visible pattern, fixed layout, placements-only scoring).
3. [TER-235](https://linear.app/terenc/issue/TER-235) — ✅ Done. Game-screen header cluster (RefThumbnail + Score/Time/Par-slot side by side; global ThemeToggle overlay unchanged).
4. [TER-222](https://linear.app/terenc/issue/TER-222) — ✅ Done. Offline daily-par pipeline.
5. [TER-223](https://linear.app/terenc/issue/TER-223) — ✅ Done. Par display (Score vs Par, +1 slack, relative-to-par framing).
6. TER-225 — Backlog (Low). Clear-enabled optimality cross-check.
7. TER-226 — Backlog (Low). Solver/engine parity test.

Spike: [TER-217](https://linear.app/terenc/issue/TER-217) — ✅ Done.

### Unscheduled (pre-launch bugs / polish, no milestone yet)

* [TER-168](https://linear.app/terenc/issue/TER-168) — ✅ Done. Light-mode grid contrast — empty cells now `bg-stone-300` (~1.35:1 vs Paper). Shipped May 24, 2026.
* [TER-169](https://linear.app/terenc/issue/TER-169) — ✅ Done. Reward-screen pacing: hold on the solved board, tap to advance to Summary (no auto-advance). Shipped May 24, 2026.
* [TER-192](https://linear.app/terenc/issue/TER-192) — ✅ Done. How-to-play rules screen (static reference, picker-only, on-demand). Shipped May 24, 2026.
* [TER-201](https://linear.app/terenc/issue/TER-201) — ✅ Done. Launch-prep cleanup: dev footer removed, `engines: { node: ">=20" }` locked.
* [TER-248](https://linear.app/terenc/issue/TER-248) — ✅ Done. Generator v1.5: raise solution-length floor per size (difficulty tuning, parity fixture regenerated). Shipped May 30, 2026.
* [TER-289](https://linear.app/terenc/issue/TER-289) — ✅ Done. Leaderboard submissions silently failing (regression since ~05-27): deployed submit-score edge function was stale vs the M6 + v1.5 client and rejected every submission. Resolved June 1, 2026 by redeploying via the TER-295 workflow dispatch (ops, no code change).
* [TER-293](https://linear.app/terenc/issue/TER-293) — ✅ Done. `compute-par.yml` node-version bump `'20'` → `'22'` (supabase-js createClient requires native WebSocket, Node 22+). Shipped June 1, 2026 (PR #67).
* [TER-295](https://linear.app/terenc/issue/TER-295) — ✅ Done. `deploy-functions.yml` workflow: auto-deploys all Supabase edge functions on push to `main` touching `supabase/functions/**` and via `workflow_dispatch`. Closes the edge-function deploy-parity gap. Shipped June 1, 2026 (PR #68).
* [TER-297](https://linear.app/terenc/issue/TER-297) — ✅ Done. Summary rank stale fix: corrective `getStanding` re-read chained off `enqueueAndSubmit` settlement; null-result guard; unmount-cancellation flag. Shipped June 1, 2026 (PR #69).
* [TER-290](https://linear.app/terenc/issue/TER-290) — ✅ Done. Low grid contrast in light mode: grid-line treatment (`--color-grid-line` `#78716C`, 4.33:1 vs Paper, 3.22:1 vs stone-300) applied to Grid and RefThumbnail containers; empty-cell fill unchanged. Shipped June 2, 2026 (PR #71).
* [TER-311](https://linear.app/terenc/issue/TER-311) — ✅ In Review. Admin metrics dashboard at `/tabs` (Option B: anon aggregates RPC, no router): `get_admin_metrics()` RPC migration, `getAdminMetrics.ts` client reader, `AdminDashboard.tsx` component, `main.tsx` pathname branch, `vercel.json` rewrite. Unguarded by design. Filed June 4, 2026.
* [TER-313](https://linear.app/terenc/issue/TER-313) — ✅ In Review. Screen fade transitions (CSS-only, reduced-motion-instant): `@keyframes screenFade` + `.screen-fade` in `index.css`, keyed `<div key={view}>` wrapper in `App.tsx`, Summary wrapper in `GameScreen.tsx`. Filed June 4, 2026.
* [TER-314](https://linear.app/terenc/issue/TER-314) — ✅ In Review. `compute-par.yml` push trigger on engine paths: auto-refreshes `daily_par` on merge to `main` touching `src/engine/**` (excl. test files) or `scripts/compute-par.ts`. Closes the par-staleness gap after generator/engine changes. Filed June 4, 2026.
* [TER-240](https://linear.app/terenc/issue/TER-240) — ✅ In Review. 6×6 par budget bump: flat `BUDGET_MS = 30s` → per-size map `{ 4: 30s, 5: 30s, 6: 90s, 8: 0 }` in `scripts/compute-par.ts`. Lifts 6×6 proven rate from 7/14 baseline; 8×8 budget 0 skips pointless search. Fast-follow from TER-222 + TER-248. Filed June 4, 2026.

## Session log

The session log lives in its own file: [`RYGO_SESSION_LOG.md`](./RYGO_SESSION_LOG.md). Append session and close-out entries there (append-only; never edit older entries). Split out of this document in Process v2.5 (May 25, 2026) to keep the context doc small and locked-section close-outs cheap.
