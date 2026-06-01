import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace MenuApi {
  export interface MenuRecord {
    id: number;
    parentId: number | null;
    name: string;
    routeName: string | null;
    type: number;
    path: string | null;
    component: string | null;
    redirect: string | null;
    icon: string | null;
    sortOrder: number;
    perms: string | null;
    status: number;
    keepAlive: number;
    show: number;
    createdAt: string;
    children?: MenuRecord[];
  }

  export interface CreateMenuParams {
    parentId?: number;
    name: string;
    routeName?: string;
    type?: number;
    path?: string;
    component?: string;
    redirect?: string;
    icon?: string;
    sortOrder?: number;
    perms?: string;
    status?: number;
    keepAlive?: number;
    show?: number;
  }

  export interface UpdateMenuParams extends Partial<CreateMenuParams> {}
}

export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}

export async function getMenuListApi(params?: Record<string, any>) {
  return requestClient.get<MenuApi.MenuRecord[]>('/menu', { params });
}

export async function getMenuApi(id: number) {
  return requestClient.get<MenuApi.MenuRecord>(`/menu/${id}`);
}

export async function createMenuApi(data: MenuApi.CreateMenuParams) {
  return requestClient.post('/menu', data);
}

export async function updateMenuApi(id: number, data: MenuApi.UpdateMenuParams) {
  return requestClient.put(`/menu/${id}`, data);
}

export async function deleteMenuApi(id: number) {
  return requestClient.delete(`/menu/${id}`);
}
