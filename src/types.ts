export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  username_changes: number;
  wallet_address: string;
  role: 'user' | 'admin' | 'support';
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  on_chain_id: string;
  ipfs_cid: string;
  is_verified: boolean;
  created_at: string;
}

export interface Escrow {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  status: 'pending' | 'locked' | 'released' | 'refunded';
  on_chain_id: string;
  created_at: string;
}
