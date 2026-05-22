import { Injectable } from '@nestjs/common';
import { ColumnInfo } from './introspection.service';
import * as fs from 'fs';
import * as path from 'path';

interface GenerateConfig {
  tableName: string;
  moduleName: string;
  modulePath: string;
  columns: ColumnInfo[];
  apiPrefix: string;
}

@Injectable()
export class GeneratorService {
  generateBackend(config: GenerateConfig): Record<string, string> {
    const { moduleName, columns, apiPrefix } = config;
    const pascalName = this.toPascalCase(moduleName);
    const camelName = this.toCamelCase(moduleName);

    const fields = columns
      .filter((c) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(c.columnName))
      .map((c) => ({
        name: c.columnName,
        tsType: this.toTsType(c.dataType),
        isNullable: c.isNullable,
        isPrimaryKey: c.isPrimaryKey,
      }));

    return {
      [`${camelName}.service.ts`]: this.renderService(pascalName, camelName, config.tableName, fields, apiPrefix),
      [`${camelName}.controller.ts`]: this.renderController(pascalName, camelName, fields, apiPrefix),
      [`${camelName}.module.ts`]: this.renderModule(pascalName, camelName),
    };
  }

  generateFrontend(config: GenerateConfig): Record<string, string> {
    const { moduleName, columns, apiPrefix } = config;
    const camelName = this.toCamelCase(moduleName);

    const fields = columns
      .filter((c) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(c.columnName))
      .map((c) => ({
        name: c.columnName,
        label: c.columnComment || c.columnName,
        component: this.mapComponent(c),
        tsType: this.toTsType(c.dataType),
      }));

    return {
      ['api.ts']: this.renderFrontendApi(camelName, apiPrefix),
      ['index.vue']: this.renderFrontendPage(camelName, moduleName, fields),
    };
  }

  private renderService(
    pascal: string,
    camel: string,
    tableName: string,
    fields: Array<{ name: string; tsType: string; isNullable: boolean }>,
    apiPrefix: string,
  ): string {
    const createFields = fields
      .map((f) => `    ${f.name}: ${f.tsType}${f.isNullable ? ' | null' : ''};`)
      .join('\n');

    const selectFields = fields
      .map((f) => `        ${f.name}: true,`)
      .join('\n');

    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ${pascal}Service {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; keyword?: string }) {
    const { page = 1, pageSize = 10, keyword } = query;
    const where: any = { deletedAt: null };

    if (keyword) {
      where.OR = [
${fields.slice(0, 3).map((f) => `        { ${f.name}: { contains: keyword } },`).join('\n')}
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.${camel}.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.${camel}.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.${camel}.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) throw new NotFoundException('${pascal} not found');
    return record;
  }

  async create(data: {
${createFields}
  }) {
    return this.prisma.${camel}.create({ data });
  }

  async update(id: number, data: any) {
    await this.ensureExists(id);
    return this.prisma.${camel}.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.${camel}.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureExists(id: number) {
    const record = await this.prisma.${camel}.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('${pascal} not found');
  }
}
`;
  }

  private renderController(
    pascal: string,
    camel: string,
    fields: Array<{ name: string; isPrimaryKey: boolean }>,
    apiPrefix: string,
  ): string {
    const permCode = apiPrefix.replace(/-/g, ':');
    return `import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { ${pascal}Service } from './${camel}.service';

@Controller('${apiPrefix}')
export class ${pascal}Controller {
  constructor(private ${camel}Service: ${pascal}Service) {}

  @Get()
  @RequirePermission('${permCode}:list')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.${camel}Service.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      keyword,
    });
  }

  @Get(':id')
  @RequirePermission('${permCode}:query')
  findOne(@Param('id') id: string) {
    return this.${camel}Service.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('${permCode}:create')
  create(@Body() data: any) {
    return this.${camel}Service.create(data);
  }

  @Put(':id')
  @RequirePermission('${permCode}:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.${camel}Service.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('${permCode}:delete')
  remove(@Param('id') id: string) {
    return this.${camel}Service.remove(parseInt(id, 10));
  }
}
`;
  }

  private renderModule(pascal: string, camel: string): string {
    return `import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './${camel}.controller';
import { ${pascal}Service } from './${camel}.service';

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
})
export class ${pascal}Module {}
`;
  }

  private renderFrontendApi(camel: string, apiPrefix: string): string {
    return `import { requestClient } from '#/api/request';

