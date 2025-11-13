# Certus Operations Dashboard — Interaction Specifications

**Version:** 1.1
**Last updated:** 2025-09-25
**Owner:** Whimsy Injector
**Related docs:**
- `docs/ux/page_map.md` (user flows and page structure)
- `docs/ui/components_map.md` (component inventory)
- `docs/ui/tokens.json` (design tokens)

---

## Quick Reference: Key Timing Standards

**Target Animation Durations:**
- Button press: **80ms**
- Hover states: **120-150ms**
- Tab switching: **<180ms**
- Drawer open: **~220ms**
- Drawer close: **~180ms** (faster)
- Page transitions: **180-220ms**
- Toasts: **160ms** in/out
- Modals: **160-180ms** open, **140ms** close
- **ALL animations under 250ms**

**Vibe:** Subtle, fast, confident. Not bouncy/playful except rare celebrations.

---

## 1. Introduction & Philosophy

### Purpose
This document defines the **motion, behavior, and personality** of the Certus Operations Dashboard. It specifies how UI elements should animate, respond to user actions, and create delightful moments that make the app memorable and enjoyable to use.

### Design Philosophy

**Overall Vibe: Subtle, Fast, Confident**
- Priority: Keep the dashboard feeling **snappy and reliable**, not "playful app for fun"
- Nothing bouncy or cartoony except small celebration moments
- All animations under 250ms
- Focus on speed and clarity over decoration

**Principle 1: Responsive & Snappy**
- Every interaction provides immediate visual feedback
- No action should feel laggy or unresponsive
- Target: < 100ms perceived response time
- Quick transitions: most animations 120-220ms range

**Principle 2: Predictable & Minimal**
- Animations follow consistent patterns
- Similar actions produce similar feedback
- Prefer opacity and small transforms over dramatic effects
- Users should never be surprised by behavior

**Principle 3: Delightful, Not Distracting**
- Subtle animations enhance, never obstruct
- Whimsy moments are tasteful and professional (confetti only for major milestones)
- Respect user time and focus - closing is faster than opening

**Principle 4: Accessible**
- All animations respect `prefers-reduced-motion`
- Keyboard interactions are as polished as mouse
- Color is never the only indicator of state
- On low-power/reduced-motion: disable all motion, use instant state changes + subtle color shifts

---

## 2. Global Interaction Patterns

### 2.1 Hover States

**Primary Buttons:**
```
On hover:
- Scale: 1.02
- Shadow: slightly stronger
- Transition: 120-150ms ease-out
- Cursor: pointer
```

**Secondary / Ghost Buttons:**
```
On hover:
- Less dramatic: only opacity + subtle border color change
- No scaling, or very tiny (1.01 max)
- Transition: 120ms ease-out
```

**Table Rows:**
```
On hover:
- Background color eases from neutral to slightly highlighted tone
- Transition: 120ms ease-out
- No scale or shadow
```

**KPI Tiles / Cards:**
```
On hover:
- Scale: 1.01 (very subtle)
- Shadow: slightly increased
- Transition: 120-150ms ease-out
```

**Text Links:**
```
On hover:
- No scale
- Underline appears/thickens
- Color: slightly darker/lighter
- Transition: 120ms ease-out
```

**Implementation:**
```tsx
// Primary button
className="transition-transform duration-150 hover:scale-[1.02] hover:shadow-lg cursor-pointer"

// Secondary button
className="transition-opacity duration-120 hover:opacity-80"

// Table row
className="transition-colors duration-120 hover:bg-gray-50"
```

### 2.2 Focus States (Keyboard Navigation)

**All Focusable Elements:**
```
On focus:
- Ring: 2px solid primary color
- Offset: 2px from element edge
- Never remove focus outline
- Ensure 4.5:1 contrast ratio

Transition: 100ms ease-out
```

**Implementation:**
```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
```

**Focus Order:**
- Logical tab order (top-to-bottom, left-to-right)
- Skip links available ("Skip to main content")
- Focus trap in modals/drawers
- Focus returns to trigger element on close

### 2.3 Active/Press States

**Primary Buttons:**
```
On press (mouse down):
- Quick scale down to 0.98
- Transition: ~80ms ease-in

On release:
- Scale back to 1.0 (or 1.02 if still hovering)
- Transition: ~80ms ease-out
```

