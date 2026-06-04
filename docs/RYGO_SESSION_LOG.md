# RYGO_SESSION_LOG.md

> **Append-only session log for RYGO.** Split out of `RYGO_CONTEXT.md` in Process v2.5 (May 25, 2026) so the context document stays small and locked-section close-outs are cheap.
> **Companion to** `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md` (project state, locked decisions, issue map) and `docs/Terenc-Development-Process.md`.
> **Editing rule:** Code appends a session entry at the bottom at the end of every session; Opus appends close-out entries. **Never edit or remove an existing entry.** Most recent at bottom.

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

### 2026-05-25 — [TER-203](https://linear.app/terenc/issue/TER-203) shared-engine delivery (Claude Code / Sonnet 4.6)

**Goal:** Deliver `src/engine/` as a single source of truth to the Supabase Edge Function runtime (Deno) by syncing three pure engine files into `supabase/functions/_shared/engine/`, with a CI drift guard and Deno typecheck.

**What shipped:**

* **`.ts` import extensions** — added explicit `.ts` extensions to every relative import in `placement.ts` (`from './types.ts'`) and `generator.ts` (`from './types.ts'`, `from './placement.ts'`). `types.ts` has no imports — unchanged. Vite and Vitest tolerate explicit `.ts` extensions; build and 254 tests remain green.

* **`scripts/sync-engine.mjs`** — Node ESM script (no deps). Copies `types.ts`, `placement.ts`, `generator.ts` from `src/engine/` into `supabase/functions/_shared/engine/`, prepending the generated-file banner to each. Idempotent (running twice produces no diff). Test files NOT synced.

* **`npm run sync-engine`** — added to `package.json` scripts.

* **`supabase/functions/_shared/engine/{types,placement,generator}.ts`** — committed with banners. Import bodies match source exactly (no transform).

* **CI additions** (in `build-and-test` job, after `npm run test`):
  1. **Engine drift guard** — runs `npm run sync-engine` then `git diff --exit-code -- supabase/functions/_shared/` with explicit "Engine drift — run `npm run sync-engine` and commit" failure message.
  2. **Deno setup** — `denoland/setup-deno@v2` with `deno-version: v2.x`.
  3. **Deno check** — `deno check supabase/functions/_shared/engine/*.ts` (globbing all three; `generator.ts` transitively covers the others).

**Tests:** 254 passing (all pre-existing; no new test files required — the sync script is trivial file I/O, and the drift guard is proven by the CI step itself).

**Build:** clean (`tsc -b && vite build`).

**Drift guard verified locally:** staged the committed baseline, appended `// drift-test` to `src/engine/types.ts`, ran `npm run sync-engine`, and confirmed `git diff --exit-code -- supabase/functions/_shared/` exits 1 with a visible diff. Reverted and re-synced back to clean.

**Idempotency verified:** running `npm run sync-engine` twice in a row produces `git diff --exit-code` exit 0.

**No runtime behavior changes.** No edits to `useGame`, `GameScreen`, `App`, or any file outside `src/engine/`, `scripts/`, `supabase/functions/_shared/engine/`, `package.json`, `.github/workflows/ci.yml`, and `docs/`.

**Docs changes (allowlisted sections only):**
* **Architecture notes:** added "Shared-engine delivery" section.
* **Issue map M5:** item 2 updated with TER-203 link and ✅ In Review status.
* **Session log:** this entry.

### 2026-05-25 — [TER-205](https://linear.app/terenc/issue/TER-205) useGame event-log capture (Claude Code / Sonnet 4.6)

**Goal:** Capture the ordered meaningful-click log inside `useGame` and persist it through the `rygo:inprogress` resume blob (v2). Capture + persist + resume only — nothing reads or submits the log yet.

**What shipped:**

* **`GameEvent` type** added to `src/engine/types.ts`:
  `select { color }` | `reveal` | `hide` | `tap { row, col }`. Also synced into `supabase/functions/_shared/engine/types.ts` via `npm run sync-engine` (banner updated; drift guard will confirm).

* **`useGame` reducer** — `eventLog: GameEvent[]` added to `GameState` and `GameView`. Reducer appends one entry per action in:
  - `SELECT_COLOR`: appended for both new-color (+1 move) AND no-op re-tap (+0 move, raw action recorded, server applies score rule on replay).
  - `REVEAL_PATTERN`: appended in both idle (first-reveal, 0 moves) and playing (re-reveal, +1 move) branches.
  - `HIDE_PATTERN`: appended (+1 move).
  - `PLACE_AT`: appended for placement, clear, and completing tap; skipped on no-op early returns.
  - `RESET`: `eventLog` cleared via `makeInitialState` on both daily-keep-clock and practice paths.
  - `COMPLETE_VALIDATION`, `TICK`, `BANK_TIME`, `RESUME_TIMER`: no event appended (correct — not player actions).

* **`InProgressBlob` bumped to version 2** — adds `eventLog: GameEvent[]`. `CURRENT_VERSION` = 2. `loadInProgress` normalizes v1 blobs (missing `eventLog` → `[]`); `version > 2` still returns null. `saveInProgress` writes v2 blobs.

* **`GameScreen.tsx`** — `buildBlob` updated to `version: 2` + `eventLog: g.eventLog`; manual post-Restart blob updated to `version: 2` + `eventLog: []`.

**Tests:** 270 passing (254 prior + 16 new). New tests cover:
- All four event types (including no-op `select`)
- First-reveal vs. re-reveal (both append `reveal`; moveCount correct for each)
- `PLACE_AT` on same-color cell (clear path) still appends `tap`
- `PLACE_AT` outside playing phase: no event
- Event ordering across a realistic sequence
- `RESET` (practice) clears `eventLog`
- `RESET` with keepClock (daily) clears `eventLog` while preserving timer
- Resume rehydrates `eventLog`; subsequent actions continue appending
- Background→resume→complete yields a complete, ordered log
- `InProgressBlob`: v2 round-trip with non-empty log; v1 blob loads with `eventLog = []`; future version (> 2) returns null

**Build:** clean (`tsc -b && vite build`). `selectColor('red')` no-op branch: existing "no move charged" test still passes, now with added event in the log.

