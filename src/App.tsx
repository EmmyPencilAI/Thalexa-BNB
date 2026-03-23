import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import WalletView from './components/WalletView';
import VerificationView from './components/VerificationView';
import EscrowView from './components/EscrowView';
import AdminView from './components/AdminView';
import SubscriptionView from './components/SubscriptionView';
import { Shield, Wallet, Lock, LayoutDashboard, ArrowRight } from 'lucide-react';

import { Logo } from './components/Logo';

function AppContent() {
  const { user, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('wallet');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-gray-400 font-medium animate-pulse">Loading Thalexa...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-md w-full text-center relative z-10">
          <Logo className="w-24 h-24 text-primary mx-auto mb-8 drop-shadow-[0_0_15px_rgba(212,255,0,0.3)]" />
          <h1 className="text-5xl font-display font-bold mb-4 tracking-tight">Thalexa</h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Enterprise-grade blockchain verification, escrow, and multi-currency wallet.
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-4 p-4 glass rounded-2xl text-left">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shrink-0">
                <Shield className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">zkLogin Integration</p>
                <p className="text-xs text-gray-500">Secure, zero-knowledge wallet creation.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-2xl text-left">
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center shrink-0">
                <Lock className="text-secondary" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">On-Chain Escrow</p>
                <p className="text-xs text-gray-500">Audited Sui Move smart contracts.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={signIn}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 group"
          >
            Get Started with zkLogin
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-xs text-gray-500">
            By continuing, you agree to Thalexa's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet': return <WalletView />;
      case 'verify': return <VerificationView />;
      case 'escrow': return <EscrowView />;
      case 'admin': return <AdminView />;
      case 'subscriptions': return <SubscriptionView />;
      default: return <WalletView />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
