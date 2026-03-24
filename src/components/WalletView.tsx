import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, ExternalLink, TrendingUp, TrendingDown, X, Copy, Check } from 'lucide-react';
import { formatAddress, formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { fetchTokenPrices, TokenPrice } from '../services/PriceService';
import { toast } from 'sonner';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const Modal = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-xl font-display font-bold">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const TokenCard = ({ symbol, name, balance, price, change }: any) => (
  <div className="glass p-5 rounded-3xl hover:border-primary/50 transition-colors cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <span className="font-bold text-primary">{symbol[0]}</span>
      </div>
      <div className={cn(
        "px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1",
        change >= 0 ? "bg-secondary/10 text-secondary" : "bg-red-500/10 text-red-500"
      )}>
        {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
    <p className="text-gray-400 text-sm mb-1">{name}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold">{balance.toLocaleString()} {symbol}</h3>
    </div>
    <p className="text-gray-500 text-sm mt-1">≈ {formatCurrency(balance * price)}</p>
  </div>
);

export default function WalletView() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [activeModal, setActiveModal] = useState<'send' | 'swap' | 'receive' | null>(null);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [swapAmount, setSwapAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPrices = async () => {
      const data = await fetchTokenPrices();
      setPrices(data);
      setIsLoading(false);
    };
    loadPrices();
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendAmount || !sendAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Building transaction...');

    try {
      const txb = new TransactionBlock();
      const mistAmount = BigInt(Math.floor(parseFloat(sendAmount) * 1_000_000_000));
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(mistAmount)]);
      txb.transferObjects([coin], txb.pure(sendAddress));

      console.log('Send Transaction Block:', txb);
      
      // Simulate signing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully sent ${sendAmount} SUI to ${formatAddress(sendAddress)}`, { id: toastId });
      setActiveModal(null);
      setSendAmount('');
      setSendAddress('');
    } catch (error: any) {
      toast.error(`Send failed: ${error.message}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapAmount) return;

    setIsProcessing(true);
    const toastId = toast.loading('Finding best route...');

    try {
      // Simulate swap logic
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast.success(`Swapped ${swapAmount} SUI for ${(parseFloat(swapAmount) * 1.5).toFixed(2)} USDC`, { id: toastId });
      setActiveModal(null);
      setSwapAmount('');
    } catch (error: any) {
      toast.error(`Swap failed: ${error.message}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(user?.wallet_address || '');
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriceData = (symbol: string) => prices.find(p => p.symbol === symbol) || { price: 0, change24h: 0 };

  const tokens = [
    { symbol: 'SUI', name: 'Sui Network', balance: 1250.45 },
    { symbol: 'USDC', name: 'USD Coin', balance: 5000 },
    { symbol: 'ETH', name: 'Ethereum', balance: 0.45 },
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.012 },
  ].map(t => ({
    ...t,
    price: getPriceData(t.symbol).price,
    change: getPriceData(t.symbol).change24h
  }));

  const totalBalance = tokens.reduce((acc, t) => acc + (t.balance * t.price), 0);

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
            {isLoading ? '...' : formatCurrency(totalBalance)}
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveModal('receive')}
              className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              <Plus size={20} />
              Receive
            </button>
            <button 
              onClick={() => setActiveModal('send')}
              className="flex items-center gap-2 bg-black/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold border border-white/20 hover:bg-black/30 transition-all active:scale-95"
            >
              <ArrowUpRight size={20} />
              Send
            </button>
            <button 
              onClick={() => setActiveModal('swap')}
              className="flex items-center gap-2 bg-black/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold border border-white/20 hover:bg-black/30 transition-all active:scale-95"
            >
              <RefreshCw size={20} />
              Swap
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-black/10 rounded-full blur-2xl" />
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'send'} onClose={() => setActiveModal(null)} title="Send Assets">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Recipient Address</label>
            <input 
              type="text" 
              placeholder="0x..." 
              className="w-full input-field font-mono"
              value={sendAddress}
              onChange={(e) => setSendAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount (SUI)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full input-field"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
            />
          </div>
          <button disabled={isProcessing} type="submit" className="w-full btn-primary py-4 mt-4">
            {isProcessing ? 'Processing...' : 'Confirm Send'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'swap'} onClose={() => setActiveModal(null)} title="Swap Tokens">
        <form onSubmit={handleSwap} className="space-y-4">
          <div className="p-4 bg-surface rounded-2xl border border-border">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">From</span>
              <span className="text-sm text-gray-400">Balance: 1250.45</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="0.00" 
                className="bg-transparent border-none outline-none text-2xl font-bold w-full"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
              />
              <span className="font-bold">SUI</span>
            </div>
          </div>
          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-surface border border-border p-2 rounded-xl">
              <RefreshCw size={16} className="text-primary" />
            </div>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">To (Estimated)</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                placeholder="0.00" 
                className="bg-transparent border-none outline-none text-2xl font-bold w-full opacity-50"
                value={swapAmount ? (parseFloat(swapAmount) * 1.5).toFixed(2) : ''}
              />
              <span className="font-bold">USDC</span>
            </div>
          </div>
          <button disabled={isProcessing} type="submit" className="w-full btn-primary py-4 mt-4">
            {isProcessing ? 'Swapping...' : 'Swap Now'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'receive'} onClose={() => setActiveModal(null)} title="Receive Assets">
        <div className="text-center space-y-6">
          <div className="bg-white p-4 rounded-3xl inline-block mx-auto">
            {/* Mock QR Code */}
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <Plus size={48} className="text-gray-300" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Your Sui Address</p>
            <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border overflow-hidden">
              <span className="text-xs font-mono truncate flex-1">{user?.wallet_address}</span>
              <button onClick={copyAddress} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                {copied ? <Check size={16} className="text-secondary" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">Only send SUI or supported Sui tokens to this address.</p>
        </div>
      </Modal>

      {/* Wallet Address (Mini) */}
      <div className="glass p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="text-sm font-mono text-gray-400">{formatAddress(user?.wallet_address || '')}</span>
        </div>
        <button 
          onClick={copyAddress}
          className="text-primary text-sm font-bold hover:underline"
        >
          Copy Address
        </button>
      </div>

      {/* Assets Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold">Your Assets</h3>
          <button className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Live Prices
          </button>
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
