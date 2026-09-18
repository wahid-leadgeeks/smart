# Design System & UI/UX Specification
## LeadGeeks Inc. — "Executive Studio" IT SMART Goals Platform

---

## 1. Visual Metaphor & Creative Direction

### The Metaphor: **"The Executive Studio"**
Rather than mimicking a crowded, hyperactive SaaS analytics dashboard ("Dashboard Soup™"), this application is designed as an **Editorial Strategic Studio**:
- **Tactile & Architectural**: Generous breathing room, crisp hairline dividers (`#E7E5E0`), and warm paper-like card stock (`#FFFFFF` on `#FBFBF9`).
- **High Information Cadence**: Dense data (SWOT, monthly logs, SMART indicators) is organized with intentional typographic hierarchy—never buried behind confusing multi-level dropdowns.
- **Authoritative Typography**: Prominent, confident headlines paired with razor-sharp tabular monospace accents for dates, status codes, and department acronyms (`ITE`, `MNG`, `FAC`).

---

## 2. The Anti-Generic Checklist Verification

Before writing UI code, every view is vetted against the 10 Anti-Generic criteria:

| Checklist Question | Executive Studio Implementation |
| :--- | :--- |
| **1. Does this look like a default SaaS template?** | **No**. Replaced generic blue `#2563eb` and dark mode carbon with warm neutral stone `#FBFBF9`, terracotta `#C2410C`, sage `#15803D`, and deep ink `#1C1917`. |
| **2. Did we unnecessarily use card grids?** | Grouping is driven by functional lanes (Website, Infrastructure, Cybersecurity, Tech Innovation) with elegant borders rather than cluttered nested cards. |
| **3. Did we use gratuitous gradients or glassmorphism?** | **No**. Elevation and borders carry semantic weight (e.g. active timeline bar vs inactive lane). |
| **4. Are we copying familiar layouts without product reason?** | Layout is tuned specifically for 2026 Q1–Q4 roadmapping and Jan–Dec monthly execution logs. |
| **5. Does the product have a visual metaphor?** | **Yes**: "The Executive Studio" — a refined editorial workspace for technical leadership. |
| **6. Is there at least ONE memorable interaction?** | The **Slide-Over SMART Drawer** with instant tab switching between SMART definition, 2x2 SWOT quadrant, and 12-month cadence log, plus tactile timeline hover states. |
| **7. Could this same UI belong to 50 other products?** | **No**. Built around the specific SMART Goal methodology (Specific, Measurable, Attainable, Relevant, Time-Bound) of LeadGeeks Inc. |
| **8. What makes this product recognizable in 3 seconds?** | Warm paper canvas, terracotta/sage dual accents, and explicit Q1-Q4 roadmap Gantt lane. |
| **9. Can something be removed?** | Low-value spreadsheet boilerplate (e.g. repeated raw array formulas) is completely stripped out. |
| **10. Personality from behavior rather than decoration?** | Micro-interactions: interactive month pills, tactile button depressions, instant filter transitions. |

---

## 3. Color & Typography Tokens

### 3.1 Color Palette
```css
:root {
  /* Canvas & Neutral */
  --canvas-bg: #FBFBF9;
  --surface-card: #FFFFFF;
  --surface-hover: #F7F6F2;
  --border-subtle: #E7E5E0;
  --border-strong: #D1CFC7;

  /* Typography */
  --text-primary: #1C1917;    /* Stone 900 */
  --text-secondary: #57534E;  /* Stone 600 */
  --text-muted: #A8A29E;      /* Stone 400 */

  /* Semantic Status */
  --status-completed-text: #15803D;  /* Emerald 700 */
  --status-completed-bg: #F0FDF4;    /* Emerald 50 */
  --status-completed-border: #BBF7D0;

  --status-progress-text: #C2410C;   /* Orange 700 / Terracotta */
  --status-progress-bg: #FFF7ED;     /* Orange 50 */
  --status-progress-border: #FED7AA;

  --status-notstarted-text: #475569; /* Slate 600 */
  --status-notstarted-bg: #F8FAFC;   /* Slate 50 */
  --status-notstarted-border: #E2E8F0;

  /* Goal Types */
  --type-breakthrough: #4338CA;      /* Indigo 700 */
  --type-breakthrough-bg: #EEF2FF;
  --type-improvement: #0F766E;       /* Teal 700 */
  --type-improvement-bg: #F0FDFA;
}
```

