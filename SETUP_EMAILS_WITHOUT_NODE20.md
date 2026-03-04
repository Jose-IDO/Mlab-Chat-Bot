# Setup Email Function Without Node.js 20

Since you have Node.js v18.15.0 and Firebase CLI requires Node.js 20+, here are your options:

## Option 1: Upgrade Node.js (Recommended)

### Using Node Version Manager (nvm) - Windows:
1. Download nvm-windows from: https://github.com/coreybutler/nvm-windows/releases
2. Install it
3. Open a new terminal and run:
   ```bash
   nvm install 20
   nvm use 20
   ```
4. Verify: `node --version` (should show v20.x.x)
5. Then run the Firebase commands

### Or Download Node.js 20+ Directly:
1. Go to https://nodejs.org/
2. Download Node.js 20 LTS or 22 LTS
3. Install it
4. Restart your terminal
5. Verify: `node --version`

## Option 2: Set Environment Variables via Firebase Console

Since you can't use Firebase CLI right now, you can set environment variables directly in Firebase Console:

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chatbot-53b57` or `mlab-chat-bot`
3. Navigate to: **Functions** → **Configuration**
4. Click **"Add variable"** and add these:

   **Variable Name:** `EMAIL_USER`  
   **Value:** `dolamonyakallo07@gmail.com`

   **Variable Name:** `EMAIL_PASSWORD`  
   **Value:** `igbhadmjedcrfqwq` (your Gmail app password, no spaces)

   **Variable Name:** `SUPPORT_EMAIL`  
   **Value:** `ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com`

5. Save the configuration
6. Redeploy your functions (you'll still need Node 20+ for deployment)

## Option 3: Use Firebase Console to Deploy (Alternative)

If you have access to Firebase Console, you might be able to:
1. Use Firebase Console's built-in editor (if available)
2. Or use GitHub Actions/CI to deploy (requires Node 20+ in CI)

## Option 4: Temporary Workaround - Test Locally First

The email function will work once deployed, but you can test the email sending logic locally:

1. Create a test script in `functions/test-email.js`:
   ```javascript
   const nodemailer = require('nodemailer');
   
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'dolamonyakallo07@gmail.com',
       pass: 'igbhadmjedcrfqwq', // Remove spaces
     },
   });
   
   transporter.sendMail({
     from: 'mLab Chatbot <dolamonyakallo07@gmail.com>',
     to: 'ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com',
     subject: 'Test Email',
     html: '<h1>Test</h1><p>This is a test email.</p>',
   }).then(info => {
     console.log('Email sent:', info.messageId);
   }).catch(err => {
     console.error('Error:', err);
   });
   ```

2. Run it: `node functions/test-email.js`

## Current Status

✅ **Code is ready** - The email function is implemented and will work once deployed  
❌ **Deployment blocked** - Need Node.js 20+ to use Firebase CLI  
✅ **Environment variables** - Code will read from Firebase config or env vars

## Quick Fix: Upgrade Node.js

The fastest solution is to upgrade Node.js to version 20 or 22. Once you do that, you can run:

```bash
cd functions
firebase functions:config:set email.user="dolamonyakallo07@gmail.com" email.password="igbhadmjedcrfqwq" email.support_emails="ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com"
firebase deploy --only functions:onEscalationCreated
```

The code is already set up to use these values once they're configured!
