<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import { Button } from 'ant-design-vue';
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useVbenForm } from '#/adapter/form';
import {
  getEntityMetaApi,
  getEntityListApi,
  createEntityApi,
  updateEntityApi,
  deleteEntityApi,
  getEntityOptionsApi,
} from '#/api/core/crud';
import ListToolbar from '#/components/common/list-toolbar.vue';

const route = useRoute();
const app = computed(() => (route.meta?.app as string) || 'admin');
const entity = computed(() => route.meta?.entity as string);

const meta = ref<any>(null);
const selectedIds = ref<number[]>([]);
const editRecord = ref<any>(null);
const loading = ref(false);

// Custom search values - passed manually to the API query
const searchValues = ref<Record<string, any>>({});

// ── Build schemas from meta ──
const searchFields = computed(() => {
  if (!meta.value) return [] as any;
  const fields = (meta.value.fields || []).filter((f: any) => !meta.value.overrides?.[f.fieldName]?.hideInSearch && f.fieldName !== 'id');
  return fields.map((f: any) => {
    const ov = meta.value.overrides?.[f.fieldName];
    // Status → ApiSelect from backend
    if (f.fieldName === 'status') {
      return {
        fieldName: f.fieldName,
        label: f.label,
        component: 'ApiSelect',
        componentProps: {
          api: () => getEntityOptionsApi(app.value, entity.value, 'status'),
          immediate: true,
          placeholder: '请选择状态',
          allowClear: true,
        } as any,
      };
    }
    // Tags → ApiSelect multi-select
    if (f.fieldName === 'tags' || f.fieldName === 'tag') {
      return {
        fieldName: f.fieldName,
        label: f.label,
        component: 'ApiSelect',
        componentProps: {
          api: () => getEntityOptionsApi(app.value, entity.value, 'tags'),
          immediate: true,
          mode: 'multiple',
          placeholder: '选择标签',
          allowClear: true,
          style: { width: '180px' },
        } as any,
      };
    }
    return {
      fieldName: f.fieldName,
      label: f.label,
      component: ov?.component || mapSearchComponent(f.dataType),
      componentProps: ov?.componentProps || undefined,
    } as any;
  });
});

const tableCols = computed(() => {
  if (!meta.value) return [];
  const fields = (meta.value.fields || []).filter((f: any) => !meta.value.overrides?.[f.fieldName]?.hideInTable && f.fieldName !== 'id');
  const cols: any[] = fields.map((f: any) => ({
    field: f.fieldName,
    title: f.label,
    ...mapTableConfig(f.dataType, f.fieldName),
    // Date format: show date only, no timezone
    ...(f.dataType.startsWith('timestamp') || f.dataType === 'date' ? { formatter: ({ cellValue }: any) => cellValue ? String(cellValue).split('T')[0] : '' } : {}),
    // Tags → CellTags renderer
    ...(f.fieldName === 'tags' || f.fieldName === 'tag' ? { cellRender: { name: 'CellTags' } } : {}),
    // Images
    ...(f.fieldName === 'coverUrl' || f.fieldName === 'avatar' ? { cellRender: { name: 'CellImage', props: { width: 40, height: 40 } } } : {}),
    // Status → CellTag with color
    ...(f.fieldName === 'status' ? { cellRender: { name: 'CellTag', props: ({ row }: any) => {
      const s = String(row.status);
      const map: Record<string, any> = {
        'true': { color: 'green', text: '启用' },
        'false': { color: 'red', text: '禁用' },
        '1': { color: 'green', text: '启用' },
        '0': { color: 'red', text: '禁用' },
        'published': { color: 'green', text: '已发布' },
        'draft': { color: 'orange', text: '草稿' },
        'archived': { color: 'gray', text: '已归档' },
        'pending': { color: 'orange', text: '待处理' },
        'processing': { color: 'blue', text: '处理中' },
        'completed': { color: 'green', text: '已完成' },
        'cancelled': { color: 'red', text: '已取消' },
      };
      return map[s] || { color: '', text: s };
    }} } : {}),
    ...meta.value.overrides?.[f.fieldName]?.tableProps,
  }));
  cols.push({
    field: 'action',
    title: '操作',
    width: 160,
    fixed: 'right',
    cellRender: {
      name: 'CellOperation',
      attrs: {
        onClick: ({ code, row }: any) => {
          if (code === 'edit') { editRecord.value = row; editModalApi.open(); }
          if (code === 'delete') handleDelete(row);
        },
      },
    },
  });
  return cols;
});