**Table Rows (on click to open drawer):**
```
On click:
- Brief 0.98 → 1.0 "tap" scale (keep it crisp)
- Duration: ~80ms
- Then drawer slides in
```

**Implementation:**
```tsx
// Primary button
className="active:scale-[0.98] transition-transform duration-[80ms]"

// Table row click
className="active:scale-[0.98] transition-transform duration-[80ms]"
```

### 2.4 Disabled States

**All Interactive Elements:**
```
When disabled:
- Opacity: 50%
- Cursor: not-allowed
- No hover effects
- Gray filter (slight desaturation)

Visual indicators:
- "Disabled" text if space allows
- Tooltip explaining why (on hover)
```

**Implementation:**
```tsx
className="disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale-10"
```

---

## 2.5 Page & Route Transitions

**Route Changes** (`/overview` → `/call-logs` → `/analytics`):
```
On navigation:
1. Content fade-in + slight upward translate (8-12px)
2. Duration: ~180-220ms ease-out
3. Sidebar and top bar stay fixed (no big layout shifts)
4. Focus moves to main content heading
```

**Implementation:**
```tsx
// Page transition wrapper
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {children}
</motion.div>
```

---

## 3. Loading States

### 3.1 Page Loading (Initial Load)

**Full Page Skeleton:**
```
On initial page load:
- Display skeleton matching page layout (cards/rows)
- Shimmer animation: soft shimmer across skeleton
- Shimmer speed: 1200-1500ms loop
- Don't block whole screen with spinner; show layout skeleton so users see structure

Transition to content:
- Fade in: 180-220ms ease-out
- No dramatic staggering; keep it quick
```

**Implementation:**
```tsx
// Skeleton component
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>

// Custom shimmer (add to globals.css)
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

**Where to Use:**
- Overview page KPI tiles (5 tile skeletons)
- Recent Activities table (5-10 row skeletons)
- Call Logs table (25 row skeletons)
- Analytics charts (chart outline + axis)

### 3.2 Component Loading (Data Refresh)

**Small Actions (saving settings, adding note):**
```
For inline actions:
- Button switches to compact spinner + "Saving..." text
- No page-level shimmer
- Duration: however long action takes
- No blocking of other UI
```

**Implementation:**
```tsx
import { Loader2 } from "lucide-react"

<div className="flex items-center justify-center p-4">
  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
  <span className="ml-2 text-sm text-gray-600">Loading...</span>
</div>
```

### 3.3 Action Loading (Button States)

**Submitting Forms / Saving Data:**
```
On button click:
1. Button disabled immediately
2. Text changes: "Save Changes" → "Saving..."
3. Spinner appears next to text
4. Button width stays constant (no layout shift)

On success:
1. Spinner → checkmark icon
2. Text: "Saved!" (brief, 1 second)
3. Button returns to normal state

On error:
1. Spinner → X icon
2. Text: "Failed" (brief)
3. Button returns to normal state (enabled)
4. Error toast appears
```

**Implementation:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

### 3.4 Loading Messages (Personality)

**Contextual Loading Text:**

Instead of generic "Loading...", use contextual messages:

| Context | Message |
|---------|---------|
| Fetching calls | "Fetching your calls..." |
| Loading analytics | "Crunching the numbers..." |
| Processing knowledge update | "Teaching the AI..." |
| Applying filters | "Filtering calls..." |
| Exporting CSV | "Preparing your data..." |
| Loading transcript | "Retrieving conversation..." |
| Playing audio | "Loading recording..." |

**Personality:**
- Professional but friendly
- Reassuring (something is happening)
- Contextually relevant
- Never too cute or unprofessional

---

## 4. Component-Level Interactions

### 4.1 Buttons

**Primary Button:**
```
Default:
- Solid background (primary color)
- White text
- Subtle shadow

Hover:
- Background: 10% darker
- Shadow: increased
- Scale: 102%
- Transition: 150ms

Active (press):
- Scale: 98%
- Shadow: reduced
- Transition: 100ms

Focus:
- Ring: 2px primary color
- Offset: 2px
```

**Secondary Button:**
```
Default:
- Outline border (1px)
- Transparent background
- Colored text