### 3.2 Typography Scale
- **Display / Title**: `font-serif` or clean bold sans `text-2xl font-bold tracking-tight text-stone-900`
- **Section Headers**: `text-lg font-semibold tracking-normal text-stone-900`
- **Body Text**: `text-sm font-normal text-stone-700 leading-relaxed`
- **Metadata / Labels**: `text-xs font-medium uppercase tracking-wider text-stone-500`
- **Telemetry / Monospace**: `font-mono text-xs text-stone-600` for dates, counters, and codes.

---

## 4. The 7-State Interaction Spectrum

Every interactive element accounts for all 7 states:

```text
1. DEFAULT  ──► Clear label, distinct border, obvious affordance
2. HOVER    ──► Subtle fill shift (bg-stone-100), elevation lift, cursor-pointer
3. FOCUS    ──► High-contrast non-clipped focus ring (ring-2 ring-stone-800 ring-offset-2)
4. ACTIVE   ──► Tactile compression (active:scale-[0.98] transition-transform)
5. LOADING  ──► Preserved element dimensions, spinner animation, disabled interactions
6. SUCCESS  ──► Instant affirmative toast notification and checkmark animation
7. ERROR    ──► High-visibility error text with clear instructions on resolution
```

---

## 5. Core Views & Layout Blueprint

### 5.1 Global App Header
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [LeadGeeks Logo]  IT SMART GOALS 2026   [Search Goals...]   (Re-seed) (Export .xlsx)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Roadmap View]  [Goal Board]  [Monthly Cadence]  [The BIG Six Map]  │ Filter: [All Func ▼] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 View 1: Roadmap / Gantt Timeline (Q1–Q4 2026)
- **Time Header**: Split into 4 Quarters: `Q1 (Jan-Mar)`, `Q2 (Apr-Jun)`, `Q3 (Jul-Sep)`, `Q4 (Oct-Dec)`, with 12 monthly columns.
- **Swimlanes**: Grouped by Department Function (Website, Infrastructure, Cybersecurity, Innovation, Others).
- **Goal Bars**: Color-coded by status (Completed, In Progress, Not Started), showing progress percentage, title, and start/end dates. Clicking any bar slides open the **Goal Detail Drawer**.

### 5.3 View 2: SMART Goal Board
- Cards grouped by Function.
- Card Highlights:
  - Header: Department Function pill + Goal Type badge (*Breakthrough* / *Improvement*).
  - Title: Clear, bold goal statement.
  - SMART Metrics: Quantified Target snippet & Day Counter.
  - SWOT Pill Indicator: Count of identified Strengths, Weaknesses, Opportunities, Threats.
  - Footer: Accomplishment status tag, PIC badge, and date span.

### 5.4 View 3: Monthly Execution Cadence (Jan–Dec)
- **Top Month Selector**: Buttons for all 12 months with quick-status indicator (e.g. 5/19 completed).
- **Executive Review Table**:
  - Columns: `Goal & Function`, `Achievement Status`, `Result / Link`, `Challenges & Obstacles`, `Homework / Next Steps`, `Actions`.
  - Inline editing: Click any cell to update text or status directly.

### 5.5 View 4: The BIG Six Strategic Alignment Map
- Direct visual connection cards linking corporate objectives (e.g. *Income Dependency*, *Talent & Culture*, *Tech Innovation*) to the specific IT Department goals that support them.

### 5.6 Slide-Over Goal Detail & Edit Drawer
- Width: `w-full max-w-2xl` sliding smoothly from right with backdrop blur.
- Tabs:
  1. **SMART Definition**: Specific statement, Measurable action/target/the way, Time-bound date pickers.
  2. **SWOT & Resources**: 2x2 grid for Strengths, Weaknesses, Opportunities, Threats, plus resource checklist (Budget, HR, Time, Tech).
  3. **12-Month Cadence**: Vertical timeline of all 12 months with editable status, results, challenges, and homework.
