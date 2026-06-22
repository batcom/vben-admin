import { requestClient } from '#/api/request';

export async function getSupplementListApi(params: any) {
  return requestClient.get('/admin/biz_baokuan_task', { params });
}

export async function getSupplementDetailApi(id: number) {
  return requestClient.get('/admin/biz_baokuan_task/' + id);
}

export async function createSupplementApi(data: any) {
  return requestClient.post('/admin/biz_baokuan_task', data);
}

export async function updateSupplementApi(id: number, data: any) {
  return requestClient.put('/admin/biz_baokuan_task/' + id, data);
}

export async function deleteSupplementApi(id: number) {
  return requestClient.delete('/admin/biz_baokuan_task/' + id);
}
