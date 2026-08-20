import React from 'react';
import { ShieldCheck, Heart, Lock, Award, CheckCircle } from 'lucide-react';
import { useTax } from '../../context/TaxContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useTax();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-white text-base">
                TR
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                TAX<span className="text-teal-400">WITHROHIT</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              TaxWithRohit is India’s premier tax compliance and financial planning platform. We empower individuals, professionals, and businesses with expert-assisted tax preparation, audit compliance, and wealth advisory.
            </p>
            <div className="flex items-center gap-4 text-slate-300 text-xs pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal-400" />
                <span>ISO 27001 Certified</span>
              </div>
            </div>
          </div>

          {/* Tax Services */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Tax Services</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('itr-filing')} className="hover:text-teal-400 transition-colors">Income Tax Return (ITR)</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-teal-400 transition-colors">GST Return Filing</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-teal-400 transition-colors">TDS & Form 16 Generation</button></li>
              <li><button onClick={() => setActiveTab('tax-notices')} className="hover:text-teal-400 transition-colors">Notice Assistance (143(1), 148)</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-teal-400 transition-colors">1-on-1 CA Tax Planning</button></li>
            </ul>
          </div>

          {/* Business & Tools */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Business & Tools</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('services')} className="hover:text-teal-400 transition-colors">Company Registration</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-teal-400 transition-colors">Bookkeeping & Accounting</button></li>
              <li><button onClick={() => setActiveTab('services')} className="hover:text-teal-400 transition-colors">Virtual CFO (My Biz CFO)</button></li>
              <li><button onClick={() => setActiveTab('calculators')} className="hover:text-teal-400 transition-colors">Income Tax Calculator</button></li>
              <li><button onClick={() => setActiveTab('calculators')} className="hover:text-teal-400 transition-colors">HRA & SIP Calculators</button></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Company & Support</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('blogs')} className="hover:text-teal-400 transition-colors">Tax Knowledge Hub</button></li>
              <li><button onClick={() => setActiveTab('pricing')} className="hover:text-teal-400 transition-colors">Pricing & Plans</button></li>
              <li><button onClick={() => setActiveTab('support')} className="hover:text-teal-400 transition-colors">Support & FAQs</button></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Mandatory Regulatory Compliance Disclaimer */}
        <div className="pt-8 border-t border-slate-800 text-[11px] leading-relaxed text-slate-400 space-y-3">
          <p className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <strong className="text-slate-200 font-bold">Important Tax Preparation Disclaimer:</strong> TaxWithRohit is an authorized e-return intermediary and financial technology platform providing assisted tax preparation and consultancy services. TaxWithRohit is <strong className="text-slate-300">not the official Income Tax Department of India</strong>. All return submissions, computations, and e-verification procedures follow guidelines issued under the Income Tax Act, 1961. Information provided by our automated calculators and AI Assistant is for preliminary estimation and should be confirmed with your assigned Chartered Accountant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
            <p>© {new Date().getFullYear()} TaxWithRohit Technologies Private Limited. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with precision for 1.3M+ Indian Taxpayers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
