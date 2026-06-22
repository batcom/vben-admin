import { requestClient } from '#/api/request';

export async function getPosterListApi(params: any) {
  return requestClient.get('/admin/biz_poster', { params });
}

export async function getPosterDetailApi(id: number) {
  return requestClient.get('/admin/biz_poster/' + id);
}

export async function createPosterApi(data: any) {
  return requestClient.post('/admin/biz_poster', data);
}

export async function updatePosterApi(id: number, data: any) {
  return requestClient.put('/admin/biz_poster/' + id, data);
}

export async function deletePosterApi(id: number) {
  return requestClient.delete('/admin/biz_poster/' + id);
}
