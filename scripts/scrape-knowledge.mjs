/**
 * Knowledge-base scraper. Fetches HTML from configured URLs, extracts plain text,
 * and writes one combined .txt file for the AI context.
 * Run: node scripts/scrape-knowledge.mjs
 * Also used by Firebase Cloud Function (runScraper).
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__dirname, '..', 'knowledge');
const OUTPUT_FILE = join(KNOWLEDGE_DIR, 'scraped_knowledge.txt');

const SCRAPE_URLS = [
  'https://mlab.co.za/',
  'https://codetribelanding.netlify.app/',
  'https://mlab.co.za/who-we-are/',
  'https://mlab.co.za/what-we-do/tech-skills',
  'https://mlab.co.za/what-we-do/tech-start-ups',
  'https://mlab.co.za/what-we-do/tech-solutions',
  'https://mlab.co.za/resources',
];

/**
 * Extract main content if present to reduce repeated nav/footer; otherwise use full body.
 */
function getContentArea(html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  return html;
}

/**
 * Decode common HTML entities including numeric ones.
 */
function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  let raw = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '');
  raw = getContentArea(raw);
  // Preserve line breaks: block elements become newlines so we keep all text and structure
  raw = raw
    .replace(/<\/?(?:p|div|tr|li|h[1-6]|section|article|header|footer|nav|aside|blockquote|pre|br)\b[^>]*>/gi, '\n')
    .replace(/<\/?(?:ul|ol|table|tbody|thead)\b[^>]*>/gi, '\n');
  // Remove remaining tags (inline only now)
  let text = raw.replace(/<[^>]+>/g, ' ');
  text = decodeEntities(text);
  // Normalize whitespace: collapse spaces, keep newlines, max 2 newlines in a row
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
  return text;
}

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mlab-Chat-Bot-Scraper/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

export async function runScraper() {
  console.log('[Scraper] Running...');
  const sections = [];

  for (const url of SCRAPE_URLS) {
    try {
      const html = await fetchUrl(url);
      const text = htmlToPlainText(html);
      sections.push(`--- Source: ${url} ---\n\n${text}\n`);
    } catch (err) {
      console.warn(`[Scraper] Failed to fetch ${url}:`, err.message);
      sections.push(`--- Source: ${url} (fetch failed: ${err.message}) ---\n\n`);
    }
  }

  const fullText = sections.join('\n');
  await mkdir(KNOWLEDGE_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, fullText, 'utf-8');
  console.log('[Scraper] Completed successfully. Written to', OUTPUT_FILE);
  return fullText;
}

async function main() {
  try {
    await runScraper();
  } catch (err) {
    console.error('[Scraper] Failed:', err);
    process.exit(1);
  }
}

main();