Hover:
- Background: subtle fill (5% opacity of primary)
- Border: slightly darker
- Scale: 102%
```

**Ghost Button:**
```
Default:
- No border
- Transparent background
- Colored text

Hover:
- Background: subtle fill (5% opacity)
- No scale (exception to rule)
```

**Destructive Button:**
```
Same as Primary, but:
- Red color scheme
- On hover: brief pulse animation (warning)
- Click requires confirmation dialog
```

### 4.2 KPI Tiles

**Loading State:**
```
1. Skeleton with shimmer (as described in 3.1)
2. Duration: ~500ms average
```

**Data Appears:**
```
1. Fade in: 180-220ms ease-out
2. No count-up animation (keep it instant for speed)
   - Just display final value immediately
```

**Hover Interaction:**
```
On hover:
- Scale: 1.01 (very subtle)
- Shadow: slightly increased
- Transition: 120-150ms ease-out
- Cursor: pointer (if clickable to drill-down)
```

**Trend Indicator:**
```
If value changed:
- Arrow appears with fade-in (no bouncing)
- Green (up) or red (down) color
- Simple, fast fade-in: 150ms
```

**Implementation:**
```tsx
// Stagger animation
const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
}

// In component
{kpis.map((kpi, index) => (
  <motion.div
    custom={index}
    initial="hidden"
    animate="visible"
    variants={tileVariants}
  >
    <KpiTile {...kpi} />
  </motion.div>
))}
```

### 4.3 Charts & Analytics

**Initial Load:**
```
On first render:
- Lines/bars animate in from baseline
- Duration: ~220-260ms ease-out (no long easing)
- Points can fade in after the line if used
```

**Filter / Date-Range Change:**
```
On data update:
- Use short cross-fade between old and new dataset
- Duration: ~180ms
- Avoid big "drawing" animations every time (keep it fast)
```

**Hover on Data Points:**
```
On hover:
- Tooltip fades in fast: ~80-100ms
- Small upward motion: 0-4px
- Transition out: equally fast
```

**Implementation:**
```tsx
// Chart transition
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.22 }}
>
  <Chart data={data} />
</motion.div>
```

### 4.4 Data Tables

**Row Hover:**
```
On hover:
- Background: subtle gray (gray-50 light, gray-800 dark)
- Transition: 100ms ease-out
- Cursor: pointer (if clickable)
```

**Row Click (Opening Drawer):**
```
On click:
1. Row background: brief highlight flash (200ms)
2. Drawer begins slide-in animation
3. Row remains highlighted while drawer open
```

**Row Selection (Future):**
```
On select (checkbox):
- Background: light blue tint
- Border-left: 3px solid primary color
- Smooth transition: 150ms
```

**Empty State:**
```
No rows to display:
- Centered content area
- Icon (search with X or empty box)
- Friendly message: "No calls found. Try adjusting your filters."
- Suggested action button if applicable
- Gentle fade-in: 300ms
```

**Loading Rows:**
```
While fetching:
- Skeleton rows (5-10)
- Shimmer animation
- Maintains table structure
```

### 4.4 Call Detail Drawer

**Opening Animation:**
```
On trigger (row click):
1. Background page content dims with quick opacity fade
2. Drawer slides in from right (translate X from ~40px to 0) + fade-in
   - Duration: ~220ms ease-out
3. Focus moves to drawer (first interactive element)
```

**Tab Switching:**
```
On tab click:
1. Tab indicator (underline) slides to active tab: ~160ms ease-out
2. Tab content cross-fades with small vertical shift (6-8px)
3. Total duration: <180ms (keep it snappy)
```

**Closing Animation:**
```
On close (X button, Escape, backdrop click):
1. Drawer slides out + fades: ~180ms ease-in (quicker than opening)
2. Backdrop fades out
3. Focus returns to trigger element (table row)
Note: Closing feels snappy - faster than opening
```

**Transcript Scrolling:**
```
- No fancy animations, just smooth native scrolling
- Focus is on readability, not effects
```

**Audio Player Interaction:**
```
Play button click:
- Button icon: play → pause (rotation 90° if desired)
- Waveform highlight follows playback
- Progress bar animates smoothly

Seek interaction:
- On hover over progress bar: highlight scrubber
- On drag: immediate visual feedback
- On release: audio jumps to position

