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
  const { user, loading, dbReady, signIn } = useAuth();
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

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl glass p-8 rounded-[2.5rem] border-red-500/30">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="text-red-500" size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Database Setup Required</h2>
          <p className="text-gray-400 mb-8">
            The application is connected to Supabase, but the <span className="text-white font-bold">profiles</span> table is missing. 
            Please run the following SQL in your <span className="text-white font-bold">Supabase SQL Editor</span> to fix this:
          </p>
          
          <div className="bg-black/50 p-6 rounded-2xl text-left font-mono text-xs text-primary overflow-x-auto mb-8 border border-border">
            <pre>{`-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  wallet_address TEXT,
  role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'starter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);`}</pre>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary px-8 py-3"
          >
            I've run the SQL, Refresh App
          </button>
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

          <div className="space-y-3">
            <button 
              onClick={() => signIn('google')}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 group"
            >
              <img src="https://www.gstatic.com/firebase/anonymous-scan/google.svg" className="w-5 h-5" alt="" />
              Continue with Google
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => signIn('facebook')}
              className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continue with Facebook
            </button>
          </div>
          
          <div className="mt-8 p-4 glass rounded-2xl border-primary/20">
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-2">Setup Required</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              If you see "provider not enabled", go to your <span className="text-white font-bold">Supabase Dashboard &gt; Auth &gt; Providers</span> and toggle Google/Facebook to <span className="text-white font-bold">ON</span>.
            </p>
          </div>
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
