import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Plus, ArrowUp, Bot, GraduationCap, MapPin, FileText, Calendar, Sparkles, Minimize2 } from 'lucide-react';
import { ChatRole, type Message, EscalationStatus } from '../../types';
import { CATEGORIES } from '../../constants';
import { llmProvider } from '../../services/llmProvider';
import { firebaseService } from '../../services/firebaseService';
import EscalationForm from './EscalationForm';

const ESCALATION_LINK_TEXT = 'Click here to escalate to a human agent';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: ChatRole.BOT,
      content: 'Good afternoon and welcome to mLab AI Support. How can I assist you today? You can choose a category below or type your question.',
      timestamp: new Date(),
      type: 'options'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [categoriesShown, setCategoriesShown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, showEscalation, isOpen]);

  // Auto-hide welcome bubble after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeBubble(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Improved notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant notification tone
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      // Smooth envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  };

  const addMessage = (role: ChatRole, content: string, type: Message['type'] = 'text', playSound: boolean = true) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type
    }]);
    
    // Play notification sound for bot messages
    if (role === ChatRole.BOT && playSound) {
      setTimeout(() => playNotificationSound(), 100);
    }
  };

  const openEscalationOverlay = () => {
    setShowEscalation(true);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    addMessage(ChatRole.USER, text, 'text', false);
    setInputValue('');
    setIsTyping(true);

    // Hide categories after first user message
    if (!categoriesShown) {
      setCategoriesShown(true);
    }

    const sensitiveKeywords = ['bank', 'account', 'credit card', 'password', 'pin', 'id number', 'salary', 'personal information'];
    const isSensitive = sensitiveKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (isSensitive) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage(ChatRole.BOT, "I don't have specific information in my records regarding how a \"bank\" system works at mLab.");
      }, 1500);
      return;
    }

    const kb = await firebaseService.getKB();
    const relevantKB = kb.find(k => 
      text.toLowerCase().includes(k.category.toLowerCase()) || 
      text.toLowerCase().includes(k.question.toLowerCase().split(' ')[0])
    );

    const context = relevantKB ? relevantKB.answer : "I don't have specific information in my records regarding this.";
    
    const response = await llmProvider.generateResponse(text, context);
    
    setIsTyping(false);
    addMessage(ChatRole.BOT, response.text);

    await firebaseService.logEvent({
      model: 'gemini-3-flash-preview',
      latency: response.latency,
      confidence: 0.95
    });
  };

  const handleCategoryClick = (cat: string) => {
    handleSend(`Tell me about mLab ${cat}`);
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Programmes': return <GraduationCap size={12} />;
      case 'Locations': return <MapPin size={12} />;
      case 'Applications': return <FileText size={12} />;
      default: return <Calendar size={12} />;
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: ChatRole.BOT,
      content: 'Good afternoon and welcome to mLab AI Support. How can I assist you today? You can choose a category below or type your question.',
      timestamp: new Date(),
      type: 'options'
    }]);
    setConversationEnded(false);
    setShowEscalation(false);
    setCategoriesShown(false);
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowWelcomeBubble(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Welcome Message Bubble - appears before chat is opened */}
      {!isOpen && showWelcomeBubble && (
        <div 
          className="mb-4 mr-2 animate-slide-in-bounce"
          style={{
            animation: 'slideInBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}
        >
          <div className="relative">
            {/* Close button for welcome bubble */}
            <button
              onClick={() => setShowWelcomeBubble(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all z-10"
            >
              <X size={14} />
            </button>
            
            {/* Welcome bubble content */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-[280px] relative border-2 border-[#A5CD39]/20">
              {/* Sparkle decoration */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#A5CD39] rounded-full flex items-center justify-center animate-pulse">
                <Sparkles size={16} className="text-white" />
              </div>
              
              {/* Content */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A5CD39] to-[#94b833] flex-shrink-0 flex items-center justify-center shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-800 mb-1">
                    👋 Hi there!
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    Need help with mLab? I'm here to answer questions about our programmes, locations, and applications!
                  </p>
                  <button
                    onClick={handleOpenChat}
                    className="w-full bg-gradient-to-r from-[#A5CD39] to-[#94b833] text-white text-xs font-bold py-2.5 px-4 rounded-full hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Start chatting →
                  </button>
                </div>
              </div>
              
              {/* Tail pointer */}
              <div className="absolute bottom-0 right-8 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white translate-y-full">
                <div className="absolute -top-[14px] -left-[13px] w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[13px] border-t-[#A5CD39]/20"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button - With text inside */}
      {!isOpen && (
        <button 
          onClick={handleOpenChat}
          className="bg-[#A5CD39] rounded-full flex items-center gap-3 px-6 py-4 shadow-[0_10px_30px_rgba(165,205,57,0.4)] transition-all hover:scale-105 active:scale-95 text-white relative"
        >
            {/* Pulse ring animation */}
            <div className="absolute inset-0 rounded-full bg-[#A5CD39] animate-ping opacity-20"></div>
            
            {/* Chat icon */}
            <div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4C7.58172 4 4 7.13401 4 11C4 12.5641 4.58418 13.9996 5.56826 15.1322C5.19793 16.3216 4.41721 17.5019 3.5 18.5C5.5 18.5 7.5 17.5 8.5 16.5C9.57863 17.4497 10.7392 18 12 18C16.4183 18 20 14.866 20 11C20 7.13401 16.4183 4 12 4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 14.5C18 13.1193 16.8807 12 15.5 12C14.1193 12 13 13.1193 13 14.5C13 15.1904 13.2798 15.8154 13.7345 16.2694C13.3 16.8 13 17.5 13 18C13.8 17.8 14.4 17.4 14.8 17.1C15.02 17.16 15.26 17.2 15.5 17.2C16.8807 17.2 18 16.0807 18 14.5Z" fill="white" stroke="#A5CD39" strokeWidth="0.5"/>
                <path d="M18 14.5C18 13.1193 16.8807 12 15.5 12C14.1193 12 13 13.1193 13 14.5C13 15.1904 13.2798 15.8154 13.7345 16.2694C13.3 16.8 13 17.5 13 18C13.8 17.8 14.4 17.4 14.8 17.1C15.02 17.16 15.26 17.2 15.5 17.2C16.8807 17.2 18 16.0807 18 14.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Text inside button */}
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-sm font-bold text-white">Chat to us?</span>
              <span className="text-xs text-white/80">We're online</span>
            </div>
          </button>
      )}

      {/* Main Chat Window */}
      <div className={`
        absolute bottom-0 right-0 w-[380px] h-[720px] max-h-[90vh] bg-[#4A6D76] rounded-[30px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out origin-bottom-right
        ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-20 scale-50 opacity-0 pointer-events-none'}
      `}>
        
        {/* Header - Enhanced with better close button */}
        <div className="px-6 py-6 flex items-center justify-between shrink-0 relative">
          {/* Center title badge */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2 shadow-lg relative">
              <div className="w-5 h-5 bg-[#A5CD39] rounded-full flex items-center justify-center text-[10px] text-white">
                <MessageCircle size={12} />
              </div>
              <span className="text-xs font-bold text-gray-800">mLab AI Support</span>
              {/* Notification Dot */}
              <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></div>
            </div>
          </div>
          
          {/* Close button - Enhanced and more visible */}
          <button 
            onClick={handleCloseChat}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 duration-300 shadow-lg backdrop-blur-sm group"
            title="Close chat"
          >
            <X size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-center my-1 shrink-0">
            <div className="h-[1px] bg-white/10 w-16"></div>
            <span className="text-[10px] font-bold text-white/30 mx-4 tracking-widest uppercase">Today</span>
            <div className="h-[1px] bg-white/10 w-16"></div>
          </div>

          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto px-4 chat-scrollbar space-y-6 pb-20 pt-4"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === ChatRole.USER ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === ChatRole.USER ? 'flex-row-reverse' : ''}`}>
                  {msg.role === ChatRole.BOT && (
                    <div className="w-8 h-8 rounded-full bg-[#A5CD39] flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-[13px] shadow-md leading-relaxed relative ${
                    msg.role === ChatRole.USER 
                      ? 'bg-[#A5CD39] text-[#1F2937] rounded-tr-none' 
                      : 'bg-white text-[#1F2937] rounded-tl-none'
                  }`}>
                    {msg.content}
                    
                    {/* Escalation Button */}
                    {msg.type === 'escalation' && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={openEscalationOverlay}
                          className="text-[#073B4C] font-bold underline hover:no-underline text-left transition-all hover:text-[#0a5066]"
                        >
                          {ESCALATION_LINK_TEXT}
                        </button>
                      </div>
                    )}
                    
                    <div className={`text-[8px] mt-1 font-bold opacity-40 text-right`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {msg.type === 'options' && !conversationEnded && !categoriesShown && (
                  <div className="ml-10 w-[calc(100%-40px)] pr-4 space-y-3 mt-4">
                    {/* Category buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => handleCategoryClick(cat)}
                          className="bg-[#003829] text-[#A5CD39] text-[9px] font-black uppercase py-2 rounded-full flex items-center justify-center gap-2 hover:bg-[#004d38] transition-all"
                        >
                          {getCategoryIcon(cat)}
                          {cat}
                        </button>
                      ))}
                    </div>
                    
                    {/* Escalation option at the bottom */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mt-2">
                      <p className="text-[11px] text-white/80 mb-2">Would you like to speak to an agent?</p>
                      <button
                        type="button"
                        onClick={openEscalationOverlay}
                        className="w-full bg-white text-[#073B4C] text-[10px] font-bold py-2 px-3 rounded-full hover:bg-white/90 transition-all"
                      >
                        {ESCALATION_LINK_TEXT}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Modern Loading Animation */}
            {isTyping && (
              <div className="flex items-start gap-2 ml-4">
                <div className="w-8 h-8 rounded-full bg-[#A5CD39] flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#A5CD39] rounded-full animate-typing-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-[#A5CD39] rounded-full animate-typing-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#A5CD39] rounded-full animate-typing-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {conversationEnded && (
              <div className="bg-white rounded-xl p-8 mt-6 mx-2 shadow-xl text-center flex flex-col items-center border-t-4 border-[#A5CD39]">
                 <h3 className="text-2xl font-black text-gray-800 mb-2">Conversation ended</h3>
                 <button 
                  onClick={startNewChat}
                  className="text-blue-500 font-bold hover:underline"
                 >
                   Start a new chat
                 </button>
              </div>
            )}
          </div>

          {/* Branding (Fixed at bottom of scroll area) */}
          <div className="absolute bottom-[84px] w-full text-center shrink-0 z-10 py-1 bg-[#4A6D76]/80 backdrop-blur-sm">
            <span className="text-[9px] text-white/30 font-medium tracking-tight">powered by <span className="text-red-500 font-black">MLAB AI SUPPORT</span></span>
          </div>

          {/* Input Area */}
          {!conversationEnded && !showEscalation && (
            <div className="px-4 pb-6 shrink-0 border-t border-white/10 pt-4 bg-[#4A6D76]">
              <div className="h-14 bg-[#E5E7EB] rounded-full flex items-center px-4 shadow-inner">
                <button className="text-gray-500 hover:text-black transition-colors w-10 h-10 flex items-center justify-center">
                  <Plus size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder="Write a message..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent px-2 outline-none text-sm font-semibold text-gray-700 placeholder-gray-500"
                />
                <button 
                  onClick={() => handleSend()}
                  className="w-9 h-9 bg-[#A5CD39] rounded-full flex items-center justify-center text-white hover:bg-[#94b833] transition-all"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Escalation overlay: centered popup with backdrop + pop-open effect, scrollbar hidden */}
          {showEscalation && (
            <div 
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
              style={{
                animation: 'fadeIn 0.3s ease-out',
                background: 'rgba(0, 0, 0, 0.6)'
              }}
            >
               <div 
                 className="bg-[#A5CD39] rounded-3xl w-full max-w-[440px] max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                 style={{
                   animation: 'popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                 }}
               >
                 <div className="flex justify-between items-center px-6 py-5 shrink-0 border-b border-black/10">
                    <h2 className="text-xl font-black text-gray-800">Support Required</h2>
                    <button 
                      onClick={() => setShowEscalation(false)} 
                      className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-gray-800 hover:bg-white/30 transition-all hover:rotate-90 duration-300"
                    >
                      <X size={18} />
                    </button>
                 </div>
                 <div 
                   className="flex-1 overflow-y-auto p-6"
                   style={{
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none'
                   }}
                 >
                   <EscalationForm 
                     onSubmit={() => {
                       setShowEscalation(false);
                       setConversationEnded(true);
                     }}
                     onCancel={() => setShowEscalation(false)}
                   />
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes popIn {
          0% {
            transform: scale(0.7) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInBounce {
          0% {
            transform: translateX(100px);
            opacity: 0;
          }
          50% {
            transform: translateX(-10px);
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
        
        .animate-typing-bounce {
          animation: typing-bounce 1.4s infinite ease-in-out;
        }
        
        .chat-scrollbar::-webkit-scrollbar,
        div[style*="scrollbarWidth"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;