export async function get${this.toPascalCase(camel)}ListApi(params: any) {
  return requestClient.get('/${apiPrefix}', { params });
}

export async function get${this.toPascalCase(camel)}DetailApi(id: number) {
  return requestClient.get('/${apiPrefix}/' + id);
}

export async function create${this.toPascalCase(camel)}Api(data: any) {
  return requestClient.post('/${apiPrefix}', data);
}

export async function update${this.toPascalCase(camel)}Api(id: number, data: any) {
  return requestClient.put('/${apiPrefix}/' + id, data);
}

export async function delete${this.toPascalCase(camel)}Api(id: number) {
  return requestClient.delete('/${apiPrefix}/' + id);
}
`;
  }

  private renderFrontendPage(
    camel: string,
    moduleName: string,
    fields: Array<{ name: string; label: string; component: string }>,
  ): string {
    const pascal = this.toPascalCase(camel);
    const columns = fields
      .map(
        (f) => `      { title: '${f.label}', dataIndex: '${f.name}', key: '${f.name}' },`,
      )
      .join('\n');

    const formItems = fields
      .map((f) => {
        if (f.component === 'InputTextArea') {
          return `        <a-form-item label="${f.label}" name="${f.name}">
          <a-textarea v-model:value="formState.${f.name}" />
        </a-form-item>`;
        }
        if (f.component === 'InputNumber') {
          return `        <a-form-item label="${f.label}" name="${f.name}">
          <a-input-number v-model:value="formState.${f.name}" style="width:100%" />
        </a-form-item>`;
        }
        if (f.component === 'DatePicker') {
          return `        <a-form-item label="${f.label}" name="${f.name}">
          <a-date-picker v-model:value="formState.${f.name}" style="width:100%" />
        </a-form-item>`;
        }
        return `        <a-form-item label="${f.label}" name="${f.name}">
          <a-input v-model:value="formState.${f.name}" />
        </a-form-item>`;
      })
      .join('\n');

    return `<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  get${pascal}ListApi,
  create${pascal}Api,
  update${pascal}Api,
  delete${pascal}Api,
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
${columns}
  { title: '操作', key: 'action', width: 200 },
];

async function loadData() {
  loading.value = true;
  try {
    const res = await get${pascal}ListApi({
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
  modalTitle.value = '新增';
  modalVisible.value = true;
}

function handleEdit(record: any) {
  formState.value = { ...record };
  modalTitle.value = '编辑';
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  await delete${pascal}Api(id);
  message.success('删除成功');
  loadData();
}

async function handleOk() {
  if (formState.value.id) {
    await update${pascal}Api(formState.value.id, formState.value);
  } else {
    await create${pascal}Api(formState.value);
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
${formItems}
      </a-form>
    </a-modal>
  </div>
</template>
`;
  }

  private mapComponent(col: ColumnInfo): string {
    const dt = col.dataType.toLowerCase();
    if (dt.includes('text')) return 'InputTextArea';
    if (dt.includes('int') || dt.includes('numeric') || dt.includes('decimal')) return 'InputNumber';
    if (dt.includes('timestamp') || dt.includes('date')) return 'DatePicker';
    if (dt.includes('boolean') || dt.includes('bool')) return 'Switch';
    return 'Input';
  }

  private toTsType(dataType: string): string {
    const dt = dataType.toLowerCase();
    if (dt.includes('int') || dt.includes('serial')) return 'number';
    if (dt.includes('numeric') || dt.includes('decimal') || dt.includes('real') || dt.includes('double') || dt.includes('float')) return 'number';
    if (dt.includes('bool')) return 'boolean';
    if (dt.includes('timestamp') || dt.includes('date')) return 'Date';
    return 'string';
  }

  private toPascalCase(name: string): string {
    return name
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(name: string): string {
    const pascal = this.toPascalCase(name);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}
