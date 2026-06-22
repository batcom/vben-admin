import { requestClient } from '#/api/request';

export async function getVirtualManListApi(params: any) {
  return requestClient.get('/admin/biz_virtual_man', { params });
}

export async function getVirtualManDetailApi(id: number) {
  return requestClient.get('/admin/biz_virtual_man/' + id);
}

export async function createVirtualManApi(data: any) {
  return requestClient.post('/admin/biz_virtual_man', data);
}

export async function updateVirtualManApi(id: number, data: any) {
  return requestClient.put('/admin/biz_virtual_man/' + id, data);
}

export async function deleteVirtualManApi(id: number) {
  return requestClient.delete('/admin/biz_virtual_man/' + id);
}
