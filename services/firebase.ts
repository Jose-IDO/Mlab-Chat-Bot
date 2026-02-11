import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, increment, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

const STATS_DOC = 'stats/visits';

/**
 * Call once per page visit. Increments the visit count in Firestore.
 * Used to trigger the knowledge-base scraper every 100 hits (via Cloud Function).
 */
export async function incrementVisitCount(): Promise<void> {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return;

  try {
    const db = getFirestore(firebaseApp);
    const ref = doc(db, STATS_DOC);
    await setDoc(ref, { count: increment(1) }, { merge: true });
  } catch (e) {
    console.warn('[visit count] Failed to increment:', e);
  }
}
