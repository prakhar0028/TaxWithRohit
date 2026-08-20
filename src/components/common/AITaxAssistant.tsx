import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, ChevronRight, HelpCircle, MessageSquare } from 'lucide-react';
import { useTax } from '../../context/TaxContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Old vs New Regime: Which is better for ₹12 Lakhs salary?',
  'How to claim HRA with standard deduction?',
  'What is the tax rate on Mutual Funds capital gains (LTCG)?',
  'I got a Section 143(1) intimation. How do I respond?',
  'Can I claim 80C and 80D under the New Tax Regime?',
];

export const AITaxAssistant: React.FC = () => {
  const { isAIAssistantOpen, setIsAIAssistantOpen } = useTax();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Namaste! I am your TaxWithRohit AI Assistant. I can help you with Indian Income Tax rules (FY 2024-25 / AY 2025-26), Old vs New regime comparisons, 80C/80D deductions, Form 16 interpretation, and notice compliance. How can I assist you today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIAssistantOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
        }),
      });

      const data = await res.json();
      const aiReply = data.response || 'Sorry, I could not process that request. Please try again.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'Under the New Tax Regime (AY 2025-26), taxable income up to ₹3,00,000 has 0% tax, and with the Section 87A rebate and standard deduction of ₹75,000, salaried income up to ₹7.75 Lakhs is effectively tax-free.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger matching Clean Minimalism */}
      {!isAIAssistantOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="bg-[#07383D] text-white pl-3.5 pr-5 py-2.5 rounded-full shadow-xl flex items-center gap-3 border border-[#0EB1B1]/30 hover:scale-105 transition-all group cursor-pointer"
            aria-label="Ask TaxWithRohit AI"
          >
            <div className="w-8 h-8 rounded-full bg-[#0EB1B1] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-none opacity-60 mb-1 text-white">Online AI</p>
              <p className="text-xs sm:text-sm font-bold leading-none text-white">Ask TaxWithRohit</p>
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Drawer */}
      {isAIAssistantOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#07383D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0EB1B1] flex items-center justify-center text-white font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">TaxWithRohit AI Tax Advisor</h3>
                  <p className="text-[10px] text-white/60">Indian Tax Act & Notice Specialist</p>
                </div>
              </div>

              <button
                onClick={() => setIsAIAssistantOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8F7FA] custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-[#07383D] text-[#0EB1B1] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0EB1B1] text-white rounded-tr-xs shadow-xs font-medium'
                        : 'bg-white text-[#1A1A1A] rounded-tl-xs shadow-xs border border-gray-100 whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start items-center">
                  <div className="w-6 h-6 rounded-full bg-[#07383D] text-[#0EB1B1] flex items-center justify-center shrink-0 text-[10px] font-bold">
                    AI
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0EB1B1]" />
                    <span>Analyzing tax provisions...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 bg-white border-t border-gray-100 overflow-x-auto custom-scrollbar flex gap-1.5">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap px-3 py-1 bg-gray-50 hover:bg-teal-50 hover:text-[#07383D] hover:border-[#0EB1B1]/40 border border-gray-200 text-[11px] text-gray-600 font-medium rounded-full transition-colors shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question about taxes, deductions, rules..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0EB1B1]/30 focus:border-[#0EB1B1]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-[#07383D] hover:bg-[#09474e] disabled:opacity-40 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
