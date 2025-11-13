# Story 7.10: Playwright Smoke Test 1 - Overview Load

**Epic:** Epic 7 - Testing & Quality Assurance
**Status:** pending
**Assignee:** test-writer-fixer
**Dependencies:** Story 7.9 (Playwright setup), Epic 3 (Overview page complete)
**Estimated Effort:** S (< 1 day)

---

## Description

Write the first of three required Playwright smoke tests: verify that the Overview page loads successfully, displays all 5 KPI tiles with data, and shows the Recent Activities table with at least one row.

---

## Acceptance Criteria

- [ ] Test navigates to `/overview` page
- [ ] Test waits for page to fully load (no loading skeletons)
- [ ] Test asserts all 5 KPI tiles are visible:
  - Total Calls
  - Total Revenue
  - Minutes Saved
  - Orders Placed
  - Reservations Booked
- [ ] Test asserts each KPI tile has a non-empty value
- [ ] Test asserts Recent Activities table is visible
- [ ] Test asserts Recent Activities table has at least 1 row
- [ ] Test completes in < 10 seconds
- [ ] Test runs against seeded database with known data
- [ ] Test passes in CI environment
- [ ] Test passes in headless mode

---

## Technical Notes

**Test File Location:** `/tests/e2e/overview.spec.ts`

**Seeded Data Requirements:**
- At least 7 days of call/order/reservation data
- At least 5 calls in the last 7 days for Recent Activities
- Metrics aggregated in mv_metrics_daily

**Implementation:**
```ts
// /tests/e2e/overview.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Overview Page', () => {
  test.beforeEach(async ({ page }) => {
    // Assume demo mode or test user logged in
    await page.goto('/overview');
    // Wait for page to be fully loaded (no skeletons)
    await page.waitForSelector('[data-testid="kpi-tile"]', { state: 'visible' });
  });

  test('loads successfully and displays all KPI tiles', async ({ page }) => {
    // Assert all 5 KPI tiles are present
    const kpiTiles = page.locator('[data-testid="kpi-tile"]');
    await expect(kpiTiles).toHaveCount(5);

    // Assert each tile has a label and value
    const labels = ['Total Calls', 'Total Revenue', 'Minutes Saved', 'Orders Placed', 'Reservations Booked'];

    for (const label of labels) {
      const tile = page.locator(`[data-testid="kpi-tile"]:has-text("${label}")`);
      await expect(tile).toBeVisible();

      // Assert tile has a non-empty value (not "0" or "--")
      const value = await tile.locator('[data-testid="kpi-value"]').textContent();
      expect(value).toBeTruthy();
      expect(value).not.toBe('0');
      expect(value).not.toBe('--');
    }
  });

  test('displays Recent Activities table with data', async ({ page }) => {
    // Assert table is visible
    const table = page.locator('[data-testid="recent-activities-table"]');
    await expect(table).toBeVisible();

    // Assert table has at least one row (excluding header)
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Assert first row has expected columns
    const firstRow = rows.first();
    await expect(firstRow.locator('td').nth(0)).toBeVisible(); // Call type
    await expect(firstRow.locator('td').nth(1)).toBeVisible(); // Direction
    await expect(firstRow.locator('td').nth(2)).toBeVisible(); // Location
  });

  test('meets performance budget (< 2s load)', async ({ page }) => {
    const start = Date.now();
    await page.goto('/overview');
    await page.waitForSelector('[data-testid="kpi-tile"]', { state: 'visible' });
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(2000); // 2 second budget
  });
});
```

**Data Test IDs to Add:**
```tsx
// In KpiTile component
<div data-testid="kpi-tile">
  <span>{label}</span>
  <span data-testid="kpi-value">{value}</span>
</div>

// In RecentActivitiesTable component
<table data-testid="recent-activities-table">
  {/* ... */}
</table>
```

---

## Testing Requirements

- [ ] Test passes with seeded data
- [ ] Test fails appropriately if page doesn't load
- [ ] Test fails if KPI tiles missing
- [ ] Test fails if Recent Activities table empty
- [ ] Test passes in CI (GitHub Actions)
- [ ] Test passes in both chromium and webkit

---

## Related Files

- `/tests/e2e/overview.spec.ts` (create)
- `/components/kpi/KpiTile.tsx` (add data-testid)
- `/components/overview/RecentActivitiesTable.tsx` (add data-testid)
- `/supabase/seed.sql` (ensure test data exists)
