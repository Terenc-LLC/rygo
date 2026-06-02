# Terenc Development Process (org-level standard)

# Terenc Development Process

> **Status:** v2.6 — June 2, 2026 (Opus authors all repo-doc edits but never hand-applies them — Code or Chris applies in a docs-only PR; finishes the v2.5 author/apply split and removes residual "Opus opens/pushes docs PRs" language)
> **Scope:** Standard process for any software project at Terenc that follows the Opus + Claude Code + Chris collaboration model.
> **Note:** This document is canonical at `docs/Terenc-Development-Process.md` in each Terenc software project's repo. It is referenced from every project's context document and pinned in each project's [claude.ai](<http://claude.ai>) project knowledge.

This document captures how Chris (founder), Claude Opus (architecture / planning / review), and Claude Code (implementation) build software together. **Read this before starting any session.** It exists so we don't have to re-explain the workflow each time.

## The five phases

### 1\. Architecture

**Owner:** Opus + Chris.

Before any code is written, we have a design conversation covering:

* **User journey** — what the human does, step by step.
* **Data flow** — where data lives, how it moves, what shape it takes.
* **Failure modes** — what breaks, what the user sees when it does.
* **Definition of done** — what "complete" looks like for this feature.

For new feature areas, Opus is expected to ask EPC-operator-style questions before writing any implementation prompts. Architecture conversations precede issue creation, not the other way around.

**Output:** a design document (Markdown) saved at `docs/<feature>.md` in the project repo. Opus opens a docs-only PR; Chris merges. The document becomes the source of truth for the feature.

### 2\. Issue creation

**Owner:** Opus.

Opus drafts Linear issues for Claude Code to execute. Each issue includes:

* **Title** — clear statement of what is being built.
* **Context** — links to the relevant design doc(s) and the project context document (GitHub `docs/` paths, not Linear).
* **Acceptance criteria** — observable, testable, specific.
* **Definition of done** — what the system looks like after this issue ships.
* **Scope guardrails** — what is *not* in this issue.
* **Workflow & close-out checklist** — the v2.3 close-out checklist below, pasted **inline and verbatim** into every issue body.

Issues are sized so Code can complete them in a single focused session. If an issue feels like it's growing beyond a session, it gets split.

**Inline checklist rule (added v2.3):** Issue descriptions MUST contain the close-out checklist inline, verbatim. Linking to this Process doc is supplemental, not substitutive — past sessions have shown that Code follows literal instructions in the issue body more reliably than instructions referenced via document ID. Linear's API silently truncates long descriptions and may collapse list items when several `TER-XXX` references appear in one paragraph; mitigate by spreading cross-issue references across separate sentences, splitting across multiple `save_issue` calls, or pinning the checklist as a comment if the description hits the truncation threshold.

## Operating modes (added v2.3)

Two equally-supported modes for running Phase 3:

* **Manual mode** (original): Opus drafts issue → Chris hands to Code interactively → Chris paces the loop turn by turn. Suitable for new feature areas, complex specs, or any session where Chris wants to observe Code's reasoning in real time.
* **Autonomous Todo-queue mode**: Chris launches Code with a standing prompt to "pick highest-priority Todo, execute the full v2.3 cycle, stop at In Review." Code self-orchestrates a single issue per launch with no Chris involvement until In Review. Suitable only for issues with locked specs and no open design questions.

**Constraint (both modes):** Code sessions run serially. Never launch a second Code session while one is active. Concurrent sessions touching the same files would create branch conflicts at merge time; serial sessions also keep the doc-update flow simple. (v2.4 sidenote: now that the context doc lives in git rather than Linear, the failure mode is a surfaced merge conflict rather than a silent last-write-wins clobber — but serial sessions remain the recommended hygiene.)

**Standing prompt for autonomous mode** (template — adapt per project):

```
Read the project context doc fresh from GitHub main (Terenc-LLC/[REPO]/docs/[PROJECT]_CONTEXT.md) and the org Process doc at Terenc-LLC/[REPO]/docs/Terenc-Development-Process.md.

Find the highest-priority issue in Todo status in the [PROJECT] Linear project. If none, stop and report.

Move the issue to In Progress. Read it in full plus any linked design docs.

Pull latest main locally. Create the feature branch from there using the issue's gitBranchName.

Execute per the v2.3 close-out checklist embedded in the issue body. STOP at In Review. Do not merge. Do not move to Done.

If you hit any decision not covered by the issue spec or source-of-truth docs, stop and post a Linear comment asking Opus. Do not guess.
```

### 3\. Implementation

**Owner:** Claude Code.

This is the phase that has the most failure modes, so the workflow is prescriptive.

