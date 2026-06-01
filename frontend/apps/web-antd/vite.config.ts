import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/auth': { changeOrigin: true, target: 'http://localhost:3002' },
          '/admin': { changeOrigin: true, target: 'http://localhost:3002' },
          '/menu': { changeOrigin: true, target: 'http://localhost:3002' },
          '/user': { changeOrigin: true, target: 'http://localhost:3002' },
          '/dashboard': { changeOrigin: true, target: 'http://localhost:3002' },
          '/generator': { changeOrigin: true, target: 'http://localhost:3002' },
          '/orders': { changeOrigin: true, target: 'http://localhost:3002' },
          '/access-control': { changeOrigin: true, target: 'http://localhost:3002' },
          '/public': { changeOrigin: true, target: 'http://localhost:3002' },
        },
      },
    },
  };
});
