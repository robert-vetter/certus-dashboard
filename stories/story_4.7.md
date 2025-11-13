# Story 4.7: Call Drawer Component Structure & Animations

**Epic:** Epic 4 - Call Logs & Detail Inspection
**Status:** pending
**Assignee:** frontend-developer
**Dependencies:** Story 2.5 (Drawer component), Story 2.6 (Tabs component)
**Estimated Effort:** L (2-3 days)

---

## Description

Build the Call Detail Drawer component structure with the two-section layout (main tabs + customer profile panel). Implement all animations per interaction specs: drawer slide-in from right, tab switching transitions, and proper focus management.

---

## Acceptance Criteria

- [ ] Drawer component slides in from right when call selected
- [ ] Opening animation: 220ms ease-out (translate + fade)
- [ ] Closing animation: 180ms ease-in (faster than opening)
- [ ] Drawer layout: Main tabs section (65% width) + Customer profile panel (35% width)
- [ ] Responsive: on mobile, drawer is full-screen with tabs stacked
- [ ] Call header section shows: call type badge, timestamp, duration, status, location
- [ ] Four tabs: Transcript, Summary, Order Details (conditional), Internal Chat
- [ ] Tab switching animation: 160ms with slight vertical shift (6-8px)
- [ ] Close button (X) in top-right corner
- [ ] Click backdrop (dimmed area) to close
- [ ] Press Escape key to close
- [ ] Focus trap: Tab cycles through drawer elements only
- [ ] On close, focus returns to call row that opened drawer
- [ ] URL state management: drawer open = `?callId={id}` in URL
- [ ] Browser back button closes drawer
- [ ] Respects `prefers-reduced-motion`

---

## Technical Notes

**Interaction Specs Reference:**
- Section 4.4: Call Detail Drawer
- Section 2.5: Page & Route Transitions
- Opening: ~220ms ease-out, translate from right + fade
- Closing: ~180ms ease-in (faster)
- Tab switching: <180ms with vertical shift

**Component Structure:**
```tsx
// /components/call/CallDrawer.tsx

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CallDrawerProps {
  callId: string | null;
  onClose: () => void;
}

export function CallDrawer({ callId, onClose }: CallDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!callId) return null;

  // Fetch call data (placeholder - will be implemented in other stories)
  const callData = {
    id: callId,
    type: 'order',
    startedAt: new Date(),
    duration: 180,
    status: 'completed',
    location: 'Main Location',
  };

  return (
    <Sheet open={!!callId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] lg:w-[900px] sm:max-w-[90vw]"
      >
        {/* Header */}
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{callData.type}</Badge>
                <Badge variant={callData.status === 'completed' ? 'success' : 'destructive'}>
                  {callData.status}
                </Badge>
              </div>
              <SheetTitle>{callData.location}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {callData.startedAt.toLocaleString()} • {Math.floor(callData.duration / 60)}m {callData.duration % 60}s
              </p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        {/* Two-section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Main Tabs Section (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transcript" className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="order">Order Details</TabsTrigger>
                <TabsTrigger value="chat">Internal Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="flex-1 overflow-auto">
                {/* Transcript content - implemented in Story 4.9 */}
                <p>Transcript content goes here</p>
              </TabsContent>

              <TabsContent value="summary" className="flex-1 overflow-auto">
                {/* Summary content - implemented in Story 4.11 */}
                <p>Summary content goes here</p>
              </TabsContent>

              <TabsContent value="order" className="flex-1 overflow-auto">
                {/* Order details - implemented in Story 4.12 */}
                <p>Order details go here</p>
              </TabsContent>

              <TabsContent value="chat" className="flex-1 overflow-auto">
                {/* Internal chat - implemented in Story 4.13 */}
                <p>Internal chat goes here</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Customer Profile Panel (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            {/* Customer profile - implemented in Story 4.17 */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Customer Profile</h3>
              <p className="text-sm text-muted-foreground">Profile details go here</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**URL State Management:**
```tsx
// /app/(dashboard)/call-logs/page.tsx

'use client';

export default function CallLogsPage({ searchParams }: { searchParams: { callId?: string } }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleOpenCall = (callId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('callId', callId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCloseDrawer = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('callId');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* Call table */}
      <CallTable onRowClick={handleOpenCall} />

      {/* Drawer */}
      <CallDrawer callId={searchParams.callId} onClose={handleCloseDrawer} />
    </>
  );
}
```

---

## Testing Requirements

- [ ] Visual test: drawer slides in from right with correct timing
- [ ] Visual test: drawer closes with faster animation than opening
- [ ] Unit test: Escape key closes drawer
- [ ] Unit test: backdrop click closes drawer
- [ ] Unit test: close button closes drawer
- [ ] Accessibility test: focus trap works (Tab cycles within drawer)
- [ ] Accessibility test: focus returns to trigger element on close
- [ ] Integration test: URL updates when drawer opens/closes
- [ ] Integration test: browser back button closes drawer
- [ ] Test reduced motion: animations disabled when preferred

---

## Related Files

- `/components/call/CallDrawer.tsx` (create)
- `/components/ui/sheet.tsx` (shadcn sheet component)
- `/components/ui/tabs.tsx` (shadcn tabs component)
- `/app/(dashboard)/call-logs/page.tsx` (integrate drawer)
- `/docs/ui/interaction_specs.md` (reference for animations)
