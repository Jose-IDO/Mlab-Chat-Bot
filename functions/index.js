import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { runScraper } from './scraper.js';

initializeApp();

const STATS_COLLECTION = 'stats';
const STATS_DOC = 'visits';
const KNOWLEDGE_STORAGE_PATH = 'knowledge/scraped_knowledge.txt';

export const onVisitCountUpdate = onDocumentUpdated(
  { document: `${STATS_COLLECTION}/${STATS_DOC}` },
  async (event) => {
    const snap = event.data?.after;
    if (!snap?.exists) return;

    const data = snap.data();
    const count = Number(data.count ?? 0);
    const lastScrapedAtCount = Number(data.lastScrapedAtCount ?? 0);
    const initialScrapeDone = Boolean(data.initialScrapeDone);

    const shouldRunInitial = !initialScrapeDone;
    const shouldRunEveryHundred =
      count >= 100 && count > lastScrapedAtCount && count % 100 === 0;

    if (!shouldRunInitial && !shouldRunEveryHundred) return;

    try {
      console.log('[Scraper] Running (trigger: ' + (shouldRunInitial ? 'initial' : 'every 100 hits') + ')...');
      const fullText = await runScraper();

      const bucket = getStorage().bucket();
      const file = bucket.file(KNOWLEDGE_STORAGE_PATH);
      await file.save(fullText, {
        contentType: 'text/plain',
        metadata: { cacheControl: 'public, max-age=3600' },
      });

      const db = getFirestore();
      const updates = {
        lastScrapedAtCount: count,
        ...(shouldRunInitial ? { initialScrapeDone: true } : {}),
      };
      await db.collection(STATS_COLLECTION).doc(STATS_DOC).update(updates);

      console.log('[Scraper] Completed successfully. Knowledge base updated.');
    } catch (err) {
      console.error('[Scraper] Failed:', err);
    }
  }
);
