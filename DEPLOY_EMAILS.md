# Deploy Email Function to Firebase

## Prerequisites
1. Node.js 20+ installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Logged into Firebase (`firebase login`)

## Steps to Deploy

### 1. Configure Email Credentials in Firebase

Set the email credentials in Firebase Functions config:

```bash
cd functions
firebase functions:config:set email.user="dolamonyakallo07@gmail.com" email.password="igbhadmjedcrfqwq" email.support_emails="ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com"
```

**Note:** The password should be your Gmail App Password (remove spaces). If you haven't created one:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate an App Password for "Mail"

### 2. Deploy the Cloud Functions

```bash
# From the project root
cd functions
firebase deploy --only functions:onEscalationCreated,functions:sendEmail
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

### 3. Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Functions
3. Check that `onEscalationCreated` and `sendEmail` are listed and active

### 4. Test the Email Function

1. Submit an escalation form through the chatbot
2. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```
3. Verify emails are received at:
   - ashleymanchidi@gmail.com
   - dolamonyakallo07@gmail.com

## Troubleshooting

### Email Not Sending

1. **Check Firebase Functions Logs:**
   ```bash
   firebase functions:log --only onEscalationCreated
   ```

2. **Verify Email Credentials:**
   - Ensure Gmail App Password is correct (no spaces)
   - Check that 2-Step Verification is enabled on Gmail account

3. **Check Function Status:**
   - Go to Firebase Console → Functions
   - Ensure functions show as "Active"

### Common Issues

- **"Email password not configured"**: Run the `firebase functions:config:set` command again
- **"Authentication failed"**: Verify Gmail App Password is correct
- **"Function timeout"**: Check Firebase Functions logs for detailed error messages

## Alternative: Use Environment Variables

If you prefer using environment variables instead of Firebase config:

1. Create a `.env` file in the `functions` directory:
   ```
   EMAIL_USER=dolamonyakallo07@gmail.com
   EMAIL_PASSWORD=igbhadmjedcrfqwq
   SUPPORT_EMAIL=ashleymanchidi@gmail.com,dolamonyakallo07@gmail.com
   ```

2. Update `functions/index.js` to read from `process.env` (already done)

3. Deploy with environment variables:
   ```bash
   firebase functions:config:set email.user="dolamonyakallo07@gmail.com" email.password="igbhadmjedcrfqwq"
   ```
