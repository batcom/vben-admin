# 0001 — Type-driven CRUD architecture

The frontend uses a runtime type-driven composable (`useCrudSchema`) that maps column metadata (DB type, nullable, length, comment) to VbenForm search schemas, VxeGrid column configs, and edit form schemas — rather than writing per-page manual schema arrays or relying on build-time code generation. This avoids repetitive boilerplate across entities (User, Role, Order, Department, Menu) and ensures the adapter layer (CellOperation, CellTag, etc.) is the only UI-framework-specific code; switching UI frameworks means changing the adapter, not every page.

## Status

Accepted

## Considered Options

- **Manual per-page schema** — Each page defines its own `formOptions.schema`, `gridOptions.columns`, and modal form. What the current codebase does. Simple per-page but verbose across 5+ entities; changes to conventions require touching every page.
- **Build-time code generation** — The existing `/generator` tool introspects a DB table and generates static CRUD code. Fast to scaffold but generated code is frozen at generation time; any convention change requires re-generation and the output uses raw `a-table`/`a-modal` rather than Vben Grid patterns.
- **Runtime type-driven composable** — `useCrudSchema` is a composable that takes column metadata and derives all three schemas at runtime. Override hooks exist for special cases (status enums, foreign-key selects, date-range searches). Single source of truth; adapter layer handles UI-framework isolation.

## Consequences

- A well-defined type-mapping registry is needed (DB type → VbenForm component → VxeGrid cell renderer).
- Override mechanism must exist for cases where automatic derivation is wrong (e.g., an `int` column that should be a `Select`, not `InputNumber`).
- The existing introspection API from the generator can serve as the metadata source, bridging build-time tooling with runtime adaptivity.
- All existing entity pages need to be migrated to the new pattern; the current manual config acts as the validation target.
