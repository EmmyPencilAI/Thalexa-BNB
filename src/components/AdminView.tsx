import React from 'react';
import { motion } from 'motion/react';
import { Users, ShieldCheck, ArrowRightLeft, AlertCircle, TrendingUp, Search, Filter, MoreVertical } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="glass p-6 rounded-3xl">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-secondary text-xs font-bold">
        <TrendingUp size={14} />
        +12%
      </div>
    </div>
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <h3 className="text-3xl font-display font-bold">{value}</h3>
  </div>
);

export default function AdminView() {
  const stats = [
    { label: 'Total Users', value: '12,450', icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Verified Products', value: '8,230', icon: ShieldCheck, color: 'bg-secondary/10 text-secondary' },
    { label: 'Escrow Volume', value: '$1.2M', icon: ArrowRightLeft, color: 'bg-primary/10 text-primary' },
    { label: 'Active Disputes', value: '14', icon: AlertCircle, color: 'bg-red-500/10 text-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Admin Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="xl:col-span-2 glass rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-display font-bold text-xl">User Management</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 input-field text-sm" />
              </div>
              <button className="p-2 glass rounded-xl text-gray-400 hover:text-white">
                <Filter size={18} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-border">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Wallet</th>
                  <th className="px-6 py-4 font-medium">Tier</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold">
                          U{i}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">User_{i}45</p>
                          <p className="text-xs text-gray-500">user{i}@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-gray-400">0x742d...f44e</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        i === 1 ? "bg-primary/10 text-primary" : "bg-surface text-gray-400"
                      )}>
                        {i === 1 ? 'Enterprise' : 'Professional'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span className="text-xs text-gray-300">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-white">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-border flex justify-between items-center text-sm text-gray-500">
            <p>Showing 5 of 12,450 users</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 glass rounded-lg hover:text-white disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 glass rounded-lg hover:text-white">Next</button>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="glass rounded-[2rem] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border">
            <h3 className="font-display font-bold text-xl">Audit Logs</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-gray-300">
                    <span className="font-bold text-white">Admin_01</span> verified product 
                    <span className="text-primary"> GG_THLX_000{i}</span>
                  </p>
                  <p className="text-gray-500 mt-0.5">2 mins ago • IP: 192.168.1.{i}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="p-4 text-sm text-primary font-bold border-t border-border hover:bg-primary/5 transition-colors">
            View Full Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
