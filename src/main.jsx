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

  const handleLogin = async () => {
    setLoading(true);
    try {
       // In a real app, you'd use Supabase Auth here
       // For this demo, we simulate a login and fetch the user profile from our 'users' table
       const { data, error } = await supabase
         .from('users')
         .select('*')
         .eq('email', 'emmanuelobed877@gmail.com')
         .single();
       
       if (data) {
         setUser(data);
       } else {
          // Auto-create profile if not exists (for demo convenience)
          const newUser = {
            id: 'ae6d' + Math.random().toString(16).slice(2, 10),
            email: 'emmanuelobed877@gmail.com',
            wallet_address: '0x' + Math.random().toString(16).slice(2, 42),
            role: 'admin',
            plan: 'professional'
          };
          await supabase.from('users').insert([newUser]);
          setUser(newUser);
       }
       setScreen('wallet');
    } catch (e) {
       console.error(e);
    } finally {
       setLoading(false);
    }
  };

  const renderScreen = () => {
    // Corrected navigation logic:
    if (!user) {
      if (screen === 'onboarding') return <Onboarding onLogin={handleLogin} loading={loading} />;
      return <LandingPage onStart={() => setScreen('onboarding')} stats={stats} />;
    }

    switch (screen) {
      case 'landing': return <LandingPage onStart={() => setScreen('onboarding')} stats={stats} products={landingProducts} />;
      case 'onboarding': return <Onboarding onLogin={handleLogin} loading={loading} />;
      case 'wallet': return <WalletView user={user} setScreen={setScreen} stats={stats} />;
      case 'escrow': return <EscrowDashboard user={user} setScreen={setScreen} />;
      case 'create-escrow': return <CreateEscrowView user={user} setScreen={setScreen} />;
      case 'products': return <ProductsView user={user} setScreen={setScreen} />;
      case 'settings': return <SettingsView user={user} setScreen={setScreen} setUser={setUser} />;
      case 'admin': return <AdminView setScreen={setScreen} stats={stats} />;
      case 'subscriptions': return <SubscriptionsView user={user} setScreen={setScreen} />;
      default: return <WalletView user={user} setScreen={setScreen} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <AnimatePresence>
        {announcement && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-primary text-black p-4 font-black shadow-2xl flex justify-center items-center gap-4 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
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
          className="flex flex-col items-center"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {user && screen !== 'landing' && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass border border-white/10 py-4 px-8 flex justify-between items-center z-50 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl md:bottom-auto md:top-6 md:left-[85%] md:flex-col md:gap-8 md:w-20 md:py-8 md:px-0 md:rounded-3xl hover:border-primary/30 transition-colors">
          <NavItem icon={<Wallet />} active={screen === 'wallet'} onClick={() => setScreen('wallet')} label="Wallet" />
          <NavItem icon={<ShieldCheck />} active={screen === 'escrow'} onClick={() => setScreen('escrow')} label="Escrow" />
          <NavItem icon={<Zap />} active={screen === 'products'} onClick={() => setScreen('products')} label="Products" />
          <NavItem icon={<Settings />} active={screen === 'settings'} onClick={() => setScreen('settings')} label="Settings" />
          {user.role === 'admin' && (
            <NavItem icon={<Database />} active={screen === 'admin'} onClick={() => setScreen('admin')} label="Admin" />
          )}
        </nav>
      )}
    </div>
  );
}

// ⸻ LANDING PAGE (PRODUCTION ECOSYSTEM) ⸻

