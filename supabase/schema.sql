-- Thalexa Database Schema (Supabase / Postgres)

-- 1. Users Table (Extensions for Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'support', 'compliance', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'BNB',
  type TEXT NOT NULL, -- 'send', 'receive', 'escrow', 'subscription'
  status TEXT DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table (IPFS Meta)
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_code TEXT UNIQUE NOT NULL, -- GG_THLX_XXXXX
  ipfs_cid TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Escrows Table (Sync with On-chain state)
CREATE TABLE escrows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blockchain_id INTEGER, -- ID from smart contract
  sender_id UUID REFERENCES users(id),
  receiver_address TEXT,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'funded',
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subscriptions Table
CREATE TABLE subscriptions (
  user_id UUID REFERENCES users(id) PRIMARY KEY,
  plan TEXT DEFAULT 'starter',
  monthly_usage_volume DECIMAL DEFAULT 0,
  product_usage_count INTEGER DEFAULT 0,
  renewal_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications Table (Admin Mail)
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT DEFAULT 'announcement', -- 'announcement', 'personal'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sender_id UUID REFERENCES users(id),
  target_user_id UUID, -- NULL for all users
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can verify a product" ON products FOR SELECT USING (true);
CREATE POLICY "Owners can manage their products" ON products FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Everyone can see announcements" ON notifications FOR SELECT USING (type = 'announcement' OR target_user_id = auth.uid());
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
