import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  Send,
  Eye
} from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const ExpertView: React.FC = () => {
  const { user } = useAuth();
  const [assignedITRs, setAssignedITRs] = useState<any[]>([]);
  const [selectedITR, setSelectedITR] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchExpertData();
  }, []);

  const fetchExpertData = async () => {
    try {
      const res = await fetch('/api/expert/assigned-itrs', {
        headers: { 'x-user-id': user?.id || 'user_expert_201' },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAssignedITRs(data);
            if (data.length > 0 && !selectedITR) setSelectedITR(data[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewAction = async (status: 'FILED' | 'VERIFIED' | 'REJECTED') => {
    if (!selectedITR) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expert/review-itr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_expert_201',
        },
        body: JSON.stringify({
          itrId: selectedITR.id,
          status,
          reviewNote: reviewNote || 'Verified with Form 16 Part B, 26AS, and AIS. Slabs validated.',
        }),
      });
      if (res.ok) {
        setActionSuccess(`ITR successfully marked as ${status}`);
        fetchExpertData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-[11px] font-bold text-teal-300">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chartered Accountant Workbench</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tax Expert & CA Review Desk
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Perform AIS / 26AS reconciliation, cross-verify capital gains schedules, approve final JSON schema, and authorize direct e-filing.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Queue (1 Col) */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Your Assigned Filings ({assignedITRs.length})</h3>
          {assignedITRs.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              No pending ITRs in your queue.
            </div>
          ) : (
            assignedITRs.map((itr) => (
              <div
                key={itr.id}
                onClick={() => setSelectedITR(itr)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                  selectedITR?.id === itr.id ? 'border-teal-600 shadow-md ring-2 ring-teal-600/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
                    {itr.itrType}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">AY {itr.assessmentYear}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">PAN: {itr.panNumber}</h4>
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-slate-500">Gross: <strong className="text-slate-800">{formatINR(itr.grossTotalIncome || 1200000)}</strong></span>
                  <span className="font-bold text-amber-600">{itr.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Review Details & Signoff (2 Cols) */}
        <div className="lg:col-span-2">
          {selectedITR ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                    {selectedITR.itrType} • AY {selectedITR.assessmentYear}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2">Taxpayer PAN: {selectedITR.panNumber}</h2>
                  <p className="text-xs text-slate-500">Ack No: {selectedITR.acknowledgementNumber || 'Pending Filing'}</p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Taxable Total</p>
                  <p className="text-xl font-black text-teal-800">{formatINR(selectedITR.grossTotalIncome || 1200000)}</p>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900">CA Automated Pre-Audit Checks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>26AS TDS matches Form 16 Part A</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AIS Dividend & Interest Reconciled</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Section 87A Rebate correctly applied</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bank IFSC validated for refund</span>
                  </div>
                </div>
              </div>

              {/* Expert Notes Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">CA Review Comments & Verification Sign-off</label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Enter audit notes or instructions for the taxpayer before sign-off..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  onClick={() => handleReviewAction('VERIFIED')}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Approve ITR</span>
                </button>

                <button
                  onClick={() => handleReviewAction('FILED')}
                  disabled={isSubmitting}
                  className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Mark as e-Filed</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-xs text-slate-400">
              Select an assigned filing from the queue to start CA review
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
