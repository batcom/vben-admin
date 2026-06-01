# CRUD Rapid Development Framework

## Problem Statement

Building CRUD pages in the vben-admin system currently requires writing duplicate code for every entity — a controller, service, module, API client, list page, and modal form. The existing code generator produces static output that doesn't adapt to convention changes. The goal is to eliminate this boilerplate: an entity with standard CRUD requirements should need zero page code and minimal backend configuration, while still supporting deep customization through a processor pipeline for non-standard business logic.

## Solution

A type-driven CRUD framework where Prisma model metadata (field types, nullability, labels) drives automatic controller generation, processor pipelines, and frontend page rendering. Backend modules are configured via a declarative config object, and a single generic frontend component renders all list pages.

## User Stories

1. As a developer adding a new database table, I want to register one line in the CrudModule config so that full CRUD endpoints and a working UI page are automatically generated.

2. As a developer, I want Prisma models to be auto-scanned so that I don't need to write any configuration for entities with standard CRUD needs.

3. As a developer, I want CRUD routes under a configurable prefix (e.g., /admin/user) so that URL paths are organized by application and can be changed to prevent path guessing attacks.

4. As a developer, I want multiple apps (admin, crm, demo) each with their own auth guard and prefix so that I can segregate API surfaces logically.

5. As a developer, I want a GET /:prefix/:entity/meta endpoint that returns field metadata and overrides so that the frontend can auto-render without hardcoded schema definitions.

6. As a developer, I want a processor pipeline for each CRUD route so that I can compose reusable logic blocks (auth, validation, uniqueness check, password hashing, audit logging) without writing controllers.

7. As a developer, I want to add custom processors by implementing a simple interface so that domain-specific logic integrates into the pipeline without modifying the framework.

8. As a developer, I want to override derived field types at the entity level so that special fields (status enums, password fields, foreign key selects) use the correct UI component.

9. As a developer, I want a CLI command to invoke processor pipelines so that I can test and debug CRUD operations without a frontend.

10. As a developer, I want a GUI code generator so that I can point at a table and generate the CRUD module configuration with a few clicks.

11. As a frontend developer, I want a single generic CRUD page component that renders search form, table, and edit modal from backend metadata so that I never need to write list/index.vue, data.ts, or modal.vue files.

12. As a frontend developer, I want the generic page to support toolbar operations (batch delete, add, refresh, quick search, column settings, export) so that users have full list-page functionality without per-page code.

13. As a frontend developer, I want the search form to be collapsible and auto-derived from field types so that text fields get Input, numeric fields get InputNumber, timestamps get RangePicker, and booleans get Switch.

14. As a developer, I want the action column to use CellOperation (registered at the adapter layer) so that switching UI frameworks only requires changing the adapter, not every page.

15. As a developer, I want all existing entity pages (user, role, menu, dept, order) migrated to the new generic page so that the codebase is consistent.

## Implementation Decisions

### Architecture Overview

The framework consists of two major subsystems: the backend CrudModule (NestJS) and the frontend Generic Crud Page (Vue/Vben). They communicate through a metadata contract — the CrudModule exposes a GET /:prefix/:entity/meta endpoint whose response drives the frontend's auto-rendering.

### Backend: CrudModule

- **Module entry**: `CrudModule.forRoot()` accepts a config object with apps, each of which has a prefix, guard, entity map, and autoScan flag.
- **Model scanning**: When autoScan is true (default), the module reads Prisma's DMMF at runtime to discover all models. Junction tables (UserRole, RoleMenu, etc.) are excluded automatically.
- **Processor pipeline**: Each CRUD route (list, detail, create, update, delete) is defined as an ordered array of processor references. Processors implement `{ execute(ctx: ProcessorContext): Promise<void> }` and mutate a shared context object.
- **Built-in processors**: auth, validate, search, paginate, list, detail, exists, create, update, softDelete, hardDelete, unique, hash, log, tree. Each is registered via `registerBuiltin()`.
- **Custom processors**: Any NestJS injectable can be registered as a processor. Custom processors and built-in processors are resolved from a shared registry with the same interface.
- **Controller**: A concrete `AdminCrudController` handles the admin app with `@Controller('admin')`. Additional apps get additional concrete controller classes.
- **Meta service**: Reads `Prisma.dmmf.datamodel.models` at runtime to extract field metadata (name, type, kind, isRequired, isId), maps Prisma types to PostgreSQL type names, and applies entity-level overrides.

