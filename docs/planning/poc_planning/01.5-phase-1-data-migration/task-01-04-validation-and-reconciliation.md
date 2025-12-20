# Task 01-04: Validation & Reconciliation

## Task Information

- **Phase**: 1.5 - Legacy Data Migration
- **Sprint**: Week 7
- **Priority**: High
- **Estimated Effort**: 1 day
- **Dependencies**: Task 01-03

## Objective

Prove that in-scope legacy data has been migrated to PostgreSQL with **no loss** and with **correct relationships**, producing evidence the owner can sign off on.

## Requirements

### 0. Tooling Requirement

Validation and reconciliation MUST be produced by the migration CLI/tool (machine-generated reports), not manual spot checks only.

### 1. Row Count Reconciliation

For each in-scope table:
- Legacy exported row count
- PostgreSQL loaded row count
- Any deltas explained and approved (filters, bad rows quarantined, etc.)

Output:
- A human-readable summary (markdown or html)
- A machine-readable artifact (json) for automation and future CI usage

### 2. Integrity Checks (PoC-Critical)

Validate (as applicable):
- Uniqueness constraints (item_no, cust_no, vendor_no, oe_no, etc.)
- Required reference values exist (e.g., std_code, origin)
- Referential relationships between OE control/header/detail (if included in scope)

### 3. Sampling

Create a repeatable sampling plan:
- Random sample of N records per table
- Edge-case sampling (long memo fields, non-ASCII characters, null dates, etc.)

Sampling must be deterministic (seeded) so results can be reproduced.

### 4. PoC Application Smoke Validation

Using Phase 1 UI:
- Confirm item/customer/vendor screens render and display migrated records
- Confirm search/type-to-search returns expected results

## Acceptance Criteria

- [ ] Reconciliation report produced and stored (counts + checks + samples)
- [ ] Any migration exceptions are documented and approved
- [ ] Owner sign-off for “relevant data migrated” is achievable
- [ ] Validation artifacts can be regenerated consistently after reset/reload

## References

- **Data Migration Strategy**: `../../modernization-strategy/04-data-migration-strategy/data-migration-strategy.md`
- **Validation Catalog**: `../../04-forms-and-screens/validation-catalog.md`


