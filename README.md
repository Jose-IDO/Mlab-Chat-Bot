<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# mLab AI Support Platform - Week 1

A customer support chatbot widget for mLab Southern Africa with mock responses and escalation functionality.

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Week 1 Features

- ✅ Basic chat widget with open/close functionality
- ✅ Mock AI responses (no API key required)
- ✅ Escalation form with POPIA compliance
- ✅ Knowledge base integration
- ✅ Category selection buttons
- ✅ Sensitive content detection

## Project Structure

- `components/Chatbot/` - Chat widget and escalation form
- `services/` - Data service and mock LLM provider
- `App.tsx` - Main application component with mLab website mockup

## Notes

- This is Week 1 version with mock responses (no real AI integration)
- Admin dashboard has been removed
- No API keys required for Week 1 functionality
