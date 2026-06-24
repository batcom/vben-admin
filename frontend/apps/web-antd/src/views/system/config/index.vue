<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Page } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import type { SysConfigItem } from './api';
import {
  getSystemConfigGroupedApi,
  createSystemConfigApi,
  updateSystemConfigApi,
  deleteSystemConfigApi,
  CONFIG_TYPE_OPTIONS,
} from './api';

const groups = ref<Array<{ key: string; label: string; sort: number; items: SysConfigItem[] }>>([]);
const loading = ref(false);
const activeTab = ref<string>('');
const saving = ref<Record<number | string, boolean>>({});
const useJson = ref<Record<number | string, boolean>>({});
const addFormTab = ref(false);
const addForm = ref<Record<string, any>>({});
const addSaving = ref(false);
const tabModal = ref(false);
const newTabName = ref('');
const newTabLabel = ref('');
const tagInput = ref<Record<number | string, string>>({});

const TYPE_LABELS: Record<string, string> = {
  string: '字符', number: '数字', boolean: '开关', textarea: '文本',
  json: 'JSON', array: '数组', dict: '字典', kv2d: '二维表',
};
const GROUP_LABELS: Record<string, string> = {
  basic: '基础配置', login: '登录配置', mail: '邮件配置',
  upload: '上传配置', seo: 'SEO', watermark: '水印', copyright: '版权',
  app_application: '应用', app_user_material: '素材', app_audio_clone: '音频克隆',
  app_watermark: '水印应用', app_other: '其他',
};

async function loadData() {
  loading.value = true;
  try {
    groups.value = await getSystemConfigGroupedApi();
    if (groups.value.length > 0 && !activeTab.value) activeTab.value = groups.value[0].key;
  } finally { loading.value = false; }
}
onMounted(loadData);

function tabItems(tab: any): SysConfigItem[] {
  return (tab.items || []).filter((i: SysConfigItem) => !i.key.startsWith('_ph_') && !i.key.startsWith('_placeholder_'));
}

function handleAddTab() { newTabName.value = ''; newTabLabel.value = ''; tabModal.value = true; }
async function confirmAddTab() {
  const n = newTabName.value.trim();
  if (!n) { message.error('请输入分组标识'); return; }
  saving.value['_nt'] = true;
  try {
    await createSystemConfigApi({ group: n, group_sort: groups.value.length, key: `_ph_${Date.now()}`, label: newTabLabel.value || n, type: 'string', value: '' });
    message.success('分组已创建'); tabModal.value = false; await loadData(); activeTab.value = n;
  } catch { message.error('创建失败'); } finally { delete saving.value['_nt']; }
}

async function saveItem(item: SysConfigItem) {
  saving.value[item.id] = true;
  try {
    let val = item.value;
    if (item.type === 'number') val = Number(val);
    else if (item.type === 'boolean') val = val === true || val === 'true';
    else if (['json', 'array', 'dict', 'kv2d'].includes(item.type) && useJson.value[item.id] && typeof val === 'string') {
      try { val = JSON.parse(val); } catch { message.error('JSON 格式不正确'); useJson.value[item.id] = true; return; }
    }
    await updateSystemConfigApi(item.id, { value: val });
    message.success('已保存'); useJson.value[item.id] = false;
  } catch { message.error('保存失败'); } finally { delete saving.value[item.id]; }
}

async function deleteItem(item: SysConfigItem) {
  if (!confirm(`删除「${item.key}」？`)) return;
  try { await deleteSystemConfigApi(item.id); await loadData(); } catch { message.error('删除失败'); }
}

function showAddForm() {
  addFormTab.value = true;
  addForm.value = { group: activeTab.value, type: 'string', name: '', title: '', value: '', tip: '', rule: '' };
}
async function submitAdd() {
  const f = addForm.value;
  if (!f.name?.trim()) { message.error('变量名不能为空'); return; }
  addSaving.value = true;
  try {
    let val = f.value;
    if (f.type === 'number') val = Number(val);
    else if (f.type === 'boolean') val = val === true || val === 'true';
    else if (['json', 'array', 'dict', 'kv2d'].includes(f.type) && typeof val === 'string') { try { val = JSON.parse(val); } catch { message.error('JSON 格式不正确'); return; } }
    await createSystemConfigApi({ group: f.group, key: f.name, label: f.title || f.name, type: f.type, value: val, placeholder: f.tip || null, remark: f.rule || null });
    message.success('创建成功'); addFormTab.value = false; await loadData();
  } catch { message.error('创建失败'); } finally { addSaving.value = false; }
}

