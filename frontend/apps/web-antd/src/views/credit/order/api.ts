import { requestClient } from '#/api/request';

export async function getCreditOrderListApi(params: any) {
  return requestClient.get('/admin/biz_credit_order', { params });
}

export async function getCreditOrderDetailApi(id: number) {
  return requestClient.get('/admin/biz_credit_order/' + id);
}

export async function createCreditOrderApi(data: any) {
  return requestClient.post('/admin/biz_credit_order', data);
}

export async function updateCreditOrderApi(id: number, data: any) {
  return requestClient.put('/admin/biz_credit_order/' + id, data);
}

export async function deleteCreditOrderApi(id: number) {
  return requestClient.delete('/admin/biz_credit_order/' + id);
}
