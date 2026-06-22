<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  getVoiceListApi,
  createVoiceApi,
  updateVoiceApi,
  deleteVoiceApi,
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
      { title: 'name', dataIndex: 'name', key: 'name' },
      { title: 'language', dataIndex: 'language', key: 'language' },
      { title: 'type', dataIndex: 'type', key: 'type' },
      { title: 'cover_url', dataIndex: 'cover_url', key: 'cover_url' },
      { title: 'audio_url', dataIndex: 'audio_url', key: 'audio_url' },
      { title: 'status', dataIndex: 'status', key: 'status' },
      { title: 'sort_order', dataIndex: 'sort_order', key: 'sort_order' },
  { title: '操作', key: 'action', width: 200 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await getVoiceListApi({
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
  modalTitle.value = '语音管理 - 新增';
  modalVisible.value = true;
}

function handleEdit(record: any) {
  formState.value = { ...record };
  modalTitle.value = '语音管理 - 编辑';
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  await deleteVoiceApi(id);
  message.success('删除成功');
  loadData();
}

async function handleOk() {
  if (formState.value.id) {
    await updateVoiceApi(formState.value.id, formState.value);
  } else {
    await createVoiceApi(formState.value);
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
        <a-form-item label="name" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="language" name="language">
          <a-input v-model:value="formState.language" />
        </a-form-item>
        <a-form-item label="type" name="type">
          <a-input v-model:value="formState.type" />
        </a-form-item>
        <a-form-item label="cover_url" name="cover_url">
          <a-input v-model:value="formState.cover_url" />
        </a-form-item>
        <a-form-item label="audio_url" name="audio_url">
          <a-input v-model:value="formState.audio_url" />
        </a-form-item>
        <a-form-item label="status" name="status">
          <a-input-number v-model:value="formState.status" style="width:100%" />
        </a-form-item>
        <a-form-item label="sort_order" name="sort_order">
          <a-input-number v-model:value="formState.sort_order" style="width:100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
