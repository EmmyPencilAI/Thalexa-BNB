-- Thalexa Database Schema (Supabase / Postgres)

-- 1. Users Table (Extensions for Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  thalexa_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  country TEXT,
  wallet_address TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'support', 'compliance', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thalexa_id TEXT UNIQUE,
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
  thalexa_id TEXT UNIQUE,
  product_code TEXT UNIQUE NOT NULL, -- GG_THLX_XXXXX
  ipfs_cid TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Escrows Table (Sync with On-chain state)
CREATE TABLE escrows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thalexa_id TEXT UNIQUE,
  blockchain_id INTEGER, -- ID from smart contract
  sender_id UUID REFERENCES users(id),
  receiver_address TEXT,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'BNB',
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

-- ID Generation Logic
CREATE SEQUENCE IF NOT EXISTS product_seq START 1;
CREATE SEQUENCE IF NOT EXISTS escrow_seq START 1;

-- Function to generate User Thalexa ID
CREATE OR REPLACE FUNCTION generate_user_thalexa_id() RETURNS TRIGGER AS $$
DECLARE
  wallet_suffix TEXT;
  random_part TEXT;
BEGIN
  IF NEW.wallet_address IS NOT NULL THEN
    wallet_suffix := UPPER(SUBSTRING(NEW.wallet_address FROM (LENGTH(NEW.wallet_address)-5)));
  ELSE
    wallet_suffix := '000000';
  END IF;
  random_part := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4));
  NEW.thalexa_id := 'THLX-USER-' || wallet_suffix || random_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_id_gen
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_user_thalexa_id();

-- Function to generate Product Thalexa ID
CREATE OR REPLACE FUNCTION generate_product_thalexa_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.thalexa_id := 'THLX-PROD-' || LPAD(nextval('product_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_id_gen
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION generate_product_thalexa_id();

-- Function to generate Escrow Thalexa ID
CREATE OR REPLACE FUNCTION generate_escrow_thalexa_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.thalexa_id := 'THLX-ESC-' || LPAD(nextval('escrow_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_escrow_id_gen
  BEFORE INSERT ON escrows
  FOR EACH ROW EXECUTE FUNCTION generate_escrow_thalexa_id();

-- Function to generate Transaction Thalexa ID
CREATE OR REPLACE FUNCTION generate_transaction_thalexa_id() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tx_hash IS NOT NULL AND NEW.tx_hash != '' THEN
    NEW.thalexa_id := 'THLX-TXN-' || UPPER(SUBSTRING(NEW.tx_hash FROM (LENGTH(NEW.tx_hash)-5)));
  ELSE
    NEW.thalexa_id := 'THLX-TXN-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_id_gen
  BEFORE INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION generate_transaction_thalexa_id();

-- Trigger to verify user on first transaction
CREATE OR REPLACE FUNCTION verify_user_on_txn() RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET is_verified = TRUE WHERE id = NEW.user_id AND is_verified = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_txn_verify
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION verify_user_on_txn();

-- Trigger to create subscription on user creation
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan)
  VALUES (new.id, new.plan);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_subscription();

-- Trigger to update usage volume on transaction
CREATE OR REPLACE FUNCTION update_usage_volume()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscriptions
  SET monthly_usage_volume = monthly_usage_volume + new.amount,
      updated_at = NOW()
  WHERE user_id = new.user_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_inserted
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_usage_volume();

-- Trigger to update product count
CREATE OR REPLACE FUNCTION update_product_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscriptions
  SET product_usage_count = product_usage_count + 1,
      updated_at = NOW()
  WHERE user_id = new.owner_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_inserted
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_usage();

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
CREATE POLICY "Users can view their own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
