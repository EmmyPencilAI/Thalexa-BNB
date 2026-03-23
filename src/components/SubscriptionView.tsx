import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Crown, Check, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const TierCard = ({ name, price, icon: Icon, features, color, popular }: any) => (
  <div className={cn(
    "glass p-8 rounded-[2.5rem] relative flex flex-col h-full transition-all duration-300 hover:scale-[1.02]",
    popular ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-border"
  )}>
    {popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
        Most Popular
      </div>
    )}
    
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", color)}>
      <Icon size={28} />
    </div>
    
    <h3 className="text-2xl font-display font-bold mb-2">{name}</h3>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-gray-500">/month</span>
    </div>
    
    <ul className="space-y-4 mb-10 flex-1">
      {features.map((feature: string, i: number) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
          <Check size={18} className="text-secondary shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
    
    <button className={cn(
      "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
      popular ? "bg-primary text-white hover:bg-primary/90" : "bg-surface text-white hover:bg-border"
    )}>
      Get Started
      <ArrowRight size={18} />
    </button>
  </div>
);

export default function SubscriptionView() {
  const tiers = [
    {
      name: 'Starter',
      price: '0',
      icon: Shield,
      color: 'bg-blue-500/10 text-blue-500',
      features: [
        'Basic wallet features',
        'Up to $2,000 monthly volume',
        'Simple product verification',
        'Email support',
      ],
    },
    {
      name: 'Professional',
      price: '500',
      icon: Zap,
      color: 'bg-primary/10 text-primary',
      popular: true,
      features: [
        'Advanced product registration',
        'Up to $200,000 monthly volume',
        'Escrow & Smart contracts',
        'QR code generation',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: '2,000',
      icon: Crown,
      color: 'bg-secondary/10 text-secondary',
      features: [
        'Unlimited transactions',
        'Custom smart contracts',
        'White-label verification',
        'Dedicated account manager',
        'SLA & 24/7 Support',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Scale your business with Thalexa's enterprise-grade blockchain infrastructure. 
          Select a plan that fits your transaction volume and verification needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <TierCard key={tier.name} {...tier} />
        ))}
      </div>

      <div className="mt-16 glass p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
            <Shield className="text-secondary" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Secure Payments via Paystack</h3>
            <p className="text-sm text-gray-400">All subscriptions are processed securely. We support local Naira transfers and international cards.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <img src="https://picsum.photos/seed/paystack/100/40" alt="Paystack" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
          <img src="https://picsum.photos/seed/opay/100/40" alt="OPay" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
        </div>
      </div>
    </div>
  );
}
