---
name: shard-docs
description: >
  Read docs/prd.md and docs/architecture.md, then shard them into a structured
  hierarchy of epics and stories under /epics and /stories using the po-owner
  agent. This command creates and updates the planning backbone for the Certus
  Operations Dashboard according to the unified PRD and BMAD operating model.
---

# Shard Docs Command

You are the `/shard-docs` command.

Your job is to turn the single-source specs:

- docs/prd.md (unified PRD v1.1)
- docs/architecture.md (system & agent architecture)
- and timeline.pd

into a concrete, file-backed plan consisting of:

- Epics in `/epics`
- Stories in `/stories`

You always operate through the `po-owner` agent, and you never write runtime
code directly. You only create and update planning documents.

---

## 1. Invocation

### 1.1 Usage

Default (full shard):

    /shard-docs

Focused shard by area:

    /shard-docs overview
    /shard-docs call-logs
    /shard-docs analytics
    /shard-docs configuration
    /shard-docs data
    /shard-docs testing

The optional argument acts as a filter that tells you which feature area(s) of
the PRD/architecture to shard into stories. If no argument is passed, you shard
the entire PRD and architecture into the canonical epic set for this project.

### 1.2 Purpose

When called, you:

1. Read `docs/prd.md` and `docs/architecture.md`.
2. Confirm or (if first run) create the epic structure for the Certus Operations Dashboard.
3. Generate or update epic files under `/epics`.
4. Generate or update story files under `/stories`.
5. Leave a short agent log in `docs/agent_logs/` summarizing what changed.

This establishes the planning backbone that other commands use:

- `/approve-story` (gates stories)
- `/implement-story` (implementation by dev-implementer)
- `/review-story` (QA + tests)

---

## 2. Preconditions & Guardrails

Before modifying any files you MUST enforce these:

1. PRD must exist  
   - Path: `docs/prd.md`  
   - If missing or empty:
     - Abort and write a brief note to `docs/agent_logs/`.
     - Do not create or modify any epic/story files.

2. Architecture should exist  
   - Path: `docs/architecture.md`  
   - If missing:
     - You may shard from PRD only.
     - Note this limitation in the agent log.

3. Required directories  
   Ensure these exist (create them if they don’t):

   - `/epics`
   - `/stories`
   - `/docs/agent_logs`

4. Idempotence  
   When `/shard-docs` is re-run:

   - Never duplicate epics or stories with new IDs.
   - Update existing epic/story files in place.
   - Preserve:
     - `Status:` fields (do not reset an `approved` or `in_progress` story to `draft`).
     - Custom fields like `Owner:`, `Assignee:`, or team-added `Notes:`.
   - It is allowed to:
     - Append new stories if new scope appears in the PRD/architecture.
     - Refine titles/descriptions for clarity.
     - Add missing metadata fields.

5. Status safety  
   - If a story has `Status: in_progress`, `in_review`, or `done`, you must not:
     - Change its ID.
     - Remove it.
   - If a story is `Status: draft` or `Status: backlog`, you may:
     - Tweak title/description.
     - Adjust tags and PRD references.

---

## 3. Canonical Epic Structure

You enforce a stable epic structure that matches the MVP and unified PRD:

- EP1 – Overview & Navigation  
  Overview page, KPI tiles, Recent Activities, basic shell/navigation.

- EP2 – Call Logs & Call Detail Drawer  
  Filterable logs, right-hand drawer, transcript, summary, order details,
  internal chat, customer profile panel.

- EP3 – Analytics (Topline)  
  Trends (calls/day, revenue/day, minutes_saved/day), call_type distribution,
  CSV export.

- EP4 – Configuration (Hours, Voice, Knowledge, Busy Mode, API Keys)  
  Settings forms and flows for business hours, AI voice, busy mode, knowledge
  updates, API key metadata.

- EP5 – Data & Platform (Supabase, Views, Metrics, RLS, Seed, CI/CD)  
  Supabase schema, views, mv_metrics_daily, pg_cron, seed data, RLS policies,
  CI wiring.

- EP6 – Testing, QA & Performance  
  Unit tests, Playwright smoke tests, test-writer-fixer workflows, basic
  performance guardrails.

If you’re invoked with a focused argument, you only touch epics and stories
whose scope intersects that area:

- `overview` → EP1
- `call-logs` → EP2
- `analytics` → EP3
- `configuration` → EP4
- `data` → EP5
- `testing` → EP6

You still keep epic IDs and names consistent across runs.

---

## 4. Epic File Format

Each epic lives in a separate file:

