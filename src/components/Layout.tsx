import React from 'react';
import { motion } from 'motion/react';
import { Wallet, ShieldCheck, ArrowRightLeft, LayoutDashboard, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

import { Logo } from './Logo';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-gray-400 hover:bg-surface hover:text-white"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function Layout({ children, activeTab, setActiveTab }: { 
  children: React.ReactNode, 
  activeTab: string, 
  setActiveTab: (tab: string) => void 
}) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'verify', label: 'Verification', icon: ShieldCheck },
    { id: 'escrow', label: 'Escrow', icon: ArrowRightLeft },
    { id: 'admin', label: 'Admin', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-xl tracking-tight">Thalexa</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <Logo className="w-10 h-10 text-primary" />
          <span className="font-display font-bold text-2xl tracking-tight">Thalexa</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
            />
          ))}
        </nav>

        <div className="absolute bottom-10 left-6 right-6">
          <div className="p-4 glass rounded-2xl mb-4">
            <p className="text-xs text-gray-400 mb-1">Subscription</p>
            <p className="font-semibold text-secondary capitalize">{user?.subscription_tier || 'Starter'}</p>
            <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-secondary h-full w-1/3 rounded-full" />
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1 capitalize">{activeTab}</h1>
            <p className="text-gray-400">Manage your blockchain assets and verifications.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl glass text-gray-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-400">Verified Account</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="font-bold text-xs">TH</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
