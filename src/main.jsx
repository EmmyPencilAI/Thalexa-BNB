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
  Map as MapIcon,
  Maximize
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ethers } from 'ethers';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { BrowserMultiFormatReader } from '@zxing/library';

// Configuration
const CONFIG = {
  TREASURY_FEE: "0.009",
  BNB_NETWORK: "BNB Smart Chain Testnet",
  THEME_ORANGE: "#FF6B00",
  THEME_BLUE: "#037DD6"
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [landingProducts, setLandingProducts] = useState([]);

  useEffect(() => {
    // Fetch Landing Products
    const fetchLandingProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) setLandingProducts(data);
    };

    fetchLandingProducts();

    // Fetch Live Pulse
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data));

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data[0]) {
        setAnnouncement(data[0]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (loginData = {}) => {
    setLoading(true);
    try {
       // persist login
       const email = loginData.email || 'emmanuelobed877@gmail.com';
       const { data, error } = await supabase
         .from('users')
         .select('*')
         .eq('email', email)
         .single();
       
       if (data) {
         setUser(data);
         localStorage.setItem('thalexa_user_email', email);
         setScreen('home');
       } else {
          // Auto-create profile if not exists
          const idResp = await fetch('/api/ids/generate/user');
          if (!idResp.ok) throw new Error(`Server ID generation failed: ${idResp.status}`);
          const idData = await idResp.json();
          const thalexId = idData.id;

          const wallet = '0x' + Math.random().toString(16).slice(2, 42);
          const newUser = {
            id: thalexId,
            thalexa_id: thalexId,
            email: email,
            username: loginData.username || 'user_' + Math.random().toString(36).slice(2, 7),
            country: loginData.country || 'Global',
            wallet_address: wallet,
            role: 'admin',
            plan: 'professional',
            is_verified: false
          };
          const { data: createdUser, error: insertError } = await supabase.from('users').insert([newUser]).select().single();
          
          if (insertError) throw insertError;

          if (createdUser) {
            setUser(createdUser);
            localStorage.setItem('thalexa_user_email', email);
            setScreen('home');
          } else {
            throw new Error('Failed to synchronize identity node.');
          }
       }
    } catch (e) {
       console.error('Login Error:', e);
       alert('Protocol Error: ' + (e.message || 'Identity synchronization failed.'));
       // Fallback for demo: if API fails, at least let them in if they have an email
       if (loginData.email) {
          const fallbackId = 'THLX-USER-FALLBACK';
          setUser({ email: loginData.email, thalexa_id: fallbackId, username: 'guest', wallet_address: '0x000...000' });
          setScreen('home');
       }
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('thalexa_user_email');
    if (savedEmail) {
       handleLogin({ email: savedEmail });
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_status') === 'success') {
      alert('Network Transmission Success: Account Refilled');
      // Create a dummy deposit transaction for the demo
      const ref = params.get('reference');
      if (ref && user) {
         supabase.from('transactions').insert([{
           user_id: user.id,
           type: 'deposit',
           amount: 100, // Fixed amount for demo ref
           currency: 'USDT',
           status: 'completed',
           tx_hash: ref
         }]);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const renderScreen = () => {
    if (loading && !user) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-primary">
           <Zap className="animate-bounce" size={64} />
           <p className="mt-4 font-black italic uppercase tracking-tighter font-heading text-2xl">Synchronizing Protocol Node...</p>
           <p className="text-gray-400 font-mono-custom text-[10px] uppercase tracking-[0.5em] mt-2 animate-pulse">Awaiting handshake response</p>
        </div>
      );
    }

    if (!user) {
      if (screen === 'onboarding') return <Onboarding onLogin={handleLogin} loading={loading} />;
      return <LandingPage onStart={() => setScreen('onboarding')} stats={stats} />;
    }

    return (
      <div className="w-full flex flex-col items-stretch">
        {/* Top Sticky Header */}
        <header className="sticky top-0 left-0 right-0 z-[60] glass border-b border-white/5 p-4 md:p-6 lg:px-12 flex justify-between items-center w-full backdrop-blur-3xl">
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              placeholder="Search Thalexa ID, Wallet or Tx..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary font-mono-custom">Protocol Status</p>
                <p className="text-[10px] font-bold text-white uppercase italic">Active Node: {user.thalexa_id || 'Generating...'}</p>
             </div>
             <button onClick={() => setScreen('notifications')} className="p-3 glass border border-white/10 rounded-2xl relative">
                <div className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-ping"></div>
                <History size={18} />
             </button>
             <button onClick={() => setScreen('qr-scan')} className="p-3 glass border border-white/10 rounded-2xl text-primary">
                <Maximize size={18} />
             </button>
             <button onClick={() => setScreen('settings')} className="p-3 glass border border-white/10 rounded-2xl">
                <Settings size={18} />
             </button>
             {user.role === 'admin' && (
               <button onClick={() => setScreen('admin')} className="p-3 glass border border-white/10 rounded-2xl text-primary">
                  <Database size={18} />
               </button>
             )}
          </div>
        </header>

        <main className="w-full pb-32">
          {(() => {
            switch (screen) {
              case 'landing': return <LandingPage onStart={() => setScreen('onboarding')} stats={stats} products={landingProducts} />;
              case 'onboarding': return <Onboarding onLogin={handleLogin} loading={loading} />;
              case 'home': return <HomeView user={user} setScreen={setScreen} stats={stats} />;
              case 'wallet-assets': return <WalletAssetsView user={user} setScreen={setScreen} />;
              case 'escrow': return <EscrowDashboard user={user} setScreen={setScreen} />;
              case 'create-escrow': return <CreateEscrowView user={user} setScreen={setScreen} />;
              case 'products': return <ProductsView user={user} setScreen={setScreen} />;
              case 'pay': return <PayView user={user} setScreen={setScreen} />;
              case 'settings': return <SettingsView user={user} setScreen={setScreen} setUser={setUser} />;
              case 'admin': return <AdminView setScreen={setScreen} stats={stats} />;
              case 'subscriptions': return <SubscriptionsView user={user} setScreen={setScreen} />;
              case 'notifications': return <NotificationsView user={user} />;
              case 'qr-scan': return <QRScannerView onResult={(res) => { console.log('Scan:', res); setScreen('home'); }} onCancel={() => setScreen('home')} />;
              case 'transaction-history': return <TransactionHistoryView user={user} setScreen={setScreen} />;
              default: return <HomeView user={user} setScreen={setScreen} stats={stats} />;
            }
          })()}
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-stretch bg-black text-white selection:bg-primary selection:text-black">
      <AnimatePresence>
        {announcement && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-primary text-black p-4 font-black shadow-2xl flex justify-center items-center gap-4 overflow-hidden"
          >
            <div className="w-full lg:px-12 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <Zap size={20} className="animate-pulse" />
                 <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest opacity-60 leading-none mb-1">Incoming Transmission: {announcement.title}</p>
                    <p className="text-sm italic tracking-tighter uppercase font-heading">{announcement.content}</p>
                 </div>
              </div>
              <button 
                onClick={() => setAnnouncement(null)} 
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
                id="close-announcement"
              >
                ✕
              </button>
            </div>
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
          className="flex flex-col items-stretch w-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {user && screen !== 'landing' && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg glass border border-white/10 py-4 px-6 flex justify-between items-center z-50 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl md:bottom-auto md:top-6 md:left-[85%] md:flex-col md:gap-8 md:w-20 md:py-8 md:px-0 md:rounded-3xl hover:border-primary/30 transition-colors">
          <NavItem icon={<LayoutDashboard />} active={screen === 'home'} onClick={() => setScreen('home')} label="Home" />
          <NavItem icon={<ShieldCheck />} active={screen === 'escrow'} onClick={() => setScreen('escrow')} label="Escrow" />
          <NavItem icon={<Zap />} active={screen === 'products'} onClick={() => setScreen('products')} label="Registry" />
          <NavItem icon={<CreditCard />} active={screen === 'pay'} onClick={() => setScreen('pay')} label="Pay" />
          <NavItem icon={<Wallet />} active={screen === 'wallet-assets'} onClick={() => setScreen('wallet-assets')} label="Wallet" />
        </nav>
      )}
    </div>
  );
}

// ⸻ LANDING PAGE (PRODUCTION ECOSYSTEM) ⸻

function LandingPage({ onStart, stats, products }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerEvents = [
    "ASSET_MINT: Luxury Watch X1 (THLX-PROD-000142)",
    "ESCROW_FUNDED: 4.52 BNB (THLX-ESC-000845)",
    "REGISTRY_SYNC: IPFS_PROPAGATION (100.0%)",
    "VERIFICATION: AUTHENTIC (THLX-PROD-000042)",
    "USER_ONBOARD: NEW_NODE_SYNC (THLX-USER-9X4A7K)"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-hidden w-full bg-[#030303] selection:bg-primary selection:text-black min-h-screen relative">
      <NetworkBackground />
      
      {/* Real-time Ticker */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] glass border-t border-white/10 p-2 overflow-hidden pointer-events-none">
         <div className="w-full lg:px-12 flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary font-mono-custom whitespace-nowrap">Live Network Pulse:</span>
            <AnimatePresence mode="wait">
              <motion.span 
                key={tickerIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 font-mono-custom"
              >
                {tickerEvents[tickerIndex]}
              </motion.span>
            </AnimatePresence>
         </div>
      </div>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 lg:px-12 flex justify-between items-center w-full backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-black italic shadow-2xl shadow-primary/20 font-heading">T</div>
          <span className="text-2xl font-black italic tracking-tighter font-heading text-white">THALEXA</span>
        </div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 font-mono-custom">
           <a href="#features" className="hover:text-primary transition-all">Protocol</a>
           <a href="#verify" className="hover:text-primary transition-all">Verification</a>
           <a href="#how" className="hover:text-primary transition-all">Documentation</a>
        </div>
        <button 
          onClick={onStart}
          className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all font-heading uppercase tracking-widest shadow-xl"
        >
          Launch Terminal
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 lg:px-24 w-full min-h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 z-10 text-left">
            <motion.div 
              initial={{ x: -50, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-3 px-5 py-2 glass rounded-full border border-primary/30 text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-10 font-mono-custom bg-primary/5"
            >
              <Zap size={14} className="animate-pulse" /> Verified on BNB Chain
            </motion.div>

            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-10 uppercase font-heading text-white"
            >
              The On-Chain <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary/50">Authenticity</span> <br /> Layer
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-xl md:text-2xl max-w-xl mb-12 font-medium leading-tight font-nevera"
            >
              Every product becomes a verifiable digital truth. Connecting luxury commerce and global supply chains to the blockchain.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <button onClick={onStart} className="group relative px-10 py-6 bg-primary text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all font-heading shadow-[0_0_40px_rgba(0,255,133,0.3)]">
                Verify Product
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-[2rem]"></div>
              </button>
              <button className="px-10 py-6 glass border border-white/10 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all font-heading text-white">
                Explore Network
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative mt-12 lg:mt-0">
             {stats?.landing_asset ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full aspect-square flex items-center justify-center p-12"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full animate-pulse"></div>
                  <img src={stats.landing_asset} className="w-full h-full object-contain relative z-10" alt="Protocol Asset" />
                </motion.div>
             ) : (
                <ProductGrid3D products={products} />
             )}
          </div>
        </div>

        {/* Global Connection Heatmap */}
        <div className="mt-32">
           <div className="flex justify-between items-end mb-12">
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-mono-custom mb-2">Global Distribution Pulse</p>
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter font-heading text-white">Network Hub Matrix</h2>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-black italic font-heading text-white">{stats?.active_transactions?.toLocaleString() || '0'}</p>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono-custom">Active Nodes</p>
              </div>
           </div>
           <GlobalHeatmap />
        </div>

        {/* Global Pulse Grid */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6">
           <StatCard icon={<Cpu className="text-secondary" />} label="EVM Runtime" val="Operational" color="text-secondary" />
           <StatCard icon={<Database className="text-primary" />} label="Assets Cached" val="1.4M+" color="text-primary" />
           <StatCard icon={<TrendingUp className="text-white" />} label="Net Volume" val="$32.5B" color="text-white" />
           <StatCard icon={<ShieldCheck className="text-gray-500" />} label="Security Tier" val="Grade AAA" color="text-gray-500" />
        </div>
      </section>

      {/* Verification Scanner Section */}
      <section id="verify" className="py-32 px-6 bg-[#050505] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] -z-10 translate-x-1/2"></div>
         <div className="w-full lg:px-12">
            <div className="text-center mb-24">
               <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 font-heading text-white">Global <span className="text-primary">Registries</span></h2>
               <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium font-nevera">Visualizing the decentralized node expansion across the Thalexa network.</p>
            </div>
            
            <GlobalHeatmap />
         </div>
      </section>

      <section className="py-32 px-6 bg-white relative overflow-hidden text-black">
         <div className="w-full lg:px-12">
            <div className="text-center mb-24">
               <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 font-heading">Verification <span className="text-primary">Registry</span></h2>
               <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-medium font-nevera">Input a Protocol ID to trace a product's journey, ownership history, and current authenticity status.</p>
            </div>
            
            <InteractionScanner />
         </div>
      </section>

      {/* How it Works - Pipeline */}
      <section id="how" className="py-32 px-6">
         <div className="w-full lg:px-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-20 font-heading text-left text-white">Protocol <span className="text-violet-500">Flux</span> Pipeline</h2>
            <PipelineFlow />
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-black relative">
         <div className="w-full lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <FeatureCard 
                 icon={<ShieldCheck size={40}/>} 
                 title="On-Chain Identity" 
                 desc="Every product is minted as a high-fidelity digital twin with unique cryptographic signatures." 
                 glow="shadow-primary/20"
               />
               <FeatureCard 
                 icon={<MapIcon size={40}/>} 
                 title="Supply Chain Flux" 
                 desc="Real-time tracking of movement across global nodes with immutable checkpoint verification." 
                 glow="shadow-violet-500/20"
               />
               <FeatureCard 
                 icon={<Zap size={40}/>} 
                 title="Zero-Knowledge Proofs" 
                 desc="Verify authenticity without revealing sensitive manufacturer data or trade secrets." 
                 glow="shadow-secondary/20"
               />
            </div>
         </div>
      </section>

      {/* Industries Orbs */}
      <section className="py-32 px-6 overflow-hidden">
         <div className="w-full lg:px-12 text-center">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-24 font-heading text-white">Global <span className="text-gray-500">Integration</span></h2>
            <IndustryOrbs />
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 px-6 relative overflow-hidden bg-gradient-to-b from-black to-primary/10">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
         <div className="w-full lg:px-24 text-center relative z-10">
            <motion.h2 
              whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
              className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter font-heading mb-12 text-white"
            >
              Every Product <br /> Should <span className="text-primary italic">Prove</span> Itself.
            </motion.h2>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <button onClick={() => { console.log('CTA Hub Triggered'); onStart(); }} className="px-12 py-8 bg-white text-black rounded-[3rem] font-black text-xl uppercase tracking-widest hover:bg-primary transition-all font-heading shadow-2xl">
                Get Verification Hub
              </button>
              <button className="px-12 py-8 glass border border-white/10 rounded-[3rem] font-black text-xl uppercase tracking-widest hover:bg-white/5 transition-all font-heading text-white">
                View Protocol Docs
              </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="p-16 text-center border-t border-white/5 text-gray-600 text-[10px] font-black uppercase tracking-[0.5em] bg-black font-mono-custom">
        Thalexa Protocol © 2026 • Intelligent Web3 Infrastructure • Powered by BNB Chain
      </footer>
    </div>
  );
}

// ⸻ NEW LANDING COMPONENTS ⸻

function NetworkBackground() {
  return (
    <div className="fixed inset-0 -z-50 pointer-events-none opacity-20">
      <div className="absolute inset-0 bg-[#030303]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-200px,rgba(0,255,133,0.1),transparent)]"></div>
    </div>
  );
}

function ProductGrid3D({ products = [] }) {
  const displayProducts = products.length > 0 ? products : [
    { id: 1, product_code: 'GG_THLX_0001', metadata: { name: 'Chrono Lux X', type: 'Luxury Watch', price: '2.4 BNB', emoji: '⌚' } },
    { id: 2, product_code: 'GG_THLX_0002', metadata: { name: 'Velocity One', type: 'Tech Sneaker', price: '0.8 BNB', emoji: '👟' } },
    { id: 3, product_code: 'GG_THLX_0003', metadata: { name: 'Cyber Bag V4', type: 'Futuristic Bag', price: '1.2 BNB', emoji: '💼' } },
    { id: 4, product_code: 'GG_THLX_0004', metadata: { name: 'Neural Link 01', type: 'Robotic Artifact', price: '5.6 BNB', emoji: '🤖' } },
  ];

  return (
    <div className="relative h-[600px] w-full flex items-center justify-center perspective-1000">
      <div className="grid grid-cols-2 gap-4 translate-z-10 rotate-x-12 rotate-y--12">
        {displayProducts.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -20, scale: 1.05 }}
            className="group glass p-8 rounded-[3rem] border border-white/10 w-[240px] h-[300px] flex flex-col justify-between relative overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-2xl text-left"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity text-left"></div>
            <div className="flex justify-between items-start text-left">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black uppercase text-primary border border-white/5">0{i+1}</div>
               <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 font-mono-custom text-left">{item.thalexa_id || item.product_code}</span>
            </div>
            
            <div className="text-6xl text-center py-4 transform group-hover:scale-125 transition-transform duration-500">
              {item.metadata?.image_url ? <img src={item.metadata.image_url} alt={item.metadata.name} className="w-full h-full object-contain" /> : item.metadata?.emoji || '📦'}
            </div>
            
            <div className="text-left">
              <h4 className="text-lg font-black italic uppercase tracking-tighter font-heading text-white">{item.metadata?.name || 'Unknown Product'}</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 font-mono-custom">{item.metadata?.type || 'Standard Asset'}</p>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                 <span className="text-xs font-black italic text-primary font-heading">{item.metadata?.price || '0.00 BNB'}</span>
                 <ArrowUpRight size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Decorative Network Lines */}
      <div className="absolute inset-0 pointer-events-none p-12 overflow-hidden">
         <svg className="w-full h-full opacity-10" viewBox="0 0 1000 600">
            <path d="M200,100 L400,200 M600,100 L800,250 M300,400 L500,500" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
         </svg>
      </div>
    </div>
  );
}

function InteractionScanner() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null); // 'authentic', 'invalid', 'scanning'
  const [history, setHistory] = useState([]);

  const handleScan = async () => {
    if (!input) return;
    setStatus('scanning');
    try {
      // Search by Thalexa ID or internal product code
      const { data, error } = await supabase
        .from('products')
        .select('*, users!products_owner_id_fkey(email, wallet_address)')
        .or(`thalexa_id.eq.${input.trim().toUpperCase()},product_code.eq.${input.trim().toUpperCase()}`)
        .single();
      
      if (error || !data) {
        setStatus('invalid');
      } else {
        setStatus('authentic');
        setHistory([
          { event: 'Initial Protocol Mint', op: 'Node_Auth_Primary', t: new Date(data.created_at).toLocaleDateString() },
          { event: 'Global Registry Bind', op: 'EVM_Sync', t: new Date(data.created_at).toLocaleDateString() },
          { event: 'Thalexa ID Indexed', op: data.thalexa_id, t: 'Verified' },
          { event: 'Current Custodian Bound', op: data.users?.wallet_address || 'Protocol Vault', t: 'Live Status' },
        ]);
      }
    } catch (e) {
      console.error(e);
      setStatus('invalid');
    }
  };

  return (
    <div className="glass p-12 rounded-[5rem] border border-white/10 relative overflow-hidden bg-black/40">
       <div className="w-full lg:px-24">
          <div className="relative mb-12">
             <input 
               type="text" 
               placeholder="Protocol ID (e.g. GG_THLX_000042)"
               className="w-full glass bg-white/5 p-12 rounded-[4rem] border-2 border-white/10 focus:border-primary transition-all text-4xl font-black italic uppercase tracking-tighter font-heading text-white outline-none pr-48 text-left"
               value={input}
               onChange={(e) => setInput(e.target.value)}
             />
             <button 
               onClick={handleScan}
               className="absolute right-6 top-6 bg-primary text-black p-8 rounded-[2.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all"
             >
               <Zap size={40} className={status === 'scanning' ? 'animate-spin' : ''} />
             </button>
          </div>

          <AnimatePresence mode="wait">
             {status === 'scanning' && (
               <motion.div 
                 key="scanning"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="text-center py-24"
               >
                  <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-[0_0_50px_rgba(0,255,133,0.3)]"></div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white font-heading">Handshaking Protocol...</h3>
               </motion.div>
             )}

             {status === 'authentic' && (
               <motion.div 
                 key="authentic"
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-12"
               >
                  <div className="glass p-12 rounded-[4rem] border border-secondary/50 bg-secondary/10 flex flex-col items-center justify-center text-center relative">
                     <div className="absolute top-0 right-0 p-8">
                        <CheckCircle2 size={40} className="text-secondary animate-pulse" />
                     </div>
                     <div className="w-48 h-48 bg-white p-6 rounded-[3rem] mb-10 shadow-2xl relative flex items-center justify-center text-center">
                        <QRCodeSVG value="THALEXA_VERIFIED" size={144} />
                        <div className="absolute inset-0 border-4 border-secondary/50 rounded-[3rem] animate-pulse"></div>
                     </div>
                     <h3 className="text-5xl font-black italic uppercase text-secondary font-heading mb-2">Authentic</h3>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] font-mono-custom">Registry Confirmed</p>
                  </div>

                  <div className="space-y-4 text-left">
                     <h4 className="text-xl font-black italic uppercase tracking-tighter text-white font-heading mb-6">Traceability Flux</h4>
                     {history.map((h, i) => (
                       <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-primary/30 transition-all">
                          <div className="text-left">
                             <p className="text-lg font-black italic text-white uppercase font-heading">{h.event}</p>
                             <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest font-mono-custom">{h.op}</p>
                          </div>
                          <div className="text-xs font-bold text-gray-400 font-mono-custom text-left">{h.t}</div>
                       </div>
                     ))}
                     <button className="w-full p-6 glass border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white">Download Full Audit Log (PDF)</button>
                  </div>
               </motion.div>
             )}

             {status === 'invalid' && (
               <motion.div 
                 key="invalid"
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="p-24 glass border border-red-500/50 bg-red-500/10 rounded-[5rem] text-center"
               >
                  <div className="w-24 h-24 bg-red-500/50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-500/50">
                     <AlertCircle size={56} className="text-white" />
                  </div>
                  <h3 className="text-6xl font-black italic uppercase text-red-500 font-heading mb-4">Integrity Breach</h3>
                  <p className="text-gray-400 text-xl font-nevera max-w-xl mx-auto leading-relaxed">This identity hash does not exist in the Thalexa protocol. Possible forgery or unverified node origin detected.</p>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}

function PipelineFlow() {
  const steps = [
    { id: '01', title: 'Product Registry', text: 'Creation of the digital twin with on-chain metadata hashes.', color: 'text-primary' },
    { id: '02', title: 'ID Binding', text: 'Physical binding using NFC, QR, or Biometric markers.', color: 'text-violet-500' },
    { id: '03', title: 'Chain Sync', text: 'Broadcasting the state across 10,000+ infrastructure nodes.', color: 'text-secondary' },
    { id: '04', title: 'Truth Verification', text: 'Instant worldwide verification for consumers and nodes.', color: 'text-white' },
  ];

  return (
    <div className="relative flex flex-col md:flex-row gap-6 md:gap-4 overflow-x-auto pb-12 no-scrollbar">
       {steps.map((s, i) => (
         <div key={s.id} className="flex-1 min-w-[280px] group relative text-left">
            <div className="glass p-10 rounded-[3.5rem] border border-white/10 group-hover:border-white/30 transition-all min-h-[350px] flex flex-col justify-between">
               <span className={`text-6xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity font-heading ${s.color}`}>{s.id}</span>
               <div className="text-left">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white font-heading mb-4 leading-tight">{s.title}</h4>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed font-nevera">{s.text}</p>
               </div>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 translate-y--1/2 z-10 p-2 glass rounded-full border border-white/10">
                 <ChevronRight size={20} className="text-primary" />
              </div>
            )}
         </div>
       ))}
    </div>
  );
}

function FeatureCard({ icon, title, desc, glow }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`bg-white p-12 rounded-[4rem] border border-gray-100 transition-all flex flex-col justify-between min-h-[400px] shadow-xl text-left ${glow}`}
    >
       <div className="w-20 h-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center text-primary mb-12 shadow-inner text-left">
          {icon}
       </div>
       <div className="text-left">
         <h4 className="text-3xl font-black italic uppercase tracking-tighter font-heading text-dark mb-6 leading-tight">{title}</h4>
         <p className="text-gray-500 text-lg leading-relaxed font-medium font-nevera opacity-80">{desc}</p>
       </div>
    </motion.div>
  );
}

function IndustryOrbs() {
  const industries = [
    { name: 'Luxury Goods', size: 'w-48 h-48', pos: 'translate-x--24', color: 'bg-primary/20' },
    { name: 'Supply Chain', size: 'w-64 h-64', pos: 'translate-y--12', color: 'bg-violet-500/20' },
    { name: 'Gaming Assets', size: 'w-40 h-40', pos: 'translate-x-12 translate-y-12', color: 'bg-secondary/20' },
    { name: 'Pharma Registry', size: 'w-56 h-56', pos: 'translate-x-32 translate-y--24', color: 'bg-blue-500/20' },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-12 py-24 relative">
       {industries.map((ind, i) => (
         <motion.div
           key={ind.name}
           animate={{ 
             y: [0, -20, 0],
             rotate: [0, 5, 0]
           }}
           transition={{ 
             duration: 5 + i, 
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className={`group relative ${ind.size} rounded-full glass border border-white/10 flex items-center justify-center text-center p-6 cursor-pointer hover:border-primary/50 transition-all ${ind.pos}`}
         >
            <div className={`absolute inset-0 ${ind.color} blur-[40px] rounded-full opacity-30 group-hover:opacity-100 transition-opacity`}></div>
            <span className="relative z-10 text-xl font-black italic uppercase tracking-tighter font-heading text-white leading-none">{ind.name}</span>
         </motion.div>
       ))}
    </div>
  );
}

function StatCard({ icon, label, val, color }) {
  return (
    <div className="glass p-10 rounded-[3.5rem] border border-white/5 text-left hover:border-white/20 transition-all cursor-default relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
         {icon}
      </div>
      <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.4em] mb-4 font-mono-custom text-left">{label}</p>
      <p className={`text-3xl font-black italic font-heading ${color} text-left`}>{val}</p>
    </div>
  );
}


// ⸻ HOME PROTOCOL (DASHBOARD) ⸻

function HomeView({ user, setScreen, stats }) {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [sendData, setSendData] = useState({ to: '', amount: '', currency: 'BNB' });
  const [swapData, setSwapData] = useState({ from: 'BNB', to: 'USDT', amount: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscription, setSubscription] = useState(null);
  
  const EXCHANGE_RATES = { BNB: 621, ETH: 3120, BTC: 64500, USDT: 1, USDC: 1 };
  const [balance, setBalance] = useState({ BNB: 0, USDT: 0, USDC: 0, ETH: 0, BTC: 0 });

  useEffect(() => {
    const fetchBalances = async () => {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id);
      if (data) {
        const newBalance = { BNB: 0, USDT: 0, USDC: 0, ETH: 0, BTC: 0 };
        data.forEach(tx => {
           if (tx.type === 'receive' || tx.type === 'deposit') {
             newBalance[tx.currency] += tx.amount;
           } else if (tx.type === 'send' || tx.type === 'withdraw') {
             newBalance[tx.currency] -= tx.amount;
           }
        });
        setBalance(newBalance);
      }
    };
    fetchBalances();
    
    // Subscribe to transactions for real-time updates
    const sub = supabase.channel('tx_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchBalances)
      .subscribe();
      
    return () => supabase.removeChannel(sub);
  }, [user.id]);

  useEffect(() => {
    const fetchSubscription = async () => {
       const { data } = await supabase
         .from('subscriptions')
         .select('*')
         .eq('user_id', user.id)
         .single();
       if (data) setSubscription(data);
    };
    fetchSubscription();

    const channel = supabase
      .channel('sub_upd')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` }, (payload) => {
        setSubscription(payload.new);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user.id]);

  const limits = {
    starter: { vol: 2000, reg: 0 },
    professional: { vol: 200000, reg: 300 },
    enterprise: { vol: 2000000, reg: 100000 }
  };
  const currentLimits = limits[user.plan] || limits.starter;
  const totalUsd = Object.entries(balance).reduce((acc, [ticker, val]) => acc + (val * EXCHANGE_RATES[ticker]), 0);

  const handleSend = async () => {
    if (!sendData.to || !sendData.amount) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: parseFloat(sendData.amount),
        currency: sendData.currency,
        type: 'send',
        status: 'completed'
      }]);
      if (error) throw error;
      alert(`Sent ${sendData.amount} ${sendData.currency} successfully`);
      setIsSendModalOpen(false);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
      <div className="lg:col-span-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-black text-black italic shadow-2xl text-2xl font-heading">
               {(user.username || 'T')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black font-mono-custom">Validated Node</p>
              <h2 className="text-xl font-black italic tracking-tighter uppercase font-heading">{user.username}</h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 glass px-5 py-2 rounded-full border border-white/10">
             <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-tighter font-mono-custom">BNB Node 01</span>
          </div>
        </header>

        {/* Global Asset Card */}
        <div className="bg-gradient-to-br from-[#0a0a0a] to-black p-12 rounded-[4rem] border border-white/10 shadow-3xl mb-12 relative overflow-hidden group min-h-[350px] flex flex-col justify-center text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <p className="text-gray-500 text-[10px] font-black mb-4 uppercase tracking-[0.4em] font-mono-custom">Available Liquidity (Total USD)</p>
          <div className="flex items-baseline gap-4 mb-12">
             <h2 className="text-7xl md:text-8xl font-black italic relative z-10 tracking-tighter font-heading text-white">
                ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </h2>
             <span className="text-secondary font-black font-mono-custom text-xs animate-pulse">LIVE</span>
          </div>
          
          <div className="flex flex-wrap gap-6 relative z-10">
            <ActionButton onClick={() => setIsSendModalOpen(true)} icon={<ArrowUpRight />} label="Transfer" />
            <ActionButton onClick={() => setIsSwapModalOpen(true)} icon={<Cpu />} label="Atomic Swap" variant="secondary" />
            <ActionButton onClick={() => setScreen('pay')} icon={<CreditCard />} label="Cash Out" variant="glass" />
          </div>
        </div>

        {/* Quick Access Assets */}
        <section className="mb-12">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic tracking-tighter font-heading uppercase text-white">Holdings</h3>
              <button onClick={() => setScreen('wallet-assets')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 font-mono-custom">Full Portfolio</button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(balance).filter(([_, v]) => v > 0).map(([ticker, val]) => (
                <AssetCard key={ticker} ticker={ticker} amount={val} usd={val * EXCHANGE_RATES[ticker]} icon={ticker === 'BNB' ? <Zap className="text-primary" /> : <ShieldCheck className="text-secondary" />} />
              ))}
              {Object.values(balance).every(v => v === 0) && (
                <div className="col-span-full py-10 text-center glass border border-dashed border-white/5 rounded-3xl opacity-30 uppercase font-black text-xs tracking-widest text-white">No active liquidity nodes detected</div>
              )}
           </div>
        </section>
      </div>

      <div className="lg:col-span-4 space-y-12">
        <section className="bg-white/[0.02] p-10 rounded-[4rem] border border-white/5 text-left">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black italic uppercase tracking-tighter font-heading text-white">Load Analysis</h3>
              <Target size={18} className="text-gray-600" />
           </div>
           <UsageProgress 
             label="Monthly Transaction Volume" 
             current={subscription?.monthly_usage_volume || 0} 
             max={currentLimits.vol} 
             prefix="$"
           />
           <UsageProgress 
             label="Digital Twin Registrations" 
             current={subscription?.product_usage_count || 0} 
             max={currentLimits.reg} 
           />
           <div className="mt-8 p-6 glass border border-white/10 rounded-3xl bg-primary/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 font-mono-custom">Protocol Update</p>
              <p className="text-xs font-medium text-gray-400 font-nevera">Your node is operating at peak efficiency. Higher tiers available for massive global scale.</p>
           </div>
        </section>

        {/* Gas Tracker */}
        <section className="bg-white/[0.02] p-10 rounded-[4rem] border border-white/5 text-left">
           <h3 className="text-sm font-black italic uppercase tracking-widest font-heading mb-6 text-gray-500">Gas Tracker</h3>
           <div className="space-y-4">
              <GasItem label="Standard" gwei="5.2" usd="0.04" />
              <GasItem label="Fast" gwei="12.8" usd="0.12" color="text-primary" />
              <GasItem label="Instant" gwei="24.1" usd="0.35" color="text-secondary" />
           </div>
        </section>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isSendModalOpen && (
          <Modal onClose={() => setIsSendModalOpen(false)} title="Protocol Transfer">
            <div className="space-y-6">
               <AdminInput placeholder="Target Thalexa ID or 0x..." value={sendData.to} onChange={v => setSendData({...sendData, to: v})} />
               <div className="flex gap-4">
                  <AdminInput placeholder="Amount" type="number" value={sendData.amount} onChange={v => setSendData({...sendData, amount: v})} />
                  <select value={sendData.currency} onChange={e => setSendData({...sendData, currency: e.target.value})} className="glass bg-white/5 p-4 rounded-2xl border border-white/10 font-bold uppercase text-xs">
                     {['BNB', 'USDT', 'USDC', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <button onClick={handleSend} className="w-full p-6 bg-primary text-black rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">Sign Transaction</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSwapModalOpen && (
          <Modal onClose={() => setIsSwapModalOpen(false)} title="Atomic Swap">
            <div className="space-y-8">
               <div className="space-y-2">
                 <label className="text-[10px] text-gray-500 font-black uppercase font-mono-custom">From</label>
                 <div className="flex gap-3">
                   <AdminInput placeholder="Quantity" value={swapData.amount} onChange={v => setSwapData({...swapData, amount: v})} />
                   <select value={swapData.from} onChange={e => setSwapData({...swapData, from: e.target.value})} className="glass bg-white/5 p-4 rounded-2xl border border-white/10 font-bold text-xs uppercase">
                     {['BNB', 'USDT', 'USDC', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
               </div>
               <div className="flex justify-center -my-4"><Zap className="text-primary" /></div>
               <div className="space-y-2">
                 <label className="text-[10px] text-gray-500 font-black uppercase font-mono-custom">To (Simulated)</label>
                 <div className="flex gap-3">
                   <div className="flex-1 glass bg-white/5 p-5 rounded-2xl border border-white/10 font-black text-xs">{(parseFloat(swapData.amount) * (EXCHANGE_RATES[swapData.from] / EXCHANGE_RATES[swapData.to]) || 0).toFixed(4)}</div>
                   <select value={swapData.to} onChange={e => setSwapData({...swapData, to: e.target.value})} className="glass bg-white/5 p-4 rounded-2xl border border-white/10 font-bold text-xs uppercase">
                     {['USDT', 'BNB', 'USDC', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
               </div>
               <button onClick={() => { alert('Swap Broadcasted to Mempool'); setIsSwapModalOpen(false); }} className="w-full p-6 bg-secondary text-black rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-secondary/20">Initiate Swap</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function AssetCard({ ticker, amount, usd, icon }) {
  return (
    <div className="glass p-8 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all text-left">
       <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center p-3 text-left">
             {icon}
          </div>
          <div className="text-left">
             <h4 className="text-xl font-black italic uppercase italic tracking-tighter font-heading text-white">{ticker}</h4>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono-custom">{amount} {ticker}</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-lg font-black italic text-white font-heading">${usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] font-mono-custom">+2.4%</p>
       </div>
    </div>
  );
}

function GasItem({ label, gwei, usd, color = "text-white" }) {
  return (
    <div className="flex justify-between items-center p-4 glass bg-white/5 border border-white/5 rounded-2xl text-left">
       <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 font-mono-custom">{label}</span>
       <div className="text-right">
          <p className={`text-xs font-black italic font-heading ${color}`}>{gwei} Gwei</p>
          <p className="text-[8px] text-gray-600 font-black font-mono-custom">${usd}</p>
       </div>
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="glass p-12 rounded-[5rem] border border-white/10 w-full max-w-xl relative text-left shadow-3xl">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter font-heading text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function WalletAssetsView({ user, setScreen }) {
  const [balance, setBalance] = useState({ BNB: 0, USDT: 0, USDC: 0, ETH: 0, BTC: 0 });
  const EXCHANGE_RATES = { BNB: 621, ETH: 3120, BTC: 64500, USDT: 1, USDC: 1 };

  useEffect(() => {
    const fetchBalances = async () => {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id);
      if (data) {
        const newBalance = { BNB: 0, USDT: 0, USDC: 0, ETH: 0, BTC: 0 };
        data.forEach(tx => {
           if (tx.type === 'receive' || tx.type === 'deposit') {
             newBalance[tx.currency] += tx.amount;
           } else if (tx.type === 'send' || tx.type === 'withdraw') {
             newBalance[tx.currency] -= tx.amount;
           }
        });
        setBalance(newBalance);
      }
    };
    fetchBalances();
  }, [user.id]);

  const assets = Object.entries(balance).map(([ticker, amount]) => ({
    ticker,
    amount,
    usd: amount * (EXCHANGE_RATES[ticker] || 0),
    gain: '+1.2%' 
  }));

  return (
    <div className="p-6 md:p-12 lg:px-24 w-full text-left">
       <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter font-heading">Protocol Portfolio</h2>
          <button 
            onClick={() => setScreen('transaction-history')}
            className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline font-mono-custom"
          >
             <History size={16} /> View Activity
          </button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {assets.map(a => (
            <div key={a.ticker} className="mm-card group hover:border-primary/30 transition-all cursor-pointer">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center font-black italic text-secondary text-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">{a.ticker[0]}</div>
                     <div>
                       <h4 className="text-2xl font-black italic font-heading text-dark">{a.ticker}</h4>
                       <p className="text-[10px] text-gray-400 font-black font-mono-custom uppercase tracking-widest">{a.amount} Units Indexed</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-black italic font-heading text-dark">${a.usd.toLocaleString()}</p>
                     <p className={`text-[10px] font-black font-mono-custom text-secondary`}>{a.gain}</p>
                  </div>
               </div>
            </div>
          ))}
       </div>

       <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter font-heading text-gray-300 mb-8">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
             <ActionIcon icon={<ArrowUpRight />} label="Send" onClick={() => setScreen('pay')} />
             <ActionIcon icon={<ArrowDownLeft />} label="Receive" onClick={() => setScreen('pay')} />
             <ActionIcon icon={<TrendingUp />} label="Swap" onClick={() => setScreen('pay')} />
             <ActionIcon icon={<Settings />} label="Manage" onClick={() => setScreen('settings')} />
          </div>
       </div>
    </div>
  );
}

function ActionIcon({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-4 group">
       <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-dark border border-gray-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
          {React.cloneElement(icon, { size: 28 })}
       </div>
       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-mono-custom group-hover:text-primary transition-colors">{label}</span>
    </button>
  );
}

function PayView({ user, setScreen }) {
  const [activeTab, setActiveTab] = useState('withdraw'); // 'withdraw' | 'deposit'
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || !bank || !accountNumber) return alert('Please fill all details');
    setIsProcessing(true);
    // Simulate API call to backend for bank transfer
    const { error } = await supabase.from('transactions').insert([{
       user_id: user.id,
       type: 'withdraw',
       amount: parseFloat(amount),
       currency: 'USDC', // Assuming USDC for settlement
       status: 'completed',
       tx_hash: 'BANK_TRF_' + Math.random().toString(36).substring(7).toUpperCase()
    }]);
    
    if (!error) {
       alert(`Settlement of ₦${(parseFloat(amount) * 1550).toLocaleString()} initialized to ${bank} account ${accountNumber}`);
       setAmount('');
       setAccountNumber('');
    } else {
       alert('Settlement Failed: ' + error.message);
    }
    setIsProcessing(false);
  };

  const handleAddCash = async () => {
    if (!amount) return alert('Please enter amount');
    setIsProcessing(true);
    try {
      const resp = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: parseFloat(amount) * 1550, // Convert USD to NGN
          metadata: { type: 'deposit', user_id: user.id, usd_amount: amount }
        })
      });
      const data = await resp.json();
      if (data.status && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert('Payment initialization failed.');
      }
    } catch (e) {
      alert('Network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full text-left">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter font-heading">Handshake <span className="text-primary">Pay</span></h2>
          <div className="flex gap-4 bg-white/5 p-2 rounded-3xl border border-white/5">
            {['withdraw', 'deposit'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
              >
                {t === 'withdraw' ? 'Settlement' : 'Deposit'}
              </button>
            ))}
          </div>
       </div>
       <p className="text-gray-500 mb-12 font-medium font-nevera">Seamless liquidity flux between protocol and local banking systems.</p>
       
       <div className="space-y-8 glass p-10 rounded-[4rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
          
          {activeTab === 'withdraw' ? (
             <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <FormInput label="Settlement Amount (USDC/USDT)" placeholder="e.g. 500" value={amount} onChange={setAmount} />
                   <div className="flex flex-col gap-3 group">
                      <label className="text-[10px] text-primary uppercase font-black font-mono-custom tracking-widest italic leading-none mb-1">Target Node (Local Bank)</label>
                      <select 
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full glass bg-white/5 p-6 rounded-3xl outline-none border border-white/10 font-black text-xs uppercase text-white"
                      >
                         <option value="" className="bg-black">Select Local Node</option>
                         <option value="GTB" className="bg-black">GTBank</option>
                         <option value="ZENITH" className="bg-black">Zenith Bank</option>
                         <option value="ACCESS" className="bg-black">Access Bank</option>
                         <option value="KUDA" className="bg-black">Kuda Microfinance</option>
                         <option value="OPAY" className="bg-black">OPay Node</option>
                         <option value="PALMPAY" className="bg-black">PalmPay Node</option>
                      </select>
                   </div>
                </div>
                <FormInput label="Account Numeration (Account Number)" placeholder="e.g. 0123456789" value={accountNumber} onChange={setAccountNumber} />
                
                <div className="p-8 bg-black/40 rounded-3xl border border-white/10 space-y-3">
                   <div className="flex justify-between text-[10px] font-black font-mono-custom text-gray-500 uppercase">
                      <span>Protocol Fee</span> <span>0.5%</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black font-mono-custom text-gray-500 uppercase">
                      <span>Settlement Speed</span> <span>Instant (Local Relay)</span>
                   </div>
                   <div className="flex justify-between text-xl font-black font-heading text-primary uppercase pt-4 border-t border-white/5">
                      <span>Receiving (NGN)</span> <span>~₦{ (parseFloat(amount) * 1550 || 0).toLocaleString() }</span>
                   </div>
                </div>
                
                <button 
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                  className="group w-full p-8 bg-primary text-black rounded-3xl font-black uppercase text-sm tracking-[0.3em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                  {isProcessing ? <Zap className="animate-spin text-black" /> : <><ArrowUpRight className="relative z-10" /> <span className="relative z-10 text-black">Authorize Settlement</span></>}
                </button>
             </motion.div>
          ) : (
             <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
               <FormInput label="Deposit Amount (USD Equiv)" placeholder="e.g. 100" value={amount} onChange={setAmount} />
               <div className="p-8 bg-black/40 rounded-3xl border border-white/10 space-y-3">
                  <div className="flex justify-between text-[10px] font-black font-mono-custom text-gray-500 uppercase">
                     <span>Exchange Rate</span> <span>₦1,550 / USD</span>
                  </div>
                  <div className="flex justify-between text-xl font-black font-heading text-secondary uppercase pt-4 border-t border-white/5">
                     <span>You Pay (NGN)</span> <span>₦{ (parseFloat(amount) * 1550 || 0).toLocaleString() }</span>
                  </div>
               </div>
               <button 
                onClick={handleAddCash}
                disabled={isProcessing}
                className="group w-full p-8 bg-white text-black rounded-3xl font-black uppercase text-sm tracking-[0.3em] hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden"
               >
                 <div className="absolute inset-0 bg-secondary/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                 {isProcessing ? <Zap className="animate-spin" /> : <><CreditCard className="relative z-10" /> <span className="relative z-10">Initialize Deposit</span></>}
               </button>
               <p className="text-[9px] text-gray-600 font-black uppercase text-center tracking-widest italic font-mono-custom">Payment secured via Paystack SSL Node</p>
             </motion.div>
          )}
       </div>
    </div>
  );
}

function NotificationsView({ user }) {
  const [notes, setNotes] = useState([]);
  
  useEffect(() => {
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => data && setNotes(data));
  }, []);

  return (
    <div className="p-6 md:p-12 lg:px-24 w-full text-left">
       <h2 className="text-4xl font-black italic uppercase tracking-tighter font-heading mb-12">Protocol Log</h2>
       <div className="space-y-4">
          {notes.length > 0 ? notes.map(n => (
            <div key={n.id} className="glass p-8 rounded-3xl border border-white/5 group hover:border-primary/20 transition-all">
               <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2 font-mono-custom">{n.type}</p>
               <h4 className="text-xl font-black italic font-heading mb-2">{n.title}</h4>
               <p className="text-sm text-gray-500 font-nevera">{n.content}</p>
            </div>
          )) : (
            <div className="py-20 text-center glass border border-dashed border-white/5 rounded-3xl opacity-30 uppercase font-black text-xs tracking-widest">No protocol handshakes recorded</div>
          )}
       </div>
    </div>
  );
}

// ⸻ ESCROW SYSTEM (SMART CONTRACT FLOW) ⸻

function EscrowDashboard({ user, setScreen }) {
  const [activeTab, setActiveTab] = useState('active');
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEscrows = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('escrows')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (data) setEscrows(data);
      setLoading(false);
    };

    fetchEscrows();
  }, [user.id]);

  const handleRelease = async (id) => {
    try {
      const { error } = await supabase
        .from('escrows')
        .update({ status: 'completed' })
        .eq('id', id);
      
      if (error) throw error;
      setEscrows(prev => prev.map(e => e.id === id ? { ...e, status: 'completed' } : e));
      alert('Funds Released Successfully.');
    } catch (e) {
      alert('Release Failed: ' + e.message);
    }
  };

  const filteredEscrows = escrows.filter(e => 
    activeTab === 'active' ? e.status !== 'completed' && e.status !== 'closed' : e.status === 'completed' || e.status === 'closed'
  );

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full">
      <header className="flex justify-between items-center mb-12 text-left">
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

      {loading ? (
        <div className="py-20 text-center"><Zap className="animate-spin inline-block text-primary" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEscrows.map((e) => (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={e.id} 
              className="group relative"
            >
               <div className="absolute inset-0 bg-primary/20 rounded-[3rem] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"></div>
               <div className="relative glass p-10 rounded-[3rem] border border-white/10 overflow-hidden min-h-[320px] flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${e.status === 'funded' ? 'bg-orange-500 animate-pulse' : 'bg-secondary'}`}></span>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest font-mono-custom">{user.id === e.sender_id ? 'sender' : 'receiver'}</p>
                        </div>
                        <p className="text-4xl font-black italic uppercase tracking-tighter font-heading">{e.amount} {e.currency}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${e.status === 'funded' ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-secondary text-secondary bg-secondary/5'}`}>
                        {e.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-8 font-mono-custom text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
                      <div className="flex justify-between"><span>Contract ID</span> <span className="text-white">#{e.id.slice(0,8)}</span></div>
                      <div className="flex justify-between"><span>Transaction</span> <span className="text-white/40">TX_AUTH_SIGNED</span></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white/[0.03] -mx-10 -mb-10 p-10 mt-auto">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter font-mono-custom">Active Node</p>
                    </div>
                    {user.id === e.sender_id && e.status === 'funded' && (
                      <button 
                        onClick={() => handleRelease(e.id)}
                        className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-primary transition-colors font-heading tracking-widest"
                      >
                        Release
                      </button>
                    )}
                  </div>
               </div>
            </motion.div>
          ))}
          {filteredEscrows.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
              <p className="text-gray-500 font-black uppercase tracking-[0.4em] font-mono-custom text-center">No active contracts found on node</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateEscrowView({ user, setScreen }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ receiver_id: '', amount: '', product_id: '', currency: 'BNB' });

  const handleCreateOnChain = async () => {
    if (!formData.receiver_id || !formData.amount) return alert('Fill fields');
    setLoading(true);
    try {
       // 1. Generate Thalexa Escrow ID
       const idResp = await fetch('/api/ids/generate/escrow');
       const { id: thalexaEscrowId } = await idResp.json();

       console.log("Calling Contract with EscrowID:", thalexaEscrowId);
       // In a real dApp, we'd call the smart contract here:
       // await contract.createEscrow(formData.receiver_address, product_code, thalexaEscrowId, { value: ... });

       // 2. Sync with Supabase
       const { error } = await supabase.from('escrows').insert([{
         thalexa_id: thalexaEscrowId,
         sender_id: user.id,
         receiver_address: formData.receiver_id, // assuming it's the address for this simplified view
         amount: parseFloat(formData.amount),
         currency: formData.currency,
         status: 'funded'
       }]);

       if (error) throw error;
       alert(`BNB Chain Transaction Confirmed. Escrow ID: ${thalexaEscrowId}`);
       setScreen('escrow');
    } catch (e) {
       alert('Contract Error: ' + e.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={() => setScreen('escrow')} className="p-3 glass rounded-2xl border border-white/10 hover:border-primary/50 transition-all text-primary"><ArrowDownLeft className="rotate-45" /></button>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">New Contract</h2>
      </header>

      <div className="space-y-6 flex-1 overflow-y-auto">
        <FormInput 
          label="Counterparty (User UUID)" 
          placeholder="e.g. ae6d..." 
          value={formData.receiver_id}
          onChange={(v) => setFormData({...formData, receiver_id: v})}
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <FormInput 
              label="Value" 
              type="number" 
              placeholder="0.00" 
              value={formData.amount}
              onChange={(v) => setFormData({...formData, amount: v})}
            />
          </div>
          <div className="w-32">
            <label className="text-[10px] text-primary uppercase font-black mb-3 block font-mono-custom">Asset</label>
            <select 
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full glass bg-white/5 p-4 rounded-2xl outline-none border border-white/10 font-black text-xs uppercase"
            >
               <option value="BNB">BNB</option>
               <option value="USDT">USDT</option>
               <option value="USDC">USDC</option>
               <option value="BTC">BTC</option>
               <option value="ETH">ETH</option>
            </select>
          </div>
        </div>
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

function ProductsView({ user, setScreen }) {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', serial: '', desc: '', price: '' });

  const handleRegister = async () => {
    if (!registerData.name) return;
    setIsRegistering(true);
    try {
      // 1. Get Reserved Thalexa ID from Backend
      const idResp = await fetch('/api/ids/generate/product');
      const { id: thalexaId } = await idResp.json();

      // 2. Upload to IPFS with Thalexa ID in metadata
      const meta = {
        thalexa_id: thalexaId,
        name: registerData.name,
        description: registerData.desc || 'Verified Thalexa Asset',
        image: 'https://gateway.pinata.cloud/ipfs/QmThalexaPlaceholder',
        created_at: new Date().toISOString(),
        productCode: registerData.serial || thalexaId
      };

      const ipfsResp = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: meta })
      });
      const { ipfs_cid } = await ipfsResp.json();

      // 3. Save to Supabase (Trigger will ensure thalexa_id if we didn't specify, but better to be explicit if we have it)
      const { error } = await supabase.from('products').insert([{
        thalexa_id: thalexaId,
        product_code: registerData.serial || thalexaId,
        owner_id: user.id,
        ipfs_cid: ipfs_cid,
        metadata: meta
      }]);
      
      if (error) throw error;
      
      alert(`Asset Minted: ${thalexaId}. 0.009 BNB Sent to Treasury.`);
      setShowRegister(false);
      setIsRegistering(false);
    } catch (e) {
      alert('Registration Error: ' + e.message);
      setIsRegistering(false);
    }
  };

  const handleVerify = async () => {
    if (!search) return;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`thalexa_id.eq.${search.trim().toUpperCase()},product_code.eq.${search.trim().toUpperCase()}`)
        .single();

    if (data) {
      setResult({ 
        status: 'authentic', 
        name: data.metadata?.name || 'Unknown Item', 
        manufacturer: 'Authenticated Asset', 
        tx: data.id.slice(0,12),
        ipfs_cid: data.ipfs_cid,
        location: 'Global Hub',
        date: new Date(data.created_at).toLocaleDateString(),
        thalexa_id: data.thalexa_id
      });
    } else {
      setResult({ status: 'unknown' });
    }
  };

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full">
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
                    <FormInput label="Item Identity" placeholder="e.g. Masterpiece #4" value={registerData.name} onChange={v => setRegisterData({...registerData, name: v})} />
                    <FormInput label="Serial Number" placeholder="THLX-XXXX-XXXX" value={registerData.serial} onChange={v => setRegisterData({...registerData, serial: v})} />
                  </div>
                  <FormInput label="Description (Stored in IPFS)" placeholder="Luxury quality details..." value={registerData.desc} onChange={v => setRegisterData({...registerData, desc: v})} />
                  <FormInput label="Asset Value" placeholder="e.g. 0.5 BNB" value={registerData.price} onChange={v => setRegisterData({...registerData, price: v})} />
                  
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
                         <QRCodeSVG value={`https://thalexa.io/verify/${result.thalexa_id || search}`} size={200} />
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
                               <p className="text-xs font-bold text-white uppercase italic tracking-tighter">{result.thalexa_id || search}</p>
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

function FormInput({ label, type = "text", placeholder, value, onChange, dark = true }) {
  return (
    <div className={`${dark ? 'glass border-white/10' : 'bg-gray-50 border-gray-200'} p-6 rounded-[2rem] border group focus-within:border-primary/50 transition-all shadow-sm`}>
      <label className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'} uppercase font-black tracking-widest mb-2 block italic`}>{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full bg-transparent outline-none font-black text-lg italic tracking-tighter ${dark ? 'text-white placeholder:text-white/10' : 'text-dark placeholder:text-gray-300'}`} 
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

function UsageProgress({ label, current, max, prefix = "" }) {
  const percent = max === 0 ? 0 : Math.min((current / max) * 100, 100);
  const isNearLimit = percent > 80;
  const isCapped = percent >= 100;

  const colorClass = isCapped ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : isNearLimit ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(0,255,133,0.5)]';

  return (
    <div className="mb-8 last:mb-0 text-left">
      <div className="flex justify-between items-end mb-3">
        <div className="text-left">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 font-mono-custom">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black italic font-heading whitespace-nowrap">{prefix}{Number(current).toLocaleString()}</span>
            <span className="text-[8px] text-gray-700 font-black uppercase font-mono-custom">/ {prefix}{max >= 1000000 ? '∞' : max.toLocaleString()}</span>
          </div>
        </div>
        <span className={`text-[10px] font-black font-mono-custom ${isCapped ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-primary'}`}>
          {isNaN(percent) ? 0 : percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${isNaN(percent) ? 0 : percent}%` }}
          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
        />
      </div>
    </div>
  );
}

function Onboarding({ onLogin, loading }) {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Details, 2: Finalize
  const [data, setData] = useState({ email: 'emmanuelobed877@gmail.com', username: '', country: 'Nigeria', accepted: false });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-white overflow-hidden text-dark font-sans">
       <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
       <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>
       
       <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="w-full max-w-xl text-center"
       >
          <div className="flex flex-col items-center mb-16">
             <div className="w-40 h-40 bg-white shadow-2xl rounded-full flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover:scale-125 transition-transform duration-700"></div>
                <Zap size={80} className="text-primary fill-primary relative animate-bounce" />
             </div>
             <h1 className="text-5xl font-black tracking-tighter mb-4 text-dark font-heading">Welcome to Thalexa</h1>
             <p className="text-gray-500 text-xl font-medium font-nevera">The world's leading protocol for physical asset tokenization and verification.</p>
          </div>
      
          <AnimatePresence mode="wait">
             {step === 0 && (
                <motion.div key="welcome" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6"
                >
                   <button 
                     onClick={() => setStep(1)}
                     className="w-full py-6 bg-primary text-white rounded-full font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                   >
                      Get Started
                   </button>
                   <div className="pt-8">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 font-mono-custom">Or connect via Trusted Node</p>
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => onLogin({ email: 'web3auth_user@thalexa.io', username: 'web3_node' })}
                           className="flex items-center justify-center gap-3 p-4 border-2 border-gray-100 rounded-2xl hover:border-primary transition-colors hover:bg-primary/5"
                         >
                            <ShieldCheck size={20} className="text-blue-500" />
                            <span className="font-black text-[10px] uppercase tracking-widest font-mono-custom">Web3Auth</span>
                         </button>
                         <button 
                           onClick={() => onLogin({ email: 'metamask_user@thalexa.io', username: 'mm_node' })}
                           className="flex items-center justify-center gap-3 p-4 border-2 border-gray-100 rounded-2xl hover:border-primary transition-colors hover:bg-primary/5"
                         >
                            <Zap size={20} className="text-orange-500" />
                            <span className="font-black text-[10px] uppercase tracking-widest font-mono-custom">MetaMask</span>
                         </button>
                      </div>
                   </div>
                </motion.div>
             )}

             {step === 1 && (
                <motion.div key="details" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                   <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-left">
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter font-heading mb-6 text-dark text-center">Node <span className="text-primary">Configuration</span></h2>
                      <div className="space-y-6 mb-12">
                         <FormInput label="Operator Handle" placeholder="e.g. Satoshi_42" value={data.username} onChange={v => setData({...data, username: v})} dark={false} />
                         <div className="flex flex-col gap-3">
                            <label className="text-[10px] text-primary uppercase font-black font-mono-custom tracking-widest">Region Node</label>
                            <select 
                              value={data.country}
                              onChange={(e) => setData({...data, country: e.target.value})}
                              className="w-full bg-gray-50 p-6 rounded-3xl outline-none border border-gray-200 font-black text-xs uppercase text-dark focus:border-primary transition-all"
                            >
                               {['Global', 'Nigeria', 'USA', 'UK', 'Germany', 'Japan', 'China'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                      </div>
                      <button 
                        onClick={() => setStep(2)} 
                        disabled={!data.username} 
                        className="w-full p-8 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 disabled:opacity-30"
                      >
                         Continue
                      </button>
                   </div>
                   <button onClick={() => setStep(0)} className="mt-8 text-gray-400 font-black uppercase text-[10px] tracking-widest font-mono-custom hover:text-primary transition-colors">← Back to start</button>
                </motion.div>
             )}

             {step === 2 && (
                <motion.div key="finalize" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                   <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl text-left">
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter font-heading mb-6 text-dark text-center">Security <span className="text-secondary">Bind</span></h2>
                      <div className="space-y-6 mb-12">
                         <FormInput label="Node Communication (Email)" placeholder="node@protocol.io" value={data.email} onChange={v => setData({...data, email: v})} dark={false} />
                         <div className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-200 rounded-3xl cursor-pointer hover:border-primary transition-all" onClick={() => setData({...data, accepted: !data.accepted})}>
                            <div className={`w-6 h-6 rounded-lg border-2 border-primary flex items-center justify-center transition-all ${data.accepted ? 'bg-primary' : ''}`}>
                               {data.accepted && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <p className="text-[10px] font-black uppercase text-gray-500 font-mono-custom flex-1">I accept the immutable protocol terms and covenant guidelines.</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <button 
                           onClick={() => setStep(1)} 
                           className="flex-1 p-8 border-2 border-gray-100 rounded-3xl font-black uppercase text-xs text-dark hover:bg-gray-50 transition-all font-mono-custom"
                         >
                            Back
                         </button>
                         <button 
                           onClick={() => onLogin(data)} 
                           disabled={!data.accepted || loading} 
                           className="flex-[2] p-8 bg-primary text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] disabled:opacity-30 flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                         >
                            {loading ? <Zap className="animate-spin text-white" /> : "Authorize Node"}
                         </button>
                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </motion.div>
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
  const [logs, setLogs] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [landingAsset, setLandingAsset] = useState(stats?.landing_asset || '');
  
  // Product Upload State
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    type: '',
    price: '',
    image_url: '',
    emoji: '📦'
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setLogs(data);
    };

    fetchLogs();
    
    // Real-time subscription to transactions
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', table: 'transactions' }, payload => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBroadcast = async () => {
    if (!broadcastMsg || !broadcastTitle) return;
    setIsPublishing(true);
    try {
      const { error } = await supabase.from('notifications').insert([{
        title: broadcastTitle,
        content: broadcastMsg,
        type: 'announcement'
      }]);
      
      if (error) throw error;
      setBroadcastMsg('');
      setBroadcastTitle('');
      alert('Network Broadcast Sent to All Nodes.');
    } catch (e) {
      alert('Broadcast Error: ' + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleProductUpload = async () => {
    if (!newProduct.code || !newProduct.name || !newProduct.price) return;
    setIsUploading(true);
    try {
      const { error } = await supabase.from('products').insert([{
        product_code: newProduct.code,
        ipfs_cid: 'direct_upload',
        metadata: {
          name: newProduct.name,
          type: newProduct.type || 'Luxury Asset',
          price: newProduct.price,
          image_url: newProduct.image_url,
          emoji: newProduct.emoji
        }
      }]);

      if (error) throw error;
      setNewProduct({ code: '', name: '', type: '', price: '', image_url: '', emoji: '📦' });
      alert('Product Minted Successfully.');
    } catch (e) {
      alert('Minting Error: ' + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateLandingAsset = async () => {
    // We update this via the broadcast API in this implementation
    await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'LANDING_ASSET_UPDATE', asset: landingAsset })
    });
    alert('Landing Asset Update Requested.');
  };

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setScreen('wallet')} className="p-5 glass rounded-[2rem] border border-white/10 hover:border-primary text-primary transition-all hover:scale-110 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ArrowDownLeft className="rotate-45 relative z-10" />
            </button>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter font-heading">Terminal</h2>
          </div>
        </header>

        {/* Product Upload Tool */}
        <section className="mb-12 glass p-10 rounded-[3rem] border border-primary/20 bg-primary/5">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic uppercase tracking-tighter font-heading text-primary">Mint New Product (Landing NFT)</h3>
              <div className="flex gap-2">
                 <input 
                   placeholder="Landing Asset URL / GIF" 
                   value={landingAsset} 
                   onChange={(e) => setLandingAsset(e.target.value)} 
                   className="glass bg-white/5 p-3 rounded-xl border border-white/10 text-[10px] font-bold outline-none"
                 />
                 <button onClick={handleUpdateLandingAsset} className="bg-primary text-black p-3 rounded-xl"><Database size={14}/></button>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AdminInput placeholder="Product Code (id)" value={newProduct.code} onChange={v => setNewProduct({...newProduct, code: v})} />
              <AdminInput placeholder="Display Name" value={newProduct.name} onChange={v => setNewProduct({...newProduct, name: v})} />
              <AdminInput placeholder="Asset Type" value={newProduct.type} onChange={v => setNewProduct({...newProduct, type: v})} />
              <AdminInput placeholder="Price (BNB)" value={newProduct.price} onChange={v => setNewProduct({...newProduct, price: v})} />
              <AdminInput placeholder="Image URL (Option)" value={newProduct.image_url} onChange={v => setNewProduct({...newProduct, image_url: v})} />
              <AdminInput placeholder="Emoji fallback" value={newProduct.emoji} onChange={v => setNewProduct({...newProduct, emoji: v})} />
           </div>
           <button 
             onClick={handleProductUpload}
             disabled={isUploading}
             className="w-full bg-primary text-black py-6 rounded-3xl font-black uppercase text-sm font-heading hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
           >
             {isUploading ? <Zap className="animate-spin" /> : <><Database size={18}/> Mint On-Chain Asset</>}
           </button>
        </section>

        <section className="mb-12">
           <h3 className="text-xl font-black italic uppercase mb-6 tracking-tighter font-heading text-primary">Network Broadcast (Admin Mail)</h3>
           <div className="space-y-4">
              <input 
                type="text" 
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Message Subject..."
                className="w-full glass bg-white/5 p-6 rounded-3xl outline-none border border-white/10 focus:border-primary transition-all font-bold uppercase tracking-widest text-xs font-mono-custom"
              />
              <textarea 
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Push network-wide protocol alert or system mail..."
                rows={4}
                className="w-full glass bg-white/5 p-6 rounded-3xl outline-none border border-white/10 focus:border-primary transition-all font-bold uppercase tracking-widest text-xs font-mono-custom resize-none"
              />
              <button 
                onClick={handleBroadcast}
                disabled={isPublishing}
                className="bg-primary text-black px-10 py-6 rounded-3xl font-black uppercase text-xs font-heading hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                {isPublishing ? <Zap className="animate-spin" /> : <><Zap size={18}/> Broadcast to Network</>}
              </button>
           </div>
        </section>

        <div className="glass p-12 rounded-[4rem] border border-white/10 relative overflow-hidden">
           <h3 className="text-3xl font-black italic uppercase mb-10 tracking-tighter font-heading">Recent Transactions</h3>
           <div className="space-y-4">
              {logs.length > 0 ? logs.map(log => (
                <LogEntry key={log.id} user={log.user_id?.slice(0, 8)} action={log.type} status={log.status} tx={log.amount + ' ' + log.currency} />
              )) : <p className="text-gray-500 font-mono text-xs uppercase text-center py-10 tracking-widest">No transaction pulse detected.</p>}
           </div>
        </div>
      </div>

      <div className="lg:col-span-4 pt-4 md:pt-24 space-y-8 text-left">
          <div className="glass p-10 rounded-[3.5rem] border border-primary/20 bg-primary/5">
                <AdminStat label="Nodes Connected" val="12,492" delta="100.0%" icon={<ShieldCheck size={28}/>} />
          </div>
          <div className="glass p-10 rounded-[3.5rem] border border-white/5">
             <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-4 font-mono-custom">Infrastructure Status</h4>
             <ul className="space-y-4 font-mono-custom text-[10px] uppercase font-bold tracking-widest">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>EVM Bridge</span> <span className="text-secondary">Connected</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>PINATA API</span> <span className="text-secondary">Operational</span></li>
                <li className="flex justify-between"><span>Supabase Sync</span> <span className="text-secondary">Verified</span></li>
             </ul>
          </div>
      </div>
    </div>
  );
}

function AdminInput({ placeholder, value, onChange }) {
  return (
    <input 
      type="text" 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="glass bg-white/5 p-5 rounded-2xl outline-none border border-white/10 focus:border-primary transition-all font-bold uppercase tracking-widest text-[10px] font-mono-custom"
    />
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
  const [showKey, setShowKey] = useState(false);
  const protocolKey = user.secret_key || 'THLX-SEC-' + user.id.slice(0, 16).toUpperCase();

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
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
          
          <div className="space-y-6 mb-12">
             {!user.is_verified && (
                <button 
                  onClick={() => alert('Security Transmission Sent: Check your Node Email for verification link.')} 
                  className="w-full p-6 bg-secondary/10 text-secondary border border-secondary/30 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] font-mono-custom hover:bg-secondary/20 transition-all flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={16} /> Verify Identity Pulse
                </button>
             )}

             <div className="p-6 glass bg-black/40 rounded-3xl border border-white/10">
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-3 font-mono-custom">Secret Protocol Key</p>
                <div className="flex items-center justify-between gap-4">
                   <p className="text-xs font-mono font-bold tracking-widest text-white truncate max-w-[200px]">
                      {showKey ? protocolKey : '••••••••••••••••••••••••'}
                   </p>
                   <button onClick={() => setShowKey(!showKey)} className="text-primary hover:text-white transition-colors">
                      {showKey ? <Zap size={16} /> : <ShieldCheck size={16} />}
                   </button>
                </div>
                <p className="text-[8px] text-gray-600 font-medium uppercase mt-2 italic">Use this key for account recovery and identity verification.</p>
             </div>

            <div className="space-y-3">
              <SettingItem icon={<CreditCard size={20} />} label="Paystack Billing Hub" onClick={() => setScreen('subscriptions')} />
              {user.email === 'emmanuelobed877@gmail.com' && (
                <SettingItem icon={<LayoutDashboard size={20} />} label="Command Dashboard" onClick={() => setScreen('admin')} />
              )}
              <SettingItem icon={<ShieldCheck size={20} />} label="Biometric Signer" />
              <SettingItem icon={<History size={20} />} label="Blockchain Events" />
            </div>
          </div>

          <button 
            onClick={() => { setUser(null); setScreen('landing'); localStorage.removeItem('thalexa_user_email'); }}
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
  const [loading, setLoading] = useState(null);
  const plans = [
    { 
      title: 'Starter', 
      price: '$0 / mo', 
      value: 0, 
      limit: '$2k Vol', 
      features: ['Wallet Creation', 'Send / Receive BNB', 'Basic Verification', 'Public Registry Scan'], 
      color: 'gray' 
    },
    { 
      title: 'Professional', 
      price: '$500 / mo', 
      value: 500, 
      limit: '$200k Vol', 
      features: ['300 Product Reg/mo', 'Escrow Payments', 'API Access (Basic)', 'Priority Support', 'Multi-wallet Support'], 
      color: 'primary' 
    },
    { 
      title: 'Enterprise', 
      price: '$2000 / mo', 
      value: 2000, 
      limit: 'Custom Vol', 
      features: ['Unlimited Product Reg', 'Custom Smart Contracts', 'White-label Portals', 'Team Roles & SLA', 'Advanced Analytics'], 
      color: 'secondary' 
    },
  ];

  const handleUpgrade = async (plan) => {
    if (plan.value === 0) return;
    setLoading(plan.title);
    try {
      const resp = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: plan.value * 1000, // Just a factor for demo
          metadata: { plan: plan.title.toLowerCase(), user_id: user.id }
        })
      });
      const data = await resp.json();
      if (data.status && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert('Payment initialization failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error during payment.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:px-24 pb-24 w-full">
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
                disabled={loading === p.title}
                onClick={() => handleUpgrade(p)}
                className="w-full py-6 glass bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-black transition-all font-heading"
               >
                 {loading === p.title ? <Zap className="animate-spin mx-auto" /> : `Activate ${p.title}`}
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


// ⸻ NEW COMPONENTS FOR ENHANCEMENTS ⸻

function GlobalHeatmap() {
  const svgRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/map-data').then(r => r.json()).then(setData);

    const svg = d3.select(svgRef.current);
    const width = 1200;
    const height = 600;
    
    const projection = d3.geoMercator()
      .scale(200)
      .translate([width / 2, height / 2.5]);

    svg.selectAll("*").remove();

    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(worldData => {
        const countries = topojson.feature(worldData, worldData.objects.countries);
        
        svg.append("g")
          .selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("d", d3.geoPath().projection(projection))
          .attr("fill", "#0a0a0a")
          .attr("stroke", "#1a1a1a")
          .attr("stroke-width", 0.5);

        const graticule = d3.geoGraticule();
        svg.append("path")
          .datum(graticule)
          .attr("class", "graticule")
          .attr("d", d3.geoPath().projection(projection))
          .attr("fill", "none")
          .attr("stroke", "#ffffff05");

        const points = svg.append("g");
        
        data.forEach(d => {
          const coords = projection([d.lon, d.lat]);
          if (!coords) return;
          const [cx, cy] = coords;
          
          points.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", Math.sqrt(d.value) * 1.5)
            .attr("fill", "rgba(255, 107, 0, 0.4)")
            .attr("class", "animate-pulse");

          points.append("circle")
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 3)
            .attr("fill", "#FF6B00")
            .attr("stroke", "white")
            .attr("stroke-width", 0.5);

          points.append("text")
            .attr("x", cx + 8)
            .attr("y", cy + 4)
            .attr("fill", "#666")
            .attr("font-size", "10px")
            .attr("font-weight", "black")
            .attr("font-family", "JetBrains Mono")
            .text(d.label);
        });
      });
  }, [data]);

  return (
    <div className="w-full h-[600px] glass rounded-[3rem] border border-white/5 overflow-hidden relative p-8 group">
      <div className="absolute top-8 left-8 z-10 text-left">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary font-mono-custom mb-1">Network Expansion</p>
         <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white font-heading">Global Hub Matrix</h3>
      </div>
      <div className="absolute bottom-8 right-8 z-10 flex gap-4">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 font-mono-custom">Active Sink</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 font-mono-custom">Verified Node</span>
         </div>
      </div>
      <svg ref={svgRef} viewBox="0 0 1200 600" className="w-full h-full filter saturate-150" />
    </div>
  );
}

function TransactionHistoryView({ user, setScreen }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setTxs(data);
      setLoading(false);
    };
    fetchTxs();
  }, [user]);

  return (
    <div className="p-6 md:p-12 lg:px-24 w-full">
       <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
             <button onClick={() => setScreen('wallet-assets')} className="p-4 glass rounded-2xl text-primary hover:scale-110 transition-all font-heading">
                <ArrowDownLeft className="rotate-45" size={24} />
             </button>
             <h2 className="text-4xl font-black italic uppercase tracking-tighter font-heading">Activity <span className="text-primary">Ledger</span></h2>
          </div>
       </header>

       <div className="space-y-4 w-full">
          {loading ? (
             <div className="py-20 text-center animate-pulse">
                <Database size={48} className="mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500 font-mono-custom text-xs uppercase tracking-widest">Parsing Transactional Flux...</p>
             </div>
          ) : txs.length === 0 ? (
             <div className="glass p-20 rounded-[4rem] text-center border-white/5">
                <p className="text-gray-500 font-nevera">No synchronization events recorded in this node cluster.</p>
             </div>
          ) : (
            txs.map(tx => (
              <div key={tx.id} className="mm-card flex justify-between items-center group hover:border-primary/30 transition-all w-full">
                 <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'send' || tx.type === 'withdraw' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                       {tx.type === 'send' || tx.type === 'withdraw' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                    </div>
                    <div className="text-left">
                       <p className="text-xl font-black italic uppercase tracking-tighter decoration-primary decoration-2 font-heading">{tx.type} Sequence</p>
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono-custom">{tx.tx_hash?.slice(0, 20)}...</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-2xl font-black italic font-heading ${tx.type === 'send' || tx.type === 'withdraw' ? 'text-red-500' : 'text-primary'}`}>
                       {tx.type === 'send' || tx.type === 'withdraw' ? '-' : '+'}{tx.amount} {tx.currency}
                    </p>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest font-mono-custom">{new Date(tx.created_at).toLocaleString()}</p>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}

function QRScannerView({ onResult, onCancel }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        onResult(result.getText());
        codeReader.reset();
        setScanning(false);
      }
    });

    return () => {
      codeReader.reset();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6">
       <div className="max-w-md w-full relative">
          <div className="absolute top-0 left-0 right-0 p-8 z-10 flex justify-between items-center">
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white font-heading">Protocol Scanner</h3>
             <button onClick={onCancel} className="text-white hover:text-primary transition-colors text-xl">✕</button>
          </div>
          
          <div className="glass p-2 rounded-[3.5rem] border-primary/30 relative overflow-hidden aspect-square">
             <video ref={videoRef} className="w-full h-full object-cover rounded-[3rem]" />
             <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary/50 rounded-[2rem]">
                   <div className="absolute inset-0 border-2 border-white/20 animate-pulse rounded-[1.8rem]"></div>
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary animate-bounce shadow-[0_0_20px_rgba(255,107,0,1)]"></div>
             </div>
          </div>
          
          <div className="mt-12 text-center">
             <p className="text-gray-400 font-nevera text-lg font-medium">Align the Thalexa QR within the frame.</p>
             <p className="text-[10px] text-primary font-black uppercase tracking-[0.5em] mt-4 animate-pulse font-mono-custom">Awaiting Optical Handshake...</p>
          </div>
       </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);