- `epics/EP1_overview-and-navigation.md`
- `epics/EP2_call-logs-and-drawer.md`
- `epics/EP3_analytics-topline.md`
- `epics/EP4_configuration-core.md`
- `epics/EP5_data-and-platform.md`
- `epics/EP6_testing-and-performance.md`

You MUST include, at minimum, this structure:

    ---
    id: EP1
    name: Overview & Navigation
    status: draft        # draft | active | completed
    owner: po-owner
    priority: P1         # P0 | P1 | P2
    related_prd_sections:
      - "2.2 Core Use Case"
      - "3.1 In-Scope"
      - "6.2 Overview Page"
    ---

    # EP1 – Overview & Navigation

    ## Objective
    Short explanation of what this epic delivers for the Certus Operations Dashboard.

    ## Scope
    - Bulleted list of in-scope features for this epic.
    - Derived from PRD + architecture.

    ## Out of Scope
    - Items explicitly not covered by this epic.

    ## Stories
    - EP1-S1 – Scaffold Next.js app, layout shell, sidebar nav
    - EP1-S2 – KPI tiles (queries + cards + skeletons)
    - EP1-S3 – Recent Activities table with call_type as first column

You must ensure the `Stories` section lists all story IDs that belong to this
epic. The details of the stories themselves are in `/stories`.

---

## 5. Story ID Scheme

You MUST follow a stable ID scheme:

- `EP<epic_number>-S<story_number_within_epic>`

Examples:

- EP1-S1
- EP1-S2
- EP2-S1
- EP3-S2
- EP5-S3

IDs must not change once created. When updating, you adjust content but not IDs.

---

## 6. Story File Format

Each story is a separate file in `/stories`:

- `stories/story_EP1-S1.md`
- `stories/story_EP1-S2.md`
- `stories/story_EP2-S1.md`
- etc.

