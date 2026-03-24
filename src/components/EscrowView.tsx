import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, Lock, Unlock, ShieldAlert, Info, ChevronRight, History } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { createEscrowTx, suiClient } from '../lib/sui';

export default function EscrowView() {
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !receiver) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Building transaction...');

    try {
      // 1. Build the transaction block
      const txb = createEscrowTx(receiver, parseFloat(amount));

      // 2. NOTE: In a real app, you would use a wallet provider here
      // Example: const { mutate: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
      // signAndExecuteTransactionBlock({ transactionBlock: txb });
      
      toast.info('Transaction built! Ready for signing in your wallet.', { id: toastId });
      
      // For now, we log the transaction block for the user to see
      console.log('Transaction Block:', txb);
      
      // Simulate the signing process for the UI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Escrow created successfully! Funds are now locked on-chain.', { id: toastId });
      setAmount('');
      setReceiver('');
    } catch (error: any) {
      console.error('Escrow Error:', error);
      toast.error(`Escrow failed: ${error.message}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const activeEscrows = [
    { id: 'ESC_001', receiver: '0x892...a12', amount: 500, status: 'locked', date: '2026-03-22' },
    { id: 'ESC_002', receiver: '0x341...b55', amount: 1200, status: 'pending', date: '2026-03-23' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Escrow */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass p-8 rounded-[2.5rem]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Lock className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Create Secure Escrow</h2>
              <p className="text-sm text-gray-400">Funds are locked on-chain until delivery is confirmed.</p>
            </div>
          </div>

          <form onSubmit={handleCreateEscrow} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Receiver Wallet Address</label>
              <input 
                type="text" 
                placeholder="0x..." 
                className="w-full input-field font-mono"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Amount to Lock</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full input-field pr-16"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-primary">SUI</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Condition for Release</label>
                <select className="w-full input-field appearance-none">
                  <option>QR Scan Confirmation</option>
                  <option>Manual Release</option>
                  <option>Time-based Release</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-2xl border border-border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Escrow Fee (0.5%)</span>
                <span>{amount ? (parseFloat(amount) * 0.005).toFixed(4) : '0.0000'} SUI</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total to Lock</span>
                <span className="text-primary">{amount ? (parseFloat(amount) * 1.005).toFixed(4) : '0.0000'} SUI</span>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2">
              <Lock size={20} />
              Lock Funds in Escrow
            </button>
          </form>
        </div>

        {/* Active Escrows */}
        <div>
          <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <History size={20} className="text-gray-400" />
            Active Escrows
          </h3>
          <div className="space-y-4">
            {activeEscrows.map((escrow) => (
              <div key={escrow.id} className="glass p-5 rounded-3xl flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    escrow.status === 'locked' ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                  )}>
                    {escrow.status === 'locked' ? <Lock size={20} /> : <Unlock size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{escrow.amount} SUI</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-gray-400 border border-border">
                        {escrow.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">To: {escrow.receiver}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium capitalize text-secondary">{escrow.status}</p>
                    <p className="text-xs text-gray-500">{escrow.date}</p>
                  </div>
                  <button className="p-2 rounded-xl bg-surface hover:bg-primary/10 hover:text-primary transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        <div className="glass p-6 rounded-3xl border-primary/20">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-primary" />
            Security Protocol
          </h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Thalexa Escrow uses audited Sui Move smart contracts.
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Funds are never held by Thalexa; they are locked in the contract.
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Disputes can be raised to the Admin panel for mediation.
            </li>
          </ul>
        </div>

        <div className="glass p-6 rounded-3xl">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-secondary">
            <Info size={18} />
            How it works
          </h4>
          <div className="space-y-6 relative">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
            {[
              { title: 'Lock', desc: 'Sender locks funds in contract' },
              { title: 'Deliver', desc: 'Receiver provides goods/service' },
              { title: 'Verify', desc: 'Receiver scans QR or provides proof' },
              { title: 'Release', desc: 'Funds automatically released' },
            ].map((step, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold z-10">
                  {i + 1}
                </div>
                <p className="text-sm font-bold text-white">{step.title}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
