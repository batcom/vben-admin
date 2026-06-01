import { requestClient } from '#/api/request';

export namespace RoleApi {
  export interface RoleRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    status: number;
    sortOrder: number;
    createdAt: string;
    menus?: { menuId: number }[];
    permissions?: { permissionId: number }[];
  }

  export interface RoleListResult {
    items: RoleRecord[];
    total: number;
    page: number;
    pageSize: number;
  }

  export interface CreateRoleParams {
    name: string;
    code: string;
    description?: string;
    status?: number;
    sortOrder?: number;
    menuIds?: number[];
    permissionIds?: number[];
  }

  export interface UpdateRoleParams {
    name?: string;
    code?: string;
    description?: string;
    status?: number;
    sortOrder?: number;
    menuIds?: number[];
    permissionIds?: number[];
  }
}

export async function getRoleListApi(params?: Record<string, any>) {
  return requestClient.get<RoleApi.RoleListResult>('/roles', { params });
}

export async function getRoleApi(id: number) {
  return requestClient.get<RoleApi.RoleRecord>(`/roles/${id}`);
}

export async function createRoleApi(data: RoleApi.CreateRoleParams) {
  return requestClient.post('/roles', data);
}

export async function updateRoleApi(id: number, data: RoleApi.UpdateRoleParams) {
  return requestClient.put(`/roles/${id}`, data);
}

export async function deleteRoleApi(id: number) {
  return requestClient.delete(`/roles/${id}`);
}
