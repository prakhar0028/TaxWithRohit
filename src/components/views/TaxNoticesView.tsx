import React, { useState } from 'react';
import { 
  AlertTriangle, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Download,
  HelpCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { useTax } from '../../context/TaxContext';
import { formatINR } from '../../lib/utils';
import { TaxNoticeItem } from '../../types';

export const TaxNoticesView: React.FC = () => {
  const { notices, uploadNotice, setIsAIAssistantOpen } = useTax();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<TaxNoticeItem | null>(notices[0] || null);

  // New Notice Form State
  const [noticeType, setNoticeType] = useState('SECTION_143_1');
  const [dinNumber, setDinNumber] = useState('');
  const [demandAmount, setDemandAmount] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    await uploadNotice({
      noticeType,
      assessmentYear: '2024-25',
      noticeDate: new Date().toISOString().split('T')[0],
      dinNumber: dinNumber || `DIN-2025-${Math.floor(10000000 + Math.random() * 90000000)}`,
      demandAmount: Number(demandAmount) || 0,
      fileName: fileName || 'IT_Notice_Document.pdf',
    });

    setIsUploading(false);
    setIsUploadModalOpen(false);
    setDinNumber('');
    setDemandAmount('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Income Tax Notice Resolution Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Notice Assistance & Audit Defense
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Received Section 143(1), 139(9), 143(2) or 148 notice? Upload your PDF notice. Our experienced Chartered Accountants analyze discrepancies, verify DIN, and draft compliant responses.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-[#07383D] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Notice</span>
        </button>
      </div>

      {/* Main Notice List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice List (1 Col) */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Your Active Notices ({notices.length})</h3>
          {notices.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No Pending Tax Notices</p>
              <p className="text-xs text-slate-400">All your returns are clean and compliant.</p>
            </div>
          ) : (
            notices.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNotice(n)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                  selectedNotice?.id === n.id ? 'border-teal-600 shadow-md ring-2 ring-teal-600/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {n.noticeType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">AY {n.assessmentYear}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">DIN: {n.dinNumber}</h4>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-slate-500 font-medium">Demand: <strong className="text-slate-900">{formatINR(n.demandAmount)}</strong></span>
                  <span className="font-bold text-teal-700 capitalize">{n.status.replace(/_/g, ' ').toLowerCase()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notice Detail & Timeline (2 Cols) */}
        <div className="lg:col-span-2">
          {selectedNotice ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
                    {selectedNotice.noticeType.replace(/_/g, ' ')}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2">DIN: {selectedNotice.dinNumber}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Notice Date: {selectedNotice.noticeDate} • Assessment Year {selectedNotice.assessmentYear}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Demand Amount</p>
                  <p className="text-xl font-black text-red-600">{formatINR(selectedNotice.demandAmount)}</p>
                </div>
              </div>

              {/* Assigned CA Lead */}
              <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    CA
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-teal-950">Assigned Advocate / CA: {selectedNotice.assignedExpertName}</h4>
                    <p className="text-[11px] text-teal-800">Specialist in Section 143(1) and 139(9) Rectifications</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Consult AI
                </button>
              </div>

              {/* Progress Timeline */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-4">Case Resolution Timeline</h3>
                <div className="space-y-4">
                  {selectedNotice.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        step.completed ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-900">{step.title}</p>
                          <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
              <p className="text-xs text-slate-400">Select a notice to view resolution details</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">Upload Income Tax Notice</h3>
            <p className="text-xs text-slate-500 mb-6">
              Our AI and CAs will extract the demand particulars and prepare a response.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Section / Type</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  <option value="SECTION_143_1">Section 143(1) - Intimation / Demand Order</option>
                  <option value="SECTION_139_9">Section 139(9) - Defective Return Notice</option>
                  <option value="SECTION_148">Section 148 - Income Escaping Assessment</option>
                  <option value="SECTION_143_2">Section 143(2) - Scrutiny Assessment</option>
                  <option value="SECTION_245">Section 245 - Intimation for Adjustment of Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Identification Number (DIN)</label>
                <input
                  type="text"
                  placeholder="e.g. ITBA/AST/S/143(1)/2024-25/1068..."
                  value={dinNumber}
                  onChange={(e) => setDinNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tax Demand Amount (₹) <span className="text-slate-400 font-normal">(0 if refund intimation)</span></label>
                <input
                  type="number"
                  placeholder="e.g. 18500"
                  value={demandAmount}
                  onChange={(e) => setDemandAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                />
              </div>

              {/* Drag and Drop Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Click to upload notice PDF or drag & drop</p>
                <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 15MB</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                  className="hidden"
                  id="notice-file-input"
                />
                <label
                  htmlFor="notice-file-input"
                  className="inline-block px-3 py-1.5 bg-white border border-slate-300 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 text-slate-700"
                >
                  {fileName ? fileName : 'Choose File'}
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Submit Notice for CA Review</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
