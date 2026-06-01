# Frontend Context

## Glossary

| Term | Definition |
|---|---|
| **Type-driven CRUD** | An architecture where column metadata (DB type, nullable, length, comment) drives the automatic generation of search schemas, table column configs, and edit form schemas. |
| **Column metadata** | The type, nullability, max length, default value, and comment of a database column, obtained from the backend introspection API or defined declaratively in code. |
| **Schema mapping** | The transformation of column metadata into VbenForm schema items or VxeGrid column configs via a composable (`useCrudSchema`). |
| **ListToolbar** | A reusable toolbar component with a left side (batch actions, add, delete, refresh) and a right side (quick search, column settings, export). |
| **CellOperation** | A vxe-table cell renderer registered in the adapter layer that renders action buttons (edit, delete, custom) independent of the UI framework. |
| **useCrudSchema** | A composable that takes column metadata and generates search schema, column configs, and edit schema — the core of type-driven CRUD. |
| **Entity** | A domain object with a full set of CRUD endpoints (e.g., User, Role, Order, Department, Menu). |
