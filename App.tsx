
import React, { useState } from 'react';
import ChatWidget from './components/Chatbot/ChatWidget';
import AdminDashboard from './components/Admin/AdminDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'chat' | 'admin'>('chat');

  return (
    <div className="min-h-screen relative font-sans text-gray-900 bg-white selection:bg-[#98C13C]/30">
      {/* Navigation Toggle for Demo */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-white/90 backdrop-blur p-1 rounded-full shadow-2xl border border-gray-200">
        <button 
          onClick={() => setView('chat')}
          className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'chat' ? 'bg-[#98C13C] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Website
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-[#4F6B72] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Admin
        </button>
      </div>

      {view === 'chat' ? (
        <>
          {/* mLab Website Mockup */}
          <nav className="h-24 flex items-center justify-between px-10 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#98C13C] rounded-xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
                <i className="fas fa-bolt text-2xl"></i>
              </div>
              <span className="text-3xl font-black tracking-tighter text-[#4F6B72]">mLab<span className="text-[#98C13C]">.</span></span>
            </div>
            <div className="hidden lg:flex gap-12 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              <a href="#" className="hover:text-[#98C13C] transition-colors">Programmes</a>
              <a href="#" className="hover:text-[#98C13C] transition-colors">Ecosystem</a>
              <a href="#" className="hover:text-[#98C13C] transition-colors">Locations</a>
              <a href="#" className="hover:text-[#98C13C] transition-colors">Contact</a>
            </div>
            <button className="bg-[#4F6B72] text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Portal Login</button>
          </nav>

          <main className="max-w-7xl mx-auto px-10 pt-24 pb-40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#98C13C]/10 rounded-full">
                  <span className="w-2 h-2 bg-[#98C13C] rounded-full animate-ping"></span>
                  <span className="text-[#98C13C] text-[10px] font-black uppercase tracking-[0.3em]">Applications Open for 2024</span>
                </div>
                <h1 className="text-7xl xl:text-8xl font-black text-[#4F6B72] leading-[0.9] tracking-tighter">
                  Build the <span className="text-[#98C13C] italic">Future</span> of Africa.
                </h1>
                <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-xl">
                  mLab Southern Africa is a leading technology mobile incubator. We provide startups and developers with the tools, mentorship, and community needed to scale.
                </p>
                <div className="flex flex-wrap gap-6">
                  <button className="px-12 py-5 bg-[#98C13C] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-[#86ac34] transition-all transform hover:-translate-y-1">Explore Courses</button>
                  <button className="px-12 py-5 border-4 border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:border-[#4F6B72] hover:text-[#4F6B72] transition-all">Our Hubs</button>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#98C13C] to-[#4F6B72] rounded-[4rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200" 
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-700"
                    alt="mLab Workspace"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4F6B72]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12 text-white">
                    <p className="text-4xl font-black tracking-tight">Innovation starts here.</p>
                    <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-2">Join 12,000+ Alumni</p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Floating Chat Widget */}
          <ChatWidget />
        </>
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
};

export default App;
