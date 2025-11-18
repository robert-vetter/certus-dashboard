# Components Map — Figma to Code

**Version:** 1.0
**Last Updated:** 2025-11-15
**Purpose:** Maps Figma design components to shadcn/ui components and custom React components

**Related Docs:**
- [tokens.json](./tokens.json) — Design tokens extracted from Figma
- [interaction_specs.md](./interaction_specs.md) — Animation and interaction specifications
- [page_map.md](../ux/page_map.md) — Page structure and user flows

---

## Table of Contents

1. [Overview](#overview)
2. [shadcn/ui Components Required](#shadcnui-components-required)
3. [Component Mapping](#component-mapping)
4. [Custom Components](#custom-components)
5. [Implementation Notes](#implementation-notes)

---

## Overview

This document maps each Figma component from the Overview page design to:
1. **shadcn/ui base components** (if applicable)
2. **Custom React components** we need to build
3. **Tailwind CSS classes** for styling
4. **Component props and variants**

---

## shadcn/ui Components Required

Install these shadcn/ui components for the project:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add sheet  # For drawer
npx shadcn@latest add tabs
npx shadcn@latest add select  # For dropdowns/filters
```

---

## Component Mapping

### 1. Layout Components

#### 1.1 Sidebar Navigation

**Figma Component:** `SideBar Dark/white`

| Property | Value |
|----------|-------|
| **Base Component** | Custom `<Sidebar>` |
| **Width** | 80px (fixed) |
| **Padding** | 32px 16px |
| **Gap** | 40px |
| **Background** | #FFFFFF |
| **Border** | 0.5px solid #D8D8D8 (right) |

**Structure:**
```tsx
<aside className="w-20 h-full bg-white border-r border-neutral-100 flex flex-col items-center py-8 px-4 gap-10">
  {/* Logo */}
  <CertusLogo />

  {/* Navigation Items */}
  <nav className="flex flex-col items-center gap-2">
    <SidebarNavItem icon={House} active />
    <SidebarNavItem icon={AlignLeft} />
    <SidebarNavItem icon={PhoneList} />
    <SidebarNavItem icon={GearSix} />
  </nav>
</aside>
```

**Icon Mapping:**
- House (Home) → active state: `bg-primary-400` with inset shadow
- AlignLeft (Analytics) → `#9D9D9D` (neutral-200)
- PhoneList (Call Logs) → `#9D9D9D`
- GearSix (Settings) → `#9D9D9D`

**Active State:**
```tsx
// Active nav item
className="flex items-center justify-center p-2 rounded-lg bg-primary-50/13"

// Inner button (active)
className="flex items-center justify-center p-2 bg-primary-400 rounded-lg shadow-[inset_0_0_4.3px_#BF001B]"
```

#### 1.2 Header / Top Bar

**Figma Component:** `Frame 28` (Header section)

| Property | Value |
|----------|-------|
| **Base Component** | Custom `<DashboardHeader>` |
| **Height** | 92px |
| **Padding** | 20px 28px |
| **Border Bottom** | 0.5px solid #D8D8D8 |

**Structure:**
```tsx
<header className="h-[92px] px-7 py-5 bg-white border-b border-neutral-100 flex items-center justify-between gap-2">
  {/* Left: Greeting */}
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-medium text-neutral-800">
      Good Morning, Gurveer
    </h1>
    <p className="text-lg text-neutral-300">
      See how certus does during his 24/7 shift!
    </p>
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-5">
    {/* Referral Banner */}
    <ReferralBanner />
    {/* User Avatar */}
    <UserAvatar />
  </div>
</header>
```

#### 1.3 Main Content Area

**Figma Component:** `Frame 37` (Main content wrapper)

| Property | Value |
|----------|-------|
| **Padding** | 0px 28px (left/right only) |
| **Gap** | 20px (between sections) |
| **Background** | rgba(216, 216, 216, 0.15) |

```tsx
<main className="flex-1 bg-background-secondary px-7 py-0 flex flex-col gap-5">
  {/* Filter Tabs */}
  <FilterTabs />

  {/* KPI Grid + Quick Actions */}
  <div className="flex gap-6">
    <KPISection />
    <QuickActions />
  </div>

  {/* Recent Activities */}
  <RecentActivitiesTable />
</main>
```

---

### 2. UI Components

#### 2.1 KPI Tile

**Figma Components:** `Frame 32`, `Frame 33`, `Frame 34` (Total Calls, Total Revenue, Minutes Saved)

| Property | Value |
|----------|-------|
| **Base Component** | shadcn `<Card>` + custom wrapper |
| **Width** | 242px (flex-grow: 1) |
| **Height** | 140px |
| **Border** | 0.5px solid #D8D8D8 |
| **Border Radius** | 8px |
| **Gap** | 24px (between header and content) |

**Component Structure:**
```tsx
import { Card } from "@/components/ui/card"

interface KPITileProps {
  icon: React.ComponentType
  label: string
  value: string
  iconColor?: string
}

<Card className="w-[242px] h-[140px] border-neutral-100 border-[0.5px] rounded-lg flex flex-col justify-between p-0 gap-6">
  {/* Header */}
  <div className="h-[60px] px-5 py-5 border-b border-neutral-100 flex items-center gap-2.5">
    <Icon className="w-5 h-5 text-primary-400" />
    <span className="text-lg font-normal text-neutral-400 capitalize">
      {label}
    </span>
  </div>

  {/* Value */}
  <div className="h-[57px] px-5 py-5 flex items-center">
    <span className="text-2xl font-medium text-neutral-700">
      {value}
    </span>
  </div>
</Card>
```

**Icon Mapping:**
- Phone → Total Calls
- CreditCard → Total Revenue
- ClockCountdown → Minutes Saved
- ListDashes → Orders Placed
- CallBell → Reservations Booked

**Tailwind Classes (extracted):**
```tsx
// KPI Tile Container
"w-[242px] h-[140px] bg-white border-[0.5px] border-neutral-100 rounded-lg"

// Header Section
"h-[60px] px-5 py-5 border-b border-neutral-100"

// Icon
"w-5 h-5 text-primary-400"

// Label
"text-lg font-normal leading-[19px] text-neutral-400 capitalize"

// Value Section
"h-[57px] px-5 py-5"

// Value Text
"text-2xl font-medium leading-[29px] text-neutral-700"
```

#### 2.2 Quick Action Card

**Figma Component:** `Frame 29`, `Frame 30`, `Frame 31` (Quick Actions)

| Property | Value |
|----------|-------|
| **Base Component** | shadcn `<Card>` + custom clickable wrapper |
| **Width** | 322px |
| **Height** | 65.67px (~66px) |
| **Padding** | 8px 16px |
| **Border** | 0.5px solid #D8D8D8 |
| **Border Radius** | 8px |

**Component Structure:**
```tsx
interface QuickActionProps {
  icon: React.ComponentType
  title: string
  description: string
  onClick: () => void
}

<Card className="w-[322px] h-[66px] bg-white border-[0.5px] border-neutral-100 rounded-lg px-4 py-2 flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] transition-transform duration-150">
  {/* Left: Icon + Text */}
  <div className="flex items-center gap-4">
    {/* Icon Container */}
    <div className="w-[34px] h-[34px] bg-primary-400 rounded-lg flex items-center justify-center p-2">
      <Icon className="w-[18px] h-[18px] text-white" />
    </div>

    {/* Text */}
    <div className="flex flex-col gap-1">
      <span className="text-lg font-normal text-neutral-500">
        {title}
      </span>
      <span className="text-sm font-light text-neutral-400">
        {description}
      </span>
    </div>
  </div>

  {/* Right: Chevron */}
  <CaretRight className="w-4 h-4 text-neutral-400" />
</Card>
```

**Actions:**
1. Change AI voice (UserSound icon)
2. Update hours (Clock icon)
3. Update knowledge (Brain icon)

#### 2.3 Filter Tabs

**Figma Component:** `Frame 30` (All, Today, Last 24 hours, Yesterday)

| Property | Value |
|----------|-------|
| **Base Component** | Custom `<FilterTabs>` (not shadcn Tabs) |
| **Height** | 27px |
| **Gap** | 8px |
| **Border Radius** | 8px |

**Active Tab Style:**
```tsx
// Active tab
className="h-[27px] px-6 py-1.5 bg-gradient-to-b from-[rgba(255,218,224,0.35)] to-[rgba(255,218,224,0.35)] bg-white border-[0.5px] border-primary-200 rounded-lg"

// Active text
className="text-sm font-medium text-primary-400"
```

**Inactive Tab Style:**
```tsx
// Inactive tab
className="h-3 px-2 py-0 flex items-center justify-center"

// Inactive text
className="text-xs font-normal text-neutral-400"
```

#### 2.4 Recent Activities Table

**Figma Component:** `Frame 54` (Recent Activities section)

| Property | Value |
|----------|-------|
| **Base Component** | shadcn `<Table>` |
| **Container Padding** | 12px 20px |
| **Border** | 0.5px solid #D8D8D8 |
| **Border Radius** | 12px |
| **Backdrop Filter** | blur(8.75px) |

**Table Structure:**
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Card className="w-full border-[0.5px] border-neutral-100 rounded-xl backdrop-blur-[8.75px] p-3 flex flex-col gap-5">
  {/* Header */}
  <div className="px-0 py-3 border-b border-neutral-100">
    <h2 className="text-xl font-medium text-neutral-800">
      Recent Activities
    </h2>
  </div>

  {/* Table */}
  <Table>
    <TableHeader>
      <TableRow className="py-2">
        <TableHead className="px-1 text-lg font-medium text-neutral-800">Time</TableHead>
        <TableHead className="px-1 text-lg font-medium text-neutral-800">Type</TableHead>
        <TableHead className="px-2 text-lg font-medium text-neutral-800">Summary</TableHead>
        <TableHead className="px-2 text-lg font-medium text-neutral-800">Type</TableHead>
        <TableHead className="px-1 text-lg font-medium text-neutral-800">Call Health</TableHead>
        <TableHead className="px-1 text-lg font-medium text-neutral-800">From</TableHead>
        <TableHead className="px-1 text-lg font-medium text-neutral-800">Duration</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {activities.map((activity) => (
        <TableRow key={activity.id} className="hover:bg-neutral-50 transition-colors duration-120 cursor-pointer">
          <TableCell className="text-base font-normal text-neutral-400 uppercase">
            {activity.time}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary-400" />
              <span className="text-base font-normal text-neutral-400">
                {activity.type}
              </span>
            </div>
          </TableCell>
          {/* ... more cells */}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Card>
```

**Table Cell Types:**
- Time: `12:41 PM` (uppercase, text-neutral-400)
- Type icon: Phone, Scooter, ClipboardText (20x20, primary-400)
- Type text: `Other`, `Delivery`, `Take-Out` (text-neutral-400)
- Summary: `Reservation for 4` (text-neutral-400)
- Call Type: `order`, `reservation`, `catering` (text-neutral-400)
- Call Health: Green/Yellow badge (14px height, rounded-full)
- From: Phone number (text-neutral-400)
- Duration: `0m 30s`, `1m 15s` (text-neutral-400)

#### 2.5 Status Badge (Call Health)

**Figma Component:** `Frame 121`, `Frame 122` (Success/Warning indicators)

| Property | Value |
|----------|-------|
| **Base Component** | shadcn `<Badge>` customized |
| **Height** | 14px |
| **Width** | 20px |
| **Padding** | 0px 4px |
| **Border Radius** | 32px (full) |

**Variants:**
```tsx
// Success (Green)
className="h-[14px] w-5 px-1 py-0 bg-success-500 rounded-full"

// Warning (Yellow)
className="h-[14px] w-5 px-1 py-0 bg-warning-500 rounded-full"
```

#### 2.6 User Avatar

**Figma Component:** `Frame 47` (User avatar with initials)

| Property | Value |
|----------|-------|
| **Base Component** | shadcn `<Avatar>` |
| **Size** | 35x35px |
| **Border Radius** | 56px (full circle) |
| **Background** | #EF3450 (primary-400) |
| **Padding** | 8px |

```tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

<Avatar className="w-[35px] h-[35px] bg-primary-400 rounded-full p-2">
  <AvatarFallback className="text-sm font-normal text-white uppercase">
    CW
  </AvatarFallback>
</Avatar>
```

#### 2.7 Referral Banner

**Figma Component:** `Frame 30` (Earn £200 - Refer a Friend)

| Property | Value |
|----------|-------|
| **Width** | 216px |
| **Height** | 34px |
| **Padding** | 8px 12px |
| **Border** | 0.5px solid #D8D8D8 |
| **Border Radius** | 8px |

```tsx
<div className="w-[216px] h-[34px] px-3 py-2 bg-white border-[0.5px] border-neutral-100 rounded-lg flex items-center justify-center gap-2">
  <span className="text-md font-normal text-primary-400">
    Earn £200 - Refer a Friend
  </span>
  <X className="w-3.5 h-3.5 text-neutral-400" />
</div>
```

---

## Custom Components

These are custom React components we need to build (not in shadcn/ui):

### 1. `<Sidebar>` Component
**File:** `/components/layout/Sidebar.tsx`

Props:
- `activeItem?: 'home' | 'analytics' | 'call-logs' | 'settings'`

### 2. `<SidebarNavItem>` Component
**File:** `/components/layout/SidebarNavItem.tsx`

Props:
- `icon: React.ComponentType`
- `active?: boolean`
- `onClick?: () => void`

### 3. `<DashboardHeader>` Component
**File:** `/components/layout/DashboardHeader.tsx`

Props:
- `greeting: string` (e.g., "Good Morning, Gurveer")
- `subtitle: string`

### 4. `<KPITile>` Component
**File:** `/components/dashboard/KPITile.tsx`

Props:
```tsx
interface KPITileProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
}
```

### 5. `<QuickActionCard>` Component
**File:** `/components/dashboard/QuickActionCard.tsx`

Props:
```tsx
interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  onClick: () => void
}
```

### 6. `<FilterTabs>` Component
**File:** `/components/dashboard/FilterTabs.tsx`

Props:
```tsx
interface FilterTabsProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}
```

### 7. `<RecentActivitiesTable>` Component
**File:** `/components/dashboard/RecentActivitiesTable.tsx`

Props:
```tsx
interface Activity {
  id: string
  time: string
  callType: 'phone' | 'delivery' | 'takeout'
  summary: string
  type: 'order' | 'reservation' | 'catering' | 'other'
  callHealth: 'success' | 'warning' | 'error'
  from: string
  duration: string
}

interface RecentActivitiesTableProps {
  activities: Activity[]
  onRowClick: (activity: Activity) => void
}
```

### 8. `<StatusBadge>` Component
**File:** `/components/ui/StatusBadge.tsx`

Props:
```tsx
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
}
```

---

## Implementation Notes

### Color Mapping (Figma → Tailwind)

| Figma Color | Hex | Tailwind Class |
|-------------|-----|----------------|
| Primary | #EF3450 | `bg-primary-400`, `text-primary-400` |
| Primary Hover | #EE2B47 | `bg-primary-500` |
| Primary Dark | #BF001B | `bg-primary-600` |
| Primary Light | #F8AAB5 | `border-primary-200` |
| Primary Lightest | #FFDAE0 | `bg-primary-50` |
| Text Primary | #18191C | `text-neutral-800` |
| Text Secondary | #747577 | `text-neutral-400` |
| Text Tertiary | #8E8E8E | `text-neutral-300` |
| Border | #D8D8D8 | `border-neutral-100` |
| Icon Gray | #9D9D9D | `text-neutral-200` |
| Background | #F6F6F6 | `bg-neutral-50` |
| Success | #48B648 | `bg-success-500` |
| Warning | #F1CE43 | `bg-warning-500` |

### Typography Mapping

| Figma Style | Font Size | Weight | Line Height | Tailwind Class |
|-------------|-----------|--------|-------------|----------------|
| Greeting (h1) | 24px | 500 | 29px | `text-2xl font-medium` |
| Subtitle | 16px | 400 | 19px | `text-lg font-normal` |
| Section Title | 20px | 500 | 24px | `text-xl font-medium` |
| KPI Label | 16px | 400 | 19px | `text-lg font-normal capitalize` |
| KPI Value | 24px | 500 | 29px | `text-2xl font-medium` |
| Quick Action Title | 16px | 400 | 19px | `text-lg font-normal` |
| Quick Action Desc | 12px | 300 | 15px | `text-sm font-light` |
| Table Header | 16px | 500 | 19px | `text-lg font-medium` |
| Table Cell | 14px | 400 | 17px | `text-base font-normal` |
| Filter Tab Active | 12px | 500 | 15px | `text-sm font-medium` |
| Filter Tab Inactive | 10px | 400 | 12px | `text-xs font-normal` |

### Icon Library

Use **Phosphor Icons** (as indicated in Figma comments):
```bash
npm install @phosphor-icons/react
```

Icon mapping:
- `House` — Home/Overview
- `AlignLeft` — Analytics
- `PhoneList` — Call Logs
- `GearSix` — Settings
- `Phone` — Total Calls
- `CreditCard` — Total Revenue
- `ClockCountdown` — Minutes Saved
- `ListDashes` — Orders Placed
- `CallBell` — Reservations Booked
- `UserSound` — Change AI Voice
- `Clock` — Update Hours
- `Brain` — Update Knowledge
- `Scooter` — Delivery
- `ClipboardText` — Take-Out
- `CaretRight` — Arrow Right
- `X` — Close

### Responsive Behavior

From the Figma design (1280px wide), responsive breakpoints:

- **Desktop (1280px+)**: Full layout as shown
- **Tablet (768px - 1279px)**:
  - Stack KPI tiles in 2 columns
  - Quick Actions below KPIs (full width)
  - Table horizontal scroll
- **Mobile (<768px)**:
  - Sidebar collapses to hamburger
  - KPI tiles stack vertically
  - Quick Actions stack vertically
  - Table with limited columns, horizontal scroll

### Next Steps

1. ✅ Install shadcn/ui components listed above
2. ✅ Configure `tailwind.config.js` with tokens from `tokens.json`
3. ✅ Create custom components in `/components` directory
4. ✅ Implement Overview page using components
5. ⏳ Add animations from `interaction_specs.md` (basic hover states done)
6. 🔲 Implement Call Logs page
7. 🔲 Implement Analytics page
8. 🔲 Implement Configuration page

---

## ✅ Implementation Status

### Completed Components

#### Call Logs Components (`/components/dashboard/`)
- ✅ `call-detail-sheet.tsx` - Right-hand sheet drawer for call details
  - **File:** [components/dashboard/call-detail-sheet.tsx](../../components/dashboard/call-detail-sheet.tsx)
  - **shadcn/ui Base:** `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `Badge`
  - **Purpose:** Displays complete call details in a side panel

  **Interface:**
  ```tsx
  interface CallDetailData {
    // Basic call info
    id: string;
    call_id: string;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    from_number: string;
    certus_number: string;
    status: string;
    recording_url?: string;

    // Call content
    transcript_md?: string;
    summary_md?: string;
    call_summary?: string;
    call_summary_short?: string;

    // Call metadata
    call_type?: string;
    pathway_tags_formatted?: string;
    call_health: 'success' | 'warning' | 'error';

    // Related data
    orders?: Array<{ order_id, total_amount, subtotal, ... }>;
    reservations?: Array<{ reservation_id, guest_count, ... }>;
    upsells?: Array<{ upsell_id, upselled_value, ... }>;
    complaints?: Array<{ complaint_id, type, complaint, ... }>;
    internal_notes?: Array<{ note_id, note_text, ... }>;
  }

  interface CallDetailSheetProps {
    call: CallDetailData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading?: boolean;
  }
  ```

  **Layout Structure:**
  ```tsx
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
      {/* Sticky Header (always visible) */}
      <div className="sticky top-0 bg-white border-b z-10 px-6 py-4">
        <SheetHeader>
          <SheetTitle>{formatPhoneNumber(call.from_number)}</SheetTitle>
          <div>Date, Time, Duration, Call Type</div>
        </SheetHeader>
      </div>

      {/* Scrollable Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Top Banner (conditional) */}
        {hasOrder && <OrderBanner />}
        {hasReservation && <ReservationBanner />}
        {hasComplaint && <ComplaintBanner />}

        {/* Recording */}
        {recording_url && <audio controls />}

        {/* Conversation Transcript */}
        {chatMessages.length > 0 && <ConversationSection />}

        {/* Order Details */}
        {hasOrder && <OrderDetailsSection />}

        {/* Reservation Details */}
        {hasReservation && <ReservationDetailsSection />}

        {/* Summary */}
        {call.call_summary && <SummarySection />}
      </div>
    </SheetContent>
  </Sheet>
  ```

  **Key Features:**
  1. **Conditional Top Banner** — Shows different styled banners based on call outcome:
     - **Order Banner:** Green gradient with total amount and fulfillment type
     - **Reservation Banner:** Blue gradient with guest count and date/time
     - **Complaint Banner:** Red gradient with complaint details

  2. **Health Indicator** — Colored dot in header:
     - Success: `bg-emerald-500` (green)
     - Warning: `bg-amber-500` (yellow)
     - Error: `bg-red-500` (red)

  3. **Conversation Transcript:**
     - Speaker avatars (AI = red, Customer = blue)
     - Speaker labels in uppercase
     - Parsed from markdown format (`**Certus:**` and `**Customer:**`)

  4. **Order Details:**
     - **CRITICAL:** Uses `order.total_amount` directly from `order_logs` (fully reliable)
     - Never calculates totals from component fields
     - Shows full order breakdown: subtotal, tax, delivery, tip, total
     - Displays `full_order` field if available

  5. **Skeleton Loader:**
     - Shown when `isLoading = true` or `call = null`
     - See [components/dashboard/skeletons.tsx](../../components/dashboard/skeletons.tsx)
     - `CallDetailSheetSkeleton` component

  **Design Patterns:**
  - Sticky header for context while scrolling
  - Gradient backgrounds for outcome banners
  - Space-y-6 for consistent section spacing
  - `border-t` separators for major sections
  - Amount formatting: `${(amount / 100).toFixed(2)}`

  **Helper Functions:**
  ```tsx
  const formatTime = (dateString: string) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPhoneNumber = (num: string) => {
    // Returns (123) 456-7890 format
  };

  const parseTranscript = (transcript: string): ChatMessage[] => {
    // Parses markdown into { speaker, text }[] array
  };
  ```

  **Database Reliability Notes:**
  - ✅ `order_logs.total_amount` is FULLY RELIABLE — use directly
  - ✅ All `order_logs` fields are accurate
  - ❌ Never use `call_logs.order_made` boolean (unreliable)
  - ✅ Check actual rows in `order_logs` to determine if order exists

- ✅ `call-logs-client.tsx` - Client component wrapper for Call Logs page
  - **File:** [app/(dashboard)/call-logs/call-logs-client.tsx](../../app/(dashboard)/call-logs/call-logs-client.tsx)
  - **Purpose:** Handles client-side state for filters, selected call, and drawer
  - **Features:**
    - Location selector (for franchise owners with multiple locations)
    - Time range filter tabs (Today/Yesterday/Week/All)
    - Stats summary cards (Total Calls, Orders, Reservations, Avg Duration)
    - Call list table with clickable rows
    - Opens CallDetailSheet in drawer when row clicked

#### Layout (`/components/layout/`)
- ✅ `sidebar.tsx` - Navigation sidebar with white theme, Certus logo, active states
- ✅ `dashboard-header.tsx` - Header with greeting, referral banner, user avatar
- ✅ `layout.tsx` - Overall dashboard layout structure

#### Dashboard Components (`/components/dashboard/`)
- ✅ `kpi-tile.tsx` - KPI display with icon, label, value, trends
  - **Actual Implementation:**
    ```tsx
    interface KPITileProps {
      icon: string;           // SVG filename (without path)
      label: string;
      value: string | number;
      trend?: {
        direction: 'up' | 'down';
        value: string;
      };
      highlighted?: boolean;  // Auto-applies to revenue
    }
    ```
  - Features: Revenue auto-highlighting, trend indicators, gradient backgrounds

- ✅ `quick-action-card.tsx` - Action buttons with icons and descriptions
  - **Actual Implementation:**
    ```tsx
    interface QuickActionCardProps {
      icon: string;
      title: string;
      description: string;
      badge?: string;        // Optional status badge
      onClick?: () => void;
    }
    ```
  - Features: Gradient icon badge, hover animations, optional status badges

- ✅ `recent-activities-table.tsx` - Modern grid-based table
  - **Actual Implementation:**
    - Uses CSS Grid instead of HTML table for modern styling
    - Health indicators with colored dots and rings
    - Hover states with background transitions
    - Clickable rows for navigation

### Completed Pages

#### Overview Page (`/app/(dashboard)/overview/page.tsx`)
- ✅ Time filter tabs
- ✅ 6 KPI tiles (Revenue 30% larger)
- ✅ Quick Actions sidebar
- ✅ Recent Activities table
- ✅ Default filter: "Today"

### Design System Implementation

#### Actual Tailwind Classes Used
```tsx
// Card pattern (used everywhere)
"bg-white rounded-xl border border-gray-100 shadow-sm"

// Filter tabs
"inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg"

// Active tab
"bg-white text-gray-900 shadow-sm"

// Gradient accent (revenue, nav active)
"bg-gradient-to-br from-red-500 to-pink-600"

// Trend indicator (up)
"text-emerald-600"

// Trend indicator (down)
"text-red-600"

// Hover scale
"hover:shadow-md transition-all duration-200"
```

#### Icon System
- **Library:** Using SVG files in `/public/icons/`
- **Format:** Next.js Image component with filter styles
- **Pattern:**
  ```tsx
  <Image
    src={`/icons/${iconName}.svg`}
    alt=""
    width={size}
    height={size}
    style={{ filter: isActive ? 'brightness(0) invert(1)' : {} }}
  />
  ```

### Mock Data Structure (`/lib/mock-data.ts`)

Actual interfaces implemented:
```tsx
export interface KPIData {
  id: string;
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}

export interface RecentActivity {
  id: string;
  time: string;
  callType: 'phone' | 'delivery' | 'takeout' | 'other' | 'catering';
  icon: string;
  summary: string;
  type: 'order' | 'reservation' | 'inquiry' | 'other';
  callHealth: 'success' | 'warning' | 'error';
  from: string;
  duration: string;
}
```

### Restaurant Owner Design Decisions
✅ Implemented:
1. Revenue tile is 30% larger (`grid-cols-[1.3fr_1fr_1fr]`)
2. Revenue always first in KPI order
3. Revenue gets automatic gradient highlight
4. Default time filter is "Today"
5. Simplified metric values (127 instead of "127 Calls")
6. Shorter trend labels ("+18%" instead of "+18% vs last week")
7. Trend indicators on all KPIs
8. Clean, scannable layout

---

## 📋 Implementation Guide for Remaining Pages

See `IMPLEMENTATION_STATUS.md` for:
- Component reuse patterns
- Data fetching patterns
- Design principle guidelines
- Priority recommendations for Call Logs, Analytics, Configuration pages

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-15 | UI Designer | Initial component mapping from Figma CSS |
| 1.1 | 2025-11-15 | Frontend Dev | Updated with actual implementation details |
