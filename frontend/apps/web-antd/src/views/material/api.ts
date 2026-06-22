import { requestClient } from '#/api/request';

export async function getMaterialListApi(params: any) {
  return requestClient.get('/admin/biz_user_material', { params });
}

export async function getMaterialDetailApi(id: number) {
  return requestClient.get('/admin/biz_user_material/' + id);
}

export async function createMaterialApi(data: any) {
  return requestClient.post('/admin/biz_user_material', data);
}

export async function updateMaterialApi(id: number, data: any) {
  return requestClient.put('/admin/biz_user_material/' + id, data);
}

export async function deleteMaterialApi(id: number) {
  return requestClient.delete('/admin/biz_user_material/' + id);
}
