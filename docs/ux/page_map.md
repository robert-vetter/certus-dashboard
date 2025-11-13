# Certus Operations Dashboard  Page Map & User Flows

**Version:** 1.0
**Last updated:** 2025-09-25
**Owner:** UX Researcher
**Related docs:**
- `docs/prd.md` (v1.1)
- `docs/architecture.md` (v1.0)
- `docs/ux/user_flows.md`

---

## 1. Overview

This document maps all pages, screens, and UI states in the Certus Operations Dashboard. It defines the complete user flow architecture based on the PRD requirements and serves as the definitive reference for page structure, navigation paths, and user journeys.

**Key Principles:**
- User-centric navigation optimized for operational efficiency
- Minimal clicks to critical information
- Context preservation across page transitions
- Progressive disclosure of detail (overview ’ drill-down ’ deep inspection)

---

## 2. User Personas & Access Context

### 2.1 Primary Personas

**Persona 1: Restaurant Operator (Manager/Owner)**
- **Goals:**
  - Monitor AI phone performance daily
  - Quickly investigate problematic calls
  - Understand revenue impact and time savings
  - Adjust operational settings without technical help
- **Pain Points:**
  - Fragmented data across multiple systems
  - Unable to hear what customers actually said
  - No visibility into why calls fail
  - Settings changes require developer intervention
- **Technical Proficiency:** Low to medium
- **Usage Pattern:** Multiple times daily, quick check-ins (2-5 min sessions)
- **Access Level:** Admin (MVP - single role)

**Persona 2: Internal Certus Operations Staff**
- **Goals:**
  - Monitor multiple restaurant accounts
  - Provide support for call issues
  - Identify patterns and optimization opportunities
  - Validate AI performance across locations
- **Pain Points:**
  - Switching between accounts is cumbersome
  - Hard to compare performance across locations
  - Missing context on customer history
- **Technical Proficiency:** Medium to high
- **Usage Pattern:** Extended sessions (30+ min), deep analysis
- **Access Level:** Admin (MVP - single role)

**Persona 3: Admin User (Future - Configuration Manager)**
- **Goals:**
  - Configure AI behavior and business rules
  - Manage API integrations
  - Control access and permissions
- **Pain Points:**
  - Technical settings require understanding of AI system
  - No validation of configuration changes before applying
- **Technical Proficiency:** High
- **Usage Pattern:** Occasional (weekly/monthly configuration updates)
- **Access Level:** Admin (MVP - will differentiate in future)

### 2.2 Authentication Context

**Production Mode:**
- Users authenticate via Supabase magic link
- Account context determined by user's `account_id`
- Location filtering available if account has multiple locations

**Demo Mode:**
- Accessible via feature flag (`DEMO_MODE=true`)
- Pre-seeded demo account with realistic data
- Read-only for most features (notes may be ephemeral)
- No authentication required

---

## 3. Complete Page Inventory

### 3.1 Authentication & Entry

#### Page: Login / Authentication
**Route:** `/login` (or root `/` if not authenticated)
**Purpose:** Authenticate users via magic link or enter demo mode
**User Personas:** All
**Key Features:**
- Email input for magic link
- "Continue with Demo" button (if `DEMO_MODE` enabled)
- Branding and value proposition messaging
- Loading state after email submission

**User Actions:**
- Enter email address
- Click "Send Magic Link"
- Click "Continue with Demo" (demo mode)
- Check email and click magic link (redirects back)

**Data Sources:**
- Supabase Auth

**Navigation Flows:**
- **Entry:** Direct URL access, session expiry
- **Exit:** Successful auth ’ `/overview` (default landing)

**Performance Requirements:**
- Magic link send < 1s
- Demo mode entry < 500ms

---

### 3.2 Main Application Pages

#### Page: Overview (Dashboard Landing)
**Route:** `/overview`
**Purpose:** Primary landing page showing at-a-glance KPIs and recent activity
**User Personas:** Restaurant Operators, Certus Operations Staff
**Key Features:**
1. **KPI Tiles Section** (5 tiles)
   - Total Calls
   - Total Revenue
   - Minutes Saved
   - Orders Placed
   - Reservations Booked
   - Each tile shows: current value, trend indicator, comparison to previous period

2. **Date Range Selector**
   - Preset options: Today, Last 7 Days (default), Last 30 Days, Custom Range
   - Date picker for custom ranges
   - Affects all KPI tiles and Recent Activities

3. **Location Filter** (if multi-location account)
   - Dropdown: All Locations, or specific location
   - Persists across session

4. **Recent Activities Table**
   - Last 20 calls (configurable)
   - Columns:
     - Call Type (icon + label) - first column
     - Direction (inbound/outbound icon)
     - Business/Location name
     - From Number (obfuscated)
     - Duration (formatted as mm:ss)
     - Status (badge: completed/failed/in-progress)
     - Started At (localized to Africa/Johannesburg)
   - Row click behavior: navigates to Call Logs page with drawer open

5. **Quick Actions Section**
   - "Change AI Voice" ’ jumps to Configuration
   - "Update Business Hours" ’ jumps to Configuration
   - "Trigger Knowledge Update" ’ jumps to Configuration
   - "Manage API Keys" ’ jumps to Configuration

**User Actions:**
- Change date range
- Filter by location
- Click KPI tile (future: may drill into analytics)
- Click call row ’ navigate to Call Logs with drawer
- Click quick action ’ navigate to Configuration subsection

**Data Sources:**
- `mv_metrics_daily` (KPI aggregations)
- `calls_v` (Recent Activities table)
- `locations` (location filter)

**Navigation Flows:**
- **Entry:** Post-login default, sidebar navigation, home icon
- **Exit:**
  - Call row click ’ `/call-logs?callId={id}&date={date}&location={location}`
  - Quick action ’ `/settings/configuration#{section}`
  - Sidebar ’ any other page

