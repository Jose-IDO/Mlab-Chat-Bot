import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp } from 'firebase-admin/app';
import * as functions from 'firebase-functions';
import { runScraper } from './scraper.js';
import nodemailer from 'nodemailer';

initializeApp();

const ESCALATIONS_COLLECTION = 'escalations';
const FCM_TOPIC_ESCALATIONS = 'escalations';
const BREVO_API_V3_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send a transactional email via Brevo API v3 when a new escalation is created.
 * Configure: firebase functions:config:set brevo.api_key="xkeysib-..." brevo.sender_email="noreply@yoursite.com" brevo.sender_name="mLab Chatbot" brevo.to_email="support@yoursite.com"
 */
const DEFAULT_NOTIFICATION_EMAIL = 'joseph.f.idowu@gmail.com,ashleymanchidi@gmail.com';

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
<head><meta charset="utf-8"><title>New Escalation</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #073B4C; margin-top: 0; font-size: 24px;">👋 Hello! New Escalation from Chatbot</h2>
    <p style="color: #666; margin-bottom: 24px; font-size: 15px;">A user needs your assistance. Here are the details:</p>
    
    <div style="background: #f8f9fa; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px 0; color: #555;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #073B4C;">${fullName}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding: 8px 0; color: #555;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #073B4C;">${phone}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #555;"><strong>Category:</strong></td><td style="padding: 8px 0; color: #073B4C;">${category}</td></tr>
      </table>
    </div>
    
    <div style="margin: 24px 0;">
      <h3 style="color: #073B4C; font-size: 18px; margin-bottom: 12px;">💬 User's Message:</h3>
      <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-left: 4px solid #073B4C; padding: 20px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 6px; margin-top: 24px;">
      <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⏰ Action Required:</strong> Please respond to ${fullName} within 12–24 hours.</p>
    </div>
    
    <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">Sent by mLab Chatbot • Automated Escalation System</p>
  </div>
</body>
</html>`;

  const body = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail }],
    subject: `👋 New Escalation from ${fullName} - mLab Chatbot`,
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

    // Send email via SMTP (Gmail)
    try {
      await sendSMTPEscalationEmail(docId, data);
    } catch (err) {
      console.error('[Escalation] SMTP email failed:', err.message);
    }
  }
);

/**
 * Send escalation email via SMTP (Gmail) when a new escalation is created
 */
async function sendSMTPEscalationEmail(docId, data) {
  // Try multiple ways to get email config (Firebase config, environment variables, or defaults)
  const config = functions.config();
  const emailConfig = config.email || {};
  
  // Get email user (try Firebase config first, then env vars, then default)
  const emailUser = emailConfig.user || 
                    process.env.EMAIL_USER || 
                    process.env.GMAIL_USER ||
                    'dolamonyakallo07@gmail.com';
  
  // Get email password (try Firebase config first, then env vars)
  const emailPassword = emailConfig.password || 
                        process.env.EMAIL_PASSWORD || 
                        process.env.GMAIL_APP_PASSWORD ||
                        '';
  
  // Get support emails (try Firebase config first, then env vars, then default)
  const supportEmails = emailConfig.support_emails || 
                        process.env.SUPPORT_EMAIL ||
                        process.env.ESCALATION_EMAILS ||
                        'ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com';
  
  if (!emailPassword) {
    console.warn('[Escalation] Email password not configured. Set via Firebase Console → Functions → Configuration, or use firebase functions:config:set');
    console.warn('[Escalation] You can also set EMAIL_PASSWORD or GMAIL_APP_PASSWORD as environment variable');
    return;
  }

  const fullName = data.fullName ?? '';
  const email = data.email ?? '';
  const phone = data.phone ?? '';
  const message = data.message ?? '';
  const category = data.category ?? 'General';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Escalation</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #073B4C; margin-top: 0; font-size: 24px;">👋 Hello! New Escalation from Chatbot</h2>
    <p style="color: #666; margin-bottom: 24px; font-size: 15px;">A user needs your assistance. Here are the details:</p>
    
    <div style="background: #f8f9fa; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px 0; color: #555;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #073B4C;">${fullName}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding: 8px 0; color: #555;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #073B4C;">${phone}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #555;"><strong>Category:</strong></td><td style="padding: 8px 0; color: #073B4C;">${category}</td></tr>
      </table>
    </div>
    
    <div style="margin: 24px 0;">
      <h3 style="color: #073B4C; font-size: 18px; margin-bottom: 12px;">💬 User's Message:</h3>
      <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-left: 4px solid #073B4C; padding: 20px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 6px; margin-top: 24px;">
      <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⏰ Action Required:</strong> Please respond to ${fullName} within 12–24 hours.</p>
    </div>
    
    <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">Sent by mLab Chatbot • Automated Escalation System</p>
  </div>
</body>
</html>`;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword.replace(/\s/g, ''), // Remove spaces from app password
      },
    });

    const recipients = supportEmails.split(',').map(e => e.trim());
    const toAddresses = recipients.join(', ');

    const mailOptions = {
      from: `mLab Chatbot <${emailUser}>`,
      to: toAddresses,
      subject: `👋 New Escalation from ${fullName} - mLab Chatbot`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Escalation] SMTP email sent successfully:', {
      messageId: info.messageId,
      to: recipients,
    });
  } catch (error) {
    console.error('[Escalation] SMTP email error:', error);
    throw error;
  }
}

/**
 * Cloud Function to send emails via SMTP
 * Uses Gmail SMTP with credentials from environment variables
 * Configure: firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
 */
export const sendEmail = onCall(async (request) => {
  const config = functions.config();
  const emailConfig = config.email || {};
  
  // Get email credentials from config or environment
  const emailUser = emailConfig.user || process.env.EMAIL_USER || 'dolamonyakallo07@gmail.com';
  const emailPassword = emailConfig.password || process.env.EMAIL_PASSWORD || '';
  
  if (!emailPassword) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Email password not configured. Set email.password via firebase functions:config:set'
    );
  }

  const { to, subject, html, text, from, fromName } = request.data;

  if (!to || !subject) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: to and subject are required'
    );
  }

  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword.replace(/\s/g, ''), // Remove spaces from app password
      },
    });

    // Prepare recipients (handle both string and array)
    const recipients = Array.isArray(to) ? to : (typeof to === 'string' ? to.split(',').map(e => e.trim()) : [to]);
    const toAddresses = recipients.join(', '); // Nodemailer accepts comma-separated string or array

    // Send email
    const mailOptions = {
      from: from ? `${fromName || 'mLab Chatbot'} <${from}>` : `${fromName || 'mLab Chatbot'} <${emailUser}>`,
      to: toAddresses,
      subject: subject,
      html: html || text,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('[Email] Email sent successfully:', {
      messageId: info.messageId,
      to: recipients,
      subject,
    });

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to send email: ${error.message}`
    );
  }
});
