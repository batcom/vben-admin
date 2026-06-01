import { requestClient } from '#/api/request';

export interface DashboardStats {
  userCount: number;
  orderCount: number;
  totalAmount: number;
  pendingOrders: number;
  recentOrders: {
    id: number;
    orderNo: string;
    totalAmount: number;
    status: string;
    remark: string | null;
    createdAt: string;
    user: { realName: string };
  }[];
}

export async function getDashboardStatsApi() {
  return requestClient.get<DashboardStats>('/dashboard/stats');
}
