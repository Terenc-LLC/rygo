# RYGO — Game Design Document

> **Brand:** RYGO (locked May 2, 2026 — was codename "Yergers")
> **Tagline:** Minimalist daily logic-constraints puzzle at [playRYGO.com](<http://playRYGO.com>)
> **Status:** v1.8 — MVP scope + first backend (May 25, 2026: anonymous daily leaderboard; the "no backend / no network" stance is flipped to an optional, best-effort backend that never gates play)
> **Last updated:** May 25, 2026

## Concept

A daily logic puzzle where the player recreates a target color pattern on a grid using three colors with different placement behaviors. Performance is measured by efficiency (moves) with time as tiebreaker. The player must memorize the pattern — they can never view the pattern and the playable board simultaneously.

## Brand identity (locked May 2, 2026)

The codename "Yergers" was a placeholder during development. Final brand: **RYGO**.

## Components

### Grid

A square grid of configurable size. Player chooses difficulty at start:

* **Easy:** 4×4 (16 cells)
* **Normal:** 5×5 (25 cells)
* **Hard:** 6×6 (36 cells)
* **Extreme:** 8×8 (64 cells)

The 4 / 5 / 6 ramp gives a smooth working-memory progression. 8×8 is the heroic tier — past the typical working-memory limit, intended for players who want a serious test rather than a daily ritual.

### Colors and shapes

Three colors, each paired with a distinct shape so the game is fully playable for color-blind users. **Color and shape together identify a cell's state. Shape is not optional.** Game-content colors (red, yellow, green) and their shape fills are **identical in light and dark mode**. Game-content colors **match the RYGO brand palette** (locked v1.5).

| State    | Color (background)                    | Shape (centered, \~50% of cell)   | Shape fill      |
| -------- | ------------------------------------- | --------------------------------- | --------------- |
| 🔴 Red    | `#D8463A` (RYGO Red)                  | Square                            | Paper `#F5F3EE` |
| 🟡 Yellow | `#E6B73B` (RYGO Yellow)               | Triangle, apex up (yield/caution) | Ink `#14110E`   |
| 🟢 Green  | `#2E9D5C` (RYGO Green)                | Circle (go light)                 | Paper `#F5F3EE` |
| Empty    | Theme-dependent — see Theming section | None                              | —               |

**Rationale for shape choice:** red-green color blindness (deuteranopia / protanopia) affects \~5–8% of men. Without shape differentiation, those players cannot tell red and green cells apart at all, making the game unplayable. The traffic-light metaphor that motivated the color choice is preserved and reinforced by the shapes — every cell now reads as a tiny road sign. Square was chosen for red (over the original octagon) because it is maximally distinct from circle at small sizes — pure 90° corners, no curves.

**Rationale for using brand palette as game palette:** the RYGO brand was designed *with these colors as the colors*. The previous Tailwind starting values (`red-600` / `amber-400` / `green-600`) were placeholders explicitly noted as "tune for harmony." The brand palette is the tuning. Adopting it preserves visual consistency across logo, marketing, and gameplay. WCAG AA contrast is preserved: Paper `#F5F3EE` on RYGO Red `#D8463A` ≈ 4.6:1; Ink `#14110E` on RYGO Yellow `#E6B73B` ≈ 11.3:1; Paper on RYGO Green ≈ 4.4:1 — all clear the 3:1 minimum for graphical objects.

### Cells

Each cell holds one of four states: `empty`, `red`, `yellow`, or `green`. Empty cells render as a theme-dependent neutral with no shape. Colored cells render as the colored background with the corresponding shape centered.

In a generated target pattern, **every cell is colored** — no cell is empty in the target. Empty cells appear only on the playable board during play, and only transiently (you can clear cells to recover from misplays).

### Pattern display

A view of the target pattern, shown only when the player explicitly reveals it. Hidden by default during gameplay. The playable board and the pattern display are **never visible at the same time**.

When transitioning between the pattern view and the playable board (in either direction), a 1-second blank "Get ready..." screen is shown to prevent rapid-fire bouncing between views as a memorization shortcut. The timer continues to run during the blank screen; the blank is not a free pause.

### Move counter

Increments on **every meaningful click**. See the Scoring section for the full rules.

### Timer

Starts on the first pattern reveal. Measures **active play time**, not wall-clock: it runs while the puzzle is open (including through the 1-second pattern↔board transition blanks), **banks and pauses** when the attempt is set aside — backgrounding the app, closing or refreshing the tab, or quitting to the difficulty picker — and resumes from the banked total on return. It does **not** reset on Restart: Restart clears the board and the move count, but the clock keeps its banked time and keeps running (so restart-grinding costs time). The in-progress attempt — board and clock — is restored on return until the puzzle is completed or the UTC day rolls over; a rollover while the attempt is paused discards the stale attempt and serves a fresh puzzle. (Accumulator timer + pause/resume + resume-in-progress board are specced in [TER-167](https://linear.app/terenc/issue/TER-167).)

## Rules

### Color reach

When a color is placed at a target cell, it attempts to fill cells according to its reach pattern. All reach patterns are **orthogonal only** (no diagonals).

* **Red at X** → attempts to fill only X. (1 cell)
* **Yellow at X** → attempts to fill X plus the four orthogonally adjacent cells (up, down, left, right), clipped to grid bounds. (3–5 cells depending on position)
* **Green at X** → attempts to fill X, then propagates outward in each of the four cardinal directions (up, down, left, right). Propagation in a given direction stops at the first non-empty cell or the edge of the grid. **Non-empty cells block green's reach** — they are not overwritten and they prevent green from reaching cells beyond them.

### Blocking (green only)

Red has 1-cell reach, so blocking is moot. Yellow has 1-cell-radius reach (the plus shape), so its only "beyond" cells don't exist. **Only green is affected by blocking.**

Example on a 4×4 grid:

```
.  .  .  .
.  R  .  .       (R = red at row 1, col 1)
.  .  .  .
.  .  .  .
```

Placing green at row 0, col 0 (top-left, no blockers in row or col):

```
G  G  G  G       row 0: green propagates from col 0 — full row fills
G  R  .  .       col 0: green propagates down — full column fills
G  .  .  .
G  .  .  .
```

Placing green at row 1, col 0:

```
.  .  .  .
G  R  .  .       row 1: green propagates right, hits R at col 1, stops; col 2 and 3 stay empty
G  .  .  .       col 0: green propagates up + down — full column
G  .  .  .
G  .  .  .
```

The R at (1, 1) blocks green's eastward propagation in row 1. Cells (1, 2) and (1, 3) remain empty.

This makes intervening colors a meaningful design tool — placing green first then layering red on top is fundamentally different from placing red first then attempting green.

### Overwrite hierarchy

When a color attempts to fill a cell, the existing state of that cell determines whether the fill takes effect:

| Placing ↓ \\ Existing → | Empty   | Green                                         | Yellow                                        | Red                                           |
| ----------------------- | ------- | --------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| **Red**                 | ✅ fills | ✅ overwrites                                  | ✅ overwrites                                  | ✅ overwrites                                  |
| **Yellow**              | ✅ fills | ✅ overwrites                                  | ❌ no change                                   | ❌ no change                                   |
| **Green**               | ✅ fills | ❌ no change (also blocks further propagation) | ❌ no change (also blocks further propagation) | ❌ no change (also blocks further propagation) |

In short:

* **Red** dominates everything.
* **Yellow** beats green only.
* **Green** is passive — only fills empty cells, and is blocked by anything non-empty.

### Clearing (same-color tap)

When the active color matches the color of the tapped cell, the tap **clears** rather than places. Clearing follows the same reach pattern and the same blocking rules as placement, with these specifics:

* **Red active, tap a red cell:** that single cell is cleared to empty. (1 cell)
* **Yellow active, tap a yellow cell:** that cell plus any of the four orthogonal neighbors that are also yellow are cleared to empty. Mixed-color neighbors are not affected.
* **Green active, tap a green cell:** that cell plus all green cells reachable via green's propagation rule (cardinal directions, blocked by any non-green cell) are cleared to empty.

### Pattern generation

* Patterns are generated by a date-seeded RNG so all players see the same daily puzzle.
* Every generated pattern must be **provably solvable** under these rules — there must exist at least one sequence of color placements that produces the target.
* Solvability is verified by construction: the generator produces a solution sequence first, then derives the target pattern by simulating that sequence on an empty board.
* **Full coverage required:** every cell in the target is colored (no empty cells in any generated target). The generator extends the solution sequence as needed until full coverage is reached.
* **All three colors required:** every generated target uses red, yellow, AND green. A target with only two colors is rejected and regenerated.
* **Trivial-puzzle rejection** (pre-existing): rejects all-one-color and >85%-single-color targets, and rejects targets where the first move alone produces the target.
* Generated patterns target a solution length appropriate to grid size. Concrete ranges to be retuned when the new generator (full coverage + all three colors) is implemented; expect longer solutions than v1.3 because covering every cell typically requires more moves than the previous "fill some cells" approach.

## Gameplay

### Setup

1. Player loads the game and selects grid size (Easy / Normal / Hard / Extreme).
2. The board appears empty, with a **Reveal Pattern** button visible.

### First reveal (free move)

3. Player taps **Reveal Pattern**. After a 1-second "Get ready..." blank, the target pattern displays.
4. **The timer starts** on this first reveal.
5. **The first reveal does not count as a move.** The move counter starts at zero.

### Solving loop

 6. Player taps **Hide / Start Solving**. After a 1-second "Get ready..." blank, the empty playable board appears.
 7. Player taps a color in the color picker to make it active.
 8. Player taps cells. Each tap places the active color at that cell (or clears, if the cell already holds the active color). Placement follows the reach, blocking, and overwrite rules. Clearing follows the reach and blocking rules and only clears matching-color cells.
 9. Player can switch active color at any time by tapping a different color in the picker.
10. While a color is active, tapping multiple cells in sequence places (or clears) at each cell — no need to re-select between taps.

### Re-reveal (penalized)

11. Player can re-reveal the pattern at any time by tapping **Reveal Pattern**. The 1-second blank applies, then the pattern is shown. The playable board is hidden during this time. **Each re-reveal costs one move** (the first reveal is the only free one; every subsequent reveal counts).

### Completion

12. The system continuously checks whether the playable board matches the target pattern.
13. **Auto-detection:** as soon as the boards match exactly, the timer stops and the player enters a brief **validation sequence** (see below).
14. The end-of-game summary shows: score (moves), time, and grid size.

### Validation sequence (locked v1.5; advance updated v1.6)

When the board matches the target, the game does NOT immediately swap to the summary screen. The current "ripped away from you" abrupt-cut is a bug. Instead:

* The timer freezes at the exact moment the boards matched (no extra ms charged).
* A \~750–1000ms validation sweep plays — a row-by-row pulse that gives the player a sense of "yes, you did it" without forcing them to read a popup.
* The RYGO mark in the chrome flips to a solid, glowing-green state to signal success.
* **The solved board then holds; the player taps to advance to the Summary (v1.6).** There is no timed auto-advance — a celebration the player dismisses never feels rushed. Under `prefers-reduced-motion` the animated sweep is skipped and the solved board is shown immediately, but the tap-to-advance gesture is still required.

The architectural shape: a new `'validating'` GamePhase between `'playing'` and `'complete'`. The timer freeze happens in the reducer; the visual sweep is a UI-layer animation gated on phase, and the `'validating' → 'complete'` transition is driven by the player's tap. The original sweep shipped in [TER-153](https://linear.app/terenc/issue/TER-153/win-state-validation-sequence-validating-gamephase-row-pulse-mark-glow); the tap-to-advance change is specced in [TER-169](https://linear.app/terenc/issue/TER-169).

### Constraints during play

* The pattern and the playable board are **never visible at the same time**.
* The 1-second transition blank applies in both directions (board → pattern, pattern → board) and the timer keeps running through it.
* The timer measures active play time: it banks and pauses when the attempt is set aside (background, refresh, quit-to-picker) and resumes on return, and never resets on Restart ([TER-167](https://linear.app/terenc/issue/TER-167)).
* The first reveal is free; every subsequent reveal counts as one move.
* All other meaningful clicks count — see Scoring.

## Scoring

**Moves are the score. Time is the tiebreaker.**

This makes the game a routing problem: minimize total clicks to reach the target. Time still creates light tension during play, but optimal play is purely about move efficiency.

### What counts as a move

* **Placement** (tapping an empty/non-matching cell with a color active) — 1 move
* **Clearing** (tapping a matching-color cell with that color active) — 1 move
* **Color switch to a *different* color** in the picker — 1 move
* **Color tap that does not change state** (tapping the already-active color) — 0 moves (no-op visually, no charge)
* **Re-reveal of pattern** (after the first) — 1 move
* **Hide pattern** (returning to the playable board) — 1 move
* **First reveal** — 0 moves (free)

The "every meaningful click costs" rule means efficient solving requires minimizing color switches and minimizing re-reveals, not just minimizing placements. A solution that places 12 colors with 2 switches scores 14; a solution that places 12 colors with 5 switches scores 17.

### Display

* The game-screen status bar shows **Score** (move count) as the primary metric and time as supporting context.
* The end-of-game summary shows score prominently, with time underneath.
* No combined formula. Time is purely tiebreaker for any leaderboard or aggregate; it never enters the score itself.

## UX constraints

The product is **mobile-first**. These are acceptance criteria, not stretch goals:

* Designed for portrait phone screens first; desktop is a graceful upscale.
* Touch-optimized hit targets — color picker buttons and grid cells minimum 44×44pt (Apple HIG). Cell size at 8×8 on iPhone SE is \~43px, marginally below the target — accepted tradeoff.
* No hover states as primary affordances. Everything works on tap.
* Snappy feedback — placement render under 100ms, plus a subtle scale-down on press to make the click feel intentional ([TER-148](https://linear.app/terenc/issue/TER-148/game-screen-ux-cleanup-remove-quit-dialog-add-restart-fix-light-mode)).
* 60fps target on mid-range phones for any cascade animations.
* Safe areas respected (notches, home indicator).

## Theming (MVP)

The game ships with **two themes: dark (default) and light**. Users can toggle between them, and their choice persists across sessions.

### Decisions

* **Default theme: dark.** First-time visitors land in dark mode regardless of OS preference. Respecting `prefers-color-scheme` is deferred — keeps the implementation simple and gives every new player the same first impression.
* **Toggle UI:** a small theme-toggle button visible on every screen, in a corner. Icon-based (sun for "switch to light," moon for "switch to dark"). The icon shown represents *the theme the user would switch to*, not the current theme — convention.
* **Persistence:** the user's choice is saved in `localStorage` under the key `rygo:theme` with values `'dark'` or `'light'`. On load, the persisted value (if any) wins over the default. (Migration from `yergers:theme` happens in [TER-151](https://linear.app/terenc/issue/TER-151/yergers-rygo-rebrand-rename-brand-asset-wiring-lockup-localstorage).)
* **Implementation:** Tailwind v4 class-based dark mode via `@custom-variant dark`. The `dark` class is applied to `<html>` when dark theme is active, removed when light theme is active.
* **Game-content colors are theme-invariant.** Red, yellow, green, and their shape fills do not change between modes. The traffic-light metaphor is preserved.
* **Surface palette uses brand Ink/Paper:**
  * Light mode page background: Paper `#F5F3EE`
  * Dark mode page background: Ink `#14110E`
  * Light mode primary text: Ink
  * Dark mode primary text: Paper
* **Theme-dependent surfaces:** page background, page text, secondary text, empty cells, borders, button backgrounds, status bar, **active-color indicator on the color picker** (must be visible in both themes — a contrasting hue, not a white ring that disappears against Paper).

## Accessibility (MVP requirement, not polish)

* **Shape + color, never color alone.** Every non-empty cell renders both its background color and its shape. The shape is the primary identifier for color-blind users; color is secondary.
* **Color picker buttons** also display the shape, in addition to the color, so the active-color indicator is meaningful for color-blind users.
* **Contrast.** Shape fill color must contrast against the background color at WCAG AA 3:1 minimum for graphical objects in both light and dark modes. The brand-palette shape fills (Paper on RYGO Red, Ink on RYGO Yellow, Paper on RYGO Green) all clear this bar.
* **Screen reader labels.** Each cell has an `aria-label` describing its state (e.g., "Red cell at row 2, column 3" or "Empty cell at row 1, column 1"). The color picker buttons have labels like "Select red" / "Select yellow" / "Select green." The theme toggle has a label like "Switch to light theme" / "Switch to dark theme" reflecting the action it would take.
* **No reliance on color alone for any state indicator** anywhere in the UI (active color, completion state, etc.).

## Leaderboard (M5 — pre-launch feature)

> Added v1.8 (May 25, 2026). This is RYGO's first backend and flips the original "no backend / no network" stance. Full design: `docs/RYGO_Leaderboard-Design.md`. **Non-negotiable: gameplay never depends on the network** — generation stays client-side; submission and rank-read are best-effort and must never block, delay, or break a play or the Summary.

An anonymous, per-difficulty daily leaderboard. After a player completes the **daily** puzzle for a level (practice never records), their result is submitted, server-verified, and they see their standing for that level on the Summary.

* **Backend:** Supabase (paid). A single write-only `scores` table, written only by an edge function under the service role — clients never write directly. The daily solution / move log is **not** stored server-side.
* **Identity:** Supabase **anonymous auth** — a persistent per-device anonymous id, issued on first launch. It is the dedupe key for one-result-per-player-per-day-per-level and for "your rank." Upgradeable to a real account later with no schema change. Accepted limitation: clearing storage or a new device reads as a new player.
* **Boards:** per-difficulty (Easy / Normal / Hard / Extreme are separate ladders). Sort key is **moves ASC, then elapsed_ms ASC** — matching the locked scoring (moves are the score, time is the tiebreaker).
* **Integrity (full-session replay):** the client submits the ordered meaningful-click log (selects, reveals, hides, taps), not just the final board, because board-neutral clicks count toward the score. The edge function regenerates the daily puzzle from the seed, replays the log through a server-side mirror of the game rules, and accepts only if the final board equals the target **and** the recomputed move count equals the claim. **The move score is cheat-proof; elapsed time is only sanity-bounded** (rejected below an anti-instant floor and above the 2 h clamp), since elapsed time can't be server-verified — an accepted tradeoff for an anonymous vanity board.
* **Submit path:** fire-and-forget on daily completion. On failure (offline / error / reject), the payload is enqueued locally and retried on next launch and next completion. First-write-wins per (player, day, level); duplicate submits are a no-op.
* **Read / display:** on the Summary (daily only), a best-effort rank read shows "#R of N today" for that level. If the read fails or the player is offline, the rank line is silently omitted — the Summary always renders fully without it. A standalone full-leaderboard view is deferred.
* **Privacy:** RYGO's first network call tied to a persistent anonymous id. No PII collected (anonymous id only). A short pre-launch disclosure line is required.
* **Out of scope (deferred):** standalone leaderboard view, named handles / accounts / multi-device sync (the anon-auth foundation makes these an additive upgrade), realtime updates.

## Open questions (deferred from this doc)

These are flagged but not blocking. We'll address each before the relevant feature ships.

1. **Daily-only vs. unlimited.** Daily lock per level is the M3 default; "practice mode" lets players replay an already-completed daily without recording a score. See [TER-142](https://linear.app/terenc/issue/TER-142/daily-play-tracking-once-per-day-lock-localstorage-foundation).
2. **Tutorial / first-run experience.** How does a brand-new player learn the rules? Probably an interactive first puzzle. Defer to polish (M4).
3. **Sound design.** Defer to polish (M4); could add a lot of feel but not MVP-critical. Design intent locked: percussive wooden tap on placement, three-note R-Y-G ascending chime on completion.
4. **Animations.** Cell fill cascades, color transitions, completion celebration. Defer to polish (M4) except the validation sweep which is M2 ([TER-153](https://linear.app/terenc/issue/TER-153/win-state-validation-sequence-validating-gamephase-row-pulse-mark-glow)).
5. **Respect** `prefers-color-scheme` on first visit. Currently: dark default for everyone. Could revisit if users complain.
6. **Pattern generator solution-length ranges** — to be retuned when full-coverage generation lands ([TER-146](https://linear.app/terenc/issue/TER-146/generator-full-coverage-all-3-colors-required-retune)). Real-play data will guide final ranges.

## Changelog

* **v1.8 (May 25, 2026):** Added the **Leaderboard (M5)** section — RYGO's first backend (anonymous, per-difficulty daily leaderboard on Supabase). Flipped the original "no backend / no network" stance to an **optional, best-effort backend that never gates play**: anonymous auth, full-session server replay for move-score integrity (time sanity-bounded only), per-difficulty boards, fire-and-forget submit with offline retry, rank-on-Summary read that degrades silently. No PII (anonymous id only). Design doc: `docs/RYGO_Leaderboard-Design.md`. Matching Tech-stack / Retention-scope flips made in `RYGO_CONTEXT.md`.
* **v1.7 (May 24, 2026):** Timer redefined as an **active-play accumulator** — it banks and pauses when the attempt is set aside (background, refresh, quit-to-picker) and resumes on return, never resets on Restart, and discards a stale attempt at UTC rollover; the in-progress board is restored on return. Replaces the v1.0 "runs continuously, cannot be paused" wall-clock. Spec in [TER-167](https://linear.app/terenc/issue/TER-167).
* **v1.6 (May 24, 2026):** Win-state advance changed from a timed auto-advance to **tap-to-continue** — after the validation sweep, the solved board holds until the player taps to open the Summary (reduced-motion shows the solved board immediately and still requires the tap). Spec in [TER-169](https://linear.app/terenc/issue/TER-169).
* **v1.5 (May 2, 2026):** Brand integration. Codename "Yergers" → final brand "RYGO." Added Brand identity section. Adopted brand color palette as game-content colors (RYGO Red `#D8463A`, RYGO Yellow `#E6B73B`, RYGO Green `#2E9D5C`); shape fills changed to Paper / Ink. Page surface palette adopts Ink (dark) / Paper (light) instead of Tailwind gray-950 / white. Locked validation sequence between completion and summary — abrupt-cut bug. localStorage key `yergers:theme` → `rygo:theme` (migration in [TER-151](https://linear.app/terenc/issue/TER-151/yergers-rygo-rebrand-rename-brand-asset-wiring-lockup-localstorage)).
* **v1.4 (May 2, 2026):** Major rules update following first real-play feedback.
  * **Difficulty ladder:** expanded from {4×4, 6×6, 8×8} to {4×4, 5×5, 6×6, 8×8} with labels Easy / Normal / Hard / Extreme.
  * **Green reach now blocking:** non-empty cells stop green's propagation in that direction.
  * **Pattern generation: full coverage + all 3 colors required.**
  * **Clearing:** new mechanic — same-color tap with that color active clears via the color's reach (with blocking), only affecting matching-color cells.
  * **Scoring:** locked to "moves are the score, time is tiebreaker" with detailed every-click-counts rules.
  * **Pattern↔board transition:** 1-second "Get ready..." blank in both directions; timer keeps running.
* **v1.3 (May 1, 2026):** Replaced octagon with square for red cells.
* **v1.2 (May 1, 2026):** Added Theming section. Two themes (dark default, light), user-toggleable.
* **v1.1 (May 1, 2026):** Elevated color-blind accessibility from "polish" to MVP requirement.
* **v1.0 (May 1, 2026):** Initial design doc.