function addDictKey(item: SysConfigItem) {
  const k = prompt('键名:'); if (!k?.trim()) return;
  if (!item.value || typeof item.value !== 'object') item.value = {}; item.value[k.trim()] = '';
}
function removeDict(item: SysConfigItem, k: string) { if (item.value) delete item.value[k]; }
function dictRowsOf(item: SysConfigItem): Array<{ k: string; v: any }> {
  const o = item.value; if (!o || typeof o !== 'object' || Array.isArray(o)) return [];
  return Object.entries(o).map(([k, v]) => ({ k, v }));
}
function addKvRow(item: SysConfigItem) { if (!Array.isArray(item.value)) item.value = []; (item.value as any[]).push({ k: '', v: '' }); }
function rmKvRow(item: SysConfigItem, i: number) { if (Array.isArray(item.value)) item.value.splice(i, 1); }
function addTag(item: SysConfigItem) {
  const t = tagInput.value[item.id]?.trim(); if (!t) return;
  if (!Array.isArray(item.value)) item.value = []; if (!(item.value as string[]).includes(t)) (item.value as string[]).push(t);
  tagInput.value[item.id] = '';
}
function rmTag(item: SysConfigItem, i: number) { if (Array.isArray(item.value)) item.value.splice(i, 1); }
</script>

