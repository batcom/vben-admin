import { requestClient } from '#/api/request';

export async function getFieldpermissionListApi(params: any) {
  return requestClient.get('/field-permission', { params });
}

export async function getFieldpermissionDetailApi(id: number) {
  return requestClient.get('/field-permission/' + id);
}

export async function createFieldpermissionApi(data: any) {
  return requestClient.post('/field-permission', data);
}

export async function updateFieldpermissionApi(id: number, data: any) {
  return requestClient.put('/field-permission/' + id, data);
}

export async function deleteFieldpermissionApi(id: number) {
  return requestClient.delete('/field-permission/' + id);
}
