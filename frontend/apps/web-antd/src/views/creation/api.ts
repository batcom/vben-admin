import { requestClient } from '#/api/request';

export async function getCreationListApi(params: any) {
  return requestClient.get('/admin/biz_user_creation', { params });
}

export async function getCreationDetailApi(id: number) {
  return requestClient.get('/admin/biz_user_creation/' + id);
}

export async function createCreationApi(data: any) {
  return requestClient.post('/admin/biz_user_creation', data);
}

export async function updateCreationApi(id: number, data: any) {
  return requestClient.put('/admin/biz_user_creation/' + id, data);
}

export async function deleteCreationApi(id: number) {
  return requestClient.delete('/admin/biz_user_creation/' + id);
}
