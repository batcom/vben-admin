import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace UserApi {
  export interface UserRecord {
    id: number;
    username: string;
    realName: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    status: number;
    deptId: number | null;
    createdAt: string;
    roles: { role: { id: number; name: string } }[];
  }

  export interface UserListResult {
    items: UserRecord[];
    total: number;
    page: number;
    pageSize: number;
  }

  export interface CreateUserParams {
    username: string;
    password: string;
    realName?: string;
    email?: string;
    phone?: string;
    deptId?: number;
    status?: number;
  }

  export interface UpdateUserParams {
    realName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status?: number;
    deptId?: number;
    password?: string;
  }
}

export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

export async function getUserListApi(params?: Record<string, any>) {
  return requestClient.get<UserApi.UserListResult>('/users', { params });
}

export async function getUserApi(id: number) {
  return requestClient.get<UserApi.UserRecord>(`/users/${id}`);
}

export async function createUserApi(data: UserApi.CreateUserParams) {
  return requestClient.post('/users', data);
}

export async function updateUserApi(id: number, data: UserApi.UpdateUserParams) {
  return requestClient.put(`/users/${id}`, data);
}

export async function deleteUserApi(id: number) {
  return requestClient.delete(`/users/${id}`);
}
