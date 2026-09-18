# Product Requirements Document (PRD)
## LeadGeeks Inc. — IT SMART Goals 2026 Platform

- **Project**: LeadGeeks IT SMART Goals 2026 Web Platform
- **Target Organization**: LeadGeeks Inc.
- **Department**: Information and Technology (ITE)
- **Year / Horizon**: Fiscal Year 2026
- **Status**: Approved / In Development

---

## 1. Executive Summary & Problem Statement

### 1.1 Context
LeadGeeks Inc. established an enterprise-wide strategic execution framework for 2026 anchored on **"The BIG Six"** strategic objectives and organizational priorities (Customer Retention, Customer Acquisition, Technology Innovation, Talent & Culture, Strong Financial & Risk Management).

Under this corporate umbrella, the **Information and Technology (ITE)** department authored **19 SMART Goals** spanning 5 key functional areas:
1. Website Management
2. Infrastructure Management
3. Cybersecurity
4. Technology Optimization & Innovation
5. Others (Recruitment & Performance Management)

### 1.2 The Problem
These 19 goals, their exhaustive SMART definitions, SWOT analysis (Strengths, Weaknesses, Opportunities, Threats), resource attainability models, and 12-month execution cadence (January through December tracking with Results, Blockers/Challenges, and Homework) currently reside in an extensive Excel spreadsheet (`[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx`).

Spreadsheets suffer from critical operational limitations:
- **Low Review Ergonomics**: High horizontal scroll fatigue across 80+ columns makes executive monthly cadences tedious.
- **Lack of Temporal Visualization**: Excel rows cannot effectively communicate overlapping timelines, delivery roadmaps, or Q1–Q4 Gantt progression.
- **Disconnected Strategic Context**: In a flat sheet, it is difficult to see at a glance how an individual IT task (e.g., *Google Workspace Platform Assessment*) rolls up into *Company Establishment - Technology Innovation* or *The BIG Six*.
- **Risk of Accidental Formula Overwrites**: Cells containing complex formulas (`ARRAYFORMULA`, date difference calculations) can be easily corrupted.

### 1.3 The Solution
A bespoke, high-fidelity web application titled **"Executive Studio"** designed specifically for the IT leadership and stakeholders of LeadGeeks Inc. The application transforms the static spreadsheet into an interactive living command center with full drill-down, Q1–Q4 roadmaps, monthly execution cadences, and SQLite persistence with bidirectional Excel synchronization.

---

## 2. User Personas & Jobs to Be Done (JTBD)

### Persona 1: IT Department Head / Tech Lead (Primary Operator)
- **Role**: Accountable for the delivery of all 19 IT department goals.
- **Job to Be Done**:
  - *When* conducting monthly review meetings with the team,
  - *I want to* quickly access the active month (e.g. September 2026), review what was completed, log challenges and homework, and update goal statuses,
  - *So that* my team maintains operational momentum and leadership receives transparent execution logs.

### Persona 2: Managing Director / Executive Leadership (Stakeholder)
- **Role**: Company leadership responsible for "The BIG Six" strategic objectives.
- **Job to Be Done**:
  - *When* reviewing department contributions to company profitability and establishment,
  - *I want to* see high-level progress roadmaps, SWOT posture, and direct linkages between IT initiatives and corporate focus areas,
  - *So that* I can ensure our capital and technical resources are driving business outcomes.

---

## 3. Product Scope & Functional Requirements

### 3.1 Scope Boundaries
- **In Scope**:
  - Ingestion and full presentation of all 19 IT Goals from the `ITE` sheet.
  - Complete SMART breakdown per goal:
    - **Specific**: Objective statement (`To ... by ... in order to ...`).
    - **Measurable**: Action item, quantifiable Target, and "The Way" execution plan.
    - **Attainable**: SWOT analysis (Strengths, Weaknesses, Opportunities, Threats), Complexity, Frequency, Execution Period, and Resource Availability matrix (Budget, HR, Time, Technology).
    - **Relevant**: Strategic alignment mapping to Company Focus and The BIG Six.
    - **Time-bound**: Start Date, End Date, Day Counter, and Accomplishment Status (Completed: Early/On Time/Late, In Progress, Not Started).
  - Complete 12-Month Review Cadence (Jan–Dec) per goal:
    - Achievement Status
    - Result Deliverable (Link / Document reference)
    - Blockers & Challenges
    - Next-Step Homework
  - Switchable Views:
    1. **Roadmap / Gantt Timeline** (Q1–Q4 2026 calendar view)
    2. **SMART Goal Board** (Grouped by Department Function with SWOT pills)
    3. **Monthly Execution Cadence** (Month-by-month review grid)
    4. **The BIG Six Strategic Map** (IT goals connected to enterprise priorities)
  - Slide-Over Goal Detail & Edit Drawer.
  - Local persistence via embedded SQLite.
  - One-click Excel Re-seed and Export back to `.xlsx`.
- **Out of Scope (v1.0)**:
  - Multi-tenant enterprise SSO (app is configured for internal local/secure team use).
  - Real-time multi-cursor collaborative editing (optimistic single-user / team updates with SQLite is sufficient).

---

## 4. Non-Functional Requirements (NFRs)

1. **Performance**:
   - Initial page load < 1.0 second.
   - Client-side filtering, searching, and view switching < 50ms.
   - Database operations (read/write) < 20ms.
2. **Design & Usability**:
   - Adherence to the **"Executive Studio"** design language: warm neutral canvas (`#FBFBF9`), stone typography, terracotta/sage status accents.
   - Strict compliance with the **7-State Interaction Spectrum** (Default, Hover, Focus, Active, Loading, Success, Error).
   - Zero "Dashboard Soup" — every card and section carries distinct hierarchy and purpose.
3. **Data Integrity & Safety**:
   - Automated database backups before re-seeding from Excel.
   - Strict validation of status transitions and date constraints.
4. **Reliability & Portability**:
   - Self-contained in `/home/noah/project/smart` with zero external database dependencies (pure Node.js + SQLite).

---

## 5. Success Metrics

- **100% Data Fidelity**: All 19 goals, 228 monthly execution cells (19 goals × 12 months), and strategic linkages match the source Excel file exactly.
- **Zero Friction Monthly Reviews**: Updating a monthly challenge or homework entry takes less than 10 seconds through the UI.
- **Executive Readability**: A stakeholder can discern the status of the entire IT roadmap within 5 seconds of viewing the application.
