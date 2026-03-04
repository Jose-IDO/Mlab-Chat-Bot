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
        'import.meta.env.HF_API_KEY': JSON.stringify(env.HF_API_KEY ?? env.VITE_HF_API_KEY ?? ''),
        'import.meta.env.VITE_HF_API_KEY': JSON.stringify(env.VITE_HF_API_KEY ?? env.HF_API_KEY ?? ''),
        'import.meta.env.HF_MODEL': JSON.stringify(env.HF_MODEL ?? env.VITE_HF_MODEL ?? ''),
        'import.meta.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY ?? env.VITE_GROQ_API_KEY ?? ''),
        'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY ?? env.GROQ_API_KEY ?? ''),
        'import.meta.env.VITE_EMAIL_USER': JSON.stringify(env.VITE_EMAIL_USER ?? env.EMAIL_USER ?? ''),
        'import.meta.env.VITE_EMAIL_PASSWORD': JSON.stringify(env.VITE_EMAIL_PASSWORD ?? env.EMAIL_PASSWORD ?? ''),
        'import.meta.env.VITE_SUPPORT_EMAIL': JSON.stringify(env.VITE_SUPPORT_EMAIL ?? env.SUPPORT_EMAIL ?? ''),
        'import.meta.env.VITE_EMAILJS_SERVICE_ID': JSON.stringify(env.VITE_EMAILJS_SERVICE_ID ?? ''),
        'import.meta.env.VITE_EMAILJS_TEMPLATE_ID': JSON.stringify(env.VITE_EMAILJS_TEMPLATE_ID ?? ''),
        'import.meta.env.VITE_EMAILJS_PUBLIC_KEY': JSON.stringify(env.VITE_EMAILJS_PUBLIC_KEY ?? ''),
        'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY ?? 'AIzaSyDBHWXmxYKfWOW0r8PDR6gFFLsC15X8Y7Y'),
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN ?? 'chatbot-53b57.firebaseapp.com'),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID ?? 'chatbot-53b57'),
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET ?? 'chatbot-53b57.firebasestorage.app'),
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '804155914558'),
        'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID ?? '1:804155914558:web:b54a44424315deb68e946f')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
