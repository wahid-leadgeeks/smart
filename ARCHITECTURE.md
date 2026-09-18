# System Architecture Specification
## LeadGeeks Inc. — IT SMART Goals 2026 Platform

- **Status**: Approved
- **Runtime**: Node.js v20+ (Current: Node v24.18)
- **Framework**: Next.js 14/15 (App Router, TypeScript)
- **Persistence Layer**: Embedded SQLite (`better-sqlite3`)
- **Styling & Components**: Tailwind CSS, Lucide React

---

## 1. High-Level Architecture Overview

The system is architected as a cohesive fullstack Next.js application following Unidirectional Data Flow (UDF) principles. It bridges raw tabular Excel data into a typed relational data model served via Next.js App Router API endpoints and reactive React client components.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Browser)"]
        Nav["Top Bar & Global Controls<br/>(View Selector, Search, Filters, Excel Actions)"]
        
        subgraph Views ["Core Presentation Views"]
            RoadmapView["Roadmap / Gantt View<br/>(Q1-Q4 Timeline & Milestones)"]
            BoardView["SMART Board View<br/>(Grouped by Function + SWOT)"]
            CadenceView["Monthly Cadence View<br/>(Jan-Dec Review Grid)"]
            StrategicView["Big Six Strategic Map<br/>(Enterprise Linkage)"]
        end

        Drawer["Slide-Over Detail & Edit Drawer<br/>(Deep SMART Attributes + 12-Month Log)"]
        ClientState["Optimistic Client State & Cache"]
    end

    subgraph ServerLayer ["Next.js Server (Node.js)"]
        APIGoals["/api/goals (GET, PUT, PATCH)"]
        APIMonthly["/api/monthly (GET, PUT)"]
        APISync["/api/sync (POST - Re-read Excel)"]
        APIExport["/api/export (GET - Generate .xlsx)"]
        
        DBService["Database Service (db.ts)"]
        ExcelService["Excel Ingestion & Export Engine (excel.ts)"]
    end

    subgraph DataLayer ["Data & Storage Layer"]
        DB[(smart_goals.db - SQLite)]
        SourceExcel["Source File:<br/>[IT SMART Goals] ... .xlsx"]
        GeneratedExcel["Exported File:<br/>leadgeeks-it-goals-2026-export.xlsx"]
    end

    Nav --> Views
    Views --> Drawer
    Views <--> ClientState
    Drawer <--> ClientState
    ClientState <--> ServerLayer

    APIGoals --> DBService
    APIMonthly --> DBService
    APISync --> ExcelService
    APIExport --> ExcelService
    
    ExcelService <--> SourceExcel
    ExcelService --> GeneratedExcel
    ExcelService <--> DBService
    DBService <--> DB
```

---

## 2. Relational Database Schema (SQLite)

The database file is located at `/home/noah/project/smart/data/smart_goals.db`.

```mermaid
erDiagram
    GOALS ||--o{ MONTHLY_LOGS : "has 12 months"
    GOALS }o--|| DEPARTMENTS : "belongs to"
    GOALS }o--o| BIG_SIX_OBJECTIVES : "aligns with"

    GOALS {
        int id PK
        int row_number "Original Excel row number"
        string function "e.g. Infrastructure Management"
        string title "Goal title"
        text specific_statement "To ... by ... in order to ..."
        text action_plan "Action items"
        text target "Quantifiable target"
        text the_way "Execution methodology"
        string goal_type "Breakthrough | Improvement | Routine"
        string owner "Owner code (e.g. ITE)"
        string pic "Person in charge"
        string collaborators "Collaborator departments"
        string collaboration_flag "Yes | No"
        string type "Program | Event | Training"
        string period "Periodic | Occasional | Annual"
        string complexity "Low | Mid | High"
        string frequency "Low | Mid | High"
        string execution_period "Short | Mid | Long"
        text strengths "SWOT - Strengths"
        text weaknesses "SWOT - Weaknesses"
        text opportunities "SWOT - Opportunities"
        text threats "SWOT - Threats"
        string budget_available "YES | NO"
        string hr_available "YES | NO"
        string time_available "YES | NO"
        string tech_available "YES | NO"
        text resource_plan "Plan for unavailable resources"
        string company_focus_ref "Referenced strategic focus"
        string start_date "YYYY-MM-DD"
        string end_date "YYYY-MM-DD"
        string status "Completed | In Progress | Not started | Postponed"
        string accomplishment_status "Completed: Early | On Time | Late | Ongoing | Not Started"
        string half_adjustment "Adjustment notes"
        text notes "General remarks"
    }

    MONTHLY_LOGS {
        int id PK
        int goal_id FK
        int month_number "1 through 12"
        string month_name "January .. December"
        string achievement_status "Completed | In Progress | Not started | Overdue"
        text result_link "Deliverable documentation or links"
        text challenge "Blockers or obstacles encountered"
        text homework "Actionable next steps"
        datetime updated_at
    }

    BIG_SIX_OBJECTIVES {
        int id PK
        int objective_number "1 to 6"
        string title "e.g. Income Dependency (Profitability Risk)"
        text status_quo "Current situation"
        text strategic_objective "2026 Objective"
        text focus_area "Key tactical focus"
        string pic "Assigned departments"
        string focus_category "Company Profitability | Company Establishment"
    }

    DEPARTMENTS {
        string code PK "ITE, MNG, OPS, GRW, EXP, HRD, FAC, FBA"
        string name "Full department name"
    }
