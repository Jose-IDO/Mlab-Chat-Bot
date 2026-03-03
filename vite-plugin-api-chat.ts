import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const SYSTEM_INSTRUCTION = `You are the friendly mLab (Mobile Applications Laboratory) assistant. mLab is a South African non-profit that helps youth and entrepreneurs with tech skills, start-up support, and digital solutions.

Keep every answer short (2–4 sentences). Be warm and helpful. Talk about mLab as a company: who we are, what we do (tech skills, CodeTribe, start-ups, tech solutions, locations like Tshwane, Polokwane, Northern Cape), and how people can get in touch or apply.

Only answer using the provided context. If the answer is not there, say you don't have that info and suggest contacting mLab directly. No markdown, no lists—plain flowing sentences only.`;
const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';
const KNOWLEDGE_DIR = 'knowledge';

let cachedKnowledge: string | null = null;

async function getKnowledgeBase(): Promise<string> {
  if (cachedKnowledge !== null) return cachedKnowledge;
  try {
    const dirPath = path.join(process.cwd(), KNOWLEDGE_DIR);
    const entries = await readdir(dirPath, { withFileTypes: true });
    const txtFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith('.txt'))
      .map((e) => e.name)
      .sort();
    const parts: string[] = [];
    for (const name of txtFiles) {
      const fullPath = path.join(dirPath, name);
      const text = await readFile(fullPath, 'utf-8');
      parts.push(text.trim());
    }
    cachedKnowledge = parts.filter(Boolean).join('\n\n');
  } catch {
    cachedKnowledge = '';
  }
  return cachedKnowledge;
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

const REFRESH_SCRAPE_EVERY = 3; // dev: run scraper every N refreshes

function runScraperScript(onDone?: () => void): void {
  const scriptPath = path.join(process.cwd(), 'scripts', 'scrape-knowledge.mjs');
  const child = spawn('node', [scriptPath], { stdio: 'inherit', shell: true });
  child.on('close', () => {
    cachedKnowledge = null;
    onDone?.();
  });
}

export function apiChatPlugin(): Plugin {
  let devRefreshCount = 0;

  return {
    name: 'api-chat',
    configureServer(server) {
      const isDev = process.env.NODE_ENV !== 'production';

      if (isDev) {
        console.log('[Scraper] Running once on dev server start...');
        runScraperScript(() => {
          console.log('[Scraper] Completed successfully (dev start).');
        });
      }

      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/visit' && req.method === 'GET' && isDev) {
          devRefreshCount += 1;
          const scraperTriggered = devRefreshCount % REFRESH_SCRAPE_EVERY === 0;
          console.log(`[Refresh] count = ${devRefreshCount}`);
          if (scraperTriggered) {
            console.log(`[Scraper] Being run again (every ${REFRESH_SCRAPE_EVERY}rd refresh).`);
            runScraperScript();
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ refreshCount: devRefreshCount, scraperTriggered }));
          return;
        }
        next();
      });

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

            const knowledge = await getKnowledgeBase();
            const systemContent = knowledge
              ? `${SYSTEM_INSTRUCTION}\n\nContext:\n${knowledge}`
              : SYSTEM_INSTRUCTION;

            const hfResponse = await fetch('https://router.huggingface.co/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemContent },
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
