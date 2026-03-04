// firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getFirestore, increment, doc, setDoc, type Firestore } from "firebase/firestore";
import { getFunctions, httpsCallable, type Functions } from "firebase/functions";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBHWXmxYKfWOW0r8PDR6gFFLsC15X8Y7Y",
  authDomain: "chatbot-53b57.firebaseapp.com",
  projectId: "chatbot-53b57",
  storageBucket: "chatbot-53b57.firebasestorage.app",
  messagingSenderId: "804155914558",
  appId: "1:804155914558:web:b54a44424315deb68e946f",
  measurementId: "G-ZH73RTPGFM"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
    // Initialize Analytics (only in browser environment)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('[Analytics] Failed to initialize:', e);
      }
    }
    // Initialize Firestore
    db = getFirestore(app);
    // Initialize Cloud Functions
    functions = getFunctions(app);
  }
  return app;
}

export function getFirestoreInstance(): Firestore | null {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
  }
  return db;
}

export function getAnalyticsInstance(): Analytics | null {
  return analytics;
}

export function getFunctionsInstance(): Functions | null {
  return functions;
}

const STATS_DOC = 'stats/visits';

/**
 * Call once per page visit. Increments the visit count in Firestore.
 * Used to trigger the knowledge-base scraper every 100 hits (via Cloud Function).
 */
export async function incrementVisitCount(): Promise<void> {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp || !db) return;

  try {
    const ref = doc(db, STATS_DOC);
    await setDoc(ref, { count: increment(1) }, { merge: true });
  } catch (e) {
    console.warn('[visit count] Failed to increment:', e);
  }
}

/**
 * Email sending interface
 */
export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  fromName?: string;
}

/**
 * Send email via Firebase Cloud Function
 * This calls a Cloud Function that handles email sending securely
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const functionsInstance = getFunctionsInstance();
    if (!functionsInstance) {
      throw new Error('Firebase Functions not initialized');
    }

    // Call the Cloud Function for sending emails
    const sendEmailFunction = httpsCallable(functionsInstance, 'sendEmail');
    const result = await sendEmailFunction(emailData);
    
    return {
      success: true,
      message: result.data as string || 'Email sent successfully'
    };
  } catch (error: any) {
    console.error('[Email] Failed to send email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Send escalation email to support team
 * Uses the support email addresses from environment variables
 */
export async function sendEscalationEmail(data: {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  category?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const supportEmails = import.meta.env.VITE_SUPPORT_EMAIL || 
    'ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com';
  
  const emailList = Array.isArray(supportEmails) 
    ? supportEmails 
    : supportEmails.split(',').map((e: string) => e.trim());

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
        <tr><td style="padding: 8px 0; color: #555;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #073B4C;">${data.fullName}</td></tr>
        <tr><td style="padding: 8px 0; color: #555;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #007bff; text-decoration: none;">${data.email}</a></td></tr>
        ${data.phone ? `<tr><td style="padding: 8px 0; color: #555;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #073B4C;">${data.phone}</td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #555;"><strong>Category:</strong></td><td style="padding: 8px 0; color: #073B4C;">${data.category || 'General'}</td></tr>
      </table>
    </div>
    
    <div style="margin: 24px 0;">
      <h3 style="color: #073B4C; font-size: 18px; margin-bottom: 12px;">💬 User's Message:</h3>
      <div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-left: 4px solid #073B4C; padding: 20px; border-radius: 6px; font-size: 15px; line-height: 1.6; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        ${(data.message || '').replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 6px; margin-top: 24px;">
      <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⏰ Action Required:</strong> Please respond to ${data.fullName} within 12–24 hours.</p>
    </div>
    
    <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">Sent by mLab Chatbot • Automated Escalation System</p>
  </div>
</body>
</html>`;

  return await sendEmail({
    to: emailList,
    subject: `👋 New Escalation from ${data.fullName} - mLab Chatbot`,
    html: htmlContent,
    from: import.meta.env.VITE_EMAIL_USER || 'dolamonyakallo07@gmail.com',
    fromName: 'mLab Chatbot'
  });
}
