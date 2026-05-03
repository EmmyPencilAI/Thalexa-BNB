import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Supabase - In production, these should be from env vars
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const Theme = {
  orange: '#FF6B00',
  green: '#00FF85',
  dark: '#0A0A0A',
  surface: '#1A1A1A'
};

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('onboarding');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial Auth Check logic would go here
  }, []);

  const handleLogin = () => {
    setLoading(true);
    // Simulate Web3Auth + Supabase Login
    setTimeout(() => {
      setUser({
        id: 'user_123',
        email: 'emmanuelobed877@gmail.com',
        wallet: '0x7a...2b4e',
        role: 'admin',
        plan: 'professional'
      });
      setScreen('wallet');
      setLoading(false);
    }, 1500);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'onboarding': return <Onboarding onLogin={handleLogin} loading={loading} />;
      case 'wallet': return <WalletView user={user} setScreen={setScreen} />;
      case 'send': return <SendView setScreen={setScreen} />;
      case 'receive': return <ReceiveView user={user} setScreen={setScreen} />;
      case 'products': return <ProductsView setScreen={setScreen} />;
      case 'settings': return <SettingsView user={user} setScreen={setScreen} setUser={setUser} />;
      case 'admin': return <AdminView setScreen={setScreen} />;
      default: return <WalletView user={user} />;
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {user && screen !== 'onboarding' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/5 py-4 px-8 flex justify-between items-center z-50">
          <NavItem icon={<Wallet />} active={screen === 'wallet'} onClick={() => setScreen('wallet')} />
          <NavItem icon={<Search />} active={screen === 'products'} onClick={() => setScreen('products')} />
          <NavItem icon={<QrCode />} active={screen === 'scan'} onClick={() => {}} />
          <NavItem icon={<Settings />} active={screen === 'settings'} onClick={() => setScreen('settings')} />
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 transition-colors ${active ? 'text-primary' : 'text-gray-500'}`}
    >
      {React.cloneElement(icon, { size: 24 })}
    </button>
  );
}

function Onboarding({ onLogin, loading }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-32 h-32 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mb-8"
      >
        <ShieldCheck size={64} className="text-primary" />
      </motion.div>
      
      <h1 className="text-5xl font-bold mb-4 font-display">Thalexa</h1>
      <p className="text-gray-400 mb-12 text-lg">Secure Web3 verification, escrow, and cross-border payments.</p>

      <button 
        onClick={onLogin}
        disabled={loading}
        className="w-full bg-primary text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Zap className="animate-spin" />
        ) : (
          <>
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
            Continue with Google
          </>
        )}
      </button>
      
      <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest font-bold">Powered by BNB Chain</p>
    </div>
  );
}

function WalletView({ user, setScreen }) {
  return (
    <div className="p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">BNB Chain Wallet</p>
            <p className="text-sm font-mono text-gray-400">{user.wallet}</p>
          </div>
        </div>
        <div className="flex gap-2">
           {user.role === 'admin' && (
             <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-lg border border-green-500/20">ADMIN</div>
           )}
           <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20 uppercase">{user.plan}</div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-primary to-orange-800 p-8 rounded-[3rem] shadow-2xl shadow-primary/20 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <p className="text-white/70 text-xs font-bold mb-2 uppercase tracking-widest">Total Balance</p>
        <h2 className="text-5xl font-bold mb-8">$12,450.00</h2>
        
        <div className="flex gap-4">
          <ActionButton onClick={() => setScreen('send')} icon={<ArrowUpRight />} label="Send" />
          <ActionButton onClick={() => setScreen('receive')} icon={<ArrowDownLeft />} label="Receive" />
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Assets</h3>
          <button className="text-primary text-xs font-bold">View All</button>
        </div>
        <div className="space-y-4">
          <AssetItem name="BNB" symbol="BNB" balance="4.5" value="$2,700.00" color="#F3BA2F" />
          <AssetItem name="Tether" symbol="USDT" balance="8,200" value="$8,200.00" color="#26A17B" />
          <AssetItem name="USD Coin" symbol="USDC" balance="1,550" value="$1,550.00" color="#2775CA" />
        </div>
      </section>

      <section className="mt-10">
         <h3 className="text-xl font-bold mb-4">Usage</h3>
         <UsageProgress label="Monthly Volume" current={450} max={2000} />
         <UsageProgress label="Products Registered" current={12} max={50} />
      </section>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex-1 bg-white/20 backdrop-blur-xl py-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-white/30 transition-all border border-white/10"
    >
      {icon} {label}
    </button>
  );
}

function AssetItem({ name, symbol, balance, value, color }) {
  return (
    <div className="glass p-4 rounded-3xl flex items-center gap-4 group hover:bg-white/5 transition-all">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${color}20`, color: color }}>
        {symbol[0]}
      </div>
      <div className="flex-1">
        <p className="font-bold">{name}</p>
        <p className="text-xs text-gray-500 font-medium">{balance} {symbol}</p>
      </div>
      <div className="text-right font-bold">
        {value}
      </div>
    </div>
  );
}

