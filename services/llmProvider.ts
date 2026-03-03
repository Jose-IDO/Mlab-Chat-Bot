const SYSTEM_INSTRUCTION = `You are the friendly mLab (Mobile Applications Laboratory) assistant. mLab is a South African non-profit that helps youth and entrepreneurs with tech skills, start-up support, and digital solutions.

Keep every answer short (2–4 sentences). Be warm and helpful. Talk about mLab as a company: who we are, what we do (tech skills, CodeTribe, start-ups, tech solutions, locations like Tshwane, Polokwane, Northern Cape), and how people can get in touch or apply.

Only answer about mLab. If the question is off-topic, say: "I'm here to help with mLab programmes, training, and startup support. What would you like to know?" If you don't know, say: "I'm not sure about that—please contact mLab directly for the latest info." Use plain sentences only (no markdown, no bullet lists).`;
const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

function getApiKey(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.HF_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.HF_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.HUGGINGFACE_API_KEY) ||
    ''
  ).trim();
}

function getModel(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_MODEL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.HF_MODEL) ||
    (typeof process !== 'undefined' && process.env?.HF_MODEL) ||
    (typeof process !== 'undefined' && process.env?.HUGGINGFACE_MODEL) ||
    DEFAULT_MODEL
  ).trim() || DEFAULT_MODEL;
}

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

class LLMProvider {
  async generateResponse(prompt: string): Promise<{ text: string; latency: number }> {
    const start = Date.now();
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        text: 'API key not set. Add HF_API_KEY to a .env file in the project root and restart the dev server (Ctrl+C then npm run dev).',
        latency: Date.now() - start
      };
    }

    const model = getModel();
    try {
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
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
          max_tokens: 180,
          temperature: 0.3
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        let errorText = response.statusText;
        if (payload && typeof payload === 'object') {
          if ('error' in payload) {
            const err = (payload as any).error;
            errorText = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
          } else if ('message' in payload) {
            errorText = String((payload as any).message);
          }
        }
        const userMsg = response.status === 401 || response.status === 403
          ? 'API key invalid or missing. Check your .env file and restart the dev server.'
          : response.status === 429
            ? 'Rate limit exceeded. Please try again in a moment.'
            : response.status === 503
              ? 'Model is loading on Hugging Face. Please try again in a few seconds.'
              : `Error connecting to AI service. Please try again. (${errorText.slice(0, 80)}${errorText.length > 80 ? '...' : ''})`;
        return { text: userMsg, latency: Date.now() - start };
      }

      const text = (payload && typeof payload === 'object' && 'choices' in payload && Array.isArray((payload as any).choices))
        ? ((payload as any).choices[0]?.message?.content || '').trim()
        : extractText(payload).trim();
      return {
        text: text || "I'm sorry, I couldn't generate a response. Would you like to speak to an agent?",
        latency: Date.now() - start
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('LLM Error:', err);
      return {
        text: `Error connecting to AI service. Please try again. (${msg.slice(0, 80)}${msg.length > 80 ? '...' : ''})`,
        latency: Date.now() - start
      };
    }
  }
}

export const llmProvider = new LLMProvider();
