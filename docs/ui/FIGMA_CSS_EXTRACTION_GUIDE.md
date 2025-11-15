# Figma CSS Extraction Guide

## What I Need From Your Overview Page CSS

To create `components_map.md` and `tokens.json`, please provide the CSS organized into these sections:

---

## 1. Design Tokens (Highest Priority)

These are **repeated values** across your design. Look for patterns in:

### Colors
```css
/* Primary palette */
--color-primary: #______;
--color-primary-hover: #______;
--color-primary-pressed: #______;

/* Semantic colors */
--color-success: #______;
--color-warning: #______;
--color-error: #______;
--color-info: #______;

/* Neutral scale (background, borders, text) */
--color-neutral-50: #______;
--color-neutral-100: #______;
/* ... through to 900 */

/* Text colors */
--color-text-primary: #______;
--color-text-secondary: #______;
--color-text-tertiary: #______;
```

### Typography
```css
/* Font families */
--font-sans: "______", sans-serif;
--font-mono: "______", monospace;

/* Font sizes */
--text-xs: __px;
--text-sm: __px;
--text-base: __px;
--text-lg: __px;
--text-xl: __px;
--text-2xl: __px;
--text-3xl: __px;

/* Font weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line heights */
--leading-tight: __;
--leading-normal: __;
--leading-relaxed: __;
```

### Spacing Scale
```css
/* Spacing values (padding, margin, gap) */
--spacing-1: __px;  /* smallest */
--spacing-2: __px;
--spacing-3: __px;
--spacing-4: __px;
--spacing-6: __px;
--spacing-8: __px;
--spacing-12: __px;
--spacing-16: __px;
/* etc. */
```

### Border Radius
```css
--radius-sm: __px;   /* buttons, badges */
--radius-md: __px;   /* cards, inputs */
--radius-lg: __px;   /* modals, drawers */
--radius-full: 9999px;  /* pills, avatars */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(...);
--shadow-md: 0 4px 6px -1px rgba(...);
--shadow-lg: 0 10px 15px -3px rgba(...);
```

---

## 2. Component-Specific CSS

For each major component on the Overview page, provide the CSS class or styles:

### KPI Tiles
```css
.kpi-tile {
  /* All properties */
  background: ;
  border: ;
  border-radius: ;
  padding: ;
  /* etc. */
}

.kpi-tile__icon {
  /* Icon container styles */
}

.kpi-tile__value {
  /* Large number styles */
}

.kpi-tile__label {
  /* Label text styles */
}

.kpi-tile__change {
  /* +12% change indicator */
}
```

### Recent Activities Table
```css
.table-header {
  /* Table header row */
}

.table-row {
  /* Regular row */
}

.table-row:hover {
  /* Hover state */
}

.table-cell {
  /* Cell styles */
}
```

### Buttons
```css
.btn-primary {
  /* Default state */
}

.btn-primary:hover {
  /* Hover state */
}

.btn-primary:active {
  /* Pressed state */
}

.btn-secondary {
  /* Secondary variant */
}

.btn-ghost {
  /* Ghost variant */
}
```

### Status Badges
```css
.badge-success {
  /* Completed status */
}

.badge-warning {
  /* In progress status */
}

.badge-error {
  /* Failed status */
}
```

### Date Range Selector
```css
.date-picker {
  /* Container styles */
}

.date-picker__input {
  /* Input field */
}
```

---

## 3. Layout Structure

Provide the **specific measurements** for the Overview page layout:

```css
/* Main container */
.overview-container {
  max-width: ___px;
  padding: ___px;
  gap: ___px;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(__, 1fr);
  gap: ___px;
}

/* Section spacing */
.section-header {
  margin-bottom: ___px;
}

/* Responsive breakpoints */
@media (max-width: __px) {
  /* Mobile styles */
}

@media (min-width: __px) and (max-width: __px) {
  /* Tablet styles */
}
```

---

## 4. Dark Mode (If Applicable)

If you have dark mode CSS, provide the color overrides:

```css
[data-theme="dark"] {
  --color-bg-primary: #______;
  --color-bg-secondary: #______;
  --color-text-primary: #______;
  /* etc. */
}
```

---

## How to Provide This

**Option 1: Full CSS File** (Easiest)
- Just paste the entire CSS file from Figma export
- I'll extract what I need

**Option 2: Organized by Section** (Most Helpful)
- Copy the sections above and fill in your values
- This makes it easier for me to map directly

**Option 3: Screenshots + Key Values**
- Share Figma screenshots with design panel showing:
  - Color values
  - Typography specs
  - Spacing/padding values
- I'll extract the numbers

---

## What I'll Do With This

Once you provide the CSS, I will:

1. **Create `docs/ui/tokens.json`** with all design tokens
2. **Create `docs/ui/components_map.md`** mapping Figma components to shadcn/React
3. **Update `tailwind.config.js`** with your color palette and spacing scale
4. **Identify which shadcn components** we need to install
5. **Create initial component files** in `/components/ui/` with your exact styles

---

## Example of What I'm Looking For

If your KPI tile CSS looks like this:

```css
.stats-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.stats-card__value {
  font-size: 32px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.stats-card__label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-top: 8px;
}
```

I'll extract:
- **Token**: `--radius-md: 12px`
- **Token**: `--spacing-6: 24px`
- **Token**: `--color-text-primary: #111827`
- **Token**: `--color-text-secondary: #6B7280`
- **Component**: Map to `shadcn/ui Card` with custom padding
- **Typography**: `text-3xl font-semibold` for value, `text-sm font-medium text-gray-500` for label

---

## Ready When You Are

Paste your CSS in whatever format is easiest for you - I'll handle the extraction and organization.
