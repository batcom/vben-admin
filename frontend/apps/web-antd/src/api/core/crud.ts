import { requestClient } from '#/api/request';

export interface CrudFieldMeta {
  fieldName: string;
  label: string;
  dataType: string;
  nullable: boolean;
  isPk: boolean;
}

export interface CrudEntityMeta {
  entity: string;
  label: string;
  fields: CrudFieldMeta[];
  overrides: Record<string, Record<string, any>>;
  actions: Record<string, any>;
  routes: string[];
  tree?: { parentField: string; rowField: string };
}

export async function getEntityMetaApi(app: string, entity: string): Promise<CrudEntityMeta> {
  return requestClient.get(`/${app}/${entity}/meta`);
}

export async function getEntityListApi(app: string, entity: string, params: any): Promise<{ items: any[]; total: number }> {
  return requestClient.get(`/${app}/${entity}`, { params });
}

export async function getEntityDetailApi(app: string, entity: string, id: number): Promise<any> {
  return requestClient.get(`/${app}/${entity}/${id}`);
}

export async function createEntityApi(app: string, entity: string, data: any): Promise<any> {
  return requestClient.post(`/${app}/${entity}`, data);
}

export async function updateEntityApi(app: string, entity: string, id: number, data: any): Promise<any> {
  return requestClient.put(`/${app}/${entity}/${id}`, data);
}

export async function deleteEntityApi(app: string, entity: string, id: number): Promise<any> {
  return requestClient.delete(`/${app}/${entity}/${id}`);
}

/** GET /:app/:entity/options/:field — 获取字段的可选值列表，用于 ApiSelect 组件 */
export async function getEntityOptionsApi(app: string, entity: string, field: string) {
  return requestClient.get(`/${app}/${entity}/options/${field}`);
}
