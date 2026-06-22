import { requestClient } from '#/api/request';

export async function getTemplateListListApi(params: any) {
  return requestClient.get('/admin/biz_video_template', { params });
}

export async function getTemplateListDetailApi(id: number) {
  return requestClient.get('/admin/biz_video_template/' + id);
}

export async function createTemplateListApi(data: any) {
  return requestClient.post('/admin/biz_video_template', data);
}

export async function updateTemplateListApi(id: number, data: any) {
  return requestClient.put('/admin/biz_video_template/' + id, data);
}

export async function deleteTemplateListApi(id: number) {
  return requestClient.delete('/admin/biz_video_template/' + id);
}
