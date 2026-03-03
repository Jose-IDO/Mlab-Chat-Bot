const SYSTEM_INSTRUCTION = `You are the friendly mLab (Mobile Applications Laboratory) assistant. mLab is a South African non-profit that helps youth and entrepreneurs with tech skills, start-up support, and digital solutions.

Keep every answer short (2–4 sentences). Be warm and helpful. Talk about mLab as a company: who we are, what we do (tech skills, CodeTribe, start-ups, tech solutions, locations like Tshwane, Polokwane, Northern Cape), and how people can get in touch or apply.

Only answer about mLab. If the question is off-topic, say: "I'm here to help with mLab programmes, training, and startup support. What would you like to know?" If you don't know, say: "I'm not sure about that—please contact mLab directly for the latest info." Use plain sentences only (no markdown, no bullet lists).`;

const DEFAULT_HF_MODEL = 'Qwen/Qwen2.5-7B-Instruct';
const GEMINI_MODEL = 'gemini-1.5-flash';
const MAX_TOKENS = 180;
const TEMPERATURE = 0.3;

function getHfApiKey(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.HF_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.HF_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.HUGGINGFACE_API_KEY) ||
    ''
  ).trim();
}

function getGeminiApiKey(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    ''
  ).trim();
}

function getHfModel(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HF_MODEL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.HF_MODEL) ||
    (typeof process !== 'undefined' && process.env?.HF_MODEL) ||
    (typeof process !== 'undefined' && process.env?.HUGGINGFACE_MODEL) ||
    DEFAULT_HF_MODEL
  ).trim() || DEFAULT_HF_MODEL;
}

/** Make response friendly: plain text, no markdown, single line or clean short paragraphs. */
function formatFriendly(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[\s\-*•]+/gm, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
}

function extractHfText(payload: unknown): string {
  if (!payload) return '';
  if (Array.isArray(payload)) {
    const first = payload[0] as { generated_text?: string } | undefined;
    return first?.generated_text ?? '';
  }
  if (typeof payload === 'object') {
    const obj = payload as { generated_text?: string; text?: string };
    return obj.generated_text || obj.text || '';
  }
  return '';
}

async function queryHuggingFace(prompt: string): Promise<{ text: string }> {
  const apiKey = getHfApiKey();
  if (!apiKey) throw new Error('Hugging Face API key not set');
  const model = getHfModel();
  const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE
    })
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const err = payload?.error?.message ?? payload?.message ?? res.statusText;
    throw new Error(String(err).slice(0, 120));
  }
  const raw =
    payload?.choices?.[0]?.message?.content ?? extractHfText(payload) ?? '';
  const text = formatFriendly(raw).trim();
  if (!text) throw new Error('Empty response from Hugging Face');
  return { text };
}

async function queryGemini(prompt: string): Promise<{ text: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('Gemini API key not set');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nUser: ${prompt}\nAssistant:` }]
        }
      ],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: TEMPERATURE
      }
    })
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const err = payload?.error?.message ?? res.statusText;
    throw new Error(String(err).slice(0, 120));
  }
  const part = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  const raw = typeof part === 'string' ? part : '';
  const text = formatFriendly(raw).trim();
  if (!text) throw new Error('Empty response from Gemini');
  return { text };
}

/**
 * Race: call both Hugging Face and Gemini; return the first successful response.
 * If both fail, return a friendly error message.
 */
class LLMProvider {
  async generateResponse(prompt: string): Promise<{ text: string; latency: number }> {
    const start = Date.now();
    const hfKey = getHfApiKey();
    const geminiKey = getGeminiApiKey();

    if (!hfKey && !geminiKey) {
      return {
        text: 'API keys not set. Add HF_API_KEY and/or GEMINI_API_KEY in .env and restart.',
        latency: Date.now() - start
      };
    }

    const promises: Promise<{ text: string }>[] = [];
    if (hfKey) promises.push(queryHuggingFace(prompt));
    if (geminiKey) promises.push(queryGemini(prompt));

    if (promises.length === 0) {
      return {
        text: 'No API keys configured. Please add HF_API_KEY or GEMINI_API_KEY to .env',
        latency: Date.now() - start
      };
    }

    try {
      const winner = await Promise.race(
        promises.map((p) =>
          p.then((r) => ({ ok: true as const, text: r.text })).catch((e) => ({ ok: false as const, err: e }))
        )
      );
      if (winner.ok) {
        const text =
          winner.text ||
          "I'm sorry, I couldn't generate a response. Would you like to speak to an agent?";
        return { text: formatFriendly(text), latency: Date.now() - start };
      }
      if (promises.length === 2) {
        const [a, b] = await Promise.allSettled(promises);
        const first = a.status === 'fulfilled' ? a.value : b.status === 'fulfilled' ? b.value : null;
        if (first?.text) return { text: formatFriendly(first.text), latency: Date.now() - start };
      }
      const err = winner.ok ? null : (winner as { err: Error }).err;
      const msg = err instanceof Error ? err.message : String(err);
      return {
        text: `Sorry, I couldn't reach the AI right now. Please try again in a moment. (${msg.slice(0, 60)}${msg.length > 60 ? '…' : ''})`,
        latency: Date.now() - start
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        text: `Sorry, something went wrong. Please try again. (${msg.slice(0, 60)}${msg.length > 60 ? '…' : ''})`,
        latency: Date.now() - start
      };
    }
  }
}

export const llmProvider = new LLMProvider();
