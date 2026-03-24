import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, CreditCard, Shield, Bell, Globe, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const SettingsView = () => {
  const { user, setUser } = useAuth();
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isUpdating, setIsUpdating] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-display font-bold mb-2">Settings</h2>
        <p className="text-gray-400">Manage your account, security, and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-black font-bold rounded-xl transition-all">
            <User size={20} />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface rounded-xl text-gray-400 transition-all">
            <CreditCard size={20} />
            Billing
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface rounded-xl text-gray-400 transition-all">
            <Shield size={20} />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface rounded-xl text-gray-400 transition-all">
            <Bell size={20} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface rounded-xl text-gray-400 transition-all">
            <Globe size={20} />
            Preferences
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User className="text-primary" size={24} />
              Public Profile
            </h3>

            <div className="space-y-4">
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
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : (
                      <>
                        <Save size={18} />
                        Save
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
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

          {/* Integration Status */}
          <section className="glass p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="text-primary" size={24} />
              API Integrations
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Paystack</p>
                <p className="text-sm font-medium text-secondary flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Connected
                </p>
              </div>
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Cryptomus</p>
                <p className="text-sm font-medium text-secondary flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Connected
                </p>
              </div>
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pinata (IPFS)</p>
                <p className="text-sm font-medium text-secondary flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Connected
                </p>
              </div>
              <div className="p-4 bg-surface rounded-2xl border border-border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Sui Contract</p>
                <p className="text-sm font-medium text-secondary flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  Active
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
