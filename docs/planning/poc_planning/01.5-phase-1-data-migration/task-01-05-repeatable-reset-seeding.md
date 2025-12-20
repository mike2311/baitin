# Task 01-05: Repeatable Reset / Seeding (PoC Baseline)

## Task Information

- **Phase**: 1.5 - Legacy Data Migration
- **Sprint**: Week 7
- **Priority**: Medium
- **Estimated Effort**: 0.5 days
- **Dependencies**: Task 01-03

## Objective

Provide a repeatable way to restore the PoC database to a known baseline dataset so demos and testing are consistent.

## Requirements

### 0. Tooling Requirement

Reset/reload MUST be implemented as a first-class command in the migration CLI/tool (e.g., `reset`, `load`, `validate`), not a manual SQL-only process.

### 1. Baseline Dataset Definition

Define baseline contents:
- “Full relevant dataset” (if required by owner)
  - OR a curated “demo subset” derived from migrated data (if owner approves)
- Rules for selecting/curating demo subset (company/date filtering)

### 2. Reset Script(s)

Provide scripts/runbooks that can:
- Reset schema to a clean state (without re-running full schema migrations unless needed)
- Reload baseline data deterministically
- Be executed repeatedly in dev environments

Additionally:
- Document expected runtime for reset/reload
- Support a “dry-run” option where feasible (prints what will be changed)

### 3. Safety & Documentation

- Clear warnings and environment checks to prevent accidental execution against non-PoC databases
- Document runtime expectations and steps

## Acceptance Criteria

- [ ] Baseline dataset definition documented
- [ ] Reset/reload can be executed repeatedly with consistent results
- [ ] Demo prep and testing phases can rely on the baseline without manual fixes


