import React, { useState, useEffect, useRef } from 'react';
import { ChatRole, Message } from '../../types';
import { CATEGORIES } from '../../constants';
import EscalationForm from './EscalationForm';
import { llmProvider } from '../../services/llmProvider';

const ESCALATION_LINK_TEXT = 'Speak to an agent';

/** Use LLM directly so chat works on static hosting (Firebase, etc.) where /api/chat is not available. */
async function getChatResponse(prompt: string): Promise<{ text: string }> {
  const { text } = await llmProvider.generateResponse(prompt);
  return { text };
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: ChatRole.BOT,
      content: 'Good afternoon and welcome to mLab AI Support. This chatbot helps you get information about mLab programmes, locations, applications, and events. You can choose a category above or type your question.',
      timestamp: new Date(),
      type: 'options'
    },
    {
      id: '2',
      role: ChatRole.BOT,
      content: 'Would you like to speak to an agent?',
      timestamp: new Date(),
      type: 'escalation'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showEscalation, isOpen]);

  const addMessage = (role: ChatRole, content: string, type: Message['type'] = 'text') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      type
    }]);
  };

  const openEscalationOverlay = () => setShowEscalation(true);
  const closeEscalationOverlay = () => setShowEscalation(false);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    addMessage(ChatRole.USER, text);
    setInputValue('');

    try {
      const response = await getChatResponse(text);
      addMessage(ChatRole.BOT, response.text);
    } catch (err) {
      addMessage(ChatRole.BOT, err instanceof Error ? err.message : 'Error connecting to AI service. Please try again.');
    }
  };

  const handleCategoryClick = (cat: string) => {
    handleSend(`Tell me about mLab ${cat}`);
  };

  const startNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: ChatRole.BOT,
      content: 'Good afternoon and welcome to mLab AI Support. This chatbot helps you get information about mLab programmes, locations, applications, and events. You can choose a category above or type your question.',
      timestamp: new Date(),
      type: 'options'
    }, {
      id: (Date.now() + 1).toString(),
      role: ChatRole.BOT,
      content: 'Would you like to speak to an agent?',
      timestamp: new Date(),
      type: 'escalation'
    }]);
    setConversationEnded(false);
    setShowEscalation(false);
  };

  const handleEscalationSubmit = () => {
    setShowEscalation(false);
    setConversationEnded(true);
  };

  const handleEscalationCancel = () => {
    setShowEscalation(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#008151] rounded-full flex items-center justify-center shadow-2xl text-white"
        >
          <i className="fas fa-comment-dots text-3xl"></i>
        </button>
      )}

      <div className={`
        absolute bottom-0 right-0 w-[360px] h-[680px] bg-[#4A6D76] rounded-[30px] shadow-2xl flex flex-col overflow-hidden
        ${isOpen ? '' : 'hidden'}
      `}>

        <div className="px-4 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg relative">
            <div className="w-5 h-5 bg-[#A5CD39] rounded-full flex items-center justify-center text-[10px] text-white">
              <i className="fas fa-comment"></i>
            </div>
            <span className="text-xs font-bold text-gray-800">mLab AI Support</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={openEscalationOverlay}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-800/90 hover:text-[#A5CD39] transition-colors rounded-full"
              title="Speak to an agent"
              aria-label="Speak to an agent"
            >
              <i className="fas fa-headset text-xl"></i>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-800/80 hover:opacity-80"
              aria-label="Close chat"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-center my-2">
            <div className="h-[1px] bg-white/20 w-16"></div>
            <span className="text-[10px] font-bold text-white/50 mx-4 tracking-widest uppercase">Today</span>
            <div className="h-[1px] bg-white/20 w-16"></div>
          </div>

          {!conversationEnded && !showEscalation && (
            <div className="px-3 pb-3 shrink-0">
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="bg-[#003829] text-[#A5CD39] text-[9px] font-black uppercase py-2 px-3 rounded-full flex items-center justify-center gap-1.5 shadow-md hover:bg-[#004d3d] transition-colors"
                  >
                    <i className={`fas fa-${cat === 'Programmes' ? 'graduation-cap' : cat === 'Locations' ? 'map-marker-alt' : cat === 'Applications' ? 'file-alt' : 'calendar-alt'}`}></i>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 chat-scrollbar space-y-6 pb-20 pt-2"
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
                    {msg.type === 'escalation' && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={openEscalationOverlay}
                          className="text-[#073B4C] font-bold underline hover:no-underline text-left"
                        >
                          {ESCALATION_LINK_TEXT}
                        </button>
                      </div>
                    )}
                    <div className="text-[8px] mt-1 font-bold opacity-60 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {conversationEnded && (
              <div className="bg-white rounded-xl p-8 mt-6 mx-2 shadow-xl text-center flex flex-col items-center">
                <h3 className="text-2xl font-black text-gray-800 mb-4">Conversation ended</h3>
                <p className="text-sm text-gray-600 mb-4">Thank you. An agent will be in touch.</p>
                <button
                  onClick={startNewChat}
                  className="text-blue-500 font-bold hover:underline"
                >
                  Start a new chat
                </button>
              </div>
            )}
          </div>

          <div className="mb-2 w-full text-center shrink-0">
            <span className="text-[9px] text-white/30 font-medium">powered by <span className="text-red-500/50 font-bold">MLAB AI SUPPORT</span></span>
          </div>

          {!conversationEnded && !showEscalation && (
            <div className="px-4 pb-6 shrink-0 border-t border-white/10 pt-4">
              <div className="h-12 bg-[#D1D5DB] rounded-full flex items-center px-4 shadow-inner">
                <button type="button" className="text-gray-600">
                  <i className="fas fa-plus text-xl"></i>
                </button>
                <input
                  type="text"
                  placeholder="Write a message..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent px-3 outline-none text-sm font-medium text-gray-700 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="w-8 h-8 bg-[#A5CD39] rounded-full flex items-center justify-center text-white"
                >
                  <i className="fas fa-arrow-up text-sm"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Escalation overlay: centered popup with backdrop + pop-open effect, scrollbar hidden */}
      {showEscalation && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="escalation-title"
        >
          <div className="relative max-h-[85vh] overflow-y-auto scrollbar-hide escalation-pop-open">
            <button
              onClick={closeEscalationOverlay}
              className="absolute top-1 right-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-800 z-10"
              aria-label="Close"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
            <EscalationForm
              onSubmit={handleEscalationSubmit}
              onCancel={handleEscalationCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
