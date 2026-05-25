# RYGO — Anonymous Daily Leaderboard (Design Doc)

> **Status:** Approved (locked) — May 25, 2026 by Chris. Source of truth for the M5 leaderboard feature. The "no backend / no network" flip it required (§10) shipped in GDD v1.8 and `RYGO_CONTEXT.md` (M5 backend-flip docs PR, May 25, 2026).
> **Feature area:** First backend for RYGO. Changed the locked "no backend / no network" stance; the GDD revision (§10) landed in v1.8 ahead of M5 issue drafting.
> **Owner:** Opus (design) + Chris (decisions).

## 1. Scope

An anonymous, per-difficulty daily leaderboard. After a player completes the daily puzzle for a level, their result is submitted to a backend, server-verified, and they see their standing for that level on the Summary screen.

In scope: anonymous submission + server-side integrity, per-level boards, rank-on-Summary read, offline persist-and-retry.

Out of scope (deferred): a standalone full-leaderboard view, named handles / accounts / multi-device sync (anonymous-auth foundation is built so these are an additive upgrade later), realtime updates.

## 2. Locked decisions

- **Backend:** Supabase, paid plan.
- **Integrity model:** Option B — full-session server replay (§5). The server replays the entire meaningful-click log and recomputes the score; only `moveCount` is provably verified, `elapsedMs` is sanity-bounded.
- **Boards:** per-difficulty (Easy / Normal / Hard / Extreme are separate ladders).
- **Identity:** anonymous only for now, via Supabase anonymous auth — persistent per-device anon user, upgradeable to a real account later.
- **Offline finishers:** persist-and-retry (§6).
- **Duplicate submit:** first-write-wins on `(user, day, level)`.
- **Shared code:** single source in `src/engine/`, synced into the edge function with a CI hash-guard; drift = CI failure.
- **Non-negotiable:** gameplay never depends on the network. Generation stays client-side; submission and read are best-effort and must never block, delay, or break a play or the Summary screen.

## 3. Identity & auth

- Supabase **anonymous sign-in** on first launch issues a persistent anonymous user id; the Supabase client persists the session in localStorage.
- The anon id is the dedupe key for one-result-per-player-per-day-per-level and for "your rank."
- **Account upgrade later** (link identity) is additive — no schema change to the leaderboard, the anon id simply gains credentials.
- **Accepted limitation:** clearing storage / a new device reads as a new player. Inherent to anonymous; no cross-reset dedupe.

## 4. Data model

Single table, write-only from the edge function (service role); clients never write directly.

```sql
create table scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,              -- anon auth user
  day         date not null,              -- UTC day key, validated against the seed (not server "now")
  grid_size   smallint not null,          -- 4 | 5 | 6 | 8
  moves       integer not null,           -- server-recomputed, == client claim
  elapsed_ms  integer not null,           -- client-claimed, sanity-bounded only
  created_at  timestamptz not null default now(),
  unique (user_id, day, grid_size)        -- one per player/day/level; first-write-wins
);
```

