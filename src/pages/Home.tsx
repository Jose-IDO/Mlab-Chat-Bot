import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection'
import WhatWeDoSection from '../components/WhatWeDoSection';
import VideoSection from '../components/VideoSection';
import NewsSection from '../components/NewsSection';
import Footer from '../components/Footer';
import FloatingChatButton from '../components/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <WhatWeDoSection />
      <VideoSection />
      <NewsSection />
      <Footer />
      <FloatingChatButton />
    </div>
  );
}