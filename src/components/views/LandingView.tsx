import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  Award, 
  Users, 
  Clock, 
  HelpCircle, 
  PhoneCall, 
  Layers, 
  Calculator, 
  Lock, 
  X, 
  UserCheck, 
  Briefcase, 
  Check, 
  ChevronRight,
  FileCheck2,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTax } from '../../context/TaxContext';
import { formatINR } from '../../lib/utils';
import { ServiceItem } from '../../types';

export const LandingView: React.FC = () => {
  const { user, isAuthenticated, loginWithGoogle, openAuthModal } = useAuth();
  const { services, setActiveTab, setSelectedServiceSlug } = useTax();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalService, setActiveModalService] = useState<ServiceItem | null>(null);

  // Quick interactive regime preview on landing page
  const [demoSalary, setDemoSalary] = useState<number>(1200000);
  const [demo80C, setDemo80C] = useState<number>(150000);
  const [demoHRA, setDemoHRA] = useState<number>(100000);

  // Calculate rough estimate for interactive widget
  const oldNetTaxable = Math.max(0, demoSalary - 50000 - demo80C - demoHRA);
  let oldTax = 0;
  if (oldNetTaxable > 1000000) {
    oldTax = 112500 + (oldNetTaxable - 1000000) * 0.30;
  } else if (oldNetTaxable > 500000) {
    oldTax = 12500 + (oldNetTaxable - 500000) * 0.20;
  } else if (oldNetTaxable > 250000) {
    oldTax = (oldNetTaxable - 250000) * 0.05;
  }
  if (oldNetTaxable <= 500000) oldTax = 0; // 87A
  const oldTaxFinal = Math.round(oldTax * 1.04);

  // New regime (Budget 2024 / FY 24-25 / AY 25-26)
  const newNetTaxable = Math.max(0, demoSalary - 75000);
  let newTax = 0;
  if (newNetTaxable > 1500000) {
    newTax = 140000 + (newNetTaxable - 1500000) * 0.30;
  } else if (newNetTaxable > 1200000) {
    newTax = 80000 + (newNetTaxable - 1200000) * 0.20;
  } else if (newNetTaxable > 1000000) {
    newTax = 50000 + (newNetTaxable - 1000000) * 0.15;
  } else if (newNetTaxable > 700000) {
    newTax = 20000 + (newNetTaxable - 700000) * 0.10;
  } else if (newNetTaxable > 300000) {
    newTax = (newNetTaxable - 300000) * 0.05;
  }
  if (newNetTaxable <= 700000) newTax = 0; // 87A rebate up to 7L
  const newTaxFinal = Math.round(newTax * 1.04);

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'TAX_FILING', label: 'ITR Filing' },
    { id: 'COMPLIANCE', label: 'Notices & Audit' },
    { id: 'BUSINESS', label: 'GST & Corporate' },
    { id: 'ADVISORY', label: 'CA Retainership' },
  ];

  const filteredServices = services.filter(s => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  // Find related services based on category or slug
  const getRelatedServices = (current: ServiceItem) => {
    return services.filter(s => s.id !== current.id).slice(0, 3);
  };

  const handleOpenService = (service: ServiceItem) => {
    setActiveModalService(service);
  };

  const handleProceedWithService = (service: ServiceItem) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    // If authenticated, navigate to relevant feature
    setActiveModalService(null);
    if (service.slug.includes('itr')) {
      setActiveTab('itr-filing');
    } else if (service.slug.includes('notice')) {
      setActiveTab('tax-notices');
    } else {
      setSelectedServiceSlug(service.slug);
      setActiveTab('service-detail');
    }
  };

  const handleDemoLogin = async (role: 'USER' | 'TAX_EXPERT' | 'ADMIN') => {
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
  };

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-200">
      {/* 1. Hero Section (Clean Minimalism Theme) */}
      <section className="relative overflow-hidden bg-[#07383D] rounded-3xl p-6 sm:p-10 lg:p-14 text-white shadow-2xl">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs font-semibold text-[#0EB1B1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AY 2025-26 E-Filing & Compliance Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Taxes Prepared, Filed & Resolved by Expert CAs
          </h1>

          <p className="text-sm sm:text-base text-teal-100/85 leading-relaxed max-w-2xl font-normal">
            Effortless income tax return filing, instant notice dispute management, business GST compliance, and year-round Chartered Accountant advisory — powered by intelligent tax computation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setActiveTab('itr-filing');
                } else {
                  openAuthModal();
                }
              }}
              className="px-6 py-3.5 bg-[#0EB1B1] hover:bg-[#0ca3a3] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Go to Active Tax Filing' : 'Start E-Filing Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const element = document.getElementById('all-services-catalog');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors"
            >
              Browse All Services ({services.length})
            </button>
          </div>
        </div>

        {/* 1-Click Demo Users Banner */}
        <div className="mt-8 pt-6 border-t border-white/15">
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-200 mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#0EB1B1]" />
            <span>Instant Test Accounts (1-Click Login):</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoLogin('USER')}
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#0EB1B1] transition-colors">
                  👤 Salaried Taxpayer
                </p>
                <p className="text-[10px] text-teal-200/80">Vikramaditya Sharma • Form 16</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleDemoLogin('TAX_EXPERT')}
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#0EB1B1] transition-colors">
                  💼 CA Tax Expert
                </p>
                <p className="text-[10px] text-teal-200/80">CA Priya Sundaram, FCA</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleDemoLogin('ADMIN')}
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left transition-all group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-[#0EB1B1] transition-colors">
                  🛡️ Platform Admin
                </p>
                <p className="text-[10px] text-teal-200/80">Rajesh Nair • Master Panel</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Trust Metrics Strip */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#07383D]">1.3M+</p>
          <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-0.5">Returns Filed</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#07383D]">4.8 / 5</p>
          <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-0.5">Google Rating</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#07383D]">₹450 Cr+</p>
          <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-0.5">Refunds Claimed</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#07383D]">200+ CAs</p>
          <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-0.5">In-House Experts</p>
        </div>
      </div>

      {/* 3. Comprehensive Services Catalog Section */}
      <section id="all-services-catalog" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-[10px] font-bold text-[#0EB1B1] uppercase tracking-wider mb-2">
              <Layers className="w-3 h-3" />
              <span>Full Service Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07383D]">
              Explore All TaxWithRohit Financial & Compliance Services
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select any service to inspect coverage, deliverables, and related advisory options.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#07383D] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const price = service.pricing?.amount || 0;
            const originalPrice = service.pricing?.originalPrice || 0;
            const benefits = service.benefits || [];
            const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

            return (
              <div
                key={service.id}
                onClick={() => handleOpenService(service)}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-xl hover:border-[#0EB1B1] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold text-[#07383D] bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-teal-100">
                      {service.category.replace('_', ' ')}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#07383D]">{formatINR(price)}</span>
                      {originalPrice > price && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">{formatINR(originalPrice)}</span>
                      )}
                      {discount > 0 && (
                        <p className="text-[10px] text-emerald-600 font-bold">
                          Save {discount}%
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#1A1A1A] group-hover:text-[#0EB1B1] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                      {service.shortDesc}
                    </p>
                  </div>

                  {/* Highlights */}
                  {benefits.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {benefits.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EB1B1] shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0EB1B1] group-hover:text-[#07383D]">
                    View Service & Related Options
                  </span>
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-[#0EB1B1] flex items-center justify-center group-hover:bg-[#0EB1B1] group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive Live Old vs New Regime Simulator (Teaser) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-[#0EB1B1] uppercase tracking-wider">Live Tax Estimator</span>
            <h3 className="text-xl font-bold text-[#07383D]">Compare Old vs New Tax Regime for AY 2025-26</h3>
          </div>
          <span className="text-xs font-semibold text-gray-400">Standard Deduction ₹75,000 Included</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Annual Gross Salary</span>
                <span className="text-[#07383D]">{formatINR(demoSalary)}</span>
              </div>
              <input
                type="range"
                min={300000}
                max={3500000}
                step={50000}
                value={demoSalary}
                onChange={(e) => setDemoSalary(Number(e.target.value))}
                className="w-full accent-[#0EB1B1] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Section 80C Deductions</span>
                <span className="text-[#07383D]">{formatINR(demo80C)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={150000}
                step={10000}
                value={demo80C}
                onChange={(e) => setDemo80C(Number(e.target.value))}
                className="w-full accent-[#0EB1B1] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>HRA & Other Exemptions</span>
                <span className="text-[#07383D]">{formatINR(demoHRA)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={300000}
                step={10000}
                value={demoHRA}
                onChange={(e) => setDemoHRA(Number(e.target.value))}
                className="w-full accent-[#0EB1B1] cursor-pointer"
              />
            </div>
          </div>

          {/* Results Comparison */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              newTaxFinal <= oldTaxFinal ? 'bg-teal-50/60 border-teal-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#07383D]">New Regime (115BAC)</span>
                {newTaxFinal <= oldTaxFinal && (
                  <span className="px-2 py-0.5 bg-[#0EB1B1] text-white text-[10px] font-bold rounded-full">Recommended</span>
                )}
              </div>
              <p className="text-2xl font-black text-[#07383D] mt-2">{formatINR(newTaxFinal)}</p>
              <p className="text-[11px] text-gray-500 mt-1">Zero hassle, slab rates up to 30%</p>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              oldTaxFinal < newTaxFinal ? 'bg-teal-50/60 border-teal-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">Old Tax Regime</span>
                {oldTaxFinal < newTaxFinal && (
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">Recommended</span>
                )}
              </div>
              <p className="text-2xl font-black text-gray-800 mt-2">{formatINR(oldTaxFinal)}</p>
              <p className="text-[11px] text-gray-500 mt-1">With 80C, 80D & HRA deductions</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Service Details & Related Services Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-[#07383D] text-white flex items-start justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#0EB1B1] uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                  {activeModalService.category.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold mt-2">{activeModalService.title}</h3>
                <p className="text-xs text-teal-100/80 mt-1">{activeModalService.shortDesc}</p>
              </div>

              <button
                onClick={() => setActiveModalService(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Pricing & Guarantee Banner */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500">Service Fee</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-[#07383D]">
                      {formatINR(activeModalService.pricing?.amount || 0)}
                    </span>
                    {(activeModalService.pricing?.originalPrice || 0) > (activeModalService.pricing?.amount || 0) && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatINR(activeModalService.pricing.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    Includes CA Review
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">100% filing accuracy guarantee</p>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Service Deliverables
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {activeModalService.fullDesc}
                </p>
              </div>

              {/* What's Included */}
              {activeModalService.benefits && activeModalService.benefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    What Is Included
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeModalService.benefits.map((b, i) => (
                      <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#0EB1B1] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RELATED SERVICES SECTION */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#07383D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0EB1B1]" />
                    <span>Related & Recommended Services</span>
                  </h4>
                  <span className="text-[10px] text-gray-400">Frequently bundled together</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {getRelatedServices(activeModalService).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => setActiveModalService(rel)}
                      className="p-3 bg-gray-50 hover:bg-teal-50/50 rounded-xl border border-gray-200 hover:border-[#0EB1B1] transition-all cursor-pointer group text-left"
                    >
                      <span className="text-[9px] font-bold text-[#0EB1B1] uppercase">
                        {rel.category.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#07383D] line-clamp-1 mt-0.5">
                        {rel.title}
                      </p>
                      <p className="text-[11px] font-black text-[#07383D] mt-2">
                        {formatINR(rel.pricing?.amount || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                {!isAuthenticated ? 'Sign in or create account to initiate filing' : 'Ready to start with this service'}
              </p>

              <button
                onClick={() => handleProceedWithService(activeModalService)}
                className="w-full sm:w-auto px-6 py-3 bg-[#07383D] hover:bg-[#0a464c] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{!isAuthenticated ? 'Sign In / Register to Proceed' : 'Continue with this Service'}</span>
                <ArrowRight className="w-4 h-4 text-[#0EB1B1]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