```

---

## 3. Server API Contracts

### 3.1 `GET /api/goals`
- **Response**: Array of all 19 IT Goals with summary metadata, date ranges, status tags, and SWOT summaries.
- **Query Params**:
  - `function`: Optional filter by department function.
  - `status`: Optional filter by execution status.
  - `goal_type`: Optional filter by Breakthrough / Improvement.
  - `search`: Full-text search across title, specific statement, and measurable indicators.

### 3.2 `GET /api/goals/[id]`
- **Response**: Detailed single goal record including all SMART attributes, SWOT quadrants, resource availability, and the full 12-month array of `monthly_logs`.

### 3.3 `PUT /api/goals/[id]`
- **Payload**: Partial or full update of goal properties (status, accomplishment_status, dates, SWOT, action plan).
- **Response**: Updated goal object with audit timestamp.

### 3.4 `GET /api/monthly?month=[1-12]`
- **Response**: Matrix of all 19 goals with their specific log for that selected month (achievement status, result link, challenges, homework).

### 3.5 `PUT /api/monthly/[id]`
- **Payload**: `{ achievement_status, result_link, challenge, homework }`
- **Response**: Updated monthly log record.

### 3.6 `POST /api/sync`
- **Behavior**: Re-reads the source Excel file `/home/noah/Documents/sheets/'[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx'`, compares with SQLite, and restores or updates records.

### 3.7 `GET /api/export`
- **Behavior**: Generates a standard Excel workbook (`.xlsx`) populated with the current live database state, preserving sheets and column alignments, delivered as a downloadable file attachment.

---

## 4. Frontend Component Hierarchy

```text
src/
├── app/
│   ├── layout.tsx                # Root layout with fonts, metadata, global styles
│   ├── page.tsx                  # Main application orchestrator
│   ├── api/
│   │   ├── goals/route.ts        # Goals list API
│   │   ├── goals/[id]/route.ts   # Single goal CRUD
│   │   ├── monthly/route.ts      # Monthly grid API
│   │   ├── monthly/[id]/route.ts # Single month update
│   │   ├── sync/route.ts         # Excel ingestion
│   │   └── export/route.ts       # Excel file generator
├── components/
│   ├── navigation/
│   │   ├── TopHeader.tsx         # Brand logo, global search, view switch tabs, Excel sync/export
│   │   └── FilterBar.tsx         # Function pills, status filters, goal type toggles
│   ├── views/
│   │   ├── RoadmapView.tsx       # Interactive Q1-Q4 Gantt timeline with month headers
│   │   ├── BoardView.tsx         # Function-grouped card grid with SMART chips
│   │   ├── CadenceView.tsx       # Monthly review grid (Jan-Dec) with result links & homework
│   │   └── StrategicMapView.tsx  # Linkage between The BIG Six and IT Goals
│   ├── drawer/
│   │   ├── GoalDrawer.tsx        # Slide-over panel container
│   │   ├── SmartDetailsTab.tsx   # Specific, Measurable, Attainable, Relevant, Timebound editor
│   │   ├── SwotTab.tsx           # 2x2 SWOT Matrix editor
│   │   └── MonthlyLogsTab.tsx    # 12-month tabbed editor with results, challenges, homework
│   └── ui/
│       ├── Badge.tsx             # Semantic status and priority badges
│       ├── Button.tsx            # 7-state button with loading & tactile states
│       ├── Input.tsx             # High-contrast accessible input field
│       └── Toast.tsx             # Notification feedback system
├── lib/
│   ├── db.ts                     # SQLite connection pool & query methods
│   ├── excel-parser.ts           # XLSX file parser & seed logic
│   ├── excel-exporter.ts         # XLSX workbook builder
│   └── types.ts                  # Shared TypeScript interfaces & models
└── styles/
    └── globals.css               # Design tokens, CSS custom properties, scrollbars
```

---

## 5. Security & Data Integrity Considerations

1. **Parameter Sanitization**: All database queries use parameterized SQL statements via `better-sqlite3` to eliminate SQL injection risks.
2. **Atomic Migrations & Seeding**: Database seeding runs within a single SQLite transaction (`db.transaction(...)`). If parsing fails, the transaction rolls back cleanly.
3. **Local File Integrity**: The source spreadsheet file is accessed in read-only mode during import; exports are generated to dedicated export buffers or safe paths to prevent file collision.