function mapSearchComponent(dt: string): string {
  if (dt.startsWith('int') || dt === 'decimal' || dt === 'float8') return 'InputNumber';
  if (dt.startsWith('timestamp') || dt === 'date') return 'RangePicker';
  return 'Input';
}

function mapTableConfig(dt: string, fieldName?: string): Record<string, any> {
  const base: Record<string, any> = {};
  if (dt.startsWith('timestamp') || dt === 'date') { base.width = 170; base.sortable = true; }
  else if (dt.startsWith('int') || dt === 'decimal' || dt === 'float8') { base.width = 100; base.sortable = true; }
  // text, varchar, bool - no sort
  return base;
}

// ── Custom search form (buttons rendered separately in #form slot) ──
const [SearchForm, searchFormApi] = useVbenForm({
  schema: [],
  layout: 'inline',
  wrapperClass: 'flex-wrap',
  showDefaultActions: false,
});

// Search button logic (rendered outside form for layout control)
async function handleSearch() {
  const values = await searchFormApi.getValues() as Record<string, any>;
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(values)) {
    if (val === undefined || val === null || val === '') continue;
    if (val === '' || (Array.isArray(val) && val.length === 0)) continue;
    // Dayjs/RangePicker returns array of dayjs objects
    if (Array.isArray(val) && val.length === 2 && val[0]?.toISOString) {
      clean[key] = [val[0].toISOString(), val[1].toISOString()];
    } else if (val?.toISOString) {
      clean[key] = val.toISOString();
    } else if (Array.isArray(val)) {
      // Multi-select (tags) → comma-separated for contains search
      clean[key] = val.filter(Boolean).join(',');
    } else {
      clean[key] = val;
    }
  }
  searchValues.value = clean;
  gridApi.reload();
}

function handleReset() {
  searchFormApi.resetForm();
  searchValues.value = {};
  gridApi.reload();
}

// ── Grid (initialized without columns; columns set after meta loads) ──
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [],
    proxyConfig: {
      ajax: {
        query: async ({ page, sort, sorts, filters, form, options, code, isInited, isReload, $table, $grid, $gantt, button, ..._extra }: any) => {
          const res = await getEntityListApi(app.value, entity.value, {
            page: page?.currentPage || 1,
            pageSize: page?.pageSize || 10,
            ...searchValues.value,
          });
          return { items: res.items, total: res.total };
        },
      },
    },
    pagerConfig: { pageSize: 10 },
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      zoom: true,
      search: true,
    },
    checkboxConfig: { checkField: 'checked', reserve: true, highlight: true },
    exportConfig: {},
  },
  gridEvents: {
    'checkbox-change': ({ records }: any) => {
      selectedIds.value = (typeof records === 'function' ? records() : records || []).map((r: any) => r.id);
    },
    'checkbox-all': ({ records }: any) => {
      selectedIds.value = (typeof records === 'function' ? records() : records || []).map((r: any) => r.id);
    },
  },
  // Minimal formOptions to enable the form area (search via SearchForm slot)
  formOptions: {
    schema: [] as any,
    showCollapseButton: true,
  },
});

// ── Update columns when meta loads ──
watch(meta, async (m) => {
  if (!m) return;
  await nextTick();
  const cols = [{ type: 'checkbox', width: 50, fixed: 'left' }, ...tableCols.value];
  // Set columns on a fresh grid (no DOM to reconcile from empty state)
  if (gridApi.loadColumn) {
    gridApi.loadColumn(cols);
  } else {
    gridApi.setGridOptions({ columns: cols });
  }
  searchFormApi.setState({ schema: searchFields.value as any });
  nextTick(() => gridApi.reload());
});