- **The move log is NOT stored.** The server validates on submit and persists only the verified result. This keeps the table small and — importantly — avoids storing the daily solution server-side as a leak surface.
- **RLS:** no client INSERT/UPDATE policy (writes go through the edge function under service role). Reads happen through a read-only RPC, not raw table access.
- **Rank read RPC:** `get_standing(day, grid_size, moves, elapsed_ms)` → returns `{ rank, total }` in one round trip (count of strictly-better scores + 1, and the level's total entries for the day). Sort key is **moves ASC, then elapsed_ms ASC**, matching the locked scoring.

## 5. Integrity model (Option B — full-session replay)

The client submits the **ordered meaningful-click log**, not just the final board, because the score includes board-neutral clicks (color switches, hides, re-reveals) that the board alone can't prove.

**Submit payload:** auth token (→ `user_id`), `grid_size`, `day`, `eventLog`, claimed `moveCount`, claimed `elapsedMs`.

**`eventLog`** is the minimal faithful action stream — one entry per meaningful click, in order:

| Event | Payload | Score effect (server recomputes) |
|---|---|---|
| `select` | `color` | +1 if it changes the active color, else 0 |
| `reveal` | — | 0 on first reveal, +1 thereafter |
| `hide` | — | +1 |
| `tap` | `row, col` | +1 (place or same-color clear, per board state at replay time) |

**Edge function:**
1. Regenerate the puzzle: `generatePuzzle(dailySeed(day), grid_size)` using the *same deterministic generator* (the reason shared code must not drift).
2. Replay `eventLog` through a server-side mirror of the `useGame` reducer rules — maintaining board, active color, and move count exactly as the client does.
3. Accept only if **final board === target** AND **server-recomputed moveCount === claimed moveCount**.
4. Bound `elapsedMs`: reject `< floor` (anti-instant) and `> 7_200_000` (the TER-167 2h clamp); otherwise accept as-claimed.
5. INSERT; on unique-constraint conflict, no-op (first-write-wins).

**Consequence to accept:** the primary score (moves) is cheat-proof; the tiebreaker (time) is only sanity-bounded, since elapsed time can't be server-verified. Acceptable for an anonymous vanity board.

## 6. Client submit path

- Submission fires on daily completion only (practice never records, so it's excluded for free).
- **Fire-and-forget.** Never blocks the Summary render or any transition.
- On failure (offline / backend error / validation reject), enqueue the payload in a local `rygo:pending-submit` store and **retry on next app launch and next completion**. The local daily result is already recorded by TER-142; the event log is the only extra thing to persist for retry.
- **Dependency / risk:** `useGame` does **not** currently retain move history. Adding an ordered `eventLog` to the reducer touches the load-bearing hook, and the log must also survive into the `rygo:inprogress` blob (TER-167) so a backgrounded-then-resumed daily can still submit a complete log. This is the single biggest implementation risk in the feature and gets its own issue.

## 7. Client read / display

- On Summary mount (daily only), call `get_standing(...)` best-effort.
- Show "**#R of N today**" for that level under the result.
- If the read fails or the player is offline, **omit the rank line silently** — Summary always renders fully without it.
- Standalone leaderboard view deferred.

## 8. Failure modes

| Mode | Handling |
|---|---|
| Offline / backend down at completion | Enqueue `rygo:pending-submit`; retry next launch/completion. |
| Validation fails (bug or cheat) | Silent drop; result stays local. No "couldn't verify" UI at launch. |
| Time unverifiable | Bounded only (floor + 2h clamp); primary score still provable. |
| Cross-midnight finish | `day` captured at launch travels with the session; server validates `day` against the seed, not server "now." |
| Duplicate / retry submit | Unique constraint → first-write-wins, conflict is a no-op. |
| Anon id reset | New player; no cross-reset dedupe. Accepted. |
| Rank read fails | Summary omits the rank line; never blocks. |

## 9. Privacy

This introduces RYGO's first network call tied to a persistent (anonymous) id. Minor posture shift from fully-local. Needs a short disclosure line before launch (no PII collected; anonymous id only). Flagged, not blocking.

## 10. GDD revision required (before any issue)

- Flip the locked **"Anonymous, per-device only. No accounts, no backend, no cloud sync"** retention-scope line and the **"Backend: None for MVP"** tech-stack line to: client-side gameplay with an optional, best-effort backend for the leaderboard; gameplay never depends on the network.
- Add a **Leaderboard** section capturing §2–§5.
- Bump GDD to v1.8; update the context-doc Tech stack. These are locked-section edits → an Opus docs-only PR, executed only once this design is approved.

## 11. Decomposition (proposed milestone M5 — Leaderboard)

Hard-ordered; gate the whole milestone behind the quick launch-prep housekeeping (domain wiring, footer removal, `engines` lock).

1. **Backend foundation** — Supabase wiring, `scores` schema + RLS, `get_standing` RPC, anonymous-auth bootstrap on first launch.
2. **Shared-engine delivery** — sync `src/engine/` (+ generator) into `supabase/functions/_shared/` with a CI hash-guard.
3. **`useGame` event-log capture** — ordered log in the reducer + plumbing into the `rygo:inprogress` blob and resume path.
4. **Edge function** — replay validator (§5).
5. **Client submit** — fire-and-forget on completion + `rygo:pending-submit` retry queue.
6. **Client read** — rank-on-Summary via `get_standing`.
7. **(Deferred)** standalone leaderboard view.

## 12. Open questions (resolve during issue drafting, not blocking the doc)

- **Supabase client:** `@supabase/supabase-js` vs. plain `fetch`. Lean `supabase-js` — it manages the anon session/refresh, which plain fetch would force us to hand-roll. (Adds the project's first runtime dependency.)
- **`elapsed_ms` floor:** pick a conservative anti-instant floor; refine with real-play data.
- **Rate limiting:** anon-auth + unique constraint + replay validation already make spam low-value; probably no extra limit at launch. Revisit if abused.
