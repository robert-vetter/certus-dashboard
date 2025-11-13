---
name: review-story
description: >
  Run a full review of an implemented story by executing tests, validating
  behavior against the PRD and architecture, and updating story + log files
  to reflect the outcome (done, changes requested, or blocked).
---

# Review Story Command

You are the `/review-story` command.

Your job is to take a **single implemented story** from `stories/story_<ID>.md`
and decide whether it is **Done**, **Needs Changes**, or **Blocked** by:

- Running tests (unit + e2e where relevant).
- Verifying behavior against:
  - `docs/prd.md` (unified PRD v1.1)
  - `docs/architecture.md` (stack + system design)
- Inspecting UX, UI, and performance where applicable.
- Logging the outcome and updating the story status and notes.

You do NOT expand scope or change the product. You judge whether the story,
as implemented, truly satisfies its requirements.

---

## 1. Invocation

### 1.1 Usage

Primary form:

    /review-story EP1-S1

Where:

- `EP1-S1` is the story ID
- The corresponding file MUST be:
  - `stories/story_EP1-S1.md`

If a file is currently open in the editor, the explicit ID in the command
takes precedence over the active file.

### 1.2 Purpose

When called, you:

1. Verify the story is ready for review (status, implementation notes).
2. Assemble all relevant context (PRD, architecture, epic, diffs).
3. Invoke the appropriate agents to:
   - Run tests and fix trivial issues.
   - Check UX/UI consistency.
   - Consider performance implications.
4. Decide: `done`, `changes_requested`, or `blocked`.
5. Update the story file and log files accordingly.

---

## 2. Preconditions & Guards

Before reviewing, you MUST enforce:

1. **Story file exists**

   - Path:
     - `stories/story_<ID>.md`

   If missing:
   - Do NOT run tests or make changes.
   - Report clearly that the story file is missing.

2. **Story status is reviewable**

   Accepted statuses (case-insensitive):

   - `Status: in_review`
   - or `Status: ready_for_review`

   If the story is still `draft`, `approved`, or `in_progress`:

   - Do NOT run a full review.
   - Suggest running `/implement-story <ID>` first.

3. **Implementation notes present**

   The story SHOULD contain sections for:

   - Implemented Changes
   - Touched Files
   - Test Coverage (even if minimal)

   If these are missing or clearly empty:

   - You may still review, but:
     - Mark this as a documentation issue in the review outcome.
     - Prefer to request updates to the story file.

4. **No obvious WIP conflict**

   - If other stories in the same epic are still implementing overlapping features,
     you may:
     - Proceed with review, but
     - Note potential conflicts in the outcome.

---

## 3. Context Assembly

You MUST gather the following before deciding the outcome:

1. **PRD**

   - `docs/prd.md`
   - Use it as the source of truth for:
     - Story’s functional requirements and acceptance criteria.
     - Page roles: Overview, Call Logs, Analytics, Configuration.
     - Data behavior: metrics, call types, minutes saved, analytics.
     - Non-functional requirements: performance, security, a11y.

2. **Architecture**

   - `docs/architecture.md`
   - Use it for:
     - Tech stack (Next.js 14, TS, Tailwind, shadcn/ui, Supabase).
     - App structure (routes under `/app`, data helpers under `/lib`).
     - Database entities: `calls_v`, `orders_v`, `reservations_v`,
       `mv_metrics_daily`, settings tables, etc.
     - BMAD + subagent operating model.

3. **Epic**

   - Find epic from story metadata, e.g. `Epic: EP2 – Call Logs & Drawer`.
   - Load the corresponding epic file from:
     - `/epics/*`
   - Ensure the story fits its epic’s goals and doesn’t contradict other stories.

4. **UX / UI Specs**

   - UX:
     - `docs/ux/page_map.md`
     - `docs/ux/user_flows.md`
   - UI:
     - `docs/ui/tokens.json`
     - `docs/ui/components_map.md`
     - `docs/ui/layout.md`
     - `docs/ui/microcopy.md`
     - `docs/ui/interaction_specs.md`

   Use these to check:

   - Information architecture (routes, navigation).
   - Visual consistency (tokens, components).
   - Interaction patterns (drawers, tabs, filters, loading states).
   - Copy and empty/error states.

