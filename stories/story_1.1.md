# Story 1.1: Supabase Project Setup & Base Tables

**Epic:** Epic 1 - Foundation & Infrastructure Setup
**Status:** pending
**Assignee:** backend-architect
**Dependencies:** None (first story)
**Estimated Effort:** M (1-2 days)

---

## Description

Set up the Supabase project and create all base tables as defined in the PRD and architecture document. This includes accounts, users, locations, call_logs, order_logs, reservations, and all supporting tables. This is the foundation for all data operations.

---

## Acceptance Criteria

- [ ] Supabase project created and accessible
- [ ] All base tables created with correct schemas:
  - accounts (account_id, name, created_at)
  - users (user_id, account_id, email, display_name, role, created_at)
  - locations (location_id, account_id, name, avg_spend_per_head, created_at)
  - call_logs (call_id, location_id, started_at_utc, ended_at_utc, call_status, inbound, customer_number, certus_number, corrected_duration_seconds, order_made, reservation_made, pathway_tags_formatted, recording_url, call_summary, transcription_formatted, etc.)
  - order_logs (order_id, location_id, account_id, call_id, total, subtotal, total_tax, service_charge, delivery_charge, order_status, fulfillment_type, created_at)
  - reservations (reservation_id, location_id, call_id, guest_count, reservation_datetime, average_spend_per_head, created_at)
  - account_settings (account_id, minutes_saved_baseline_seconds, revenue_mode, avg_spend_per_head, updated_at)
  - location_settings (location_id, minutes_saved_baseline_seconds, avg_spend_per_head, updated_at)
  - settings (account_id, business_hours, ai_voice, busy_mode, theme, updated_at)
  - knowledge_update_requests (id, account_id, requested_by_user_id, payload, status, created_at)
  - internal_notes (id, call_id, author_user_id, note_md, created_at)
- [ ] All foreign key constraints defined correctly
- [ ] Indexes created on primary keys and frequently queried columns
- [ ] Schema matches `supabase/schema.sql`
- [ ] Database connection works from Next.js app

---

## Technical Notes

**Reference:**
- PRD Section 4: Backend Data Model
- Architecture Section 4: Supabase Data Model & Access Layer

**Key Decisions:**
- Use UUID for all primary keys except call_logs.call_id (text)
- Use timestamptz for all timestamp fields
- Store structured settings as JSONB (business_hours, ai_voice, busy_mode)
- Use numeric(10,2) for currency fields to avoid floating point issues

**SQL File Location:** `/supabase/schema.sql`

**Example Schema Snippet:**
```sql
CREATE TABLE accounts (
  account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(account_id),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ... (continue for all tables)
```

---

## Testing Requirements

- [ ] Verify all tables exist with correct schemas
- [ ] Verify foreign key constraints work (insert orphan row should fail)
- [ ] Test connection from Next.js (write simple query)
- [ ] Verify indexes exist on key columns

---

## Related Files

- `/supabase/schema.sql` (create)
- `/docs/architecture.md` (reference)
- `/docs/prd.md` (reference)
- `/.env.local` (Supabase connection strings)
