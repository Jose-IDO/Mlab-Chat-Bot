/**
 * Test Gemini API key from .env. Run: node scripts/test-gemini-key.mjs
 * Only prints valid/invalid and error message; does not echo the key.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

function loadEnv() {
  try {
    const content = readFileSync(envPath, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
    return env;
  } catch (e) {
    return {};
  }
}

const env = loadEnv();
const key = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';

if (!key) {
  console.log('Gemini API key: not set (no GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env)');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
try {
  const res = await fetch(url);
  if (res.ok) {
    console.log('Gemini API key: valid');
    process.exit(0);
  }
  const body = await res.text();
  let msg = `HTTP ${res.status}`;
  try {
    const j = JSON.parse(body);
    if (j.error?.message) msg = j.error.message;
  } catch (_) {}
  console.log('Gemini API key: invalid -', msg);
  process.exit(1);
} catch (err) {
  console.log('Gemini API key: error -', err.message);
  process.exit(1);
}