5. **Decisions & Logs**

   - `docs/decisions/*.md` for:
     - Backend changes
     - Performance decisions
     - Feedback synthesis affecting this epic
   - Existing `docs/agent_logs/*` for:
     - Notes from `/implement-story`
     - Prior reviews or partial approvals

6. **Code Changes**

   - Conceptually examine:
     - Files listed under “Touched Files” in the story.
     - Any new/modified tests.
   - You are not a full diff viewer, but you use file paths and summaries
     to reason about changes.

---

## 4. Agent Orchestration

You are primarily a **QA + reviewer coordinator**. You delegate to:

### 4.1 test-writer-fixer (Primary Reviewer Agent)

Responsibilities:

- Run relevant test suites:
  - Unit tests (Vitest).
  - E2E tests (Playwright) where applicable.
- Analyze failures and:
  - Fix trivial issues.
  - Flag non-trivial failures as potential bugs or incomplete implementation.
- Identify test gaps relative to the story requirements and PRD.

When invoking:

- Provide:
  - Story content.
  - Touched files list.
  - Relevant PRD sections.
  - Any existing test files or test notes.

Expect them to:

- Document test changes.
- Report pass/fail status of:
  - Unit tests.
  - E2E tests.

### 4.2 ui-designer & whimsy-injector (UX / UI Review)

Use when the story modifies any user-facing UI:

- New or updated:

  - Pages:
    - `/overview`, `/call-logs`, `/analytics`, `/settings/configuration`
  - Components:
    - KPI tiles, tables, drawers, tabs, charts, filters, forms.
  - Microcopy:
    - Empty/error/loading states, labels, button text.

Responsibilities:

- `ui-designer`:

  - Ensure:
    - Proper use of tokens (colors, type scale, spacing).
    - Consistency with `components_map.md`.
    - Layout respects `docs/ui/layout.md`.
    - Visual hierarchy is clear and scannable.

  - Update UI docs as needed:
    - Clarify new component patterns.
    - Document reusable patterns for future stories.

- `whimsy-injector`:

  - Spot opportunities for:
    - Delightful loading, success, and error states.
    - Micro-interactions that respect performance and a11y.
  - Update `docs/ui/interaction_specs.md` with any new behaviors.

Neither agent should expand scope. They only judge and suggest how well the
story’s UI follows the established system and where minor improvements
are warranted.

### 4.3 performance-benchmarker (Performance Review)

Use when story touches:

- Overview KPIs and Recent Activities (P0 performance).
- Call Logs table / drawer.
- Analytics charts and queries.
- Any area explicitly tied to performance budgets in the PRD.

Responsibilities:

- Estimate impact of:
  - Data fetching patterns.
  - Rendering-heavy components.
- Suggest small changes (e.g., better pagination, fewer re-renders).
- Log findings in:
  - `docs/decisions/performance_<story-id>.md`

### 4.4 backend-architect (Data / Schema Review)

Use when story changes:

- `supabase/schema.sql`
- Views (e.g., `calls_v`, `orders_v`, `reservations_v`).
- `mv_metrics_daily`.
- RLS policies or settings tables.

Responsibilities:

- Confirm schema changes align with PRD.
- Verify no security or RLS regressions.
- Ensure metrics remain accurate and multi-tenant safe.
- Update architecture docs and decisions log as needed.

---

## 5. Review Workflow

You MUST follow this sequence:

### Step 1 — Mark Story as Under Review

- Update `stories/story_<ID>.md`:

  - If not already, set:

    - `Status: under_review` or `Status: reviewing`
      (choose a single convention and stick to it in the repo).

  - Add or update a section:

    - `Review Notes`:
      - Start with an empty subsection containing:
        - `Test Results:`
        - `UX/UI Notes:`
        - `Performance Notes:`
        - `Outstanding Issues:`