**Performance Requirements:**
- Initial load (TTFB + render) < 2s
- Date range change < 800ms
- Location filter change < 600ms

**Empty States:**
- No calls in date range: "No calls recorded during this period. Try expanding your date range."
- No locations: "No locations configured for this account."

**Error States:**
- Failed to load metrics: "Unable to load metrics. Please refresh the page."
- Failed to load recent calls: Show KPIs only, display error banner

---

#### Page: Call Logs (Call Browser & Detail Inspector)
**Route:** `/call-logs`
**Query Params:** `?callId={id}&dateFrom={iso}&dateTo={iso}&location={id}&callType={type}&status={status}&duration={bucket}`
**Purpose:** Comprehensive call browsing with advanced filtering and detailed call inspection drawer
**User Personas:** All

**Key Features:**

1. **Filter Panel** (left side or collapsible)
   - **Date Range:** Date picker (default: last 7 days)
   - **Location:** Multi-select dropdown (if applicable)
   - **Call Type:** Checkboxes (Order, Reservation, Catering, General, Other)
   - **Status:** Checkboxes (Completed, Failed, In Progress, Missed)
   - **Duration Bucket:** Radio buttons (<30s, 30-120s, >120s, All)
   - "Clear Filters" button
   - "Apply Filters" button (or auto-apply on change)

2. **Calls Data Table** (main area)
   - **Columns:**
     - Call Type (icon + label) - sortable
     - Started At - sortable (default sort: desc)
     - Direction (icon)
     - Business/Location
     - From Number (obfuscated)
     - Duration - sortable
     - Status (badge)
   - Server-side pagination (25 rows per page, configurable)
   - Page size selector: 10, 25, 50, 100
   - Search box: filters by phone number or call ID
   - Row click: opens call detail drawer

3. **Call Detail Drawer (Right-Hand Panel)**
   Opens when `callId` query param present or row clicked

   **Layout Structure:**
   - **Close button** (X icon, top-right)
   - **Call Header Section:**
     - Call Type badge
     - Started At timestamp
     - Duration
     - Status badge
     - Location name

   - **Two-Section Layout:**

     **Section 1: Main Detail Tabs** (~65% width, 85% height)
     - Tab navigation: Transcript | Summary | Order Details | Internal Chat

     **Tab 1: Transcript**
     - Speaker-turn formatted transcript (AI vs Caller)
     - Each turn shows: speaker label, timestamp, text
     - Inline search box (client-side filtering)
     - Auto-scroll to search matches
     - If `recording_url` present: audio player with sync to transcript
     - Click timestamp ’ jump audio to that point

     **Tab 2: Summary**
     - Call summary markdown (3-6 bullet points)
     - Sentiment badge (Positive, Neutral, Negative)
     - Detected intents (chips/badges)
     - Entities detected (chips/badges)
     - AI confidence score (if available)

     **Tab 3: Order Details** (conditional - only if `call_type = 'order'`)
     - Order ID
     - Fulfillment Type (Delivery, Pickup, Dine-in) badge
     - Items list (if structured data available):
       - Item name, quantity, price
     - Monetary breakdown:
       - Subtotal
       - Tax
       - Service Charge
       - Delivery Charge
       - **Total** (bold)
     - POS Order ID (if linked)
     - Order Status badge

     **Tab 4: Internal Chat**
     - Chat-like interface for call-specific team notes
     - Each note shows:
       - Author avatar + display name
       - Timestamp
       - Note content (markdown rendered)
       - `@mentions` highlighted (data only, no notifications in MVP)
     - Input area at bottom:
       - Markdown text area
       - @ mention autocomplete (lists team members)
       - "Post Note" button
     - Real-time updates (if available) or refresh on post
     - Notes sorted: oldest first (chronological)

     **Section 2: Customer Profile Panel** (~35% width, ~42% height)
     - **Phone Number** (obfuscated display, copy button for full number - admin only)
     - **Call History Badge:** "X calls from this number"
     - **Total Spend Badge:** "R X,XXX spent at this location"
     - **First Call Date:** "Customer since {date}"
     - **Last Call Date:** "Last contact {relative time}"
     - Future: customer sentiment trend, VIP status

4. **Audio Player** (if recording available)
   - Embedded in drawer header or transcript tab
   - Controls: Play/Pause, Seek bar, Playback speed, Volume
   - Waveform visualization (optional enhancement)
   - Download disabled (playback only)

**User Actions:**
- Apply/clear filters
- Change date range
- Search by phone/call ID
- Sort table columns
- Change page size
- Navigate pages
- Click call row ’ open drawer
- Switch drawer tabs
- Search within transcript
- Play/pause recording
- Seek audio playback
- Add internal note with @mentions
- Copy customer phone number (admin)
- Close drawer ’ removes `callId` query param

**Data Sources:**
- `calls_v` (main table data)
- `orders_v` (order details tab)
- `reservations_v` (reservation details if applicable)
- `internal_notes` (internal chat tab)
- `users` (note authors, @mention autocomplete)
- Recording URL from `calls_v.recording_url`

**Navigation Flows:**
- **Entry:**
  - Sidebar navigation
  - Overview page call row click
  - Direct link with query params
- **Exit:**
  - Sidebar ’ other pages
  - Close drawer ’ stays on Call Logs, removes `callId` param
  - Browser back ’ removes drawer if open

**Performance Requirements:**
- Table load with filters < 1s
- Drawer open (data fetch + render) < 400ms
- Filter/search apply < 600ms
- Note post action < 800ms
- Audio playback start < 1s

**Empty States:**
- No calls match filters: "No calls found. Try adjusting your filters."
- No transcript available: "Transcript not available for this call."
- No order details: "No order associated with this call."
- No internal notes: "No notes yet. Be the first to add context for your team."
- No recording: "Recording not available for this call."

