// 从 vxe-table 示例页用的纯前端 mock API
const mockData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `名称 ${i + 1}`,
  category: ['电子产品', '服装', '食品', '办公用品'][i % 4],
  color: ['红色', '蓝色', '绿色', '黑色', '白色'][i % 5],
  price: (Math.random() * 1000 + 10).toFixed(2),
  date: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

export namespace DemoTableApi {
  export interface PageFetchParams {
    [key: string]: any;
    page: number;
    pageSize: number;
  }
}

export async function getExampleTableApi(params: DemoTableApi.PageFetchParams) {
  const { page = 1, pageSize = 10 } = params;
  const start = (page - 1) * pageSize;
  const list = mockData.slice(start, start + pageSize);
  return { items: list, total: mockData.length };
}
