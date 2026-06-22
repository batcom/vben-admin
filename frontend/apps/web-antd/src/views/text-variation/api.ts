import { requestClient } from '#/api/request';

export async function getTextVariationListApi(params: any) {
  return requestClient.get('/admin/biz_text_variation', { params });
}

export async function getTextVariationDetailApi(id: number) {
  return requestClient.get('/admin/biz_text_variation/' + id);
}

export async function createTextVariationApi(data: any) {
  return requestClient.post('/admin/biz_text_variation', data);
}

export async function updateTextVariationApi(id: number, data: any) {
  return requestClient.put('/admin/biz_text_variation/' + id, data);
}

export async function deleteTextVariationApi(id: number) {
  return requestClient.delete('/admin/biz_text_variation/' + id);
}
