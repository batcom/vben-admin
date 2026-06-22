import { requestClient } from '#/api/request';

export async function getMusicCategoryListApi(params: any) {
  return requestClient.get('/admin/biz_music_category', { params });
}

export async function getMusicCategoryDetailApi(id: number) {
  return requestClient.get('/admin/biz_music_category/' + id);
}

export async function createMusicCategoryApi(data: any) {
  return requestClient.post('/admin/biz_music_category', data);
}

export async function updateMusicCategoryApi(id: number, data: any) {
  return requestClient.put('/admin/biz_music_category/' + id, data);
}

export async function deleteMusicCategoryApi(id: number) {
  return requestClient.delete('/admin/biz_music_category/' + id);
}
