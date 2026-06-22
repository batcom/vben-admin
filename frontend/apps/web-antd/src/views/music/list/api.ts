import { requestClient } from '#/api/request';

export async function getMusicListListApi(params: any) {
  return requestClient.get('/admin/biz_user_music', { params });
}

export async function getMusicListDetailApi(id: number) {
  return requestClient.get('/admin/biz_user_music/' + id);
}

export async function createMusicListApi(data: any) {
  return requestClient.post('/admin/biz_user_music', data);
}

export async function updateMusicListApi(id: number, data: any) {
  return requestClient.put('/admin/biz_user_music/' + id, data);
}

export async function deleteMusicListApi(id: number) {
  return requestClient.delete('/admin/biz_user_music/' + id);
}
