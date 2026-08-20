import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  PiggyBank, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTax } from '../../context/TaxContext';
import { formatINR } from '../../lib/utils';

export const InvestmentsView: React.FC = () => {
  const { investments, refreshInvestments, setIsAIAssistantOpen, setActiveTab } = useTax();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New investment form
  const [category, setCategory] = useState('ELSS');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [taxSection, setTaxSection] = useState('80C');

  const totalInvested = investments.reduce((acc, i) => acc + i.investedAmount, 0);
  const totalCurrentValue = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalTaxSaved = investments.reduce((acc, i) => acc + i.taxSavingAchieved, 0);

  // 80C Gap analysis
  const sec80CInvested = investments
    .filter(i => i.taxSection === '80C')
    .reduce((acc, i) => acc + i.investedAmount, 0);
  const sec80CLimit = 150000;
  const sec80CGap = Math.max(0, sec80CLimit - sec80CInvested);

  // Pie chart data by category
  const categoryMap: { [k: string]: number } = {};
  investments.forEach(i => {
    categoryMap[i.category] = (categoryMap[i.category] || 0) + i.investedAmount;
  });

  const COLORS = ['#00A389', '#7C3AED', '#2563EB', '#F59E0B', '#10B981', '#EC4899'];
  const pieData = Object.keys(categoryMap).map((cat, idx) => ({
    name: cat,
    value: categoryMap[cat],
    color: COLORS[idx % COLORS.length],
  }));

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: name || `${category} Investment Plan`,
          investedAmount: Number(amount) || 25000,
          currentValue: (Number(amount) || 25000) * 1.08,
          taxSection,
          taxSavingAchieved: (Number(amount) || 25000) * 0.3,
          growthPercent: 12.5,
          frequency: 'ONE_TIME',
        }),
      });
      refreshInvestments();
      setIsAddModalOpen(false);
      setName('');
      setAmount('');
    } catch (err) {
      console.error('Failed to add investment:', err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
            Portfolio & 80C Optimizer
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tax-Saving Investments & Wealth Tracker
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Track Section 80C, 80CCD(1B) NPS, and 80D health policies. Identify remaining deduction headroom to maximize annual tax savings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-[#07383D] font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Investment</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Portfolio Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalCurrentValue)}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
            +{(totalCurrentValue - totalInvested > 0 ? (totalCurrentValue - totalInvested) / totalInvested * 100 : 0).toFixed(1)}% All-time Gain
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Annual Tax Saved Legally</p>
          <p className="text-2xl font-black text-teal-700 mt-1">{formatINR(totalTaxSaved)}</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Saved across 80C, 80D & NPS</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">80C Limit Utilization</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(sec80CInvested)} / {formatINR(sec80CLimit)}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {sec80CGap > 0 ? `₹${sec80CGap.toLocaleString('en-IN')} remaining capacity` : '✓ 100% 80C Limit Exhausted'}
          </p>
        </div>
      </div>

      {/* 80C Gap Analyzer Callout */}
      {sec80CGap > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-extrabold text-amber-950">Section 80C Tax-Saving Opportunity</p>
              <p className="text-amber-800 mt-0.5">
                You have <strong>{formatINR(sec80CGap)}</strong> unutilized limit in Section 80C. Investing in ELSS Tax-Saver Funds or PPF before March 31 can save you up to <strong>{formatINR(sec80CGap * 0.3)}</strong> in tax.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Get AI Recommendations
          </button>
        </div>
      )}

      {/* Portfolio Breakdown & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Active Tax Saving Assets</h3>
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {investments.map((inv) => (
              <div key={inv.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{inv.name}</span>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                      Sec {inv.taxSection}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Category: {inv.category} • {inv.frequency}</p>
                </div>

                <div className="text-right">
                  <span className="font-black text-slate-900">{formatINR(inv.currentValue)}</span>
                  <p className="text-[10px] text-teal-700 font-bold mt-0.5">Saved {formatINR(inv.taxSavingAchieved)} Tax</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Pie Chart (1 Col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">Asset Allocation</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatINR(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {pieData.map((p, i) => (
              <div key={i} className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatINR(p.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Investment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-1">Add Tax Saving Investment</h3>
            <p className="text-xs text-slate-500 mb-6">Log EPF, PPF, ELSS, NPS, or Health Insurance.</p>

            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  <option value="ELSS">ELSS Mutual Funds (80C)</option>
                  <option value="PPF">Public Provident Fund (PPF - 80C)</option>
                  <option value="EPF">Employee Provident Fund (EPF - 80C)</option>
                  <option value="NPS">National Pension Scheme (80CCD1B)</option>
                  <option value="HEALTH_INSURANCE">Health Insurance (80D)</option>
                  <option value="TERM_INSURANCE">Term Life Insurance (80C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheme / Policy Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mirae Asset ELSS Tax Saver Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invested Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
