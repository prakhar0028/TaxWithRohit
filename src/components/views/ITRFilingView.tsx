import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Building, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Calculator,
  RefreshCw,
  Zap,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useTax } from '../../context/TaxContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, isValidPAN } from '../../lib/utils';
import { compareTaxRegimes } from '../../services/taxEngine';

const STEPS = [
  { id: 1, title: 'Personal & Bank', icon: User },
  { id: 2, title: 'Salary & Form 16', icon: Building },
  { id: 3, title: 'Other & Business', icon: Layers },
  { id: 4, title: 'Capital Gains', icon: TrendingUp },
  { id: 5, title: 'Deductions (80C)', icon: ShieldCheck },
  { id: 6, title: 'Tax Computation', icon: Calculator },
  { id: 7, title: 'CA Verification', icon: CheckCircle2 },
];

export const ITRFilingView: React.FC = () => {
  const { user } = useAuth();
  const { 
    itrRecord, 
    setItrRecord, 
    updateITRState, 
    assessmentYear, 
    documents, 
    uploadDocument,
    setIsAIAssistantOpen 
  } = useTax();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionAck, setSubmissionAck] = useState<string | null>(itrRecord?.ackNumber || null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Form states initialized with existing ITR record or standard demo figures
  const [personalData, setPersonalData] = useState({
    fullName: user?.name || 'Vikramaditya Sharma',
    pan: 'ABCDE1234F',
    dob: '1992-06-15',
    gender: 'MALE',
    email: user?.email || 'vikram.sharma@example.com',
    phone: user?.phone || '9876543210',
    address: 'Flat 402, Green Glen Heights, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    bankName: 'HDFC Bank',
    accountNumber: '50100234918231',
    ifscCode: 'HDFC0001234',
    accountType: 'SAVINGS',
  });

  const [salaryData, setSalaryData] = useState(
    itrRecord?.salaryIncome || {
      employerName: 'Infosys Limited',
      grossSalary: 1450000,
      basicSalary: 650000,
      hra: 240000,
      specialAllowance: 485000,
      lta: 75000,
      standardDeduction: 75000,
      professionalTax: 2400,
      tdsDeducted: 98000,
    }
  );

  const [otherData, setOtherData] = useState(
    itrRecord?.otherIncome || {
      savingsInterest: 14500,
      fdInterest: 32000,
      dividendIncome: 8500,
      rentalIncome: 0,
      homeLoanInterestLetOut: 0,
      otherSources: 0,
    }
  );

  const [businessData, setBusinessData] = useState(
    itrRecord?.businessIncome || {
      businessName: '',
      businessType: 'PRESUMPTIVE_44AD' as const,
      grossTurnover: 0,
      grossReceipts: 0,
      declaredProfit: 0,
      expenses: 0,
      netProfit: 0,
    }
  );

  const [deductionsData, setDeductionsData] = useState(
    itrRecord?.deductions || {
      sec80C: 150000,
      sec80CCC: 0,
      sec80CCD1: 0,
      sec80CCD1B: 50000,
      sec80CCD2: 0,
      sec80D_Self: 25000,
      sec80D_Parents: 25000,
      sec80E: 0,
      sec80EEA: 0,
      sec80G: 10000,
      sec80TTA: 10000,
      sec80TTB: 0,
      sec24b_HomeLoan: 120000,
      otherDeductions: 0,
    }
  );

  const [selectedRegime, setSelectedRegime] = useState<'OLD' | 'NEW'>(itrRecord?.selectedRegime || 'NEW');

  // Compute taxes on the fly
  const comparison = compareTaxRegimes(
    salaryData,
    otherData,
    businessData,
    itrRecord?.capitalGains || [],
    deductionsData
  );

  const isOldBetter = comparison.oldRegime.totalTaxLiability < comparison.newRegime.totalTaxLiability;
  const recommendedRegime = isOldBetter ? 'OLD' : 'NEW';

  // Handle Form 16 Auto-Fill simulation
  const handleAutoFillForm16 = () => {
    setSalaryData({
      employerName: 'Tata Consultancy Services',
      grossSalary: 1680000,
      basicSalary: 720000,
      hra: 280000,
      specialAllowance: 600000,
      lta: 80000,
      standardDeduction: 75000,
      professionalTax: 2400,
      tdsDeducted: 145000,
    });
    setDeductionsData(prev => ({
      ...prev,
      sec80C: 150000,
      sec80CCD1B: 50000,
      sec80D_Self: 25000,
    }));
  };

  const handleNextStep = () => {
    // Save draft state to context & backend
    updateITRState({
      salaryIncome: salaryData,
      otherIncome: otherData,
      businessIncome: businessData,
      deductions: deductionsData,
      selectedRegime,
      progressPercent: Math.min(100, currentStep * 15 + 10),
    });

    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmitPrep = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/itr/${itrRecord?.id || 'itr_demo_101'}/submit-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_demo_101',
        },
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionAck(data.ackNumber);
        setIsSuccessModalOpen(true);
        updateITRState({
          status: 'READY_TO_SUBMIT',
          progressPercent: 100,
          ackNumber: data.ackNumber,
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Header & AY Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              ITR Return Preparation Wizard
            </h1>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-0.5 rounded-full">
              AY {assessmentYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Form ITR-1 / ITR-2 / ITR-4. Auto-validation under Income Tax Act, 1961 rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>AI Tax Helper</span>
          </button>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-x-auto custom-scrollbar">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isDone = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-teal-600 text-white shadow-xs'
                      : isDone
                      ? 'text-teal-700 hover:bg-teal-50'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    isCurrent ? 'bg-white text-teal-800' : isDone ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span className="whitespace-nowrap">{s.title}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 min-w-[16px] ${isDone ? 'bg-teal-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* ---------------------------------------------------- */}
          {/* STEP 1: Personal & Bank Details */}
          {/* ---------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-black text-slate-900">Personal & Bank Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory details for PAN verification & Income Tax Department e-filing records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (As per PAN)</label>
                  <input
                    type="text"
                    value={personalData.fullName}
                    onChange={(e) => setPersonalData({ ...personalData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Account Number (PAN)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={personalData.pan}
                    onChange={(e) => setPersonalData({ ...personalData, pan: e.target.value.toUpperCase() })}
                    className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase border rounded-xl focus:ring-2 ${
                      isValidPAN(personalData.pan) ? 'border-emerald-500 text-emerald-900 bg-emerald-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={personalData.dob}
                    onChange={(e) => setPersonalData({ ...personalData, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={personalData.gender}
                    onChange={(e) => setPersonalData({ ...personalData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={personalData.address}
                    onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={personalData.city}
                    onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={personalData.pincode}
                    onChange={(e) => setPersonalData({ ...personalData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Bank Account for Tax Refund */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Bank Account for Income Tax Refund</h3>
                  <p className="text-[11px] text-slate-500">Refunds are credited directly via ECS / NACH into this verified account.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={personalData.bankName}
                      onChange={(e) => setPersonalData({ ...personalData, bankName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={personalData.accountNumber}
                      onChange={(e) => setPersonalData({ ...personalData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={personalData.ifscCode}
                      onChange={(e) => setPersonalData({ ...personalData, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 2: Salary Income & Form 16 */}
          {/* ---------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Salary Income & Form 16</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter details from Part B of your Form 16 or use quick auto-fill.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillForm16}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  <span>Auto-Fill Sample Form 16</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employer / Company Name</label>
                  <input
                    type="text"
                    value={salaryData.employerName}
                    onChange={(e) => setSalaryData({ ...salaryData, employerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gross Annual Salary (₹)</label>
                  <input
                    type="number"
                    value={salaryData.grossSalary}
                    onChange={(e) => setSalaryData({ ...salaryData, grossSalary: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Basic Salary (₹)</label>
                  <input
                    type="number"
                    value={salaryData.basicSalary}
                    onChange={(e) => setSalaryData({ ...salaryData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">House Rent Allowance (HRA) (₹)</label>
                  <input
                    type="number"
                    value={salaryData.hra}
                    onChange={(e) => setSalaryData({ ...salaryData, hra: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special / Other Allowances (₹)</label>
                  <input
                    type="number"
                    value={salaryData.specialAllowance}
                    onChange={(e) => setSalaryData({ ...salaryData, specialAllowance: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Professional Tax (Sec 16(iii)) (₹)</label>
                  <input
                    type="number"
                    value={salaryData.professionalTax}
                    onChange={(e) => setSalaryData({ ...salaryData, professionalTax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TDS Deducted by Employer (₹)</label>
                  <input
                    type="number"
                    value={salaryData.tdsDeducted}
                    onChange={(e) => setSalaryData({ ...salaryData, tdsDeducted: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold text-teal-800 bg-teal-50/40 border border-teal-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Standard Deduction Notice */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900">Standard Deduction (Section 16(ia)):</span>
                  <p className="text-slate-500 mt-0.5">
                    Automatically applied: <strong className="text-teal-700">₹75,000</strong> under New Regime, <strong className="text-teal-700">₹50,000</strong> under Old Regime.
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 3: Other Sources & Business */}
          {/* ---------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-black text-slate-900">Income from Other Sources & Business</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Savings bank interest, Fixed deposits, Dividends, and Presumptive Business profits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Savings Bank Account Interest (₹)</label>
                  <input
                    type="number"
                    value={otherData.savingsInterest}
                    onChange={(e) => setOtherData({ ...otherData, savingsInterest: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400">Exempt up to ₹10,000 under Sec 80TTA (Old regime)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">FD & Recurring Deposit Interest (₹)</label>
                  <input
                    type="number"
                    value={otherData.fdInterest}
                    onChange={(e) => setOtherData({ ...otherData, fdInterest: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dividend Income (₹)</label>
                  <input
                    type="number"
                    value={otherData.dividendIncome}
                    onChange={(e) => setOtherData({ ...otherData, dividendIncome: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rental Income from Let-out Property (₹)</label>
                  <input
                    type="number"
                    value={otherData.rentalIncome}
                    onChange={(e) => setOtherData({ ...otherData, rentalIncome: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Presumptive Business Toggle */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Freelance / Presumptive Business (Sec 44AD / 44ADA)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gross Receipts / Turnover (₹)</label>
                    <input
                      type="number"
                      value={businessData.grossTurnover}
                      onChange={(e) => setBusinessData({ ...businessData, grossTurnover: Number(e.target.value) })}
                      placeholder="0 if none"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Declared Net Profit (₹)</label>
                    <input
                      type="number"
                      value={businessData.declaredProfit}
                      onChange={(e) => setBusinessData({ ...businessData, declaredProfit: Number(e.target.value) })}
                      placeholder="0 if none"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 4: Capital Gains */}
          {/* ---------------------------------------------------- */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-black text-slate-900">Capital Gains from Stocks & Mutual Funds</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated as per latest Budget 2024 revisions (STCG @ 20%, LTCG @ 12.5% with ₹1.25 Lakhs annual exemption).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Short Term Capital Gains (STCG - 111A)</span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">20% Tax</span>
                  </div>
                  <input
                    type="number"
                    defaultValue={45000}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-slate-400">Gains on listed equity shares held for ≤ 12 months</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Long Term Capital Gains (LTCG - 112A)</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">12.5% Tax</span>
                  </div>
                  <input
                    type="number"
                    defaultValue={180000}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-slate-400">₹1,25,000 is tax exempt. Remaining ₹55,000 taxed @ 12.5%</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <p className="text-xs text-purple-900 leading-relaxed">
                  <strong>Brokerage Statement Import:</strong> You can upload your Zerodha, Groww, Upstox, or CAMS Capital Gains Excel sheet in Step 7 for direct trade parsing.
                </p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 5: Chapter VI-A Deductions */}
          {/* ---------------------------------------------------- */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-black text-slate-900">Chapter VI-A Tax Deductions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applicable under the Old Tax Regime. Enter eligible investments and expenses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Section 80C (EPF, PPF, ELSS, LIC) (₹)</label>
                    <span className="text-[10px] font-bold text-slate-400">Max ₹1,50,000</span>
                  </div>
                  <input
                    type="number"
                    value={deductionsData.sec80C}
                    onChange={(e) => setDeductionsData({ ...deductionsData, sec80C: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Section 80CCD(1B) - NPS (₹)</label>
                    <span className="text-[10px] font-bold text-teal-700">Additional ₹50,000</span>
                  </div>
                  <input
                    type="number"
                    value={deductionsData.sec80CCD1B}
                    onChange={(e) => setDeductionsData({ ...deductionsData, sec80CCD1B: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Section 80D - Health Insurance (Self/Family)</label>
                    <span className="text-[10px] font-bold text-slate-400">Max ₹25,000</span>
                  </div>
                  <input
                    type="number"
                    value={deductionsData.sec80D_Self}
                    onChange={(e) => setDeductionsData({ ...deductionsData, sec80D_Self: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Section 80D - Parents Health Insurance</label>
                    <span className="text-[10px] font-bold text-slate-400">Max ₹50,000 (Senior)</span>
                  </div>
                  <input
                    type="number"
                    value={deductionsData.sec80D_Parents}
                    onChange={(e) => setDeductionsData({ ...deductionsData, sec80D_Parents: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Section 24(b) - Home Loan Interest</label>
                    <span className="text-[10px] font-bold text-slate-400">Max ₹2,00,000</span>
                  </div>
                  <input
                    type="number"
                    value={deductionsData.sec24b_HomeLoan}
                    onChange={(e) => setDeductionsData({ ...deductionsData, sec24b_HomeLoan: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Section 80G - Charitable Donations</label>
                    <span className="text-[10px] font-bold text-slate-400">50% or 100% eligible</span>
                  </div>
                  <input
                    type="number"
                    value={deductionsData.sec80G}
                    onChange={(e) => setDeductionsData({ ...deductionsData, sec80G: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 6: Tax Computation & Regime Selection */}
          {/* ---------------------------------------------------- */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-black text-slate-900">Tax Computation & Regime Choice</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side comparative analysis computed by the TaxWithRohit Engine.
                </p>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Old Regime Card */}
                <div 
                  onClick={() => setSelectedRegime('OLD')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRegime === 'OLD' 
                      ? 'border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-600/20' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-extrabold text-slate-900 text-sm">OLD TAX REGIME</span>
                    {recommendedRegime === 'OLD' && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{formatINR(comparison.oldRegime.totalTaxLiability)}</p>
                  <p className="text-xs text-slate-500 mt-1">Tax on Taxable Income of {formatINR(comparison.oldRegime.taxableIncome)}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Deductions Claimed</span>
                      <strong className="text-teal-700">{formatINR(comparison.oldRegime.totalDeductions)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>TDS Credited</span>
                      <span>{formatINR(salaryData.tdsDeducted)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-dashed border-slate-200 text-slate-900">
                      <span>{comparison.oldRegime.refundOrPayable === 'REFUND' ? 'Estimated Refund' : 'Net Tax Payable'}</span>
                      <span className={comparison.oldRegime.refundOrPayable === 'REFUND' ? 'text-emerald-700' : 'text-slate-900'}>
                        {formatINR(comparison.oldRegime.balanceAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* New Regime Card */}
                <div 
                  onClick={() => setSelectedRegime('NEW')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedRegime === 'NEW' 
                      ? 'border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-600/20' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-extrabold text-slate-900 text-sm">NEW TAX REGIME (Sec 115BAC)</span>
                    {recommendedRegime === 'NEW' && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{formatINR(comparison.newRegime.totalTaxLiability)}</p>
                  <p className="text-xs text-slate-500 mt-1">Tax on Taxable Income of {formatINR(comparison.newRegime.taxableIncome)}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Std Deduction Claimed</span>
                      <strong className="text-teal-700">{formatINR(75000)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>TDS Credited</span>
                      <span>{formatINR(salaryData.tdsDeducted)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-dashed border-slate-200 text-slate-900">
                      <span>{comparison.newRegime.refundOrPayable === 'REFUND' ? 'Estimated Refund' : 'Net Tax Payable'}</span>
                      <span className={comparison.newRegime.refundOrPayable === 'REFUND' ? 'text-emerald-700' : 'text-slate-900'}>
                        {formatINR(comparison.newRegime.balanceAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-teal-950">You have selected: <strong className="uppercase">{selectedRegime} Tax Regime</strong></p>
                  <p className="text-[11px] text-teal-800/80 mt-0.5">
                    {selectedRegime === recommendedRegime 
                      ? `Great choice! This saves you ₹${Math.abs(comparison.oldRegime.totalTaxLiability - comparison.newRegime.totalTaxLiability).toLocaleString('en-IN')} in tax.` 
                      : 'Note: The other regime offers lower tax liability based on your deductions.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 7: CA Verification & Submit Preparation */}
          {/* ---------------------------------------------------- */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-black text-slate-900">Chartered Accountant Review & Final Preparation</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your return is assigned to an in-house CA for double verification before e-filing.
                </p>
              </div>

              {/* CA Badge */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    CA
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">CA Priya Sundaram (FCA, DISA)</h3>
                    <p className="text-xs text-slate-500">Senior Tax Lead • ICAI M.No 412891</p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-0.5">✓ 99.8% Accuracy Record</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                  Audit Sign-Off Ready
                </span>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>PAN ABCDE1234F verified with NSDL Income Tax Database</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Form 26AS & AIS/TIS Tax Credits matched with TDS Deducted</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Standard Deduction and Section 80C caps verified</span>
                </div>
              </div>

              {/* Final Preparation CTA */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleFinalSubmitPrep}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Prepare ITR Return & Generate Acknowledgement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Form Wizard Navigation Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            {currentStep < 7 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Tax Summary Widget (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Live Tax Meter</span>
              <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                AY {assessmentYear}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Gross Income</span>
                <span className="font-bold text-slate-800">{formatINR(salaryData.grossSalary + otherData.savingsInterest + otherData.fdInterest + otherData.dividendIncome)}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Deductions ({selectedRegime} Regime)</span>
                <span className="font-bold text-teal-700">
                  -{formatINR(selectedRegime === 'OLD' ? comparison.oldRegime.totalDeductions : 75000)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Taxable Income</span>
                <span className="font-bold text-slate-900">
                  {formatINR(selectedRegime === 'OLD' ? comparison.oldRegime.taxableIncome : comparison.newRegime.taxableIncome)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700">Calculated Tax</span>
                <span className="text-lg font-black text-slate-900">
                  {formatINR(selectedRegime === 'OLD' ? comparison.oldRegime.totalTaxLiability : comparison.newRegime.totalTaxLiability)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>TDS Paid</span>
                <span className="font-bold text-slate-800">{formatINR(salaryData.tdsDeducted)}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center font-bold">
                <span className="text-xs text-slate-700">
                  {(selectedRegime === 'OLD' ? comparison.oldRegime.refundOrPayable : comparison.newRegime.refundOrPayable) === 'REFUND' ? 'Refund Due' : 'Balance Payable'}
                </span>
                <span className="text-sm text-teal-800 font-extrabold">
                  {formatINR(selectedRegime === 'OLD' ? comparison.oldRegime.balanceAmount : comparison.newRegime.balanceAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Assistance Card */}
          <div className="bg-[#07383D] rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <h4 className="text-xs font-bold">Need Help with Deductions?</h4>
            </div>
            <p className="text-[11px] text-teal-100 leading-relaxed">
              Ask our AI tax bot or schedule a quick call with your assigned CA.
            </p>
            <button
              type="button"
              onClick={() => setIsAIAssistantOpen(true)}
              className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-[#07383D] font-extrabold text-xs rounded-xl transition-colors shadow-xs"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS SUBMISSION MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-slate-900">ITR Return Draft Ready!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your Income Tax Return computation for Assessment Year {assessmentYear} has been generated and validated by our tax engine.
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-800">
              Ack No: {submissionAck || 'ITR-V-2025-883921098'}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
