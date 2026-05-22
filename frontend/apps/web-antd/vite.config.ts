import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // NestJS backend
            target: 'http://localhost:3001',
            ws: true,
          },
        },
      },
    },
  };
});
