import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const configuredApi = environment.VITE_API_BASE_URL || '';
  const apiTarget = /^https?:\/\//.test(configuredApi)
    ? new URL(configuredApi).origin
    : 'http://localhost:4000';
  const proxy = { '/api': { target: apiTarget, changeOrigin: true } };
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy,
    },
    preview: { port: 4173, proxy },
  };
});
