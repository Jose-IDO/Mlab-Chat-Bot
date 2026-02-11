import React, { useEffect } from 'react';
import ChatWidget from './components/Chatbot/ChatWidget';
import Navbar from './components/Landing/Navbar';
import HeroSection from './components/Landing/HeroSection';
import WhatWeDoSection from './components/Landing/WhatWeDoSection';
import VideoSection from './components/Landing/VideoSection';
import NewsSection from './components/Landing/NewsSection';
import Footer from './components/Landing/Footer';
import { incrementVisitCount } from './services/firebase';

const App: React.FC = () => {
  useEffect(() => {
    incrementVisitCount();
    if (import.meta.env.DEV) {
      console.log('[Dev] Scraper: runs once on server start, then every 3rd page refresh. Watch this console for refresh count and scraper triggers.');
      fetch('/api/visit')
        .then((res) => res.json())
        .then((data: { refreshCount?: number; scraperTriggered?: boolean }) => {
          console.log(`[Refresh] count = ${data.refreshCount ?? '?'}`);
          if (data.scraperTriggered) {
            console.log('[Scraper] Being run again (every 3rd refresh).');
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <WhatWeDoSection />
      <VideoSection />
      <NewsSection />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default App;
