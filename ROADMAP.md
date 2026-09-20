# Implementation Roadmap & Milestone Tracker
## LeadGeeks Inc. — IT SMART Goals 2026 Platform

---

## 🗺 Milestones Overview

```text
[x] Phase 1: Documentation Stack
[x] Phase 2: Project Scaffolding & Database Layer
[x] Phase 3: "Executive Studio" UI & Core Views
[x] Phase 4: Persistence, Drawer & Edit Workflows
[x] Phase 5: Excel Sync & Export Engine
[x] Phase 6: Quality Assurance & Build Verification
[x] Phase 7: Vercel Cloud Deployment & Google Drive Integration
```

---

## Phase 1: Documentation Stack
- [x] Create `PRD.md` (Why are we building this?)
- [x] Create `ARCHITECTURE.md` (What does the system look like?)
- [x] Create `docs/adr/ADR-001-framework-selection.md`
- [x] Create `docs/adr/ADR-002-sqlite-embedded-storage.md`
- [x] Create `docs/adr/ADR-003-excel-two-way-sync.md`
- [x] Create `docs/adr/ADR-004-executive-studio-tokens.md`
- [x] Create `DESIGN.md` (Design tokens, 7-state interaction spectrum, wireframes)
- [x] Create `AGENTS.md` (Agent rules of engagement and conventions)
- [x] Create `README.md` (Setup, execution, and developer guide)
- [x] Create `ROADMAP.md` (Task tracker and milestone log)

---

## Phase 2: Project Scaffolding & Database Layer
- [x] Initialize Next.js App Router project in `/home/noah/project/smart` with TypeScript & Tailwind CSS
- [x] Configure `tsconfig.json`, `package.json`, and `tailwind.config.ts` with "Executive Studio" tokens
- [x] Install dependencies: `better-sqlite3`, `@types/better-sqlite3`, `xlsx`, `lucide-react`, `clsx`, `tailwind-merge`
- [x] Implement SQLite database setup and migration scripts (`src/lib/db.ts`)
- [x] Implement Excel ingestion service (`src/lib/excel-parser.ts`) to extract all 19 goals and 228 monthly records from the Excel file
- [x] Seed SQLite database from `/home/noah/Documents/sheets/'[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx'`
- [x] Implement Next.js API route handlers:
  - [x] `GET /api/goals`
  - [x] `GET /api/goals/[id]`
  - [x] `PUT /api/goals/[id]`
  - [x] `GET /api/monthly`
  - [x] `PUT /api/monthly/[id]`

---

## Phase 3: "Executive Studio" UI & Core Views
- [x] Build global navigation and top bar (`TopHeader.tsx`, `FilterBar.tsx`)
- [x] Build **View 1: Roadmap / Gantt Timeline** (`RoadmapView.tsx`) with Q1–Q4 timeline markers and interactive goal spans
- [x] Build **View 2: SMART Goal Board** (`BoardView.tsx`) categorized by 5 IT Functions with SWOT tags and progress chips
- [x] Build **View 3: Monthly Execution Cadence** (`CadenceView.tsx`) with month switcher (Jan–Dec) and review grid
- [x] Build **View 4: The BIG Six Strategic Map** (`StrategicMapView.tsx`) linking IT goals to corporate objectives

---

## Phase 4: Persistence, Drawer & Edit Workflows
- [x] Build **Slide-Over Detail Drawer** (`GoalDrawer.tsx`)
- [x] Implement SMART Tab: Editable Specific statement, Measurable metrics, and dates
- [x] Implement SWOT Tab: Editable 2x2 grid (Strengths, Weaknesses, Opportunities, Threats) and Resource checklists
- [x] Implement 12-Month Cadence Tab: Editable monthly status, result links, challenges, and homework
- [x] Connect drawer edits to `/api/goals/[id]` and `/api/monthly/[id]` with optimistic updates and toast notifications

---

## Phase 5: Excel Sync & Export Engine
- [x] Implement Excel export generator (`src/lib/excel-exporter.ts`)
- [x] Build `GET /api/export` streaming downloadable `.xlsx`
- [x] Build `POST /api/sync` re-seeding database from original Excel file with confirmation modal

---

## Phase 6: Quality Assurance & Build Verification
- [x] Run `npm run lint` and verify zero errors (`✔ No ESLint warnings or errors`)
- [x] Run `npm run build` and verify clean static generation & typecheck
- [x] Verify responsive layout across desktop and tablet
- [x] Verify all 19 goals and 228 monthly cells are accurate
- [x] Final end-to-end verification walkthrough

---

## Phase 7: Vercel Cloud Deployment & Google Drive Integration
- [x] Remote PostgreSQL configuration supporting Aiven PostgreSQL with SSL
- [x] Dynamic database client abstraction (`DatabaseClient`) supporting both remote `pg.Pool` and embedded `PGlite`
- [x] Serverless filesystem safety (no read-only filesystem errors on `/var/task`)
- [x] Auto-seeding on fresh deployments from bundled template `data/seed-template.xlsx`
- [x] Google OAuth scopes updated for Google Spreadsheets and Google Drive (`drive.readonly`)
- [x] Google Drive file listing endpoint (`GET /api/google/files`)
- [x] Unified spreadsheet download supporting both native Google Sheets and uploaded `.xlsx` files
- [x] Google Sheets & Drive Manager Modal (`GoogleSpreadsheetModal.tsx`) for browsing, opening, and importing files
- [x] Replaced browser `confirm()` with custom `ConfirmDialog.tsx` modal
- [x] Created `vercel.json` deployment manifest and `docs/VERCEL_DEPLOYMENT.md` guide
