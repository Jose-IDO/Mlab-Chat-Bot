import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp } from 'firebase-admin/app';
import { runScraper } from './scraper.js';

initializeApp();

const ESCALATIONS_COLLECTION = 'escalations';
const FCM_TOPIC_ESCALATIONS = 'escalations';

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

/**
 * When a new escalation form is written to Firestore, log it and send a notification
 * (FCM topic "escalations") so admin clients can show a push. Optional: add email/Slack here.
 */
export const onEscalationCreated = onDocumentCreated(
  { document: `${ESCALATIONS_COLLECTION}/{docId}` },
  async (event) => {
    const snap = event.data;
    if (!snap?.exists) return;

    const docId = event.params.docId;
    const data = snap.data();
    const fullName = data.fullName ?? '';
    const email = data.email ?? '';
    const message = (data.message ?? '').slice(0, 100);

    console.log('[Escalation] New submission:', { docId, fullName, email, message });

    try {
      await getMessaging().send({
        topic: FCM_TOPIC_ESCALATIONS,
        notification: {
          title: 'New escalation',
          body: `${fullName}: ${message}${message.length >= 100 ? '...' : ''}`,
        },
        data: {
          type: 'escalation',
          docId,
          email,
        },
      });
      console.log('[Escalation] FCM notification sent to topic:', FCM_TOPIC_ESCALATIONS);
    } catch (err) {
      console.warn('[Escalation] FCM send failed (subscribe admin clients to topic "escalations" for push):', err.message);
    }
  }
);