#### Code's session checklist

At the **start** of every session, Code:

1. Reads the project context document from GitHub main (e.g., `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md`).
2. Reads the assigned Linear issue and any linked design docs (linked design docs may be GitHub paths or Linear documents — follow the link).
3. **Moves the Linear issue from Backlog/Todo to "In Progress."**
4. **Pulls the latest `main`** and creates a feature branch using the Linear-provided `gitBranchName` (visible on every issue). Pulling main here is what picks up any docs-only PR Opus has merged since Code's last session.

During the session, Code:

5. Implements the feature on the feature branch. **Never commits directly to** `main`.
6. Runs tests appropriate to the change (unit, integration, manual sanity).
7. **Updates the project context document.** Only the sections explicitly allowlisted in the next section of this document — never the locked decisions or open questions. Edits land in `docs/[PROJECT]_CONTEXT.md` on the feature branch and are part of the issue's PR.

At the **end** of the session, Code:

 8. Pushes the feature branch to GitHub.
 9. **Opens a pull request** against `main`. PR title is the issue ID + short description (e.g., `TER-133: Add color placement engine`). PR description references the Linear issue URL and summarizes what changed.
10. Confirms CI passes on the PR. If CI fails, Code investigates and fixes before continuing.
11. Posts a status comment on the Linear issue describing what was done, what was tested, decisions made, and any blockers or surprises. Includes the PR URL.
12. **Moves the Linear issue from "In Progress" to "In Review."**
13. **STOPS.** Code does not move issues to Done. Code does not merge PRs. Both are handled later in the human + Opus loop.

#### Code never does these things

* Pushes directly to `main`.
* Moves an issue to "Done."
* Merges a PR.
* Edits any non-allowlisted section of the context document (see below).
* Originates changes to locked context-doc sections or the org Process doc. Code *applies* such edits only when Opus authors the exact text and authorizes it in the issue/instructions (v2.5); Code never originates them.
* Invents architecture decisions that aren't in the design doc. If Code hits an unspecified decision, Code stops and asks via Linear comment.

### 4\. Review

**Owners:** Opus (technical review) + Chris (manual testing).

When Code moves an issue to "In Review," both Opus and Chris are notified by virtue of Chris seeing it in his inbox.

#### Opus reviews

* Reads the PR diff, files list, and check-run status via GitHub MCP tools (`pull_request_read` with `get_diff` / `get_files` / `get_check_runs`), the Code session summary on the Linear issue, and the project context document from GitHub main. (v2.4: PR review pulls directly from GitHub — no "Chris pastes key files if necessary" fallback.)
* Verifies acceptance criteria are met item by item.
* Verifies the context document was updated additively in allowlisted sections only (locked decisions and open questions still present).
* Flags issues, gaps, or improvements as Linear comments on the issue.
* If technical issues are found, recommends moving the issue back to "In Progress" with notes on what to fix.
* If the implementation looks correct, signals "ready for manual testing" or "ready to merge" in a Linear comment.

#### Chris does manual testing and merges

* Performs the manual verification steps listed in the issue.
* Plays / uses the feature for things automated tests can't catch (UX feel, layout on actual devices, accessibility in real settings).
* If pass: Chris merges the PR on GitHub. Then **tells Opus the PR is merged** (e.g., in chat: "PR for TER-NNN is merged").
* If fail: Chris comments on the issue, moves back to "In Progress," and Code addresses the feedback in a new commit on the same branch.

### 5\. Close-out

