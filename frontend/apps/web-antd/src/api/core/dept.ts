import { requestClient } from '#/api/request';

export namespace DeptApi {
  export interface DeptRecord {
    id: number;
    parentId: number | null;
    name: string;
    sortOrder: number;
    status: number;
    createdAt: string;
    children?: DeptRecord[];
  }

  export interface CreateDeptParams {
    parentId?: number;
    name: string;
    sortOrder?: number;
    status?: number;
  }

  export interface UpdateDeptParams {
    parentId?: number | null;
    name?: string;
    sortOrder?: number;
    status?: number;
  }
}

export async function getDeptListApi(params?: Record<string, any>) {
  return requestClient.get<DeptApi.DeptRecord[]>('/departments', { params });
}

export async function getDeptApi(id: number) {
  return requestClient.get<DeptApi.DeptRecord>(`/departments/${id}`);
}

export async function createDeptApi(data: DeptApi.CreateDeptParams) {
  return requestClient.post('/departments', data);
}

export async function updateDeptApi(id: number, data: DeptApi.UpdateDeptParams) {
  return requestClient.put(`/departments/${id}`, data);
}

export async function deleteDeptApi(id: number) {
  return requestClient.delete(`/departments/${id}`);
}
