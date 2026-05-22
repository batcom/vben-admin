<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

async function loadData() {
  loading.value = true;
  try {
    const token = localStorage.getItem('accessToken') || '';
    const res = await fetch(`/api/users?page=${currentPage.value}&pageSize=${pageSize.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    dataSource.value = json.data?.items || [];
    total.value = json.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number, size: number) {
  currentPage.value = page;
  pageSize.value = size;
  loadData();
}

onMounted(loadData);
</script>

<template>
  <div class="p-4">
    <a-card title="用户管理">
      <a-table
        :columns="[
          { title: 'ID', dataIndex: 'id' },
          { title: '用户名', dataIndex: 'username' },
          { title: '真实姓名', dataIndex: 'realName' },
          { title: '邮箱', dataIndex: 'email' },
          { title: '手机', dataIndex: 'phone' },
          { title: '状态', dataIndex: 'status' },
        ]"
        :data-source="dataSource"
        :loading="loading"
        :pagination="{ current: currentPage, pageSize, total, onChange: handlePageChange }"
        row-key="id"
      />
    </a-card>
  </div>
</template>