**Error States:**
- Failed to load call details: "Unable to load call details. Please try again."
- Failed to load transcript: "Transcript unavailable. Contact support if this persists."
- Failed to post note: "Could not save note. Please try again."
- Recording playback error: "Audio playback failed. Please refresh and try again."

---

#### Page: Analytics (Data Visualization & Export)
**Route:** `/analytics`
**Query Params:** `?dateFrom={iso}&dateTo={iso}&location={id}&metric={type}`
**Purpose:** Historical performance analysis with charts and data export
**User Personas:** Restaurant Operators, Certus Operations Staff

**Key Features:**

1. **Filter Controls** (top bar)
   - Date Range Picker (default: last 30 days)
   - Location Filter (multi-select if applicable)
   - Metric Selector (for focused views): All, Calls, Revenue, Time Saved
   - "Export CSV" button (prominent, right-aligned)

2. **Key Metrics Summary Cards**
   - Same 5 KPIs as Overview, but for selected analytics date range
   - Shows total and daily average
   - Comparison to previous equivalent period

3. **Time Series Charts Section**

   **Chart 1: Daily Calls Volume**
   - Line chart
   - X-axis: Date (daily buckets)
   - Y-axis: Number of calls
   - Tooltip: Date, count, % change from previous day
   - Hoverable points

   **Chart 2: Daily Revenue**
   - Stacked area chart or line chart
   - Two series:
     - Revenue from Orders (solid)
     - Estimated Revenue from Reservations (if `revenue_mode = 'orders_plus_res_estimate'`)
   - X-axis: Date
   - Y-axis: Revenue (currency formatted)
   - Tooltip: Date, order revenue, reservation estimate, total

   **Chart 3: Minutes Saved**
   - Bar chart
   - X-axis: Date
   - Y-axis: Minutes saved
   - Tooltip: Date, minutes saved, baseline used
   - Threshold line showing target/expected savings

4. **Call Type Breakdown Section**

   **Chart 4: Call Type Distribution (Pie or Donut)**
   - Segments: Order, Reservation, Catering, General, Other
   - Shows percentage and count
   - Click segment to filter time series above (optional interaction)

   **Chart 5: Call Type Trends (Stacked Bar)**
   - X-axis: Date (weekly buckets for 30+ day ranges)
   - Y-axis: Count
   - Stacked bars by call type
   - Legend with toggles to show/hide call types

5. **Performance Metrics Table** (below charts)
   - Rows: Each day in selected range
   - Columns:
     - Date
     - Total Calls
     - Orders Count
     - Reservations Count
     - Revenue (Orders)
     - Revenue (Reservations Est.)
     - Minutes Saved
     - Avg Call Duration
   - Sortable columns
   - Footer row: Totals and averages

6. **Export Functionality**
   - "Export CSV" button triggers server action
   - Downloads CSV with all data in current filter context
   - CSV includes:
     - All columns from Performance Metrics Table
     - Additional metadata: account_id, location_id, export timestamp
   - Filename: `certus-analytics-{account}-{date-range}-{timestamp}.csv`

**User Actions:**
- Change date range
- Filter by location
- Select metric focus
- Hover over chart points/bars for tooltips
- Toggle call type series in charts
- Sort performance table
- Export CSV

**Data Sources:**
- `mv_metrics_daily` (all aggregations)
- `calls_v` (for call type breakdowns)
- `account_settings`, `location_settings` (for context like baseline)

**Navigation Flows:**
- **Entry:** Sidebar navigation, Overview KPI tile click (future)
- **Exit:** Sidebar ’ other pages

**Performance Requirements:**
- Initial load with 30 days data < 1.5s
- Chart render < 1s
- Date range change < 1s
- CSV export trigger < 2s (download start)

**Empty States:**
- No data in date range: "No analytics data available for the selected period."
- No calls of selected type: "No {call_type} calls in this period."

**Error States:**
- Failed to load analytics: "Unable to load analytics. Please refresh the page."
- CSV export failed: "Export failed. Please try again or contact support."

---

#### Page: Configuration (Settings Management)
**Route:** `/settings/configuration`
**Hash Anchors:** `#business-hours`, `#ai-voice`, `#busy-mode`, `#knowledge`, `#api-keys`
**Purpose:** Centralized settings and configuration management for operational parameters
**User Personas:** Restaurant Operators (limited), Admin Users (full access)

**Key Features:**

**Layout:**
- Left sidebar: Section navigation
  - Business Hours
  - AI Voice
  - Busy Mode
  - Knowledge Update
  - API Keys
- Main content area: Selected section form/content
- Sticky save/cancel buttons at bottom when form is dirty

**Section 1: Business Hours**
**Anchor:** `#business-hours`

**Purpose:** Configure when AI should answer calls

**UI Elements:**
- Location selector (if multi-location)
- Day-of-week list with time range inputs:
  - Monday: [HH:MM] to [HH:MM] + "Closed" checkbox
  - Tuesday: [HH:MM] to [HH:MM] + "Closed" checkbox
  - ... (all 7 days)
- "Copy hours to all days" button
- "Copy from another location" dropdown (if multi-location)
- Timezone display: "All times in Africa/Johannesburg"
- Validation:
  - End time must be after start time
  - Overlapping ranges not allowed (if multiple shifts per day in future)
- "Save Changes" and "Cancel" buttons

**Data Model:**
- Stored in `location_settings.business_hours` (JSONB)
- Structure:
  ```json
  {
    "monday": { "open": "08:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "08:00", "close": "22:00", "closed": false },
    ...
  }
  ```

**User Actions:**
- Select location
- Edit hours for each day
- Mark day as closed
- Copy hours across days/locations
- Save changes
- Cancel (revert to last saved)