### Step 2 — Tests & Quality (test-writer-fixer)

Invoke `test-writer-fixer` to:

1. Run unit tests:

   - Focus on modules/components listed in “Touched Files”.
   - If the story adds a new critical flow, ensure at least one test case hits it.

2. Run e2e tests:

   - Always run the 3 PRD-mandated smoke tests when relevant:
     - Overview page load + KPIs.
     - Call Logs drawer opens and Transcript tab visible.
     - Configuration saves Business Hours and persists.
   - Run any story-specific e2e tests that were added.

3. Handle outcomes:

   - If failures are:
     - Minor and clearly test bugs or trivial implementation fixes:
       - Allow `test-writer-fixer` to fix them.
       - Rerun tests to confirm green.
   - If failures suggest:
     - Misalignment with PRD/architecture.
     - Large missing behavior.
       - Mark as `changes_requested` or `blocked`.

4. Document in the story’s `Review Notes`:

   - Which tests were run.
   - Overall pass/fail.
   - Any new tests added or updated.

### Step 3 — UX / UI Review (ui-designer + whimsy-injector)

If the story changes UI or user flows:

1. `ui-designer` checks:

   - Route/IA alignment with `docs/ux/page_map.md`.
   - Component choices vs `docs/ui/components_map.md`.
   - Tokens and layout respect `docs/ui/tokens.json` and `layout.md`.
   - Microcopy matches `docs/ui/microcopy.md`.

2. `whimsy-injector` checks:

   - If new error, loading, or success states were introduced:
     - Are they friendly and on-brand?
     - Are there small improvements or playful touches that fit the PRD’s tone?
   - If yes, they document improvements in `docs/ui/interaction_specs.md`.

3. Document summary in `Review Notes`:

   - `UX/UI Notes`:
     - “OK” if everything aligns.
     - Or list concise recommendations:
       - E.g., “Button labels need to match microcopy spec; consider adding skeleton loaders per Overview spec.”

### Step 4 — Performance Review (performance-benchmarker, conditional)

If the story impacts performance-sensitive areas:

1. `performance-benchmarker` evaluates:

   - Query usage for `mv_metrics_daily`, `calls_v`, etc.
   - Rendering overhead of new UI patterns.
   - Client–server boundaries (heavy logic should stay server-side).

2. Document:

   - Perf notes in `docs/decisions/performance_<story-id>.md`.
   - Short summary in story `Performance Notes`.

3. If they identify a P0 perf regression vs. PRD budgets:

   - Mark story as `changes_requested` or `blocked` (see Outcomes section).

### Step 5 — Backend/Data Review (backend-architect, conditional)

If backend changes are part of the story:

1. `backend-architect` ensures:

   - Schema/view changes are:
     - Correct.
     - Backward-compatible as needed.
   - Metrics and time zones align with PRD:
     - Africa/Johannesburg for analytics where relevant.
   - RLS policies remain secure and multi-tenant safe.

2. Document:

   - Data/architecture notes in `docs/decisions/<date>_<story-id>_backend.md`.
   - Short summary in story `Review Notes`.

### Step 6 — Decide Outcome

Based on all above, decide one of three:

#### Outcome A — DONE

Conditions:

- Tests (unit + e2e relevant) pass.
- Implementation matches PRD and architecture for this story.
- UX/UI is consistent with design specs (minor polish suggestions allowed but not blocking).
- No P0 performance regressions.

Actions:

- Update `stories/story_<ID>.md`:

  - `Status: done`
  - Fill out `Review Notes` sections:
    - `Test Results:`
    - `UX/UI Notes:`
    - `Performance Notes:`
    - `Outstanding Issues:` (if any minor, non-blocking items remain)

- Add entry to:

  - `docs/agent_logs/<date>_review-story_<ID>.md`:
    - Story ID and title.
    - Outcome: `done`.
    - Brief summary of checks performed.
    - Links/paths to any decision docs produced.

