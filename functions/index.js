import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp } from 'firebase-admin/app';
import * as functions from 'firebase-functions';
import { runScraper } from './scraper.js';

initializeApp();

const ESCALATIONS_COLLECTION = 'escalations';
const FCM_TOPIC_ESCALATIONS = 'escalations';
const BREVO_API_V3_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send a transactional email via Brevo API v3 when a new escalation is created.
 * Configure: firebase functions:config:set brevo.api_key="xkeysib-..." brevo.sender_email="noreply@yoursite.com" brevo.sender_name="mLab Chatbot" brevo.to_email="support@yoursite.com"
 */
const DEFAULT_NOTIFICATION_EMAIL = 'amazonitemtwo@gmail.com';

async function sendBrevoEscalationEmail(docId, data) {
  const config = functions.config();
  const brevo = config.brevo || {};
  const apiKey = brevo.api_key;
  const senderEmail = brevo.sender_email || DEFAULT_NOTIFICATION_EMAIL;
  const senderName = brevo.sender_name || 'mLab Chatbot';
  const toEmail = brevo.to_email || DEFAULT_NOTIFICATION_EMAIL;

  if (!apiKey || !toEmail) {
    console.warn('[Escalation] Brevo not configured. Set brevo.api_key and brevo.to_email via firebase functions:config:set');
    return;
  }

  const fullName = data.fullName ?? '';
  const email = data.email ?? '';
  const phone = data.phone ?? '';
  const message = data.message ?? '';
  const category = data.category ?? 'Chatbot escalation';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New escalation</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #073B4C;">New escalation from chatbot</h2>
  <p><strong>Document ID:</strong> ${docId}</p>
  <table style="border-collapse: collapse; width: 100%;">
    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${fullName}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone || '—'}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Category</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${category}</td></tr>
  </table>
  <p><strong>Message:</strong></p>
  <p style="background: #f5f5f5; padding: 12px; border-radius: 6px;">${message.replace(/\n/g, '<br>')}</p>
  <p style="margin-top: 24px; padding: 12px; background: #fff3cd; border-radius: 6px;"><strong>Please respond within 12–24 hours.</strong></p>
  <p style="color: #666; font-size: 12px;">Sent by mLab Chatbot • Firestore escalation</p>
</body>
</html>`;

  const body = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject: `New escalation: ${fullName}`,
    htmlContent,
  };

  const res = await fetch(BREVO_API_V3_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Brevo API ${res.status}: ${errText}`);
  }
  console.log('[Escalation] Brevo email sent to', toEmail);
}

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

    try {
      await sendBrevoEscalationEmail(docId, data);
    } catch (err) {
      console.error('[Escalation] Brevo email failed:', err.message);
    }
  }
);
