# Brevo email for new escalations

When a new escalation form is saved to Firestore, the Cloud Function sends an email via **Brevo API v3** to **amazonitemtwo@gmail.com**. The email includes the form details and: **Please respond within 12–24 hours.**

## 1. Set your Brevo API key (required)

Install Firebase CLI if needed (`npm install -g firebase-tools`), then from the **project root** run:

```bash
firebase functions:config:set brevo.api_key="YOUR_BREVO_API_KEY"
```

Use your Brevo API v3 key from [SMTP & API](https://app.brevo.com/settings/keys/api) → Generate a new API key.

**Notification recipient** is already set to **amazonitemtwo@gmail.com** in code. The sender defaults to the same address; verify it in Brevo as a sender so emails can be sent.

Optional (if you want a different sender):

```bash
firebase functions:config:set brevo.sender_email="noreply@yourdomain.com" brevo.sender_name="mLab Chatbot"
```

## 2. Redeploy functions

```bash
firebase deploy --only functions
```

## 3. Test

Submit an escalation from the chatbot. You should receive the email at **amazonitemtwo@gmail.com** and see logs in Firebase Console → Functions → Logs.