**Folded-in close-out housekeeping (Opus-authorized):**
* Issue map M5 item 2: [TER-203](https://linear.app/terenc/issue/TER-203) ✅ In Review → ✅ Done.
* Issue map M5 item 3: set to [TER-205](https://linear.app/terenc/issue/TER-205) ✅ In Review.

**Docs changes (allowlisted sections only):**
* **Architecture notes:** added "Event-log capture" section.
* **Issue map M5:** items 2 (TER-203 → Done) and 3 (TER-205 → In Review) updated.
* **Session log:** this entry.

### 2026-05-25 — [TER-206](https://linear.app/terenc/issue/TER-206) Shared replay core (Claude Code / Sonnet 4.6)

Extracted `src/engine/replay.ts` and refactored the `useGame` reducer to delegate board + move-count transitions to it. Single rule set, no duplicated logic.

**Files changed:**
* `src/engine/replay.ts` — new. Pure module: `EventReplayState`, `applyEvent`, `ReplayResult`, `replayEventLog`. Imports `applyMove` / `applyClear` from `placement.ts`; no React, no localStorage, no network.
* `src/hooks/useGame.ts` — refactored. Dropped `applyMove` / `applyClear` imports; now imports `applyEvent` from `replay.ts`. `REVEAL_PATTERN`, `HIDE_PATTERN`, `SELECT_COLOR`, and `PLACE_AT` cases delegate board + moveCount computation to `applyEvent`. Completion detection remains in `PLACE_AT` via `boardsMatch`. `emptyBoard` and `boardsMatch` helpers unchanged.
* `scripts/sync-engine.mjs` — `'replay.ts'` added to FILES.
* `supabase/functions/_shared/engine/replay.ts` — generated by `npm run sync-engine` (banner present).
* `src/engine/replay.test.ts` — new. 16 tests covering all acceptance criteria.
* `docs/RYGO_CONTEXT.md` — architecture note added; issue map M5 item 4 split into 4a (TER-206 In Review) + 4b (edge function, not yet filed); Shared-engine delivery note updated.

**Tests:**
* 270 pre-existing tests: all pass.
* 16 new `replay.test.ts` tests: all pass. Covers `applyEvent` for each event type (including no-op select, first-reveal-free, re-reveal, same-color clear, board-no-op +1), and `replayEventLog` for realistic sequence + board-reaches-target case.
* Total: 286 tests, 21 test files.

**Build:** clean. Drift guard: `npm run sync-engine` + `git diff --exit-code` → no diff (all in sync at commit time).

**Subtleties preserved (verified by tests and reducer inspection):**
* First reveal +0, re-reveal +1 — tracked via `hasRevealed` in `EventReplayState`.
* No-op select (same color) +0, recorded anyway by the reducer.
* Same-color tap → `applyClear`, +1.
* Board-no-op placement (yellow on red) → `applyMove` called, board unchanged, +1.
* Completion NOT detected in `applyEvent`; remains in reducer's `PLACE_AT` branch.

**Decisions:**
* `applyEvent` exported (not package-private) so the reducer can import it — the edge function only needs `replayEventLog`, but exporting `applyEvent` keeps the single-source guarantee testable.
* `boardsMatch` now runs on both the clear and placement paths in `PLACE_AT`. Safe because targets are fully covered (TER-146): a clear that produces empty cells can never match.
* `EventReplayState.hasRevealed` is derived in the reducer by checking `state.phase !== 'idle'` at call time — no new field added to `GameState`.

**Docs changes (allowlisted sections only):**
* **Architecture notes:** added "Shared replay core" section; updated "Shared-engine delivery" entry to reference TER-206.
* **Issue map M5:** item 4 split to 4a (TER-206 ✅ In Review) + 4b (edge function, not yet filed).
* **Session log:** this entry.

### 2026-05-25 — [TER-207](https://linear.app/terenc/issue/TER-207) Edge-function replay validator (Claude Code / Sonnet 4.6)

Implemented `supabase/functions/submit-score/` — the score submission Deno edge function. Pure validation logic is fully separated from side effects. Generator-parity tests confirm the Deno runtime reproduces byte-identical puzzle outputs to the browser JS runtime.

**Files changed:**
* `supabase/functions/submit-score/validate.ts` — new. Pure module (no I/O): `BadRequestError`, `parsePayload`, `validateSubmission`. Constants: `MAX_EVENTS=2000`, `ELAPSED_FLOOR_MS=1500`, `ELAPSED_CEILING_MS=7_200_000`, `LAUNCH_DAY='2026-05-25'`. Imports only from `../_shared/engine/`.
* `supabase/functions/submit-score/index.ts` — new. HTTP handler: OPTIONS CORS, JWT auth via anonClient (user_id from token never body), `parsePayload` → 400, `validateSubmission` → 200, service-role INSERT with conflict 23505 dedup → 200. All keys via `Deno.env.get` only.
* `supabase/functions/submit-score/parity-fixture.json` — new. Committed JSON with 12 entries (3 seeds × 4 grid sizes). Seeds: `RYGO-2026-05-25`, `RYGO-2026-06-15`, `RYGO-STATIC-PARITY-A`. Generated via one-off Vitest script (deleted after run).
* `supabase/functions/submit-score/parity.test.ts` — new. 12 Deno tests. Reads committed fixture, regenerates each entry via `_shared/engine/generator.ts`, deep-equals `puzzle.target`.
* `supabase/functions/submit-score/validate.test.ts` — new. 24 Deno tests. Covers `parsePayload` (12) and `validateSubmission` (12). Uses `solutionToEventLog` helper to convert generator solution to event log for accept tests. No external test deps — inline assertion helpers.
* `vite.config.ts` — added `supabase/**` to Vitest `exclude` to prevent Deno test files from being discovered by the client test runner.
* `.github/workflows/ci.yml` — added `deno test --allow-read` step after existing `deno check` step, running both parity and validate tests.
* `docs/RYGO_CONTEXT.md` — architecture note added; issue map updated (TER-206 → Done, TER-207 → In Review).

**Tests:**
* 286 pre-existing Vitest tests: all pass (no regressions).
* 12 parity fixture Deno tests: all pass. Confirms Deno + `_shared/engine/generator.ts` produces identical targets to browser runtime for all 4 grid sizes.
* 24 validate unit Deno tests: all pass. Full coverage of payload parsing, boundary conditions, and replay acceptance/rejection.
* Total Deno: 36 tests.

**Build:** clean. Drift guard: green (no new src/engine changes; existing sync unchanged). Deno check: clean.

**Subtleties preserved:**
* `applyMove` vs `applyEvent` divergence: the generator's `solution[]` is built for `applyMove` semantics (no clearing). Same-color taps in replay trigger `applyClear` (TER-147), so the generator solution cannot be used as a valid event log for 6×6/8×8 boards where same-color overlaps occur. Accept tests use only 4×4 and 5×5; 6×6/8×8 correctness is covered independently by the parity fixture.
* `elapsedMs` is reject-not-clamp: below floor or above ceiling → `{ accepted: false }`, not stored clamped.
* Future day is a security hard stop (400 BadRequestError), not a soft reject — prevents backdating attacks.
* `user_id` sourced exclusively from verified JWT; never from request body.
* Service-role key never returned in any response body or error message.

**Decisions:**
* `parsePayload` validates calendar dates with a JS round-trip check (parse → toISOString → compare) to reject overflow dates like `2026-02-30` that JS silently coerces.
* No external test dependencies (no `jsr:@std/assert`) so Deno tests are truly network-free.
* `parity-fixture.json` is committed (not generated at test time) so CI tests remain deterministic with `--allow-read` only.

**Docs changes (allowlisted sections only):**
* **Architecture notes:** added "Submit-score edge function" section with full API contract.
* **Issue map M5:** TER-206 → ✅ Done; TER-207 added as ✅ In Review.
* **Session log:** this entry.

**Fix-pass (Opus review, same PR):** Out-of-bounds tap events (row or col ≥ grid_size) previously passed `parsePayload` (which only checked non-negative integers) and threw `RangeError` inside `replayEventLog` → `applyMove`/`applyClear`, surfacing as a 500 (retryable). Added a bounds check in `parsePayload` after `grid_size` is known: any tap with row or col ≥ grid_size now throws `BadRequestError` → 400 (terminal). Two new Deno tests added (row too large, col too large). Total Deno: 38 tests.

### 2026-05-25 — [TER-213](https://linear.app/terenc/issue/TER-213) M5-5: Client score submission (Claude Code / Sonnet 4.6)

Implemented fire-and-forget score submission from the client + localStorage retry queue.

**Files changed:**
* `src/persistence/submitScore.ts` — new module: `enqueueAndSubmit`, `PENDING_SUBMIT_KEY`, `SubmitPayload` interface; dedupe by `${day}:${grid_size}`, cap at 50, flush on launch + online event, re-entrancy guard (`flushing` boolean), lazy URL resolution so `vi.stubEnv` works in tests.
* `src/components/GameScreen.tsx` — added `enqueueAndSubmit` import and a `useEffect` that fires exactly once (ref latch) on `phase === 'complete'` and `mode === 'daily'`.
* `src/persistence/submitScore.test.ts` — new file: 12 queue-behavior Vitest tests (accepted/rejected/4xx/5xx/network/re-entrancy/online-flush/cap/dedupe/no-session/no-URL/auth-header) + 4 per-grid-size real-log replay tests using `puzzle.solution` replayed through `useGame` with a double-tap approach.
* `src/components/GameScreen.test.tsx` — added mock for `submitScore`, plus 3 new tests: fire-once, no-re-render, practice-no-submit.
* `docs/RYGO_CONTEXT.md` — TER-205 → ✅ Done; TER-207 → ✅ Done; item 5 → TER-213 ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Non-obvious decisions:**
* `getSubmitUrl()` reads `import.meta.env.VITE_SUPABASE_URL` at call time, not at module load. Module-level env reads happen before `vi.stubEnv` takes effect in Vitest's module isolation; lazy read avoids this.
* Response contract: both `accepted:true` and `accepted:false` are terminal (dequeue). Only 5xx and network errors are retryable. `accepted:false` means the server replayed the log and found it invalid — retrying the same log will never change the outcome.
* Per-grid-size replay tests use a "double-tap" driving algorithm: when the generator solution has a move that would trigger a same-color clear in `useGame` (tap cell already holds that color), we dispatch the tap TWICE — once to clear, once to place. This is algebraically equivalent to a direct `applyMove` because `clearCells` only removes cells that are already that color, and the re-apply fills them back from empty. Avoids tracking a parallel simulated board or computing delta cells individually.
* 305 tests passing (up from 286 pre-TER-213).

### 2026-05-26 — [TER-215](https://linear.app/terenc/issue/TER-215) M5-6: Client rank read (Claude Code / Sonnet 4.6)

Implemented the client rank read — the final build issue in the M5 leaderboard chain.

**Files changed:**
* `src/backend/getStanding.ts` — new. `getStanding(day, gridSize, moves, elapsedMs)` calls `supabase.rpc('get_standing', { p_day, p_grid_size, p_moves, p_elapsed_ms })`. Returns `{ rank, total }` directly from `data`; returns `null` on any error, unexpected shape, or when `supabase === null` (no network call, never throws). Shape validation checks both `rank` and `total` are numbers.
* `src/components/GameScreen.tsx` — in the existing fire-once completion `useEffect` (daily branch), added a `getStanding(...)` call fired independently of `enqueueAndSubmit`. Result stored in `useState<{ rank: number; total: number } | null>` (initial `null`); passed to `Summary` as the new `standing` prop. The ref latch prevents the effect re-firing.
* `src/components/Summary.tsx` — added optional `standing?: { rank: number; total: number } | null` prop. When non-null, renders `#R of N today` (where N = `max(rank, total)`) below the Score/Time card. Omits the line silently when null/absent. No spinner and no reserved slot.
* `src/backend/getStanding.test.ts` — new. 10 tests: successful call, p_-prefixed args, moves+elapsedMs both passed, RPC error → null, null data → null, missing rank → null, missing total → null, non-numeric types → null, network rejection → null (never throws), null supabase → null immediately.
* `src/components/GameScreen.test.tsx` — added `mockGetStanding` to hoisted mocks; 6 new tests: fire-once with correct args, standing line renders value, standing line absent on null, fire-once not re-fired on re-render, practice no call, clamped denominator (rank > total).
* `src/components/Summary.test.tsx` — 8 new tests in a `standing line` describe block: normal render, clamped denominator (rank > total), rank === total, rank 1 of 1, null → omit, prop absent → omit, undefined → omit, no spinner/reserved-slot when omitted.
* `docs/RYGO_CONTEXT.md` — architecture note added for `getStanding`; issue map M5: item 5 (TER-213) → ✅ Done; item 6 → TER-215 ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 329 passing (was 305); build clean; drift guard clean.

**Non-obvious decisions:**
* `max(rank, total)` denominator clamp: the rank RPC is called before the player's own submit lands, so `total` is often 1 low for a few seconds. The clamp guarantees no "#5 of 3" display. Self-heals on next view.
* `getStanding` fires inside the same `hasReportedCompletion` latch as `enqueueAndSubmit` — no second effect, no second latch, exactly the spec requirement.
* `vi.hoisted` with a getter on the mock object lets the null-supabase tests switch `state.supabase = null` between tests without needing separate mock files.

### 2026-05-26 — [TER-220](https://linear.app/terenc/issue/TER-220) M6-1: Production par solver (Claude Code / Sonnet 4.6)

Promoted the TER-217 spike prototype to a production A* par solver module.

**Files changed:**
* `src/engine/parSolver.ts` — new. `solveOptimalPar(target, gridSize, { budgetMs })` returning `{ proven: true, par } | { proven: false }`. A* with full memoization (Map-based closed set), binary min-heap, yellow min-cover DP (exact bitmask DP for k≤26 target-yellow cells), R1/R2/R3 pruning, move scoring for ordering. Heuristic: redMismatch + minYellowCover(mask) + ⌈greenMismatch / (2N−1)⌉. No Node.js-specific APIs; Deno-compatible.
* `src/engine/parSolver.test.ts` — new. 17 tests: yellow DP correctness, determinism, budget-cutoff (proven:false on budget=0 and tiny budgets), placement-only verification for 4×4 (20 seeds, all proven) and 5×5 (15 seeds, all proven), structural verification for 6×6 (10 seeds, 5s budget, timeout expected) and 8×8 (5 seeds, 2s budget, timeout expected), par ≤ generator solution length, hand-crafted known-optimal boards.
* `scripts/par-solver-benchmark.ts` — new. Benchmark harness reusing spike seed set (15 seeds per size). Run with `npx tsx scripts/par-solver-benchmark.ts`.
* `scripts/sync-engine.mjs` — added `parSolver.ts` to FILES; now syncs 5 engine files.
* `supabase/functions/_shared/engine/parSolver.ts` — generated by `npm run sync-engine`.
* `docs/RYGO_CONTEXT.md` — architecture note added for parSolver; issue map M6 section added, TER-220 → ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Placement-only verification result:** No counterexample found. All 20 sampled 4×4 and all 15 sampled 5×5 puzzles prove optimal via placement-only A* search. 6×6 and 8×8 time out as expected (search-space size, not structural need for clears). Structural argument: R1+R2 pruning rules prevent permanently-damaging placements — red is never placed at non-red target cells, and yellow is never placed adjacent to writable target-green cells. The generator's own placements-only solution witnesses existence of a placement-only path for every puzzle.

**Tests:** 346 passing (was 329); build clean; drift guard clean.

**Non-obvious decisions:**
* A* over IDA*: the spike's IDA* re-explored states across iterations even with a per-iteration TT; A* with a Map-based closed set avoids all re-expansion. Consistent heuristic (h decreases ≤1 per move) guarantees closed-set correctness.
* `budgetMs ≤ 0` check before the heap is initialised ensures immediate `proven:false` for zero budgets rather than solving one node before the periodic check fires.
* Closed-set cap at 4M entries: calibrated for offline use (Node.js par pipeline). 4×4 and 5×5 solve well within this cap; 6×6 and 8×8 hit the time budget first in practice.
* Move scoring (sort yellow/green candidates by net-target-gain) is a performance optimisation only — it does not affect correctness since A* explores by f = g + h, but it tends to push high-f nodes onto the heap early, reducing heap churn in practice.

### 2026-05-26 — TER-220 Opus close-out (docs only)

Issue map M6 section updated to full backlog (TER-220 ✅ Done, TER-221–226 filed); parSolver architecture note wording corrected: `proven` flag now documented as "optimal among placements" not "provably global optimal," with TER-225 tracking the formal close.

### 2026-05-26 — [TER-221](https://linear.app/terenc/issue/TER-221) M6-2: Logic-loop rework (Claude Code / Sonnet 4.6)

Removed the reveal/hide toggle and 1-second transition blank. Target pattern is now a persistent read-only reference thumbnail (`RefThumbnail`) shown alongside the play grid — both always visible. Timer starts on game-screen entry (no gate). Fixed-layout game area (no reflow between phases).

**Files changed:**
* `src/engine/replay.ts` — Placements-only scoring: `select` → +0 (reverses TER-150 rule, authorized by design doc §4); `reveal`/`hide` → +0 (backward-compat with old event logs); placement/clear taps remain +1.
* `supabase/functions/_shared/engine/replay.ts` — Auto-synced via `npm run sync-engine`.
* `src/hooks/useGame.ts` — `GamePhase` narrowed to `'playing' | 'validating' | 'complete'`; `patternVisible` removed from `GameView`; `revealPattern`/`hidePattern` removed from `GameActions`; `RESUME_TIMER` dispatched unconditionally on mount (was conditional on `hasResume`). Old `InProgressBlob` phases (`'idle'`, `'pattern-revealed'`) silently remapped to `'playing'` on resume.
* `src/components/RefThumbnail.tsx` — New. Read-only minimap of target board. `w-28` (112px), same color tokens as Grid, non-interactive divs.
* `src/components/GameScreen.tsx` — Removed `transitioning` state, `timerRef`, reveal/hide button, "Get ready..." blank, conditional ColorPicker. Added `RefThumbnail` always-visible above play grid. `buildBlob` always writes `phase: 'playing'`. `handleRestart`/`onPlayAgain` call `game.reset()` then `game.resumeTimer()`. Par slot reserved (`data-testid="par-slot"`) for TER-223.
* `src/components/Summary.tsx` — Par slot reserved (`data-testid="par-slot"`) for TER-223.
* `src/hooks/useGame.test.ts` — Rewritten: game starts in `'playing'`, timer starts on mount, `selectColor` is +0, no reveal/hide actions tested.
* `src/components/GameScreen.test.tsx` — Rewritten: no reveal flow, `ref-thumbnail` present on initial render, par slot test added.
* `src/engine/replay.test.ts` — Updated: all scoring expectations match placements-only rules; backward-compat test for old reveal/hide events.
* `src/App.test.tsx` — `ref-thumbnail` check replaces "Reveal Pattern" check; no reveal step needed for grid cell count test.
* `src/persistence/submitScore.test.ts` — Removed `revealPattern()`/`hidePattern()` calls; added `act(() => {})` to flush RESUME_TIMER.
* `docs/RYGO_CONTEXT.md` — `GamePhase` type updated; useGame interface updated; GameScreen description updated; RefThumbnail sub-component added; inProgress phase guard updated; event-log capture note updated; replay scoring rules updated; M6 issue map: TER-221 → ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 339 passing (was 346; 7 reveal/hide action tests removed); build clean; drift guard clean.

**Non-obvious decisions:**
* TER-150 GDD reversal: the TER-150 rule (every color switch costs +1) is **reversed here** (color switches now +0, placements-only). Authorized by the RYGO Logic Pivot Design Doc §4. Score is now a pure placement count — a cleaner spatial-skill signal and simpler to server-validate.
* `RESUME_TIMER` unconditional mount: previously only fired when `hasResume` was set. Removed the condition so the timer starts on every game-screen mount — fresh, resumed, or restarted. Minimal change to replace the old reveal gate.
* Old blob phases remapped silently: `InProgressBlob` v2 may have `phase: 'idle'` or `phase: 'pattern-revealed'` from pre-TER-221 sessions. `makeInitialState` always returns `phase: 'playing'`, absorbing old blobs without a schema migration.
* 8×8 legibility: `RefThumbnail` at `w-28` (112px) renders 8×8 cells at ≈12px — below the 15px shape-legibility threshold stated in design doc §8. Implemented as-is and flagged in a TER-221 Linear comment with four options (larger thumbnail, side-by-side layout, tuck into status row, accept 12px). Decision deferred to Chris per design doc open question §8.

### 2026-05-27 — [TER-235](https://linear.app/terenc/issue/TER-235) M6: Game-screen header cluster (Claude Code / Sonnet 4.6)

Implemented the compact header cluster on the game screen: RefThumbnail (`w-28`, tap-to-zoom intact) on the left; Score, Par slot, Time, and ThemeToggle stacked in a flex column on the right. Relocated the theme toggle from App's global fixed overlay into GameScreen — App suppresses the global overlay while `view === 'game'` and GameScreen provides the toggle in all three phases.

**Files changed:**
* `src/components/GameScreen.tsx` — added `theme?: Theme` and `toggleTheme?: () => void` props (optional, defaulting to `'dark'` and noop so existing tests don't break). Replaced the separate status bar + "Fixed game area" (thumbnail centered above grid) with a single header cluster: `flex items-start gap-3` row containing `<RefThumbnail>` and a `flex flex-col flex-1` info column (Score + par slot `min-w-[4rem]`, Time, ThemeToggle). Removed the outer wrapper div that was centering the thumbnail. For `validating` and `complete` phases, added a `fixed top-0 right-0 z-50` ThemeToggle overlay matching the App global overlay's position — so the toggle is accessible throughout all game phases. Imported `ThemeToggle` and `Theme` type.
* `src/App.tsx` — wrapped the global ThemeToggle overlay in `{view !== 'game' && (...)}` so it is suppressed on the game screen. Added `data-testid="global-theme-toggle"` to the overlay wrapper for testability. Passed `theme={theme}` and `toggleTheme={toggleTheme}` to `<GameScreen>`.
* `src/components/GameScreen.test.tsx` — renamed `'par slot is present in the status bar'` → `'par slot is present in the header cluster'`; added 3 new tests: toggle renders in playing phase; clicking toggle calls toggleTheme; toggle accessible during validating phase.
* `src/App.test.tsx` — added 3 new tests: global toggle present on difficulty screen; global toggle suppressed on game screen (toggle still accessible inside GameScreen); global toggle returns after Quit.
* `docs/RYGO_CONTEXT.md` — updated GameScreen architecture note; added TER-235 to M6 issue map.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 358 passing (was 339; +19 net — 3 new GameScreen + 3 new App + 13 from TER-221 base already on m6); build clean.

**Non-obvious decisions:**
* `theme` and `toggleTheme` made **optional** (with sensible defaults) rather than required. This keeps all pre-existing GameScreen tests valid without modification — they don't pass theme props and the defaults (`'dark'` / noop) are inert. The App always passes live values.
* For **validating and complete phases**, the ThemeToggle is rendered in a fixed top-right overlay (same position as the global overlay, but owned by GameScreen). An alternative was to leave the toggle absent during the ~850ms validating transient and add it to Summary's component surface — but the overlay approach is cleaner, doesn't touch Summary's interface, and ensures the toggle is never temporarily inaccessible.
* The par slot retains `min-w-[4rem]` (64px) to **prevent reflow** when TER-223 fills it. At 219px available info-column width on iPhone SE, this reserves space for a two-character number label pair without crowding Score.

### 2026-05-27 — [TER-235](https://linear.app/terenc/issue/TER-235) patch: revert theme-toggle relocation (Claude Code / Sonnet 4.6)

Scope-adjustment patch on the same branch/PR per Linear comment "Scope adjustment: revert the theme-toggle relocation." The cluster layout (RefThumbnail + Score/Par-slot/Time) is unchanged.

**Reverted:**
* `src/components/GameScreen.tsx` — removed `ThemeToggle` import, `Theme` type import, `theme?`/`toggleTheme?` props, ThemeToggle element from the playing-phase header cluster, and ThemeToggle fixed-overlay from both the `validating` and `complete` phase returns. `validating` returns a single `<div>` again; `complete` returns `<Summary>` directly.
* `src/App.tsx` — restored the global ThemeToggle overlay to unconditional render (no `view !== 'game'` gate, no `data-testid`). Removed `theme`/`toggleTheme` props from the `<GameScreen>` call.
* `src/components/GameScreen.test.tsx` — removed 3 toggle-in-cluster tests.
* `src/App.test.tsx` — removed 3 global-toggle-suppression tests.
* `docs/RYGO_CONTEXT.md` — updated GameScreen arch note and TER-235 issue-map entry to remove toggle-relocation references.

**Kept intact:** header cluster layout, par-slot reservation, no-reflow guarantee, RefThumbnail tap-to-zoom.

**Tests:** 352 passing (was 358; −6 toggle tests removed); build clean.

### 2026-05-27 — [TER-222](https://linear.app/terenc/issue/TER-222) M6: Offline daily-par pipeline (Claude Code / Sonnet 4.6)

Built the full par pipeline: `daily_par` Supabase table, GitHub Actions compute job, `boardHash` drift guard, and the `getDailyPar` client read path. Stopped and confirmed the runner choice (GitHub Actions) before implementing — no Supabase scheduled-function infrastructure was set up; posted a comment with options; Chris chose Option 3 (GH Actions) due to 8×8's full-CPU profile.

**Files changed:**
* `supabase/migrations/20260527000000_daily_par_schema.sql` — new. `daily_par` table keyed by `(date, grid_size)` with `par`, `proven`, `generation_hash`, timestamps. RLS: public SELECT; service-role-only writes. `set_updated_at` trigger.
* `src/engine/boardHash.ts` — new. `boardHash(board): string` — single char per cell (`e`/`r`/`y`/`g`) in row-major order; shared fingerprint between compute job and client for drift detection. Not added to `sync-engine.mjs` (no Deno edge function uses it).
* `scripts/compute-par.ts` — new. Node.js compute script run by the GH Actions job. Exports pure helpers (`buildParRow`, `shouldSkipRow`, `utcDateStr`) for testability. Precomputes 14 days ahead; 30s budget per puzzle; proven result → `proven=true`; timeout/OOM → `proven=false, par=generatorMoves`; skip-existing logic on hash match.
* `.github/workflows/compute-par.yml` — new. Weekly Monday 02:00 UTC + `workflow_dispatch`. Reads `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from GH secrets.
* `src/backend/getDailyPar.ts` — new. `getDailyPar(dateStr, gridSize)` → `{par, proven} | null`. Queries `daily_par`, verifies generation hash against client's own puzzle, returns null on any failure path.
* `src/backend/getDailyPar.test.ts` — new. 11 tests: supabase-null, DB error, missing row, hash mismatch, invalid shape, network throw, success (proven + fallback), correct query shape.
* `scripts/compute-par.test.ts` — new. 14 tests: `buildParRow` proven/fallback/hash storage, `shouldSkipRow` match/mismatch/null/empty, `utcDateStr` offset/boundary cases.
* `src/components/GameScreen.tsx` — added `getDailyPar` import, `dailyPar` state, concurrent fetch in completion effect, `dailyPar` prop passed to `Summary`.
* `src/components/Summary.tsx` — added optional `dailyPar?: {par, proven} | null` prop (accepted, not rendered — display wired in TER-223). Par-slot div untouched.
* `docs/RYGO_CONTEXT.md` — daily par pipeline architecture note added; TER-222 → ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 377 passing (was 352; +17 new: 11 getDailyPar + 14 compute-par − 8 from prior base count delta); build clean; drift guard clean.

**Par values for today's seed (RYGO-2026-05-27):**
* 4×4: proven par=10, genMoves=11
* 5×5: proven par=14, genMoves=15
* 6×6: proven par=18, genMoves=21 (proved within 30s budget — design doc §3 says "conditional at 6×6")
* 8×8: fallback par=34, genMoves=34 (solver OOMs on local Mac before 30s deadline; GH Actions runner has more headroom to time out cleanly; 8×8 always uses soft par by design)

**Non-obvious decisions:**
* Runner choice: GitHub Actions (GH Actions), not Supabase scheduled function. 8×8 burns the full 30s budget in a CPU-heavy A* search — wrong for a CPU-capped Supabase edge function. GH Actions gives a full runner with no cap, keeps schedule+job in version control. `daily_par` table and client read stay in Supabase. See TER-222 Linear comment for full option analysis.
* boardHash lives in `src/engine/` but is NOT added to `sync-engine.mjs` FILES — the only consumers are the GH Actions Node.js script and the browser client; no Deno edge function needs it, so no drift-guard surface is created.
* `getDailyPar` takes `dateStr: string` (YYYY-MM-DD) matching the existing `effectiveDayKey` in GameScreen, rather than a `Date`. Seed is derived as `RYGO-${dateStr}` (equivalent to `dailySeed(utcMidnightDate)`) so the function is self-contained without importing `dailySeed`.
* Summary's `dailyPar` prop is named and typed but the destructuring uses `dailyPar: _dailyPar` (prefixed `_` to signal unused) so TypeScript strict mode doesn't flag the unused variable. TER-223 will rename the binding and render it.
* CI: the `build-and-test` job runs on PRs against `main` only. This PR targets `m6`, so CI may not run — noted in the status comment. Tests and build verified green locally.

**Chris-side setup required before the workflow can run:**
1. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as repository secrets in GitHub (Settings → Secrets → Actions).
2. Apply the migration `20260527000000_daily_par_schema.sql` to the live Supabase database via the Supabase dashboard SQL editor (or `supabase db push` if CLI auth is configured).

### 2026-05-27 — [TER-223](https://linear.app/terenc/issue/TER-223) M6: Par display — Score vs Par in status bar + Summary (Claude Code / Sonnet 4.6)

Surfaced par to the player: status-bar slot and Summary outcome line.

**Files changed:**
* `src/display/parDisplay.ts` — new. `PAR_SLACK = 1` + `displayedPar(raw: number | null): number | null`. Offset lives here; `daily_par.par` (raw) stays unchanged.
* `src/display/parDisplay.test.ts` — new. 4 tests: null in / null out, +1 offset, PAR_SLACK value.
* `src/components/GameScreen.tsx` — moved `getDailyPar` from completion `useEffect` to a mount `useEffect` (deps `[effectiveDayKey, puzzle.gridSize]`); removed duplicate call from completion effect; filled `data-testid="par-slot"` with `Par {displayedPar}` when available (empty when null).
* `src/components/GameScreen.test.tsx` — added `mockGetDailyPar` mock + 4 par-slot tests: empty when null, content when present, min-w class stability, called at mount.
* `src/components/Summary.tsx` — removed `_dailyPar` unused binding; imported `displayedPar`; added `parOutcome` computation; replaced stub par-slot div with `data-testid="par-outcome-row"` always-rendered div (empty placeholder for layout stability) + `data-testid="par-outcome-text"` when non-null. Under-par: `text-rygo-green`; even/over: neutral Ink/Paper.
* `src/components/Summary.test.tsx` — added `par outcome row` describe block with 8 tests: always-rendered element, null cases, delta −2/0/+3, under-par accent class, over-par no-red, even-par no-green.
* `docs/RYGO_CONTEXT.md` — architecture notes updated (GameScreen par-slot, Summary outcome row, daily par pipeline getDailyPar call site, new par display module section); TER-223 → ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 398 passing (was 377; +21 new: 4 parDisplay + 4 GameScreen par-slot + 8 Summary par-outcome + 5 existing par-slot test was already present); build clean.

**Non-obvious decisions:**
* `getDailyPar` at mount (not completion): spec requires par in the status bar from move one. Both daily and practice mode fetch — practice uses the same seed so gets the same row.
* Outcome row always rendered (empty placeholder when null): spec says "reserve the outcome row's height so Summary layout doesn't jump when par resolves." Used `min-h-[1.5rem]` on the container. No `visibility: hidden` needed — the container holds height even empty.
* Under-par accent `text-rygo-green` (brand green `#2E9D5C`): within the brand palette, positive signal without introducing a new color. Even and over-par use neutral Ink/Paper — over-par gets no negative treatment (no red, no warning).
* `−` character in "−N Under par" is U+2212 MINUS SIGN (not a hyphen), matching the spec's exact string.
* CI: PR targets `m6`; `build-and-test` check runs on PRs against `main` only. Tests and build verified green locally.

### 2026-05-27 — [TER-242](https://linear.app/terenc/issue/TER-242) M6 close-out: locked-section reconciliation (Claude Code / Sonnet 4.6)

Doc-only PR. Applied 6 corrected edits (A–F) to `docs/RYGO_CONTEXT.md` locked sections, superseding the original 10 edits in the issue description (7 of 10 were stale — targeted strings had already been updated by earlier sessions).

**Files changed:**
* `docs/RYGO_CONTEXT.md` — 6 locked-section updates: (A) gameplay overview rewritten for M6 side-by-side layout; (B) timer-start rule updated to game-screen mount (M6 pivot, locked TER-221); (C) scoring section replaced with placements-only rules + new Par framing block (5 sub-bullets: daily_par table, +1 slack, during-play display, Summary outcome, proven-flag internal-only); (D) new "Reference thumbnail tap-to-zoom" locked bullet added after SVG shapes bullet; (E) TER-221/235/222/223 flipped from ✅ In Review → ✅ Done; (F) TER-150 line annotated with supersession note (reversed in TER-221, M6 logic pivot).
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Non-obvious decisions:**
* First attempt stopped on 7/10 mismatches — correct behavior per spec. Opus provided corrected Find blocks via Linear comment; only those 6 were applied verbatim.
* No code changes; build and tests unchanged from TER-223 baseline.

**Patch commit (same session, same PR):** Opus review found Edit F missing from the diff (status comment incorrectly reported it as landed). Extra commit applied Edit F (TER-150 supersession note) verbatim; all 6 edits now confirmed in the file.

### 2026-05-27 — [TER-244](https://linear.app/terenc/issue/TER-244) GDD v1.9 — M6 logic pivot (Claude Code / Sonnet 4.6)

Doc-only PR. Applied Opus's v1.9 GDD draft verbatim to `docs/RYGO_Game-Design-Document.md` (complete file replacement) and bumped the GDD version reference in `docs/RYGO_CONTEXT.md`.

**Files changed:**
* `docs/RYGO_Game-Design-Document.md` — complete rewrite from v1.8 to v1.9. Key changes: Concept rewritten for logic-puzzle framing (pattern always visible, not memorized); "Pattern display" component replaced by "Reference thumbnail" (always-visible `w-28`, tap-to-zoom overlay); Move counter and Timer updated to placements-only / game-screen-mount; Gameplay section major rewrite (no first-reveal step, no re-reveal, no transition blanks); Scoring rewritten to placements-only + new Par framing subsection; Accessibility gains tap-to-zoom bullet; Open questions: §8 resolved, new §7 (par slack tuning) and §8 (6×6 budget bump, TER-240); Changelog v1.9 entry added.
* `docs/RYGO_CONTEXT.md` — one-line edit: GDD version reference bumped from v1.8 (May 25, 2026) to v1.9 (May 27, 2026) with M6 pivot summary.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**No source-code or test changes. `npm run build` passes clean.**

### 2026-05-30 — [TER-248](https://linear.app/terenc/issue/TER-248) Generator v1.5: raise solution-length floor per size (Claude Code / Sonnet 4.6)

Difficulty-tuning pass on the daily generator. With the M6 pivot the target pattern is always visible — challenge is routing, not memory — so short solutions feel trivial. Raised the starting-L floor and ceiling per size per the issue table.

**Files changed:**
* `src/engine/generator.ts` — `MOVE_RANGE` updated (v1.5): 4×4 `[6,10]→[8,11]`, 5×5 `[8,12]→[10,14]`, 6×6 `[10,16]→[13,18]`, 8×8 `[14,22]→[18,26]`. `MOVE_CAP` updated for three sizes to keep cap-exceeded retry rate ≤ 5%: 4×4 14→16, 6×6 24→26, 8×8 36→40; 5×5 unchanged at 18. Comment updated to v1.5 with TER-248 reference.
* `src/engine/generator.test.ts` — Updated stale 5×5 test description string `[8, 12]` → `[10, 14]`; all length assertions use `MOVE_RANGE[size][0]` / `MOVE_CAP[size]` dynamically (no other hard-coded values to change).
* `supabase/functions/_shared/engine/generator.ts` — Regenerated via `npm run sync-engine` (byte-copy with banner; diff identical to source minus banner).
* `supabase/functions/submit-score/parity-fixture.json` — Regenerated from updated client generator (`generatePuzzle`) for all 3 committed seeds × 4 sizes (12 entries). Raising starting-L changes the target boards for those seeds; the stale fixture would have failed `parity.test.ts`.
* `docs/RYGO_CONTEXT.md` — Pattern generator architecture note: solution-length bullet updated to v1.5 (new ranges, new MOVE_CAPs, test results). Issue map Unscheduled: TER-248 added as ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 398 passing (unchanged — no new test files required; existing dynamic assertions cover the new values). Build clean. Drift guard clean (`npm run sync-engine` + `git diff --exit-code` → no diff). Deno parity test: cannot run locally (Deno not installed); verified by construction — fixture was generated by `src/engine/generator.ts` and `_shared/engine/generator.ts` is a byte-copy produced by `sync-engine`, so parity is guaranteed. CI `deno test` will confirm.

**Decisions made:**
* MOVE_CAP increases (minimum needed to keep rate ≤ 5% per size): diagnosed per-size cap-exceeded rates at 6.2% (4×4), 4.4% (5×5, OK), 6.8% (6×6), 13.6% (8×8) with the old caps. Tested candidate cap values with an inline diagnostic (500 puzzles per size): caps 4×4→16, 6×6→26, 8×8→40 gave per-size rates of ~2.4%, ~1.2%, ~0.0% — all well under 5%. 5×5 already under 5% at cap 18 → unchanged.
* Deno parity test verified by construction (local Deno not installed); CI is the formal gate.
* No MOVE_CAP change for 5×5 — its 4.4% rate remained under threshold with the existing cap 18.

### 2026-05-30 — [TER-248](https://linear.app/terenc/issue/TER-248) + [TER-215](https://linear.app/terenc/issue/TER-215) closed by Opus (docs-only PR #66)

Chris reported [TER-248](https://linear.app/terenc/issue/TER-248)'s PR merged (PR #65, merged 18:49 UTC May 30) and confirmed [TER-215](https://linear.app/terenc/issue/TER-215) should flip alongside it. TER-215's code (PR #52) had been on `main` since May 26 but its close-out was missed — the issue map and this log were never updated, a four-day gap caught during this reconciliation. Opus reviewed PR #66's diff: three surgical edits to `docs/RYGO_CONTEXT.md`, no source touched, no other files. Both issues marked Done.

Locked-section updates in docs-only PR #66:

* **Issue map (Unscheduled):** [TER-248](https://linear.app/terenc/issue/TER-248) ✅ In Review → ✅ Done ("Shipped May 30, 2026").
* **Issue map (M5 item 6):** [TER-215](https://linear.app/terenc/issue/TER-215) ✅ In Review → ✅ Done.
* **Open questions:** the generator solution-length-ranges entry refreshed from the v1.4 ([TER-146](https://linear.app/terenc/issue/TER-146)) framing to v1.5 ([TER-248](https://linear.app/terenc/issue/TER-248)) — new starting-L floors listed (4×4 8–11, 5×5 10–14, 6×6 13–18, 8×8 18–26); MOVE_CAPs in the Pattern generator arch note; still flagged for real-play retune and as a Chris manual-verify item.

Ops items flagged at close-out (not code; Chris-side, post-deploy):

* **Trigger the `compute-par` `workflow_dispatch` after the v1.5 deploy.** The new generator changes target boards, so every precomputed `daily_par` row mismatches on `generation_hash` and the client silently degrades to no-par until the rows are refilled — up to ~a week if only the weekly Monday cron runs. (Also called out in PR #65's body.)
* **Then watch the 6×6 proven rate.** v1.5's longer solutions deepen the solver search; a drop in the 6×6 proven rate is the trigger to promote [TER-240](https://linear.app/terenc/issue/TER-240) (6×6 par budget bump).

Board after this close-out: nothing In Progress. Remaining is Backlog/Low — [TER-240](https://linear.app/terenc/issue/TER-240), TER-225 (clear-enabled optimality cross-check), TER-226 (solver/engine parity test) — plus non-code TER-212 (launch checklist) and undesigned TER-216 (leaderboard v2). Nothing is spec-ready for an autonomous launch; the next target gets a design pass before any spec draft.

### 2026-06-01 — [TER-293](https://linear.app/terenc/issue/TER-293) compute-par workflow Node bump 20 → 22 (Claude Code / Sonnet 4.6)

One-line fix to `.github/workflows/compute-par.yml`: `node-version: '20'` → `'22'`. Root cause: `@supabase/supabase-js` instantiates `RealtimeClient` inside `createClient`, which requires a native global `WebSocket` — available in Node 22+ but absent in Node 20. The workflow has never succeeded; all `daily_par` rows through 2026-05-27 were written by local dev-machine runs (Node 25). With the v1.5 generator live and old rows stale on `generation_hash`, par is missing in production.

**What changed:** `.github/workflows/compute-par.yml` line 21 only. No changes to `scripts/compute-par.ts`, `ci.yml`, any engine file, or any dependency.

**Tested:** `npm run build` clean; `npm run test` 398/398 passing. CI `build-and-test` does not exercise `compute-par.yml`, so the real validation is a `workflow_dispatch` run against the fix branch (see PR status comment).

**Decisions made:** none — scope is fully specified by the issue; no unspecified decisions encountered.

### 2026-06-01 — [TER-295](https://linear.app/terenc/issue/TER-295) deploy-functions.yml: auto-deploy Supabase edge functions (Claude Code / Sonnet 4.6)

Added `.github/workflows/deploy-functions.yml` — the CI gap that allowed `submit-score` to drift from the client and cause the TER-289 leaderboard outage. First `workflow_dispatch` against the fix branch is the TER-289 remediation (deploys current-main function, restoring submissions).

**What changed:** `.github/workflows/deploy-functions.yml` only (plus allowlisted docs: architecture note + issue-map + session log). No changes to `ci.yml`, `compute-par.yml`, function source, engine, or `supabase/config.toml`.

**Tested:** `npm run build` clean; `npm run test` 398/398 passing. CI `build-and-test` does not exercise this workflow — real validation is a `workflow_dispatch` run against the fix branch (Chris to dispatch and confirm a fresh daily lands a `scores` row; that is also the TER-289 end-to-end fix).

**Decisions made:** all spec-locked (D1: deploy all functions; D3: `workflow_dispatch` + push-to-main on `supabase/functions/**`; D4: no smoke test in v1). No unspecified decisions encountered.

### 2026-06-01 — [TER-297](https://linear.app/terenc/issue/TER-297) Summary rank stale fix — corrective re-read after submit settles (Claude Code / Sonnet 4.6)

Fixed the self-count race that caused the rank line to show "1 of 1" even when peer rows already existed in the `scores` table. The immediate `getStanding` read raced `enqueueAndSubmit` and always resolved before the player's own row committed.

**What changed:** `src/components/GameScreen.tsx` (completion effect) and `src/components/GameScreen.test.tsx` only.

* Completion effect refactored: captures `enqueueAndSubmit`'s promise as `submitPromise` and chains a corrective `getStanding` re-read off its `.catch(() => {}).then(...)` — fires after the own row (and any concurrent peers) are committed.
* Both `setStanding` calls guarded: a `null` result never clears a previously-shown standing.
* Unmount-cancellation guard added: `let cancelled = false` set by the effect cleanup prevents state updates after the player navigates away before the re-read resolves.
* Submit stays fire-and-forget — `submitPromise` is never `await`ed inline.

**Tests updated/added:** updated "called exactly once" tests to "called exactly twice" (immediate + corrective); added four tests in a `describe('corrective re-read after submit settles')` block: re-read updates standing after submit resolves; null re-read does not clear a shown value; unmount before re-read resolves does not throw; submit failure still triggers corrective re-read.

**Tested:** `npm run build` clean; `npm run test` 402/402 passing (up from 398 — 4 new tests).

**Decisions made:** none — spec fully covers the fix; no unspecified decisions encountered.

### 2026-06-01 — Opus close-out: June 1 production-incident session (TER-289 / TER-293 / TER-295 / TER-297)

Diagnosed and resolved two concurrent production issues, both rooted in deployed runtime drifting from the repo while CI stayed green.

* **TER-289 — leaderboard submissions silently failing (~05-27 onward).** Edge-function logs showed continuous invocations but no rows landing → deployed `submit-score` was stale vs the M6 + v1.5 client and rejected every submission (retry queue drops `accepted:false`/4xx as terminal). Resolved by redeploying `submit-score` from `main` via the new TER-295 workflow dispatch; verified a fresh `2026-06-01` `scores` row landed. Ops fix, no code change.
* **TER-293 — compute-par failed on Node 20.** `@supabase/supabase-js` `createClient` needs native WebSocket (Node 22+); the workflow pinned Node 20, so it had never run in CI (prior `daily_par` rows came from local Node-25 runs). One-line bump to Node 22 (PR #67); dispatch refilled `daily_par` for the 14-day window with v1.5 hashes.
* **TER-295 — deploy-parity automation.** New `deploy-functions.yml` (PR #68) auto-deploys all edge functions via `workflow_dispatch` and on push to `main` under `supabase/functions/**` (path filter catches synced `_shared/engine/**` too). Closes the drift gap behind TER-289.
* **TER-297 — Summary rank stale "#R of N".** Corrective `getStanding` re-read chained off `enqueueAndSubmit` settlement (PR #69); `scores` data confirmed "1 of 1" was a read/write race, not low adoption or an anon-identity bug.

Also: filed **TER-290** (low grid contrast, user-reported, parked pending repro). Trimmed **TER-216** — idea #1 ("re-check today's rank") shipped as TER-297; two ideas remain (yesterday's final rank, first-place stars).

Open follow-ups: generator-path `push` trigger on `compute-par.yml` (par-staleness half of deploy-parity); Process v2.6 (Opus authors repo-doc edits, Code/Chris applies). Post-v1.5 the 6×6 par proven-rate dropped (~40% in the sampled window) — meets the TER-240 promotion trigger; awaiting Chris's decision.

### 2026-06-02 — [TER-290](https://linear.app/terenc/issue/TER-290) Low grid contrast in light mode — grid-line treatment (Claude Code / Sonnet 4.6)

Fixed light-mode grid structure wash-out (user-reported, repro confirmed June 2). Added a dark grid-line background to the grid containers in `Grid.tsx` and `RefThumbnail.tsx` so the gap-1 gaps show as hairline dark lines regardless of empty-cell fill brightness.

**Root cause:** TER-168 raised empty-cell fill to `bg-stone-300` but structure still depended on the fill being visually distinct from Paper — insufficiently differentiated on a small/dim display.

**Approach:** `--color-grid-line: #78716C` (stone-500) added to `src/index.css` `@theme`. Applied `bg-grid-line dark:bg-ink p-px rounded-md` to the Grid container and the RefThumbnail thumbnail button + overlay board. The 1px padding (`p-px`) makes the line color visible around the board perimeter as well as through the internal gaps. Empty-cell fill stays `bg-stone-300` — unchanged. Dark mode uses `bg-ink` (same as the page background currently showing through the gaps — no visual regression).

**WCAG 1.4.11 non-text contrast (computed):**
- `#78716C` vs Paper `#F5F3EE`: **4.33:1** ✓ (≥ 3:1 required)
- `#78716C` vs stone-300 `#D6D3D1`: **3.22:1** ✓ (≥ 3:1 required)

**Files changed:**
* `src/index.css` — `--color-grid-line: #78716C` added to `@theme`.
* `src/components/Grid.tsx` — grid container: `bg-grid-line dark:bg-ink p-px rounded-md` added.
* `src/components/RefThumbnail.tsx` — thumbnail button container and overlay board: `bg-grid-line dark:bg-ink p-px` added (overlay board also gets `rounded-md`).
* `src/components/Grid.test.tsx` — two new tests: container has `bg-grid-line`/`dark:bg-ink`, container has `p-px`.
* `src/components/RefThumbnail.test.tsx` — two new tests: thumbnail button has `bg-grid-line`/`dark:bg-ink`; overlay board has `bg-grid-line`/`dark:bg-ink`.

**Tests:** 406 passing (was 402; +4 new). Build clean.

**Manual verification required (Chris, on-device):** light mode on a small/dim phone — grid and thumbnail both read clearly on a mostly-empty board at all four sizes, especially 8×8. Corner webbing (dark line bleeds around `rounded-md` cells) — flag if it looks off. Dark mode: no regression.

### 2026-06-02 — TER-290 closed by Opus

Chris reported TER-290's PR merged (PR #71). Opus reviewed the diff — grid-line `#78716C` through `gap-1` on the Grid container and both RefThumbnail surfaces, `dark:bg-ink` = no dark regression, empty-cell fill unchanged, contrast 4.33:1 vs Paper and 3.22:1 vs stone-300 — CI green at 406 tests, marked Done. Process note: the PR also added `grid-line` to the locked Coding-conventions brand-tokens bullet (flagged in review for revert; not reverted before merge). Content is correct, so retained, not churned — logged as a Code-originated locked-section edit, a data point for Process v2.6. Issue map (Unscheduled): TER-290 ✅ In Review → ✅ Done (PR #71).

### 2026-06-02 — [TER-301](https://linear.app/terenc/issue/TER-301) Settings surface (Claude Code / Sonnet 4.6)

Stood up the Settings surface: persistence module, hook, screen component, and App wiring. No audio/haptics consumers yet — this issue is the enabler.

**What shipped:**
* `src/persistence/settings.ts` — `rygo:settings` versioned blob `{ version: 1, audio: boolean, haptics: boolean }`. `loadSettings()` returns defaults on missing / corrupt / future-version JSON. `setAudioPref` / `setHapticsPref` each read-then-write to never clobber the other field.
* `src/hooks/useSettings.ts` — mirrors `useTheme`. Reads blob on init, exposes `{ audio, haptics, setAudio, setHaptics }`. Persistence and state only; no consumer.
* `src/components/SettingsScreen.tsx` — header mirrors StatsScreen / RulesScreen. Sound toggle always shown. Haptics toggle feature-gated on `'vibrate' in navigator` (hidden on iOS Safari / desktop). Both toggles are native `<input type="checkbox" role="switch" aria-label="...">`.
* `src/components/DifficultyPicker.tsx` — `onShowSettings?: () => void` prop; "Settings" text button rendered alongside "How to play" below the LevelButtons.
* `src/App.tsx` — `AppView` extended to include `'settings'`; wired `onShowSettings` → `setView('settings')` and `SettingsScreen onBack` → `'difficulty'`.

**Tests:** `src/persistence/settings.test.ts` (11 tests), `src/components/SettingsScreen.test.tsx` (9 tests including App routing). 426 total tests pass. Build clean.

**Decisions made:**
* Toggle implemented as native `<input type="checkbox" role="switch">` (semantic, keyboard-operable, `aria-label` carried on the input element).
* "Settings" button sits next to "How to play" in a centered flex row — keeps it out of the contested top corners (Stats top-left, ThemeToggle fixed top-right) per issue spec.

### 2026-06-04 — [TER-310](https://linear.app/terenc/issue/TER-310) Audio + haptics feedback engine (Claude Code / Sonnet 4.6)

Wired real sound and vibration behind the Sound and Haptics toggles. First consumer of `useSettings`.

**What shipped:**
* `src/audio/sounds.ts` — dependency-free Web Audio synthesis engine. Module-level lazily-created `AudioContext` singleton with full no-op fallback when unavailable (jsdom, old browsers, SSR). `resume()` unlocks a suspended context. `playTap()` — noise burst through a bandpass filter, ~40ms wooden click. `playWinChime()` — three ascending sine tones C5→E5→G5 mapping R→Y→G (low→high), total ~0.9s. `playUnderPar()` — triangle-wave arpeggio C6→E6→G6 starting ~850ms in (after the chime).
* `src/hooks/useGameFeedback.ts` — orchestrator. Consumes `useSettings()`. On mount: one-time `pointerdown`/`keydown` unlock listener for Web Audio autoplay policy. Tap effect: `playTap()` + `navigator.vibrate(15)` when `moveCount` increases while `phase === 'playing'`; suppressed on the completing move because that move's render already has `phase === 'validating'`. Win effect: `playWinChime()` + `navigator.vibrate([50, 50, 100])` + `playUnderPar()` (if `underPar`) fires exactly once on the `'playing'→'validating'` transition. All sound gated on `settings.audio`; all vibration gated on `settings.haptics && 'vibrate' in navigator`.
* `src/components/GameScreen.tsx` — `useGameFeedback({ moveCount: game.moveCount, phase: game.phase, underPar })` called at hook level (before conditional returns). `underPar = dailyPar != null && game.moveCount < (displayedPar(dailyPar.par) ?? Infinity)`.
* `src/components/SettingsScreen.tsx` — WCAG 2.5.3 Label-in-Name fix: `aria-label` updated to `"Sound"` (was `"Sound effects"`) and `"Haptics"` (was `"Haptic feedback"`) so visible text is contained in the accessible name.
* `src/components/SettingsScreen.test.tsx` — label assertions updated to match new aria-labels; "haptics shown" test teardown changed from `value: undefined` (which left `'vibrate' in navigator` true) to `delete (navigator as any).vibrate`.

**Tests:** `src/audio/sounds.test.ts` (8 tests), `src/hooks/useGameFeedback.test.ts` (24 tests), plus `src/components/GameScreen.test.tsx` updated (mock for `../audio/sounds`, 5 new integration tests). 462 total tests pass. Build clean.

**Decisions made:**
* Singleton init uses `undefined` (not attempted) vs `null` (unavailable) to avoid re-trying on every call while still lazily deferring the `new AudioContext()` until first use.
* Tap suppression on completing move achieved purely by checking `phase === 'playing'` — no special-case logic needed, because React batches the `moveCount++` and `phase→'validating'` into a single render.
* `prevMoveCount` and `prevPhase` refs are updated after the condition check, so settings-driven re-runs of an effect never re-fire the sound (previous value already matches current value).
* `playUnderPar()` starts 850ms into the timeline so it layers after the chime's three notes without overlap.

### 2026-06-02 — TER-301 closed by Opus

Reviewed (settings persistence + hook + SettingsScreen + wiring; allowlist-clean; CI 426); two nits carried into TER-310 (Label-in-Name, vibrate teardown). Issue map: TER-301 ✅ In Review → ✅ Done (PR #73).

### 2026-06-04 — TER-310 closed by Opus

Reviewed (Web Audio engine no-op-safe, useGameFeedback orchestrator, GameScreen wiring, carried TER-301 fixes; allowlist-clean; CI 462); two non-blocking nits logged (dead mocked-AudioContext test block, rare under-par/dailyPar race). Issue map: TER-310 ✅ In Review → ✅ Done (PR #74).

### 2026-06-04 — [TER-311](https://linear.app/terenc/issue/TER-311) Admin metrics dashboard at /tabs — Option B (Claude Code / Sonnet 4.6)

Stood up the internal admin metrics page at `/tabs`. Unguarded (anon aggregates RPC, no auth). Read-only.

**What shipped:**
* `supabase/migrations/20260604000000_admin_metrics_rpc.sql` — `public.get_admin_metrics()` RPC: `security definer`, `set search_path = ''`, granted to `anon`. Returns `unique_players`, `total_submissions`, and `by_day` (last 90 days, newest first). No `user_id` in output.
* `src/backend/getAdminMetrics.ts` — `getAdminMetrics(): Promise<AdminMetrics | null>`. Guards on `supabase !== null`, validates shape, returns `null` on any failure, never throws. Mirrors `getStanding` / `getDailyPar` pattern.
* `src/components/AdminDashboard.tsx` — on mount calls `getAdminMetrics()`; shows loading → two totals + per-day table; shows "Metrics unavailable" on `null`. Brand tokens (`bg-paper dark:bg-ink`, `text-ink dark:text-paper`). No game imports beyond the metrics reader.
* `src/main.tsx` — pathname branch: `window.location.pathname === '/tabs'` renders `<AdminDashboard />`, else `<App />`. Both wrapped in existing `StrictMode`.
* `vercel.json` — created (did not previously exist). One rewrite: `{ "source": "/tabs", "destination": "/index.html" }`. Targeted to `/tabs` only; does not alter `/` behavior.

**Tests:** `src/backend/getAdminMetrics.test.ts` (11 tests), `src/components/AdminDashboard.test.tsx` (5 tests). 478 total tests pass; build clean.

**Decisions made:**
* `vercel.json` created from scratch (no prior file to merge).
* `main.tsx` pathname check uses `window.location.pathname` directly — no router dependency per spec.
* `by_day` table hidden when empty (no table rendered for `by_day: []`).

**Deploy note for Chris:** apply `supabase/migrations/20260604000000_admin_metrics_rpc.sql` to Supabase before visiting `/tabs`; Vercel deploy does not auto-apply migrations.

### 2026-06-04 — [TER-313](https://linear.app/terenc/issue/TER-313) Screen transitions: fade between views + Summary (Claude Code / Sonnet 4.6)

Added CSS-only screen fade transitions. No animation library, no JS animation logic.

**What shipped:**
* `src/index.css` — `@keyframes screenFade` (opacity `0→1`, `translateY(6px→none)`, 180ms ease-out) + `.screen-fade` rule scoped under `@media (prefers-reduced-motion: no-preference)`. Under `prefers-reduced-motion: reduce` the class is a no-op; no separate JS check needed.
* `src/App.tsx` — all screen conditionals wrapped in `<div key={view} className="screen-fade">` inside `<main>`. The `key={view}` remounts the wrapper on every view change so the animation replays. The fixed `ThemeToggle` overlay stays outside this wrapper and never animates on navigation.
* `src/components/GameScreen.tsx` — `phase === 'complete'` branch wraps `<Summary>` in `<div className="screen-fade">` so Summary fades in after tap-to-advance. The row-glow sweep and "Tap to continue" button are untouched.

**Tests:** 2 new tests in `App.test.tsx` (screen-fade class on wrapper at initial render and after navigation), 1 new test in `GameScreen.test.tsx` (screen-fade class on Summary container after completion). 481 total tests pass; build clean.

**Decisions made:**
* CSS-only under `@media (prefers-reduced-motion: no-preference)` — consistent with the `rowGlow` sweep approach from TER-153; no animation library.
* `key={view}` on the wrapper div is sufficient to remount and replay on every view change without additional state.
* ThemeToggle is already in a fixed overlay div outside `<main>`, so it naturally escapes the fade wrapper with no structural change needed.

### 2026-06-04 — TER-311 closed by Opus — PR #76 merged + get_admin_metrics() migration applied. Reviewed (RPC verbatim, null-safe reader, dashboard, pathname branch + rewrite; allowlist-clean; CI 478). Notes: anon-callable by design (Option B), bare-path match. Issue map (Unscheduled): TER-311 ✅ In Review → ✅ Done (PR #76).

### 2026-06-04 — TER-313 closed by Opus — PR #77 merged. Reviewed (CSS-only fade, motion-safe gating, keyed App wrapper, Summary wrapper composing after the sweep; allowlist-clean; CI 481). Completes the pre-launch feel floor (TER-301 + TER-310 + TER-313); cascade/tutorial/breathing-room remain post-launch in TER-154. Issue map: TER-313 moved Unscheduled → M4, ✅ In Review → ✅ Done (PR #77).

### 2026-06-04 — [TER-240](https://linear.app/terenc/issue/TER-240) 6×6 par budget bump (Claude Code / Sonnet 4.6)

Raised the 6×6 solver time budget from 30s to 90s and made the 8×8 budget explicit `0` in `scripts/compute-par.ts`.

**What shipped:**
* `scripts/compute-par.ts` — replaced `export const BUDGET_MS = 30_000` with `export const BUDGET_MS_BY_SIZE: Record<4 | 5 | 6 | 8, number> = { 4: 30_000, 5: 30_000, 6: 90_000, 8: 0 }`. Per-size loop now calls `solveWithFallback(puzzle, BUDGET_MS_BY_SIZE[size])`. No other changes to solver, generator, upsert logic, or client path.

**Tests:** 481 total tests pass; build clean. `compute-par.ts` is an offline ops script with no automated CI coverage (same posture as TER-222 / TER-314).

**Decisions made:**
* 8×8 budget set to `0`. The existing `solveWithFallback` guard already short-circuits on `gridSize === 8` before calling the solver (OOM protection), so budget=0 is defense-in-depth. Identical output (soft par, `proven:false`), saves ~30s/day of pointless search.

**Post-merge ops required (Chris):**
1. Delete future 6×6 rows: `delete from daily_par where grid_size = 6 and date >= current_date;`
2. Run `compute-par` workflow via `workflow_dispatch` (push trigger will also fire on merge).
3. Re-count proven/fallback: `select count(*) filter (where proven) as proven_days, count(*) filter (where not proven) as fallback_days, count(*) as total_days from daily_par where grid_size = 6;`

### 2026-06-04 — [TER-321](https://linear.app/terenc/issue/TER-321) Set LAUNCH_DAY to 2026-06-04 (Claude Code / Sonnet 4.6)

Set the submission floor to the real go-live date so pre-launch test-window days can't seed the live leaderboard via late retry-queue submissions.

**Files changed:**
* `supabase/functions/submit-score/validate.ts` — `LAUNCH_DAY` updated from `'2026-05-25'` (placeholder) to `'2026-06-04'` (go-live date). One-line change; no other logic altered.
* `supabase/functions/submit-score/validate.test.ts` — `faithfulDailyFixture` start date changed from hardcoded `'2026-05-25T00:00:00Z'` to `` `${LAUNCH_DAY}T00:00:00Z` `` so it remains relative to the imported constant. All six `validateSubmission` reject-path fixtures (future-day, eventLog cap, board mismatch, moveCount mismatch, elapsedMs below floor, elapsedMs above ceiling) updated from seed `'RYGO-2026-05-25'` / `serverToday '2026-05-25'` to `'RYGO-2026-06-04'` / `'2026-06-04'` so they test the intended rejection reason rather than landing on the launch-floor rejection.
* `docs/RYGO_CONTEXT.md` — `LAUNCH_DAY` constant in the architecture note updated; TER-321 added to Unscheduled issue map as ✅ In Review.
* `docs/RYGO_SESSION_LOG.md` — this entry.

**Tests:** 26/26 Deno validator tests pass; 481/481 npm Vitest tests pass; build clean.

**Decisions made:**
* Only `validate.ts` and `validate.test.ts` changed — no client code, no `ELAPSED_FLOOR_MS`, no other validator logic.
* `faithfulDailyFixture` made relative to the imported `LAUNCH_DAY` constant so future floor moves don't require fixture date updates again.
* `parsePayload`-only tests retain `'2026-05-25'` seeds — `parsePayload` doesn't check `LAUNCH_DAY`, so those tests are unaffected and their dates are correct for what they test.
* Before-floor reject test retains `pre = '2025-12-31'` — clearly below any plausible floor, no update needed.
* Auto-deploys to Supabase via `deploy-functions.yml` on merge (no manual deploy needed per TER-295).
