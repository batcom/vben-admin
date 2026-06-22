import { requestClient } from '#/api/request';

export async function getVoiceListApi(params: any) {
  return requestClient.get('/admin/biz_voice', { params });
}

export async function getVoiceDetailApi(id: number) {
  return requestClient.get('/admin/biz_voice/' + id);
}

export async function createVoiceApi(data: any) {
  return requestClient.post('/admin/biz_voice', data);
}

export async function updateVoiceApi(id: number, data: any) {
  return requestClient.put('/admin/biz_voice/' + id, data);
}

export async function deleteVoiceApi(id: number) {
  return requestClient.delete('/admin/biz_voice/' + id);
}