Playback speed:
- Dropdown menu with smooth open/close
- Current speed highlighted
```

**Internal Notes (Chat) Interaction:**
```
On posting note:
1. Input field disabled
2. "Posting..." indicator appears
3. New note fades in at bottom (300ms)
4. Scroll animates to new note (400ms ease-out)
5. Brief highlight pulse on new note (500ms)

@mention autocomplete:
- Dropdown appears below cursor: 150ms
- Hover highlight in dropdown
- Arrow key navigation
- Enter to select
```

### 4.5 Filters & Search

**Filter Panel Interaction:**
```
Opening collapsible filter:
- Height: 0 → auto (smooth)
- Opacity: 0 → 1
- Duration: 200ms ease-out

Applying filters:
- "Apply" button shows loading spinner
- Table rows fade out (150ms)
- New rows fade in with stagger (200ms, 30ms stagger)

Clearing filters:
- All filter inputs clear with brief fade (100ms)
- "X cleared" toast notification
- Table reloads
```

**Search Input:**
```
On focus:
- Input border: thicker, primary color
- Search icon: slightly larger (scale 110%)
- Placeholder fades out faster

On typing:
- Real-time filtering (debounced 300ms)
- Matching results highlight with fade-in
- "X results" count updates smoothly

Clear button (X icon):
- Appears on hover if input has value
- Fade in: 150ms
- On click: input value clears with animation
```

### 4.6 Status Badges

**Default State:**
```
Solid background with status color
Rounded corners (full pill shape)
Icon + text
```

**Status Change Animation:**
```
If status updates in real-time:
1. Old badge: pulse + fade out (200ms)
2. New badge: fade in + scale pop (100% → 105% → 100%)
3. Duration: 400ms total
```

**Hover (if clickable):**
```
- Slightly darker background
- Subtle shadow
- Scale: 101%
```

### 4.7 Date Pickers & Dropdowns

**Opening Dropdown:**
```
On click:
1. Dropdown menu slides down from button
2. Fade in: 150ms
3. Slight scale: 95% → 100%
4. Origin: top edge (anchored to button)
```

**Selecting Option:**
```
On click option:
1. Option background: brief highlight (100ms)
2. Checkmark appears (if multi-select)
3. Dropdown closes: fade out + scale (150ms)
4. Selected value updates in button
```

**Date Picker Calendar:**
```
Opening:
- Popover appears with fade + scale (200ms)
- Current date highlighted with pulse

Selecting date:
- Date cell: background highlight
- Previous selection: fades out
- New selection: fades in with subtle bounce

Applying range:
- "Apply" button confirms
- Range highlights with animated fill (left to right)
```

---

## 5. User Feedback Patterns

### 5.1 Toast Notifications

**Position:** Top-right corner (20px from edges)

**Types & Colors:**
- **Success:** Green background (#DEF7EC), green text (#03543F), checkmark icon
- **Error:** Red background (#FDE8E8), red text (#9B1C1C), X icon
- **Warning:** Yellow background (#FDF6B2), yellow-dark text (#723B13), alert icon
- **Info:** Blue background (#E1EFFE), blue text (#1E429F), info icon

**Animation:**
```
On appear (Success):
1. Slide up + fade-in from bottom-right (or top-right)
2. Duration: ~160ms ease-out
3. Optional: very tiny confetti burst or icon micro-bounce for MAJOR milestones only
   (first successful integration, first note, etc.)

On appear (Error):
1. Slide in + fade-in
2. Very light horizontal shake (no more than 3-4px)
3. Duration: ~160ms
4. No harsh red flashing; just color + icon + micro-shake

On dismiss:
1. Slide out + fade: ~140ms ease-in
2. Height collapses if stacked

