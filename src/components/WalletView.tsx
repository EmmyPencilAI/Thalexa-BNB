import React from 'react';
import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, ExternalLink } from 'lucide-react';
import { formatAddress, formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const TokenCard = ({ symbol, name, balance, price, change }: any) => (
  <div className="glass p-5 rounded-3xl hover:border-primary/50 transition-colors cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <span className="font-bold text-primary">{symbol[0]}</span>
      </div>
      <div className={cn(
        "px-2 py-1 rounded-lg text-xs font-medium",
        change >= 0 ? "bg-secondary/10 text-secondary" : "bg-red-500/10 text-red-500"
      )}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    </div>
    <p className="text-gray-400 text-sm mb-1">{name}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold">{balance} {symbol}</h3>
    </div>
    <p className="text-gray-500 text-sm mt-1">≈ {formatCurrency(balance * price)}</p>
  </div>
);

import { cn } from '../lib/utils';

export default function WalletView() {
  const { user } = useAuth();

  const tokens = [
    { symbol: 'SUI', name: 'Sui Network', balance: 1250.45, price: 1.85, change: 5.2 },
    { symbol: 'cNGN', name: 'Naira Stablecoin', balance: 500000, price: 0.00065, change: -0.1 },
    { symbol: 'USDC', name: 'USD Coin', balance: 2500, price: 1.00, change: 0.01 },
    { symbol: 'SOL', name: 'Solana', balance: 12.5, price: 145.20, change: 8.4 },
  ];

  return (
    <div className="space-y-8">
      {/* Balance Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-orange-600 p-8 md:p-12 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Wallet size={18} />
            <span className="text-sm font-medium uppercase tracking-wider">Total Balance</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight">
            {formatCurrency(8450.25)}
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95">
              <Plus size={20} />
              Buy / Deposit
            </button>
            <button className="flex items-center gap-2 bg-black/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold border border-white/20 hover:bg-black/30 transition-all active:scale-95">
              <ArrowUpRight size={20} />
              Send
            </button>
            <button className="flex items-center gap-2 bg-black/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold border border-white/20 hover:bg-black/30 transition-all active:scale-95">
              <RefreshCw size={20} />
              Swap
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-black/10 rounded-full blur-2xl" />
      </div>

      {/* Wallet Address */}
      <div className="glass p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="text-sm font-mono text-gray-400">{user?.wallet_address}</span>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(user?.wallet_address || '');
            alert('Address copied!');
          }}
          className="text-primary text-sm font-bold hover:underline"
        >
          Copy
        </button>
      </div>

      {/* Assets Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold">Your Assets</h3>
          <button className="text-sm text-gray-400 hover:text-white">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tokens.map((token) => (
            <TokenCard key={token.symbol} {...token} />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-display font-bold">Recent Activity</h3>
          <button className="text-sm text-primary font-bold">View History</button>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 hover:bg-surface/30 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  i % 2 === 0 ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                )}>
                  {i % 2 === 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold">{i % 2 === 0 ? 'Received SUI' : 'Sent USDC'}</p>
                  <p className="text-xs text-gray-500">Mar 23, 2026 • 14:45</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold",
                  i % 2 === 0 ? "text-secondary" : "text-white"
                )}>
                  {i % 2 === 0 ? '+' : '-'}{i * 10.5} {i % 2 === 0 ? 'SUI' : 'USDC'}
                </p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
