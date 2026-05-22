<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(false);
const dataSource = ref<any[]>([]);

async function loadData() {
  loading.value = true;
  try {
    const token = localStorage.getItem('accessToken') || '';
    const res = await fetch('/api/departments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    dataSource.value = json.data || [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-4">
    <a-card title="部门管理">
      <a-table
        :columns="[
          { title: 'ID', dataIndex: 'id' },
          { title: '名称', dataIndex: 'name' },
          { title: '排序', dataIndex: 'sortOrder' },
          { title: '状态', dataIndex: 'status' },
        ]"
        :data-source="dataSource"
        :loading="loading"
        row-key="id"
        :pagination="false"
      />
    </a-card>
  </div>
</template>
