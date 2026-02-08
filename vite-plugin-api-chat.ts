import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

const SYSTEM_INSTRUCTION = `You are a helpful mLab AI Support assistant. mLab is a South African innovation hub and tech training organization.

IMPORTANT: Only provide factual information about mLab. If you don't have specific information about mLab programmes, locations, applications, or events, say "I don't have that specific information. Please visit the mLab website or contact their support team directly for accurate details."

Do not make up or guess information about:
- Specific program dates, deadlines, or schedules
- Application requirements or processes
- Contact information or locations
- Pricing or fees

Keep responses concise and friendly. If you're unsure, always recommend contacting mLab directly.`;
const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

function formatPrompt(prompt: string): string {
  return `${SYSTEM_INSTRUCTION}\n\nUser: ${prompt}\nAssistant:`;
}

function extractText(payload: unknown): string {
  if (!payload) return '';
  if (Array.isArray(payload)) {
    const first = payload[0] as { generated_text?: string } | undefined;
    return first?.generated_text ?? '';
  }
  if (typeof payload === 'object') {
    const obj = payload as { generated_text?: string; text?: string; error?: string };
    return obj.generated_text || obj.text || '';
  }
  return '';
}

export function apiChatPlugin(): Plugin {
  return {
    name: 'api-chat',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') {
          next();
          return;
        }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { prompt } = JSON.parse(body || '{}');
            if (!prompt || typeof prompt !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: 'Missing prompt' }));
              return;
            }
            const env = loadEnv('development', process.cwd(), '');
            const apiKey = (env.HF_API_KEY || env.VITE_HF_API_KEY || env.HUGGINGFACE_API_KEY || '').trim();
            const model = (env.HF_MODEL || env.VITE_HF_MODEL || env.HUGGINGFACE_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
            if (process.env.NODE_ENV !== 'production') {
              console.log('[api/chat] Using HF model:', model);
              console.log('[api/chat] Using API key ending in:', apiKey ? `...${apiKey.slice(-4)}` : '(none)');
            }
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: 'API key not set. Add HF_API_KEY to .env and restart.' }));
              return;
            }

            const hfResponse = await fetch('https://router.huggingface.co/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: SYSTEM_INSTRUCTION },
                  { role: 'user', content: prompt }
                ],
                max_tokens: 512,
                temperature: 0.1
              })
            });

            const payload = await hfResponse.json().catch(() => null);
            if (!hfResponse.ok) {
              let errorText = hfResponse.statusText;
              if (payload && typeof payload === 'object') {
                if ('error' in payload) {
                  const err = (payload as any).error;
                  errorText = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
                } else if ('message' in payload) {
                  errorText = String((payload as any).message);
                }
              }
              const text = hfResponse.status === 401 || hfResponse.status === 403
                ? 'API key is invalid or inactive. Get a valid Hugging Face token and add it to the .env file as HF_API_KEY=your_key, then restart the dev server.'
                : hfResponse.status === 429
                  ? 'Rate limit exceeded. Please try again in a moment.'
                  : hfResponse.status === 503
                    ? 'Model is loading on Hugging Face. Please try again in a few seconds.'
                    : `Error: ${errorText}`;
              res.statusCode = hfResponse.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text }));
              return;
            }

            const text = (payload && typeof payload === 'object' && 'choices' in payload && Array.isArray((payload as any).choices))
              ? ((payload as any).choices[0]?.message?.content || '').trim()
              : extractText(payload).trim();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: text || "I'm sorry, I couldn't generate a response.", latency: 0 }));
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[api/chat]', err);
            const text = `Error: ${message}`;
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text }));
          }
        });
      });
    }
  };
}
