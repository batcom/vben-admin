<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  getTextVariationListApi,
  createTextVariationApi,
  updateTextVariationApi,
  deleteTextVariationApi,
} from './api';

const loading = ref(false);
const dataSource = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const modalVisible = ref(false);
const modalTitle = ref('');
const formState = ref<Record<string, any>>({});

const columns = [
      { title: 'member_id', dataIndex: 'member_id', key: 'member_id' },
      { title: 'content', dataIndex: 'content', key: 'content' },
      { title: 'variates', dataIndex: 'variates', key: 'variates' },
      { title: 'rewrite', dataIndex: 'rewrite', key: 'rewrite' },
      { title: 'replace', dataIndex: 'replace', key: 'replace' },
      { title: 'status', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 200 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await getTextVariationListApi({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
    });
    dataSource.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  formState.value = {};
  modalTitle.value = '文本变体 - 新增';
  modalVisible.value = true;
}

function handleEdit(record: any) {
  formState.value = { ...record };
  modalTitle.value = '文本变体 - 编辑';
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  await deleteTextVariationApi(id);
  message.success('删除成功');
  loadData();
}

async function handleOk() {
  if (formState.value.id) {
    await updateTextVariationApi(formState.value.id, formState.value);
  } else {
    await createTextVariationApi(formState.value);
  }
  message.success('操作成功');
  modalVisible.value = false;
  loadData();
}

onMounted(loadData);
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <a-input-search
        v-model:value="keyword"
        placeholder="搜索关键词"
        style="width: 300px"
        @search="loadData"
      />
      <a-button type="primary" @click="handleAdd">新增</a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{ current: currentPage, pageSize, total }"
      @change="(p: any) => { currentPage = p.current; loadData() }"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleEdit(record)">编辑</a-button>
          <a-popconfirm title="确认删除？" @confirm="handleDelete(record.id)">
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="modalVisible" :title="modalTitle" @ok="handleOk">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="member_id" name="member_id">
          <a-input-number v-model:value="formState.member_id" style="width:100%" />
        </a-form-item>
        <a-form-item label="content" name="content">
          <a-input v-model:value="formState.content" />
        </a-form-item>
        <a-form-item label="variates" name="variates">
          <a-input v-model:value="formState.variates" />
        </a-form-item>
        <a-form-item label="rewrite" name="rewrite">
          <a-input v-model:value="formState.rewrite" />
        </a-form-item>
        <a-form-item label="replace" name="replace">
          <a-input v-model:value="formState.replace" />
        </a-form-item>
        <a-form-item label="status" name="status">
          <a-input v-model:value="formState.status" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
