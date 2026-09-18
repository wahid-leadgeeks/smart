# ADR-001: Selection of Next.js App Router for Fullstack Application

## Status
Accepted

## Context
The LeadGeeks IT SMART Goals platform requires:
1. An interactive web UI with fast rendering, view switching (Gantt timeline, Kanban board, monthly cadence table), and slide-over drawers.
2. Direct filesystem and local database access to parse Excel files, persist goal updates, and stream `.xlsx` exports.
3. Minimal operational complexity on the developer's local machine (Node.js runtime, zero multi-process orchestration requirement).

We considered three architectural patterns:
- **Option A**: SPA (Vite + React) + Separate Express or FastAPI Backend.
- **Option B**: Next.js App Router (unified fullstack React + Node.js API routes).
- **Option C**: Python (FastAPI + Jinja2 or Streamlit).

## Decision
We chose **Next.js App Router with TypeScript (Option B)**.

### Rationale
1. **Zero CORS & Single Process**: Both the server-side API endpoints (`/api/goals`, `/api/monthly`, `/api/export`) and the client-side interactive React components run within a single unified Node.js process via `npm run dev`.
2. **Server-Side Excel & SQLite Native Access**: Next.js route handlers run in a native Node.js environment, allowing synchronous, low-latency communication with `better-sqlite3` and binary Excel generation tools without network overhead.
3. **Ecosystem & UI Performance**: React 18/19 with Tailwind CSS provides the flexible, componentized foundation needed for custom Gantt timelines and slide-over drawers.

## Consequences
- **Positive**:
  - Unified codebase: types, validation, and constants are shared between server and client.
  - Simplified deployment and local execution (`npm install && npm run dev`).
- **Negative**:
  - Requires ensuring Node-only libraries (e.g. `better-sqlite3`, `fs`) remain strictly on the server side (`src/lib/db.ts` or `/api/*`) and are not bundled into client components.
