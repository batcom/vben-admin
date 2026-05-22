<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(false);
const dataSource = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

async function loadData() {
  loading.value = true;
  try {
    const token = localStorage.getItem('accessToken') || '';
    const res = await fetch(`/api/orders?page=${currentPage.value}&pageSize=${pageSize.value}`, {
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
    <a-card title="订单列表">
      <a-table
        :columns="[
          { title: 'ID', dataIndex: 'id' },
          { title: '订单号', dataIndex: 'orderNo' },
          { title: '金额', dataIndex: 'totalAmount' },
          { title: '状态', dataIndex: 'status' },
          { title: '备注', dataIndex: 'remark' },
          { title: '创建时间', dataIndex: 'createdAt' },
        ]"
        :data-source="dataSource"
        :loading="loading"
        :pagination="{ current: currentPage, pageSize, total, onChange: handlePageChange }"
        row-key="id"
      />
    </a-card>
  </div>
</template>