**Empty State:**
- No hours configured: "No business hours set. Configure hours to control when AI answers calls."

**Error State:**
- Save failed: "Failed to save business hours. Please try again."
- Invalid time range: "End time must be after start time."

---

**Section 2: AI Voice**
**Anchor:** `#ai-voice`

**Purpose:** Select AI voice personality and style

**UI Elements:**
- Voice selector (dropdown or radio cards)
  - Each option shows:
    - Voice name (e.g., "Professional Female", "Friendly Male")
    - Sample audio player (if available)
    - Description of voice characteristics
- "Preview with sample call" button (future enhancement)
- "Save Changes" button

**Data Model:**
- Stored in `settings.ai_voice` (JSONB)
- Structure:
  ```json
  {
    "voice_id": "professional_female_1",
    "name": "Professional Female",
    "provider": "elevenlabs",
    "settings": { ... }
  }
  ```

**User Actions:**
- Play voice samples
- Select voice
- Save selection

**Empty State:**
- Default voice pre-selected: "Using default voice: {name}"

**Error State:**
- Save failed: "Failed to update AI voice. Please try again."

---

**Section 3: Busy Mode & Wait Times**
**Anchor:** `#busy-mode`

**Purpose:** Configure behavior when restaurant is busy or call volume is high

**UI Elements:**
- "Enable Busy Mode" toggle switch
- Conditional fields (when enabled):
  - "Extra Wait Time" input (seconds): "Add X seconds to usual wait time"
  - "Overflow Behavior" radio group:
    - Route to voicemail
    - Offer callback
    - Play custom message
  - Custom message text area (if "Play custom message" selected)
- Info callout: "Busy mode is a configuration stub in MVP. Full integration planned for future release."
- "Save Changes" button

**Data Model:**
- Stored in `settings.busy_mode` (JSONB)
- Structure:
  ```json
  {
    "enabled": true,
    "extra_wait_seconds": 10,
    "overflow_behavior": "offer_callback",
    "custom_message": "..."
  }
  ```

**User Actions:**
- Toggle busy mode on/off
- Configure extra wait time
- Select overflow behavior
- Edit custom message
- Save changes

**Empty State:**
- Busy mode disabled (default)

**Error State:**
- Save failed: "Failed to update busy mode settings. Please try again."

---

**Section 4: Knowledge Update**
**Anchor:** `#knowledge`

**Purpose:** Request AI knowledge base refresh (menu, hours, specials, etc.)

**UI Elements:**
- Explanation text: "Request an update to the AI's knowledge about your restaurant. This includes menu items, specials, hours, and policies."
- Last update timestamp: "Last updated: {date time}"
- Update status indicator (if request pending):
  - "Update Queued" (yellow badge)
  - "Processing" (blue badge, with spinner)
  - "Completed" (green badge)
  - "Failed" (red badge, with error message)
- "Request Knowledge Update" button (disabled if request pending)
- Optional: "Update Notes" text area for context (e.g., "Added new lunch menu")
- Processing note: "Updates are processed by our automation system and typically complete within 15 minutes."

**Data Model:**
- Inserts row into `knowledge_update_requests`
- Fields:
  - `account_id`
  - `requested_by_user_id`
  - `payload` (JSONB with notes, location_id if applicable)
  - `status` (queued, processing, done, error)
  - `created_at`

**User Actions:**
- View last update status
- Add update notes
- Click "Request Knowledge Update"
- Button triggers server action ’ insert row ’ n8n polls and processes

**Empty State:**
- No previous updates: "No knowledge updates requested yet."

**Error State:**
- Request failed: "Failed to submit update request. Please try again."

---

**Section 5: API Keys**
**Anchor:** `#api-keys`

**Purpose:** View and manage API keys for external integrations

**UI Elements:**
- Explanation text: "API keys allow external systems to integrate with Certus. Keep these secure."
- API Keys table:
  - Columns:
    - Key Name/Label
    - Key Preview (e.g., `cert_***************xyz`)
    - Created At
    - Last Used
    - Status (Active/Revoked)
    - Actions (Revoke button)
- "Generate New API Key" button (future - may require Supabase console for MVP)
- Warning callout when revoking: "Revoking a key will break any integrations using it. This cannot be undone."

**Data Model:**
- API key metadata stored in custom table or Supabase auth system
- Actual key generation may be done via Supabase console for MVP
- Table displays metadata only

**User Actions:**
- View existing keys
- Revoke a key (with confirmation dialog)
- Copy key preview (if needed)
- (Future) Generate new key

**Empty State:**
- No keys: "No API keys configured. Contact Certus support to set up integrations."

**Error State:**
- Revoke failed: "Failed to revoke API key. Please try again."

---

**General Configuration Page Behavior:**

**Data Sources:**
- `account_settings` (general account settings)
- `location_settings` (location-specific overrides)
- `settings` (JSONB settings blob)
- `knowledge_update_requests` (knowledge update status)

**Navigation Flows:**
- **Entry:**
  - Sidebar navigation
  - Overview quick actions (with hash anchor)
  - Direct URL with hash anchor
- **Exit:**
  - Sidebar ’ other pages
  - Within page: section nav in sidebar scrolls to anchor

**Performance Requirements:**
- Section load < 500ms
- Save action < 1s
- Knowledge update request < 800ms

**Validation:**
- Client-side validation on form inputs (immediate feedback)
- Server-side validation on save (via Zod schemas)
- Show validation errors inline near affected fields

---

## 4. User Journey Maps

### 4.1 Journey: Daily Operations Check

**Actor:** Restaurant Operator
**Trigger:** Morning routine - checking yesterday's performance
**Goal:** Understand call volume, revenue, and any issues

**Steps:**

