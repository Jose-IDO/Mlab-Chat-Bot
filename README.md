<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# mLab AI Support Platform

A customer support chatbot widget for mLab Southern Africa with landing page and escalation functionality.

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

## Current Features

- ✅ Landing page with Navbar, Hero, What We Do, Video, News, and Footer sections
- ✅ Basic chat widget with open/close functionality
- ✅ Mock AI responses (no API key required)
- ✅ Escalation form with POPIA compliance
- ✅ Knowledge base integration
- ✅ Category selection buttons
- ✅ Sensitive content detection

## Project Structure

- `components/Landing/` - Landing page components (Navbar, HeroSection, WhatWeDoSection, VideoSection, NewsSection, Footer)
- `components/Chatbot/` - Chat widget and escalation form
- `services/` - Data service and mock LLM provider
- `App.tsx` - Main application component

## Features to be Implemented

### AI Integration
- Google Gemini API integration
- Context-aware response generation
- Response error handling
- System instructions for AI
- Response latency tracking
- Response confidence scoring
- Token usage tracking
- Response caching
- Response quality monitoring

### Chat Widget Enhancements
- Typing indicator with animation
- Message history persistence (local storage)
- Conversation end state UI
- Scroll-to-bottom functionality
- Message timestamps formatting (relative time)
- Message search functionality
- Emoji support and text formatting
- Smooth transitions and animations
- Mobile responsiveness improvements

### Escalation Form Enhancements
- Form field validation feedback (inline error messages)
- Form submission success state
- Loading state during submission
- File attachment support
- Form auto-save functionality
- Category selection for escalations

### Data & Analytics
- Event logging functionality
- Knowledge base search functionality
- Data export functionality (CSV/JSON)
- Real data persistence (Firebase or backend API)
- Analytics and metrics calculation
- Conversation statistics and deflection rates

### UI/UX Improvements
- Error boundary components
- Loading states throughout app
- Accessibility improvements (ARIA labels, keyboard navigation)
- Performance optimization (image lazy loading)
- Scroll animations for hero section

### Configuration
- Environment variable configuration for API keys
