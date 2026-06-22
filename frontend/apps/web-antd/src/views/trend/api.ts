import { requestClient } from '#/api/request';

export async function getTrendListApi(params: any) {
  return requestClient.get('/admin/biz_trend', { params });
}

export async function getTrendDetailApi(id: number) {
  return requestClient.get('/admin/biz_trend/' + id);
}

export async function createTrendApi(data: any) {
  return requestClient.post('/admin/biz_trend', data);
}

export async function updateTrendApi(id: number, data: any) {
  return requestClient.put('/admin/biz_trend/' + id, data);
}

export async function deleteTrendApi(id: number) {
  return requestClient.delete('/admin/biz_trend/' + id);
}
