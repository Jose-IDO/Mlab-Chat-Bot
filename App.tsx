
import React from 'react';
import ChatWidget from './components/Chatbot/ChatWidget';
import Navbar from './components/Landing/Navbar';
import HeroSection from './components/Landing/HeroSection';
import WhatWeDoSection from './components/Landing/WhatWeDoSection';
import VideoSection from './components/Landing/VideoSection';
import NewsSection from './components/Landing/NewsSection';
import Footer from './components/Landing/Footer';

const App: React.FC = () => {
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
