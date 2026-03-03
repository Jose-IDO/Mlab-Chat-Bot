import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiChatPlugin } from './vite-plugin-api-chat';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Use '/' for Firebase Hosting (and most hosts). Use '/Mlab-Chat-Bot/' only for GitHub Pages.
      base: '/',
      server: {
        port: 5173,
        host: true,
        strictPort: true,
      },
      plugins: [react(), apiChatPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(''),
        'process.env.GEMINI_API_KEY': JSON.stringify(''),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? env.VITE_GEMINI_API_KEY ?? ''),
        'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? env.VITE_GEMINI_API_KEY ?? ''),
        'import.meta.env.HF_API_KEY': JSON.stringify(env.HF_API_KEY ?? ''),
        'import.meta.env.HF_MODEL': JSON.stringify(env.HF_MODEL ?? '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
