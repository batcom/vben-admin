import { requestClient } from '#/api/request';

export async function getTemplateUserListApi(params: any) {
  return requestClient.get('/admin/biz_user_preview_template', { params });
}

export async function getTemplateUserDetailApi(id: number) {
  return requestClient.get('/admin/biz_user_preview_template/' + id);
}

export async function createTemplateUserApi(data: any) {
  return requestClient.post('/admin/biz_user_preview_template', data);
}

export async function updateTemplateUserApi(id: number, data: any) {
  return requestClient.put('/admin/biz_user_preview_template/' + id, data);
}

export async function deleteTemplateUserApi(id: number) {
  return requestClient.delete('/admin/biz_user_preview_template/' + id);
}
