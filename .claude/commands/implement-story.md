---
name: implement-story
description: >
  Implement an approved story end-to-end by coordinating the BMAD subagents,
  writing production-ready code, and updating story + log files according to
  the Certus Operations Dashboard PRD and architecture.
---

# Implement Story Command

You are the `/implement-story` command.

Your job is to take a **single approved story** from `stories/story_<ID>.md`,
implement it according to:

- `docs/prd.md`  (unified PRD v1.1)
- `docs/architecture.md`  (system architecture + stack)
- The relevant epic file in `/epics`
- Any UX/UI specs in `docs/ux/*` and `docs/ui/*`

…by invoking the **development-focused agents** (`frontend-developer`, `backend-architect`,
`rapid-prototyper`, `test-writer-fixer`, `ui-designer`, `whimsy-injector`, `performance-benchmarker`)
and then updating the story’s status and logs.

You do NOT change product scope or rewrite the PRD. You **ship the story**.

---

## 1. Invocation

### 1.1 Usage

Primary form:

    /implement-story EP1-S1

Where:

- `EP1-S1` is the story ID
- The corresponding file MUST be:
  - `stories/story_EP1-S1.md`

If a file is currently open in the editor, the explicit ID from the command
ALWAYS takes precedence.

### 1.2 Purpose

When called, you:

1. Verify the story is **approved** and **within WIP limits**.
2. Assemble all relevant context (PRD, architecture, epic).
3. Use the correct agents to:
   - Implement backend changes (if needed).
   - Implement frontend/UI changes.
   - Write or update tests.
4. Run tests and sanity checks.
5. Update the story status to `in_review`.
6. Write a short log entry in `docs/agent_logs/`.

---

## 2. Preconditions & Guards

Before doing any implementation work, you MUST enforce:

1. **Story file exists**

   - Expected path:
     - `stories/story_<ID>.md` (e.g., `stories/story_EP1-S1.md`)

   If missing:
   - Do NOT implement anything.
   - Add an error note to the controller session explaining the missing story file.

2. **Story is approved**

   - The story’s front-matter or header MUST include:
     - `Status: approved`
   - Accepted variants: `approved`, `Approved` (case-insensitive).

   If status is not approved:
   - Do NOT implement.
   - Suggest running `/approve-story <ID>` first.

3. **WIP limit not exceeded**

   - Inspect:
     - Other stories with `Status: in_progress` or `Status: implementing`.
   - If the configured WIP limit is exceeded (e.g., 2 concurrent stories):
     - Do NOT start implementation.
     - Return a short message that WIP is exceeded and list current in-progress stories.

4. **Story fields present**

   The story file MUST include, at minimum, clearly recognizable sections:

   - Summary
   - Requirements
   - Acceptance Criteria
   - Impacted Areas
   - Epic reference or link

   If any are missing or empty:
   - Do NOT implement.
   - Suggest updating the story via `/approve-story <ID>` or manual edit.

---

## 3. Context Assembly

Once preconditions are satisfied, you MUST gather the following context:

1. **PRD**

   - `docs/prd.md`
   - Use it as the **single source of truth** for:
     - Pages: Overview, Call Logs, Analytics, Configuration
     - Data behavior (metrics, call types, analytics)
     - Constraints and non-goals
     - KPIs and performance budgets

2. **Architecture**

   - `docs/architecture.md`
   - Use it for:
     - Tech stack (Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase)
     - App structure:
       - `/app/(dashboard)/overview/page.tsx`
       - `/app/(dashboard)/call-logs/page.tsx`
       - `/app/(dashboard)/analytics/page.tsx`
       - `/app/(settings)/configuration/page.tsx`
     - Data access patterns:
       - `/lib/queries/*`
       - `/supabase` schema + views + MV
     - BMAD + agent model expectations

3. **Epic**

   - Determine epic from story metadata, e.g.:
     - `Epic: EP1 – Overview & Navigation`
   - Load the matching epic file:
     - `epics/EP1-overview-and-navigation.md` (example naming)
   - Use epic context to align the story’s implementation with its neighbors.

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

   Use these to ensure:
   - Routing matches IA
   - Components are consistent with design system
   - Microcopy and interaction patterns follow specs

5. **Decisions & Logs**

   - `docs/decisions/*.md` (data, perf, UX decisions)
   - Existing `docs/agent_logs/*.md` for this epic/story (if any)

---

## 4. Agent Orchestration

You do NOT implement everything yourself. You orchestrate the appropriate agents:

### 4.1 Primary Agent: frontend-developer

- Responsible for:
  - Implementing or modifying:
    - `/app` routes
    - `/components` UI components
    - `/lib` query helpers and server actions
  - Following PRD + architecture closely
  - Maintaining type safety and tests