Auto-dismiss timing:
- Success: 3 seconds
- Error: 5 seconds (longer to read)
- Warning: 4 seconds
- Info: 3 seconds
```

**Stacking:**
```
Multiple toasts:
- Stack vertically with 8px gap
- New toasts push old ones down
- Max 3 visible (oldest auto-dismiss if exceeded)
```

**Examples:**

| Action | Toast Message | Type |
|--------|---------------|------|
| Save settings | "Business hours updated successfully." | Success |
| Post note | "Note posted." | Success |
| Export CSV | "Analytics exported to CSV." | Success |
| Save failed | "Failed to save changes. Please try again." | Error |
| Network error | "Connection lost. Retrying..." | Warning |
| Knowledge update | "Knowledge update queued. Processing takes ~15 minutes." | Info |
| Filter applied | "Showing 23 calls." | Info |

### 5.2 Form Validation

**Real-Time Validation:**
```
On input blur (after user leaves field):
1. Validate input
2. If invalid:
   - Border color animates to error color and back to neutral: ~200ms
   - Small shake OK for really bad input, but keep it minimal (3-4px)
   - Error message fades in below field (150ms)
   - Error icon appears

On input change (after initial error):
- Re-validate immediately
- If now valid:
  - Border: green (brief, 1 second)
  - Checkmark icon (brief)
  - Error message fades out (150ms)
  - Return to normal state
```

**Shake Animation (minimal):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.shake {
  animation: shake 200ms ease-in-out;
}
```

**Submit Button Validation:**
```
If form invalid:
- Submit button disabled
- Opacity: 50%
- Tooltip on hover: "Please fix errors above"

On click while invalid:
- Scroll to first error (smooth scroll, 400ms)
- Error field: pulse animation to draw attention
```

### 5.3 Empty States

**Visual Structure:**
```
Centered content area:
1. Illustration or icon (large, 64-96px)
2. Heading (text-xl, font-semibold)
3. Description (text-sm, text-gray-600)
4. Call-to-action button (if applicable)
```

**Animation:**
```
On render:
1. Fade in: 400ms ease-out
2. Icon: slight scale bounce (95% → 100%)
3. Text: stagger fade (100ms between lines)
```

**Examples:**

| Context | Icon | Heading | Description | CTA |
|---------|------|---------|-------------|-----|
| No calls in filter | 🔍❌ | "No calls found" | "Try adjusting your date range or filters." | "Clear Filters" |
| No notes yet | 💬 | "No notes yet" | "Be the first to add context for your team." | - |
| No analytics data | 📊 | "No data available" | "No analytics data for the selected period. Try expanding your date range." | - |
| First visit (demo) | 👋 | "Welcome to Certus!" | "This is a demo with sample data. Explore to see what Certus can do." | "Start Tour" |

### 5.4 Error States

**Page-Level Errors:**
```
Full page error (500, network failure):
1. Replace page content with error component
2. Fade in: 300ms
3. Includes:
   - Large error icon (sad face or broken connection)
   - Error heading: "Something went wrong"
   - User-friendly message (no technical jargon)
   - "Reload Page" button
   - Optional: "Contact Support" link

Animation on reload:
- Button shows loading spinner
- Page refresh with fade transition
```

**Component-Level Errors:**
```
Failed to load component data:
1. Show error message in component area
2. Red border or background tint
3. Retry button
4. Optional: expand/collapse for technical details

Error message examples:
- "Unable to load calls. Please try again."
- "Failed to fetch analytics. Check your connection."
- "Could not load transcript. Contact support if this persists."
```

**User Error Feedback:**
```
Invalid input / user mistake:
- Never blame the user
- Use friendly, helpful language
- Suggest corrections

Examples:
❌ "Invalid format"
✅ "Please use format: HH:MM (e.g., 09:00)"

❌ "Error 400"
✅ "End time must be after start time"

❌ "Cannot process request"
✅ "Unable to save. Please check your connection and try again."
```

---

## 6. Delight & Whimsy Moments

### 6.1 First-Time User Experience

**First Login (or Demo Entry):**
```
1. Welcome animation:
   - Logo: gentle scale bounce (800ms)
   - Tagline fades in below (300ms delay)

2. Overview page first render:
   - KPI tiles: stagger animation (described in 4.2)
   - Brief tooltip appears: "💡 Click any call to see full details"
   - Tooltip auto-dismisses after 5 seconds

3. First call drawer open:
   - Tooltip: "Pro tip: Press Escape to close"
   - Shows once per session
```

**First Note Posted:**
```
On first internal note post:
1. Success toast: "Note posted! 🎉"
2. Optional: brief confetti burst (tasteful, 1 second)
3. Tooltip: "Team members will see this on the call"
```

**First Export:**
```
On first CSV export:
1. Success toast: "Analytics exported! 📊"
2. Tooltip: "Find your download in your Downloads folder"
```

