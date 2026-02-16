/**
 * Scraper logic for Cloud Functions. Fetches URLs, extracts plain text, returns combined string.
 * Writes to Firebase Storage when run from the trigger.
 */

const SCRAPE_URLS = [
  'https://mlab.co.za/',
  'https://codetribelanding.netlify.app/',
  'https://mlab.co.za/who-we-are/',
  'https://mlab.co.za/what-we-do/tech-skills',
  'https://mlab.co.za/what-we-do/tech-start-ups',
  'https://mlab.co.za/what-we-do/tech-solutions',
  'https://mlab.co.za/resources',
];

function getContentArea(html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  return html;
}

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
  raw = raw
    .replace(/<\/?(?:p|div|tr|li|h[1-6]|section|article|header|footer|nav|aside|blockquote|pre|br)\b[^>]*>/gi, '\n')
    .replace(/<\/?(?:ul|ol|table|tbody|thead)\b[^>]*>/gi, '\n');
  let text = raw.replace(/<[^>]+>/g, ' ');
  text = decodeEntities(text);
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
  console.log('[Scraper] Completed successfully.');
  return fullText;
}