<template>
  <Page description="可以在此增改系统的变量和分组，也可以自定义分组和变量" title="系统配置">
    <!-- ═══ White card wrapper ═══ -->
    <div class="bg-card border border-border rounded-lg">
      <!-- Tabs -->
      <div class="flex items-center gap-0 border-b border-border px-4 overflow-x-auto">
      <button v-for="tab in groups" :key="tab.key"
        class="px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors"
        :class="activeTab === tab.key ? 'border-blue-500 text-blue-600 font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'"
        @click="activeTab = tab.key">
        {{ GROUP_LABELS[tab.key] || tab.key }}
      </button>
      <button class="px-3 py-2.5 text-muted-foreground hover:text-blue-500 text-lg" title="新增分组" @click="handleAddTab">+</button>
    </div>

    <!-- ═══ Panels ═══ -->
    <div v-for="tab in groups" :key="tab.key" v-show="activeTab === tab.key">
      <!-- Add form -->
      <div v-if="addFormTab" class="mb-4 bg-card border border-border rounded-lg px-5 py-4">
        <div class="text-sm font-medium text-foreground mb-3">新增配置</div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><label class="text-xs text-muted-foreground block mb-0.5">分组</label><input v-model="addForm.group" class="w-full input" /></div>
          <div><label class="text-xs text-muted-foreground block mb-0.5">类型</label>
            <select v-model="addForm.type" class="w-full input">
              <option v-for="o in CONFIG_TYPE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div><label class="text-xs text-muted-foreground block mb-0.5">变量名 <span class="text-red-500">*</span></label><input v-model="addForm.name" class="w-full input font-mono" /></div>
          <div><label class="text-xs text-muted-foreground block mb-0.5">变量标题</label><input v-model="addForm.title" class="w-full input" /></div>
          <div class="col-span-2">
            <label class="text-xs text-muted-foreground block mb-0.5">变量值</label>
            <input v-if="addForm.type==='string'||addForm.type==='number'" v-model="addForm.value" :type="addForm.type==='number'?'number':'text'" class="w-full input" />
            <a-switch v-else-if="addForm.type==='boolean'" v-model:checked="addForm.value" />
            <textarea v-else v-model="addForm.value" :rows="2" class="w-full input"></textarea>
          </div>
          <div><label class="text-xs text-muted-foreground block mb-0.5">提示信息</label><input v-model="addForm.tip" class="w-full input" /></div>
          <div><label class="text-xs text-muted-foreground block mb-0.5">校验规则</label><input v-model="addForm.rule" class="w-full input" /></div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="px-4 py-1.5 text-sm border border-border rounded hover:border-blue-300 transition-colors bg-card" @click="addFormTab = false">关闭</button>
          <button class="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" :disabled="addSaving" @click="submitAdd">{{ addSaving ? '…' : '确定' }}</button>
        </div>
      </div>

      <!-- ═══ Table ═══ -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-muted/50 text-xs font-medium text-muted-foreground">
              <th class="px-4 py-2.5 text-left w-[15%]">变量标题</th>
              <th class="px-4 py-2.5 text-left w-[60%]">变量值</th>
              <th class="px-4 py-2.5 text-left w-[15%]">变量名</th>
              <th class="px-4 py-2.5 text-center w-[10%]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tabItems(tab)" :key="item.id"
              class="border-t border-border hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3 align-top">
                <div class="text-sm font-medium text-foreground leading-tight">{{ item.label || item.key }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="max-w-md">
                  <a-switch v-if="item.type === 'boolean'"
                    :checked="item.value === true || item.value === 'true'" size="small"
                    @change="(v: boolean) => { item.value = v; saveItem(item); }" />
                  <input v-else-if="item.type === 'number'" v-model.number="item.value" type="number" class="w-28 input" />
                  <input v-else-if="item.type === 'string'" v-model="item.value" :placeholder="item.placeholder || ''" class="w-full input" />
                  <textarea v-else-if="item.type === 'textarea'" v-model="item.value" :rows="2" :placeholder="item.placeholder || ''" class="w-full input"></textarea>
                  <div v-else-if="['json','array','dict','kv2d'].includes(item.type)">
                    <div class="flex items-center gap-2 mb-1">
                      <button class="text-xs" :class="!useJson[item.id] ? 'text-blue-500 font-medium' : 'text-muted-foreground'" @click="useJson[item.id] = false">可视化</button>
                      <span class="text-muted-foreground/40">/</span>
                      <button class="text-xs" :class="useJson[item.id] ? 'text-blue-500 font-medium' : 'text-muted-foreground'" @click="useJson[item.id] = true">JSON</button>
                    </div>
                    <textarea v-if="useJson[item.id]" v-model="item.value" :rows="2" class="w-full input font-mono text-xs" placeholder="JSON"></textarea>
                    <div v-if="!useJson[item.id] && item.type === 'array'">
                      <div class="flex flex-wrap gap-1 mb-1">
                        <span v-for="(t, i) in (item.value || [])" :key="i" class="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs rounded-full border border-blue-200 text-blue-600">{{ t }}<span class="cursor-pointer hover:text-red-500 ml-0.5" @click="rmTag(item, i)">✕</span></span>
                        <span v-if="!item.value || item.value.length === 0" class="text-xs text-muted-foreground">空</span>
                      </div>
                      <div class="flex gap-1"><input v-model="tagInput[item.id]" placeholder="输入后回车" class="px-2 py-0.5 text-xs border border-border rounded w-28 bg-transparent outline-none" @keydown.enter.prevent="addTag(item)" /><button class="px-2 py-0.5 text-xs border border-border rounded hover:border-blue-300 bg-card" @click="addTag(item)">添加</button></div>
                    </div>
                    <div v-if="!useJson[item.id] && (item.type === 'dict' || item.type === 'json')">
                      <table class="w-full text-xs border border-border rounded overflow-hidden">
                        <thead><tr class="bg-muted/30"><th class="px-2 py-1 text-left w-2/5 font-medium text-muted-foreground">键名</th><th class="px-2 py-1 text-left w-2/5 font-medium text-muted-foreground">键值</th><th class="px-2 py-1 text-center w-16"></th></tr></thead>
                        <tbody>
                          <tr v-for="(e, i) in dictRowsOf(item)" :key="i" class="border-t border-border">
                            <td class="px-1 py-0.5"><input v-model="e.k" class="w-full input font-mono text-xs" /></td>
                            <td class="px-1 py-0.5"><input v-model="e.v" class="w-full input text-xs" /></td>
                            <td class="px-1 py-0.5 text-center"><button class="text-xs text-red-400 hover:text-red-600" @click="removeDict(item, e.k)">✕</button></td>
                          </tr>
                        </tbody>
                      </table>
                      <button class="mt-0.5 text-xs text-blue-500 hover:text-blue-600" @click="addDictKey(item)">+ 追加</button>
                    </div>
                    <div v-if="!useJson[item.id] && item.type === 'kv2d'">
                      <table class="w-full text-xs border border-border rounded overflow-hidden">
                        <thead><tr class="bg-muted/30"><th class="px-2 py-1 text-left w-2/5 font-medium text-muted-foreground">K</th><th class="px-2 py-1 text-left w-2/5 font-medium text-muted-foreground">V</th><th class="px-2 py-1 text-center w-16"></th></tr></thead>
                        <tbody>
                          <tr v-for="(row, i) in (item.value || [])" :key="i" class="border-t border-border">
                            <td class="px-1 py-0.5"><input v-model="row.k" class="w-full input font-mono text-xs" /></td>
                            <td class="px-1 py-0.5"><input v-model="row.v" class="w-full input text-xs" /></td>
                            <td class="px-1 py-0.5 text-center"><button class="text-xs text-red-400 hover:text-red-600" @click="rmKvRow(item, i)">✕</button></td>
                          </tr>
                        </tbody>
                      </table>
                      <button class="mt-0.5 text-xs text-blue-500 hover:text-blue-600" @click="addKvRow(item)">+ 追加</button>
                    </div>
                  </div>
                  <div v-if="item.remark || item.placeholder" class="mt-0.5 text-xs text-muted-foreground">{{ item.remark || item.placeholder }}</div>
                </div>
              </td>
              <td class="px-4 py-3 align-top">
                <code class="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{{ item.key }}</code>
              </td>
              <td class="px-4 py-3 align-top text-center">
                <div class="flex items-center justify-center gap-1">
                  <button class="w-7 h-7 flex items-center justify-center rounded text-muted-foreground/60 hover:text-green-600 hover:bg-green-50 transition-colors" :disabled="saving[item.id]" title="保存" @click="saveItem(item)">
                    <svg v-if="!saving[item.id]" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                    <span v-else class="text-xs">…</span>
                  </button>
                  <button class="w-7 h-7 flex items-center justify-center rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors" title="删除" @click="deleteItem(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="tabItems(tab).length === 0" class="text-center py-12 text-muted-foreground/50 border-t border-border">暂无配置</div>
      </div>

      <!-- Footer -->
      <div class="flex items-center gap-2 mt-3">
        <button class="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" @click="showAddForm">新增</button>
        <button class="px-4 py-1.5 text-sm border border-border rounded hover:border-blue-300 transition-colors bg-card">重置</button>
      </div>
    </div>
    </div>

    <div v-if="groups.length === 0" class="text-center py-20 text-muted-foreground">暂无配置分组</div>

    <!-- Tab Modal -->
    <div v-if="tabModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/10" @click.self="tabModal = false">
      <div class="bg-card border border-border rounded-lg shadow-lg w-96 max-w-[90vw]">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border"><h3 class="text-sm font-medium text-foreground">新增配置分组</h3><button class="text-muted-foreground hover:text-foreground text-lg" @click="tabModal = false">✕</button></div>
        <div class="px-4 py-4 space-y-3">
          <div><label class="text-xs text-muted-foreground block mb-0.5">分组标识 <span class="text-red-500">*</span></label><input v-model="newTabName" class="w-full input" /></div>
          <div><label class="text-xs text-muted-foreground block mb-0.5">显示名称</label><input v-model="newTabLabel" class="w-full input" /></div>
        </div>
        <div class="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button class="px-3 py-1 text-xs border border-border rounded hover:border-blue-300 bg-card" @click="tabModal = false">取消</button>
          <button class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" :disabled="saving['_nt']" @click="confirmAddTab">{{ saving['_nt'] ? '…' : '创建' }}</button>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.input {
  @apply px-2 py-1.5 text-sm border border-border rounded bg-transparent outline-none transition-colors;
}
.input:focus {
  @apply border-blue-400;
}
</style>
