import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useTax } from '../../context/TaxContext';
import { formatINR } from '../../lib/utils';

export const ServicesView: React.FC = () => {
  const { services, setSelectedServiceSlug, setActiveTab } = useTax();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Services' },
    { id: 'TAX_FILING', label: 'Tax Filing' },
    { id: 'COMPLIANCE', label: 'Compliance & Notices' },
    { id: 'BUSINESS', label: 'Business & GST' },
    { id: 'ADVISORY', label: 'CA Advisory' },
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  const handleSelectService = (slug: string) => {
    setSelectedServiceSlug(slug);
    setActiveTab('service-detail');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0EB1B1]">
            Comprehensive Financial Services Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Assisted Compliance & CA Advisory
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            From individual salary ITRs and NRI capital gains to GST returns, virtual CFO retainership, and legal company incorporation.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-4 text-center shrink-0">
          <p className="text-2xl font-black text-[#0EB1B1]">100%</p>
          <p className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Accuracy Guarantee</p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#0EB1B1] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const price = service.pricing?.amount || 0;
          const originalPrice = service.pricing?.originalPrice || 0;
          const benefits = service.benefits || [];
          const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

          return (
            <div
              key={service.id}
              onClick={() => handleSelectService(service.slug)}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#0EB1B1] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {service.category.replace('_', ' ')}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">{formatINR(price)}</span>
                    {originalPrice > price && (
                      <span className="text-xs text-slate-400 line-through ml-1.5">{formatINR(originalPrice)}</span>
                    )}
                    {discount > 0 && (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Save {discount}%
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0EB1B1] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {service.shortDesc}
                  </p>
                </div>

                {/* Feature Highlights */}
                {benefits.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {benefits.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0EB1B1] shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0EB1B1] group-hover:text-[#07383D]">
                  Explore Plan & Features
                </span>
                <div className="w-8 h-8 rounded-full bg-teal-50 text-[#0EB1B1] flex items-center justify-center group-hover:bg-[#0EB1B1] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ServiceDetailView: React.FC = () => {
  const { services, selectedServiceSlug, setActiveTab } = useTax();
  const [isBooked, setIsBooked] = useState(false);

  const service = services.find((s) => s.slug === selectedServiceSlug) || services[0];

  if (!service) return null;

  const price = service.pricing?.amount || 0;
  const originalPrice = service.pricing?.originalPrice || 0;
  const benefits = service.benefits || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Back Button */}
      <button
        onClick={() => setActiveTab('services')}
        className="text-xs font-bold text-[#0EB1B1] hover:text-[#07383D] flex items-center gap-1.5"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>Back to All Services</span>
      </button>

      {/* Main Service Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
              {service.category.replace('_', ' ')}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{service.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{service.shortDesc}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-black text-slate-900">{formatINR(price)}</span>
            {originalPrice > price && (
              <span className="text-sm text-slate-400 line-through ml-2">{formatINR(originalPrice)}</span>
            )}
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Includes CA consultation & e-filing</p>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 mb-2">Service Overview</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{service.fullDesc}</p>
        </div>

        {/* Features Checklist */}
        {benefits.length > 0 && (
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">What's Included</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((feat, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0EB1B1] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action CTA */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              if (service.slug.includes('itr')) {
                setActiveTab('itr-filing');
              } else if (service.slug.includes('notice')) {
                setActiveTab('tax-notices');
              } else {
                setIsBooked(true);
              }
            }}
            className="flex-1 py-3.5 px-6 bg-[#07383D] hover:bg-[#0a474d] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#0EB1B1]" />
            <span>{isBooked ? 'Consultation Booked! Our CA will call you' : 'Get Started with this Service'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
