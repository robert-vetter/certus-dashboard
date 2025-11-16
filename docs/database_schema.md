# Database Schema Reference

**Version:** 1.0
**Last Updated:** 2025-11-15
**Purpose:** Complete reference of all Supabase tables, views, and materialized views

---

## Table of Contents

1. [Core Tables](#core-tables)
   - [accounts](#accounts)
   - [locations](#locations)
   - [call_logs](#call_logs)
   - [order_logs](#order_logs)
   - [reservations](#reservations)
2. [Supporting Tables](#supporting-tables)
   - [complaints](#complaints)
   - [deliveries](#deliveries)
   - [order_errors](#order_errors)
   - [upsells](#upsells)
   - [daily_call_reports](#daily_call_reports)
3. [Views](#views)
   - [calls_v](#calls_v)
   - [orders_v](#orders_v)
   - [reservations_v](#reservations_v)
4. [Materialized Views](#materialized-views)
   - [mv_call_events](#mv_call_events)

---

## Core Tables

### accounts

Top-level organization/business entity.

```sql
create table public.accounts (
  account_id uuid not null default gen_random_uuid (),
  dashboard_account_id text null,
  display_name text not null,
  legal_name text null,
  billing_email text null,
  primary_contact_user_id uuid null,
  default_time_zone text null,
  default_currency text null,
  billing_provider text null,
  billing_customer_id text null,
  status public.account_status null default 'active'::account_status,
  onboarding_started_at timestamp with time zone null default now(),
  onboarding_completed_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  notes text null,
  onboarding_form_id text null,
  onboarding_form_user_uuid text null,
  primary_contact_name text null,
  primary_contact_number text null,
  primary_contact_email text null,
  multi_location_unified_menu_use boolean null default false,
  single_inbound_number_location_resolution_method text null,
  constraint accounts_pkey primary key (account_id),
  constraint accounts_billing_customer_uniq unique (billing_provider, billing_customer_id),
  constraint accounts_primary_contact_user_id_fkey foreign KEY (primary_contact_user_id) references users (user_id)
) TABLESPACE pg_default;

create unique INDEX IF not exists accounts_billing_email_uidx on public.accounts using btree (lower(billing_email)) TABLESPACE pg_default;

create index IF not exists accounts_display_name_idx on public.accounts using btree (lower(display_name)) TABLESPACE pg_default;
```

**Key Fields:**
- `account_id` - Primary key
- `display_name` - Business name shown in UI
- `status` - Account status enum
- `default_time_zone` - Used for date/time localization
- `default_currency` - Used for monetary displays

---

### locations

Restaurant/store locations belonging to an account.

```sql
create table public.locations (
  location_id uuid not null default gen_random_uuid (),
  account_id uuid not null,
  name text null,
  address text null,
  phone_public text null,
  ai_number text null,
  phone_soft_launch text null,
  time_zone text null,
  operating_hours text null,
  does_delivery boolean null default false,
  accepts_orders boolean null default true,
  accepts_reservations boolean null default false,
  takes_card_over_phone boolean null default false,
  uses_3rdparty_delivery boolean null default false,
  currency text null,
  delivery_range_value real null,
  delivery_range_unit text null,
  avg_prep_time_min integer null,
  peak_hour_wait_time integer null,
  ai_name text null,
  sms_webhook_url text null,
  sms_from_number text null,
  google_drive_folder_id text null,
  latitude numeric(9, 6) null,
  longitude numeric(9, 6) null,
  billing_ok boolean null default true,
  status text null default 'onboarding'::text,
  created_at timestamp with time zone null default now(),
  busy_mode_status text null,
  busy_mode_minute_delay integer null,
  city_state text null,
  dashboard_location_id text null,
  operating_hours_exceptions text null,
  peak_hour_times json[] null,
  operating_hours_json json null,
  onboarding_form_user_uuidd text null,
  dashboard_account_id text null,
  avg_spend_per_head integer null,
  dashboard_certus_id text null,
  latest_menu_id text null,
  use_menu_dynamically boolean null,
  onboarding_form_id text null,
  service_charge_type text null default 'PERCENTAGE'::text,
  service_charge_rate real null default '0'::real,
  delivery_fee_formula text null,
  delivery_fee_plaintext text null,
  tax_rate real null default 0,
  service_charge_applied boolean null default false,
  pos text null,
  website text null,
  reservation_requirement text null,
  certus_order_count integer null default 0,
  discord_channel_id text null,
  primary_order_integration_provider text null,
  billing_provider jsonb null default '{"url": "", "api_key": "", "provider_name": "", "apply_fee_surcharge": false}'::jsonb,
  owner_phone_number text null,
  location_configuration_version text null default 'core'::text,
  certus_notification_email text null,
  daily_report_local_hour integer null default 9,
  memory_id text null,
  order_totalling_prompt_injection text null,
  ai_version text null default '0'::text,
  postal_code text null,
  phone_line_provider text null,
  multi_location_main boolean null default false,
  business_knowledge_base text null,
  ai_persona_description text null,
  ai_voice_id text null,
  is_demo_account boolean null default false,
  offline_out_of_stock text null,
  alias_names text null,
  constraint locations_pkey primary key (location_id)
) TABLESPACE pg_default;

create index IF not exists locations_account_idx on public.locations using btree (account_id) TABLESPACE pg_default;

create index IF not exists ix_locations_dashboard_id on public.locations using btree (dashboard_location_id) TABLESPACE pg_default;
```

**Key Fields:**
- `location_id` - Primary key
- `account_id` - Foreign key to accounts
- `name` - Location name (e.g., "Downtown Store")
- `time_zone` - Location-specific timezone
- `avg_spend_per_head` - Used for reservation revenue estimates
- `operating_hours_json` - Business hours configuration

---

### call_logs

Records of all AI phone calls.

```sql
create table public.call_logs (
  call_id text not null,
  row_owner text null,
  dashboard_client_id text null,
  dashboard_certus_id text null,
  dashboard_location_id text null,
  certus_number text null,
  customer_number text null,
  transcription_formatted text null,
  concatenated_transcript text null,
  created_at_utc timestamp with time zone null,
  created_at_utc_string text null,
  started_at_utc timestamp with time zone null,
  ended_at_utc timestamp with time zone null,
  ended_by text null,
  inbound boolean null,
  max_duration integer null,
  recording_url text null,
  answered_by text null,
  price numeric null,
  corrected_duration_seconds integer null,
  timezone text null,
  user_id text null,
  country text null,
  state text null,
  city text null,
  language text null,
  timestamp_local_time timestamp with time zone null,
  call_status text null,
  pathway_tags_raw text null,
  pathway_tags_formatted text null,
  call_transferred boolean null,
  no_knowledge boolean null,
  left_complaint boolean null,
  job_application boolean null,
  reservation_made boolean null,
  website_resources_sent boolean null,
  scenario_call_transferred boolean null,
  order_made boolean null,
  order_completed boolean null,
  looking_for_manager boolean null,
  action_item text null,
  action_item_urgency_number_score integer null,
  internal_csat_score text null,
  internal_csat_number_score integer null,
  csat_reasoning text null,
  ai_performance_rating text null,
  ai_performance_summary text null,
  events text null,
  call_summary text null,
  call_summary_short text null,
  subject_line text null,
  key_words text null,
  call_topic text null,
  execution_id text null,
  execution_url text null,
  error text null,
  other text null,
  knowledge_gap text null,
  number_of_calls integer null default 1,
  transcription_finetuning_template text null,
  call_is_oooh boolean null,
  gpt_input_tokens integer null,
  gpt_output_tokens integer null,
  user_name text null,
  date_only date null,
  time_only text null,
  bar_chart_time_range text null,
  date_only_string text null,
  minutes_only double precision null,
  out_of_stock text null,
  opening_times_exceptions text null,
  currency_string text null,
  location_certus_status text null,
  dashboard_call_id text null,
  location_id uuid null,
  pathway_id text null,
  ai_version text null,
  ai_llm_model text null,
  voice_id text null,
  background_noise text null,
  multi_location_main_default boolean null default false,
  constraint call_logs_pkey primary key (call_id),
  constraint call_logs_location_id_fkey foreign KEY (location_id) references locations (location_id) on update CASCADE
) TABLESPACE pg_default;

create index IF not exists ix_calls_v_loc_date on public.call_logs using btree (location_id, started_at_utc desc) TABLESPACE pg_default;
```

**Key Fields:**
- `call_id` - Primary key (text)
- `location_id` - Foreign key to locations
- `started_at_utc` - Call start time
- `ended_at_utc` - Call end time
- `corrected_duration_seconds` - Actual call duration
- `order_made` - Boolean flag for orders
- `reservation_made` - Boolean flag for reservations
- `call_status` - Status text
- `transcription_formatted` - Call transcript
- `call_summary` - AI-generated summary
- `recording_url` - Audio recording URL

---

### order_logs

Records of orders placed during calls.

```sql
create table public.order_logs (
  order_id uuid not null default gen_random_uuid (),
  response_order_id text null,
  request_order_id text null,
  location_id uuid null,
  account_id uuid not null,
  call_id text not null,
  menu_id text null,
  customer_id uuid null,
  customer_name text null,
  customer_phone text not null,
  subtotal double precision null,
  total_tax double precision null,
  service_charge double precision null,
  delivery_charge double precision null,
  tip double precision null,
  total double precision null,
  is_paid text null,
  payment_method text null,
  order_status text null,
  fulfillment_type text null,
  response_body jsonb null,
  created_at timestamp with time zone not null default now(),
  pickup_time text null,
  delivery_time text null,
  integration_provider text null,
  full_order text null,
  canonical_payload jsonb null,
  paid_at timestamp with time zone null,
  dashboard_row_id text null,
  constraint order_logs_pkey primary key (order_id),
  constraint order_logs_location_id_fkey foreign KEY (location_id) references locations (location_id) on delete set null
) TABLESPACE pg_default;

create index IF not exists orders_customer_idx on public.order_logs using btree (customer_id) TABLESPACE pg_default;

create index IF not exists orders_call_idx on public.order_logs using btree (call_id) TABLESPACE pg_default;

create index IF not exists ix_order_logs_phone_digits on public.order_logs using btree (
  regexp_replace(customer_phone, '\D'::text, ''::text, 'g'::text)
) TABLESPACE pg_default;

create index IF not exists orders_location_idx on public.order_logs using btree (location_id) TABLESPACE pg_default;

create index IF not exists ix_order_logs_loc_created on public.order_logs using btree (location_id, created_at desc) TABLESPACE pg_default;
```

**Key Fields:**
- `order_id` - Primary key
- `call_id` - Links to call_logs
- `location_id` - Foreign key to locations
- `account_id` - Foreign key to accounts
- `total` - Total order amount
- `subtotal`, `total_tax`, `service_charge`, `delivery_charge` - Monetary breakdowns
- `fulfillment_type` - Delivery, pickup, dine-in
- `created_at` - Order timestamp

---

### reservations

Records of reservations made during calls.

```sql
create table public.reservations (
  reservation_id uuid not null default gen_random_uuid (),
  dashboard_client_id text null,
  dashboard_location_id text null,
  call_id text null,
  reservation_name text null,
  guest_count integer null,
  reservation_datetime text null,
  reservation_date text null,
  reservation_time text null,
  reservation_notes text null,
  average_spend_per_head numeric(10, 2) null,
  is_reservation_accepted boolean null default false,
  is_reservation_rejected boolean null default false,
  is_reservation_checked boolean null default false,
  reviewed_datetime timestamp with time zone null,
  client_role text null,
  created_at text not null default now(),
  location_id uuid not null,
  location_name text null,
  customer_number text null,
  constraint reservations_pkey primary key (reservation_id),
  constraint reservations_location_id_fkey foreign KEY (location_id) references locations (location_id) not VALID
) TABLESPACE pg_default;
```

**Key Fields:**
- `reservation_id` - Primary key
- `call_id` - Links to call_logs
- `location_id` - Foreign key to locations
- `guest_count` - Number of guests
- `reservation_datetime` - Combined date/time
- `average_spend_per_head` - Per-person spend override

---

## Supporting Tables

### complaints

Tracks customer complaints from calls.

```sql
create table public.complaints (
  complaint_id text not null default gen_random_uuid (),
  call_id text not null,
  dashboard_location_id text null,
  dashboard_client_id text null,
  location_id text null,
  location_name text null,
  type boolean not null default false,
  complaint text null,
  customer_name text null,
  customer_phone_number text null,
  full_transcript text null,
  recording_url text null,
  call_time text null,
  created_at text not null default now(),
  constraint complaints_pkey primary key (complaint_id),
  constraint complaints_call_id_key unique (call_id)
) TABLESPACE pg_default;
```

---

### deliveries

Tracks delivery details for orders.

```sql
create table public.deliveries (
  delivery_id uuid not null default gen_random_uuid (),
  response_order_id text null,
  order_id text null,
  location_id text not null,
  account_id text not null,
  dashboard_location_id text null,
  call_id text not null,
  customer_name text null,
  customer_phone text null,
  delivery_notes text null,
  address_found boolean null,
  in_delivery_range boolean null,
  verified_full_address text null,
  transport_time integer null default 0,
  total_delivery_time integer null default 0,
  delivery_created_at timestamp with time zone not null default now(),
  estimated_local_delivery_time text null,
  estimated_delivery_timestamp text null,
  status text null,
  integration_provider text null,
  created_at timestamp with time zone null default now(),
  deliverect_validation_payload jsonb null default '{}'::jsonb
) TABLESPACE pg_default;
```

---

### order_errors

Logs errors encountered during order processing.

```sql
create table public.order_errors (
  error_id uuid not null default gen_random_uuid (),
  request_order_id text not null,
  call_id uuid null,
  customer_name text null,
  customer_phone text not null,
  location_id text not null,
  account_id text not null,
  total integer null,
  fulfillment_type text null,
  response_payload jsonb null,
  status_code integer not null,
  status_message text null,
  error_type text null,
  error_description text null,
  created_at timestamp with time zone not null default now(),
  customer_id uuid null,
  constraint order_errors_pkey primary key (error_id),
  constraint order_errors_customer_id_fkey foreign KEY (customer_id) references customers (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists order_errors_request_id_idx on public.order_errors using btree (request_order_id) TABLESPACE pg_default;

create index IF not exists order_errors_location_idx on public.order_errors using btree (location_id) TABLESPACE pg_default;

create index IF not exists order_errors_customer_phone_idx on public.order_errors using btree (customer_phone) TABLESPACE pg_default;
```

---

### upsells

Tracks upsell attempts and outcomes.

```sql
create table public.upsells (
  upsell_id uuid not null default gen_random_uuid (),
  order_id text null,
  upselled_value integer null,
  upsold_items jsonb[] not null,
  rejected_items jsonb[] null default '{}'::jsonb[],
  ingest_timestamp timestamp with time zone null default now(),
  constraint upsells_pkey primary key (upsell_id)
) TABLESPACE pg_default;
```

---

### daily_call_reports

Stores pre-computed daily report data.

```sql
create table public.daily_call_reports (
  location_id uuid not null,
  report_date date not null,
  sent_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  total_calls integer null,
  orders_taken integer null,
  reservations_booked integer null,
  after_hours_calls integer null,
  avg_call_time_minutes numeric(5, 2) null,
  total_phone_time_minutes numeric(8, 2) null,
  labor_cost_saved numeric(8, 2) null,
  accuracy_rate numeric(5, 2) null,
  customer_satisfaction_pct numeric(5, 2) null,
  repeat_callers integer null,
  first_time_callers integer null,
  peak_concurrent_calls integer null,
  avg_concurrency numeric(5, 4) null,
  minutes_high_load numeric(8, 2) null,
  minutes_very_high_load numeric(8, 2) null,
  uptime_pct numeric(5, 2) null,
  total_orders integer null,
  total_revenue numeric(10, 2) null,
  avg_order_value numeric(8, 2) null,
  upsells integer null,
  upsell_revenue numeric(8, 2) null,
  delivery_orders integer null,
  pickup_orders integer null,
  sections_enabled text[] null,
  report_complete boolean null default false,
  email_subject text null,
  email_body_length integer null,
  constraint daily_call_reports_pkey primary key (location_id, report_date),
  constraint fk_daily_call_reports_location foreign KEY (location_id) references locations (location_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_daily_call_reports_sent_at on public.daily_call_reports using btree (sent_at) TABLESPACE pg_default;

create index IF not exists idx_daily_call_reports_report_date on public.daily_call_reports using btree (report_date) TABLESPACE pg_default;
```

---

## Views

### calls_v

Normalized call data with computed fields.

```sql
create view public.calls_v as
select
  c.call_id as id,
  c.location_id,
  l.account_id,
  COALESCE(
    NULLIF(
      TRIM(
        both
        from
          lower(c.call_status)
      ),
      ''::text
    ),
    case
      when c.ended_at_utc is null then 'in_progress'::text
      else 'completed'::text
    end
  ) as status,
  case
    when COALESCE(c.order_made, false) then 'order'::text
    when COALESCE(c.reservation_made, false) then 'reservation'::text
    when c.pathway_tags_formatted ~~* '%catering%'::text then 'catering'::text
    else 'general'::text
  end as call_type,
  c.inbound,
  c.customer_number as from_number,
  c.certus_number as to_number,
  c.started_at_utc as started_at,
  c.ended_at_utc as ended_at,
  COALESCE(
    c.corrected_duration_seconds,
    EXTRACT(
      epoch
      from
        c.ended_at_utc - c.started_at_utc
    )::integer
  ) as duration_seconds,
  c.recording_url,
  NULLIF(c.call_summary, ''::text) as summary_md,
  c.transcription_formatted as transcript_md
from
  call_logs c
  left join locations l on l.location_id = c.location_id;
```

**Key Computed Fields:**
- `status` - Normalized call status
- `call_type` - Derived from flags (order/reservation/catering/general)
- `duration_seconds` - Computed from timestamps or corrected_duration

---

### orders_v

Normalized order data with monetary fields.

```sql
create view public.orders_v as
select
  order_id as id,
  call_id,
  location_id,
  account_id,
  COALESCE(total, 0::double precision) as total_amount,
  COALESCE(subtotal, 0::double precision) as subtotal_amount,
  COALESCE(total_tax, 0::double precision) as tax_amount,
  COALESCE(service_charge, 0::double precision) as service_charge_amount,
  COALESCE(delivery_charge, 0::double precision) as delivery_amount,
  order_status as status,
  fulfillment_type,
  created_at
from
  order_logs o;
```

---

### reservations_v

Normalized reservation data with computed datetime.

```sql
create view public.reservations_v as
with
  base as (
    select
      r.reservation_id as id,
      r.call_id,
      r.location_id,
      l.account_id,
      r.guest_count,
      COALESCE(
        NULLIF(r.reservation_datetime, ''::text)::timestamp with time zone,
        case
          when r.reservation_date is not null
          and r.reservation_time is not null then to_timestamp(
            (r.reservation_date || ' '::text) || r.reservation_time,
            'YYYY-MM-DD HH24:MI'::text
          )
          else null::timestamp with time zone
        end
      ) as reservation_at,
      r.average_spend_per_head as avg_spend_per_head_override
    from
      reservations r
      left join locations l on l.location_id = r.location_id
  )
select
  id,
  call_id,
  location_id,
  account_id,
  guest_count,
  reservation_at,
  avg_spend_per_head_override
from
  base;
```

**Key Computed Fields:**
- `reservation_at` - Combined datetime from separate date/time fields
- `account_id` - Joined from locations

---

## Materialized Views

### mv_call_events

Materialized view for call event analysis.

```sql
create materialized view public.mv_call_events as
select
  c.call_id,
  c.account_id,
  c.location_id,
  c.pathway_id,
  c.ai_version,
  c.started_at,
  (e.value ->> 'event_id'::text)::uuid as event_id,
  e.value ->> 'tag_def_id'::text as tag_def_id,
  e.value ->> 'node_ref'::text as node_ref,
  e.value -> 'qualifiers'::text as qualifiers,
  e.value ->> 'outcome'::text as outcome,
  e.value ->> 'outcome_source'::text as outcome_source,
  e.value -> 'artifacts'::text as artifacts,
  e.value ->> 'error_code'::text as error_code,
  COALESCE((e.value ->> 'attempt'::text)::integer, 1) as attempt,
  (e.value ->> 'created_at'::text)::timestamp with time zone as event_ts
from
  call_sessions c
  cross join lateral jsonb_array_elements(c.events) e (value);
```

---

## Notes

### Data Relationships

```
accounts (1)
  └─> locations (n)
       ├─> call_logs (n)
       │    ├─> order_logs (0..1)
       │    ├─> reservations (0..1)
       │    ├─> complaints (0..1)
       │    └─> deliveries (0..n)
       └─> daily_call_reports (n)
```

### Key Indexes

Performance-critical indexes:
- `call_logs`: `(location_id, started_at_utc DESC)` - For date-ranged queries
- `order_logs`: `(location_id, created_at DESC)` - For order lookups
- `order_logs`: `(call_id)` - For call-to-order joins

### Foreign Key Constraints

- `call_logs.location_id` → `locations.location_id`
- `order_logs.location_id` → `locations.location_id`
- `reservations.location_id` → `locations.location_id`
- `accounts.primary_contact_user_id` → `users.user_id`

---

## Related Documentation

- [Architecture](./architecture.md) - System architecture overview
- [PRD](./prd.md) - Product requirements
- [Authentication](./auth/authentication.md) - Auth system details
