import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, ArrowRight, RefreshCw, Sparkles, Check, UserCheck, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTax } from '../../context/TaxContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithOTP, loginWithGoogle } = useAuth();
  const { setActiveTab } = useTax();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('9876543210');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setDevOtpHint(data.devOTP || '123456');
        setStep('OTP');
        setTimer(30);
      } else {
        setErrorMsg(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    const result = await loginWithOTP(phone, otp, name);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await loginWithGoogle('vikram.sharma@example.com', 'Vikramaditya Sharma');
    setIsLoading(false);
  };

  const handleDemoUserLogin = async (role: 'USER' | 'TAX_EXPERT' | 'ADMIN') => {
    setIsLoading(true);
    if (role === 'USER') {
      await loginWithGoogle('vikram.sharma@example.com', 'Vikramaditya Sharma');
      setActiveTab('dashboard');
    } else if (role === 'TAX_EXPERT') {
      await loginWithGoogle('ca.priya@taxwithrohit.com', 'CA Priya Sundaram');
      setActiveTab('expert');
    } else {
      await loginWithGoogle('admin@taxwithrohit.com', 'Rajesh Nair');
      setActiveTab('admin');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="bg-[#07383D] p-6 text-white text-center">
          <div className="w-10 h-10 rounded-xl bg-[#0EB1B1] mx-auto flex items-center justify-center font-bold text-lg text-white shadow-lg mb-2">
            TR
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            TAX<span className="text-[#0EB1B1]">WITHROHIT</span>
          </h3>
          <p className="text-teal-100/80 text-xs mt-1">
            {step === 'PHONE' ? 'Sign in or register to file ITR & manage compliance' : 'Enter 6-digit OTP sent to your phone'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          {/* 1-Click Demo Accounts Selector */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0EB1B1]" />
                <span>Instant 1-Click Demo Logins</span>
              </span>
              <span className="text-[9px] bg-teal-100 text-[#07383D] font-bold px-1.5 py-0.5 rounded">No OTP Needed</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoUserLogin('USER')}
                className="p-2 bg-white hover:bg-teal-50 border border-gray-200 hover:border-[#0EB1B1] rounded-xl text-center transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-teal-50 text-[#0EB1B1] mx-auto flex items-center justify-center mb-1 group-hover:bg-[#0EB1B1] group-hover:text-white transition-colors">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">Taxpayer</p>
                <p className="text-[9px] text-gray-400">Vikram</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoUserLogin('TAX_EXPERT')}
                className="p-2 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-500 rounded-xl text-center transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-1 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">CA Expert</p>
                <p className="text-[9px] text-gray-400">CA Priya</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoUserLogin('ADMIN')}
                className="p-2 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-500 rounded-xl text-center transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-1 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">Admin</p>
                <p className="text-[9px] text-gray-400">Rajesh</p>
              </button>
            </div>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-[10px]"><span className="bg-white px-2 text-gray-400 font-bold uppercase">Or Use Phone Number</span></div>
          </div>

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOTP} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-[#0EB1B1]/30 focus-within:border-[#0EB1B1] overflow-hidden">
                  <span className="bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 border-r border-gray-300 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Full Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikramaditya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0EB1B1]/30 focus:border-[#0EB1B1]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || phone.length < 10}
                className="w-full py-2.5 px-4 bg-[#07383D] hover:bg-[#0a474d] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4 text-[#0EB1B1]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* DEV OTP Helper Badge */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-teal-900 font-semibold">
                  <Sparkles className="w-4 h-4 text-[#0EB1B1]" />
                  <span>Dev OTP: <strong className="font-mono text-[#07383D]">{devOtpHint || '123456'}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtpHint || '123456')}
                  className="px-2 py-1 bg-[#0EB1B1] hover:bg-[#0ca3a3] text-white rounded text-[10px] font-bold"
                >
                  Auto-Fill
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Enter 6-Digit OTP</label>
                  <button
                    type="button"
                    onClick={() => setStep('PHONE')}
                    className="text-[11px] font-semibold text-[#0EB1B1] hover:underline"
                  >
                    Change Number (+91 {phone})
                  </button>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EB1B1] focus:border-[#0EB1B1]"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-2.5 px-4 bg-[#07383D] hover:bg-[#0a474d] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#0EB1B1]" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-[10px] text-center text-gray-400 leading-normal">
            By proceeding, you agree to TaxWithRohit's Terms of Service & Privacy Policy. Data is secured with 256-bit encryption.
          </p>
        </div>
      </div>
    </div>
  );
};
