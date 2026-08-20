import React from 'react';
import { 
  FileText, 
  AlertTriangle, 
  PhoneCall, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Calendar,
  Layers,
  FileCheck2,
  HelpCircle,
  Building2,
  Users,
  Download,
  AlertCircle,
  Calculator,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTax } from '../../context/TaxContext';
import { formatINR } from '../../lib/utils';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { 
    setActiveTab, 
    setSelectedServiceSlug, 
    itrRecord, 
    notices, 
    services, 
    assessmentYear,
    setIsAIAssistantOpen 
  } = useTax();

  const isOldRegimeBetter = (itrRecord?.calculatedTaxOld.totalTaxLiability || 0) < (itrRecord?.calculatedTaxNew.totalTaxLiability || 0);
  const bestTax = isOldRegimeBetter 
    ? (itrRecord?.calculatedTaxOld.totalTaxLiability || 0) 
    : (itrRecord?.calculatedTaxNew.totalTaxLiability || 0);

  const pendingNoticesCount = notices.filter(n => n.status !== 'RESOLVED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* 1. Welcome & Primary Action Section (Clean Minimalism) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07383D] tracking-tight">
              Welcome to TaxWithRohit, {user?.name?.split(' ')[0] || 'Ananya'}!
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              What Do You Want To Do Today?
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-xs font-semibold text-[#07383D]">
            <Sparkles className="w-3.5 h-3.5 text-[#0EB1B1]" />
            <span>AY {assessmentYear} E-Filing Open</span>
          </div>
        </div>

        {/* 4 Primary Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Plan Your Taxes */}
          <div 
            onClick={() => setActiveTab('investments')}
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-teal-50 text-[#0EB1B1] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#0EB1B1] group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Plan Your Taxes</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Estimate tax savings & optimize 80C/80D for AY {assessmentYear}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-[#0EB1B1]">
              <span>Optimize Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: ITR Filing */}
          <div 
            onClick={() => setActiveTab('itr-filing')}
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">ITR Filing</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Fast e-filing with auto-fetch & dedicated CA review
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>{itrRecord?.progressPercent || 65}% Completed</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Notice Compliance */}
          <div 
            onClick={() => setActiveTab('tax-notices')}
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Notice Compliance</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Expert resolution for 143(1), 139(9), 148 notices
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center justify-between text-xs font-bold text-red-500">
              <span>{pendingNoticesCount > 0 ? `${pendingNoticesCount} Active` : 'Cloud Vault'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Calculators */}
          <div 
            onClick={() => setActiveTab('calculators')}
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#1A1A1A]">Calculators</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Old vs New regime, HRA exemption & take-home salary
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-orange-500">
              <span>Simulate Slabs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Filing Status & Regime Comparison (Clean Minimalist Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Filing Status Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-[#0EB1B1] uppercase tracking-wider">
                  Active Tax Return Draft
                </span>
                <h3 className="text-lg font-bold text-[#07383D]">
                  ITR-1 (Sahaj) • Assessment Year {assessmentYear}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-[#07383D] border border-teal-100">
                In Progress
              </span>
            </div>

            {/* Steps Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Progress</span>
                <span className="font-bold text-[#07383D]">{itrRecord?.progressPercent || 65}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0EB1B1] h-full rounded-full transition-all duration-500"
                  style={{ width: `${itrRecord?.progressPercent || 65}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Gross Income</p>
                <p className="text-sm font-bold text-[#07383D] mt-0.5">
                  {formatINR(itrRecord?.grossTotalIncome || 1450000)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Total Deductions</p>
                <p className="text-sm font-bold text-[#0EB1B1] mt-0.5">
                  {formatINR(itrRecord?.totalDeductions || 225000)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-gray-400">Net Tax Liability</p>
                <p className="text-sm font-bold text-[#07383D] mt-0.5">
                  {formatINR(bestTax || 124800)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
            <span className="text-gray-400">Form 16 verified with 26AS matching</span>
            <button
              onClick={() => setActiveTab('itr-filing')}
              className="font-bold text-[#0EB1B1] hover:text-[#07383D] flex items-center gap-1 transition-colors"
            >
              <span>Continue Filing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Old vs New Regime Widget */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comparison</span>
              <h3 className="font-bold text-base text-[#07383D] mt-0.5">Regime Advisor</h3>
            </div>

            <div className="space-y-3 pt-3">
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#07383D]">New Regime (115BAC)</p>
                  <p className="text-[11px] text-gray-500">Std. Ded: ₹75,000</p>
                </div>
                <span className="text-sm font-bold text-[#07383D]">
                  {formatINR(itrRecord?.calculatedTaxNew.totalTaxLiability || 124800)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-700">Old Regime</p>
                  <p className="text-[11px] text-gray-400">With 80C & HRA</p>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {formatINR(itrRecord?.calculatedTaxOld.totalTaxLiability || 148200)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
            <p className="font-bold text-[#07383D]">
              Recommendation: {isOldRegimeBetter ? 'Old Regime' : 'New Regime'}
            </p>
            <p className="text-[11px] text-gray-400">
              You save approx. {formatINR(Math.abs((itrRecord?.calculatedTaxOld.totalTaxLiability || 148200) - (itrRecord?.calculatedTaxNew.totalTaxLiability || 124800)))}
            </p>
          </div>
        </div>
      </div>

      {/* 3. One Stop Compliance Partner (Services Grid matching Clean Minimalism) */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#07383D] flex items-center gap-2">
          <span>Your One Stop Compliance Partner</span>
          <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-wider">
            Services
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Service 1: Corporate TDS */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Corporate</h4>
              <p className="font-bold text-sm text-[#1A1A1A] mb-1">TDS Filing</p>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                Bulk employee tax processing & 24Q/26Q generation
              </p>
            </div>
            <button 
              onClick={() => { setSelectedServiceSlug('tds-filing'); setActiveTab('service-detail'); }}
              className="text-xs font-bold text-[#0EB1B1] hover:underline text-left"
            >
              Explore &rarr;
            </button>
          </div>

          {/* Service 2: Business GST */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Business</h4>
              <p className="font-bold text-sm text-[#1A1A1A] mb-1">GST Returns</p>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                Monthly GSTR-1, GSTR-3B & Annual reconciliation
              </p>
            </div>
            <button 
              onClick={() => { setSelectedServiceSlug('gst-filing'); setActiveTab('service-detail'); }}
              className="text-xs font-bold text-[#0EB1B1] hover:underline text-left"
            >
              Explore &rarr;
            </button>
          </div>

          {/* Service 3: Legal Business Registration */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Legal</h4>
              <p className="font-bold text-sm text-[#1A1A1A] mb-1">Biz Registration</p>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                PVT LTD, LLP, & Startup India documentation
              </p>
            </div>
            <button 
              onClick={() => { setSelectedServiceSlug('business-incorporation'); setActiveTab('service-detail'); }}
              className="text-xs font-bold text-[#0EB1B1] hover:underline text-left"
            >
              Explore &rarr;
            </button>
          </div>

          {/* Service 4: Expert Virtual CFO */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Expert</h4>
              <p className="font-bold text-sm text-[#1A1A1A] mb-1">My Biz CFO</p>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                Dedicated Chartered Accountant & financial officer
              </p>
            </div>
            <button 
              onClick={() => { setSelectedServiceSlug('cfo-services'); setActiveTab('service-detail'); }}
              className="text-xs font-bold text-[#0EB1B1] hover:underline text-left"
            >
              Explore &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 4. Trust & Security Metrics Strip (Clean Minimalism) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 sm:gap-12">
          <div className="text-center md:text-left">
            <p className="text-2xl font-black text-[#07383D]">1.3M+</p>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Trusted Users</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl font-black text-[#07383D]">4.8/5</p>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Google Reviews</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl font-black text-[#07383D]">200+</p>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Tax Experts</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0EB1B1]" />
            <span>256-bit SSL Encryption</span>
          </div>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#0EB1B1]" />
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