1. **Login**
   - User navigates to app URL
   - If not authenticated: enters email, receives magic link, clicks link
   - If already authenticated (returning session): lands on Overview

2. **Overview Scan** (`/overview`)
   - User views KPI tiles (Yesterday filter or Last 7 Days)
   - Mentally notes: calls up/down, revenue target met, minutes saved
   - Scans Recent Activities for any failed calls (red badges)

3. **Investigate Issue** (if failed call noticed)
   - Clicks failed call row in Recent Activities
   - Navigates to `/call-logs?callId={id}` with drawer open
   - Drawer opens to Transcript tab
   - User reads transcript to understand what went wrong
   - Switches to Summary tab to see AI's interpretation
   - Switches to Internal Chat tab and adds note: "@manager This customer was frustrated about long hold time. Follow up with courtesy call."

4. **Return to Overview**
   - Closes drawer or clicks Overview in sidebar
   - Continues with day

**Duration:** 2-3 minutes
**Frequency:** Daily
**Success Criteria:** User quickly identifies performance trends and any critical issues

---

### 4.2 Journey: Call Investigation & Team Collaboration

**Actor:** Certus Operations Staff
**Trigger:** Customer complaint escalated from restaurant
**Goal:** Investigate specific call, understand context, document findings

**Steps:**

1. **Navigate to Call Logs** (`/call-logs`)
   - User clicks Call Logs in sidebar

2. **Find Target Call**
   - User knows approximate date and customer phone number
   - Sets date range filter to appropriate day
   - Enters partial phone number in search box
   - Table filters to matching calls
   - Identifies target call by timestamp and duration

3. **Open Call Details**
   - Clicks call row
   - Drawer opens with Call Detail view

4. **Analyze Call**
   - **Transcript Tab:** User reads full conversation, searches for keyword "manager" to find escalation point
   - **Summary Tab:** Reviews AI's sentiment assessment (shows "Negative"), sees intents: "complaint", "refund request"
   - **Order Details Tab:** (if order call) Reviews order total and items
   - **Customer Profile Panel:** Sees this customer has called 5 times, spent R2,400 total - VIP customer

5. **Play Recording**
   - Clicks play on audio player
   - Listens to tone and emotion (not captured in transcript)
   - Confirms customer was indeed upset

6. **Document Findings**
   - Switches to Internal Chat tab
   - Adds note: "@support Confirmed customer complaint valid. AI misunderstood refund policy. Suggest updating knowledge base. Customer offered R200 voucher as resolution."
   - Clicks "Post Note"

7. **Follow-up Action**
   - Navigates to Configuration > Knowledge Update
   - Adds note in "Update Notes": "Update refund policy script - see call {call_id} for context"
   - Clicks "Request Knowledge Update"

8. **Close Out**
   - Returns to Call Logs to continue monitoring

**Duration:** 8-12 minutes
**Frequency:** As needed (several times per week)
**Success Criteria:** Complete understanding of call context, team is informed, corrective action initiated

---

### 4.3 Journey: Performance Reporting & Export

**Actor:** Restaurant Operator (preparing for ownership meeting)
**Trigger:** Weekly or monthly management meeting
**Goal:** Export performance data to present to stakeholders

**Steps:**

1. **Navigate to Analytics** (`/analytics`)
   - User clicks Analytics in sidebar

2. **Set Date Range**
   - User selects "Last 30 Days" from date picker
   - Charts and metrics update

3. **Review Visualizations**
   - User reviews Daily Calls chart - notes steady increase
   - Reviews Revenue chart - sees correlation between calls and revenue
   - Reviews Call Type Distribution - notes that Orders are 60% of calls

4. **Export Data**
   - User clicks "Export CSV" button
   - CSV downloads: `certus-analytics-{account}-last-30-days-{timestamp}.csv`
   - User opens in Excel/Google Sheets

5. **Prepare Presentation**
   - User creates slides with data from CSV
   - Includes screenshots of charts from Analytics page
   - Adds narrative about AI performance impact

**Duration:** 10-15 minutes (just the export and review)
**Frequency:** Weekly or monthly
**Success Criteria:** Clean, accurate data export ready for external presentation

---

### 4.4 Journey: Configuration Update

**Actor:** Restaurant Operator
**Trigger:** Restaurant changed business hours for holiday week
**Goal:** Update AI to reflect new hours so calls are handled correctly

**Steps:**

1. **Navigate to Configuration** (`/settings/configuration`)
   - User clicks Settings in sidebar (or uses Quick Action from Overview)
   - Lands on Configuration page, Business Hours section

2. **Review Current Hours**
   - User sees current hours for each day
   - Identifies days that need updates (e.g., closing early on Dec 24)

3. **Update Hours**
   - User clicks on Dec 24 time inputs
   - Changes close time from "22:00" to "18:00"
   - Repeats for Dec 25: checks "Closed" checkbox

4. **Save Changes**
   - User clicks "Save Changes" button
   - Success message appears: "Business hours updated successfully."
   - Confirmation that AI will now follow new hours

5. **Optional: Verify Knowledge**
   - User navigates to Knowledge Update section
   - Reads last update timestamp - sees hours were just updated
   - No additional knowledge update needed (hours sync automatically)

6. **Return to Operations**
   - User navigates back to Overview to continue monitoring

**Duration:** 3-5 minutes
**Frequency:** Occasional (holidays, special events, permanent changes)
**Success Criteria:** Hours updated correctly, AI will handle calls according to new schedule

---

### 4.5 Journey: Demo Mode Exploration

**Actor:** Potential Customer (evaluating Certus)
**Trigger:** Clicked "Try Demo" from marketing website
**Goal:** Understand product capabilities without committing

**Steps:**

