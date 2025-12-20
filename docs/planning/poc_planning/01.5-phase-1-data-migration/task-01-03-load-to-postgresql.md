# Task 01-03: Load to PostgreSQL (PoC Database)

## Task Information

- **Phase**: 1.5 - Legacy Data Migration
- **Sprint**: Week 7
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: Task 01-02, Phase 0 schema complete

## Objective

Load extracted legacy data into the PoC PostgreSQL database in a **repeatable** and **idempotent** way while preserving relationships required by PoC modules.

## Requirements

### 0. Tooling Requirement

Loading MUST be implemented as part of the Phase 1.5 migration CLI/tool. The loader should support adding more tables later without rewriting the loader logic (config-driven).

### 1. Load Order and Constraints

Load in dependency order:
1. Reference tables (e.g., standard codes, origins, companies)
2. Master data (items, customers, vendors)
3. OE subset (control/header/detail)
4. Users (as needed)

During load:
- Disable/enable constraints only if necessary and documented
- Ensure final state satisfies referential integrity (or document exceptions)

### 2. Idempotency / Repeatability

Provide a repeatable approach that supports:
- Re-running the load safely (e.g., TRUNCATE + reload, or UPSERT strategy)
- Restoring baseline demo dataset quickly

Required run modes:
- **PoC baseline mode**: truncate + reload (fast reset for demos/testing)
- **Future production mode (design-ready)**: upsert/incremental mode (not necessarily implemented in PoC, but do not block it architecturally)

### 3. Data Transformation Rules

Apply consistent transformations:
- Date/time conversion to PostgreSQL types
- Boolean conversion (.T./.F. → true/false)
- Numeric precision preservation
- UTF-8 encoding normalization
- Memo fields → TEXT

### 4. Safety

- Run against PoC database only
- Provide clear “reset” steps to avoid partial loads

Additionally:
- Environment guardrails (explicit `ENV=POC` style check)
- Transaction boundaries defined (table-level or batch-level), with clear rollback behavior
- Prefer bulk load mechanisms suitable for production scale (e.g., PostgreSQL `COPY`) where feasible

## Acceptance Criteria

- [ ] All in-scope tables load successfully into PostgreSQL
- [ ] Post-load row counts match exported row counts (within agreed filters)
- [ ] PoC application can query and display migrated records (Phase 1 screens)
- [ ] Loader supports repeatable PoC baseline reset without manual DB edits

## References

- **Data Migration Strategy**: `../../modernization-strategy/04-data-migration-strategy/data-migration-strategy.md`


