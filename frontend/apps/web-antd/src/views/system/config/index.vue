<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message, Tabs, Input, InputNumber, Switch, Tag } from 'ant-design-vue';
import {
  getSystemConfigGroupedApi,
  updateSystemConfigApi,
} from './api';

interface ConfigItem {
  id: number;
  group: string;
  key: string;
  label: string;
  value: any;
  type: string;
  placeholder: string;
  remark: string;
}

interface ConfigGroup {
  key: string;
  label: string;
  items: ConfigItem[];
}

const groups = ref<ConfigGroup[]>([]);
const loading = ref(false);
const activeTab = ref<string>('');
const editItem = ref<ConfigItem | null>(null);
const editValue = ref<any>(null);
const editModalVisible = ref(false);
const editSaving = ref(false);
const savingId = ref<number | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    groups.value = await getSystemConfigGroupedApi();
    if (groups.value.length > 0) {
      activeTab.value = groups.value[0].key;
    }
  } finally {
    loading.value = false;
  }
});

function labelOf(item: ConfigItem): string {
  const map: Record<string, string> = {
    user_material: '素材上传配置',
    imageLimit: '图片限制', videoLimit: '视频限制',
    size: '大小限制(MB)', extensions: '允许格式',
    duration: '时长范围(秒)', application: '应用配置',
    audio_clone: '音频克隆', watermark: '水印配置',
    newUserGuideVideoUrls: '新手指南视频',
  };
  return map[item.key] || item.label || item.key;
}

function descOf(item: ConfigItem): string {
  if (item.remark) return item.remark;
  const map: Record<string, string> = {
    imageLimit: '图片上传大小和格式限制',
    videoLimit: '视频上传大小、时长和格式限制',
    extensions: '支持的文件扩展名列表',
    size: '单个文件最大体积 (MB)',
    duration: '允许的时长范围 (秒)',
  };
  return map[item.key] || '';
}

function openEdit(item: ConfigItem) {
  editItem.value = item;
  if (item.type === 'json' || item.type === 'object') {
    try {
      editValue.value = typeof item.value === 'string'
        ? item.value
        : JSON.stringify(item.value, null, 2);
    } catch {
      editValue.value = '';
    }
  } else {
    editValue.value = item.value;
  }
  editModalVisible.value = true;
}

async function confirmEdit() {
  if (!editItem.value) return;
  const item = editItem.value;
  let val = editValue.value;
  if (item.type === 'number') val = Number(val);
  else if (item.type === 'boolean') val = val === true || val === 'true' || val === 1;
  else if (item.type === 'json' || item.type === 'object') {
    try { val = typeof val === 'string' ? JSON.parse(val) : val; }
    catch { message.error('JSON 格式不正确'); return; }
  }
  editSaving.value = true;
  try {
    await updateSystemConfigApi(item.id, { value: val });
    message.success('保存成功');
    editModalVisible.value = false;
    groups.value = await getSystemConfigGroupedApi();
  } catch { message.error('保存失败'); }
  finally { editSaving.value = false; }
}

async function saveItem(item: ConfigItem) {
  savingId.value = item.id;
  try {
    await updateSystemConfigApi(item.id, { value: item.value });
    message.success('已保存');
  } catch { message.error('保存失败'); }
  finally { savingId.value = null; }
}

const typeColors: Record<string, string> = {
  string: 'blue', number: 'green', boolean: 'orange',
  json: 'purple', object: 'purple',
};
</script>

<template>
  <div class="p-4">
    <a-spin v-if="loading" class="flex justify-center py-20" />

    <template v-else-if="groups.length > 0">
      <!-- Tab bar -->
      <div class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        <button
          v-for="tab in groups"
          :key="tab.key"
          class="px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors"
          :class="activeTab === tab.key
            ? 'bg-white dark:bg-gray-800 border border-b-0 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 -mb-px'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div
        v-for="tab in groups"
        :key="tab.key"
        v-show="activeTab === tab.key"
        class="max-w-3xl"
      >
        <div
          v-for="item in tab.items"
          :key="item.id"
          class="flex items-center justify-between py-3 px-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
        >
          <div class="flex-1 min-w-0 mr-6">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ labelOf(item) }}
              </span>
              <Tag :color="typeColors[item.type] || 'default'" class="text-xs leading-none px-1.5">
                {{ item.type }}
              </Tag>
            </div>
            <div v-if="descOf(item)" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {{ descOf(item) }}
            </div>
            <div class="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
              {{ item.key }}
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-2">
            <Switch
              v-if="item.type === 'boolean'"
              :checked="item.value === true || item.value === 'true' || item.value === 1"
              :loading="savingId === item.id"
              @change="(v: boolean) => { item.value = v; saveItem(item); }"
            />

            <InputNumber
              v-else-if="item.type === 'number'"
              v-model:value="item.value"
              :placeholder="item.placeholder || ''"
              size="small"
              :loading="savingId === item.id"
              style="width: 140px"
              controls
              @blur="saveItem(item)"
            />

            <Input
              v-else-if="item.type === 'string' && (!item.value || String(item.value).length < 60)"
              v-model:value="item.value"
              :placeholder="item.placeholder || '输入值'"
              size="small"
              style="width: 200px"
              @blur="saveItem(item)"
            />

            <button
              v-else
              class="ant-btn ant-btn-default ant-btn-sm"
              @click="openEdit(item)"
            >
              {{ item.type === 'json' || item.type === 'object' ? '编辑 JSON' : '编辑' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-20 text-gray-400">暂无配置数据</div>

    <!-- Edit Modal -->
    <a-modal
      v-model:open="editModalVisible"
      :title="editItem ? labelOf(editItem) : '编辑'"
      :confirm-loading="editSaving"
      @ok="confirmEdit"
    >
      <template v-if="editItem">
        <div class="mb-3">
          <div class="text-xs text-gray-400">{{ editItem.key }}</div>
          <div v-if="descOf(editItem)" class="text-xs text-gray-500 mt-1">{{ descOf(editItem) }}</div>
        </div>
        <Input v-if="editItem.type === 'string'" v-model:value="editValue" :placeholder="editItem.placeholder || '输入值'" />
        <InputNumber v-else-if="editItem.type === 'number'" v-model:value="editValue" :placeholder="editItem.placeholder || '输入数字'" style="width:100%" controls />
        <Switch v-else-if="editItem.type === 'boolean'" v-model:checked="editValue" />
        <a-textarea v-else-if="editItem.type === 'json' || editItem.type === 'object'" v-model:value="editValue" :rows="10" placeholder="输入 JSON" class="font-mono text-xs" />
        <a-textarea v-else v-model:value="editValue" :rows="4" :placeholder="editItem.placeholder || '输入值'" />
      </template>
    </a-modal>
  </div>
</template>
