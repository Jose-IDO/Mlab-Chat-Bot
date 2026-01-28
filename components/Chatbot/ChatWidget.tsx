
import React, { useState, useEffect, useRef } from 'react';
import { ChatRole, Message, EscalationStatus } from '../../types';
import { CATEGORIES } from '../../constants';
import { llmProvider } from '../../services/llmProvider';
import { firebaseService } from '../../services/firebaseService';
import EscalationForm from './EscalationForm';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, showEscalation, isOpen]);

  const addMessage = (role: ChatRole, content: string, type: Message['type'] = 'text') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type
    }]);
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    addMessage(ChatRole.USER, text);
    setInputValue('');
    setIsTyping(true);

    const sensitiveKeywords = ['bank', 'account', 'credit card', 'password', 'pin', 'id number', 'salary', 'personal information'];
    const isSensitive = sensitiveKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (isSensitive) {
      setTimeout(() => {
        setIsTyping(false);
        addMessage(ChatRole.BOT, "I don't have specific information in my records regarding how a \"bank\" system works at mLab, I recommend escalating this query to a human agent");
        setShowEscalation(true);
      }, 1000);
      return;
    }

    // Week 1: Get KB context for mock responses
    const kb = await firebaseService.getKB();
    const relevantKB = kb.find(k => 
      text.toLowerCase().includes(k.category.toLowerCase()) || 
      text.toLowerCase().includes(k.question.toLowerCase().split(' ')[0])
    );

    const context = relevantKB ? relevantKB.answer : "I don't have specific information in my records regarding this. I recommend escalating this query to a human agent.";
    
    // Week 1: Use mock responses (no real AI)
    const response = await llmProvider.generateResponse(text, context);
    
    setIsTyping(false);
    addMessage(ChatRole.BOT, response.text);
  };

  const handleCategoryClick = (cat: string) => {
    handleSend(`Tell me about mLab ${cat}`);
  };

  const startNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: ChatRole.BOT,
      content: 'Good afternoon and welcome to mLab AI Support. How can I assist you today?',
      timestamp: new Date(),
      type: 'options'
    }]);
    setConversationEnded(false);
    setShowEscalation(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Floating Toggle Button (As shown in image) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#008151] rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 text-white"
        >
          <i className="fas fa-comment-dots text-3xl"></i>
        </button>
      )}

      {/* Main Chat Window (Designed like image) */}
      <div className={`
        absolute bottom-0 right-0 w-[360px] h-[680px] bg-[#4A6D76] rounded-[30px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out origin-bottom-right
        ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-20 scale-50 opacity-0 pointer-events-none'}
      `}>
        
        {/* Header (Pill container style) */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="mx-auto flex items-center gap-2 bg-white rounded-full px-5 py-2 shadow-lg relative">
            <div className="w-5 h-5 bg-[#A5CD39] rounded-full flex items-center justify-center text-[10px] text-white">
              <i className="fas fa-comment"></i>
            </div>
            <span className="text-xs font-bold text-gray-800">mLab AI Support</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <button onClick={() => setIsOpen(false)} className="absolute right-6 text-gray-800/80 hover:text-white transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-center my-2">
            <div className="h-[1px] bg-white/20 w-16"></div>
            <span className="text-[10px] font-bold text-white/50 mx-4 tracking-widest uppercase">Today</span>
            <div className="h-[1px] bg-white/20 w-16"></div>
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
                      <i className="fas fa-robot text-white text-[12px]"></i>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-[13px] shadow-md leading-relaxed relative ${
                    msg.role === ChatRole.USER 
                      ? 'bg-[#A5CD39] text-[#1F2937] rounded-tr-none' 
                      : 'bg-white text-[#1F2937] rounded-tl-none'
                  }`}>
                    {msg.content}
                    <div className={`text-[8px] mt-1 font-bold opacity-60 text-right`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {msg.type === 'options' && !conversationEnded && (
                  <div className="grid grid-cols-2 gap-2 mt-4 ml-10 w-[calc(100%-40px)] pr-4">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => handleCategoryClick(cat)}
                        className="bg-[#003829] text-[#A5CD39] text-[9px] font-black uppercase py-2 rounded-full flex items-center justify-center gap-2 hover:bg-[#004d38] transition-all"
                      >
                        <i className={`fas fa-${cat === 'Programmes' ? 'graduation-cap' : cat === 'Locations' ? 'map-marker-alt' : cat === 'Applications' ? 'file-alt' : 'calendar-alt'}`}></i>
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2 ml-4">
                <div className="w-8 h-8 rounded-full bg-[#A5CD39] flex items-center justify-center">
                  <i className="fas fa-robot text-white text-[10px]"></i>
                </div>
                <div className="flex gap-1 p-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}

            {conversationEnded && (
              <div className="bg-white rounded-xl p-8 mt-6 mx-2 shadow-xl text-center flex flex-col items-center">
                 <h3 className="text-2xl font-black text-gray-800 mb-4">Conversation ended</h3>
                 <button 
                  onClick={startNewChat}
                  className="text-blue-500 font-bold hover:underline"
                 >
                   Start a new chat
                 </button>
              </div>
            )}
          </div>

          {/* Branding (as shown in image) */}
          <div className="mb-2 w-full text-center shrink-0">
            <span className="text-[9px] text-white/30 font-medium">powered by <span className="text-red-500/50 font-bold">MLAB AI SUPPORT</span></span>
          </div>

          {/* Pill-shaped Input Area */}
          {!conversationEnded && !showEscalation && (
            <div className="px-4 pb-6 shrink-0 border-t border-white/10 pt-4">
              <div className="h-12 bg-[#D1D5DB] rounded-full flex items-center px-4 shadow-inner">
                <button className="text-gray-600 hover:text-black transition-colors">
                  <i className="fas fa-plus text-xl"></i>
                </button>
                <input 
                  type="text" 
                  placeholder="Write a message..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent px-3 outline-none text-sm font-medium text-gray-700 placeholder-gray-500"
                />
                <button 
                  onClick={() => handleSend()}
                  className="w-8 h-8 bg-[#A5CD39] rounded-full flex items-center justify-center text-white hover:bg-[#94b833] transition-all"
                >
                  <i className="fas fa-arrow-up text-sm"></i>
                </button>
              </div>
            </div>
          )}

          {/* Escalation View (When triggered) */}
          {showEscalation && (
            <div className="absolute inset-0 z-50 bg-[#A5CD39] flex flex-col p-6 animate-slideUp">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-gray-800">Support Required</h2>
                  <button onClick={() => setShowEscalation(false)} className="p-2 bg-black/10 rounded-full">
                    <i className="fas fa-times text-xl"></i>
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto chat-scrollbar pr-2">
                 <EscalationForm 
                   onSubmit={() => {
                     setShowEscalation(false);
                     setConversationEnded(true);
                   }}
                   onCancel={() => setShowEscalation(false)}
                 />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
