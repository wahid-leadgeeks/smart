# ADR-002: Embedded SQLite Storage with Atomic Seeding

## Status
Accepted

## Context
The application manages 19 high-density SMART goals with nested monthly logs, SWOT quadrants, and strategic metadata.
We evaluated three data storage approaches:
1. **In-Memory JSON files**: Simple, but prone to concurrency issues, lack of schema enforcement, and slow queries for filtered views.
2. **External Database (PostgreSQL / MySQL / Docker)**: Adds heavy operational overhead, requires running background daemons, and complicates reproduction across machines.
3. **Embedded SQLite (`better-sqlite3`)**: Single-file relational database stored in `data/smart_goals.db`, requiring zero external daemon setup, supporting sub-millisecond query execution and ACID transactions.

## Decision
We chose **Embedded SQLite using `better-sqlite3` (Option 3)**.

### Rationale
1. **Zero External Dependencies**: The database is stored as a file in the project directory. Cloning the repository and running `npm run dev` works immediately without requiring Postgres or Docker services.
2. **Relational Integrity**: Foreign key constraints between `goals` and `monthly_logs` guarantee that each goal always has exactly 12 structured monthly execution records.
3. **Sub-millisecond Performance**: `better-sqlite3` executes queries synchronously in the Node thread with minimal overhead (< 1ms per query), providing near-instant responses.
4. **Transaction Safety**: Excel seeding operations run in a single transaction (`BEGIN ... COMMIT`), ensuring data integrity is never left in a partial state if an error occurs.

## Consequences
- **Positive**:
  - Extremely fast reads/writes.
  - Zero server administration.
  - Effortless local backups by simply copying `data/smart_goals.db`.
- **Negative**:
  - `better-sqlite3` contains native C++ bindings, requiring standard build tools (`gcc`/`g++` or pre-built binaries for Node). In case native compiling encounters issues, a pure JS fallback (`sql.js`) can be employed.