### 6.2 Milestone Celebrations

**Major Milestones Only (Very Rare):**
```
Only for truly significant achievements:
- First successful integration: Very tiny confetti burst + toast
- First call handled: Icon micro-bounce + toast
- 1,000 calls milestone: Brief celebration

Confetti (if used at all):
- Duration: 1 second max
- Particle count: 30-40 (very subtle)
- Colors: brand primary + secondary
- Quick, not distracting
- User can disable in settings

Note: Default to NO whimsy for most actions. Dashboard should feel
professional and reliable, not "app for fun."
```

**Implementation:**
```tsx
import confetti from 'canvas-confetti'

// VERY subtle celebration (use sparingly!)
confetti({
  particleCount: 30,
  spread: 50,
  origin: { y: 0.6 },
  colors: ['#1C64F2', '#0E9F6E'],
  disableForReducedMotion: true
})
```

### 6.3 Loading Personality

**Contextual Loading Messages:**

Beyond the basic ones in section 3.4, add personality:

| Context | Messages (rotate randomly) |
|---------|----------------------------|
| Loading many calls | "Fetching your calls...", "Gathering conversations...", "One moment..." |
| Processing filters | "Filtering results...", "Narrowing it down...", "Finding matches..." |
| Exporting large dataset | "Preparing your data...", "Crunching numbers...", "Almost there..." |
| Knowledge update | "Teaching the AI...", "Updating knowledge...", "Processing changes..." |

**Long Operations:**
```
For operations > 3 seconds:
- Show progress indicator (if possible)
- Update message every 2-3 seconds:
  1. "Starting..."
  2. "Processing..."
  3. "Almost done..."
  4. "Finishing up..."
```

### 6.4 Easter Eggs (Optional)

**Subtle, Discoverable Fun:**

**Konami Code:**
```
On entering Konami code (↑↑↓↓←→←→BA):
- Brief confetti burst
- Easter egg message: "🎮 You found a secret!"
- No functional impact (just fun)
```

**Logo Interaction:**
```
Hold Shift + click logo:
- Logo spins 360° (1 second)
- Optional: plays subtle sound effect
- Makes user smile
```

**Long Session Recognition:**
```
After 2+ hours active session:
- Tooltip appears: "You've been working hard! 💪 Time for a break?"
- Shows once per session
- Friendly reminder, easily dismissible
```

### 6.5 Error Humor (Appropriate)

**404 / Not Found:**
```
Friendly message:
"🔍 This page is as elusive as a perfect phone call.
Let's get you back on track."

[Back to Overview button]
```

**Network Error:**
```
"📡 Connection hiccup!
We're having trouble reaching our servers.
Check your connection and we'll retry."

[Retry button]
```

**Slow Loading:**
```
After 5+ seconds loading:
"⏰ This is taking longer than usual...
Thanks for your patience!"
```

---

## 7. Modals & Dialogs

**Opening Animation:**
```
On trigger:
1. Dim background quickly
2. Dialog scales from 0.96 → 1.0 and fades in
3. Duration: ~160-180ms ease-out
4. Focus moves to first interactive element
```

**Closing Animation:**
```
On close (X button, Escape, backdrop click):
1. Fade out and scale back to 0.96
2. Duration: ~140ms ease-in (don't slow users down)
3. Focus returns to trigger element
```

**Implementation:**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.96 }}
  transition={{ duration: 0.17 }}
>
  {/* Modal content */}
