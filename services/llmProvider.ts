const SYSTEM_INSTRUCTION = `You are the official virtual assistant for mLab (Mobile Applications Laboratory NPC), a South African non-profit organisation.

Your job is to help visitors understand mLab programmes, eligibility, application processes, and partnerships.

You must:

* Provide clear and accurate information about mLab services
* Help users determine if they qualify for programmes
* Direct users to apply when appropriate
* Keep answers concise and easy to understand

You must NOT:

* Answer questions unrelated to mLab
* Provide legal, financial, or medical advice
* Engage in politics, religion, or controversial debates
* Invent programme details

Do not mention any internal notes, context, or sources in your responses.

If a question is unrelated to mLab, politely respond:
"I'm here to help with information about mLab programmes, training, and startup support. Please ask a question related to mLab."

If you do not know the answer, say:
"I'm not certain about that. Please contact mLab directly for confirmation."

Tone:
Professional, friendly, and supportive to youth and entrepreneurs.`;
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
          max_tokens: 512,
          temperature: 0.1
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