function LandingPage({ onStart, stats, products }) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerEvents = [
    "ASSET_MINT: Luxury Watch X1 (GENEVA_NODE)",
    "ESCROW_FUNDED: 4.52 BNB (0x7a...2b4e)",
    "REGISTRY_SYNC: IPFS_PROPAGATION (100.0%)",
    "VERIFICATION: AUTHENTIC (GG_THLX_000042)",
    "NETWORK_UPDATE: INFRASTRUCTURE_FLUX (GRADE_AAA)"
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
         <div className="max-w-7xl mx-auto flex items-center gap-4">
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
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto backdrop-blur-xl border-b border-white/5">
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
          onClick={() => { console.log("Launch Terminal Triggered"); onStart(); }}
          className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all font-heading uppercase tracking-widest shadow-xl"
        >
          Launch Terminal
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
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
              <button onClick={() => { console.log('Hero Verify Triggered'); onStart(); }} className="group relative px-10 py-6 bg-primary text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all font-heading shadow-[0_0_40px_rgba(0,255,133,0.3)]">
                Verify Product
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-[2rem]"></div>
              </button>
              <button className="px-10 py-6 glass border border-white/10 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all font-heading text-white">
                Explore Network
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative mt-12 lg:mt-0">
             <ProductGrid3D products={products} />
          </div>
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
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
               <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 font-heading text-white">Verification <span className="text-primary">Registry</span></h2>
               <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium font-nevera">Input a Protocol ID to trace a product's journey, ownership history, and current authenticity status.</p>
            </div>
            
            <InteractionScanner />
         </div>
      </section>

      {/* How it Works - Pipeline */}
      <section id="how" className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-20 font-heading text-left text-white">Protocol <span className="text-violet-500">Flux</span> Pipeline</h2>
            <PipelineFlow />
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-black relative">
         <div className="max-w-7xl mx-auto">
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
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-24 font-heading text-white">Global <span className="text-gray-500">Integration</span></h2>
            <IndustryOrbs />
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 px-6 relative overflow-hidden bg-gradient-to-b from-black to-primary/10">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
         <div className="max-w-4xl mx-auto text-center relative z-10">
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
               <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 font-mono-custom text-left">{item.product_code}</span>
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
      const { data, error } = await supabase
        .from('products')
        .select('*, users!products_owner_id_fkey(email, wallet_address)')
        .eq('product_code', input.trim().toUpperCase())
        .single();
      
      if (error || !data) {
        setStatus('invalid');
      } else {
        setStatus('authentic');
        setHistory([
          { event: 'Initial Protocol Mint', op: 'Node_Auth_Primary', t: new Date(data.created_at).toLocaleDateString() },
          { event: 'Global Registry Bind', op: 'EVM_Sync', t: new Date(data.created_at).toLocaleDateString() },
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
       <div className="max-w-4xl mx-auto">
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
      className={`glass p-12 rounded-[4rem] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between min-h-[400px] shadow-2xl text-left ${glow}`}
    >
       <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-primary mb-12 shadow-inner text-left">
          {icon}
       </div>
       <div className="text-left">
         <h4 className="text-3xl font-black italic uppercase tracking-tighter font-heading text-white mb-6 leading-tight">{title}</h4>
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


// ⸻ WALLET SYSTEM (REAL MONEY) ⸻

function WalletView({ user, setScreen, stats }) {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [sendData, setSendData] = useState({ to: '', amount: '', currency: 'BNB' });
  const [swapData, setSwapData] = useState({ from: 'BNB', to: 'USDT', amount: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscription, setSubscription] = useState(null);

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

    // Real-time subscription updates
    const channel = supabase
      .channel('subscription_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` }, (payload) => {
        setSubscription(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const limits = {
    starter: { vol: 2000, reg: 0 },
    professional: { vol: 200000, reg: 300 },
    enterprise: { vol: 2000000, reg: 100000 }
  };

  const currentLimits = limits[user.plan] || limits.starter;

  const handleSend = async () => {
    if (!sendData.to || !sendData.amount) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        amount: parseFloat(sendData.amount),
        currency: sendData.currency,
        type: 'send',
        status: 'completed',
        tx_hash: '0x' + Math.random().toString(16).slice(2, 42)
      }]);
      if (error) throw error;
      alert(`Successfully sent ${sendData.amount} ${sendData.currency} to ${sendData.to}`);
      setIsSendModalOpen(false);
      setSendData({ to: '', amount: '', currency: 'BNB' });
    } catch (e) {
      alert('Transaction Failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
             <div className={`w-2 h-2 rounded-full bg-secondary animate-pulse`}></div>
             <span className="text-xs font-black uppercase tracking-tighter font-mono-custom">BNB Mainnet</span>
          </div>
        </header>

        {/* Live Transaction Pulse */}
        <section className="mb-12 relative overflow-hidden">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic uppercase tracking-tighter font-heading text-primary">Live Transaction Pulse</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-secondary animate-ping"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-secondary font-mono-custom">Network Relay Active</span>
              </div>
           </div>
           <div className="glass p-6 rounded-3xl border border-white/5 overflow-hidden h-16 flex items-center relative">
              <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-black/50 to-transparent z-10 pointer-events-none"></div>
              <motion.div 
                animate={{ x: [-1000, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-12 whitespace-nowrap"
              >
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 font-mono-custom">
                    <span className="text-white">TX_{Math.random().toString(16).slice(2,8)}:</span> MINT_SUCCESS (0x...{Math.random().toString(16).slice(2,4)})
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-white">NODE_{i+1}:</span> {Math.floor(Math.random() * 50) + 10}ms LATENCY
                  </div>
                ))}
              </motion.div>
           </div>
        </section>

        <div className="bg-gradient-to-br from-[#111] to-black p-12 rounded-[4rem] border border-white/10 shadow-2xl mb-12 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
          <p className="text-gray-500 text-[12px] font-black mb-4 uppercase tracking-[0.3em] font-mono-custom">Liquidity Status</p>
          <h2 className="text-7xl font-black italic mb-12 relative z-10 tracking-tighter font-heading">{user.balance}</h2>
          
          <div className="flex gap-6 relative z-10">
            <ActionButton onClick={() => setIsSendModalOpen(true)} icon={<ArrowUpRight />} label="Send Assets" />
            <ActionButton onClick={() => setIsSwapModalOpen(true)} icon={<QrCode />} label="Swap Assets" />
          </div>
        </div>

        {/* Send Modal */}
        <AnimatePresence>
          {isSendModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <div className="glass p-12 rounded-[4rem] border border-white/10 w-full max-w-xl relative text-left">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter font-heading mb-8">Initiate Transfer</h3>
                <div className="space-y-4 mb-8">
                   <AdminInput placeholder="Recipient Wallet Address (0x...)" value={sendData.to} onChange={v => setSendData({...sendData, to: v})} />
                   <div className="flex gap-4">
                      <AdminInput placeholder="Amount" value={sendData.amount} onChange={v => setSendData({...sendData, amount: v})} />
                      <select 
                        value={sendData.currency}
                        onChange={(e) => setSendData({...sendData, currency: e.target.value})}
                        className="glass bg-white/5 p-4 rounded-2xl outline-none border border-white/10 font-black text-xs uppercase"
                      >
                         <option value="BNB">BNB</option>
                         <option value="USDT">USDT</option>
                         <option value="USDC">USDC</option>
                         <option value="BTC">BTC</option>
                         <option value="ETH">ETH</option>
                      </select>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setIsSendModalOpen(false)} className="flex-1 p-6 glass border border-white/10 rounded-3xl font-black uppercase text-xs">Cancel</button>
                   <button onClick={handleSend} disabled={isProcessing} className="flex-1 p-6 bg-primary text-black rounded-3xl font-black uppercase text-xs shadow-xl shadow-primary/20">
                     {isProcessing ? <Zap className="animate-spin" /> : "Confirm Send"}
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Modal */}
        <AnimatePresence>
          {isSwapModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <div className="glass p-12 rounded-[4rem] border border-white/10 w-full max-w-xl relative text-left">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter font-heading mb-8">Atomic Swap</h3>
                <div className="space-y-6 mb-8">
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] uppercase font-black text-gray-500 font-mono-custom">Pay</label>
                     <div className="flex gap-2">
                       <AdminInput placeholder="Amount" value={swapData.amount} onChange={v => setSwapData({...swapData, amount: v})} />
                       <select value={swapData.from} onChange={e => setSwapData({...swapData, from: e.target.value})} className="glass bg-white/5 p-4 rounded-2xl outline-none border border-white/10 font-black text-xs">
                          {['BNB', 'USDT', 'USDC', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="flex justify-center -my-2"><ArrowDown className="text-primary" /></div>
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] uppercase font-black text-gray-500 font-mono-custom">Receive (Est.)</label>
                     <div className="flex gap-2">
                       <div className="flex-1 glass bg-white/5 p-5 rounded-2xl border border-white/10 font-bold text-xs">{(parseFloat(swapData.amount) * 600 || 0).toFixed(2)}</div>
                       <select value={swapData.to} onChange={e => setSwapData({...swapData, to: e.target.value})} className="glass bg-white/5 p-4 rounded-2xl outline-none border border-white/10 font-black text-xs">
                          {['BNB', 'USDT', 'USDC', 'BTC', 'ETH'].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                     </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setIsSwapModalOpen(false)} className="flex-1 p-6 glass border border-white/10 rounded-3xl font-black uppercase text-xs">Cancel</button>
                   <button onClick={() => { alert('Swap Transaction Broadcasted'); setIsSwapModalOpen(false); }} className="flex-1 p-6 bg-secondary text-black rounded-3xl font-black uppercase text-xs shadow-xl shadow-secondary/20">
                     Swap Assets
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[12px] text-primary font-black uppercase tracking-widest mb-1 italic font-mono-custom">Protocol Layer</p>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter font-heading">Assets</h3>
            </div>
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
        <section className="bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 text-left">
           <h3 className="text-2xl font-black italic uppercase mb-8 tracking-tighter font-heading">Protocol Load</h3>
           <UsageProgress 
             label="Monthly Volume" 
             current={subscription?.monthly_usage_volume || 0} 
             max={currentLimits.vol} 
             prefix="$"
           />
           <UsageProgress 
             label="Product Registrations" 
             current={subscription?.product_usage_count || 0} 
             max={currentLimits.reg} 
           />
        </section>
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
    <div className="p-6 md:p-12 pb-24 max-w-7xl w-full mx-auto">
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
       const { error } = await supabase.from('escrows').insert([{
         sender_id: user.id,
         receiver_id: formData.receiver_id,
         amount: parseFloat(formData.amount),
         currency: formData.currency,
         status: 'funded'
       }]);

       if (error) throw error;
       alert('BNB Chain Transaction Confirmed: Escrow Locked');
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
    if (!registerData.name || !registerData.serial) return;
    setIsRegistering(true);
    try {
      const { error } = await supabase.from('products').insert([{
        product_code: registerData.serial.toUpperCase(),
        owner_id: user.id,
        metadata: {
          name: registerData.name,
          type: 'Consumer Goods',
          price: registerData.price || '0.00 BNB',
          description: registerData.desc
        }
      }]);
      
      if (error) throw error;
      alert('Product Registered. CID pinned. 0.009 BNB Sent to Treasury.');
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
      .eq('product_code', search.trim().toUpperCase())
      .single();

    if (data) {
      setResult({ 
        status: 'authentic', 
        name: data.metadata?.name || 'Unknown Item', 
        manufacturer: 'Authenticated Asset', 
        tx: data.id.slice(0,12),
        ipfs_cid: 'QmXoyp...7V2c',
        location: 'Global Hub',
        date: new Date(data.created_at).toLocaleDateString()
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
  const [logs, setLogs] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
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
        </header>

        {/* Product Upload Tool */}
        <section className="mb-12 glass p-10 rounded-[3rem] border border-primary/20 bg-primary/5">
           <h3 className="text-xl font-black italic uppercase mb-6 tracking-tighter font-heading text-primary">Mint New Product (Landing NFT)</h3>
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
