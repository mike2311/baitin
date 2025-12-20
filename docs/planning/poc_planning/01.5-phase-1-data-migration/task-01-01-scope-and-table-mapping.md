# Task 01-01: Scope & Table Mapping (Legacy → PostgreSQL)

## Task Information

- **Phase**: 1.5 - Legacy Data Migration
- **Sprint**: Week 7
- **Priority**: High
- **Estimated Effort**: 0.5 days
- **Dependencies**: Phase 0 schema complete, Phase 1 master data modules available

## Objective

Define and lock the **PoC “relevant legacy data” scope** and create a mapping checklist (tables + keys + constraints) that will be used to execute and verify the migration.

## Requirements

### 0. Production-Bound Tooling Constraint (Applies to All Tasks in Phase 1.5)

This phase must result in a **config-driven migration CLI/tool** that can be expanded for production later. Therefore, scoping and mapping MUST be captured in a way the tool can consume (e.g., mapping config files), not only in narrative documentation.

### 1. Define “Relevant Data” (Owner Acceptance)

Produce a signed-off list of:
- In-scope tables
- In-scope date range (if applicable)
- Company scope (HT/BAT/INSP/HFW)
- Any exclusions (archived data, test companies, etc.)

### 2. Table Mapping Checklist

Create a mapping checklist that includes, for each in-scope table:
- Legacy table name (DBF/FPT)
- New PostgreSQL table name
- Primary key / unique key mapping
- Required fields and nullability constraints
- Relationships that must hold after migration
- Known data quality issues / exceptions

Additionally, define tool-consumable mapping config including:
- Field name mapping (legacy → target)
- Type conversion rules (date/boolean/numeric/memo)
- Default values / normalization rules (if any)
- Load strategy per table (truncate+reload for PoC baseline, upsert mode reserved for later)

### 3. Load Order Plan

Define load order to satisfy dependencies:
1. Reference tables (e.g., standard codes, origins)
2. Master data (items, customers, vendors)
3. Transaction subset (OE control/header/detail)
4. Users / roles seed (as needed for PoC access)

## Acceptance Criteria

- [ ] Owner-approved “relevant data” scope exists
- [ ] Mapping checklist completed for all in-scope tables
- [ ] Load order defined and reviewed
- [ ] Known data quality exceptions are documented

## References

- **Data Migration Strategy**: `../../modernization-strategy/04-data-migration-strategy/data-migration-strategy.md`
- **Master Data Tables**: `../../source/01-data-architecture/table-details/master-data-tables.md`