- Invocation pattern:
  - Provide:
    - Story file content
    - Relevant PRD sections
    - Relevant architecture sections
    - Any related UX/UI specs

- Require them to:
  - Propose a minimal implementation plan inside the story or a short note
  - Implement in small, coherent commits (conceptually)
  - Keep diffs focused on the story’s scope

### 4.2 Supporting Agent: backend-architect

Use when the story requires backend/data changes:

- E.g., new columns in `calls_v`, new fields in `mv_metrics_daily`,
  new tables like `internal_notes`, or changes in `account_settings`.

- Scope:
  - `supabase/schema.sql`
  - `supabase/policies.sql`
  - `supabase/seed.sql`
  - Relevant sections in `docs/architecture.md`
  - ADRs in `docs/decisions/*.md`

- Rules:
  - Never change base tables in a way that contradicts the PRD.
  - Always keep RLS and security considerations intact.
  - Coordinate with `frontend-developer` so frontend and backend match.

### 4.3 Optional Speed Agent: rapid-prototyper

Use when:

- Story implies a new page or major UI structure (e.g., first version of `/overview`).
- You want a quick scaffold before refining.

Responsibilities:

- Scaffolds:
  - Route files
  - Initial component shells (with Tailwind + shadcn)
  - Basic data fetching stubs (e.g., placeholder queries returning fake data)

After scaffolding:

- Hand off to `frontend-developer` for productionization:
  - Real query wiring
  - State handling
  - Error/loading states
  - Tests

### 4.4 Testing Agent: test-writer-fixer

Always use this agent before marking a story as `in_review`.

Responsibilities:

- Create or update:
  - Unit tests (Vitest + Testing Library) for:
    - Components
    - Query utilities
  - E2E tests (Playwright) IF the story touches one of the 3 required smoke flows,
    or adds a new critical flow.

- Tasks:
  - Ensure new code paths are covered by at least basic tests.
  - Fix minor issues in implementation that tests reveal.
  - Do NOT weaken tests just to make them pass.

### 4.5 Design Agents: ui-designer & whimsy-injector

Use when:

- The story introduces or significantly alters UI:
  - New KPIs
  - New table columns
  - New drawers/tabs
  - New empty/error/loading states

Responsibilities:

- `ui-designer`:
  - Update tokens/components specs if needed.
  - Ensure visual changes are consistent with design system.
  - Adjust `docs/ui/components_map.md` and `docs/ui/layout.md`.

- `whimsy-injector`:
  - Propose or refine micro-interactions and playful touches IF:
    - Story includes new interactive UI (buttons, drawers, loading states).
  - Update `docs/ui/interaction_specs.md`.

Their output informs `frontend-developer` but they do not modify code directly.

### 4.6 Perf Agent: performance-benchmarker

Use when story affects:

- Overview page performance
- Call Logs table performance
- Analytics queries
- Anything within the PRD’s P0 perf budgets (<2s Overview, <400ms drawer)

Responsibilities:

- Quick profiling:
  - Query complexity
  - Rendering cost of components
- Writes:
  - `docs/decisions/performance_<story-id>.md`
- Suggest simple improvements (indexing, memoization, batching) when needed.

---

## 5. Implementation Workflow

You MUST follow this sequence:

### Step 1 — Mark Story as In Progress

- Update `stories/story_<ID>.md`:
  - `Status: in_progress` (or `implementing` consistent with project convention)
  - Add a short `Implementation Notes` section if missing.

- Add a bullet list summarizing:
  - Expected code touch-points (`/app`, `/components`, `/lib`, `/supabase`, etc.)
  - Any external constraints (perf budgets, data shape)

### Step 2 — Backend/Data (if needed)

If the story involves data changes, coordinate:

1. Invoke `backend-architect` with:
   - Relevant PRD sections
   - Architecture excerpts (data model, views, MV)
   - Story requirements

2. Apply backend changes:
   - Update `supabase/schema.sql` or views.
   - Update `supabase/policies.sql` if RLS impacted.
   - Update `supabase/seed.sql` to provide representative seed data.

3. Ensure:
   - Changes are consistent with:
     - `calls_v`, `orders_v`, `reservations_v`
     - `mv_metrics_daily`
   - No contradictions with PRD definitions.

4. Note any architectural decisions in:
   - `docs/decisions/<date>_<story-id>_backend.md`

### Step 3 — Frontend Implementation

Invoke `frontend-developer` to:

1. Map story to concrete UI behavior:
   - Which route(s) are affected:
     - `/overview`, `/call-logs`, `/analytics`, `/settings/configuration`
   - Which components:
     - `KpiTile`, `DataTable`, `CallDrawer`, `TranscriptView`, `Chart`, `Filters`, etc.
   - Which query helpers in `/lib/queries`.

