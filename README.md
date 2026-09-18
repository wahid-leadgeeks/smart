# LeadGeeks Inc. — IT SMART Goals 2026 Web Platform

An interactive executive web application and execution tracker for **LeadGeeks Inc. 2026 IT SMART Goals, Objectives, and Plans**.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **SQLite**, designed around the bespoke **"Executive Studio"** design language.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or higher (tested on Node v24.18)
- **npm**: `v10.x` or higher
- Source Excel file located at:
  `/home/noah/Documents/sheets/'[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx'`

### 2. Installation
```bash
# Clone or navigate to the repository
cd /home/noah/project/smart

# Install dependencies
npm install
```

### 3. Database Seeding
The database automatically initializes on first run. To manually seed or refresh SQLite from the source Excel file:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🧭 Key Features

- **Interactive Roadmap / Gantt View**: Visual Q1–Q4 2026 execution timeline with milestone chips, completion percentages, and status indicators.
- **SMART Goal Board**: 19 IT Goals organized across 5 functional areas (Website Management, Infrastructure, Cybersecurity, Technology Optimization, and Others).
- **Monthly Cadence Review Grid**: 12-month execution matrix (Jan–Dec) capturing monthly achievements, result documentation links, blockers/challenges, and follow-up homework.
- **Strategic Alignment Map**: Transparent mapping connecting technical initiatives directly to **The BIG Six** corporate strategic objectives.
- **Slide-Over Detail & Edit Drawer**: Deep dive into SMART definitions, 2x2 SWOT matrices, resource availability, and full monthly execution logs with instant SQLite persistence.
- **Excel Ingestion & Export**: One-click bidirectional synchronization and `.xlsx` export.

---

## 📚 Documentation Stack

| Document | Purpose |
| :--- | :--- |
| [**PRD.md**](file:///home/noah/project/smart/PRD.md) | **Why are we building this?** Problem statement, personas, and requirements. |
| [**ARCHITECTURE.md**](file:///home/noah/project/smart/ARCHITECTURE.md) | **What does the system look like?** System diagrams, SQLite schema, API contracts. |
| [**docs/adr/**](file:///home/noah/project/smart/docs/adr/) | **What decisions constrain us?** Architectural Decision Records. |
| [**DESIGN.md**](file:///home/noah/project/smart/DESIGN.md) | **How should the UI behave/look?** Design tokens, 7-state interaction spectrum, wireframes. |
| [**AGENTS.md**](file:///home/noah/project/smart/AGENTS.md) | **How should agents work here?** Agent operational rules and guardrails. |
| [**ROADMAP.md**](file:///home/noah/project/smart/ROADMAP.md) | **What work remains?** Implementation milestones and task tracker. |

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14/15 App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Excel Engine**: [`xlsx`](https://github.com/SheetJS/sheetjs)
