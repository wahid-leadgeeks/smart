# ADR-003: Bidirectional Excel Ingestion & Export Architecture

## Status
Accepted

## Context
The source of truth for LeadGeeks Inc.'s 2026 goals was originally authored in `/home/noah/Documents/sheets/'[IT SMART Goals] - LeadGeeks Inc. 2026 Goals, Objectives and Plans.xlsx'`.
The team needs the flexibility to:
1. Initialize the web application with 100% of the content from this workbook.
2. Allow ongoing updates through the web UI with database persistence.
3. Export an updated, clean Excel workbook (`.xlsx`) at any time for offline distribution or management review.
4. Optionally re-sync from the source Excel file if the spreadsheet is updated out-of-band.

We evaluated two sync strategies:
- **Continuous Live Filesystem Watching**: A background watcher triggers re-seeding whenever the `.xlsx` file touches the disk. This is prone to race conditions, partial writes while Excel is saving, and overwriting web UI edits.
- **Explicit Auto-Seed on First Launch + On-Demand Sync/Export**: Auto-populates SQLite if the database does not exist, and provides explicit user actions ("Re-seed from Excel" and "Export to Excel").

## Decision
We chose **Explicit Auto-Seed on First Launch + On-Demand Sync/Export**.

### Rationale
1. **Prevents Accidental Data Loss**: If a user spends 30 minutes logging monthly challenges and homework in the web app, an unintentional change or formula error in Excel should never silently wipe the web database.
2. **Explicit User Intent**: Clear UI actions ("Export to Excel" and "Re-seed from Excel with confirmation") put the operator in total control of data flow.
3. **Reproducible Format**: Exporting generates a clean, standardized `.xlsx` preserving the original column structure and monthly breakdowns.

## Consequences
- **Positive**:
  - Safe, predictable data flow.
  - Generates verifiable Excel artifacts on demand.
- **Negative**:
  - Out-of-band updates to the Excel file require the user to explicitly click "Re-seed" to reflect in the web app.
