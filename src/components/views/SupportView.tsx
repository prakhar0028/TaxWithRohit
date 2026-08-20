import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  Headphones, 
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTax } from '../../context/TaxContext';
import { SupportTicket } from '../../types';

export const SupportView: React.FC = () => {
  const { user } = useAuth();
  const { setIsAIAssistantOpen } = useTax();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('ITR');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets', {
        headers: { 'x-user-id': user?.id || 'user_demo_101' },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (data.length > 0 && !selectedTicket) setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_demo_101',
        },
        body: JSON.stringify({ subject, category, priority, message }),
      });
      if (res.ok) {
        const newT = await res.json();
        setTickets(prev => [newT, ...prev]);
        setSelectedTicket(newT);
        setIsCreateModalOpen(false);
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_demo_101',
        },
        body: JSON.stringify({ message: replyText, senderRole: user?.role || 'USER' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-[11px] font-bold text-teal-300">
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 Tax Help Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Support & Expert Assistance
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Need clarity on Form 16 mismatch, Section 80C caps, or GST invoicing? Raise a ticket with our support desk or speak directly with our CA lead.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-[#07383D] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Tickets & Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List (1 Col) */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Your Tickets ({tickets.length})</h3>
          {tickets.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No tickets raised yet.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                  selectedTicket?.id === t.id ? 'border-teal-600 shadow-md ring-2 ring-teal-600/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
                    {t.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{t.updatedAt.split('T')[0]}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">{t.subject}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {t.messages[t.messages.length - 1]?.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Thread (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[480px]">
          {selectedTicket ? (
            <>
              <div>
                <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full uppercase">
                      Ticket #{selectedTicket.id ? selectedTicket.id.slice(-6) : 'NEW'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1">{selectedTicket.subject}</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages list */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {selectedTicket.messages.map((m, idx) => (
                    <div key={idx} className={`flex gap-3 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                      {m.sender !== 'USER' && (
                        <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          CA
                        </div>
                      )}
                      <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] ${
                        m.sender === 'USER' ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-800 border border-slate-200'
                      }`}>
                        <p className="font-bold text-[10px] mb-1 opacity-80">{m.senderName}</p>
                        <p className="leading-relaxed">{m.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your response to the support team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-xs text-slate-400">Select a ticket to view messages</div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900">Create Support Ticket</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Form 16 Part B HRA mismatch"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  <option value="ITR">Income Tax Return (ITR)</option>
                  <option value="GST">GST Registration & Filing</option>
                  <option value="NOTICE">Notice Response</option>
                  <option value="PAYMENT">Billing & Subscription</option>
                  <option value="OTHER">General Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Details / Description</label>
                <textarea
                  rows={4}
                  placeholder="Explain your tax question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
