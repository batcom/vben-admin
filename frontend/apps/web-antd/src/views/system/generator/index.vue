<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const apiBase = '/api';

interface TableInfo {
  tableName: string;
  tableComment: string;
}

interface ColumnInfo {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  columnComment: string;
  isPrimaryKey: boolean;
}

interface GenerateForm {
  tableName: string;
  moduleName: string;
  modulePath: string;
  apiPrefix: string;
}

const tables = ref<TableInfo[]>([]);
const selectedTable = ref('');
const columns = ref<ColumnInfo[]>([]);
const loading = ref(false);
const generating = ref(false);
const previewVisible = ref(false);
const previewCode = ref<Record<string, Record<string, string>>>({});
const activeTab = ref('backend');

const form = ref<GenerateForm>({
  tableName: '',
  moduleName: '',
  modulePath: '',
  apiPrefix: '',
});

async function loadTables() {
  loading.value = true;
  try {
    const res = await fetch(`${apiBase}/generator/tables`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
    });
    const json = await res.json();
    tables.value = json.data || [];
  } finally {
    loading.value = false;
  }
}

async function onTableSelect(tableName: string) {
  form.value.tableName = tableName;
  const parts = tableName.replace(/^sys_/, '').split('_');
  const moduleName = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  form.value.moduleName = moduleName;
  form.value.modulePath = parts.join('-');
  form.value.apiPrefix = parts.join('-');

  const res = await fetch(`${apiBase}/generator/tables/${tableName}/columns`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` },
  });
  const json = await res.json();
  columns.value = json.data || [];
}

async function handlePreview() {
  generating.value = true;
  try {
    const res = await fetch(`${apiBase}/generator/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
      body: JSON.stringify(form.value),
    });
    const json = await res.json();
    previewCode.value = json.data || {};
    previewVisible.value = true;
  } finally {
    generating.value = false;
  }
}

async function handleGenerate() {
  generating.value = true;
  try {
    const res = await fetch(`${apiBase}/generator/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
      },
      body: JSON.stringify(form.value),
    });
    const json = await res.json();
    if (json.code === 0) {
      message.success('代码生成成功');
    } else {
      message.error(json.message || '生成失败');
    }
  } finally {
    generating.value = false;
  }
}

function getCodeContent(filename: string): string {
  const section = previewCode.value[activeTab.value];
  return section?.[filename] || '';
}

const backendFiles = ref<string[]>([]);
const frontendFiles = ref<string[]>([]);

function updateFileLists() {
  backendFiles.value = Object.keys(previewCode.value.backend || {});
  frontendFiles.value = Object.keys(previewCode.value.frontend || {});
}

onMounted(loadTables);
</script>

<template>
  <div class="p-4">
    <a-card title="代码生成器" class="mb-4">
      <a-form layout="inline">
        <a-form-item label="选择表">
          <a-select
            v-model:value="selectedTable"
            style="width: 250px"
            placeholder="请选择数据库表"
            :loading="loading"
            @change="onTableSelect"
          >
            <a-select-option
              v-for="t in tables"
              :key="t.tableName"
              :value="t.tableName"
            >
              {{ t.tableName }}
              <span v-if="t.tableComment" style="color: #999; margin-left: 8px">
                ({{ t.tableComment }})
              </span>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="模块名">
          <a-input v-model:value="form.moduleName" placeholder="模块名称" />
        </a-form-item>
        <a-form-item label="模块路径">
          <a-input v-model:value="form.modulePath" placeholder="如: product/category" />
        </a-form-item>
        <a-form-item label="API前缀">
          <a-input v-model:value="form.apiPrefix" placeholder="如: product-categories" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="generating" @click="handlePreview">
            预览代码
          </a-button>
          <a-button
            type="primary"
            danger
            :loading="generating"
            style="margin-left: 8px"
            @click="handleGenerate"
          >
            生成代码
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card v-if="columns.length > 0" title="表字段信息" class="mb-4">
      <a-table
        :columns="[
          { title: '字段名', dataIndex: 'columnName' },
          { title: '类型', dataIndex: 'dataType' },
          { title: '可空', dataIndex: 'isNullable', customRender: ({ text }) => text ? '是' : '否' },
          { title: '注释', dataIndex: 'columnComment' },
          { title: '主键', dataIndex: 'isPrimaryKey', customRender: ({ text }) => text ? '是' : '否' },
        ]"
        :data-source="columns"
        :pagination="false"
        row-key="columnName"
        size="small"
      />
    </a-card>

    <a-modal
      v-model:open="previewVisible"
      title="代码预览"
      width="80%"
      :footer="null"
      @after-open-change="updateFileLists"
    >
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="backend" tab="后端代码">
          <a-tabs>
            <a-tab-pane
              v-for="file in backendFiles"
              :key="file"
              :tab="file"
            >
              <pre style="max-height: 500px; overflow: auto; background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 12px;">{{ getCodeContent(file) }}</pre>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
        <a-tab-pane key="frontend" tab="前端代码">
          <a-tabs>
            <a-tab-pane
              v-for="file in frontendFiles"
              :key="file"
              :tab="file"
            >
              <pre style="max-height: 500px; overflow: auto; background: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 12px;">{{ getCodeContent(file) }}</pre>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>