// ── Edit Modal Form ──
const [EditForm, editFormApi] = useVbenForm({
  schema: [],
  showDefaultActions: false,
});

const [EditModal, editModalApi] = useVbenModal({
  title: '编辑',
  fullscreenButton: false,
  onConfirm: async () => {
    const values = await editFormApi.getValues() as Record<string, any>;
    const e = entity.value;
    if (editRecord.value?.id) {
      await updateEntityApi(app.value, e, editRecord.value.id, values);
    } else {
      await createEntityApi(app.value, e, values);
    }
    message.success('操作成功');
    editModalApi.close();
    gridApi.reload();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      editFormApi.setState({ schema: formFields.value as any });
      if (editRecord.value) {
        editFormApi.setValues(editRecord.value);
      } else {
        editFormApi.resetForm();
      }
    } else {
      editRecord.value = null;
    }
  },
});

// ── Load meta ──
const formFields = computed(() => {
  if (!meta.value) return [];
  return (meta.value.fields || []).filter((f: any) => !meta.value.overrides?.[f.fieldName]?.hideInForm).map((f: any) => {
    const ov = meta.value.overrides?.[f.fieldName];
    return {
      fieldName: f.fieldName,
      label: f.label,
      component: ov?.component || mapFormComponent(f.dataType),
      componentProps: ov?.componentProps || undefined,
    } as any;
  });
});

function mapFormComponent(dt: string): string {
  if (dt === 'text') return 'Textarea';
  if (dt.startsWith('int') || dt === 'decimal' || dt === 'float8') return 'InputNumber';
  if (dt.startsWith('timestamp') || dt === 'date') return 'DatePicker';
  if (dt === 'bool') return 'Switch';
  return 'Input';
}

async function loadMeta() {
  loading.value = true;
  try {
    meta.value = await getEntityMetaApi(app.value, entity.value);
  } finally {
    loading.value = false;
  }
}

async function handleDelete(row: any) {
  await deleteEntityApi(app.value, entity.value, row.id);
  message.success('删除成功');
  gridApi.query();
}

function onSelectChange({ records }: any) {
  selectedIds.value = records.map((r: any) => r.id);
}

async function handleBatchDelete() {
  if (!selectedIds.value.length) return;
  await Promise.all(selectedIds.value.map((id) => deleteEntityApi(app.value, entity.value, id)));
  message.success(`批量删除成功 (${selectedIds.value.length} 条)`);
  selectedIds.value = [];
  gridApi.query();
}

function onQuickSearch(value: string) {
  searchValues.value = { ...searchValues.value, keyword: value || undefined };
  gridApi.reload();
}

onMounted(loadMeta);
</script>

<template>
  <Page auto-content-height>
    <div v-if="meta" class="flex flex-col h-full">
      <Grid table-title="">
        <template #form>
          <div class="flex flex-wrap items-end gap-3 w-full">
            <div class="flex-1 min-w-0">
              <SearchForm />
            </div>
            <div class="flex gap-2 shrink-0 self-end">
              <Button type="primary" @click="handleSearch">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </div>
          </div>
        </template>
        <template #toolbar-actions>
          <ListToolbar
            position="left"
            :selected-count="selectedIds.length"
            :batch-actions="[
              { label: '批量删除', value: 'delete', danger: true },
              { label: '批量导出', value: 'export' },
              { label: '批量启用', value: 'enable' },
            ]"
            :add-text="'新增'"
            @add="editModalApi.open()"
            @refresh="gridApi.reload()"
            @batch-action="(action: string) => {
              if (action === 'delete') handleBatchDelete();
              if (action === 'export') gridApi.exportData?.();
              if (action === 'enable') message.info('批量启用 - 请自定义处理逻辑');
            }"
          />
        </template>
        <template #toolbar-tools>
          <ListToolbar
            position="right"
            :show-column-settings="false"
            :show-export="false"
            search-placeholder="搜索…"
            @search="onQuickSearch"
          />
        </template>
      </Grid>

      <EditModal>
        <EditForm />
      </EditModal>
    </div>
  </Page>
</template>
