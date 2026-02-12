import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Plus, ArrowUp, Bot, GraduationCap, MapPin, FileText, Calendar } from 'lucide-react';
import { ChatRole, type Message, EscalationStatus } from '../../types';
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

    const kb = await firebaseService.getKB();
    const relevantKB = kb.find(k => 
      text.toLowerCase().includes(k.category.toLowerCase()) || 
      text.toLowerCase().includes(k.question.toLowerCase().split(' ')[0])
    );

    const context = relevantKB ? relevantKB.answer : "I don't have specific information in my records regarding this. I recommend escalating this query to a human agent.";
    
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
      content: 'Good afternoon and welcome to mLab AI Support. How can I assist you today?',
      timestamp: new Date(),
      type: 'options'
    }]);
    setConversationEnded(false);
    setShowEscalation(false);
  };

  return (
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Floating Toggle Button - Styled exactly like the user's image */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-[#A5CD39] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(165,205,57,0.4)] transition-all hover:scale-110 active:scale-95 text-white"
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4C7.58172 4 4 7.13401 4 11C4 12.5641 4.58418 13.9996 5.56826 15.1322C5.19793 16.3216 4.41721 17.5019 3.5 18.5C5.5 18.5 7.5 17.5 8.5 16.5C9.57863 17.4497 10.7392 18 12 18C16.4183 18 20 14.866 20 11C20 7.13401 16.4183 4 12 4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 14.5C18 13.1193 16.8807 12 15.5 12C14.1193 12 13 13.1193 13 14.5C13 15.1904 13.2798 15.8154 13.7345 16.2694C13.3 16.8 13 17.5 13 18C13.8 17.8 14.4 17.4 14.8 17.1C15.02 17.16 15.26 17.2 15.5 17.2C16.8807 17.2 18 16.0807 18 14.5Z" fill="white" stroke="#A5CD39" strokeWidth="0.5"/>
            <path d="M18 14.5C18 13.1193 16.8807 12 15.5 12C14.1193 12 13 13.1193 13 14.5C13 15.1904 13.2798 15.8154 13.7345 16.2694C13.3 16.8 13 17.5 13 18C13.8 17.8 14.4 17.4 14.8 17.1C15.02 17.16 15.26 17.2 15.5 17.2C16.8807 17.2 18 16.0807 18 14.5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Main Chat Window */}
      <div className={`
        absolute bottom-0 right-0 w-[380px] h-[720px] max-h-[90vh] bg-[#4A6D76] rounded-[30px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out origin-bottom-right
        ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-20 scale-50 opacity-0 pointer-events-none'}
      `}>
        
        {/* Header - Styled to match image precisely */}
        <div className="px-6 py-6 flex items-center justify-center shrink-0 relative">
          <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2 shadow-lg relative">
            <div className="w-5 h-5 bg-[#A5CD39] rounded-full flex items-center justify-center text-[10px] text-white">
              <MessageCircle size={12} />
            </div>
            <span className="text-xs font-bold text-gray-800">mLab AI Support</span>
            {/* Notification Dot */}
            <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </div>
          {/* Close Button 'X' (As shown in image) */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-800/80 hover:text-white transition-colors"
          >
            <X size={24} />
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
                    <div className={`text-[8px] mt-1 font-bold opacity-40 text-right`}>
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
                        {getCategoryIcon(cat)}
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
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex gap-1 p-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></div>
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

          {/* Escalation View - Overlay with Vertical Scroll */}
          {showEscalation && (
            <div className="absolute inset-0 z-50 bg-[#A5CD39] flex flex-col animate-slideUp">
               <div className="flex justify-between items-center p-6 shrink-0 bg-[#A5CD39] shadow-md z-10">
                  <h2 className="text-xl font-black text-gray-800">Support Required</h2>
                  <button onClick={() => setShowEscalation(false)} className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-gray-800 hover:bg-black/20 transition-all">
                    <X size={20} />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto chat-scrollbar p-6">
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