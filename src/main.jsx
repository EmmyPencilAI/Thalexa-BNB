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
  Zap,
  CreditCard
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

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
    // Check for payment redirect status
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_status') === 'success') {
      alert('Payment Successful! Reference: ' + params.get('reference'));
      // Clear URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogin = () => {
    setLoading(true);
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
      case 'escrow': return <EscrowDashboard user={user} setScreen={setScreen} />;
      case 'create-escrow': return <CreateEscrowView setScreen={setScreen} />;
      case 'products': return <ProductsView setScreen={setScreen} />;
      case 'settings': return <SettingsView user={user} setScreen={setScreen} setUser={setUser} />;
      case 'admin': return <AdminView setScreen={setScreen} />;
      case 'subscriptions': return <SubscriptionsView user={user} setScreen={setScreen} />;
      default: return <WalletView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
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

      {user && !['onboarding'].includes(screen) && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/5 py-4 px-8 flex justify-between items-center z-50">
          <NavItem icon={<Wallet />} active={screen === 'wallet'} onClick={() => setScreen('wallet')} />
          <NavItem icon={<ShieldCheck />} active={screen === 'escrow'} onClick={() => setScreen('escrow')} />
          <NavItem icon={<Zap />} active={screen === 'products'} onClick={() => setScreen('products')} />
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
           <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20 uppercase">{user.plan}</div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-primary to-orange-800 p-8 rounded-[3rem] shadow-2xl shadow-primary/20 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <p className="text-white/70 text-xs font-bold mb-2 uppercase tracking-widest">Total Balance</p>
        <h2 className="text-5xl font-bold mb-8">$12,450.00</h2>
        
        <div className="flex gap-4">
          <ActionButton onClick={() => alert('Send Placeholder')} icon={<ArrowUpRight />} label="Send" />
          <ActionButton onClick={() => alert('Receive Placeholder')} icon={<ArrowDownLeft />} label="Receive" />
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

function EscrowDashboard({ user, setScreen }) {
  const escrows = [
    { id: '1', role: 'sender', amount: '2.5 BNB', status: 'funded', receiver: '0x12...3456', product: 'Luxury Watch X1' },
    { id: '2', role: 'receiver', amount: '0.8 BNB', status: 'completed', sender: '0xab...cd90', product: 'Vintage Camera' },
  ];

  return (
    <div className="p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-display">Escrow</h2>
        <button 
          onClick={() => setScreen('create-escrow')}
          className="bg-primary text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
        >
          <Zap size={16} /> New Escrow
        </button>
      </header>

      <div className="space-y-4">
        {escrows.map((e) => (
          <div key={e.id} className="glass p-5 rounded-[2rem] border-l-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{e.role} • {e.product}</p>
                <p className="text-lg font-bold">{e.amount}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${e.status === 'funded' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                {e.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400 font-mono italic">
                {e.role === 'sender' ? `To: ${e.receiver}` : `From: ${e.sender}`}
              </p>
              {e.role === 'sender' && e.status === 'funded' && (
                <button className="bg-secondary text-black px-3 py-1 rounded-lg text-[10px] font-bold">Release Funds</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateEscrowView({ setScreen }) {
  const [loading, setLoading] = useState(false);
  
  const handlePaystackDeposit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'emmanuelobed877@gmail.com',
          amount: 5000, 
          metadata: { type: 'escrow_funding' }
        })
      });
      const data = await res.json();
      if (data.status && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert('Failed to initialize Paystack: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend for Paystack');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('escrow')} className="p-2 glass rounded-xl"><ArrowDownLeft className="rotate-45" /></button>
        <h2 className="text-2xl font-bold">Create Escrow</h2>
      </header>

      <div className="space-y-6 flex-1">
        <div className="glass p-5 rounded-2xl">
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Receiver Address</label>
          <input type="text" className="w-full bg-transparent outline-none font-mono text-sm" placeholder="0x..." />
        </div>

        <div className="glass p-5 rounded-2xl">
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Amount (BNB)</label>
          <input type="number" className="w-full bg-transparent outline-none text-2xl font-bold" placeholder="0.00" />
        </div>

        <div className="glass p-5 rounded-2xl">
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Product Code (Optional)</label>
          <input type="text" className="w-full bg-transparent outline-none text-sm" placeholder="GG_THLX_..." />
        </div>
      </div>

      <div className="space-y-4 pt-6">
        <button className="w-full bg-primary text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-2">
          <Wallet size={20} /> Create with Wallet
        </button>
        
        <div className="relative flex items-center py-2">
           <div className="flex-grow border-t border-white/10"></div>
           <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-bold uppercase">or fund via paystack</span>
           <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button 
           onClick={handlePaystackDeposit}
           disabled={loading}
           className="w-full glass py-5 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-white/5 transition-all text-sm"
        >
          {loading ? <Zap className="animate-spin" /> : <><CreditCard size={20} className="text-primary"/> Deposit NGN to Escrow</>}
        </button>
      </div>
    </div>
  );
}

function ProductsView({ setScreen }) {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleVerify = () => {
    if (search === 'GG_THLX_000042') {
      setResult({ status: 'authentic', name: 'Luxury Watch X1', manufacturer: 'Thalexa Chrono' });
    } else {
      setResult({ status: 'unknown' });
    }
  };

  return (
    <div className="p-6 pb-24">
       <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Verification</h2>
          <button 
            onClick={() => setShowRegister(!showRegister)}
            className="p-3 glass rounded-2xl text-primary"
          >
            {showRegister ? <Search size={20} /> : <Zap size={20} />}
          </button>
       </header>
       
       {showRegister ? (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xl font-bold font-display tracking-tight">Register New Product</h3>
            <div className="glass p-5 rounded-2xl">
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Product Name</label>
              <input type="text" className="w-full bg-transparent outline-none font-bold" placeholder="e.g. Luxury Handbag" />
            </div>
            <div className="glass p-5 rounded-2xl">
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Batch Serial</label>
              <input type="text" className="w-full bg-transparent outline-none font-bold" placeholder="GG_THLX_..." />
            </div>
            <button className="w-full bg-primary text-black font-bold py-5 rounded-2xl">Create On-Chain Record</button>
         </motion.div>
       ) : (
         <>
           <div className="relative mb-10">
              <input 
                type="text" 
                placeholder="Search Product Code..."
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
                   <p className="text-gray-400 text-sm mb-6">Verified by BNB Chain Proof</p>
                   <div className="bg-white p-4 rounded-3xl w-fit mx-auto shadow-xl">
                      <QRCodeSVG value={`https://thalexa.com/verify/${search}`} size={128} />
                   </div>
                   <p className="mt-4 text-[10px] text-gray-500 font-mono italic">SCAN TO VERIFY OWNERSHIP</p>
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
         </>
       )}

       <div className="mt-12">
          <h3 className="font-bold mb-4">Inventory</h3>
          <div className="space-y-3">
             <div className="glass p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary italic font-black">X</div>
                  <div>
                    <p className="text-sm font-bold">Luxury Watch X1</p>
                    <p className="text-[10px] text-gray-500">GG_THLX_000042</p>
                  </div>
                </div>
                <div className="text-secondary text-[10px] font-bold px-2 py-1 bg-secondary/10 rounded-lg">LIVE</div>
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
        <h2 className="text-3xl font-bold font-display">System Admin</h2>
      </div>

      <div className="space-y-6">
        <section>
          <div className="grid grid-cols-2 gap-4">
             <div className="glass p-5 rounded-[2rem]">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Escrows</p>
                <p className="text-3xl font-black">1,240</p>
             </div>
             <div className="glass p-5 rounded-[2rem]">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Volume (BNB)</p>
                <p className="text-3xl font-black">452.5</p>
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Global Users</h3>
          <div className="space-y-3">
             {users.map((u, i) => (
                <div key={i} className="glass p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-bold text-sm tracking-tight">{u.email}</p>
                      <p className="text-[10px] text-primary font-bold uppercase">{u.role}</p>
                   </div>
                   <div className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_rgba(0,255,133,0.5)]"></div>
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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold">{user.email}</h3>
            <p className="text-xs text-gray-500">ID: {user.id}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <SettingItem icon={<ShieldCheck />} label="Backup Wallet (MPC)" onClick={() => alert('MPC Key: 0x...')} />
          <SettingItem icon={<Zap />} label="Subscription & Billing" onClick={() => setScreen('subscriptions')} />
          {user.role === 'admin' && (
            <SettingItem icon={<LayoutDashboard />} label="Admin Dashboard" onClick={() => setScreen('admin')} />
          )}
          <SettingItem icon={<History />} label="Activity Log" />
          <SettingItem icon={<User />} label="KYC Verification" />
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
      className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all"
    >
      <div className="text-primary">{icon}</div>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

function SubscriptionsView({ user, setScreen }) {
  const plans = [
    { title: 'Starter', price: '$0', limit: '$2,000/mo', color: 'gray' },
    { title: 'Professional', price: '$500', limit: '$200,000/mo', color: 'primary' },
    { title: 'Enterprise', price: '$2,000', limit: 'Unlimited', color: 'secondary' },
  ];

  return (
    <div className="p-6">
       <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('settings')} className="p-2 glass rounded-xl"><ArrowDownLeft className="rotate-45" /></button>
        <h2 className="text-2xl font-bold">Billing</h2>
      </header>

      <div className="space-y-6">
        {plans.map((p) => (
          <div key={p.title} className={`p-6 rounded-[2.5rem] border ${user.plan === p.title.toLowerCase() ? 'border-primary bg-primary/5' : 'border-white/5 glass'}`}>
             <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{p.title}</h3>
                  <p className="text-gray-500 text-sm italic">{p.limit} volume</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black tracking-tighter">{p.price}</p>
                   <p className="text-[10px] text-gray-500 uppercase font-bold">Per month</p>
                </div>
             </div>
             
             {user.plan === p.title.toLowerCase() ? (
               <div className="w-full py-4 text-center text-primary font-bold bg-primary/10 rounded-2xl text-sm">Current Active Plan</div>
             ) : (
               <button className="w-full py-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl font-bold text-sm">Upgrade Now</button>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SendView({ setScreen }) { return <div className="p-6"><button onClick={() => setScreen('wallet')}>Back</button><h1>Send</h1></div>; }
function ReceiveView({ user, setScreen }) { return <div className="p-6"><button onClick={() => setScreen('wallet')}>Back</button><h1>Receive</h1></div>; }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