### Frontend: Generic CRUD Page

- **Route pattern**: All entities share `crud-page.vue` via route meta (`{ entity: 'user', app: 'admin' }`). One route entry per entity.
- **Data flow**: On mount, the page calls `GET /api/:app/:entity/meta` to get field definitions and overrides, then passes them to `useCrudSchema` to generate search schema, table columns, and edit form schema.
- **useCrudSchema composable**: Maps Prisma types → VbenForm components and VxeGrid column configs. Type registry: String→Input, Int→InputNumber, DateTime→RangePicker/DatePicker, Boolean→Switch, Decimal→InputNumber.
- **Overrides**: Entity-level overrides from the meta endpoint are merged into auto-derived schemas. Override keys: component, componentProps, hideInSearch, hideInTable, hideInForm.
- **ListToolbar**: Reusable component with left (batch dropdown, add, delete, refresh, custom slot) and right (quick search input, column settings, export) sections.
- **CellOperation**: Renders action buttons via vxe-table cell renderer. Code-split by `code` property (edit, delete, custom). Uses Popconfirm for delete confirmation. Registered at adapter level to isolate UI framework dependency.

### API Contract: GET /:prefix/:entity/meta

```json
{
  "entity": "user",
  "label": "用户管理",
  "fields": [
    { "fieldName": "username", "label": "用户名", "dataType": "varchar", "nullable": false, "isPk": false }
  ],
  "overrides": {
    "status": { "component": "Select", "componentProps": { "options": {"1": "启用", "0": "禁用"} } },
    "password": { "hideInTable": true, "component": "InputPassword" }
  },
  "actions": { "batchDelete": true },
  "routes": ["list", "detail", "create", "update", "delete"]
}
```

### Multi-App Architecture

Each app registered via `CrudModule.forRoot()` gets its own controller with an isolated prefix and auth guard. Entity configurations are scoped per app. Route structure: `/api/{prefix}/{entity}` — for example, `/api/admin/user` and `/api/crm-api/order` coexist without conflict.

### Existing Entity Migration

The old per-entity controllers and pages (users, roles, menus, departments, orders) have been removed from the module registrations and replaced by the generic CrudModule route handler. The old frontend pages (index.vue + modal.vue pairs) remain on disk but are no longer referenced by routes. New routes point to `crud-page.vue` with the entity name as a route param.

## Testing Decisions

- The processor pipeline is the most naturally testable unit — each processor accepts a context object and returns void. Writing a unit test means constructing a context, running the processor, and asserting on the mutated context.
- Pipeline integration tests should test the full chain for a route (e.g., auth → search → paginate → list) by supplying a complete context including a real PrismaService connected to a test database.
- The CrudMetaService can be tested against the actual Prisma DMMF snapshot by reading the generated schema.
- Frontend tests should focus on useCrudSchema mapping correctness: given a set of CrudFieldMeta inputs, verify that searchSchema, tableColumns, and formSchema have the expected component types.
- The generic crud-page.vue is best tested with Playwright or Cypress against a running backend with seed data.
- Prior art: The existing field-permission module (backend) and adapter tests (frontend vxe-table) follow similar patterns.

## Out of Scope

- File upload handling in generic CRUD forms.
- Real-time updates (WebSocket/SSE) for table data.
- Multi-tenancy at the data level (already handled by DataScope).
- RBAC permission sync between backend and frontend menu/route system (existing mechanism).
- Batch import/export of CSV/Excel data.
- Advanced data visualization (charts, dashboards) — handled by the existing DashboardModule.
- User notifications / audit log viewer — the log processor is a stub awaiting a proper audit trail module.

## Further Notes

- The processor pipeline intentionally avoids a DSL. NestJS decorators and TypeScript config objects provide type safety and IDE support that a YAML/JSON DSL cannot match.
- The built-in `hash` processor depends on `bcryptjs` (already used elsewhere in the codebase).
- The `tree` processor is available for entities with parent-child relationships (menu, dept). It runs as a post-processing step after the list query.
- CLI integration (via `@nestjs/command` or `nest-commander`) and GUI generation (via the existing generator page) are noted as follow-up work but not fully implemented in this iteration.
- The frontend `useCrudSchema` composable and `ListToolbar` component are also usable on their own for pages that need partial customization.