2. Implement code changes:
   - Create/modify:
     - Server components for data fetching.
     - Client components for rendering and interaction.
     - Server actions for mutations (e.g., internal notes, settings).

3. Respect:
   - Design tokens from `docs/ui/tokens.json`.
   - Component mapping from `docs/ui/components_map.md`.
   - Layout + microcopy from `docs/ui/*`.
   - Perf budgets from PRD.

4. Ensure:
   - Type-safe code (TypeScript).
   - Clear separation between:
     - UI components
     - Data fetching
     - Business logic helpers

### Step 4 — Testing

Invoke `test-writer-fixer` to:

1. Add/Update unit tests for:
   - Newly created components.
   - Updated utilities/queries.

2. Add/Update E2E tests if:
   - The story touches one of the main flows:
     - Overview load
     - Call Logs drawer
     - Configuration persistence
   - Or introduces a new critical flow that should be smoke-tested.

3. Run tests via `Bash`:
   - Example commands:
       - `npm test` or `npm run test`
       - `npm run e2e` or `npm run e2e:smoke`

4. Fix minor functional issues found by tests.
   - Do NOT bypass failing tests without explanation.

### Step 5 — Perf & Polish (Conditional)

If story impacts performance-sensitive areas:

1. Invoke `performance-benchmarker`.
2. Evaluate:
   - Query performance.
   - UI rendering time.
3. Apply simple improvements where needed:
   - Index addition suggestions.
   - Pagination tuning.
   - Memoization / splitting components.
4. Document findings in:
   - `docs/decisions/performance_<story-id>.md`.

### Step 6 — Update Story & Logs

After successful implementation and tests:

1. Update `stories/story_<ID>.md`:

   - Set:
     - `Status: in_review`
   - Add/Update sections:
     - `Implemented Changes`
       - Bullet list of key functional changes.
     - `Touched Files`
       - List paths (e.g., `/app/(dashboard)/overview/page.tsx`, `/lib/queries/metrics.ts` etc.)
     - `Test Coverage`
       - Brief note of:
         - Unit tests added/updated.
         - E2E scenarios updated/added.

2. Append a new log entry to:
   - `docs/agent_logs/<date>_implement-story_<ID>.md`

   Include:
   - Story ID and title.
   - Summary of what was implemented.
   - Any follow-up tasks/risks.
   - Reference to performance decisions (if any).

---

## 6. Error Handling & Edge Cases

You MUST handle these gracefully:

1. **Story not approved**
   - Do not modify code.
   - Return a short explanation:
     - e.g. “Story EP2-S3 is not approved. Current status: draft. Please run /approve-story EP2-S3 first.”

2. **WIP limit exceeded**
   - List current in-progress stories.
   - Suggest:
     - Completing or moving a story to `in_review` before starting another.

3. **Conflicting story scopes**
   - If another in-progress story clearly touches the same feature/file:
     - Add a note in the story’s `Risks` section.
     - Avoid large refactors; keep changes as localized as possible.

4. **Backend changes rejected by policies**
   - If RLS or constraints conflict with proposed schema changes:
     - Do not hack around security.
     - Document the issue in:
       - `docs/decisions/<date>_<story-id>_backend.md`
     - Surface a clear message to the controller session.

5. **Tests cannot be run**
   - Describe:
     - Why tests couldn’t be executed (e.g., missing Playwright, broken script).
   - Mark in story as:
     - `Status: in_review` but add:
       - `Testing Blockers` note.
   - Do NOT claim tests have passed if they haven’t.

---

## 7. Non-Goals & Constraints

When running `/implement-story`, you MUST NOT:

- Change product scope or rewrite PRD.
- Modify `docs/prd.md` except for trivial typo fixes (if absolutely necessary).
- Introduce new pages or features unrelated to the story ID.
- Bypass tests or performance guidelines without a documented reason.
- Edit `main` and feature branches semantics; assume work happens on a feature branch
  and will be merged via PR and code review.

You MUST:

- Keep changes tightly scoped to the story’s requirements.
- Follow the stack and patterns defined in `docs/architecture.md`.
- Respect BMAD and file-backed context conventions.

---

## 8. Quick Summary (for the Controller)

When `/implement-story <ID>` completes successfully, the controller should see:

- Story `<ID>`:
  - Status: `in_review`
  - Implemented Changes: filled
  - Touched Files: listed
  - Test Coverage: described

- New or updated logs:
  - `docs/agent_logs/<date>_implement-story_<ID>.md`
  - Optional: `docs/decisions/*` if data or performance decisions were needed.

All code changes should be ready for human review and aligned with
the Certus Operations Dashboard PRD and architecture.
