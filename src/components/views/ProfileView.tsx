import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  CreditCard, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidPAN } from '../../lib/utils';

export const ProfileView: React.FC = () => {
  const { user, profile, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phone || '',
    dob: profile?.dob || '1992-06-15',
    gender: profile?.gender || 'MALE',
    pan: profile?.pan || 'ABCDE1234F',
    address: profile?.address || 'Flat 402, Green Glen Heights, Bellandur',
    city: profile?.city || 'Bengaluru',
    state: profile?.state || 'Karnataka',
    pincode: profile?.pincode || '560103',
    bankName: profile?.bankName || 'HDFC Bank',
    accountNumber: profile?.accountNumber || '50100234918231',
    ifscCode: profile?.ifscCode || 'HDFC0001234',
    accountType: profile?.accountType || 'SAVINGS',
    residentialStatus: profile?.residentialStatus || 'RESIDENT',
    employmentType: profile?.employmentType || 'SALARIED',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfile(formData);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const completion = profile?.profileCompletion || 85;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
            Account & Taxpayer Profile
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Personal & Tax Details
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Manage your verified PAN, contact info, and bank account for automated refund credits.
          </p>
        </div>

        {/* Profile Completion Dial */}
        <div className="bg-[#0a484e] p-4 rounded-2xl border border-[#135d66] text-center min-w-[140px]">
          <p className="text-2xl font-black text-teal-300">{completion}%</p>
          <p className="text-[10px] font-bold text-teal-200 uppercase mt-0.5">Profile Completed</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile and Bank information successfully updated!</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        {/* Section 1: Basic & Identity */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Taxpayer Identity & PAN</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Account Number (PAN)</label>
              <input
                type="text"
                maxLength={10}
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase border rounded-xl ${
                  isValidPAN(formData.pan) ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900' : 'border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank Account Details */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            <span>Bank Account Details (For Direct Tax Refund)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                maxLength={11}
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 text-xs font-mono uppercase border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
