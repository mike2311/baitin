# Task 01-02: Legacy Extract (DBF/FPT)

## Task Information

- **Phase**: 1.5 - Legacy Data Migration
- **Sprint**: Week 7
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: Task 01-01

## Objective

Extract in-scope legacy data from the FoxPro DBF/FPT storage into an intermediate, auditable format suitable for loading into PostgreSQL.

## Requirements

### 0. Tooling Requirement

Extraction MUST be implemented as part of the Phase 1.5 migration CLI/tool, not manual steps. The extractor should be reusable for production by adding table configs.

### 1. Supported Legacy Data Types

Extraction must handle:
- DBF tables
- Memo fields stored in FPT (e.g., item descriptions / notes)
- Character encoding conversion to UTF-8

### 2. Output Format (Intermediate)

Define a repeatable export format for each table (e.g., CSV with delimiter rules, or JSONL), including:
- Stable field ordering
- Null representation rules
- Date/time conversion rules
- Numeric precision rules
- Memo field extraction rules

The format MUST be:
- Machine-readable
- Deterministic (same input → same output)
- Compatible with bulk-loading into PostgreSQL

### 3. Auditability

For each exported table produce:
- Row count
- Timestamp
- Source filename(s)
- Optional checksum (file-level) to ensure repeatability

Additionally:
- Write structured logs (per table) for later reconciliation
- Capture rejected rows (parse/convert failures) into a quarantine file/table for review

### 4. Scope Guardrails

Only export:
- Tables in the owner-approved “relevant” scope
- Only rows matching any agreed filters (company / date range)

### 5. Performance & Safety

- Streaming extraction (do not load entire tables into memory)
- Configurable batch sizes
- Clear environment configuration so the tool cannot accidentally run against the wrong legacy source path

## Acceptance Criteria

- [ ] All in-scope legacy tables can be exported repeatably
- [ ] Memo fields are included and readable (no missing FPT content)
- [ ] Export produces row counts per table
- [ ] Encoding issues are identified and documented (if any)
- [ ] Rejects/quarantine output exists for any problematic rows (if encountered)

## References

- **Data Migration Strategy**: `../../modernization-strategy/04-data-migration-strategy/data-migration-strategy.md`