You MUST use a consistent template that downstream commands can rely on:

    ---
    id: EP1-S1
    epic: EP1
    title: Scaffold Next.js app, layout shell, sidebar nav
    status: draft           # draft | approved | in_progress | in_review | done
    priority: P1            # P0 | P1 | P2
    size: S                 # XS | S | M | L (rough effort)
    owner: frontend-developer
    related_prd_sections:
      - "3.1 In-Scope (Overview)"
      - "5.1 Frontend Stack"
      - "6.2 Overview Page"
    related_architecture_sections:
      - "App structure (Next.js 14)"
      - "UI system (Tailwind + shadcn/ui)"
    tags:
      - overview
      - navigation
      - ui
    ---

    # EP1-S1 – Scaffold Next.js app, layout shell, sidebar nav

    ## Summary
    Short 2–4 sentence description of what this story delivers, referencing the
    specific parts of the PRD and architecture it implements.

    ## Context
    Why this story matters in the context of the Certus Operations Dashboard
    and how it connects to EP1 and the MVP.

    ## Requirements
    - Concrete, testable bullets derived from PRD & architecture.
    - No implementation details (that's for dev-implementer), but specific enough
      that approved stories can be implemented without changing scope.

    ## Acceptance Criteria
    - Given/When/Then-style bullets or clear pass/fail checks.
    - Must map to user flows and PRD acceptance criteria where applicable.

    ## Dependencies
    - Other stories or epics that must be done first (if any).

    ## Notes
    - Any extra notes from prior runs, reviews, or feedback.
    - You MUST preserve this section between runs.

Downstream commands rely on:

- `status` to know if a story is eligible for approval, implementation, or review.
- `id`, `epic`, `title` to display and filter stories.
- `related_prd_sections` and `related_architecture_sections` for traceability.

---

## 7. Default Story Set (First Full Shard)

On the first successful full run (no filter argument), you must ensure at least
this baseline set of stories exists and is aligned with the MVP and unified PRD:

EP1 – Overview & Navigation

- EP1-S1 – Scaffold Next.js app, layout shell, sidebar nav
- EP1-S2 – KPI tiles (queries + cards + skeletons; last 7 days by default)
- EP1-S3 – Recent Activities table with call_type as first column and deep-link to Call Logs

EP2 – Call Logs & Drawer

- EP2-S1 – Call Logs table with server paging, filters, and empty state
- EP2-S2 – Right-hand drawer shell with tabs (Transcript, Summary, Order Details, Internal Chat)
- EP2-S3 – Transcript tab rendering and search (based on transcript_md)
- EP2-S4 – Order Details tab (conditional on call_type = order or order exists)
- EP2-S5 – Call Summary tab with sentiment and intents
- EP2-S6 – Internal Chat (notes CRUD via server actions) and basic customer profile panel

EP3 – Analytics (Topline)

- EP3-S1 – Calls & revenue timeseries charts using mv_metrics_daily
- EP3-S2 – Minutes saved chart and call_type distribution chart
- EP3-S3 – Analytics CSV export for filtered range

EP4 – Configuration

- EP4-S1 – Business Hours form (per-location) with validation and persistence
- EP4-S2 – AI Voice selector (persist configuration only)
- EP4-S3 – Busy mode settings stub (toggle + extra wait seconds persisted)
- EP4-S4 – Knowledge Update request trigger (writes to knowledge_update_requests)
- EP4-S5 – API Keys metadata listing and revoke UI (metadata only)

EP5 – Data & Platform

- EP5-S1 – Supabase schema & views (calls_v, orders_v, reservations_v) for dashboard
- EP5-S2 – mv_metrics_daily materialized view and pg_cron refresh job
- EP5-S3 – Seed data (100–200 calls, 25 orders, 15 reservations across 14–30 days)
- EP5-S4 – RLS policies and basic account/location settings tables
- EP5-S5 – CI/CD wiring (GitHub Actions) for lint, unit, e2e; Vercel previews

EP6 – Testing, QA & Performance

- EP6-S1 – Unit tests for core components (KPI tiles, tables, drawer)
- EP6-S2 – 3 Playwright smoke tests (Overview, Call Logs drawer, Configuration persistence)
- EP6-S3 – Basic performance pass: Overview load < 2s on seeded data
- EP6-S4 – Integrate test-writer-fixer workflow for future changes

You may generate more stories as needed, but this set is the minimum baseline that
must exist after the first full `/shard-docs` run, unless the PRD explicitly
removes a feature.

---

## 8. Status Rules & Interaction With Other Commands

You must set initial statuses and respect transitions:

1. When creating new stories:
   - Set `status: draft`.

2. When `/approve-story` runs:
   - It may change `status: draft` → `approved`.

3. When `/implement-story` runs:
   - It may change `status: approved` → `in_progress` or `in_review`.

4. When `/review-story` completes:
   - It may change `status: in_review` → `done`.

You must not override these statuses back to `draft` or `approved` unless you
detect a clear structural corruption and explicitly note it in `docs/agent_logs/`.

---

## 9. Agent Log Output

After each run, you MUST append a short log file to `docs/agent_logs/`:

- File name pattern (example):  
  `docs/agent_logs/shard-docs-YYYYMMDD-HHMM.md`

Content template:

    # shard-docs run – YYYY-MM-DD HH:MM

    ## Summary
    - Sharded docs/prd.md and docs/architecture.md into epics and stories.

    ## Changes
    - Created epics: EP1, EP2, EP3, EP4, EP5, EP6 (first run).
    - Updated stories: EP1-S1, EP1-S2, EP2-S1.
    - Added new stories: EP4-S5 (API key metadata UI).

    ## Notes
    - Architecture file missing: false
    - Filter used: overview
    - Warnings: none

This log is your communication back to the controller session and future agents
so they know what changed without re-parsing all epic/story files.

---

## 10. Error Handling

If anything goes wrong, follow these rules:

1. PRD missing or unreadable
   - Do not create or update epics/stories.
   - Write a log file summarizing the issue.
   - Include a clear note: "PRD missing or unreadable; shard-docs aborted."

2. Architecture missing
   - You may shard based on PRD only.
   - Include a warning in the log file.

3. Invalid epic/story files
   - If you encounter malformed front matter or missing `id` fields:
     - Do not delete the file.
     - Create a new log entry describing:
       - File path
       - Problem detected
       - Suggested manual fix (if applicable).

4. Conflicting IDs
   - If two story files claim the same `id` with different epics:
     - Do not attempt to auto-merge.
     - Note the conflict in the log and leave files untouched.
     - Future human cleanup will be required.

---

## 11. Operating Principles

- File-backed, not chat-backed: always express structure in Markdown files, not as long chat outputs.
- Stable IDs: epic and story IDs are durable and must not be changed lightly.
- Traceability: every story links back to specific PRD and architecture sections.
- Small stories: keep stories roughly 0.5–1 day of work; split larger scope.
- BMAD-aware: optimize story shapes so that BMAD agents (backend-architect, frontend-developer, ui-designer, etc.) can take them and run with minimal reinterpretation.

By following this spec, `/shard-docs` becomes the single, deterministic entry
point for turning the Certus dashboard’s PRD and architecture into a living,
maintainable plan that the rest of the subagent team can execute on.
