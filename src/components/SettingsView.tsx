import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, CreditCard, Shield, Bell, Globe, Save, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { formatAddress, cn } from '../lib/utils';

const SettingsView = () => {
  const { user, setUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'profile' | 'billing' | 'security' | 'notifications' | 'preferences'>('profile');
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const categories = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const handleUpdateUsername = async () => {
    if (!user) return;
    if (newUsername === user.username) return;
    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters.');
      return;
    }

    setIsUpdating(true);

    try {
      // Check if username change is free or paid
      if (user.username_changes > 0) {
        // This is where Paystack/Cryptomus integration would happen
        // For now, we simulate a payment requirement
        const confirmed = window.confirm("Changing your username again costs $5. Proceed to payment?");
        if (!confirmed) {
          setIsUpdating(false);
          return;
        }
        // Simulate payment success
        toast.info("Processing $5 payment via Paystack...");
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          username_changes: user.username_changes + 1
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (setUser) setUser(data);
      toast.success('Username updated successfully!');
    } catch (err: any) {
      console.error('Update username error:', err.message);
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile':
        return (
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border border-primary/30">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold">{user?.username || 'Anonymous User'}</h3>
                <p className="text-gray-400 text-sm font-mono bg-surface px-3 py-1 rounded-lg border border-border mt-2">
                  {formatAddress(user?.wallet_address || '')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1 input-field"
                    placeholder="Enter new username"
                  />
                  <button 
                    onClick={handleUpdateUsername}
                    disabled={isUpdating || newUsername === user?.username}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-8"
                  >
                    {isUpdating ? 'Updating...' : (
                      <>
                        <Save size={18} />
                        Save
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <Bell size={12} className="text-primary" />
                  {user?.username_changes === 0 
                    ? "First change is free. Subsequent changes cost $5." 
                    : `You have changed your username ${user?.username_changes} times. Next change costs $5.`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email} 
                  disabled 
                  className="w-full input-field opacity-50 cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-gray-500">Email cannot be changed for security reasons.</p>
              </div>
            </div>
          </section>
        );
      case 'billing':
        return (
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="text-primary" size={24} />
              Billing & Subscription
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-surface rounded-3xl border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2">
                  <span className="bg-secondary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Current Plan</p>
                <p className="text-3xl font-display font-bold text-white mb-4 capitalize">{user?.subscription_tier || 'Starter'}</p>
                <button 
                  onClick={() => toast.info('Subscription management is handled via Paystack')}
                  className="w-full py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Manage Plan
                </button>
              </div>

              <div className="p-6 bg-surface rounded-3xl border border-border">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">Payment Method</p>
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                    <span className="text-sm font-mono">•••• 4242</span>
                  </div>
                  <button onClick={() => toast.info('Redirecting to payment provider...')} className="text-xs text-primary font-bold">Edit</button>
                </div>
                <button 
                  onClick={() => toast.info('Cryptomus & Paystack gateways available')}
                  className="w-full py-2 rounded-xl border border-dashed border-border text-xs text-gray-500 hover:border-primary hover:text-primary transition-all"
                >
                  + Add New Method
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Recent Invoices</h4>
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between items-center p-4 bg-surface/50 rounded-2xl border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Subscription Payment</p>
                      <p className="text-xs text-gray-500">Invoice #THX-2026-00{i}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">$19.00</p>
                    <button onClick={() => toast.success('Downloading invoice...')} className="text-xs text-primary hover:underline">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'security':
        return (
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Shield className="text-primary" size={24} />
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-surface rounded-3xl border border-border group hover:border-secondary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/10 text-secondary rounded-2xl group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Secure your account with 2FA codes.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toast.success('2FA Setup initiated')}
                  className="px-6 py-2 bg-secondary text-black font-bold rounded-xl hover:shadow-lg hover:shadow-secondary/20 transition-all"
                >
                  Enable
                </button>
              </div>

              <div className="flex justify-between items-center p-5 bg-surface rounded-3xl border border-border group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                    <Lock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Password Management</p>
                    <p className="text-sm text-gray-400">Last changed 3 months ago.</p>
                  </div>
                </div>
                <button 
                  onClick={() => toast.info('Password reset link sent to your email')}
                  className="px-6 py-2 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="p-6 bg-surface/30 rounded-3xl border border-border">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                Active Sessions
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-bold">Chrome on macOS</p>
                      <p className="text-xs text-gray-500">Lagos, Nigeria • Current</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Now</span>
                </div>
                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Thalexa App on iPhone 15</p>
                      <p className="text-xs text-gray-500">Abuja, Nigeria • 2h ago</p>
                    </div>
                  </div>
                  <button onClick={() => toast.success('Session terminated')} className="text-xs text-red-500 font-bold hover:underline">Revoke</button>
                </div>
              </div>
            </div>
          </section>
        );
      case 'notifications':
        return (
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Bell className="text-primary" size={24} />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Email Notifications', desc: 'Receive transaction receipts and reports', active: true },
                { label: 'Push Notifications', desc: 'Get real-time alerts on your device', active: false },
                { label: 'Escrow Updates', desc: 'Alerts for status changes in your escrows', active: true },
                { label: 'Price Alerts', desc: 'Notify me of significant market moves', active: false }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-5 bg-surface rounded-3xl border border-border hover:border-white/10 transition-all">
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => toast.success(`${item.label} ${!item.active ? 'enabled' : 'disabled'}`)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      item.active ? "bg-secondary" : "bg-border"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      item.active ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      case 'preferences':
        return (
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="text-primary" size={24} />
              App Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Default Currency</label>
                <select 
                  onChange={() => toast.success('Currency preference updated')}
                  className="w-full input-field bg-surface border-border focus:border-primary transition-all"
                >
                  <option>USD ($)</option>
                  <option>NGN (₦)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Language</label>
                <select 
                  onChange={() => toast.success('Language updated')}
                  className="w-full input-field bg-surface border-border focus:border-primary transition-all"
                >
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Yoruba</option>
                  <option>Hausa</option>
                  <option>Igbo</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-surface/30 rounded-3xl border border-border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">Dark Mode</p>
                  <p className="text-sm text-gray-400">Switch between light and dark themes.</p>
                </div>
                <button 
                  onClick={() => toast.info('Theme switching is currently locked to Dark Mode for this preview')}
                  className="w-12 h-6 bg-secondary rounded-full relative"
                >
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>

            <button 
              onClick={() => toast.success('All preferences saved successfully')}
              className="w-full py-4 btn-primary text-lg"
            >
              Save All Changes
            </button>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-display font-bold mb-2">Settings</h2>
        <p className="text-gray-400">Manage your account, security, and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 font-bold rounded-xl transition-all",
                activeCategory === cat.id 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : "text-gray-400 hover:bg-surface hover:text-white"
              )}
            >
              <cat.icon size={20} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