1. **Enter Demo Mode**
   - User lands on `/login` (or root `/`)
   - Clicks "Continue with Demo" button
   - Immediately redirected to `/overview` with demo account context

2. **Explore Overview**
   - User sees pre-seeded KPI tiles with realistic numbers
   - Scans Recent Activities table
   - Notices variety of call types and statuses
   - Clicks a call row to see what happens

3. **Explore Call Drawer**
   - Drawer opens with full call details
   - User browses tabs: Transcript, Summary, Order Details
   - Plays audio recording (if included in demo)
   - Sees Internal Chat with example team notes
   - Impressed by level of detail

4. **Explore Analytics**
   - Clicks Analytics in sidebar
   - Sees charts with 30 days of demo data
   - Hovers over chart points, sees tooltips
   - Clicks "Export CSV" to test functionality
   - Downloads CSV, opens to verify data quality

5. **Explore Configuration**
   - Clicks Settings in sidebar
   - Browses Business Hours section
   - Sees AI Voice options
   - Reads about Knowledge Update feature
   - Note: In demo mode, saves may be disabled or show "Demo mode - changes not persisted" message

6. **Decision Point**
   - User impressed by depth of functionality
   - Clicks "Sign Up" CTA (in top bar or demo banner)
   - Exits to signup/contact sales flow

**Duration:** 8-15 minutes
**Frequency:** One-time per prospect
**Success Criteria:** User understands product value and is motivated to sign up

---

## 5. Navigation Architecture

### 5.1 Primary Navigation (Sidebar)

**Persistent Elements:**
- Logo/Brand (clickable ’ Overview)
- Account/Location selector (if multi-tenant)
- User avatar/menu (logout, profile settings future)

**Navigation Items:**
1. **Overview** - Icon: Dashboard/Grid - Route: `/overview`
2. **Call Logs** - Icon: Phone/List - Route: `/call-logs`
3. **Analytics** - Icon: Chart/Graph - Route: `/analytics`
4. **Settings** - Icon: Gear/Cog - Route: `/settings/configuration`

**Visual State:**
- Active page highlighted (background color, border, icon color)
- Hover state on non-active items
- Icon + label (label may collapse on mobile)

### 5.2 Secondary Navigation

**Within Configuration Page:**
- Sub-navigation in left sidebar or top tabs
- Sections: Business Hours, AI Voice, Busy Mode, Knowledge, API Keys
- Hash anchors for deep linking
- Smooth scroll to section on click

**Within Call Logs:**
- No secondary nav (filter panel serves as interface)

### 5.3 Breadcrumbs

**Usage:** Optional in MVP, recommended for future

**Example:**
- Overview > Call Logs > Call Detail
- Settings > Configuration > Business Hours

### 5.4 Deep Linking & State Preservation

**Call Logs:**
- URL preserves filters and drawer state
- Example: `/call-logs?dateFrom=2025-01-01&dateTo=2025-01-31&callType=order&status=completed&callId=call_123`
- Enables sharing links to specific filtered views
- Browser back/forward works correctly

**Analytics:**
- URL preserves date range and location
- Example: `/analytics?dateFrom=2025-01-01&dateTo=2025-01-31&location=loc_456`

**Configuration:**
- Hash anchors preserve section
- Example: `/settings/configuration#business-hours`

---

## 6. Page-to-Page Flow Diagram (Text-Based)

```
             
   Login     
  /login     
      ,      
        (auth success or demo mode)
       ¼
                                                         
                      Overview                            
                     /overview                            
                                                      
   KPI Tiles | Date Range | Location Filter           
   Recent Activities Table                             
   Quick Actions                                       
                                                      
  ,                  ,               ,                  
                                    
    (call row click) (quick action)  (sidebar nav)
                                    
   ¼                  ¼               ¼
                                            
  Call Logs       Settings      Analytics   
  /call-logs      /settings     /analytics  
      ,              ,                      
                       
        (row click)     (section nav)
       ¼                ¼
                                              
         Call Detail Drawer (overlay)         
                                           
   Tabs: Transcript | Summary | Order |   
         Internal Chat                     
                                           
   Customer Profile Panel (side)          
                                           
  (close drawer ’ back to Call Logs)         
                                              

All pages accessible via sidebar at any time:
Overview ” Call Logs ” Analytics ” Settings
```

---

## 7. Modal & Drawer Patterns

### 7.1 Call Detail Drawer

**Type:** Right-hand slide-out panel (Sheet/Drawer)
**Trigger:** Clicking call row in Overview or Call Logs
**Behavior:**
- Animates in from right edge
- Overlays main content (main content dimmed)
- Width: 60-70% of viewport on desktop, 100% on mobile
- Height: 100% viewport height
- Scrollable content within drawer
- Close actions:
  - Click X button
  - Click dimmed background (optional)
  - Press Escape key
  - Browser back button
- On close: removes `callId` query param, stays on Call Logs page