function UsageProgress({ label, current, max }) {
  const percent = (current / max) * 100;
  let colorClass = "bg-secondary";
  if (percent > 60) colorClass = "bg-primary";
  if (percent > 90) colorClass = "bg-red-500";

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
        <span className="text-gray-400">{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

function ProductsView({ setScreen }) {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);

  const handleVerify = () => {
    if (search === 'GG_THLX_000042') {
      setResult({ status: 'authentic', name: 'Luxury Watch X1', manufacturer: 'Thalexa Chrono' });
    } else {
      setResult({ status: 'unknown' });
    }
  };

  return (
    <div className="p-6 pb-24">
       <h2 className="text-3xl font-bold mb-8">Verification</h2>
       
       <div className="relative mb-10">
          <input 
            type="text" 
            placeholder="Enter Product Code..."
            className="w-full glass bg-white/5 p-5 rounded-2xl outline-none focus:border-primary transition-all font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            onClick={handleVerify}
            className="absolute right-3 top-3 bg-primary text-black p-2 rounded-xl"
          >
            <Search size={24} />
          </button>
       </div>

       {result && (
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className={`p-8 rounded-[2rem] border-2 text-center ${result.status === 'authentic' ? 'border-secondary/20 bg-secondary/5' : 'border-red-500/20 bg-red-500/5'}`}
         >
           {result.status === 'authentic' ? (
             <>
               <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 size={48} className="text-secondary" />
               </div>
               <h3 className="text-2xl font-bold text-secondary mb-2 uppercase italic tracking-tighter">Authentic</h3>
               <p className="text-xl font-bold">{result.name}</p>
               <p className="text-gray-400 text-sm">Verified by BNB Chain Proof</p>
             </>
           ) : (
             <>
               <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertCircle size={48} className="text-red-500" />
               </div>
               <h3 className="text-2xl font-bold text-red-500 mb-2 uppercase">Unverified</h3>
               <p className="text-gray-400 text-sm">This code does not match any registered product.</p>
             </>
           )}
         </motion.div>
       )}

       <div className="mt-12">
          <h3 className="font-bold mb-4">Recent Products</h3>
          <div className="space-y-3">
             <div className="glass p-4 rounded-2xl flex items-center justify-between">
                <div>
                   <p className="text-sm font-bold">GG_THLX_1120</p>
                   <p className="text-[10px] text-gray-500">2 days ago</p>
                </div>
                <div className="text-secondary text-[10px] font-bold">VERIFIED</div>
             </div>
          </div>
       </div>
    </div>
  );
}

function AdminView({ setScreen }) {
  const users = [
    { email: 'emmanuelobed877@gmail.com', role: 'admin', status: 'active' },
    { email: 'cyberemmypencil2077@gmail.com', role: 'compliance', status: 'active' },
    { email: 'user@example.com', role: 'user', status: 'active' },
  ];

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('wallet')} className="p-2 glass rounded-xl"><ArrowDownLeft className="rotate-45" /></button>
        <h2 className="text-3xl font-bold">Admin Panel</h2>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">System Stats</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="glass p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Total Escrows</p>
                <p className="text-2xl font-bold">1,240</p>
             </div>
             <div className="glass p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Volume (BNB)</p>
                <p className="text-2xl font-bold">452.5</p>
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Users</h3>
          <div className="space-y-3">
             {users.map((u, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-bold text-sm">{u.email}</p>
                      <p className="text-[10px] text-primary font-bold uppercase">{u.role}</p>
                   </div>
                   <div className="w-2 h-2 bg-secondary rounded-full"></div>
                </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsView({ user, setScreen, setUser }) {
  return (
    <div className="p-6 pb-24">
      <h2 className="text-3xl font-bold mb-8">Settings</h2>
      
      <div className="glass p-6 rounded-[2rem] mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold">{user.email}</h3>
            <p className="text-xs text-gray-500">ID: {user.id}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <SettingItem icon={<ShieldCheck />} label="Backup Wallet (MPC)" onClick={() => alert('MPC Key: 0x...')} />
          {user.role === 'admin' && (
            <SettingItem icon={<LayoutDashboard />} label="Admin Dashboard" onClick={() => setScreen('admin')} />
          )}
          <SettingItem icon={<History />} label="Transaction History" />
          <SettingItem icon={<User />} label="Profile Verification" />
        </div>
      </div>

      <button 
        onClick={() => { setUser(null); setScreen('onboarding'); }}
        className="w-full glass p-5 rounded-2xl text-red-500 font-bold flex items-center justify-center gap-2"
      >
        <LogOut size={20} /> Sign Out
      </button>
    </div>
  );
}

function SettingItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all"
    >
      <div className="text-primary">{icon}</div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function SendView({ setScreen }) { return <div className="p-6"><button onClick={() => setScreen('wallet')}>Back</button><h1>Send</h1></div>; }
function ReceiveView({ user, setScreen }) { return <div className="p-6"><button onClick={() => setScreen('wallet')}>Back</button><h1>Receive</h1></div>; }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
