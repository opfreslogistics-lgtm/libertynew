-- ============================================
-- LIBERTY BANK - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CREATE HELPER FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user is first user (make them admin)
CREATE OR REPLACE FUNCTION check_first_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first user, make them a superadmin
  IF (SELECT COUNT(*) FROM user_profiles) = 0 THEN
    NEW.role := 'superadmin';
  ELSE
    -- Otherwise, default to 'user' role
    NEW.role := COALESCE(NEW.role, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE TABLES
-- ============================================

-- Table: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  two_fa_enabled BOOLEAN DEFAULT false,
  is_otp_required BOOLEAN DEFAULT false,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'business', 'fixed-deposit', 'investment')),
  account_number TEXT NOT NULL UNIQUE,
  balance NUMERIC(15, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  last4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cards
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_number TEXT NOT NULL UNIQUE,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  card_holder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'expired', 'cancelled')),
  credit_limit NUMERIC(15, 2) DEFAULT 0.00,
  available_credit NUMERIC(15, 2) DEFAULT 0.00,
  last4 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'payment', 'fee', 'interest', 'refund', 'adjustment')),
  amount NUMERIC(15, 2) NOT NULL,
  balance_after NUMERIC(15, 2),
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  from_account TEXT,
  to_account TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: wire_transfers
CREATE TABLE IF NOT EXISTS public.wire_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_bank TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  recipient_routing TEXT,
  swift_code TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_code TEXT,
  reference_number TEXT UNIQUE,
  fee NUMERIC(10, 2) DEFAULT 45.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table: bills
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bill_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  bill_logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  assigned_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Table: loans
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  requested_amount NUMERIC(15, 2) NOT NULL,
  approved_amount NUMERIC(15, 2),
  interest_rate NUMERIC(5, 2),
  term_months INTEGER,
  monthly_payment NUMERIC(15, 2),
  total_amount NUMERIC(15, 2),
  amount_paid NUMERIC(15, 2) DEFAULT 0.00,
  balance_remaining NUMERIC(15, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'active', 'paid', 'defaulted')),
  purpose TEXT,
  employment_status TEXT,
  annual_income NUMERIC(15, 2),
  credit_score INTEGER,
  collateral_description TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'transaction', 'security', 'account', 'loan', 'bill')),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: kyc_documents
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  id_type TEXT NOT NULL CHECK (id_type IN ('passport', 'drivers_license', 'national_id', 'ssn')),
  id_number TEXT NOT NULL,
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  proof_of_address_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES user_profiles(id),
  rejection_reason TEXT,
  id_expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table: saved_recipients
CREATE TABLE IF NOT EXISTS public.saved_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  recipient_bank TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: otp_sessions
CREATE TABLE IF NOT EXISTS public.otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: trusted_devices
CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT,
  device_fingerprint TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  is_trusted BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: crypto_portfolio
CREATE TABLE IF NOT EXISTS public.crypto_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount NUMERIC(30, 10) NOT NULL DEFAULT 0,
  average_buy_price NUMERIC(20, 8) DEFAULT 0,
  total_invested NUMERIC(20, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- Table: crypto_transactions
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES crypto_portfolio(id) ON DELETE SET NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  amount NUMERIC(30, 10) NOT NULL,
  price_per_coin NUMERIC(20, 8) NOT NULL,
  total_value NUMERIC(20, 2) NOT NULL,
  fee NUMERIC(20, 2) DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: mobile_deposits
CREATE TABLE IF NOT EXISTS public.mobile_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  check_front_url TEXT NOT NULL,
  check_back_url TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES user_profiles(id),
  rejection_reason TEXT,
  reference_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Table: app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'image_url', 'json')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

-- cards indexes
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_number ON cards(card_number);

-- transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_number ON transactions(reference_number);

-- wire_transfers indexes
CREATE INDEX IF NOT EXISTS idx_wire_transfers_user_id ON wire_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_transfers_status ON wire_transfers(status);
CREATE INDEX IF NOT EXISTS idx_wire_transfers_reference_number ON wire_transfers(reference_number);

-- bills indexes
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- loans indexes
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- kyc_documents indexes
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);

-- support_tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- crypto_portfolio indexes
CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_user_id ON crypto_portfolio(user_id);

-- crypto_transactions indexes
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_created_at ON crypto_transactions(created_at DESC);

-- mobile_deposits indexes
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_user_id ON mobile_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_status ON mobile_deposits(status);

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Trigger: Update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Check first user and set as superadmin
DROP TRIGGER IF EXISTS check_first_user_trigger ON user_profiles;
CREATE TRIGGER check_first_user_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_first_user();

-- Trigger: Update updated_at on accounts
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on cards
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on wire_transfers
DROP TRIGGER IF EXISTS update_wire_transfers_updated_at ON wire_transfers;
CREATE TRIGGER update_wire_transfers_updated_at
  BEFORE UPDATE ON wire_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on bills
DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on loans
DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on kyc_documents
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON kyc_documents;
CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on support_tickets
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on crypto_portfolio
DROP TRIGGER IF EXISTS update_crypto_portfolio_updated_at ON crypto_portfolio;
CREATE TRIGGER update_crypto_portfolio_updated_at
  BEFORE UPDATE ON crypto_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on crypto_transactions
DROP TRIGGER IF EXISTS update_crypto_transactions_updated_at ON crypto_transactions;
CREATE TRIGGER update_crypto_transactions_updated_at
  BEFORE UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on mobile_deposits