**Owner:** Opus (acting on Chris's merge confirmation).

When Chris reports a PR is merged, Opus:

* Marks the Linear issue as **Done.**
* Determines whether the merged change requires updates to locked sections of the project context document or to this Process doc (Project identity, Tech stack, Source-of-truth references, etc. — sections Code is not permitted to edit). If yes:
  * **Authors the exact edits** (find/replace blocks + appends) and hands them to Code or Chris to apply as a **docs-only pull request** against `main`, branch `opus/docs-<short-description>` (e.g., `opus/docs-ter148-closeout`). Opus does not open or push the PR itself.
  * Touches only files under `docs/`. Never touches `src/`, tests, config, or app footer (footer is Code's per the existing per-session convention).
  * Pastes the close-out summary into the PR description so the change is auditable.
  * Hands off to Chris to merge. Code's next session will pull main and pick up the changes automatically (per Phase 3 step 4).
* Updates the issue map in the project context document as part of the same docs-only PR.
* Notes any drift caught during the close (e.g., status indicators on other issues that are stale, follow-ups surfaced during review).
* If a session-log entry was clobbered by a parallel branch during the in-review phase, restores it as part of the same PR.

This consolidates the close-out work in one place, removes a context switch for Chris (who's already in GitHub when he merges), and keeps every doc change auditable in git history.

## Context document — editable sections (allowlist)

This section exists because Code has, in past sessions, restructured the project context document and silently dropped locked design decisions. The fix is an explicit allowlist.

**Code may edit these sections only:**

* **Session log** (now a separate file, `docs/[PROJECT]_SESSION_LOG.md`). Append a new entry at the bottom of that file for each session. Never modify older entries.
* **Architecture notes.** Add new feature entries when a feature ships. Updating an existing entry is OK only when adding new factual information about what shipped (e.g., "now uses X library" after a dependency lands).
* **Issue map.** Update status indicators on existing entries — e.g., changing a Backlog entry to "✅ In Review" or marking a blocked issue as "✅ Unblocked." Code does NOT mark issues as Done — that's Opus's job after Chris reports a merge.

**Code may not edit these sections without explicit Opus instruction:**

* Project identity
* Tech stack (Opus updates this when a new dependency lands or a merged change requires it; Code can suggest additions in the session log)
* Source-of-truth documents
* Key design decisions (locked) — including all subsections
* Open questions
* Coding conventions
* The editable-sections allowlist itself

**If Code believes a locked decision needs to change:** Code stops, posts a Linear comment on the current issue describing the proposed change and reasoning, and waits for Opus to author the update; Code or Chris then applies it in a docs-only PR. Code does not silently restructure or remove content.

## Definition of done — close-out checklist (paste into every issue body)

This template is pasted **inline, verbatim** into every issue (v2.3 rule). **An issue is not "ready for review" by Code's standards until all of these are true:**

- [ ] Feature branch created from latest `main`, named per the Linear `gitBranchName`.
- [ ] All acceptance criteria in the issue are met.
- [ ] Tests written / updated as required by the issue.
- [ ] All tests pass locally (`npm run test` or project equivalent).
- [ ] Build passes locally (`npm run build` or project equivalent).
- [ ] Architecture notes and Issue-map status updated in `docs/[PROJECT]_CONTEXT.md` (allowlisted sections only; no edits to locked decisions or open questions), and a session entry appended to `docs/[PROJECT]_SESSION_LOG.md`.
- [ ] Branch pushed to GitHub.
- [ ] Pull request opened against `main`. Title: `TER-NNN: <description>`. Description references the Linear issue URL and summarizes what changed.
- [ ] CI checks pass on the PR (build + test workflow green).
- [ ] Status comment posted on the Linear issue with: what was done, what was tested, decisions made, PR URL.
- [ ] Linear issue moved to "In Review."
- [ ] **Code stops here.** Do not move the issue to Done. Do not merge the PR.

Chris's checklist (after Opus review):

- [ ] Manual verification steps from the issue have been performed.
- [ ] PR merged on GitHub.
- [ ] Tell Opus the PR is merged. Opus marks the issue Done and (if needed) opens a docs-only PR for locked-section updates.

## Linear state transitions

The states we use, who moves them, and when:

| State       | Who moves it              | When                                                         |
| ----------- | ------------------------- | ------------------------------------------------------------ |
| Backlog     | Opus                      | When the issue is created.                                   |
| Todo        | Opus or Chris             | Optional intermediate state for issues that are next up but not yet started. **Required for autonomous Todo-queue mode** — Code picks from Todo. |
| In Progress | Code                      | At the start of a session, after reading the issue.          |
| In Review   | Code                      | After PR is open and CI passes. Code's last action before stopping. |
| Done        | Opus                      | After Chris reports the PR is merged.                        |
| Canceled    | Chris (with Opus's input) | If the issue is no longer needed.                            |

**Rule:** Code never moves an issue to Done. Chris doesn't move issues to Done either — Opus handles it after merge confirmation.

## GitHub workflow

* `main` is protected. No direct pushes. All changes go through pull requests — including docs-only PRs that apply Opus-authored edits.
* **Branch protection rules** (configured by Chris in the GitHub repo settings):
  * Require a pull request before merging.
  * Require status checks (CI) to pass before merging.
  * The `build-and-test` job from `.github/workflows/ci.yml` is a required check.
* **Feature branches** (Code) are named per the Linear-provided `gitBranchName` field on the issue.
* **Docs-only branches** are named `opus/docs-<short-description>` (e.g., `opus/docs-ter148-closeout`, `opus/docs-process-v2.6`) — they carry Opus-authored edits and are created by whoever applies them.
* **PR titles** start with the issue ID for code PRs (`TER-133: Add color placement engine`) or `docs:` for docs-only PRs (`docs: TER-148 close-out + Process v2.4`).
* **PR descriptions** reference the Linear issue URL and summarize what changed at a high level.
* **One PR per issue** for code PRs. If scope grows, split the issue rather than mixing concerns. Docs-only PRs may bundle multiple close-outs if they land together.

## Continuous integration

Every PR runs `.github/workflows/ci.yml` which executes:

* `npm ci` (clean install of locked dependencies)
* `npm run build` (must succeed)
* `npm run test` (all tests must pass)

Until CI is green, the PR cannot merge. This is the gate that prevents broken code from reaching `main`. (Docs-only PRs run the same CI; build and test should pass trivially since no source files change.)

## Standard artifacts per project

| Artifact                                                       | Purpose                                                      | Owner                         |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| Project context document (`docs/[PROJECT]_CONTEXT.md` in repo) | Single canonical Markdown doc Code reads at session start and updates at session end (allowlisted sections only). Locked-section updates are authored by Opus and applied by Code or Chris in a docs-only PR. | Code maintains, Opus reviews. |
| Org Process doc (`docs/Terenc-Development-Process.md` in repo) | This document. Canonical copy lives in each project repo. Authored by Opus; applied by Code or Chris in a docs-only PR. | Opus.                         |
| Design docs (`docs/<feature>.md` in repo)                      | Per feature area, capturing architecture decisions and open questions. Authored by Opus; applied by Code or Chris in a docs-only PR. | Opus.                         |
| Linear project                                                 | Project-level container for milestones and issues only (documents are no longer kept in Linear; they live in the repo). | Opus creates, Chris approves. |
| GitHub repo                                                    | Code, branches, PRs, and docs. Branch protection on `main`.  | Initialized at project start. |
| CI workflow                                                    | `.github/workflows/ci.yml` — runs build + test on every PR.  | Initialized at project start. |
| [claude.ai](<http://claude.ai>) project                        | Pinned project knowledge: this Process doc and the project's stable design docs (synced from repo `docs/`). **NOT pinned:** the project context document — it changes every Code session and is fetched fresh from GitHub main at session start. | Chris creates, Opus advises.  |

## Tools

* **Linear** — projects, milestones, issues, status tracking. **No longer used for documents** as of v2.4.
* **GitHub** — code, docs, branches, pull requests, code review.
* **GitHub Actions** — continuous integration.
* **Claude Code** — implementation agent, runs in terminal or VS Code. Has Linear MCP read/write and direct git/GitHub access from its environment.
* **Claude Opus** — architecture, issue authoring, code review, document drafting, issue close-out. Runs in [claude.ai](<http://claude.ai>) with the project pinned. Has Linear MCP read/write and GitHub MCP read access (full repo). Opus **authors** repo-doc edits as text but does **not** apply them — no commits, pushes, or file writes (v2.6, superseding the v2.4 docs/-scoped write). Code or Chris applies.
* **Google Drive (Terenc workspace)** — long-term doc storage, supplementary research, deliverables.

## Principles

* **Design before code.** Always have the design conversation before writing issues.
* **One source of truth per project** — the context document at `docs/[PROJECT]_CONTEXT.md` in the repo.
* **Issues are small, atomic, and acceptance-criteria-driven.** A good issue can be picked up by Code without further clarification from Chris.
* **Issues carry their own checklist.** v2.3: the close-out checklist lives inline in the issue body, not behind a doc reference.
* **Code never invents architecture.** If Code hits an unspecified decision, it stops and asks.
* **Code never closes issues.** "In Review" is the last state Code touches.
* **Code never restructures the context doc.** Allowlisted sections only.
* **Opus never edits source.** Repo changes Opus is involved in touch only files under `docs/`.
* **Opus authors doc edits; it never hand-applies them.** Opus produces the exact edit text (find/replace blocks + appends) for any `docs/` change; Code or Chris applies it in a docs-only PR. Opus does not push, commit, or write files to the repo — the applied diff is the verification gate. (Full-file pushes from Opus's write path proved unreliable for large docs; the author/apply split is the fix, locked v2.6.)
* **Chris merges, Opus closes.** Reduces context-switching for Chris and lets Opus handle related cleanup atomically via docs-only PRs.
* **Manual testing is part of the loop.** Chris is in the verification path. Some things only humans can verify.
* **Context docs are living artifacts.** They are updated every Code session, additively, in allowlisted sections only.
* **CI is the gate.** Tests passing on Code's machine is not enough. Tests have to pass in CI for a PR to merge.
* **Serial sessions only.** No parallel Code launches; concurrent branches touching the same files create merge conflicts.

## Reliable entry points for Code

* **AXIS:** GitHub `Terenc-LLC/axis/docs/AXIS_CONTEXT.md` on `main`. Use `GitHub:get_file_contents` (owner=`Terenc-LLC`, repo=`axis`, path=`docs/AXIS_CONTEXT.md`).
* **RYGO:** GitHub `Terenc-LLC/rygo/docs/RYGO_CONTEXT.md` on `main`. Use `GitHub:get_file_contents` (owner=`Terenc-LLC`, repo=`rygo`, path=`docs/RYGO_CONTEXT.md`).
* (Future projects to be added here.)

*Note: AXIS context doc may still be in Linear at the time of v2.4 publication. Migration of the AXIS doc happens in a separate AXIS-side session. Until then, AXIS sessions should fall back to `Linear:get_document` with the legacy doc ID.*

## Changelog

* **v2.6 (June 2, 2026):** **Opus authors repo-doc edits but never hand-applies them.** Finishes the v2.5 author/apply split: Opus produces the exact edit text for any `docs/` change — context doc, this Process doc, design docs — and Code or Chris applies it in a docs-only PR. Opus no longer uses a GitHub write path to the repo; the applied diff is the verification gate. Removed the residual v2.4 "Opus opens/pushes docs-only PRs" and "write access scoped to docs/" language from Phase 5, GitHub workflow, Standard artifacts, and Tools. Motivation: unreliable full-file pushes (the v2.5 rationale) plus a clean author/apply boundary that keeps every doc change reviewable and stops Opus and Code both writing the repo.
* **v2.5 (May 25, 2026):** Two changes. (1) **Session log split into its own file** (`docs/[PROJECT]_SESSION_LOG.md`). The append-only log was roughly half the context document and its only fast-growing part; splitting it keeps `[PROJECT]_CONTEXT.md` small so locked-section close-outs are cheap, low-risk edits. Code appends session entries to the log file; Opus appends close-out entries there too. (2) **Doc edits authored by Opus, applied by Code.** Full-file pushes from Opus's GitHub MCP write path proved unreliable for large docs; going forward Opus authors the exact edits (find/replace text + appends) and Code applies them surgically in its working tree as a docs-only PR, with the PR diff as the verification gate. Opus still reviews. This supersedes the v2.4 "Opus opens docs-only PRs" mechanism for large/locked-section edits; the docs-only-PR branch/title conventions are unchanged.
* **v2.4 (May 3, 2026):** Two combined changes:
  1. **Docs migrated from Linear to repo `docs/`.** Project context documents (`docs/[PROJECT]_CONTEXT.md`), the org Process doc (`docs/Terenc-Development-Process.md`), and design docs all now live in each project's GitHub repo under `docs/`. Linear is no longer used for documents — only for issues. Reasons: git history audit trail; no more silent last-write-wins clobbering on parallel edits; docs ride with code in PRs; one source-of-truth medium for everything.
  2. **Opus opens docs-only PRs for locked-section updates.** Phase 5 close-out flow updated: when a merged change requires updates to locked sections of the context doc or to the Process doc, Opus creates a branch named `opus/docs-<short-description>`, pushes the doc changes, opens a PR titled with `docs:` prefix, and Chris merges. Opus's GitHub write access is scoped to `docs/` — never touches source. Code's next session picks up the doc changes automatically when pulling latest main (Phase 3 step 4).
  Also: Phase 4 Opus-reviews bullet now references `GitHub:pull_request_read` directly (no "Chris pastes key files if necessary" fallback). First Opus PR review using GitHub MCP was on TER-148.
* **v2.3 (May 2, 2026):** Added inline-close-out-checklist rule (Phase 2) after TER-151 process miss demonstrated that doc-reference-only checklists are not reliably followed. Added Operating modes section codifying autonomous Todo-queue mode alongside the original manual mode. Added serial-sessions principle and [claude.ai](<http://claude.ai>) project artifact to Standard artifacts. Updated Phase 5 close-out language to make explicit that Opus updates locked sections of the context doc when merged changes require it.
* **v2.2 (May 1, 2026):** Opus marks issues Done after Chris reports a merge (was: Chris moves to Done). Reduces Chris's context-switching and consolidates close-out cleanup. Updated phase 4/5, state-transition table, and Chris's checklist accordingly.
* **v2.1 (May 1, 2026):** Added explicit "Context document — editable sections (allowlist)" after second occurrence of Code silently dropping locked decisions during a doc restructure.
* **v2 (May 1, 2026):** Made the workflow prescriptive. Added GitHub workflow, CI section, Definition of done template, Linear state-transition table.
* **v1 (May 1, 2026):** Initial version.
