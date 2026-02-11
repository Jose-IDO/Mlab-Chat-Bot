# Firebase setup (visit count + scraper)

The app counts each page visit in Firestore and runs a knowledge-base scraper when the count reaches 100, 200, 300, etc. (and once on first run).

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. Enable **Firestore Database** (Create database → Start in test mode for dev; tighten rules for production).
3. Enable **Storage** (Get started → Start in test mode for dev).
4. In **Project Settings** (gear) → **General** → **Your apps**, add a **Web** app and copy the config object.

## 2. Add config to the app

Copy `.env.example` to `.env` and set the Firebase variables (prefix with `VITE_` so they are available in the client):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 3. Firestore structure and rules

The client writes to a single document: **Collection** `stats`, **Document** `visits`.

Fields (the Cloud Function maintains `lastScrapedAtCount` and `initialScrapeDone`):

- `count` (number) – incremented by the client on each page load
- `lastScrapedAtCount` (number) – set by the Cloud Function after each scrape
- `initialScrapeDone` (boolean) – set to `true` after the first scrape

**Firestore rules** (adjust for production): allow read/write for the visits document for testing; restrict in production (e.g. allow only increment of `count` from client, and let the Cloud Function update the rest).

Example (test mode – **tighten for production**):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stats/visits {
      allow read, write: if true;
    }
  }
}
```

## 4. Deploy Cloud Functions (scraper trigger)

The scraper runs in a Firebase Cloud Function when the visit count hits 100, 200, 300, … and once on the first run. It fetches the configured URLs, builds one plain-text knowledge file, and saves it to **Storage** at `knowledge/scraped_knowledge.txt`.

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Log in: `firebase login`
3. From the project root: `firebase init` → choose **Functions** and **Use an existing project** (your Firebase project).
4. Replace the generated `functions/` code with this repo’s `functions/` (already set up).
5. Install function dependencies:

   ```bash
   cd functions
   npm install firebase-functions firebase-admin
   ```

6. Deploy:

   ```bash
   firebase deploy --only functions
   ```

After deployment, each time a user loads the app (e.g. the GitHub Pages URL), the client increments `stats/visits.count`. When the count reaches 100, 200, 300, etc., or when the first visit is recorded, the function runs and updates the knowledge file in Storage.

## 5. Run the scraper locally (optional)

To refresh the knowledge base without waiting for 100 hits:

```bash
npm run scrape
```

This writes to `knowledge/scraped_knowledge.txt` in the repo. The chat API (Vite plugin) loads all `.txt` files from `knowledge/`, so this file is included automatically.

## 6. GitHub Pages and visit counting

The **main URL** is the published app (e.g. `https://<username>.github.io/Mlab-Chat-Bot/`). Each time someone opens that URL, the app loads and calls `incrementVisitCount()` in Firebase. GitHub Pages only serves static files; it does not run server-side code. Counting is done **client-side** via the Firebase SDK, so GitHub does not block it.

The scraper itself runs in **Firebase Cloud Functions** (triggered by Firestore), not on GitHub. The generated knowledge file is stored in **Firebase Storage**. To use it in production you would typically either:

- Run a backend (e.g. Vercel/Netlify serverless) that reads the file from Storage and uses it as chat context, or
- Periodically run `npm run scrape` and commit `knowledge/scraped_knowledge.txt` so the built app’s chat backend (if you add one for production) can serve it.
