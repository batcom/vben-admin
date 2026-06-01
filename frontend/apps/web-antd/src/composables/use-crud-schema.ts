/**
 * Type-driven CRUD schema generator.
 *
 * Takes field definitions → auto-deduces search/table/edit schemas from dataType,
 * with per-field overrides for special cases (status enums, passwords, etc.).
 */
import { computed } from 'vue';

// ── Types ──

export interface CrudField {
  fieldName: string;
  label: string;
  /** DB type hint for auto-mapping (varchar, int4, timestamp, bool, text, numeric, etc.) */
  dataType?: string;
  /** Hide from search form */
  hideInSearch?: boolean;
  /** Hide from table column */
  hideInTable?: boolean;
  /** Hide from edit form */
  hideInForm?: boolean;
  /** Merged into VbenForm search schema item */
  searchProps?: Record<string, any>;
  /** Merged into VxeGrid column config */
  tableProps?: Record<string, any>;
  /** Merged into VbenForm edit schema item */
  formProps?: Record<string, any>;
}

interface AutoMap {
  search: { component: string } | null;  // null = not searchable
  table: Record<string, any>;
  form: { component: string };
}

// ── Type mapping registry ──

const DB_TYPE_MAP: Record<string, AutoMap> = {
  // String types
  varchar:     { search: { component: 'Input' }, table: {}, form: { component: 'Input' } },
  text:        { search: { component: 'Input' }, table: {}, form: { component: 'Textarea' } },
  char:        { search: { component: 'Input' }, table: {}, form: { component: 'Input' } },

  // Numeric types
  int4:        { search: { component: 'InputNumber' }, table: { width: 100, align: 'right' }, form: { component: 'InputNumber' } },
  int8:        { search: { component: 'InputNumber' }, table: { width: 100, align: 'right' }, form: { component: 'InputNumber' } },
  serial:      { search: { component: 'InputNumber' }, table: { width: 80 }, form: { component: 'InputNumber' } },
  numeric:     { search: { component: 'InputNumber' }, table: { width: 120, align: 'right' }, form: { component: 'InputNumber' } },
  decimal:     { search: { component: 'InputNumber' }, table: { width: 120, align: 'right' }, form: { component: 'InputNumber' } },
  float4:      { search: { component: 'InputNumber' }, table: { width: 120, align: 'right' }, form: { component: 'InputNumber' } },
  float8:      { search: { component: 'InputNumber' }, table: { width: 120, align: 'right' }, form: { component: 'InputNumber' } },

  // Boolean
  bool:        { search: null, table: { width: 70 }, form: { component: 'Switch' } },
  boolean:     { search: null, table: { width: 70 }, form: { component: 'Switch' } },

  // Date/Time
  timestamp:   { search: { component: 'RangePicker' }, table: { width: 170 }, form: { component: 'DatePicker' } },
  timestamptz: { search: { component: 'RangePicker' }, table: { width: 170 }, form: { component: 'DatePicker' } },
  date:        { search: { component: 'RangePicker' }, table: { width: 120 }, form: { component: 'DatePicker' } },
  time:        { search: { component: 'Input' }, table: { width: 100 }, form: { component: 'DatePicker' } },

  // JSON
  json:        { search: null, table: {}, form: { component: 'Textarea' } },
  jsonb:       { search: null, table: {}, form: { component: 'Textarea' } },
};

function findAutoMap(dataType?: string): AutoMap {
  const dt = dataType?.toLowerCase() || '';
  if (!dt) return { search: { component: 'Input' }, table: {}, form: { component: 'Input' } };
  const key = String(dt.split('(')[0]).split(' ')[0] || '';
  return DB_TYPE_MAP[key] ?? { search: { component: 'Input' }, table: {}, form: { component: 'Input' } };
}

// ── Composable ──

export function useCrudSchema(fields: CrudField[]) {
  const searchSchema = computed(() =>
    fields
      .filter((f) => !f.hideInSearch && f.fieldName !== 'id')
      .map((f): Record<string, any> | null => {
        const auto = findAutoMap(f.dataType);
        if (auto.search === null) return null;
        return {
          fieldName: f.fieldName,
          label: f.label,
          component: auto.search.component,
          ...f.searchProps,
        };
      })
      .filter((x): x is Record<string, any> => x !== null),
  );

  const tableColumns = computed(() =>
    fields
      .filter((f) => !f.hideInTable && f.fieldName !== 'id')
      .map((f): Record<string, any> => {
        const auto = findAutoMap(f.dataType);
        return {
          field: f.fieldName,
          title: f.label,
          ...auto.table,
          ...f.tableProps,
        };
      }),
  );

  const formSchema = computed(() =>
    fields
      .filter((f) => !f.hideInForm)
      .map((f): Record<string, any> => {
        const auto = findAutoMap(f.dataType);
        return {
          fieldName: f.fieldName,
          label: f.label,
          component: auto.form.component,
          ...f.formProps,
        };
      }),
  );

  return { searchSchema, tableColumns, formSchema } as const;
}
