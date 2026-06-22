import { requestClient } from '#/api/request';

export async function getCreditGoodsListApi(params: any) {
  return requestClient.get('/admin/biz_credit_goods', { params });
}

export async function getCreditGoodsDetailApi(id: number) {
  return requestClient.get('/admin/biz_credit_goods/' + id);
}

export async function createCreditGoodsApi(data: any) {
  return requestClient.post('/admin/biz_credit_goods', data);
}

export async function updateCreditGoodsApi(id: number, data: any) {
  return requestClient.put('/admin/biz_credit_goods/' + id, data);
}

export async function deleteCreditGoodsApi(id: number) {
  return requestClient.delete('/admin/biz_credit_goods/' + id);
}