#### Outcome B — CHANGES REQUESTED

Conditions:

- Tests fail in a way that indicates missing/incorrect behavior.
- UX/UI deviates from PRD in ways that confuse or mislead operators.
- Performance issues breach P0 budgets but can be fixed within the same sprint.
- Documentation gaps in the story impede future maintenance.

Actions:

- Update story:

  - `Status: changes_requested`
  - Under `Review Notes`, list:
    - Exact changes requested:
      - Functional gaps.
      - UX/UI fixes.
      - Perf improvements.
      - Missing tests or doc updates.

- Add log entry:

  - `docs/agent_logs/<date>_review-story_<ID>.md`:
    - Outcome: `changes_requested`.
    - Highlight the most important blocking items.

- The next step for the team is usually to run `/implement-story <ID>` again,
  addressing the requested changes.

#### Outcome C — BLOCKED

Conditions:

- Review cannot proceed due to:
  - Broken environment (tests can’t run).
  - Missing data or base tables/views that contradict PRD/architecture.
  - Upstream architectural decision unresolved.
- Or implementing required fixes would violate PRD or system constraints.

Actions:

- Update story:

  - `Status: blocked`
  - In `Outstanding Issues:`
    - Explain clearly what blocks the story.
    - Reference any relevant decisions docs or open questions in the PRD.

- Add log entry:

  - `docs/agent_logs/<date>_review-story_<ID>.md`:
    - Outcome: `blocked`.
    - List blocking issues and suggested owner (e.g., backend-architect, product).

---

## 6. Error Handling & Edge Cases

You MUST gracefully handle:

1. **Story not in a reviewable state**

   - Do not run tests.
   - Do not change status to `done`.
   - Suggest a path:
     - e.g., “Story EP3-S1 currently has Status: in_progress. Run /implement-story EP3-S1 first.”

2. **Tests cannot be executed**

   - Clearly state:
     - What failed (e.g., Playwright install, DB connection).
   - Do not mark story as `done`.
   - Prefer `blocked` with explanation.

3. **Conflicting feedback between agents**

   - If, for example, ui-designer approves but test-writer-fixer flags serious functional issues:
     - Functional correctness takes precedence.
     - Mark `changes_requested` or `blocked` as appropriate.
     - Summarize conflict in `Outstanding Issues:`.

4. **Scope creep discovered during review**

   - If you see that the implementation:
     - Introduces unrequested features.
     - Changes behavior beyond the story’s scope.
   - Note this clearly:
     - Suggest splitting into a new story.
   - Do not auto-approve features outside the story.

---

## 7. Non-Goals & Constraints

When running `/review-story`, you MUST NOT:

- Change the PRD’s features or metrics definitions.
- Redesign flows or layouts beyond the story’s scope.
- Accept “mostly there” implementations as `done` if they break core flows.
- Bypass tests silently or misrepresent results.
- Modify `main` branch semantics or release flows; assume work is in a feature branch.

You MUST:

- Keep feedback specific, actionable, and traceable to PRD/architecture/UX specs.
- Use file-backed logs (`docs/agent_logs/*`, `docs/decisions/*`) for durable context.
- Preserve the spirit of **move fast, don’t break things** by demanding
  minimal, high-quality changes that align with the Certus Operations Dashboard goals.

---

## 8. Quick Summary (for the Controller)

After `/review-story <ID>` runs, the controller should see:

- Story `<ID>` with:
  - Updated `Status` (`done`, `changes_requested`, or `blocked`).
  - Completed `Review Notes` summarizing tests, UX/UI, perf, and outstanding issues.
- A corresponding log in:
  - `docs/agent_logs/<date>_review-story_<ID>.md`
- Optional decision docs:
  - `docs/decisions/performance_<story-id>.md`
  - or `<date>_<story-id>_backend.md`

All of this together provides a clear, auditable record of:
- What was checked.
- What passed.
- What must happen next.
