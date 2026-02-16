/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HF_API_KEY?: string;
  readonly HF_API_KEY?: string;
  readonly VITE_HF_MODEL?: string;
  readonly HF_MODEL?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