</motion.div>
```

---

## 8. Animation Technical Specifications

### 8.1 Duration Standards

**Performance Guardrails:**
- **Keep ALL animations under 250ms**
- Prefer GPU-friendly transforms (opacity, transform)
- Avoid layout-thrashing properties (width, height, margin, padding)

**Speed Categories:**

| Speed | Duration | Use Case |
|-------|----------|----------|
| Instant | 0ms | Reduced motion mode, instant state changes |
| Very Fast | 80-100ms | Button press, chart tooltip hover |
| Fast | 120-150ms | Button hover, table row hover, focus states |
| Normal | 160-180ms | Tab switching, toasts, form validation |
| Standard | 180-220ms | Page transitions, drawer open, chart load |
| Closing | 140-180ms | Closing animations (faster than opening) |

**Key Principles:**
- **Opening:** 180-220ms range
- **Closing:** 140-180ms range (always faster to feel snappy)
- **Micro-interactions:** 80-150ms
- **User-triggered:** Fast response
- **Closing is faster than opening** (users want to dismiss quickly)

### 7.2 Easing Functions

**CSS Easing:**
```css
/* Use these standard easings */
ease-out: cubic-bezier(0, 0, 0.2, 1)     /* Default for most animations */
ease-in: cubic-bezier(0.4, 0, 1, 1)      /* Closing/exiting animations */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) /* Transforms, symmetrical motion */
```

**When to Use:**
- **ease-out:** Opening drawers, appearing elements, hover effects (most common)
- **ease-in:** Closing drawers, disappearing elements
- **ease-in-out:** Sliding tabs, swapping content

**Framer Motion Spring:**
```tsx
// For delightful bounces (sparingly)
transition={{
  type: "spring",
  stiffness: 300,
  damping: 20
}}
```

### 7.3 Implementation: CSS vs JavaScript

**Use CSS Transitions (Tailwind) when:**
- ✅ Simple hover/focus states
- ✅ Basic opacity/transform changes
- ✅ Color transitions
- ✅ Performance is critical (GPU-accelerated)

```tsx
className="transition-all duration-200 hover:scale-105"
```

**Use Framer Motion when:**
- ✅ Complex sequences (stagger, orchestration)
- ✅ Gesture interactions (drag, swipe)
- ✅ Conditional animations based on state
- ✅ Need fine control over animation lifecycle

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

**Use CSS Keyframes when:**
- ✅ Complex, reusable animations (spin, pulse, shake)
- ✅ Infinite loops (loading spinners)
- ✅ Need precise keyframe control

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 7.4 Performance Considerations

**GPU-Accelerated Properties (Fast):**
- ✅ `transform` (scale, translate, rotate)
- ✅ `opacity`
- ✅ `filter` (blur, brightness)

**Avoid Animating (Slow):**
- ❌ `width`, `height` (causes reflow)
- ❌ `top`, `left` (use `transform: translate` instead)
- ❌ `margin`, `padding` (causes reflow)

**Best Practices:**
```tsx
// ❌ BAD - causes reflow
<div className="transition-all hover:w-64" />

// ✅ GOOD - GPU accelerated
<div className="transition-transform hover:scale-x-110" />

// ❌ BAD - animates layout
<div className="transition-all hover:p-8" />

// ✅ GOOD - animates transform
<div className="transition-transform hover:translate-y-1" />
```

**Will-Change Hint:**
```css
/* Use sparingly for frequently animated elements */
.frequently-animated {
  will-change: transform, opacity;
}

/* Remove after animation completes */
```

---

## 8. Accessibility Considerations

### 8.1 Reduced Motion Preference

**Respect User Settings:**
```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Tailwind Implementation:**
```tsx
// Animations only for users who don't prefer reduced motion
className="motion-safe:animate-bounce motion-safe:transition-all"
```

**Framer Motion Implementation:**
```tsx
import { useReducedMotion } from 'framer-motion'

const shouldReduceMotion = useReducedMotion()

<motion.div
  animate={{
    opacity: 1,
    y: shouldReduceMotion ? 0 : 20  // Skip animation if reduced motion
  }}
  transition={{
    duration: shouldReduceMotion ? 0 : 0.3
  }}
/>
```

**What to Disable:**
- Parallax effects
- Large-scale transforms
- Continuous animations (spinners okay, but simpler)
- Decorative animations (confetti, bounces)

**What to Keep:**
- Focus indicators (essential for keyboard nav)
- Loading indicators (functional, not decorative)
- State changes (but instantaneous, not animated)

### 8.2 Keyboard Interaction Feedback

**All Interactive Elements:**
- Visible focus ring (never remove)
- Focus follows logical tab order
- Hover states also apply on focus (consistency)
- Escape key closes modals/drawers
- Enter/Space activates buttons

**Animation on Focus:**
```tsx
// Same animation as hover
className="focus:scale-102 focus:shadow-lg transition-all"
```

### 8.3 Screen Reader Announcements

