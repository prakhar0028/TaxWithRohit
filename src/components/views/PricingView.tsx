import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTax } from '../../context/TaxContext';
import { SUBSCRIPTION_PLANS } from '../../config/seedData';
import { formatINR } from '../../lib/utils';
import { SubscriptionPlanId } from '../../types';

export const PricingView: React.FC = () => {
  const { user, subscription, openAuthModal, isAuthenticated } = useAuth();
  const { setActiveTab } = useTax();
  const [billingCycle, setBillingCycle] = useState<'YEARLY' | 'MONTHLY'>('YEARLY');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: SubscriptionPlanId, price: number) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsProcessing(planId);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user_demo_101',
        },
        body: JSON.stringify({ amount: price, planId }),
      });
      const order = await orderRes.json();

      // 2. Simulate Razorpay verification
      setTimeout(async () => {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'user_demo_101',
          },
          body: JSON.stringify({
            orderId: order.orderId,
            paymentId: `pay_${Date.now()}`,
            signature: 'mock_sig',
            planId,
          }),
        });
        const data = await verifyRes.json();
        setIsProcessing(null);
        if (data.success) {
          setSuccessPlan(planId);
          setTimeout(() => setSuccessPlan(null), 5000);
        }
      }, 1200);
    } catch (err) {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Pricing Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Transparent & Fair Indian Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Choose the Perfect Compliance Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          From self e-filing to full dedicated Chartered Accountant representation and notice audits.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-2 inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'YEARLY' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Billing (Save 20%)
          </button>
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'MONTHLY' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
        </div>
      </div>

      {successPlan && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Congratulations! Your {successPlan} plan is now active with full CA access.</span>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const adjustedPrice = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between transition-all relative ${
                plan.isPopular
                  ? 'border-teal-600 shadow-xl ring-2 ring-teal-600/20'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-teal-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      {adjustedPrice === 0 ? 'Free' : formatINR(adjustedPrice)}
                    </span>
                    {adjustedPrice > 0 && (
                      <span className="text-xs text-slate-400 font-semibold">
                        / {billingCycle === 'YEARLY' ? 'year' : 'mo'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleUpgrade(plan.id as any, adjustedPrice)}
                  disabled={isCurrent || isProcessing === plan.id}
                  className={`w-full py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.isPopular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95'
                  }`}
                >
                  {isProcessing === plan.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    <span>Current Active Plan</span>
                  ) : (
                    <>
                      <span>{adjustedPrice === 0 ? 'Get Started' : 'Subscribe Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
