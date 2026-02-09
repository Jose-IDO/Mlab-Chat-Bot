import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiChatPlugin } from './vite-plugin-api-chat';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isDev = mode === 'development';
    return {
      base: isDev ? '/' : '/Mlab-Chat-Bot/',
      server: {
        port: 5173,
        host: true,
        strictPort: true,
      },
      plugins: [react(), apiChatPlugin()],
      // Never expose API key to client bundle (chat uses server /api/chat only)
      define: {
        'process.env.API_KEY': JSON.stringify(''),
        'process.env.GEMINI_API_KEY': JSON.stringify(''),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify('')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