**Dynamic Content Changes:**
```tsx
// Use aria-live for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {toastMessage}
</div>

// For urgent messages
<div aria-live="assertive">
  {errorMessage}
</div>
```

**Loading States:**
```tsx
<div role="status" aria-live="polite">
  <Loader2 className="animate-spin" />
  <span className="sr-only">Loading...</span>
</div>
```

**Animations Don't Announce:**
- Purely visual animations don't need aria-live
- Only announce meaningful state changes
- Example: "Filter applied, showing 23 results"

---

## 9. Dark Mode Considerations

### 9.1 Animation Consistency

**Animations Work in Both Modes:**
- All animations (hover, transitions, etc.) remain the same
- Only colors change, not motion
- Ensure adequate contrast in both modes

### 9.2 Dark Mode Specific Adjustments

**Glow Effects:**
```
Light mode:
- Shadows for elevation
- Example: shadow-lg

Dark mode:
- Lighter shadows (less noticeable on dark bg)
- Optional: subtle glow instead
- Example: ring-1 ring-white/10
```

**Focus Rings:**
```
Light mode:
- Focus ring: primary color (blue)

Dark mode:
- Focus ring: lighter variant (ensure 4.5:1 contrast)
- May need to be brighter to stand out
```

**Loading Skeletons:**
```
Light mode:
- Gray shimmer (gray-200 to gray-300)

Dark mode:
- Darker shimmer (gray-700 to gray-600)
- Ensure shimmer is visible
```

---

## 10. Implementation Checklist

### For Each New Component:

- [ ] Define hover state (scale, shadow, color)
- [ ] Define focus state (ring, offset)
- [ ] Define active/press state
- [ ] Define disabled state
- [ ] Add loading state if async
- [ ] Add empty state if applicable
- [ ] Add error state
- [ ] Test keyboard navigation
- [ ] Test with `prefers-reduced-motion`
- [ ] Test in dark mode
- [ ] Verify performance (no jank)
- [ ] Add appropriate ARIA labels
- [ ] Document in this file if introduces new pattern

### For Each User Flow:

- [ ] Add success feedback (toast, inline message)
- [ ] Add error handling (toast, inline message)
- [ ] Add loading indicators
- [ ] Consider first-time user experience
- [ ] Test on slow network (loading states visible)
- [ ] Ensure all actions provide immediate feedback
- [ ] Check for opportunities to add delight (sparingly)

---

## 11. Related Patterns Library

### Common Animation Patterns (Quick Reference)

**Fade In:**
```tsx
className="animate-in fade-in duration-300"
// or
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
```

**Slide In from Right:**
```tsx
className="animate-in slide-in-from-right duration-300"
// or
initial={{ x: 100, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
```

**Scale Pop:**
```tsx
className="animate-in zoom-in-95 duration-200"
// or
initial={{ scale: 0.95, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
```

**Stagger Children:**
```tsx
<motion.ul variants={containerVariants}>
  {items.map((item, i) => (
    <motion.li key={i} variants={itemVariants}>
      {item}
    </motion.li>
  ))}
</motion.ul>

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
```

**Pulse (Attention):**
```css
@keyframes pulse-attention {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}
```

---

## 12. Maintenance & Evolution

### Updating This Document:

**When to Update:**
- New component type introduced
- New animation pattern established
- User feedback suggests interaction improvement
- Accessibility issue discovered and resolved
- Performance issues identified

**Review Cadence:**
- After each major feature launch
- Quarterly UX review
- When design system updated
- If users report "sluggish" or "slow" feedback

**Approval Required From:**
- UX Researcher
- Frontend Developer
- UI Designer

### Key Principles to Remember:

1. **Speed Over Decoration** - Every animation must justify its existence
2. **All Animations < 250ms** - Hard rule, no exceptions
3. **Closing Faster Than Opening** - Users want to dismiss quickly
4. **Subtle, Not Bouncy** - Professional dashboard, not playful app
5. **GPU Properties Only** - transform and opacity (avoid layout thrashing)
6. **Reduced Motion Respect** - Always provide instant alternatives

---

**Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-09-25 | Whimsy Injector | Initial interaction specifications based on PRD and page_map.md |
| 1.1 | 2025-09-25 | Whimsy Injector | Updated with specific timing guidance: fast (80-220ms), snappy closings, minimal whimsy, professional tone |
