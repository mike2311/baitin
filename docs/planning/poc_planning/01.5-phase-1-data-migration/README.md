# Phase 1.5: Legacy Data Migration (PoC PostgreSQL)

## Overview

Phase 1.5 migrates **relevant legacy FoxPro data** into the PoC PostgreSQL database so that the PoC can be evaluated using real-world data. This phase is a **stakeholder acceptance gate**: the PoC is not considered complete unless relevant legacy data is migrated and verified.

This phase MUST be implemented as a **production-bound migration tool**, not one-off scripts. While the PoC scope is smaller (only “relevant” tables), the tooling should be designed so it can be expanded later to production migration (e.g., more tables, different run modes, stronger cutover procedures) without rewriting from scratch.

## Duration

**Week 7** (1 week)

## Objectives

1. Migrate relevant legacy data (master + reference + PoC transaction subset) into PostgreSQL
2. Preserve data integrity and relationships required by PoC workflows
3. Provide repeatable reset/reload tooling for demos and iterative testing
4. Produce validation/reconciliation evidence (counts + integrity checks + sampling)
5. Build a migration tooling foundation suitable for later production expansion

## Scope

### In Scope (PoC-Relevant Data)

- **Master Data**: Items, Customers, Vendors
- **Reference Data**: Standard codes, origins, companies (and any other lookups required by validation)
- **Users / Security Seed**: Users and roles needed to access the PoC
- **Order Enquiry (PoC subset)**: OE Control + OE Header + OE Detail (schema created in Phase 0)

> Note: “Relevant” is ultimately defined by the owner’s acceptance criteria. This phase includes an explicit scoping/mapping task to lock the table list.

### Out of Scope

- Full production cutover procedures (downtime coordination, parallel-run, etc.)
- Non-PoC modules not covered by Phase 0–4 PoC plan

## Deliverables

- Migration scope and mapping document (tables + key fields + relationships)
- Extract process from legacy DBF/FPT with encoding rules
- Load process into PostgreSQL (repeatable + idempotent)
- Reconciliation report (row counts, referential checks, sampling)
- Reset/reload scripts to restore a known baseline for demos/tests

### Production-Bound Tooling Deliverables (Required)

- A **config-driven migration CLI/tool** that supports:
  - Table mapping configuration (no hardcoding per-table transformations in code)
  - Repeatable runs (PoC baseline reset) and safe re-runs (idempotent mode)
  - Streaming/batched extraction and loading (performance-safe)
  - Audit logs (what ran, when, row counts, errors)
  - Error quarantine/reject handling (bad rows are reported, not silently dropped)
  - Safety rails (environment checks to avoid running against the wrong database)

> Note: “Production-bound” here means engineering quality and reusability. It does NOT mean migrating all 186 tables during PoC.

## Success Criteria

- [ ] Confirmed “relevant legacy data” scope with owner
- [ ] Data migrated into PostgreSQL with **no data loss for in-scope tables**
- [ ] Referential integrity checks pass for in-scope relationships (or documented exceptions)
- [ ] Validation rules used by Phase 1 and upcoming Phase 2 can be exercised against migrated data
- [ ] Reset/reload scripts can restore baseline data within an agreed time window
- [ ] Migration implemented as a reusable CLI/tool foundation for future production migration

## Tasks

- [Task 01-01](task-01-01-scope-and-table-mapping.md): Scope & Table Mapping
- [Task 01-02](task-01-02-legacy-extract.md): Legacy Extract (DBF/FPT)
- [Task 01-03](task-01-03-load-to-postgresql.md): Load to PostgreSQL
- [Task 01-04](task-01-04-validation-and-reconciliation.md): Validation & Reconciliation
- [Task 01-05](task-01-05-repeatable-reset-seeding.md): Repeatable Reset / Seeding

## Dependencies

- Phase 0 complete (database schema + reference tables available)
- Phase 1 complete (master data screens available to visually validate migrated records)

## Document References

- **Data Migration Strategy**: `../../modernization-strategy/04-data-migration-strategy/data-migration-strategy.md`
- **Master Data Tables**: `../../source/01-data-architecture/table-details/master-data-tables.md`
- **Validation Catalog**: `../../04-forms-and-screens/validation-catalog.md`
- **Migration CLI (Runbook)**: `../../../migration-cli/SCRIPT_USAGE.md` (how to run extract/load/validate, FK soft/strict, data quality reporting)


