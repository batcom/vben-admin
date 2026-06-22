<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  getSupplementListApi,
  createSupplementApi,
  updateSupplementApi,
  deleteSupplementApi,
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
      { title: 'keyword', dataIndex: 'keyword', key: 'keyword' },
      { title: 'douyin_url', dataIndex: 'douyin_url', key: 'douyin_url' },
      { title: 'video_url', dataIndex: 'video_url', key: 'video_url' },
      { title: 'cover_url', dataIndex: 'cover_url', key: 'cover_url' },
      { title: 'title', dataIndex: 'title', key: 'title' },
      { title: 'author', dataIndex: 'author', key: 'author' },
      { title: 'status', dataIndex: 'status', key: 'status' },
      { title: 'result', dataIndex: 'result', key: 'result' },
      { title: 'task_type', dataIndex: 'task_type', key: 'task_type' },
      { title: 'member_id', dataIndex: 'member_id', key: 'member_id' },
  { title: '操作', key: 'action', width: 200 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await getSupplementListApi({
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
  modalTitle.value = '补充管理 - 新增';
  modalVisible.value = true;
}

function handleEdit(record: any) {
  formState.value = { ...record };
  modalTitle.value = '补充管理 - 编辑';
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  await deleteSupplementApi(id);
  message.success('删除成功');
  loadData();
}

async function handleOk() {
  if (formState.value.id) {
    await updateSupplementApi(formState.value.id, formState.value);
  } else {
    await createSupplementApi(formState.value);
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
        <a-form-item label="keyword" name="keyword">
          <a-input v-model:value="formState.keyword" />
        </a-form-item>
        <a-form-item label="douyin_url" name="douyin_url">
          <a-input v-model:value="formState.douyin_url" />
        </a-form-item>
        <a-form-item label="video_url" name="video_url">
          <a-input v-model:value="formState.video_url" />
        </a-form-item>
        <a-form-item label="cover_url" name="cover_url">
          <a-input v-model:value="formState.cover_url" />
        </a-form-item>
        <a-form-item label="title" name="title">
          <a-input v-model:value="formState.title" />
        </a-form-item>
        <a-form-item label="author" name="author">
          <a-input v-model:value="formState.author" />
        </a-form-item>
        <a-form-item label="status" name="status">
          <a-input v-model:value="formState.status" />
        </a-form-item>
        <a-form-item label="result" name="result">
          <a-input v-model:value="formState.result" />
        </a-form-item>
        <a-form-item label="task_type" name="task_type">
          <a-input v-model:value="formState.task_type" />
        </a-form-item>
        <a-form-item label="member_id" name="member_id">
          <a-input-number v-model:value="formState.member_id" style="width:100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
