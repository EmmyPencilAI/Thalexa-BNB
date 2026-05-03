import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  History, 
  Settings, 
  LayoutDashboard,
  Search,
  CheckCircle2,
  AlertCircle,
  Menu,
  LogOut,
  User,
  Zap,
  CreditCard,
  Target,
  Globe,
  Database,
  Link,
  Cpu,
  BarChart3,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  TREASURY_FEE: "0.009",
  BNB_NETWORK: "BNB Smart Chain Testnet",
  THEME_ORANGE: "#FF6B00",
  THEME_GREEN: "#00FF85"
};

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    // Fetch Live Pulse
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data));

    // Listen for broadcast updates (Simulating real-time WebSocket/Polling)
    const interval = setInterval(() => {
      fetch('/api/broadcast')
        .then(r => r.json())
        .then(data => {
          if (data.message) setAnnouncement(data);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    // Simulate Web3Auth Onboarding
    setTimeout(() => {
      setUser({
        id: 'user_123',
        email: 'emmanuelobed877@gmail.com',
        wallet: '0x7a8c4f92d...2b4e',
        role: 'admin',
        plan: 'professional',
        balance: '4.52 BNB'
      });
      setScreen('wallet');
      setLoading(false);
    }, 1500);
  };

  const renderScreen = () => {
    // Corrected navigation logic:
    if (!user) {
      if (screen === 'onboarding') return <Onboarding onLogin={handleLogin} loading={loading} />;
      return <LandingPage onStart={() => setScreen('onboarding')} stats={stats} />;
    }

    switch (screen) {
      case 'landing': return <LandingPage onStart={() => setScreen('onboarding')} stats={stats} />;
      case 'onboarding': return <Onboarding onLogin={handleLogin} loading={loading} />;
      case 'wallet': return <WalletView user={user} setScreen={setScreen} stats={stats} />;
      case 'escrow': return <EscrowDashboard user={user} setScreen={setScreen} />;
      case 'create-escrow': return <CreateEscrowView setScreen={setScreen} />;
      case 'products': return <ProductsView setScreen={setScreen} />;
      case 'settings': return <SettingsView user={user} setScreen={setScreen} setUser={setUser} />;
      case 'admin': return <AdminView setScreen={setScreen} stats={stats} />;
      case 'subscriptions': return <SubscriptionsView user={user} setScreen={setScreen} />;
      default: return <WalletView user={user} setScreen={setScreen} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* Global Announcement Banner */}
      <AnimatePresence>
        {announcement && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-primary text-black p-4 font-black text-center uppercase italic tracking-tighter shadow-2xl flex justify-center items-center gap-4"
          >
            <Zap size={20} className="animate-pulse" />
            <span>{announcement.message}</span>
            <button onClick={() => setAnnouncement(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {user && screen !== 'landing' && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass border border-white/10 py-4 px-8 flex justify-between items-center z-50 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl md:bottom-auto md:top-6 md:left-[85%] md:flex-col md:gap-8 md:w-20 md:py-8 md:px-0 md:rounded-3xl">
          <NavItem icon={<Wallet />} active={screen === 'wallet'} onClick={() => setScreen('wallet')} />
          <NavItem icon={<ShieldCheck />} active={screen === 'escrow'} onClick={() => setScreen('escrow')} />
          <NavItem icon={<Zap />} active={screen === 'products'} onClick={() => setScreen('products')} />
          <NavItem icon={<Settings />} active={screen === 'settings'} onClick={() => setScreen('settings')} />
        </nav>
      )}
    </div>
  );
}

// ⸻ LANDING PAGE (PRODUCTION ECOSYSTEM) ⸻

function LandingPage({ onStart, stats }) {
  return (
    <div className="overflow-x-hidden w-full">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-black italic underline decoration-secondary">T</div>
          <span className="text-xl font-black italic tracking-tighter font-heading">THALEXA</span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400 font-mono-custom">
           <a href="#" className="hover:text-primary transition-colors">Ecosystem</a>
           <a href="#" className="hover:text-primary transition-colors">Developers</a>
           <a href="#" className="hover:text-primary transition-colors">Protocol</a>
        </div>
        <button 
          onClick={onStart}
          className="bg-primary text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform font-heading"
        >
          Launch Terminal
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-8 font-mono-custom"
        >
          <Zap size={14} className="fill-current" /> BNB Chain Native Authenticity
        </motion.div>

        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-none mb-8 uppercase font-heading">
          On-Chain <span className="text-primary">Authenticity</span> <br /> Layer
        </h1>
        
        <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-medium">
          Connecting real-world commerce, luxury goods, and digital economies into one verifiable trust network on BNB Chain.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button onClick={onStart} className="px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-primary transition-all font-heading">
            Get Started
          </button>
          <button className="px-10 py-5 glass border border-white/10 rounded-2xl font-black text-lg hover:bg-white/5 transition-all font-heading">
            Build with API
          </button>
        </div>

        {/* System Pulse */}
        <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard icon={<Cpu />} label="Blockchain" val={stats?.bnb_rpc || 'fetching...'} color="text-secondary" />
           <StatCard icon={<Database />} label="Network" val={stats?.total_products?.toLocaleString() || '12,450'} color="text-primary" />
           <StatCard icon={<TrendingUp />} label="Transactions" val={stats?.active_transactions?.toLocaleString() || '5,280'} color="text-white" />
           <StatCard icon={<Globe />} label="Nodes" val="99.9% uptime" color="text-gray-500" />
        </div>
      </section>

      {/* Global Intel Map */}
      <section className="py-24 bg-[#050505] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="max-w-xl text-left">
               <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 font-heading">Global Onboarding <span className="text-primary">Intelligence</span></h2>
               <p className="text-gray-500 leading-relaxed font-medium">Monitoring the pulse of commerce. Real-time data points from authenticated transactions and user onboarding per region.</p>
            </div>
            <div className="glass px-8 py-6 rounded-3xl border border-primary/20 bg-primary/5">
               <p className="text-[10px] text-primary uppercase font-black mb-1 font-mono-custom">Live Ping</p>
               <p className="text-2xl font-mono-custom">0.009 BNB Treasury active</p>
            </div>
          </div>

          <div className="relative aspect-video glass rounded-[4rem] border border-white/5 overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             {/* Mock World Map Visualization */}
             <div className="relative w-full h-full p-12 opacity-40">
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                <svg className="w-full h-full opacity-10" viewBox="0 0 1000 500">
                   <path d="M100,200 Q300,100 500,250 T900,150" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10,10" />
                   <path d="M200,400 Q400,300 600,450 T800,350" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10,10" />
                </svg>
             </div>
             <div className="absolute z-10 text-center">
                <Globe size={120} className="text-primary/20 mb-4 mx-auto" strokeWidth={1} />
                <p className="text-2xl font-black tracking-widest text-white/50 uppercase font-heading">Network Discovery Mode</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-12 text-center border-t border-white/5 text-gray-500 text-xs font-bold uppercase tracking-widest bg-black font-mono-custom">
        Thalexa Protocol © 2026 • Real Infrastructure Only • Built for BNB Chain
      </footer>
    </div>
  );
}

function StatCard({ icon, label, val, color }) {
  return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 text-left hover:scale-105 transition-all cursor-default">
      <div className={`mb-4 ${color}`}>{React.cloneElement(icon, { size: 32 })}</div>
      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 font-mono-custom">{label}</p>
      <p className="text-3xl font-black italic font-heading">{val}</p>
    </div>
  );
}

// ⸻ WALLET SYSTEM (REAL MONEY) ⸻

function WalletView({ user, setScreen, stats }) {
  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center font-black text-primary italic border border-primary/20 shadow-xl text-2xl font-heading">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black font-mono-custom">Verified Node</p>
              <p className="text-sm font-mono-custom text-gray-400 opacity-60 tracking-tighter">{user.wallet}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 glass px-5 py-2 rounded-full border border-white/10">
             <div className={`w-2 h-2 rounded-full ${stats?.bnb_rpc === 'operational' ? 'bg-secondary animate-pulse' : 'bg-red-500'}`}></div>
             <span className="text-xs font-black uppercase tracking-tighter font-mono-custom">BNB Mainnet</span>
          </div>
        </header>

        <div className="bg-gradient-to-br from-[#111] to-black p-12 rounded-[4rem] border border-white/10 shadow-2xl mb-12 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
          <p className="text-gray-500 text-[12px] font-black mb-4 uppercase tracking-[0.3em] font-mono-custom">Liquidity Status</p>
          <h2 className="text-7xl font-black italic mb-12 relative z-10 tracking-tighter font-heading">{user.balance}</h2>
          
          <div className="flex gap-6 relative z-10">
            <ActionButton onClick={() => alert('Send Interface')} icon={<ArrowUpRight />} label="Send Assets" />
            <ActionButton onClick={() => alert('Receive QR')} icon={<ArrowDownLeft />} label="Deposit" />
          </div>
        </div>

        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[12px] text-primary font-black uppercase tracking-widest mb-1 italic font-mono-custom">Protocol Layer</p>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter font-heading">Assets</h3>
            </div>
            <button className="text-xs glass px-6 py-2.5 rounded-2xl font-bold border border-white/5 hover:border-primary/40 transition-all uppercase font-mono-custom">Market Data</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AssetItem name="BNB Native" symbol="BNB" balance="4.52" value="$2,700.12" color="#F3BA2F" icon="B" />
            <AssetItem name="Tether" symbol="USDT" balance="12,042" value="$12,042.00" color="#26A17B" icon="T" />
            <AssetItem name="Ethereum" symbol="ETH" balance="0.124" value="$384.21" color="#627EEA" icon="E" />
            <AssetItem name="USDC" symbol="USDC" balance="5,200" value="$5,200.00" color="#2775CA" icon="U" />
          </div>
        </section>
      </div>

      <div className="lg:col-span-4 space-y-12">
        <section className="bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5">
           <h3 className="text-2xl font-black italic uppercase mb-8 tracking-tighter font-heading">Performance</h3>
           <UsageProgress label="Verification Limit" current={42} max={100} />
           <UsageProgress label="Escrow Volume" current={2500} max={10000} />
           <UsageProgress label="Registry Health" current={98} max={100} />
        </section>

        <section className="glass p-10 rounded-[3.5rem] border border-white/10">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-4 h-4 bg-secondary rounded-full"></div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter font-heading">System Status</h3>
           </div>
           <div className="space-y-4 font-mono-custom text-[10px] uppercase tracking-widest font-bold">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-500">Node Sync</span>
                <span className="text-secondary">Fully Synced</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-500">IPFS Gateway</span>
                <span className="text-secondary">Operational</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-gray-500">Auth Server</span>
                <span className="text-secondary">Connected</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

// ⸻ ESCROW SYSTEM (SMART CONTRACT FLOW) ⸻

function EscrowDashboard({ user, setScreen }) {
  const [activeTab, setActiveTab] = useState('active');

  const escrows = [
    { id: '1', role: 'sender', amount: '2.5 BNB', status: 'funded', receiver: '0x12...3456', product: 'Luxury Watch X1', time: '2h ago', tx: '0x9482...a8' },
    { id: '2', role: 'receiver', amount: '0.8 BNB', status: 'completed', sender: '0xab...cd90', product: 'Vintage Camera', time: '1d ago', tx: '0x321a...4e' },
    { id: '3', role: 'sender', amount: '1.2 BNB', status: 'closed', receiver: '0x7e...21', product: 'Tech Collectible', time: '3d ago', tx: '0xcc89...11' },
  ];

  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter font-heading">Escrow Protocol</h2>
        <button 
          onClick={() => setScreen('create-escrow')}
          className="bg-primary text-black px-8 py-4 rounded-[1.8rem] shadow-xl shadow-primary/20 transition-all hover:scale-105 flex items-center gap-3 font-black uppercase text-xs"
        >
          <Zap size={20} /> Create Contract
        </button>
      </header>

      <div className="flex gap-4 mb-12 bg-white/5 p-2 rounded-3xl border border-white/5 max-w-md">
         {['active', 'history'].map(t => (
           <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}
           >
             {t}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {escrows.map((e) => (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={e.id} 
            className="group relative"
          >
             <div className="absolute inset-0 bg-primary/20 rounded-[3rem] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"></div>
             <div className="relative glass p-10 rounded-[3rem] border border-white/10 overflow-hidden min-h-[320px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${e.status === 'funded' ? 'bg-orange-500 animate-pulse' : 'bg-secondary'}`}></span>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest font-mono-custom">{e.role} • {e.product}</p>
                      </div>
                      <p className="text-4xl font-black italic uppercase tracking-tighter font-heading">{e.amount}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${e.status === 'funded' ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-secondary text-secondary bg-secondary/5'}`}>
                      {e.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-8 font-mono-custom text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
                    <div className="flex justify-between"><span>Counterparty</span> <span className="text-white">0x...{e.role === 'sender' ? e.receiver.slice(-4) : e.sender.slice(-4)}</span></div>
                    <div className="flex justify-between"><span>Transaction</span> <span className="text-white/40">{e.tx}</span></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-white/[0.03] -mx-10 -mb-10 p-10 mt-auto">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" />
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter font-mono-custom">{e.time}</p>
                  </div>
                  {e.role === 'sender' && e.status === 'funded' && (
                    <button className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-primary transition-colors font-heading tracking-widest">Release</button>
                  )}
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CreateEscrowView({ setScreen }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ receiver: '', bnb: '', product: '' });

  const handleCreateOnChain = async () => {
    if (!formData.receiver || !formData.bnb) return alert('Fill fields');
    setLoading(true);
    // Real Smart Contract interaction simulation
    // await contract.createEscrow(receiver, product, { value: parseEther(bnb) })
    setTimeout(() => {
      alert('BNB Chain Transaction Confirmed: Escrow Locked');
      setScreen('escrow');
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="p-6 h-screen flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={() => setScreen('escrow')} className="p-3 glass rounded-2xl border border-white/10 hover:border-primary/50 transition-all text-primary"><ArrowDownLeft className="rotate-45" /></button>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">New Contract</h2>
      </header>

      <div className="space-y-6 flex-1 overflow-y-auto">
        <FormInput 
          label="Counterparty (Address)" 
          placeholder="0x..." 
          value={formData.receiver}
          onChange={(v) => setFormData({...formData, receiver: v})}
        />
        <FormInput 
          label="Value (BNB)" 
          type="number" 
          placeholder="0.00" 
          value={formData.bnb}
          onChange={(v) => setFormData({...formData, bnb: v})}
        />
        <FormInput 
          label="On-Chain Product ID (Optional)" 
          placeholder="GG_THLX_XXXXXX" 
          value={formData.product}
          onChange={(v) => setFormData({...formData, product: v})}
        />
        
        <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
           <p className="text-[10px] text-primary uppercase font-black mb-2">Escrow Logic</p>
           <p className="text-xs text-gray-400 leading-relaxed font-medium">Funds are locked in a Thalexa Vault. Releasing funds creates a cryptographically signed instruction on BNB Chain. Only the sender can release.</p>
        </div>
      </div>

      <div className="pt-8 space-y-4">
        <button 
          onClick={handleCreateOnChain}
          disabled={loading}
          className="w-full bg-white text-black font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl hover:bg-primary transition-all disabled:opacity-50"
        >
          {loading ? <Zap className="animate-spin" /> : <><ShieldCheck size={24} /> Initialize Contract</>}
        </button>
      </div>
    </div>
  );
}

// ⸻ PRODUCT REGISTRY (ON-CHAIN) ⸻

function ProductsView({ setScreen }) {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    setIsRegistering(true);
    setTimeout(() => {
      alert('Product Registered. CID pinned. 0.009 BNB Sent to Treasury.');
      setShowRegister(false);
      setIsRegistering(false);
    }, 3000);
  };

  const handleVerify = () => {
    if (search === 'GG_THLX_000042') {
      setResult({ 
        status: 'authentic', 
        name: 'Luxury Watch X1', 
        manufacturer: 'Thalexa Chrono Labs', 
        tx: '0xabc7294...def',
        ipfs_cid: 'QmXoyp...7V2c',
        location: 'Geneva, Switzerland',
        date: 'May 03, 2026'
      });
    } else {
      setResult({ status: 'unknown' });
    }
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto">
       <header className="flex justify-between items-center mb-12">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter font-heading text-left">Product Registry</h2>
          <button 
            onClick={() => setShowRegister(!showRegister)}
            className="flex items-center gap-3 px-8 py-4 glass rounded-2xl text-primary border border-primary/20 hover:bg-primary/5 transition-all font-black uppercase text-xs"
          >
            {showRegister ? <><Search size={20} /> Verify</> : <><Zap size={20} /> Register</>}
          </button>
       </header>
       
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            {showRegister ? (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8 glass p-12 rounded-[4rem] border border-white/5">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-primary font-heading">On-Chain Registry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Item Identity" placeholder="e.g. Masterpiece #4" />
                    <FormInput label="Serial Number" placeholder="THLX-XXXX-XXXX" />
                  </div>
                  <FormInput label="Description (Stored in IPFS)" placeholder="Luxury quality details..." />
                  
                  <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-black uppercase tracking-widest font-mono-custom">Treasury Fee</span>
                      <span className="text-lg font-black text-white italic font-heading">0.009 BNB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-black uppercase tracking-widest font-mono-custom">Storage Infrastructure</span>
                      <span className="text-lg font-black text-secondary uppercase font-heading">IPFS / PINATA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-black uppercase tracking-widest font-mono-custom">Target Network</span>
                      <span className="text-lg font-bold text-white uppercase font-heading">BNB Chain</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-primary text-black font-black py-8 rounded-[3rem] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 text-xl font-heading hover:scale-[1.02] transition-transform"
                  >
                    {isRegistering ? <Zap className="animate-spin" /> : <><ShieldCheck size={28}/> Sign & Broadcast</>}
                  </button>
              </motion.div>
            ) : (
              <div className="space-y-12">
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <input 
                      type="text" 
                      placeholder="Enter Product Registry ID..."
                      className="w-full glass bg-white/5 p-10 rounded-[3.5rem] outline-none border border-white/10 focus:border-primary transition-all font-black italic uppercase tracking-tighter text-3xl pr-32 font-heading"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button 
                      onClick={handleVerify}
                      className="absolute right-5 top-5 bg-primary text-black p-6 rounded-3xl hover:scale-105 transition-transform shadow-xl"
                    >
                      <Search size={32} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40">
                   <div className="glass p-10 rounded-[3rem] border border-white/5">
                      <div className="flex items-center gap-4 mb-4 text-primary">
                         <MapIcon size={24} />
                         <span className="text-xs font-black uppercase tracking-widest font-mono-custom">Traceability</span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed font-nevera">Every product scan records geographic data to prevent grey market diversion.</p>
                   </div>
                   <div className="glass p-10 rounded-[3rem] border border-white/5">
                      <div className="flex items-center gap-4 mb-4 text-secondary">
                         <Link size={24} />
                         <span className="text-xs font-black uppercase tracking-widest font-mono-custom">Immutability</span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed font-nevera">Metadata is hashed and pinned to IPFS, ensuring permanent digital truth.</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`p-12 rounded-[4rem] border-2 text-center relative overflow-hidden min-h-[600px] flex flex-col justify-center ${result.status === 'authentic' ? 'border-secondary/20 bg-secondary/5' : 'border-red-500/20 bg-red-500/5'}`}
                >
                  {result.status === 'authentic' ? (
                    <>
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-5"></div>
                      <div className="w-32 h-32 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-10 relative">
                        <CheckCircle2 size={72} className="text-secondary" />
                        <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-6xl font-black text-secondary mb-4 uppercase italic tracking-tighter leading-none font-heading">Authentic</h3>
                      <p className="text-3xl font-black mb-4 opacity-80 uppercase italic font-heading">{result.name}</p>
                      <div className="bg-white p-8 rounded-[3rem] w-fit mx-auto shadow-2xl relative mb-10 group">
                         <QRCodeSVG value={`https://thalexa.com/verify/${search}`} size={200} />
                         <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary transition-all rounded-[3rem]"></div>
                      </div>
                      
                      <div className="space-y-6 text-left bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[9px] text-gray-500 font-black uppercase mb-1 font-mono-custom">Origin</p>
                               <p className="text-xs font-bold text-white uppercase italic">{result.location}</p>
                            </div>
                            <div>
                               <p className="text-[9px] text-gray-500 font-black uppercase mb-1 font-mono-custom">Protocol ID</p>
                               <p className="text-xs font-bold text-white uppercase italic tracking-tighter">{search}</p>
                            </div>
                         </div>
                         <div className="pt-4 border-t border-white/5">
                            <p className="text-[9px] text-primary font-black uppercase mb-2 font-mono-custom flex items-center gap-2 italic">
                              <Database size={10} /> IPFS Metadata CID
                            </p>
                            <div className="flex items-center justify-between glass px-4 py-2 rounded-xl">
                               <p className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]">{result.ipfs_cid}</p>
                               <a href={`https://gateway.pinata.cloud/ipfs/${result.ipfs_cid}`} target="_blank" rel="noreferrer" className="text-primary hover:text-white transition-colors">
                                  <ExternalLink size={12} />
                               </a>
                            </div>
                         </div>
                         <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono italic pt-2">
                           <Link size={10} /> TX: {result.tx}
                         </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertCircle size={56} className="text-red-500" />
                      </div>
                      <h3 className="text-5xl font-black text-red-500 mb-4 uppercase italic tracking-tighter font-heading">Invalid</h3>
                      <p className="text-gray-400 text-lg italic font-medium px-8 leading-relaxed font-nevera">Critical: This identity hash was not found in the Thalexa BNB Chain registry. Authenticity cannot be verified.</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
       </div>
    </div>
  );
}

// ⸻ UTILITY COMPONENTS ⸻

function FormInput({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="glass p-6 rounded-[2rem] border border-white/10 group focus-within:border-primary/50 transition-all">
      <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block italic italic">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-transparent outline-none font-black text-lg italic tracking-tighter text-white placeholder:text-white/10" 
      />
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex-1 glass bg-white/5 py-5 rounded-[1.8rem] flex items-center justify-center gap-2 font-black italic uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/5"
    >
      {React.cloneElement(icon, { size: 18 })} {label}
    </button>
  );
}

function AssetItem({ name, symbol, balance, value, color, icon }) {
  return (
    <div className="glass p-5 rounded-[2.5rem] flex items-center gap-5 border border-white/5 transition-all hover:bg-white/[0.03] group">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic border border-white/10 shadow-lg group-hover:scale-105 transition-transform" style={{ backgroundColor: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-black italic uppercase tracking-tighter text-lg">{name}</p>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">{balance} {symbol}</p>
      </div>
      <div className="text-right font-black italic tracking-tighter">
        {value}
      </div>
    </div>
  );
}

function UsageProgress({ label, current, max }) {
  const percent = (current / max) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest italic">
        <span className="text-gray-500">{label}</span>
        <span className="text-white">{current} / {max}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className="h-full bg-primary"
        />
      </div>
    </div>
  );
}

function Onboarding({ onLogin, loading }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8 text-center bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-48 h-48 bg-primary/10 rounded-[4rem] border border-primary/20 flex items-center justify-center mb-12 relative z-10 shadow-3xl shadow-primary/10"
      >
        <ShieldCheck size={96} className="text-primary" />
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
      </motion.div>
      
      <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-6 relative z-10 font-heading">Thalexa</h1>
      <p className="text-gray-500 mb-12 text-xl font-medium max-w-lg relative z-10 font-nevera">Secure Web3 verification, escrow, and global commerce infrastructure. <br /> Powered by BNB Chain.</p>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <button 
          onClick={onLogin}
          disabled={loading}
          className="group w-full glass bg-white p-10 rounded-[3rem] flex items-center justify-center gap-4 hover:bg-primary transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          {loading ? (
            <Zap className="animate-spin text-black" size={32} />
          ) : (
            <span className="relative z-10 font-black uppercase tracking-widest text-xl text-black font-heading flex items-center gap-3">
              <Zap size={24} /> Access Verification Hub
            </span>
          )}
        </button>
        <p className="text-[12px] text-gray-600 uppercase font-black tracking-[0.4em] py-4 italic font-mono-custom animate-pulse">MPC Wallet Generation Active</p>
      </div>
    </div>
  );
}

function NavItem({ icon, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 transition-all rounded-2xl ${active ? 'bg-primary/10 text-primary shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
    >
      {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
    </button>
  );
}

function AdminView({ setScreen, stats }) {
  const [logs, setLogs] = useState([
    { id: 1, action: 'Product Registered', details: 'GG_THLX_000042', time: '10m ago', status: 'SUCCESS', cid: 'QmXoyp...7V2c' },
    { id: 2, action: 'Escrow Created', details: '2.5 BNB Locked', time: '2h ago', status: 'SUCCESS' },
    { id: 3, action: 'IPFS Pinning', details: 'Luxury Watch X1', time: '5h ago', status: 'SYNCED', cid: 'QmXo...2c' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = ['Asset release', 'Auth handshake', 'Node sync', 'Registry query', 'Escrow funded'];
      const statuses = ['SUCCESS', 'SYNCED', 'PENDING'];
      const newLog = {
        id: Date.now(),
        action: actions[Math.floor(Math.random() * actions.length)],
        time: 'Just now',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        tx: '0x' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 4)
      };
      setLogs(prev => [newLog, ...prev.slice(0, 4)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastMsg) return;
    setIsPublishing(true);
    try {
      await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastMsg })
      });
      setBroadcastMsg('');
      alert('Network Broadcast Sent.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setScreen('wallet')} className="p-5 glass rounded-[2rem] border border-white/10 hover:border-primary text-primary transition-all hover:scale-110 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ArrowDownLeft className="rotate-45 relative z-10" />
            </button>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter font-heading">Terminal</h2>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] font-mono-custom">Protocol Sync</p>
            <p className="text-2xl font-black text-primary font-heading italic tracking-tighter">v1.2.4-PROD</p>
          </div>
        </header>

        <section className="mb-12">
           <h3 className="text-xl font-black italic uppercase mb-6 tracking-tighter font-heading text-primary">Protocol Broadcast</h3>
           <div className="flex gap-4">
              <input 
                type="text" 
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Push network-wide protocol alert..."
                className="flex-1 glass bg-white/5 p-6 rounded-3xl outline-none border border-white/10 focus:border-primary transition-all font-bold uppercase tracking-widest text-xs font-mono-custom"
              />
              <button 
                onClick={handleBroadcast}
                disabled={isPublishing}
                className="bg-primary text-black px-10 py-6 rounded-3xl font-black uppercase text-xs font-heading hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                {isPublishing ? <Zap className="animate-spin" /> : <><Zap size={18}/> Push 10.4k Nodes</>}
              </button>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <AdminStat label="Total Assets" val="$324.5M" delta="+12.4%" icon={<TrendingUp size={28}/>} />
            <AdminStat label="BNB Treasury" val={stats?.treasury_balance || '84.5 BNB'} delta="+1.2 BNB" icon={<Database size={28}/>} color="text-secondary" />
            <AdminStat label="Nodes Active" val="12,492" delta="100.0%" icon={<ShieldCheck size={28}/>} />
        </div>

        <div className="glass p-12 rounded-[4rem] border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-primary font-mono-custom tracking-[0.2em]">Flux Log</span>
             </div>
           </div>
           <h3 className="text-3xl font-black italic uppercase mb-10 tracking-tighter font-heading">Network Interaction Log</h3>
           <div className="space-y-4">
              {logs.map(log => (
                <LogEntry key={log.id} user="protocol_node_42" action={log.action} status={log.status} tx={log.cid || "0x9f...a8"} />
              ))}
           </div>
        </div>
      </div>

      <div className="lg:col-span-4 pt-4 md:pt-24 space-y-8 text-left">
          <div className="glass p-10 rounded-[3.5rem] border border-primary/20 bg-primary/5">
             <h4 className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-6 font-mono-custom">Network Health</h4>
             <div className="space-y-6">
                <UsageProgress label="Block Latency" current={12} max={100} />
                <UsageProgress label="IPFS Propagation" current={94} max={100} />
             </div>
          </div>
          
          <div className="glass p-10 rounded-[3.5rem] border border-white/5">
             <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-4 font-mono-custom">Infrastructure Status</h4>
             <ul className="space-y-4 font-mono-custom text-[10px] uppercase font-bold tracking-widest">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>EVM Bridge</span> <span className="text-secondary">Connected</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>PINATA API</span> <span className="text-secondary">Operational</span></li>
                <li className="flex justify-between"><span>Supabase Auth</span> <span className="text-secondary">Verified</span></li>
             </ul>
          </div>
      </div>
    </div>
  );
}

function AdminStat({ label, val, delta, icon, color = "text-primary" }) {
  return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 hover:border-white/20 transition-all group">
       <div className={`${color} mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
       <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{label}</p>
       <p className="text-3xl font-black italic mb-2 tracking-tighter">{val}</p>
       <p className="text-[10px] text-secondary font-black">{delta}</p>
    </div>
  );
}

function LogEntry({ user, action, status, tx }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
       <div className="flex gap-4 items-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div>
            <p className="text-xs font-black italic leading-none mb-1">{action}</p>
            <p className="text-[10px] text-gray-500 font-mono italic">{user}</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-[10px] font-black text-secondary leading-none mb-1">{status}</p>
          <p className="text-[8px] text-gray-600 font-mono italic">{tx}</p>
       </div>
    </div>
  );
}

function SettingsView({ user, setScreen, setUser }) {
  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <header className="mb-12">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter font-heading text-left">Control Center</h2>
          <p className="text-gray-500 font-nevera text-lg font-medium mt-4">Manage your protocol parameters and billing details.</p>
        </header>

        <div className="glass p-12 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden bg-primary/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
          <div className="flex items-center gap-8 mb-12">
            <div className="w-24 h-24 rounded-[1.8rem] bg-primary flex items-center justify-center text-white text-5xl font-black italic border border-primary/20 shadow-2xl font-heading">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-3xl font-black italic tracking-tighter mb-1 uppercase font-heading">{user.email.split('@')[0]}</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] font-mono-custom opacity-80 mb-2">Protocol UID: {user.id || 'ACTIVE_SESSION_01'}</p>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[9px] font-black uppercase tracking-widest font-mono-custom">Level 4 Node</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-12">
            <SettingItem icon={<CreditCard size={20} />} label="Paystack Billing Hub" onClick={() => setScreen('subscriptions')} />
            {user.email === 'emmanuelobed877@gmail.com' && (
              <SettingItem icon={<LayoutDashboard size={20} />} label="Command Dashboard" onClick={() => setScreen('admin')} />
            )}
            <SettingItem icon={<ShieldCheck size={20} />} label="Biometric Signer" />
            <SettingItem icon={<History size={20} />} label="Blockchain Events" />
          </div>

          <button 
            onClick={() => { setUser(null); setScreen('landing'); }}
            className="w-full glass p-8 rounded-[2.5rem] text-red-500 font-black italic uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl font-heading"
          >
            <LogOut size={24} /> Decommission Terminal
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-end">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
            <div className="glass p-10 rounded-[3.5rem] border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
               <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4 font-heading">Metadata Privacy</h4>
               <p className="text-xs text-gray-500 font-nevera leading-relaxed">Toggle zero-knowledge proofs for product registrations. Requires Enterprise tier.</p>
            </div>
            <div className="glass p-10 rounded-[3.5rem] border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
               <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4 font-heading">Multi-Chain Sync</h4>
               <p className="text-xs text-gray-500 font-nevera leading-relaxed">Bridge assets between BNB Chain and other EVM compatible networks.</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-white/[0.03] rounded-2xl transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-black text-xs uppercase tracking-widest italic">{label}</span>
      </div>
      <ChevronRight size={14} className="text-gray-700" />
    </button>
  );
}

function SubscriptionsView({ user, setScreen }) {
  const plans = [
    { title: 'Starter Node', price: '0.00 BNB', limit: '10 Verification/mo', features: ['Public Registry Access', 'Basic Traceability', 'Community Support'], color: 'gray' },
    { title: 'Professional', price: '0.05 BNB', limit: 'Unlimited Verification', features: ['MPC Wallet Identity', 'Bulk Verification API', 'Priority IPFS Sync', 'Escrow System Access'], color: 'primary' },
    { title: 'Enterprise', price: '0.25 BNB', limit: 'Infinite Nodes', features: ['ZK-Proof Privacy', 'Custom Smart Contracts', '24/7 Governance Support', 'White-label SDK'], color: 'secondary' },
  ];

  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto">
      <header className="flex items-center gap-6 mb-16">
        <button onClick={() => setScreen('settings')} className="p-5 glass rounded-[2rem] border border-white/10 text-primary transition-all hover:scale-110 shadow-xl font-heading">
          <ArrowDownLeft className="rotate-45" />
        </button>
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter font-heading">Infrastructure</h2>
          <p className="text-gray-500 font-nevera text-lg font-medium">Select your protocol throughput and capacity.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((p) => (
          <div key={p.title} className={`p-10 rounded-[4rem] border relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[600px] ${user.plan === p.title.toLowerCase() ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-white/5 glass hover:border-white/20'}`}>
             <div className="absolute top-0 right-0 p-8">
                {user.plan === p.title.toLowerCase() && <CheckCircle2 className="text-primary animate-pulse" size={32} />}
             </div>
             
             <div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2 font-heading">{p.title}</h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] font-mono-custom mb-8">{p.limit} Throughput</p>
                
                <div className="mb-10">
                   <p className="text-5xl font-black italic tracking-tighter leading-none mb-1 font-heading">{p.price}</p>
                   <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] font-mono-custom">Protocol Fee / Month</p>
                </div>

                <div className="space-y-4">
                   {p.features.map((f, fi) => (
                     <div key={fi} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-tight font-nevera">{f}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             {user.plan === p.title.toLowerCase() ? (
               <div className="w-full py-6 text-center text-primary font-black uppercase tracking-widest bg-primary/10 rounded-[2rem] text-sm italic shadow-inner font-heading border border-primary/20">Active Node Architecture</div>
             ) : (
               <button 
                 onClick={() => window.open('https://paystack.com', '_blank')}
                 className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[2rem] text-sm transition-all hover:scale-[1.02] hover:bg-primary shadow-2xl font-heading"
               >
                 Initialize Node
               </button>
             )}
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
         <p className="text-gray-600 text-xs font-black uppercase tracking-[0.4em] font-mono-custom italic">Payments processed via BNB Native or Paystack Gateway</p>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
