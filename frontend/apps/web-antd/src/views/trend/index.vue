<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  getTrendListApi,
  createTrendApi,
  updateTrendApi,
  deleteTrendApi,
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
      { title: 'images', dataIndex: 'images', key: 'images' },
      { title: 'voice_url', dataIndex: 'voice_url', key: 'voice_url' },
      { title: 'status', dataIndex: 'status', key: 'status' },
      { title: 'like_count', dataIndex: 'like_count', key: 'like_count' },
  { title: '操作', key: 'action', width: 200 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await getTrendListApi({
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
  modalTitle.value = '动态管理 - 新增';
  modalVisible.value = true;
}

function handleEdit(record: any) {
  formState.value = { ...record };
  modalTitle.value = '动态管理 - 编辑';
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  await deleteTrendApi(id);
  message.success('删除成功');
  loadData();
}

async function handleOk() {
  if (formState.value.id) {
    await updateTrendApi(formState.value.id, formState.value);
  } else {
    await createTrendApi(formState.value);
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
        <a-form-item label="images" name="images">
          <a-input v-model:value="formState.images" />
        </a-form-item>
        <a-form-item label="voice_url" name="voice_url">
          <a-input v-model:value="formState.voice_url" />
        </a-form-item>
        <a-form-item label="status" name="status">
          <a-input v-model:value="formState.status" />
        </a-form-item>
        <a-form-item label="like_count" name="like_count">
          <a-input-number v-model:value="formState.like_count" style="width:100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
