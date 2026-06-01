import { requestClient } from '#/api/request';

export namespace OrderApi {
  export interface OrderRecord {
    id: number;
    orderNo: string;
    userId: number | null;
    totalAmount: number;
    status: string;
    remark: string | null;
    createdAt: string;
    updatedAt: string;
    user?: { id: number; username: string; realName: string };
  }

  export interface OrderListResult {
    items: OrderRecord[];
    total: number;
    page: number;
    pageSize: number;
  }

  export interface CreateOrderParams {
    orderNo: string;
    userId?: number;
    totalAmount: number;
    status?: string;
    remark?: string;
  }

  export interface UpdateOrderParams {
    orderNo?: string;
    totalAmount?: number;
    status?: string;
    remark?: string;
  }
}

export async function getOrderListApi(params?: Record<string, any>) {
  return requestClient.get<OrderApi.OrderListResult>('/orders', { params });
}

export async function getOrderApi(id: number) {
  return requestClient.get<OrderApi.OrderRecord>(`/orders/${id}`);
}

export async function createOrderApi(data: OrderApi.CreateOrderParams) {
  return requestClient.post('/orders', data);
}

export async function updateOrderApi(id: number, data: OrderApi.UpdateOrderParams) {
  return requestClient.put(`/orders/${id}`, data);
}

export async function deleteOrderApi(id: number) {
  return requestClient.delete(`/orders/${id}`);
}
