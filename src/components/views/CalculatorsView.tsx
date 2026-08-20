import React, { useState } from 'react';
import { 
  Calculator as CalcIcon, 
  Home as HomeIcon, 
  Wallet as WalletIcon, 
  TrendingUp as TrendIcon, 
  Building as BuildIcon,
  ArrowRight as ArrowIcon,
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useTax } from '../../context/TaxContext';
import { formatINR, formatLakhsCrores } from '../../lib/utils';
import { calculateOldRegimeTax, calculateNewRegimeTax, calculateHRAExemption } from '../../services/taxEngine';
import { SalaryIncome, OtherIncome, BusinessIncome, ChapterVIA_Deductions } from '../../types';

export const CalculatorsView: React.FC = () => {
  const { setActiveTab } = useTax();
  const [activeCalc, setActiveCalc] = useState<string>('INCOME_TAX');

  // Calculator 1: Income Tax State
  const [taxSalary, setTaxSalary] = useState(1500000);
  const [tax80C, setTax80C] = useState(150000);
  const [tax80D, setTax80D] = useState(25000);
  const [taxNPS, setTaxNPS] = useState(50000);
  const [taxHRA, setTaxHRA] = useState(120000);
  const [taxHomeLoan, setTaxHomeLoan] = useState(100000);

  // Calculator 2: HRA Exemption State
  const [hraBasic, setHraBasic] = useState(600000);
  const [hraReceived, setHraReceived] = useState(240000);
  const [rentPaid, setRentPaid] = useState(300000);
  const [isMetro, setIsMetro] = useState(true);

  // Calculator 3: In-Hand Salary State
  const [ctcAmount, setCtcAmount] = useState(1800000);
  const [ctcRegime, setCtcRegime] = useState<'NEW' | 'OLD'>('NEW');

  // Calculator 4: SIP Wealth State
  const [sipMonthly, setSipMonthly] = useState(15000);
  const [sipReturnRate, setSipReturnRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // Calculator 5: Home Loan EMI State
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [loanInterestRate, setLoanInterestRate] = useState(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState(20);

  // Helper structures
  const dummySalary: SalaryIncome = {
    employerName: 'Company Inc',
    basicSalary: taxSalary * 0.5,
    hra: taxHRA,
    specialAllowance: taxSalary * 0.3,
    lta: 0,
    grossSalary: taxSalary,
    standardDeduction: 50000,
    professionalTax: 2400,
    tdsDeducted: 0,
  };

  const dummyOther: OtherIncome = {
    savingsInterest: 10000,
    fdInterest: 0,
    dividendIncome: 0,
    rentalIncome: 0,
    homeLoanInterestLetOut: 0,
    otherSources: 0,
  };

  const dummyBiz: BusinessIncome = {
    businessName: 'Freelance & Consult',
    businessType: 'PRESUMPTIVE_44ADA',
    grossTurnover: 0,
    grossReceipts: 0,
    declaredProfit: 0,
    expenses: 0,
    netProfit: 0,
  };

  const dummyDeductions: ChapterVIA_Deductions = {
    sec80C: tax80C,
    sec80CCC: 0,
    sec80CCD1: 0,
    sec80CCD1B: taxNPS,
    sec80CCD2: 0,
    sec80D_Self: tax80D,
    sec80D_Parents: 0,
    sec80E: 0,
    sec80EEA: 0,
    sec80G: 0,
    sec80TTA: 10000,
    sec80TTB: 0,
    sec24b_HomeLoan: taxHomeLoan,
    otherDeductions: 0,
  };

  // Computations
  // 1. Income Tax Old vs New
  const oldTax = calculateOldRegimeTax(dummySalary, dummyOther, dummyBiz, [], dummyDeductions);
  const newTax = calculateNewRegimeTax(dummySalary, dummyOther, dummyBiz, [], dummyDeductions);

  const taxComparisonData = [
    { name: 'Gross Income', OldRegime: taxSalary, NewRegime: taxSalary },
    { name: 'Deductions', OldRegime: oldTax.totalDeductions + 50000, NewRegime: 75000 },
    { name: 'Taxable Income', OldRegime: oldTax.taxableIncome, NewRegime: newTax.taxableIncome },
    { name: 'Net Tax', OldRegime: oldTax.totalTaxLiability, NewRegime: newTax.totalTaxLiability },
  ];

  // 2. HRA Exemption
  const hraExemption = calculateHRAExemption(hraBasic, hraReceived, rentPaid, isMetro);
  const taxableHRA = Math.max(0, hraReceived - hraExemption);

  // 3. In-Hand Salary
  const monthlyCTC = ctcAmount / 12;
  const employeePFMonthly = Math.min((ctcAmount * 0.4) / 12 * 0.12, 1800);
  const monthlyPT = 200;
  
  const ctcSalaryObj: SalaryIncome = { ...dummySalary, grossSalary: ctcAmount, basicSalary: ctcAmount * 0.5 };
  const annualTax = ctcRegime === 'NEW' 
    ? calculateNewRegimeTax(ctcSalaryObj, dummyOther, dummyBiz, [], dummyDeductions).totalTaxLiability 
    : calculateOldRegimeTax(ctcSalaryObj, dummyOther, dummyBiz, [], dummyDeductions).totalTaxLiability;
  const monthlyTDS = annualTax / 12;
  const monthlyInHand = Math.max(0, monthlyCTC - employeePFMonthly - monthlyPT - monthlyTDS);

  // 4. SIP Wealth
  const totalMonths = sipYears * 12;
  const monthlyRate = sipReturnRate / 12 / 100;
  const totalInvestment = sipMonthly * totalMonths;
  const futureValue = sipMonthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  const estimatedReturns = Math.max(0, futureValue - totalInvestment);

  const sipPieData = [
    { name: 'Invested Amount', value: Math.round(totalInvestment), color: '#00A389' },
    { name: 'Est. Capital Gains', value: Math.round(estimatedReturns), color: '#7C3AED' },
  ];

  // 5. Home Loan EMI
  const monthlyLoanRate = loanInterestRate / 12 / 100;
  const totalLoanMonths = loanTenureYears * 12;
  const monthlyEMI = (loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, totalLoanMonths)) / (Math.pow(1 + monthlyLoanRate, totalLoanMonths) - 1);
  const totalLoanPayment = monthlyEMI * totalLoanMonths;
  const totalLoanInterest = totalLoanPayment - loanAmount;

  const calculatorsList = [
    { id: 'INCOME_TAX', label: 'Income Tax (Old vs New)', icon: CalcIcon },
    { id: 'HRA', label: 'HRA Exemption', icon: HomeIcon },
    { id: 'IN_HAND', label: 'Take-Home Salary', icon: WalletIcon },
    { id: 'SIP', label: 'SIP & Wealth Growth', icon: TrendIcon },
    { id: 'HOME_LOAN', label: 'Home Loan & Tax Benefit', icon: BuildIcon },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
            Financial Planning & Simulation Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Indian Income Tax & Wealth Calculators
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Simulate your tax liabilities under the latest Budget 2024-25 provisions, compute exact HRA exemptions under Rule 2A, calculate take-home salary, and plan Section 80C investments.
          </p>
        </div>
      </div>

      {/* Calculator Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {calculatorsList.map((calc) => {
          const Icon = calc.icon;
          return (
            <button
              key={calc.id}
              onClick={() => setActiveCalc(calc.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCalc === calc.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{calc.label}</span>
            </button>
          );
        })}
      </div>

      {/* CALCULATOR 1: INCOME TAX (OLD VS NEW) */}
      {activeCalc === 'INCOME_TAX' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Income Tax Calculator (AY 2025-26)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare tax slabs under Section 115BAC (New) vs traditional Old Regime with 80C, 80D & HRA.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Gross Annual Salary (₹)</label>
                  <span className="text-sm font-black text-slate-900">{formatINR(taxSalary)}</span>
                </div>
                <input
                  type="range"
                  min={300000}
                  max={5000000}
                  step={50000}
                  value={taxSalary}
                  onChange={(e) => setTaxSalary(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Section 80C (PPF/ELSS)</span>
                    <span>{formatINR(tax80C)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150000}
                    step={10000}
                    value={tax80C}
                    onChange={(e) => setTax80C(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Section 80CCD(1B) NPS</span>
                    <span>{formatINR(taxNPS)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50000}
                    step={5000}
                    value={taxNPS}
                    onChange={(e) => setTaxNPS(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Section 80D Health Insurance</span>
                    <span>{formatINR(tax80D)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={75000}
                    step={5000}
                    value={tax80D}
                    onChange={(e) => setTax80D(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>HRA Exemption Claimed</span>
                    <span>{formatINR(taxHRA)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={300000}
                    step={10000}
                    value={taxHRA}
                    onChange={(e) => setTaxHRA(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Visual Recharts Bar Comparison */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="font-extrabold text-xs text-slate-900 mb-3 uppercase tracking-wider">
                Old vs New Tax Comparison Chart
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taxComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: any) => [formatINR(Number(value)), '']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="OldRegime" name="Old Tax Regime" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="NewRegime" name="New Tax Regime" fill="#00A389" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Simulation Result</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Tax Recommendation</h3>
              </div>

              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-teal-900">
                    <span>New Tax Regime</span>
                    <span>Std Ded: ₹75,000</span>
                  </div>
                  <p className="text-2xl font-black text-teal-800">{formatINR(newTax.totalTaxLiability)}</p>
                  <p className="text-[11px] text-teal-700">Tax on {formatINR(newTax.taxableIncome)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-purple-900">
                    <span>Old Tax Regime</span>
                    <span>With All 80C/80D</span>
                  </div>
                  <p className="text-2xl font-black text-purple-800">{formatINR(oldTax.totalTaxLiability)}</p>
                  <p className="text-[11px] text-purple-700">Tax on {formatINR(oldTax.taxableIncome)}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">
                    {newTax.totalTaxLiability <= oldTax.totalTaxLiability ? 'New Regime Saves You More!' : 'Old Regime Saves You More!'}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Net Tax Difference: <strong className="text-emerald-600">{formatINR(Math.abs(newTax.totalTaxLiability - oldTax.totalTaxLiability))}</strong>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('itr-filing')}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Apply in ITR Filing</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CALCULATOR 2: HRA EXEMPTION */}
      {activeCalc === 'HRA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">HRA Exemption Calculator (Rule 2A)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Computes the minimum of 3 statutory conditions under Section 10(13A).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Basic Salary + DA (Annual) (₹)</label>
                <input
                  type="number"
                  value={hraBasic}
                  onChange={(e) => setHraBasic(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HRA Received from Employer (Annual) (₹)</label>
                <input
                  type="number"
                  value={hraReceived}
                  onChange={(e) => setHraReceived(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actual Rent Paid (Annual) (₹)</label>
                <input
                  type="number"
                  value={rentPaid}
                  onChange={(e) => setRentPaid(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City Type</label>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMetro(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${isMetro ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Metro (50% Basic)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMetro(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${!isMetro ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Non-Metro (40% Basic)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">HRA Calculation Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Exempt HRA (Tax Free)</span>
                <p className="text-xl font-black text-emerald-700 mt-1">{formatINR(hraExemption)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Taxable HRA</span>
                <p className="text-xl font-black text-slate-900 mt-1">{formatINR(taxableHRA)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 3: TAKE HOME SALARY */}
      {activeCalc === 'IN_HAND' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">In-Hand / Take-Home Salary Calculator</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deducts Employee PF (12%), Professional Tax, and Monthly TDS from Annual Cost-to-Company (CTC).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Annual CTC (₹)</label>
                  <span className="text-sm font-black text-slate-900">{formatINR(ctcAmount)}</span>
                </div>
                <input
                  type="range"
                  min={300000}
                  max={6000000}
                  step={50000}
                  value={ctcAmount}
                  onChange={(e) => setCtcAmount(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tax Regime For TDS</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCtcRegime('NEW')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${ctcRegime === 'NEW' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    New Regime (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCtcRegime('OLD')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${ctcRegime === 'OLD' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Old Regime
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Monthly In-Hand Breakdown</h3>
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
              <span className="text-[10px] font-bold text-teal-800 uppercase">Estimated Monthly Credit</span>
              <p className="text-3xl font-black text-teal-900 mt-1">{formatINR(monthlyInHand)}</p>
              <p className="text-[11px] text-teal-700 mt-1">Direct Bank Deposit Every Month</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Gross CTC</span>
                <span className="font-bold text-slate-900">{formatINR(monthlyCTC)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Employee PF (12%)</span>
                <span className="font-bold text-red-600">-{formatINR(employeePFMonthly)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Professional Tax</span>
                <span className="font-bold text-red-600">-{formatINR(monthlyPT)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Monthly TDS</span>
                <span className="font-bold text-red-600">-{formatINR(monthlyTDS)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 4: SIP & WEALTH */}
      {activeCalc === 'SIP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">SIP Mutual Fund Wealth Estimator</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate compounding returns on monthly mutual fund SIPs (ELSS tax saving / index funds).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Monthly Investment</span>
                  <span>{formatINR(sipMonthly)}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Expected Annual Return Rate (%)</span>
                  <span>{sipReturnRate}%</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={25}
                  step={0.5}
                  value={sipReturnRate}
                  onChange={(e) => setSipReturnRate(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Time Horizon (Years)</span>
                  <span>{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Maturity Wealth Value</h3>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-center">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Total Corpus</span>
              <p className="text-3xl font-black text-purple-900 mt-1">{formatLakhsCrores(futureValue)}</p>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sipPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                    {sipPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Invested</span>
                <span className="font-bold text-slate-900">{formatINR(totalInvestment)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Est. Capital Gains</span>
                <span className="font-bold text-teal-700">+{formatINR(estimatedReturns)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR 5: HOME LOAN EMI */}
      {activeCalc === 'HOME_LOAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Home Loan EMI & Section 24(b) Tax Deductions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate monthly loan payments and eligible tax benefits under Section 24(b) (₹2 Lakhs) and Section 80C (Principal).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Loan Principal Amount (₹)</span>
                  <span>{formatLakhsCrores(loanAmount)}</span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={20000000}
                  step={200000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Interest Rate (% P.A.)</span>
                  <span>{loanInterestRate}%</span>
                </div>
                <input
                  type="range"
                  min={6.5}
                  max={14}
                  step={0.1}
                  value={loanInterestRate}
                  onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Tenure (Years)</span>
                  <span>{loanTenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Monthly EMI</h3>
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-center">
              <span className="text-[10px] font-bold text-teal-800 uppercase">Monthly EMI</span>
              <p className="text-3xl font-black text-teal-900 mt-1">{formatINR(monthlyEMI)}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sec 24(b) Max Interest Deduction</span>
                <span className="font-bold text-teal-700">₹2,00,000 / Year</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sec 80C Principal Deduction</span>
                <span className="font-bold text-teal-700">Up to ₹1,50,000</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Interest Payable</span>
                <span className="font-bold text-slate-900">{formatLakhsCrores(totalLoanInterest)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
