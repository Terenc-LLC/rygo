# RYGO_CONTEXT.md

> **Source of truth:** `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md` on GitHub main (migrated from Linear in Process v2.4 docs-only PR, May 3, 2026).
> **Read this at the start of every Claude Code session** via `GitHub:get_file_contents` against `main`.
> **Update this at the end of every Claude Code session** as part of the issue's PR (allowlisted sections only).

## ⚠️ Editing rules for this document

Code may **only** modify these sections:

* **Session log** (append a new entry at the bottom; never edit older entries).
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

* **RYGO Game Design Document** — `Terenc-LLC/rygo/docs/RYGO_Game-Design-Document.md` on GitHub main. Currently at **v1.8** (May 25, 2026). Was titled "Yergers — Game Design Document" before brand finalization. (Migrated from Linear in v2.4 docs-only PR, May 3, 2026.)
* **RYGO Anonymous Daily Leaderboard (Design Doc)** — `Terenc-LLC/rygo/docs/RYGO_Leaderboard-Design.md` on GitHub main. Source of truth for the M5 leaderboard feature. Approved by Chris May 25, 2026; the "no backend" flip it required is in GDD v1.8 and this doc's Tech stack / Retention scope.
* **Terenc Development Process** — `Terenc-LLC/rygo/docs/Terenc-Development-Process.md` on GitHub main. Currently at **v2.4** (May 3, 2026). Canonical copy per project; org-level synchronization is a manual responsibility until a central terenc-org doc location is established.
* **This context document** — `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md` on GitHub main. Title is `RYGO_CONTEXT.md` (was `YERGERS_CONTEXT.md`). (Migrated from Linear in v2.4 docs-only PR, May 3, 2026.)

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
* **First reveal is free.** Timer starts on first reveal but move counter does not increment.
* **Timer is an active-play accumulator (locked; lands in [TER-167](https://linear.app/terenc/issue/TER-167)).** Measures active play time: runs while the puzzle is open (including through the transition blanks), banks and pauses when the attempt is set aside (backgrounding, refresh, quit-to-picker) and resumes on return, never resets on Restart, and discards a stale attempt at UTC rollover; the in-progress board is restored on return. (GDD v1.7.)
* **Auto-detection of completion → validation sequence.** When the playable board matches the target exactly, the timer freezes immediately and a ~750–1000ms validation sweep plays; the solved board then holds and the player taps to advance to the Summary (no timed auto-advance; reduced-motion shows the solved board immediately and still requires the tap). (Locked design doc v1.5/v1.6; sweep shipped in [TER-153](https://linear.app/terenc/issue/TER-153); tap-to-advance shipped in [TER-169](https://linear.app/terenc/issue/TER-169), GDD v1.6.)
* **Pattern and playable board are never visible at the same time.** Transitioning between them shows a 1-second blank "Get ready..." screen in either direction; the timer keeps running through the blank.

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
* **Every meaningful click counts as a move (May 2, 2026):**
  * **Placement** (tapping an empty/non-matching cell with a color active) → **+1 move**
  * **Clearing** (tapping a matching-color cell with that color active) → **+1 move**
  * **Color switch to a *different* color** in the picker → **+1 move**
  * **Color tap that does not change state** (tapping the already-active color) → **0 moves** (no-op)
  * **Re-reveal of pattern** (after the first) → **+1 move**
  * **Hide pattern** (returning to the playable board) → **+1 move**
  * **First reveal** → **0 moves** (free)
* This rule turns optimal play into a routing problem: minimize switches and re-reveals as well as placements. A 12-placement solution with 2 switches scores 14; with 5 switches it scores 17.

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
* Pattern generator solution-length ranges — initial v1.4 ranges set in [TER-146](https://linear.app/terenc/issue/TER-146) (starting L and MOVE_CAP per size; see the Pattern generator architecture note). Still to be retuned with real-play data; the per-size feel — especially whether Easy 4×4 stays easy at the longer lengths — is a Chris manual-verify item.
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
* **Solution length (v1.4):** Starting L — 4×4: 6–10, 5×5: 8–12, 6×6: 10–16, 8×8: 14–22. MOVE_CAP — 4×4: 14, 5×5: 18, 6×6: 24, 8×8: 36. Actual solution length = starting L + any appended moves (≤ MOVE_CAP).
* **Full coverage + all-3-colors:** every target cell is red/yellow/green (no empty). All three colors appear at least once. Both conditions verified before accepting a puzzle. Bulk-1000 test confirms 100% compliance and cap-exceeded rate ≤ 5%.
* **dailySeed prefix:** `'RYGO-'` (switched from `'YERGERS-'` in [TER-151](https://linear.app/terenc/issue/TER-151)).

### CI / build pipeline — READY (`.github/workflows/ci.yml`)

GitHub Actions workflow runs on every PR against `main` and every push to `main`. Single job `build-and-test` on `ubuntu-latest`, Node 20 (pinned), npm cache enabled. Steps: `npm ci` → `npm run build` → `npm run test`. The job name `build-and-test` is the required status check for branch protection. Vercel deployment continues to auto-deploy on push to `main` independently.

### Game state shape

```ts
type CellState = 'empty' | 'red' | 'yellow' | 'green';
type Board = CellState[][];
type Color = 'red' | 'yellow' | 'green';
type Move = { color: Color; row: number; col: number };
type GamePhase = 'idle' | 'pattern-revealed' | 'playing' | 'validating' | 'complete';
type Theme = 'dark' | 'light';
```

The first four types live in `src/engine/types.ts`. `GamePhase` is exported from `src/hooks/useGame.ts`. `Theme` is exported from `src/hooks/useTheme.ts`.

**Note (May 2, 2026):** `'validating'` GamePhase added in [TER-153](https://linear.app/terenc/issue/TER-153) — sits between `'playing'` and `'complete'` for the win-state validation sweep. [TER-148](https://linear.app/terenc/issue/TER-148) models the pattern↔board transition at the UI layer with a local boolean (not a hook phase) — different architectural choice from [TER-153](https://linear.app/terenc/issue/TER-153) because the transition affects only the visual, not the game state.

### useGame hook — UPDATED (`src/hooks/useGame.ts`, [TER-167](https://linear.app/terenc/issue/TER-167))

```ts
export type GamePhase = 'idle' | 'pattern-revealed' | 'playing' | 'validating' | 'complete';

export interface GameView {
  phase: GamePhase;
  gridSize: 4 | 5 | 6 | 8;
  current: Board;
  target: Board;
  patternVisible: boolean;
  elapsedMs: number;
  moveCount: number;
  activeColor: Color | null;
}

export interface GameActions {
  revealPattern: () => void;
  hidePattern: () => void;
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

`useGame` options: `resume?: InProgressBlob` — initializes state from the blob (board, phase, activeColor, moveCount, accumulatedMs); a one-shot `useEffect` dispatches `RESUME_TIMER` on mount. `keepClockOnReset?: boolean` — wires the RESET keepClock flag. `boardsMatch` is a local unexported helper.

**Notes (May 2, 2026):**

* **[TER-150](https://linear.app/terenc/issue/TER-150) shipped (May 3, 2026):** Every-click-counts scoring now fully implemented. `SELECT_COLOR` to a different color → +1; re-selecting the same color → 0 (no-op, returns state unchanged). `HIDE_PATTERN` → +1 (added here). `REVEAL_PATTERN` after first → +1 (already there). `PLACE_AT` → +1 (already there). Same-color clearing ([TER-147](https://linear.app/terenc/issue/TER-147)) → +1. 15 unit tests (was 9); 126 total passing.
* [TER-147](https://linear.app/terenc/issue/TER-147) adds clearing semantics (shipped May 2, 2026): `PLACE_AT` branches on `state.current[row][col] === state.activeColor` — true calls `applyClear`, increments `moveCount` by 1, no completion check; false follows existing placement path unchanged.
* **[TER-153](https://linear.app/terenc/issue/TER-153) shipped (May 24, 2026):** the `'validating'` phase and `completeValidation` action are live. When the boards match, `PLACE_AT` sets phase `'validating'` (timer frozen atomically); GameScreen runs the 850ms row-glow sweep, then dispatches `COMPLETE_VALIDATION` to flip phase to `'complete'`. `COMPLETE_VALIDATION` is a no-op outside `'validating'`.

### Completion check

`boardsMatch(a: Board, b: Board): boolean` — local unexported function inside `src/hooks/useGame.ts`. Checks exact cell-by-cell equality. Used in the `PLACE_AT` reducer case to detect game completion atomically.

### Screen architecture and component map — READY (`src/App.tsx`, [TER-137](https://linear.app/terenc/issue/TER-137))

App manages a two-state view machine (`'difficulty' | 'game'`), calls `useTheme()` once, renders `ThemeToggle` in a fixed `z-50` top-right overlay (respects iOS safe-area insets), and passes callbacks to screens.

**Screens:**

* **DifficultyPicker** (`src/components/DifficultyPicker.tsx`) — RYGO lockup at top ([TER-151](https://linear.app/terenc/issue/TER-151)), tagline, four `LevelButton`s: Easy 4×4, Normal 5×5, Hard 6×6, Extreme 8×8 ([TER-145](https://linear.app/terenc/issue/TER-145)). `onShowStats?` no-op stub in top-right header (slot for [TER-143](https://linear.app/terenc/issue/TER-143)). Now also accepts a `completedToday` map and passes each level's recorded result through to its `LevelButton` ([TER-142](https://linear.app/terenc/issue/TER-142)).
* **GameScreen** (`src/components/GameScreen.tsx`) — consumes `useGame(puzzle)`. Status bar (Score labeled, Time, phase text), Grid (board when !patternVisible, target when patternVisible; replaced by "Get ready..." during a 1-second transition blank), reveal/hide toggle button, `ColorPicker` (hidden during pattern-revealed), Restart button (calls `reset()`, stays on game screen, clears pending transition timer), Quit button (calls `onPickDifficulty` directly — no `window.confirm`). Transition blank: local `transitioning: boolean` state + `timerRef: useRef<number | null>` cleared via `useEffect` cleanup; `revealPattern()`/`hidePattern()` called at click time so game timer starts immediately through the blank. `mode?: 'daily' | 'practice'` prop plumbed for [TER-142](https://linear.app/terenc/issue/TER-142); in daily mode fires `onDailyComplete({moves, elapsedMs})` once when `phase === 'complete'`. On `phase === 'validating'`, renders the frozen board with the 850ms row-glow sweep + "Solved!" label + aria-live announcement, all gameplay controls suppressed, and a "Tap to continue" button (`aria-label="Continue to summary"`) that dispatches `completeValidation()` on tap — no auto-advance ([TER-169](https://linear.app/terenc/issue/TER-169)); under `prefers-reduced-motion` the sweep overlay is skipped but the tap is still required. On `phase === 'complete'`, renders `Summary` in place of the game UI. (Validating branch + sweep shipped in [TER-153](https://linear.app/terenc/issue/TER-153); tap-to-advance shipped in [TER-169](https://linear.app/terenc/issue/TER-169); the rest shipped in [TER-148](https://linear.app/terenc/issue/TER-148).)

**Sub-components:**

* **LevelButton** (`src/components/LevelButton.tsx`) — large button with `size: 4 | 5 | 6 | 8`, `label`, `onSelect`, `completedToday?: { moves, elapsedMs }`. In completed state ([TER-142](https://linear.app/terenc/issue/TER-142)) shows the recorded result (`{moves} moves · {M:SS}`) plus a live H:MM:SS countdown to the next UTC day and a "Practice" affordance; tapping still calls `onSelect` (which starts practice mode).
* **ColorPicker** (`src/components/ColorPicker.tsx`) — red/yellow/green buttons showing color bg + shape icon. Active state: `ring-4 ring-blue-500 ring-offset-2 ring-offset-paper dark:ring-offset-ink` (non-color cue; blue-500 contrasts all three game colors in both themes; shipped in [TER-148](https://linear.app/terenc/issue/TER-148)).
* **Summary** (`src/components/Summary.tsx`) — score (moves), time, grid size (labels: Easy/Normal/Hard/Extreme — updated [TER-145](https://linear.app/terenc/issue/TER-145)), Share button (full-width, above the "Play again" + "Change difficulty" row — shipped in [TER-144](https://linear.app/terenc/issue/TER-144)), `flex gap-3` button row with "Play again" + "Change difficulty". Props: `gridSize`, `moveCount`, `elapsedMs`, `date`, `mode`, `streak`. Calls `buildShareString` from `src/share/shareString.ts`; invokes Web Share API (mobile native sheet), else clipboard (`Copied!` label for 2s), else textarea fallback.
* **ThemeToggle** (`src/components/ThemeToggle.tsx`) — receives `theme` and `toggleTheme` as props from App. Shows `Sun` when dark, `Moon` when light. `aria-label` reflects the action.

**Board interactivity:** Grid cells are disabled (`onCellTap` = undefined) in `idle`, `pattern-revealed`, and `validating` phases; enabled only in `playing`.

**Win-state row-glow sweep (shipped in** [TER-153](https://linear.app/terenc/issue/TER-153)**, May 24, 2026):** during `'validating'`, an absolutely-positioned overlay grid (matching `grid-cols-N gap-1`) renders one div per cell carrying the `rowGlow` CSS animation — an inset green ring (`box-shadow inset 0 0 0 3px #2E9D5C`) that fades in/out, staggered per row by `SWEEP_MS / gridSize` (`SWEEP_MS = 850`). Overlay is `pointer-events-none` and does not recolor the cells underneath. `@keyframes rowGlow` lives in `src/index.css`. `prefers-reduced-motion` is captured once at mount in a `useRef`; when set, the overlay is skipped and the hold is 400ms.

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

Separate `rygo:inprogress` key keeps `rygo:state` results schema clean and append-only. `runStartedAt` is NOT persisted — on resume, `runStartedAt = now`. `loadInProgress` validates `date === todayKey()` (stale → null) and `version <= 1` (future → null); all I/O wrapped in try/catch. `saveInProgress` is called on pause (`visibilitychange` hidden / `pagehide`), on Restart (with cleared board state), and on Quit; `deleteInProgress` is called on completion. The pause-save handler guards on phase — it persists only in `{idle, pattern-revealed, playing}`, never in `validating`/`complete`, so a solved board is never written (would otherwise strand a resumed session with no continue button). 13 unit tests in `inProgress.test.ts` + 2 GameScreen guard tests. Practice mode never calls any of these.

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

### Supabase backend — READY (`src/backend/supabaseClient.ts`) [TER-199]

```ts
export const supabase: SupabaseClient | null   // null when env vars absent
export const userIdPromise: Promise<string | null>  // resolves to anon user_id (or null)
```

Initializes the Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. If either env var is absent (CI, local dev without `.env`), the module exports `null` and `userIdPromise` resolves to `null` — no throw, no network call, no console spam. This is the hard non-negotiable: gameplay never depends on the network; callers must guard on `supabase !== null`.

**Anonymous auth bootstrap:** on module load (if client is live), best-effort: `getSession()` reuses an existing localStorage-persisted session; otherwise `signInAnonymously()` creates a new one. Any error is swallowed; `userIdPromise` resolves to `null` on failure. The anon `user_id` is the dedup key for one-result-per-player-per-day-per-level.

**SQL migration:** `supabase/migrations/20260525000000_scores_schema.sql` — `scores` table (`id`, `user_id`, `day`, `grid_size`, `moves`, `elapsed_ms`, `created_at`; unique on `(user_id, day, grid_size)`), RLS enabled with no client INSERT/UPDATE policy, and the read-only `get_standing(day, grid_size, moves, elapsed_ms) → { rank, total }` RPC (`security definer`, `set search_path = ''`). Sort key: moves ASC, elapsed_ms ASC.

Shipped in [TER-199](https://linear.app/terenc/issue/TER-199), May 25, 2026.

## Coding conventions

* TypeScript strict mode on. No `any` without an explicit comment justifying it.
* In `react-jsx` mode (tsconfig), `JSX` namespace is not global — import it: `import type { JSX } from 'react'`
* Pure logic (placement engine, generator, completion check, clearing helper) lives in `src/engine/` and is fully unit-tested with Vitest.
* React components live in `src/components/`.
* React hooks live in `src/hooks/`.
* Persistence modules live in `src/persistence/` (introduced in [TER-142](https://linear.app/terenc/issue/TER-142)).
* No business logic in components.
* Tailwind v4 for all styling. CSS-based config (no `tailwind.config.js`). Brand tokens (`ink`, `paper`, `rygo-red`, `rygo-yellow`, `rygo-green`) defined via `@theme` block in `index.css` ([TER-152](https://linear.app/terenc/issue/TER-152)). No CSS modules.
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
* [TER-150](https://linear.app/terenc/issue/TER-150) — ✅ Done. Every-click-counts scoring (color switch, hide pattern).
* [TER-146](https://linear.app/terenc/issue/TER-146) — ✅ Done. Generator v1.4: full coverage + all 3 colors + retune (Phase A green guarantee, 100-attempt cap).
* [TER-153](https://linear.app/terenc/issue/TER-153) — ✅ Done. Win-state validation sequence (`'validating'` GamePhase + green row-glow sweep + Solved! label before Summary).

### M3 — Daily ritual (pre-launch) (✅ complete)

* [TER-142](https://linear.app/terenc/issue/TER-142) — ✅ Done. Daily play tracking + once-per-day lock + localStorage foundation.
* [TER-143](https://linear.app/terenc/issue/TER-143) — ✅ Done. Stats screen (global streak + per-level self-comparison). Shipped May 24, 2026.
* [TER-144](https://linear.app/terenc/issue/TER-144) — ✅ Done. Share button on Summary (spoiler-free: score + streak, never the board). Shipped May 24, 2026.
* [TER-167](https://linear.app/terenc/issue/TER-167) — ✅ Done. Persistent daily-attempt timer (accumulator clock, pause/resume across sessions, resume in-progress board). Shipped May 24, 2026.

### M4 — Polish (post-launch)

* [TER-154](https://linear.app/terenc/issue/TER-154) **(parent)** — M4 Feel polish: haptic feedback, audio cues (R-Y-G chime + percussive tap), screen transitions, breathing-room layout pass. Sub-issues filed when M4 starts.

### M5 — Anonymous daily leaderboard (pre-launch feature)

First backend for RYGO. Design: `docs/RYGO_Leaderboard-Design.md` (approved May 25, 2026). Hard-ordered. Launch-prep housekeeping is complete: dev-footer removal and `engines` lock shipped in [TER-201](https://linear.app/terenc/issue/TER-201), and the Vercel rename + playRYGO.com wiring is done (Chris-side ops, [TER-151](https://linear.app/terenc/issue/TER-151)). Issues filed by Opus in order; TER-NNN numbers slot in here as they're created.

1. [TER-199](https://linear.app/terenc/issue/TER-199) — ✅ Done. **Backend foundation** — Supabase wiring, `scores` schema + RLS, `get_standing` RPC, anonymous-auth bootstrap on first launch. (Also the source for the "unique players" count: distinct `user_id`.)
2. **Shared-engine delivery** — sync `src/engine/` (+ generator) into `supabase/functions/_shared/` with a CI hash-guard; drift = CI failure.
3. **`useGame` event-log capture** — ordered meaningful-click log in the reducer + plumbed into the `rygo:inprogress` blob and resume path. ⚠️ Highest-risk item: touches the load-bearing hook and the TER-167 resume blob; gets its own design pass at draft time.
4. **Edge function** — full-session replay validator (§5 of the design doc).
5. **Client submit** — fire-and-forget on completion + `rygo:pending-submit` retry queue.
6. **Client read** — rank-on-Summary via `get_standing`.

*(Deferred: standalone full-leaderboard view; named accounts / multi-device sync; realtime updates.)*

### Unscheduled (pre-launch bugs / polish, no milestone yet)

* [TER-168](https://linear.app/terenc/issue/TER-168) — ✅ Done. Light-mode grid contrast — empty cells now `bg-stone-300` (~1.35:1 vs Paper). Shipped May 24, 2026.
* [TER-169](https://linear.app/terenc/issue/TER-169) — ✅ Done. Reward-screen pacing: hold on the solved board, tap to advance to Summary (no auto-advance). Shipped May 24, 2026.
* [TER-192](https://linear.app/terenc/issue/TER-192) — ✅ Done. How-to-play rules screen (static reference, picker-only, on-demand). Shipped May 24, 2026.
* [TER-201](https://linear.app/terenc/issue/TER-201) — ✅ Done. Launch-prep cleanup: dev footer removed, `engines: { node: ">=20" }` locked.

## Session log

> Add a new entry at the end of every Code session. Most recent at bottom. Never edit older entries.

### 2026-05-01 — [TER-132](https://linear.app/terenc/issue/TER-132) scaffold (Claude Code / Sonnet 4.6)

Scaffolded the full project. Pushed initial commit to `Terenc-LLC/yergers` main branch. Vercel deployed.

* Vite 8 + React 19 + TypeScript 6 (strict) scaffold via `npm create vite@latest`.

**Tooling notes for future sessions:**

* Tailwind v4 uses `@import "tailwindcss"` in CSS, not `@tailwind base/components/utilities`. No `tailwind.config.js`.
* Vitest config lives inside `vite.config.ts` using `/// <reference types="vitest/config" />` to merge types.
* `vitest/globals` added to `tsconfig.app.json` `types` array so test globals are typed without imports.

### 2026-05-01 — [TER-132](https://linear.app/terenc/issue/TER-132) dark mode follow-up (Claude Code / Sonnet 4.6)

Added class-based dark mode foundation per Opus reopen.

### 2026-05-01 — [TER-133](https://linear.app/terenc/issue/TER-133) placement engine (Claude Code / Sonnet 4.6)

Implemented the color placement engine. 24 unit tests passing. Commit `42f9161`.

### 2026-05-01 — Opus review of [TER-133](https://linear.app/terenc/issue/TER-133) + context doc repair

Restored locked decisions accidentally removed by Code's restructure.

### 2026-05-01 — [TER-135](https://linear.app/terenc/issue/TER-135) Grid component (Claude Code / Sonnet 4.6)

Implemented the mobile-first Grid component with full color-blind accessibility. 42 tests passing. Commit `2b03150`.

### 2026-05-01 — Opus review of [TER-135](https://linear.app/terenc/issue/TER-135) + context doc repair (second occurrence)

Restored locked decisions accidentally removed by Code's restructure (same regression as [TER-133](https://linear.app/terenc/issue/TER-133)). Strengthened the editing rules at the top of this doc to be an explicit allowlist.

### 2026-05-01 — [TER-138](https://linear.app/terenc/issue/TER-138) CI workflow (Claude Code / Sonnet 4.6)

First clean run of the v2 process. PR #1 opened; meta-test passed in 15s.

### 2026-05-01 — Opus review of [TER-138](https://linear.app/terenc/issue/TER-138) + context doc restoration

All steps followed correctly. Added CI to tech stack and architecture notes.

### 2026-05-01 — [TER-140](https://linear.app/terenc/issue/TER-140) page chrome theming (Claude Code / Sonnet 4.6)

Made page background and text respond to the `dark` class. PR #3 opened.

### 2026-05-01 — [TER-139](https://linear.app/terenc/issue/TER-139) Octagon → Square swap (Claude Code / Sonnet 4.6)

Replaced `Octagon` with `Square` for red cells. PR #2 opened.

### 2026-05-01 — Opus review of [TER-139](https://linear.app/terenc/issue/TER-139) + [TER-140](https://linear.app/terenc/issue/TER-140) + context doc reconciliation

Both PRs approved. The predicted concurrency issue occurred: Code 139 clobbered Code 140's session log entry. Restored [TER-140](https://linear.app/terenc/issue/TER-140)'s session log entry.

### 2026-05-01 — [TER-134](https://linear.app/terenc/issue/TER-134) pattern generator (Claude Code / Sonnet 4.6)

Implemented the deterministic, seeded pattern generator. 55 tests passing. PR #4.

### 2026-05-01 — Opus review of [TER-134](https://linear.app/terenc/issue/TER-134)

Approved. First session where Code respected the v2.1 context-doc allowlist with no regressions.

### 2026-05-01 — Process bumped to v2.2; [TER-134](https://linear.app/terenc/issue/TER-134) closed by Opus

Chris reported [TER-134](https://linear.app/terenc/issue/TER-134)'s PR merged. Process doc bumped to v2.2 codifying the new rule: when Chris reports a merge, Opus marks the issue Done and updates the context doc issue map.

### 2026-05-01 — [TER-141](https://linear.app/terenc/issue/TER-141) footer (Claude Code / Sonnet 4.6)

Added persistent "last shipped" footer to the App. PR #5.

### 2026-05-01 — Opus review of [TER-141](https://linear.app/terenc/issue/TER-141) + context doc reconciliation (third occurrence)

Approved. The parallel-edit problem hit again: Opus's v2.2 process update clobbered Code's session-end doc save. Restored Code's [TER-141](https://linear.app/terenc/issue/TER-141) doc updates.

### 2026-05-01 — [TER-141](https://linear.app/terenc/issue/TER-141) closed; GitHub migration deferred

Chris reported [TER-141](https://linear.app/terenc/issue/TER-141)'s PR merged. Opus marked Done. Chris elected to defer the context-doc → GitHub migration in favor of moving forward to [TER-136](https://linear.app/terenc/issue/TER-136).

### 2026-05-01 — [TER-136](https://linear.app/terenc/issue/TER-136) useGame hook (Claude Code / Sonnet 4.6)

Implemented the `useGame` hook. 64 total tests passing; CI green on PR #6 in 17s.

### 2026-05-01 — Opus review of [TER-136](https://linear.app/terenc/issue/TER-136)

Approved. Clean execution.

### 2026-05-01 — [TER-136](https://linear.app/terenc/issue/TER-136) closed; M3 milestone created; retention issues filed

Chris reported [TER-136](https://linear.app/terenc/issue/TER-136)'s PR merged. Opus closed the issue. New milestone M3 — Daily ritual (pre-launch). Filed [TER-142](https://linear.app/terenc/issue/TER-142), [TER-143](https://linear.app/terenc/issue/TER-143), [TER-144](https://linear.app/terenc/issue/TER-144).

### 2026-05-02 — [TER-137](https://linear.app/terenc/issue/TER-137) Full game UI (Claude Code / Sonnet 4.6)

Implemented the complete playable game UI. 82 tests passing. CI green on PR #7. **M2 baseline shipped.**

### 2026-05-02 — Opus review of [TER-137](https://linear.app/terenc/issue/TER-137); [TER-137](https://linear.app/terenc/issue/TER-137) closed; six M2 follow-ups filed

Chris reported [TER-137](https://linear.app/terenc/issue/TER-137)'s PR merged. Opus closed the issue. **M2 baseline complete: game is playable in production.** Six M2 follow-ups filed: [TER-149](https://linear.app/terenc/issue/TER-149), [TER-147](https://linear.app/terenc/issue/TER-147), [TER-148](https://linear.app/terenc/issue/TER-148), [TER-150](https://linear.app/terenc/issue/TER-150), [TER-145](https://linear.app/terenc/issue/TER-145), [TER-146](https://linear.app/terenc/issue/TER-146).

### 2026-05-02 — [TER-145](https://linear.app/terenc/issue/TER-145) Difficulty ladder 4/5/6/8 (Claude Code / Sonnet 4.6)

Widened the grid-size type union to `4 | 5 | 6 | 8`. Added Normal (5×5). 89 tests passing. PR #8 merged.

### 2026-05-02 — Opus review of [TER-145](https://linear.app/terenc/issue/TER-145); [TER-145](https://linear.app/terenc/issue/TER-145) closed

Approved. Clean execution. PR #8 merged.

### 2026-05-02 — [TER-149](https://linear.app/terenc/issue/TER-149) Placement engine green blocking semantics (Claude Code / Sonnet 4.6)

Updated `src/engine/placement.ts` to introduce blocking semantics for green's reach. `targetCells` → `reachCells(board, color, row, col)`. 96 total tests passing. PR #9 merged.

### 2026-05-02 — Opus review of [TER-149](https://linear.app/terenc/issue/TER-149); [TER-149](https://linear.app/terenc/issue/TER-149) closed

Approved. Cleanest engine change of the project.

### 2026-05-02 — Brand finalization: Yergers → RYGO; design doc → v1.5; four new issues filed

Brand finalized as RYGO. Brand palette adopted as game palette. Validation sequence locked. Click feedback folded into [TER-148](https://linear.app/terenc/issue/TER-148). Audio/haptics deferred to M4. New issues: [TER-151](https://linear.app/terenc/issue/TER-151), [TER-152](https://linear.app/terenc/issue/TER-152), [TER-153](https://linear.app/terenc/issue/TER-153), [TER-154](https://linear.app/terenc/issue/TER-154).

### 2026-05-02 — [TER-151](https://linear.app/terenc/issue/TER-151) Yergers → RYGO rebrand (Claude Code / Sonnet 4.6)

Migrated all Yergers references to RYGO. 98 tests passing. PR #10.

### 2026-05-02 — Process bumped to v2.3; [TER-151](https://linear.app/terenc/issue/TER-151) closed by Opus

Process doc bumped to v2.3 codifying inline-checklist rule and autonomous Todo-queue mode.

### 2026-05-02 — [TER-147](https://linear.app/terenc/issue/TER-147) Same-color clearing mechanic (Claude Code / Sonnet 4.6)

Added `clearCells` and `applyClear` to placement engine; branched `PLACE_AT` reducer. 115 tests passing. PR #11.

### 2026-05-02 — [TER-147](https://linear.app/terenc/issue/TER-147) closed by Opus

Approved and closed. Players now have a path back from misplays.

### 2026-05-02 — [TER-152](https://linear.app/terenc/issue/TER-152) RYGO brand palette tokens (Claude Code / Sonnet 4.6)

Defined brand tokens via `@theme` block; swapped utilities across 7 files. 115 tests passing. PR #12.

### 2026-05-02 — [TER-152](https://linear.app/terenc/issue/TER-152) closed by Opus; [TER-148](https://linear.app/terenc/issue/TER-148) refreshed

Approved and closed. Brand palette live throughout the app. [TER-148](https://linear.app/terenc/issue/TER-148) spec refreshed for the new paper/ink offsets and v2.3 inline checklist.

### 2026-05-02 — [TER-148](https://linear.app/terenc/issue/TER-148) Game-screen UX cleanup (Claude Code / Sonnet 4.6)

Five UX improvements shipped: window.confirm removed from Quit; Restart button added; active-color ring changed to `ring-blue-500` with `ring-offset-paper dark:ring-offset-ink`; 1-second "Get ready..." transition blank on reveal/hide with `useRef`+`useEffect` cleanup; cell `<button>` transition widened to `transition-[transform,background-color,color] duration-150`. 120 tests passing (was 115; +5 new). PR #13.

### 2026-05-03 — [TER-148](https://linear.app/terenc/issue/TER-148) closed by Opus; Process doc bumped to v2.4 (docs migrated to repo + Opus docs-only PRs); first docs-only PR opened

Chris reported [TER-148](https://linear.app/terenc/issue/TER-148)'s PR merged (PR #13). Opus marked the issue Done.

**Two combined process changes shipped as Process v2.4:**

1. **Docs migrated from Linear to repo `docs/`.** Project context document (this file), org Process doc (`docs/Terenc-Development-Process.md`), and design docs all now live in this repo at `docs/`. Linear is no longer used for documents — only for issues. Drove off three prior last-write-wins clobbering incidents on parallel Linear edits. Open question "Migrate context doc from Linear to GitHub" resolved and removed.
2. **Opus opens docs-only PRs for locked-section updates.** Phase 5 close-out flow now: when a merged change requires updates to locked sections of this doc or the Process doc, Opus creates a branch named `opus/docs-<short-description>`, pushes the doc changes, opens a PR titled with `docs:` prefix, Chris merges. Opus's GitHub write access is scoped to `docs/` — never touches source. Code's next session pulls main and picks up the changes automatically.

Also: Phase 4 Opus-reviews bullet now references `GitHub:pull_request_read` directly (no "Chris pastes key files if necessary" fallback). First Opus PR review using GitHub MCP was on TER-148.

Locked-section updates absorbed in this PR:

* **Source-of-truth documents:** all three doc references switched from Linear doc IDs to GitHub `docs/` paths. Process doc reference bumped to v2.4.
* **Issue map:** [TER-148](https://linear.app/terenc/issue/TER-148) → ✅ Done.
* **Open questions:** removed the resolved "Migrate context doc from Linear to GitHub" entry; left a one-line resolution note at the bottom for traceability.
* **Concurrency note** at top of doc: updated from Linear last-write-wins framing to git-based merge-conflict framing.
* **Architecture notes:** TER-148 details (GameScreen Restart/transition/quit-without-confirm; ColorPicker active ring; Grid transition expansion) had already been added by Code in the TER-148 session and are retained as-is.

**M2 follow-ups status:** 6 of 9 shipped (TER-145 / TER-149 / TER-151 / TER-147 / TER-152 / TER-148). Remaining: [TER-150](https://linear.app/terenc/issue/TER-150) unblocked; [TER-146](https://linear.app/terenc/issue/TER-146) unblocked but design pass pending; [TER-153](https://linear.app/terenc/issue/TER-153) design pass pending.

**Next recommended:** [TER-150](https://linear.app/terenc/issue/TER-150) (every-click-counts scoring) — locked spec, narrow blast radius (touches `useGame` reducer + tests). For a parallel design slot, [TER-146](https://linear.app/terenc/issue/TER-146) generator rewrite or [TER-153](https://linear.app/terenc/issue/TER-153) validation sweep are the two M2 issues still needing design passes.

### 2026-05-03 — [TER-150](https://linear.app/terenc/issue/TER-150) Every-click-counts scoring (Claude Code / Sonnet 4.6)

Updated `SELECT_COLOR` and `HIDE_PATTERN` reducer cases in `src/hooks/useGame.ts` to charge +1 move. `SELECT_COLOR` to the already-active color returns state unchanged (no charge). `HIDE_PATTERN` now increments `moveCount` by 1. No changes to `REVEAL_PATTERN`, `PLACE_AT`, or the hook's public interface. 6 existing tests updated to match new scoring rules; 6 new tests added covering HIDE_PATTERN charge, SELECT_COLOR no-op, SELECT_COLOR sequences, and the full 8-move realistic sequence. 126 tests passing; build clean. PR opened against main.

### 2026-05-24 — [TER-146](https://linear.app/terenc/issue/TER-146) Generator v1.4 — full coverage + all 3 colors + retune (Claude Code / Sonnet 4.6)

**Two-session implementation.** Session 1 (May 4): implemented v1.4 algorithm — full-coverage Phase A/B append loop, color weights red 0.40 / yellow 0.40 / green 0.20, solution-length ranges and MOVE_CAPs per issue table, trivial-puzzle rejection retained. Bulk-1000 test: 100% full coverage, 100% all-3-colors, all non-triviality checks passing — but cap-exceeded rate 7.4% (above 5% escape hatch). Stopped per spec; posted Linear escape-hatch comment.

Session 2 (May 24): applied Option 2 retune per Opus/Chris decision comment. During Phase A, whenever green is absent from the current board state, the next appended move is forced to green (targeting a seed-derived empty cell). This closes the structural gap: Phase B cannot place green on a fully-covered board, so Phase A is the only window. Also capped the outer retry loop at 100 attempts (previously 1000) and changed cap-exceeded throw to include seed and gridSize as a bug signal. Added `_getMaxAttemptsObserved()` to test instrumentation. Re-ran bulk-1000 test: 100% full coverage, 100% all-3-colors, cap-exceeded rate ≤ 5%, max attempts per puzzle ≤ 10 (well under the 100 cap). 127 tests passing; build clean. PR opened against main.

### 2026-05-24 — [TER-146](https://linear.app/terenc/issue/TER-146) closed by Opus

Chris reported [TER-146](https://linear.app/terenc/issue/TER-146)'s PR merged (PR #23). Opus reviewed the diff (Phase A green guarantee, deterministic forced-cell selection, 100-attempt cap with descriptive throw), confirmed acceptance criteria against the bulk-1000 results, and marked the issue Done. **M2 follow-ups: 9 of 10 now Done.**

Locked-section updates absorbed in this docs-only PR:

* **Open questions:** removed the resolved "add max-attempts cap on the rejection-retry loop" entry (cap shipped in TER-146) and added a one-line resolution note. Reframed the solution-length-ranges entry to "initial v1.4 ranges set; retune with real-play data" and split the color-weights hypothesis into its own real-play-data item.
* **Issue map:** [TER-146](https://linear.app/terenc/issue/TER-146) → ✅ Done; [TER-153](https://linear.app/terenc/issue/TER-153) annotated as the last open M2 issue; M3 blocker note simplified now that only TER-153 remains ahead of it.
* **Architecture notes / session log:** the generator v1.4 entry and the Code session-log entry were added by Code in the TER-146 PR and are retained as-is.

**Next recommended:** design pass on [TER-153](https://linear.app/terenc/issue/TER-153) (win-state validation sweep — `'validating'` GamePhase, 750–1000ms row pulse, RYGO mark glow). It is the last open M2 issue; closing it completes M2 and unblocks M3 (daily ritual: TER-142 → 143 → 144).

### 2026-05-24 — [TER-153](https://linear.app/terenc/issue/TER-153) Win-state validation sequence (Claude Code / Sonnet 4.6)

*(Restored by Opus — this entry was dropped when the TER-153 branch's merge-conflict resolution kept main's side of this file. The code shipped intact; only this doc entry was lost.)*

Added `'validating'` GamePhase between `'playing'` and `'complete'`. Reducer changes: `PLACE_AT` now transitions to `'validating'` (not `'complete'`) on a matching board, freezing `elapsedMs` atomically; new `COMPLETE_VALIDATION` action flips `'validating' → 'complete'`; `completeValidation()` exposed on `GameActions`. Added a comment on the same-color-clear path explaining why it skips the completion check (full-coverage targets, TER-146).

GameScreen changes: `'validating'` early-return renders the frozen matched board with a row-by-row green inset-ring glow overlay (CSS `rowGlow` keyframe with per-row animation-delay stagger at `SWEEP_MS / rowCount`). Glow is an absolutely-positioned overlay grid — does not recolor or obscure cell colors or shapes. "Solved!" shown in the phase-label slot; `aria-live="polite"` region announces completion. All interactive controls suppressed during validating. Sweep driven by `setTimeout(SWEEP_MS=850ms)` stored in `timerRef`, cleared on unmount. Under `prefers-reduced-motion`, skips the animated overlay and holds 400ms before dispatching `completeValidation()`.

Tests: `useGame.test.ts` — updated existing completion test to assert `'validating'`; updated timer-stop test to use the validating→complete path; 3 new tests (completeValidation transitions, no-op outside validating, timer frozen through validating). `GameScreen.test.tsx` — updated summary-appears test to advance past SWEEP_MS; 3 new tests (controls suppressed, normal sweep, reduced-motion 400ms hold). Added jsdom `matchMedia` stub. 131 tests passing; build clean. PR #25.

### 2026-05-24 — [TER-153](https://linear.app/terenc/issue/TER-153) closed by Opus; M2 complete

Chris reported [TER-153](https://linear.app/terenc/issue/TER-153)'s PR merged (PR #25). Opus reviewed the diff (validating-phase reducer changes, the row-glow overlay sweep, reduced-motion 400ms hold, controls suppression, test coverage) with CI green, and marked the issue Done. **M2 — Playable MVP is now complete; every M2 issue is Done.**

**Merge-conflict recovery:** PR #25's branch predated the TER-146 docs-only close-out (PR #24), so both touched the TER-153 issue-map line and the session log. Resolving the conflict (merge commit `9016849`) kept main's side and dropped Code's TER-153 doc edits — the issue-map status bump and the session-log entry. The code landed cleanly; only those doc edits were lost. Code's TER-153 session-log entry is restored above, and the issue-map line is set to Done here. (The v2.4 git path surfaced this as a real conflict rather than a silent clobber, but a Code branch predating an open Opus docs-only PR can still lose doc edits on resolution — reminder added to the concurrency note: land Opus docs PRs before launching the next Code session.)

Locked-section updates absorbed in this PR:

* **Issue map:** [TER-153](https://linear.app/terenc/issue/TER-153) → ✅ Done; M2 header marked ✅ complete.
* **Open questions:** cascade-animations bullet updated — the validation sweep shipped in TER-153; further cascades remain M4.
* **Architecture notes:** added the win-state row-glow sweep details (GameScreen `'validating'` branch, `rowGlow` keyframe, reduced-motion handling), the useGame `'validating'`/`completeValidation` shipped note, the glow-overlay row in the theme palette table, and the `matchMedia` test-stub note. Accessibility note amended to mention the Solved!/aria-live success cue.
* **M3:** [TER-142](https://linear.app/terenc/issue/TER-142) blocker note cleared — M2 follow-ups all shipped; it's the first M3 issue.

**Next recommended:** M3 — Daily ritual. [TER-142](https://linear.app/terenc/issue/TER-142) (daily play tracking + once-per-day lock + localStorage foundation) goes first — it defines the localStorage schema the stats and share features read from. Then [TER-143](https://linear.app/terenc/issue/TER-143) (stats) and [TER-144](https://linear.app/terenc/issue/TER-144) (share). Each needs a design pass before Code; TER-142 especially, since its schema is load-bearing for the rest of M3.

### 2026-05-24 — [TER-142](https://linear.app/terenc/issue/TER-142) Daily play tracking + once-per-day lock + localStorage foundation (Claude Code / Sonnet 4.6)

Created `src/persistence/dailyState.ts` with the full `rygo:state` schema (version 1), all six pure helpers, and every localStorage access wrapped in try/catch. 34 unit tests covering happy paths, idempotency, first-write-wins, corrupt JSON, newer-schema guard, and localStorage unavailability. Updated `LevelButton` to show recorded result + live H:MM:SS countdown in completed state, and `DifficultyPicker` to accept and pass through the `completedToday` map. Added `onDailyComplete` callback to `GameScreen` (fires once on `phase === 'complete'` in daily mode). Wired everything in `App`: state loaded at startup, day key captured at puzzle launch, recording on completion, practice mode when level is already completed today (same seed, no recording). 165 tests passing; build clean. PR opened against main.

### 2026-05-24 — [TER-142](https://linear.app/terenc/issue/TER-142) closed by Opus; first M3 issue shipped; this docs PR also locks [TER-169](https://linear.app/terenc/issue/TER-169) tap-to-advance

Chris reported [TER-142](https://linear.app/terenc/issue/TER-142)'s PR merged (PR #27). Opus reviewed the diff (the `rygo:state` v1 schema + six pure helpers in `src/persistence/dailyState.ts`; the daily lock wired through `App` / `DifficultyPicker` / `GameScreen`; completed-state result + countdown; same-seed practice mode) with CI green and 165 tests passing, and marked the issue Done. **First M3 issue shipped — the localStorage foundation that TER-143 (stats) and TER-144 (share) read from is now in place.**

Review notes carried forward (non-blocking): the DifficultyPicker can show a stale completed-state + `0:00:00` countdown if left open across a UTC midnight (display-only, self-heals on re-render) — fold into [TER-167](https://linear.app/terenc/issue/TER-167) rollover handling rather than patch separately. Code left the Linear issue In Progress (the doc issue-map line said In Review); Opus moved it through In Review → Done.

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-142](https://linear.app/terenc/issue/TER-142) → ✅ Done. Added [TER-167](https://linear.app/terenc/issue/TER-167) to M3 (design pass in progress) and a new "Unscheduled" subsection for [TER-168](https://linear.app/terenc/issue/TER-168) (light-mode grid contrast) and [TER-169](https://linear.app/terenc/issue/TER-169) (reward-screen tap-to-advance).
* **TER-169 design lock (bundled):** GDD bumped to v1.6; the Game-mechanics validation-sequence bullet now reads "sweep plays, solved board holds, player taps to advance — no timed auto-advance; reduced-motion shows the solved board immediately and still requires the tap." This makes [TER-169](https://linear.app/terenc/issue/TER-169) Code-ready. The GameScreen architecture note still describes the shipped TER-153 auto-advance and will be updated when TER-169 lands.
* **Open questions:** reframed the shapes entry from "always-on for MVP" to a post-launch opt-out toggle (default on) paired with future CVD-friendly palettes; noted aggregate choice-tracking isn't possible under the current no-backend architecture.
* **Source-of-truth documents + Tech stack:** GDD reference bumped to v1.6; `rygo:state` line changed from "lands in TER-142" to "shipped in TER-142."
* **Architecture notes:** DifficultyPicker / GameScreen `onDailyComplete` / LevelButton completed-state / Persistence module entries had already been added by Code in the TER-142 PR and are retained, with a one-line note on the cross-midnight staleness gap.

**Next recommended:** [TER-167](https://linear.app/terenc/issue/TER-167) design pass (persistent attempt timer) — TER-142's schema is settled, so its dependency is clear; it's the natural next M3 design conversation before [TER-143](https://linear.app/terenc/issue/TER-143). For an immediate Code slot, [TER-168](https://linear.app/terenc/issue/TER-168) (light-mode grid) is ready to promote now, and [TER-169](https://linear.app/terenc/issue/TER-169) becomes Code-ready once this docs PR merges.

### 2026-05-24 — [TER-168](https://linear.app/terenc/issue/TER-168) Light-mode grid contrast (Claude Code / Sonnet 4.6)

*(Session-log entry added by Opus at close-out — Code's PR #29 updated the theme-palette table but omitted this entry.)*

Changed the light-mode empty-cell background from `bg-gray-100` (`#F3F4F6`, near-identical luminance to Paper) to `bg-stone-300` (`#D6D3D1`, ~1.35:1 contrast vs Paper `#F5F3EE`), so empty cells and the `gap-1` grid lines are visible in light mode at all four sizes. Dark mode (`dark:bg-gray-800`) unchanged; filled cells, shape fills, the active ring, and all other surfaces untouched. Touched the `CELL_BG` empty entry in `Grid.tsx`, the `Grid.test.tsx` class assertion, and the theme-palette table in this doc. 165 tests passing; build clean. PR #29.

### 2026-05-24 — [TER-168](https://linear.app/terenc/issue/TER-168) closed by Opus

Chris reported [TER-168](https://linear.app/terenc/issue/TER-168)'s PR merged (PR #29). Opus reviewed the diff (single-token swap to `bg-stone-300`, contrast verified at ~1.34:1 vs Paper, `Grid.test.tsx` assertion updated, theme-palette table updated), CI green / 165 tests, and marked the issue Done.

Follow-up noted (not filed): the same warm-Paper wash-out affects sibling surfaces still on cool grays — `LevelButton` and the Summary card (`bg-gray-100`) and the reveal/action buttons (`bg-gray-200`). Candidate for a small follow-up issue if it shows on device; flagged for Chris during light-mode verification.

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-168](https://linear.app/terenc/issue/TER-168) → ✅ Done (Unscheduled subsection). [TER-167](https://linear.app/terenc/issue/TER-167) note updated — design pass complete, spec written, sequenced after [TER-169](https://linear.app/terenc/issue/TER-169); [TER-169](https://linear.app/terenc/issue/TER-169) marked Code-ready (GDD v1.6 lock merged) and to land first.
* **Architecture notes:** the Grid component note now records the `bg-stone-300` light-mode empty-cell change; the theme-palette table row + heading ref were already added by Code in PR #29 and are retained.
* **Session log:** this close-out entry plus the TER-168 Code session entry that PR #29 omitted.

**Next recommended:** [TER-169](https://linear.app/terenc/issue/TER-169) (reward-screen tap-to-advance) — Code-ready, smallest of the open items, and lands before [TER-167](https://linear.app/terenc/issue/TER-167) since both touch the `validating→complete` seam. Then [TER-167](https://linear.app/terenc/issue/TER-167) (persistent attempt timer, spec ready).

### 2026-05-24 — [TER-169](https://linear.app/terenc/issue/TER-169) Reward-screen tap-to-advance (Claude Code / Sonnet 4.6)

Replaced the auto-advance `setTimeout` in GameScreen with a player-controlled tap. The `useEffect` that called `completeValidation()` after 850ms (or 400ms under `prefers-reduced-motion`) is removed. During `'validating'`, a "Tap to continue" button (`aria-label="Continue to summary"`, full-width, keyboard-accessible) is now rendered below the board and calls `game.completeValidation()` on click. The row-glow sweep animation and `SWEEP_MS = 850` are unchanged. Under `prefers-reduced-motion` the sweep overlay is skipped (as before) and the tap is still required (no forced timeout). `useGame` reducer is unchanged; `COMPLETE_VALIDATION` still flows only through user gesture.

Updated `GameScreen.test.tsx`: the "summary after sweep" test now verifies no auto-advance after 2000ms and that clicking the button shows the summary; the reduced-motion test updated identically; the controls-suppression test updated to also assert the "Tap to continue" button IS present. 165 tests passing; build clean. PR opened against main.

### 2026-05-24 — [TER-169](https://linear.app/terenc/issue/TER-169) closed by Opus; this docs PR also locks [TER-167](https://linear.app/terenc/issue/TER-167) timer (GDD v1.7)

Chris reported [TER-169](https://linear.app/terenc/issue/TER-169)'s PR merged (PR #31). Opus reviewed the diff (auto-advance `setTimeout` / `useEffect` removed, including the 400ms reduced-motion branch; full-width "Tap to continue" button with `aria-label="Continue to summary"` dispatching `completeValidation()`; reducer unchanged; sweep + reduced-motion overlay-skip preserved; tests rewritten to assert no auto-advance + tap-to-advance in both motion settings) with CI green and 165 tests passing, and marked the issue Done. Code correctly updated the GameScreen architecture note to describe tap-to-advance, so no arch-note fold-in was needed this time.

Non-blocking feel note carried forward: the "Tap to continue" button renders during the 850ms sweep (skippable). Chris to decide on device whether to gate it until sweep-end — a one-line follow-up if so.

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-169](https://linear.app/terenc/issue/TER-169) → ✅ Done (Unscheduled). [TER-167](https://linear.app/terenc/issue/TER-167) M3 line updated — spec written and GDD-locked (v1.7); now the next M3 Code candidate.
* **TER-167 timer lock (bundled, GDD v1.7):** the GDD Timer section + Constraints bullet were redefined from the v1.0 "runs continuously, cannot be paused" wall-clock to an active-play accumulator (banks/pauses when the attempt is set aside, resumes on return, never resets on Restart, discards a stale attempt at UTC rollover, restores the in-progress board). Context-doc Game-mechanics gains a matching locked timer bullet; source-of-truth GDD reference bumped to v1.7. This makes [TER-167](https://linear.app/terenc/issue/TER-167) source-of-truth-consistent before it goes to Code.
* **Game mechanics:** validation bullet updated — tap-to-advance now shipped in [TER-169](https://linear.app/terenc/issue/TER-169) (was "is TER-169").
* **Architecture notes / session log:** the GameScreen tap-to-advance arch-note update and the TER-169 Code session-log entry were added by Code in PR #31 and are retained.

**Next recommended:** [TER-167](https://linear.app/terenc/issue/TER-167) (persistent attempt timer) — spec written, GDD-locked, now source-of-truth-consistent. Once this docs PR merges it's the next Code candidate; promotion Backlog→Todo is Chris's gate. Then [TER-143](https://linear.app/terenc/issue/TER-143) (stats) and [TER-144](https://linear.app/terenc/issue/TER-144) (share) remain for M3, each needing a design pass.

### 2026-05-24 — [TER-167](https://linear.app/terenc/issue/TER-167) Persistent daily-attempt timer (Claude Code / Sonnet 4.6)

Replaced the single-`timerStartedAt` wall-clock in `useGame` with an accumulator model (`accumulatedMs` + `runStartedAt`). Key changes:

**`src/hooks/useGame.ts`:** Internal state gains `accumulatedMs: number` and `runStartedAt: number | null`. New actions: `BANK_TIME` (banks `clampDelta(now, runStartedAt)` into `accumulatedMs`, sets `runStartedAt = null`), `RESUME_TIMER` (sets `runStartedAt = now` if not already running and phase ≠ validating/complete). `TICK` updates `elapsedMs = accumulatedMs + clampDelta(now, runStartedAt)` whenever `runStartedAt !== null`. `PLACE_AT` completion freezes `elapsedMs = accumulatedMs + clampDelta(now, runStartedAt)` atomically and clears `runStartedAt`. `RESET` accepts `keepClock: boolean` — daily mode keeps accumulator + running clock, practice resets to zero. `REVEAL_PATTERN` in idle uses `runStartedAt ?? action.now` so a post-reset running clock isn't restarted. `useGame` signature gains `options?: { resume?: InProgressBlob; keepClockOnReset?: boolean }` — when `resume` is provided, state is initialized from the blob and a one-shot `useEffect` dispatches `RESUME_TIMER`. `bankTime()` and `resumeTimer()` added to `GameActions`. Pathological deltas clamped: negative → 0, max 7,200,000 ms per run.

**`src/persistence/inProgress.ts`** (new): `rygo:inprogress` localStorage key, version 1. `InProgressBlob` shape: version, date, gridSize, board, phase, activeColor, moveCount, patternVisible, accumulatedMs, savedAt. `loadInProgress()` validates date === todayKey() and version ≤ 1 (null on any failure). `saveInProgress()` and `deleteInProgress()` silent on errors.

**`src/components/GameScreen.tsx`:** New props `dayKey?` and `resume?`. Passes resume blob + `keepClockOnReset: true` to `useGame` in daily mode. `visibilitychange` + `pagehide` listeners (daily only): call `game.bankTime()` + `saveInProgress(buildBlob())` on hide, `game.resumeTimer()` on show. `handleRestart` manually builds a cleared-board blob before `game.reset()` and saves it (daily only). `handleQuit` banks + saves before navigating. `deleteInProgress()` called in the completion `useEffect`.

**`src/App.tsx`:** On level select (daily mode only), calls `loadInProgress()` and validates gridSize matches. Passes `resume` blob and `dayKey` to `GameScreen`. Stale blobs (wrong date) are discarded by `loadInProgress` itself.

**Tests:** `useGame.test.ts` — 7 new tests: `reset without keepClock zeros timer`, `reset with keepClock preserves timer`, `bankTime/resumeTimer`, `resume from blob`, `negative delta clamped`. `GameScreen.test.tsx` — split restart test into daily (timer kept) + practice (timer zeros). `inProgress.test.ts` — 13 new tests covering round-trip, stale date, future version, corrupt JSON, missing fields, localStorage errors. 183 tests passing; build clean. PR opened against main.

**Fix pass (Opus review):** `handleHide` in the visibilitychange/pagehide listener now guards on phase — `saveInProgress` is only called when phase is `{idle, pattern-revealed, playing}`; skipped for `validating` and `complete`. This prevents writing a solved-board blob that would strand a resumed session with no "continue" button, and prevents re-creating the blob after completion already deleted it. Added `localStorage.clear()` to `beforeEach` in `GameScreen.test.tsx` for proper inter-test isolation (shared in-memory store was leaking state across tests). Two new GameScreen tests: (1) backgrounding in validating phase writes no blob; (2) backgrounding in complete phase leaves `rygo:inprogress` absent. 185 tests passing; build clean.

### 2026-05-24 — [TER-167](https://linear.app/terenc/issue/TER-167) closed by Opus; M3 daily-ritual foundation now complete (142 + 167)

Chris reported [TER-167](https://linear.app/terenc/issue/TER-167)'s PR merged (PR #33). Opus reviewed the diff across two passes — first pass flagged one edge bug (the visibilitychange/pagehide save fired in any phase and `buildBlob` coerced `validating`/`complete` → `'playing'`, so backgrounding after solving but before tapping "continue" — an open-ended window since TER-169 removed auto-advance — persisted a solved board and stranded the resumed session with no way to submit, losing that day's completion); second pass confirmed the fix (phase-guarded `handleHide`, two new guard tests, `localStorage.clear()` isolation) with CI green and 185 tests passing — and marked the issue Done. **The M3 daily-ritual foundation is now in place: TER-142 (results schema + daily lock) + TER-167 (persistent attempt timer + in-progress resume).**

Two non-blocking notes carried forward as conscious accepts (not filed): a single `rygo:inprogress` blob means only one level's in-progress attempt survives at a time — switching levels mid-attempt drops the other (matches the spec's single-blob data model; per-level keying would be a follow-up if real use wants it); and a sub-100ms `accumulatedMs` save-staleness on pause (`buildBlob` reads `elapsedMs` before the bank re-renders; bounded, self-corrects on the next save).

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-167](https://linear.app/terenc/issue/TER-167) → ✅ Done (M3).
* **Architecture notes / session log:** the `useGame` accumulator-timer rewrite (UPDATED note) and the new `In-progress persistence` (`inProgress.ts`) note were added by Code in PR #33 and are retained; the `inProgress.ts` note here gains a line on the phase-guarded pause-save from the fix pass. The TER-167 Code session-log entry (incl. the fix-pass paragraph) was added by Code and is retained.
* **No GDD / Game-mechanics change needed:** the active-play accumulator timer was already locked (GDD v1.7) and the matching Game-mechanics bullet added in the TER-169 close-out docs PR (PR #32), so the source of truth was already consistent before this issue shipped.

**Next recommended:** [TER-143](https://linear.app/terenc/issue/TER-143) (stats screen) is now In Review. [TER-144](https://linear.app/terenc/issue/TER-144) (share button) is the last remaining M3 issue after TER-143 merges.

### 2026-05-24 — [TER-143](https://linear.app/terenc/issue/TER-143) Stats screen (Claude Code / Sonnet 4.6)

Created `src/persistence/stats.ts` with three pure helpers: `previousDayKey` (UTC day stepping using `Date.UTC` for correct month/year/leap-year boundaries), `computeGlobalStreak` (unions completed day-keys across all four sizes, applies grace rule for today-not-done, computes best via sorted-run scan), and `computeLevelSummary` (scans one size's day-map, returns `null` — never `NaN` — when `played === 0`). Created `src/hooks/useStats.ts` as a thin wrapper returning `StatsView` with exactly four `LevelStats` in `[4, 5, 6, 8]` order. Created `src/components/StatCard.tsx` (three render states: empty, today played, not played today) and `src/components/StatsScreen.tsx` (Back button + streak banner + four level cards). Extended App view-state to `'difficulty' | 'game' | 'stats'`; wired `onShowStats` callback. Moved the DifficultyPicker stats button from top-right to top-left (issue spec, avoids ThemeToggle collision). 222 tests passing (was 185); build clean. PR opened against main.

**Next recommended:** [TER-143](https://linear.app/terenc/issue/TER-143) (stats screen — per-level streaks, history, score distribution) and [TER-144](https://linear.app/terenc/issue/TER-144) (share button — Web Share API + clipboard, emoji-board) are the two remaining M3 issues. Each needs a design pass before Code. TER-143 reads the `rygo:state` history that's now fully in place; TER-144's design pass must revisit the grind-guard question forward-flagged from the TER-167 integrity model (shared scores become a bragging surface). Promotion Backlog→Todo stays Chris's gate.

### 2026-05-24 — [TER-143](https://linear.app/terenc/issue/TER-143) closed by Opus; M3 retention features complete (142 + 143 + 167)

Chris reported [TER-143](https://linear.app/terenc/issue/TER-143)'s PR merged (PR #35). Opus reviewed the diff (the pure `stats.ts` helpers — `previousDayKey` UTC day-stepping, `computeGlobalStreak` with grace rule + longest-run best, `computeLevelSummary` returning null-not-NaN at zero plays; `useStats` returning four levels in `[4, 5, 6, 8]` order; StatsScreen + StatCard with brand tokens and the self-consistent delta cue; stats button relocated to the DifficultyPicker top-left away from the fixed ThemeToggle; App view-state extended to `'difficulty' | 'game' | 'stats'`) with CI green and 222 tests passing (+37), and marked the issue Done — a clean, two-pass-free approval.

Two manual-verify items carried forward (non-blocking): the no-scroll acceptance criterion can't be asserted by RTL (jsdom doesn't measure layout), so the header + four cards fitting an iPhone SE without scroll is a Chris on-device check in both themes (Extreme's card has the longest copy); and an optional cosmetic — the streak banner appends `· best M` even when `best === current`, hideable if it reads redundant on device.

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-143](https://linear.app/terenc/issue/TER-143) → ✅ Done.
* **Retention scope (Key design decisions):** dropped "with score distribution" from the four-retention-features line and added a note that the per-level score-distribution histogram was descoped from TER-143 on May 24, 2026 — the per-level cards ship a today-vs-personal-best comparison instead (four histograms broke the no-scroll requirement); the histogram is deferred to a post-launch stats-v2 pass. The GDD does not mention score distribution, so no GDD change was needed.
* **Architecture notes / session log:** the Stats module note (`stats.ts` / `useStats.ts` / StatsScreen / StatCard) and the TER-143 Code session-log entry were added by Code in PR #35 and are retained as-is.

**Next recommended:** [TER-144](https://linear.app/terenc/issue/TER-144) (share button) — the last remaining M3 issue. It is now unblocked: its `computeGlobalStreak` dependency is on main as of PR #35. The spec is written and spoiler-free (score-only, never the solved board), and its blocked-by [TER-143](https://linear.app/terenc/issue/TER-143) relation is satisfied. Promotion Backlog→Todo is Chris's gate.

### 2026-05-24 — [TER-144](https://linear.app/terenc/issue/TER-144) Share button on Summary (Claude Code / Sonnet 4.6)

Created `src/share/shareString.ts` — pure function `buildShareString` with signature from the issue spec. No board parameter; output is a spoiler-free 3-or-4-line text string: header (`RYGO · {date} · {Label} ({N}×{N})`; practice appends ` · Practice`), stats line (`{moves} moves · {M:SS}`, minutes uncapped, seconds zero-padded), optional streak line (`🔥 {n}-day streak`, daily + streak > 0 only), footer (`playRYGO.com`).

Updated `src/components/Summary.tsx`: added `date`, `mode`, `streak` props; derives `label` from `gridSize` via a `LEVEL_LABEL` map; adds a full-width Share button (blue-600, inline share SVG glyph, `data-testid="share-button"`) placed above the "Play again" / "Change difficulty" row in the former reserved slot. `handleShare` is an async click handler that invokes Web Share → clipboard → textarea fallback in order. Clipboard success shows `Copied!` for 2 s then reverts; Web Share cancel is silent; last-resort `<textarea readOnly>` rendered below the button when no API is available.

Updated `src/components/GameScreen.tsx`: imported `loadState` + `computeGlobalStreak`; in the `phase === 'complete'` branch, computes `streak = computeGlobalStreak(loadState(), todayKey()).current` for daily mode (`null` for practice) and passes `date={effectiveDayKey}`, `mode`, `streak` through to `Summary`.

Updated `src/App.tsx` footer: `Last shipped: TER-144 — Share button`.

Tests: `src/share/shareString.test.ts` — snapshot for 4×4 daily (with streak) and 8×8 practice (tagged, no streak); time-format cases (0:00, 0:09, 1:05, 10:00); streak-line omission for practice, streak 0, streak null; header/footer/no-board-emoji assertions. `src/components/Summary.test.tsx` — RTL tests: Share button visible; with `navigator.share` undefined and mocked clipboard, click calls `clipboard.writeText` with the expected share text; `Copied!` shows immediately; reverts to `Share` after 2 s (fake timers). 240 tests passing (was 222); build clean. PR opened against main.

### 2026-05-24 — [TER-144](https://linear.app/terenc/issue/TER-144) closed by Opus; M3 — Daily ritual complete

Chris reported [TER-144](https://linear.app/terenc/issue/TER-144)'s PR merged (PR #37). Opus reviewed the diff (the pure `buildShareString` in `src/share/shareString.ts` — no board parameter, spoiler-free header / stats / optional-streak / footer output, with an explicit test asserting no cell emoji; the Summary Share button with the Web Share → clipboard `Copied!` → `<textarea readOnly>` fallback chain; GameScreen computing the streak in the `complete` branch) with CI green and 240 tests passing (+18), and marked the issue Done. **M3 — Daily ritual (pre-launch) is now complete: TER-142 + TER-143 + TER-144 + TER-167 all shipped.**

One review finding recorded (no fix required): Code's session note stated the daily result is written to localStorage "before the Summary branch renders." That is backwards — `recordDailyResult` runs in a `useEffect` (after the `complete` render). The streak is nonetheless correct because `App.handleDailyComplete` calls `setDailyState(loadState())`, forcing a re-render in which `GameScreen` recomputes `computeGlobalStreak(loadState(), …)` from fresh state. Consequence carried forward for Chris's on-device check: the correct streak lands on the second render, so the first painted frame can briefly show the pre-increment value (e.g. 6→7 tick, or the streak line popping in a frame late on a first-ever completion). If it reads as a flicker, the one-line fix is to compute the streak in `App` (which already holds fresh `dailyState`) and pass it as a prop. Also non-blocking: the "streak reflects the just-recorded result" path rests on that `setDailyState` re-render and is not covered by an integration test.

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-144](https://linear.app/terenc/issue/TER-144) → ✅ Done; **M3 header marked ✅ complete.**
* **Retention scope (Key design decisions):** corrected the four-retention-features line — "emoji-board share button" → "spoiler-free share button (score + streak, never the board)" — to match what shipped (the emoji-board format was removed in the TER-144 design pass as a daily-solution spoiler).
* **Architecture notes / session log:** the Summary arch-note update (Share button, new props, fallback chain) and the TER-144 Code session-log entry were added by Code in PR #37 and are retained as-is.

**Next recommended:** pre-launch work — every build milestone is now done (M1 / M2 / M3 complete; M4 is post-launch polish). Two open threads: (1) **launch-prep housekeeping** — Vercel project rename + playRYGO.com custom-domain wiring (Chris-side, per [TER-151](https://linear.app/terenc/issue/TER-151)), removing the dev "Last shipped" footer, and locking `engines: { node: ">=20" }` in `package.json`; (2) the **Supabase anonymous daily-leaderboard** design pass — decisions already locked with Chris: server-side replay validation for score integrity (the pure engine runs unchanged in a Supabase Edge Function), per-difficulty boards, and an anonymous-auth foundation so future accounts / multi-device sync are an additive upgrade. The leaderboard is a new feature area (adds the project's first backend — a locked-decision change from "no backend / no network") and gets a full design doc before any issue is drafted.

### 2026-05-24 — [TER-192](https://linear.app/terenc/issue/TER-192) How-to-play rules screen (Claude Code / Sonnet 4.6)

Created `src/components/RulesScreen.tsx` — a static "How to play" reference screen sourced entirely from GDD v1.7. No rules invented or reworded beyond faithful paraphrase.

**App:** extended `AppView` to `'difficulty' | 'game' | 'stats' | 'rules'`. Wired `view === 'rules'` → `<RulesScreen onBack={() => setView('difficulty')} />`. DifficultyPicker receives new `onShowRules={() => setView('rules')}` prop.

**DifficultyPicker:** added `onShowRules?: () => void` prop and a centered secondary-styled text button (`aria-label="How to play"`) rendered below the four LevelButtons. Does not collide with the top-left Stats button or the fixed top-right ThemeToggle.

**RulesScreen:** six content sections (`rules-goal`, `rules-colors`, `rules-blocking`, `rules-overwrite`, `rules-clearing`, `rules-scoring` — all `data-testid`'d). Header mirrors StatsScreen (Back button + centered h1, `aria-label="Back to difficulty picker"`). Scrollable — content-heavy reference screen. Themed with brand tokens throughout.

Diagrams rendered visually:
- **Green blocking example** (`data-testid="blocking-diagram"`, `"blocking-diagram-before"`, `"blocking-diagram-after"`): two 4×4 `MiniGrid` boards side-by-side — before (red only at row 2, col 2) and after (green placed at row 2, col 1 showing column fill and eastern block).
- **Overwrite hierarchy** (`data-testid="overwrite-table"`): accessible HTML `<table>` with `scope` headers; ✅ / ❌ cells each carry an `aria-label` ("fills or overwrites" / "no effect").

`MiniCell` uses `role="img"` with `aria-label="Color cell at row N, column N"` matching the live Grid's format. Colors and shape fills use the same tokens as `Grid.tsx`. No business logic in the component.

**Tests** (`src/components/RulesScreen.test.tsx`): 7 tests — `RulesScreen` suite: all six sections render; blocking diagram (before + after boards) renders; diagram cells carry `role="img"` aria-labels; overwrite table renders; `onBack` fires. `Rules routing` suite: "How to play" button navigates picker → rules; Back returns rules → difficulty. 247 tests passing (was 240); build clean. PR opened against main.

### 2026-05-24 — [TER-192](https://linear.app/terenc/issue/TER-192) closed by Opus

Chris reported [TER-192](https://linear.app/terenc/issue/TER-192)'s PR merged (PR #39). Opus reviewed the diff (the new `RulesScreen.tsx` with six GDD-sourced sections; `MiniGrid`/`MiniCell` visual diagrams for green blocking + the overwrite `<table>`; the `'rules'` AppView route and the picker-only "How to play" entry; `role="img"` cells matching the live-grid aria-label format) with CI green and 247 tests passing, and marked the issue Done. Rule accuracy was verified against GDD v1.7 — the green-blocking worked example, the overwrite table, the scoring list, and the clearing description all match the locked mechanics.

Three non-blocking on-device items carried forward for Chris: discoverability of the quiet `text-gray-500` "How to play" entry below the level buttons; light/dark rendering of the `MiniGrid` cells and overwrite-table borders (the warm-Paper wash-out flagged on TER-168 touches sibling gray surfaces); and whether the before→after blocking diagram reads to a first-timer.

Locked-section updates absorbed in this docs-only PR:

* **Issue map:** [TER-192](https://linear.app/terenc/issue/TER-192) → ✅ Done (Unscheduled subsection).
* **Open questions:** the Tutorial / first-run entry now notes that a *static* "How to play" reference screen shipped in TER-192 (picker-only, on-demand), distinct from the interactive first-run tutorial that remains M4 — so a future reader doesn't read "tutorial deferred" and miss that a rules reference already exists.
* **Architecture notes / session log:** the How-to-play arch note and the TER-192 Code session-log entry were added by Code in PR #39 and are retained as-is.
* **No GDD change:** content was sourced from the already-locked GDD v1.7; nothing in the source of truth changed.

**Next recommended:** pre-launch threads are unchanged — (1) launch-prep housekeeping (Vercel rename + playRYGO.com wiring, dev-footer removal, `engines: { node: ">=20" }` lock); (2) the Supabase anonymous daily-leaderboard, whose design doc is drafted and awaiting Chris's approval before the GDD "no backend" flip and issue decomposition. Both remain the open pre-launch work now that M1–M3 and the unscheduled polish items are done.

### 2026-05-25 — Opus docs-only PR: M5 leaderboard backend-flip (no Code session)

Chris approved the Anonymous Daily Leaderboard design doc (`docs/RYGO_Leaderboard-Design.md`, committed in this PR). This is RYGO's first backend and a flip of the locked "no backend / no network" stance, so per the design doc §10 the source-of-truth flip lands **before** any M5 issue is drafted — otherwise Code would read the contradiction at session start and stop-and-ask.

Locked-section updates in this docs-only PR:

* **Tech stack — Backend:** flipped from "None for MVP" to Supabase (paid, best-effort, M5 leaderboard); gameplay never depends on the network, generation stays client-side.
* **Tech stack — Persistence:** added the write-only `scores` table note (edge-function-written under service role; clients never write directly; holds no gameplay/retention state).
* **Retention scope:** flipped the "No accounts, no backend, no cloud sync" line to "optional, best-effort Supabase backend (anon auth + server-verified scores), never gates play, no PII"; named accounts / multi-device sync remain out of scope as an additive upgrade.
* **Source-of-truth documents:** GDD reference bumped v1.7 → v1.8; added the leaderboard design doc as a source-of-truth entry.
* **Issue map:** added the **M5 — Anonymous daily leaderboard** milestone stub (6 hard-ordered work items; gated behind launch-prep housekeeping). TER-NNN numbers slot in as issues are filed.
* **GDD (separate file in this PR):** bumped to v1.8 — flipped the matching retention line, added a **Leaderboard (M5)** section capturing design-doc §2–§5, changelog entry.

"Unique players" (Chris's earlier ask) is covered by M5 issue 1 — the anonymous-auth foundation gives a persistent per-device id, so a distinct-`user_id` count is a query on `scores`/auth, not a separate feature. Noted in the issue-map stub.

**Next:** once this PR is on `main`, Opus files M5 issues 1–6 in order (each with the v2.4 inline close-out checklist). Promotion Backlog→Todo and launch-prep sequencing stay Chris's gates. No Code session should launch until this PR is merged (concurrency note: land Opus docs PRs before the next Code launch).

### 2026-05-25 — [TER-201](https://linear.app/terenc/issue/TER-201) launch-prep cleanup (Claude Code / Sonnet 4.6)

Removed the dev "Last shipped" `<footer>` from `src/App.tsx` (lines 101–112) and added `"engines": { "node": ">=20" }` to `package.json`. No other changes.

**Tests:** 247 passing (unchanged — no footer tests existed; the `shareString.test.ts` "footer is playRYGO.com" test is unrelated, testing the share-string URL line, not the removed `<footer>` element). Build clean.

**Docs changes (allowlisted sections only):**
* **Tech stack:** Node line updated — `engines` field now locked.
* **Open questions:** removed the "Lock Node version in `package.json` engines" bullet (resolved).
* **Architecture notes:** removed the App footer section (the footer no longer exists).
* **Issue map:** M5 gate note updated — footer removal and `engines` lock done; Vercel/domain wiring (Chris-side) is the remaining gate. TER-201 added as ✅ In Review (Unscheduled).

**⚠️ Flag for Opus (locked Coding conventions — do NOT edit):** The Coding conventions section contains the bullet "Update the App footer (`src/App.tsx`) at the end of every Code session: `Last shipped: TER-NNN — Short description`." This bullet is now obsolete (the footer no longer exists). Opus should remove it in the close-out docs PR.

### 2026-05-25 — [TER-199](https://linear.app/terenc/issue/TER-199) M5-1: Leaderboard backend foundation (Claude Code / Sonnet 4.6)

Stood up the Supabase backend foundation for the M5 anonymous daily leaderboard.

* **`src/backend/supabaseClient.ts`** — Supabase client initialized from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Exports `null` (and `userIdPromise` resolves to `null`) if either env var is absent — no throw, no network call. On first load (when live), bootstraps the anonymous session via `getSession()` (reuse) then `signInAnonymously()` (create); all failures are swallowed.
* **`supabase/migrations/20260525000000_scores_schema.sql`** — `scores` table with columns and unique constraint exactly as specified in the design doc §4. RLS enabled; no client INSERT/UPDATE policy. `get_standing(day, grid_size, moves, elapsed_ms) → { rank, total }` RPC as a `security definer` function with `set search_path = ''`.
* **`@supabase/supabase-js`** added as the project's first runtime dependency (design §12).

**Tests:** 254 passing (247 prior + 7 new `supabaseClient` tests covering: null client when env absent, no throw, live client when both vars set, null client when only URL set, existing-session user id, new anon sign-in user id, error swallowed). Build clean. With env vars unset the game plays end-to-end with zero backend calls.

**Docs changes (allowlisted sections only):**
* **Issue map M5:** item 1 updated with TER-199 link and ✅ In Review status.
* **Architecture notes:** added Supabase backend section (`supabaseClient.ts`, migration, RPC).
* **Session log:** this entry.

### 2026-05-25 — TER-199 closed by Opus; M5 backend foundation shipped

Chris reported TER-199's PR merged (PR #44) and the Chris-side prerequisites done (Supabase project created, anonymous sign-ins enabled, `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` set, migration applied). Opus reviewed the diff — `supabaseClient.ts` exporting `null` when either env var is absent (no throw, no network call); the best-effort `getSession()` → `signInAnonymously()` anon bootstrap with all errors swallowed; the `scores` migration matching design §4 exactly (unique on `(user_id, day, grid_size)`, RLS enabled with no client INSERT/UPDATE policy); the `get_standing` RPC as `security definer` with `set search_path = ''`, sorting moves ASC then elapsed_ms ASC — with CI `build-and-test` green and 254 tests passing (+7), and marked the issue Done. **M5 issue 1 of 6 shipped — the leaderboard backend foundation is in place.**

Non-blocking decision item carried forward (not filed): `supabaseClient.ts` is not yet imported anywhere, so the anon-auth bootstrap fires lazily on the first M5 caller's import rather than literally on app launch. That is fine for the foundation (there is no caller yet); the call site is settled when M5 issue 5 (client submit) / 6 (client read) land. If app-launch bootstrap is wanted earlier, a one-line side-effect import in `src/main.tsx` does it. Revisit at issue 5/6 draft time.

Locked-section updates absorbed in this docs-only PR:

* **Issue map M5:** item 1 [TER-199](https://linear.app/terenc/issue/TER-199) → ✅ Done.
* **Project identity:** Production URL flipped from "(target) … previous Vercel URL" to **live** — the Vercel rename + playRYGO.com custom-domain wiring completed May 25, 2026 (Chris-side, [TER-151](https://linear.app/terenc/issue/TER-151)).
* **M5 milestone gate note:** rewritten — launch-prep housekeeping is now complete (dev-footer removal + `engines` lock in [TER-201](https://linear.app/terenc/issue/TER-201), plus the Vercel/domain wiring), so the milestone is no longer gated.
* **Architecture notes / session log:** the Supabase backend arch note and the TER-199 Code session-log entry were added by Code in PR #44 and are retained as-is.

**Next recommended:** M5 issue 2 — shared-engine delivery (sync `src/engine/` + generator into `supabase/functions/_shared/` with a CI hash-guard; drift = CI failure). Next in the hard-ordered M5 chain and now unblocked. Opus to file it next; it needs a design/spec pass before Code. Promotion Backlog→Todo stays Chris's gate.
