# Agent Guidelines & Operational Rules
## LeadGeeks Inc. — IT SMART Goals 2026 Codebase

This document defines the rules of engagement, code conventions, and execution boundaries for AI coding agents operating in `/home/noah/project/smart`.

---

## 1. Golden Principles

1. **Data Preservation**:
   - The primary spreadsheet `/home/noah/Documents/sheets/'[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx'` is an external source of truth. **NEVER overwrite, delete, or modify this file directly in place**.
   - All Excel exports must be written to temporary export paths or provided as streaming downloads.
   - Database writes to `data/smart_goals.db` must use transactions (`db.transaction`) for multi-table updates.

2. **Design Discipline (Anti-Generic Mandate)**:
   - Adhere strictly to the "Executive Studio" design tokens in `DESIGN.md`.
   - Never inject arbitrary neon colors, generic blue buttons, or unnecessary card soup.
   - Always implement all states on interactive components (Hover, Focus, Active, Disabled, Loading).

3. **Code Quality & Type Safety**:
   - Write strict TypeScript with explicit interfaces (no `any` types).
   - Component logic must be co-located or cleanly modularized under `src/components/`.
   - API endpoints under `src/app/api/` must validate request bodies and return standard JSON responses `{ success: boolean, data?: T, error?: string }`.

---

## 2. Directory Structure Conventions

```text
/home/noah/project/smart/
├── PRD.md                  # Product Requirements (Why)
├── ARCHITECTURE.md         # System Design & Diagrams (What)
├── DESIGN.md               # UI/UX & Tokens (Look & Feel)
├── AGENTS.md               # Operating Guardrails (Agent Rules)
├── README.md               # Getting Started & Running (How to run)
├── ROADMAP.md              # Work Remaining & Milestones (TODO)
├── docs/adr/               # Architectural Decision Records (Constraints)
├── data/                   # SQLite database (smart_goals.db)
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   ├── components/         # Modular React components
│   │   ├── navigation/     # TopHeader, FilterBar
│   │   ├── views/          # RoadmapView, BoardView, CadenceView, StrategicMapView
│   │   ├── drawer/         # GoalDrawer and tabs
│   │   └── ui/             # Reusable UI primitives (Button, Badge, Input, Toast)
│   ├── lib/                # Core utilities (db.ts, excel-parser.ts, excel-exporter.ts)
│   └── types/              # TypeScript definitions
└── public/                 # Static assets
```

---

## 3. Standard Commands & Verification

Whenever modifying or adding code, agents must verify their work using these commands:

| Purpose | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Run Development Server** | `npm run dev` (Runs on `http://localhost:3000`) |
| **Run Linting** | `npm run lint` |
| **Run Typecheck & Build** | `npm run build` |
| **Re-seed Database from Excel**| `npm run seed` or `npx tsx scripts/seed.ts` |

---

## 4. Prohibited Actions for Agents

- **DO NOT** delete or truncate the SQLite database without user confirmation or explicit re-seed action.
- **DO NOT** introduce client-side database libraries (`better-sqlite3` must remain strictly server-side).
- **DO NOT** use `alert()`, `confirm()`, or unstyled browser dialogs; always use custom modal/drawer or toast UI.
- **DO NOT** push unverified builds with TypeScript errors.