DROP TRIGGER IF EXISTS update_mobile_deposits_updated_at ON mobile_deposits;
CREATE TRIGGER update_mobile_deposits_updated_at
  BEFORE UPDATE ON mobile_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on app_settings
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wire_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Accounts Policies
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
CREATE POLICY "Admins can view all accounts" ON accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage all accounts" ON accounts;
CREATE POLICY "Admins can manage all accounts" ON accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Cards Policies
DROP POLICY IF EXISTS "Users can view own cards" ON cards;
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all cards" ON cards;
CREATE POLICY "Admins can view all cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage all cards" ON cards;
CREATE POLICY "Admins can manage all cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
CREATE POLICY "Admins can manage all transactions" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Wire Transfers Policies
DROP POLICY IF EXISTS "Users can view own wire transfers" ON wire_transfers;
CREATE POLICY "Users can view own wire transfers" ON wire_transfers
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own wire transfers" ON wire_transfers;
CREATE POLICY "Users can create own wire transfers" ON wire_transfers
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all wire transfers" ON wire_transfers;
CREATE POLICY "Admins can view all wire transfers" ON wire_transfers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admins can manage all wire transfers" ON wire_transfers;
CREATE POLICY "Admins can manage all wire transfers" ON wire_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Bills Policies
DROP POLICY IF EXISTS "Users can view own bills" ON bills;
CREATE POLICY "Users can view own bills" ON bills
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bills" ON bills;
CREATE POLICY "Users can update own bills" ON bills
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all bills" ON bills;
CREATE POLICY "Admins can manage all bills" ON bills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Loans Policies
DROP POLICY IF EXISTS "Users can view own loans" ON loans;
CREATE POLICY "Users can view own loans" ON loans
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own loans" ON loans;
CREATE POLICY "Users can create own loans" ON loans
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all loans" ON loans;
CREATE POLICY "Admins can manage all loans" ON loans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- KYC Documents Policies
DROP POLICY IF EXISTS "Users can view own kyc" ON kyc_documents;
CREATE POLICY "Users can view own kyc" ON kyc_documents
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own kyc" ON kyc_documents;
CREATE POLICY "Users can create own kyc" ON kyc_documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all kyc" ON kyc_documents;
CREATE POLICY "Admins can manage all kyc" ON kyc_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Support Tickets Policies
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
CREATE POLICY "Users can create own tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
CREATE POLICY "Admins can manage all tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Saved Recipients Policies
DROP POLICY IF EXISTS "Users can manage own recipients" ON saved_recipients;
CREATE POLICY "Users can manage own recipients" ON saved_recipients
  FOR ALL USING (user_id = auth.uid());

-- OTP Sessions Policies
DROP POLICY IF EXISTS "Users can manage own otp sessions" ON otp_sessions;
CREATE POLICY "Users can manage own otp sessions" ON otp_sessions
  FOR ALL USING (user_id = auth.uid());

-- Trusted Devices Policies
DROP POLICY IF EXISTS "Users can manage own devices" ON trusted_devices;
CREATE POLICY "Users can manage own devices" ON trusted_devices
  FOR ALL USING (user_id = auth.uid());

-- Crypto Portfolio Policies
DROP POLICY IF EXISTS "Users can manage own crypto portfolio" ON crypto_portfolio;
CREATE POLICY "Users can manage own crypto portfolio" ON crypto_portfolio
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all crypto portfolios" ON crypto_portfolio;
CREATE POLICY "Admins can view all crypto portfolios" ON crypto_portfolio
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Crypto Transactions Policies
DROP POLICY IF EXISTS "Users can view own crypto transactions" ON crypto_transactions;
CREATE POLICY "Users can view own crypto transactions" ON crypto_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own crypto transactions" ON crypto_transactions;
CREATE POLICY "Users can create own crypto transactions" ON crypto_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all crypto transactions" ON crypto_transactions;
CREATE POLICY "Admins can view all crypto transactions" ON crypto_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Mobile Deposits Policies
DROP POLICY IF EXISTS "Users can view own mobile deposits" ON mobile_deposits;
CREATE POLICY "Users can view own mobile deposits" ON mobile_deposits
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own mobile deposits" ON mobile_deposits;
CREATE POLICY "Users can create own mobile deposits" ON mobile_deposits
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all mobile deposits" ON mobile_deposits;
CREATE POLICY "Admins can manage all mobile deposits" ON mobile_deposits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- App Settings Policies
DROP POLICY IF EXISTS "Everyone can view app settings" ON app_settings;
CREATE POLICY "Everyone can view app settings" ON app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;
CREATE POLICY "Admins can manage app settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- ============================================
-- 8. CREATE STORAGE BUCKETS
-- ============================================

-- Create storage buckets (run these in Supabase Dashboard → Storage)
-- You may need to create these manually in the Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create these buckets:
--    - app-images (public)
--    - kyc-documents (private)
--    - bill-logos (public)
--    - mobile-deposits (private)

-- ============================================
-- 9. INSERT DEFAULT APP SETTINGS
-- ============================================

INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
  ('app_name', 'Liberty National Bank', 'text', 'Application name'),
  ('contact_phone', '+1 (555) 123-4567', 'text', 'Contact phone number'),
  ('contact_email', 'support@libertybank.com', 'text', 'Contact email address'),
  ('contact_address', '123 Bank Street, Financial District, NY 10004', 'text', 'Physical address'),
  ('support_email', 'support@libertybank.com', 'text', 'Support email'),
  ('support_phone', '+1 (555) 123-4567', 'text', 'Support phone'),
  ('support_hours', '24/7', 'text', 'Support hours'),
  ('timezone', 'America/New_York', 'text', 'Application timezone'),
  ('currency', 'USD', 'text', 'Default currency'),
  ('date_format', 'MM/DD/YYYY', 'text', 'Date format')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Database setup completed successfully!' AS status;