**Accessibility:**
- Focus trap within drawer when open
- Focus returns to clicked row on close
- ARIA labels: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="drawer-title"`

### 7.2 Confirmation Dialogs

**Type:** Center modal
**Trigger:** Destructive actions (e.g., revoke API key, discard unsaved changes)
**Behavior:**
- Small centered modal (max-width 400-500px)
- Overlays all content with backdrop
- Contains: Title, message, Cancel button (secondary), Confirm button (primary/destructive)
- Close actions:
  - Click Cancel
  - Click Confirm (performs action then closes)
  - Click backdrop (optional, same as Cancel)
  - Press Escape (same as Cancel)

**Example Usage:**
- "Revoke API Key?" ’ "This will break any integrations using this key. This cannot be undone." [Cancel] [Revoke Key]
- "Discard Changes?" ’ "You have unsaved changes. Discard them?" [Keep Editing] [Discard]

### 7.3 Toast Notifications

**Type:** Temporary notification banner
**Trigger:** Action feedback (save success, errors, info messages)
**Behavior:**
- Appears top-right or bottom-right of screen
- Auto-dismisses after 3-5 seconds (or user dismisses)
- Types: Success (green), Error (red), Warning (yellow), Info (blue)
- Non-blocking, doesn't require user interaction

**Example Messages:**
- Success: "Business hours updated successfully."
- Error: "Failed to save changes. Please try again."
- Info: "Knowledge update request submitted. Processing typically takes 15 minutes."

---

## 8. Responsive Behavior & Breakpoints

### 8.1 Breakpoints

**Following Tailwind defaults:**
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (sm to lg)
- **Desktop:** > 1024px (lg+)

### 8.2 Layout Adaptations

**Sidebar Navigation:**
- Desktop: Full sidebar, always visible, icon + label
- Tablet: Collapsible sidebar, icon only when collapsed, hamburger toggle
- Mobile: Hidden by default, full-screen overlay menu on hamburger click

**Overview Page:**
- Desktop: KPI tiles in 5-column grid, full Recent Activities table
- Tablet: KPI tiles in 2-3 column grid (responsive), table scrollable horizontally if needed
- Mobile: KPI tiles in 1-2 column grid (stacked), table shows limited columns with horizontal scroll

**Call Logs Page:**
- Desktop: Filter panel on left, table on right, drawer 60-70% width
- Tablet: Filters collapsible, table full width when filters collapsed, drawer 80% width
- Mobile: Filters in bottom sheet or collapsed accordion, table simplified (fewer columns), drawer 100% width (full screen)

**Call Detail Drawer:**
- Desktop: Two-section layout (main tabs + customer profile side-by-side)
- Tablet: Two-section layout (may adjust ratios to 70/30)
- Mobile: Single column, tabs full width, customer profile below tabs (scroll to see)

**Analytics Page:**
- Desktop: Charts in 2-column grid, full table visible
- Tablet: Charts in 1-column stack, table scrollable
- Mobile: Charts full width stacked, table scrollable with simplified columns

**Configuration Page:**
- Desktop: Left section nav, right form content
- Tablet: Section nav collapses to dropdown, form full width
- Mobile: Section nav as sticky dropdown at top, form full width

---

## 9. Loading & Error States

### 9.1 Loading States

**Page-Level Loading (Initial Load):**
- Full page skeleton screen matching layout structure
- Skeleton for KPI tiles, table headers, chart placeholders
- Shimmer animation for polish

**Component-Level Loading (Data Refresh):**
- Spinner or skeleton within component boundary
- Example: Table shows "Loading..." row or skeleton rows
- Charts show skeleton with axis and empty data area

**Action Loading (Button/Form Submit):**
- Button shows spinner + "Saving..." text
- Button disabled during loading
- Example: "Save Changes" ’ (spinner) "Saving..." ’ "Saved!" ’ back to "Save Changes"

**Drawer Loading:**
- When opening drawer, show skeleton content while fetching
- Transcript tab: skeleton lines
- Summary tab: skeleton badges and bullet points
- Smooth transition from skeleton to real content

### 9.2 Error States

**Page-Level Error:**
- Replace page content with error message component
- Includes: Friendly message, error icon, "Reload Page" button
- Example: "Unable to load page. Please check your connection and try again."

**Component-Level Error:**
- Show error message within component boundary
- Includes: Error icon, message, "Try Again" button (retries fetch)
- Example in KPI tile: "Failed to load" with refresh icon button
- Example in table: "Unable to load calls. [Try Again]"

**Form Validation Errors:**
- Inline errors below/beside input fields
- Red border on invalid inputs
- Error icon + message
- Examples:
  - "End time must be after start time."
  - "Phone number format invalid."
  - "Required field."

**Action Errors (Save/Submit Failed):**
- Toast notification with error message
- Form remains in editable state (data not lost)
- Example toast: "Failed to save business hours. Please try again."

**Empty States (Not Errors, but Related):**
- Zero-data states should be informative and actionable
- Include: Illustration/icon, heading, explanation, CTA (if applicable)
- Examples:
  - Call Logs: "No calls found. Try adjusting your filters."
  - Internal Chat: "No notes yet. Be the first to add context for your team."
  - Analytics (no data in range): "No analytics data available for the selected period. Try expanding your date range."

---

## 10. Accessibility (A11y) Considerations

### 10.1 WCAG Compliance Target

**Level:** WCAG 2.1 AA minimum

**Key Requirements:**
- Color contrast ratios e 4.5:1 for normal text, e 3:1 for large text
- All functionality keyboard accessible (no mouse-only interactions)
- Focus indicators clearly visible
- Screen reader compatibility (semantic HTML, ARIA labels)

### 10.2 Keyboard Navigation

**Global:**
- Tab: Navigate forward through interactive elements
- Shift+Tab: Navigate backward
- Enter/Space: Activate buttons/links
- Escape: Close modals/drawers

**Tables:**
- Arrow keys: Navigate cells (optional enhancement)
- Tab: Jump to next interactive element (filter, pagination)

**Filters/Forms:**
- Tab: Navigate inputs
- Enter: Submit form (if applicable)
- Escape: Cancel/close (if in modal/drawer)

**Drawer:**
- Tab cycles through elements within drawer (focus trap)
- Shift+Tab cycles backward
- Escape closes drawer

### 10.3 Screen Reader Support

**Semantic HTML:**
- Use proper heading hierarchy (h1 ’ h2 ’ h3)
- Use `<button>` for buttons, `<a>` for links, `<table>` for tables
- Use `<label>` for form inputs with `for` attribute

**ARIA Labels:**
- Drawers: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{title-id}"`
- Icons without text: `aria-label="descriptive text"`
- Loading states: `aria-live="polite"` regions for dynamic content updates
- Error messages: `aria-live="assertive"` for critical errors
- Tables: `<caption>` or `aria-label` on `<table>`

