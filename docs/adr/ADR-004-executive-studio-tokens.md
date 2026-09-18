# ADR-004: "Executive Studio" Design Tokens & Interaction Standard

## Status
Accepted

## Context
Standard enterprise tools often fall prey to "Dashboard Soup" — generic white card grids, unmotivated neon gradients, and cookie-cutter SaaS layouts.
For the LeadGeeks IT SMART Goals platform, we require a distinct, authoritative aesthetic that communicates clarity, strategic focus, and technical craftsmanship: **"Executive Studio"**.

## Decision
We established the **"Executive Studio"** design token architecture and enforced the **7-State Interaction Spectrum**.

### 1. Palette Tokens
- **Canvas / Surfaces**:
  - Base canvas: `#FBFBF9` (warm stone-50, eliminates stark glare)
  - Card surface: `#FFFFFF` (pure crisp ivory card layer)
  - Elevated drawer: `#FFFFFF` with warm shadow `0 20px 25px -5px rgba(28, 25, 23, 0.08)`
  - Subtle borders: `#E7E5E0` (warm hairline rule)
- **Typography & Ink**:
  - Primary text: `#1C1917` (deep stone-900)
  - Secondary text: `#57534E` (stone-600)
  - Muted text: `#A8A29E` (stone-400)
- **Semantic Accents**:
  - Completed / On Track: Sage Emerald (`#15803D` / light tint `#F0FDF4`)
  - In Progress / Ongoing: Warm Terracotta / Amber (`#C2410C` / light tint `#FFF7ED`)
  - Not Started / Upcoming: Cool Slate (`#475569` / light tint `#F1F5F9`)
  - Breakthrough Goal Accent: Deep Indigo / Violet (`#4338CA` / light tint `#EEF2FF`)
  - Improvement Goal Accent: Teal (`#0F766E` / light tint `#F0FDFA`)

### 2. The 7-State Interaction Spectrum
Every interactive button, tab, card, input, and drawer trigger implements all 7 states:
1. **Default**: Clear affordance, legible label, semantic border.
2. **Hover**: Instant visual feedback (elevation lift, subtle fill shift, cursor).
3. **Focus**: High-contrast, non-clipped 2px focus ring (`focus:ring-2 focus:ring-stone-800`).
4. **Active/Pressed**: Micro physical feedback (`active:scale-[0.98]`).
5. **Loading**: Inline spinner, preserved button width, disabled re-clicks.
6. **Success**: Affirmative feedback (checkmark morph or toast confirmation).
7. **Error**: Explicit inline helper message explaining the error.

## Consequences
- **Positive**:
  - High perceived polish and visual coherence.
  - Passes WCAG 2.1 AA accessibility (4.5:1 text contrast, 3:1 UI elements, >= 44px touch targets).
  - Eliminates visual fatigue during long review meetings.
- **Negative**:
  - Requires disciplined usage of predefined Tailwind token classes instead of arbitrary ad-hoc inline colors.