**Focus Management:**
- On drawer open: focus moves to drawer (title or close button)
- On drawer close: focus returns to trigger element
- On page navigation: focus moves to main content heading

### 10.4 Visual Accessibility

**Color Usage:**
- Never rely on color alone to convey information
- Use icons + text labels for status badges (not just color)
- Example: "Completed" badge is green with checkmark icon

**Text Sizing:**
- Minimum 16px base font size
- Respect user's browser zoom settings
- Relative units (rem/em) for scalability

**High Contrast Mode:**
- Ensure UI remains usable in OS high contrast modes
- Test with Windows High Contrast and macOS Increase Contrast

---

## 11. Performance Budgets & Targets

### 11.1 Page Load Times (Initial Load)

| Page | Target (TTFB + FCP) | Max Acceptable |
|------|---------------------|----------------|
| Overview | < 1.5s | 2s |
| Call Logs | < 1.2s | 1.8s |
| Analytics | < 1.5s | 2.5s |
| Configuration | < 1s | 1.5s |

### 11.2 Interaction Response Times

| Action | Target | Max Acceptable |
|--------|--------|----------------|
| Drawer open (Call Detail) | < 300ms | 400ms |
| Filter apply (table) | < 500ms | 800ms |
| Date range change | < 600ms | 1s |
| Form save (settings) | < 800ms | 1.2s |
| CSV export trigger | < 1s | 2s |
| Note post (Internal Chat) | < 600ms | 1s |

### 11.3 Asset Sizes

| Asset Type | Target | Max Acceptable |
|------------|--------|----------------|
| Initial JS bundle | < 200 KB (gzip) | 300 KB |
| Initial CSS | < 30 KB (gzip) | 50 KB |
| Web fonts | < 50 KB (subset) | 100 KB |
| Chart library | < 100 KB (gzip) | 150 KB |

### 11.4 Database Query Performance

| Query Type | Target | Max Acceptable |
|------------|--------|----------------|
| KPI aggregation (mv_metrics_daily) | < 100ms | 200ms |
| Call list paginated (calls_v) | < 150ms | 300ms |
| Call detail fetch (joins) | < 100ms | 200ms |
| Analytics time series | < 200ms | 400ms |

---

## 12. Future Enhancements & Out-of-Scope (MVP)

**These items are documented for future reference but NOT included in MVP page map:**

### 12.1 Additional Pages (Post-MVP)

**Notifications Center**
- Route: `/notifications`
- Aggregated notifications for @mentions, knowledge update completions, call anomalies
- Mark as read, filter by type

**Team Management**
- Route: `/settings/team`
- User management: invite, remove, role assignment (when RBAC expanded)

**Billing & Subscription**
- Route: `/settings/billing`
- Plan details, payment method, usage metrics, invoices

**Advanced Analytics**
- Route: `/analytics/advanced`
- Cohort analysis, A/B testing results, ML model performance

**Location Management**
- Route: `/settings/locations`
- CRUD for locations, per-location settings hub

**Integrations Hub**
- Route: `/settings/integrations`
- POS integration status, n8n workflow monitoring, webhook configuration

### 12.2 Feature Enhancements (Existing Pages)

**Overview:**
- Customizable KPI tiles (drag-and-drop, show/hide)
- Quick filters: "Show only failed calls", "Show only high-value orders"
- Trend sparklines within KPI tiles

**Call Logs:**
- Bulk actions: tag multiple calls, export selected
- Saved filter presets: "My Daily Review", "Failed Calls This Week"
- Customer 360 profile: dedicated customer detail page (not just panel)

**Analytics:**
- Custom date comparisons: "This month vs last month", "This Q vs last Q"
- Forecasting: predictive trends based on historical data
- Drilldown: click chart segment to filter call logs
- Scheduled reports: email CSV/PDF on recurring schedule

**Configuration:**
- A/B testing controls: test voice variations, scripts
- Role-based access controls (RBAC): granular permissions
- Audit log: who changed what setting when
- Advanced knowledge management: upload menus, PDFs, scrape website

**Call Detail Drawer:**
- Sentiment trend over conversation (mini chart)
- Caller emotion detection (tone analysis)
- Playback speed control, loop segments
- Share call link (secure, expiring link for support tickets)

### 12.3 Technical Enhancements

**Real-time Updates:**
- WebSocket/Server-Sent Events for live call updates in Overview and Call Logs
- Live typing indicators in Internal Chat

**Offline Support:**
- Service worker for basic offline viewing of cached calls
- Offline queue for notes (sync when connection restored)

**Advanced Search:**
- Full-text search across transcripts, summaries, notes
- Faceted search: by intent, entity, sentiment, etc.

**Mobile Apps:**
- Native iOS and Android apps for on-the-go monitoring
- Push notifications for critical events

---

## 13. Conclusion & Maintenance

This page map is a living document and should be updated whenever:
- New pages or features are added
- User flows change based on feedback or usability testing
- Navigation structure is modified
- Performance targets are revised

**Document Owner:** UX Researcher
**Review Cadence:** Quarterly or before major feature releases
**Approval Required From:** Product Owner, Frontend Developer, UI Designer

**Related Documentation:**
- `docs/ux/user_flows.md` - Detailed user flow diagrams and scenarios
- `docs/ui/components_map.md` - Component inventory and usage
- `docs/ui/tokens.json` - Design tokens (colors, spacing, typography)
- `docs/ui/layout.md` - Layout grid and responsive specifications
- `docs/ui/microcopy.md` - All UI text, labels, and messages

---

**Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-09-25 | UX Researcher | Initial page map based on PRD v1.1 and Architecture v1.0 |
