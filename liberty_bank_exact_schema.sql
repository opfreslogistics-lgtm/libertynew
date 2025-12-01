-- ============================================================================================================
-- LIBERTY BANK - EXACT DATABASE SCHEMA
-- ============================================================================================================
-- 
-- This matches your existing database structure with these 19 tables:
-- 1. user_profiles           11. loans
-- 2. accounts                12. loan_payments
-- 3. cards                   13. mobile_deposits
-- 4. transactions            14. notifications
-- 5. card_transactions       15. saved_recipients
-- 6. bills                   16. support_tickets
-- 7. bill_payments           17. support_ticket_responses
-- 8. crypto_portfolio        18. user_devices
-- 9. crypto_transactions     19. app_settings
-- 10. kyc_verifications
-- 
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================================================================

-- ============================================================================================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================================================
-- STEP 2: CREATE HELPER FUNCTIONS
-- ============================================================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Make first user a superadmin
CREATE OR REPLACE FUNCTION check_first_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_profiles) = 0 THEN
    NEW.role := 'superadmin';
  ELSE
    NEW.role := COALESCE(NEW.role, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================================================
-- STEP 3: CREATE TABLES (in dependency order)
-- ============================================================================================================

-- ============================================
-- TABLE 1: user_profiles
-- ============================================
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
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'Stores user profile information and roles';

-- ============================================
-- TABLE 2: accounts
-- ============================================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'business', 'investment')),
  account_number TEXT NOT NULL UNIQUE,
  routing_number TEXT,
  balance NUMERIC(15, 2) DEFAULT 0.00,
  available_balance NUMERIC(15, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE accounts IS 'Stores user bank accounts';

-- ============================================
-- TABLE 3: cards
-- ============================================
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  card_number TEXT NOT NULL UNIQUE,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  card_holder_name TEXT NOT NULL,
  expiry_month TEXT NOT NULL,
  expiry_year TEXT NOT NULL,
  cvv TEXT NOT NULL,
  pin TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'expired', 'lost', 'stolen')),
  credit_limit NUMERIC(15, 2) DEFAULT 0.00,
  available_credit NUMERIC(15, 2) DEFAULT 0.00,
  billing_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE cards IS 'Stores debit and credit cards';

-- ============================================
-- TABLE 4: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'payment', 'fee', 'interest', 'refund', 'reversal')),
  amount NUMERIC(15, 2) NOT NULL,
  balance_before NUMERIC(15, 2),
  balance_after NUMERIC(15, 2),
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  from_account_number TEXT,
  to_account_number TEXT,
  recipient_name TEXT,
  recipient_bank TEXT,
  category TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE transactions IS 'Stores all account transactions';

-- ============================================
-- TABLE 5: card_transactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  merchant_name TEXT NOT NULL,
  merchant_category TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'refund', 'withdrawal', 'payment', 'fee')),
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'declined', 'refunded')),
  authorization_code TEXT,
  reference_number TEXT UNIQUE,
  location TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE card_transactions IS 'Stores credit/debit card transactions';

-- ============================================
-- TABLE 6: bills
-- ============================================
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bill_name TEXT NOT NULL,
  biller_name TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  bill_logo_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'scheduled')),
  recurring BOOLEAN DEFAULT false,
  recurrence_period TEXT CHECK (recurrence_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  assigned_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bills IS 'Stores bills assigned to users';

-- ============================================
-- TABLE 7: bill_payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('bank_account', 'card', 'wallet')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  confirmation_number TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE bill_payments IS 'Stores bill payment transactions';

-- ============================================
-- TABLE 8: crypto_portfolio
-- ============================================
CREATE TABLE IF NOT EXISTS public.crypto_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  amount NUMERIC(30, 10) NOT NULL DEFAULT 0,
  average_buy_price NUMERIC(20, 8) DEFAULT 0,
  total_invested NUMERIC(20, 2) DEFAULT 0,
  current_value NUMERIC(20, 2) DEFAULT 0,
  profit_loss NUMERIC(20, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

COMMENT ON TABLE crypto_portfolio IS 'Stores user cryptocurrency holdings';

-- ============================================
-- TABLE 9: crypto_transactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES crypto_portfolio(id) ON DELETE SET NULL,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'transfer', 'receive')),
  amount NUMERIC(30, 10) NOT NULL,
  price_per_coin NUMERIC(20, 8) NOT NULL,
  total_value NUMERIC(20, 2) NOT NULL,
  fee NUMERIC(20, 2) DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE crypto_transactions IS 'Stores cryptocurrency transactions';

-- ============================================
-- TABLE 10: kyc_verifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'employment')),
  document_type TEXT CHECK (document_type IN ('passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'pay_stub')),
  document_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE kyc_verifications IS 'Stores KYC verification documents and status';

-- ============================================
-- TABLE 11: loans
-- ============================================
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'auto', 'home', 'business', 'student', 'payday')),
  loan_number TEXT UNIQUE,
  requested_amount NUMERIC(15, 2) NOT NULL,
  approved_amount NUMERIC(15, 2),
  interest_rate NUMERIC(5, 2),
  term_months INTEGER,
  monthly_payment NUMERIC(15, 2),
  total_amount NUMERIC(15, 2),
  amount_paid NUMERIC(15, 2) DEFAULT 0.00,
  outstanding_balance NUMERIC(15, 2),
  next_payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'paid_off', 'defaulted', 'cancelled')),
  purpose TEXT,
  employment_status TEXT,
  annual_income NUMERIC(15, 2),
  credit_score INTEGER,
  collateral_type TEXT,
  collateral_value NUMERIC(15, 2),
  collateral_description TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE loans IS 'Stores loan applications and details';

-- ============================================
-- TABLE 12: loan_payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  payment_amount NUMERIC(15, 2) NOT NULL,
  principal_amount NUMERIC(15, 2),
  interest_amount NUMERIC(15, 2),
  fee_amount NUMERIC(15, 2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('bank_account', 'card', 'cash', 'check')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  late_fee NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE loan_payments IS 'Stores loan payment transactions';

-- ============================================
-- TABLE 13: mobile_deposits
-- ============================================
CREATE TABLE IF NOT EXISTS public.mobile_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  check_front_url TEXT NOT NULL,
  check_back_url TEXT NOT NULL,
  check_number TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  payee_name TEXT,
  bank_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  reference_number TEXT UNIQUE,
  deposit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE mobile_deposits IS 'Stores mobile check deposit submissions';

-- ============================================
-- TABLE 14: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'general' CHECK (notification_type IN ('general', 'transaction', 'security', 'account', 'loan', 'bill', 'card', 'kyc', 'promo')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Stores user notifications';

-- ============================================
-- TABLE 15: saved_recipients
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('internal', 'external', 'international')),
  account_number TEXT NOT NULL,
  routing_number TEXT,
  bank_name TEXT,
  bank_code TEXT,
  swift_code TEXT,
  iban TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  nickname TEXT,
  address TEXT,
  country TEXT,
  is_favorite BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE saved_recipients IS 'Stores saved transfer recipients';

-- ============================================
-- TABLE 16: support_tickets
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('account', 'card', 'transaction', 'loan', 'bill', 'technical', 'security', 'general', 'complaint', 'feedback')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'cancelled')),
  assigned_to UUID REFERENCES user_profiles(id),
  attachment_urls TEXT[],
  resolution_notes TEXT,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE support_tickets IS 'Stores customer support tickets';

-- ============================================
-- TABLE 17: support_ticket_responses
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  is_customer BOOLEAN DEFAULT true,
  attachment_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE support_ticket_responses IS 'Stores responses/messages for support tickets';

-- ============================================
-- TABLE 18: user_devices
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'laptop')),
  device_os TEXT,
  device_fingerprint TEXT NOT NULL,
  browser_name TEXT,
  browser_version TEXT,
  ip_address TEXT,
  location TEXT,
  is_trusted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_devices IS 'Stores user devices for security tracking';

-- ============================================
-- TABLE 19: app_settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'image_url')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE app_settings IS 'Stores application configuration settings';

-- ============================================================================================================
-- STEP 4: CREATE INDEXES
-- ============================================================================================================

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

-- Cards
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON cards(account_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Card transactions
CREATE INDEX IF NOT EXISTS idx_card_transactions_user_id ON card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_date ON card_transactions(transaction_date DESC);

-- Bills
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- Bill payments
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_date ON bill_payments(payment_date DESC);

-- Crypto portfolio
CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_user_id ON crypto_portfolio(user_id);

-- Crypto transactions
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_date ON crypto_transactions(transaction_date DESC);

-- KYC verifications
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(status);

-- Loans
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_number ON loans(loan_number);

-- Loan payments
CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(payment_date DESC);

-- Mobile deposits
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_user_id ON mobile_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_deposits_status ON mobile_deposits(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Saved recipients
CREATE INDEX IF NOT EXISTS idx_saved_recipients_user_id ON saved_recipients(user_id);

-- Support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);

-- Support ticket responses
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON support_ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_user_id ON support_ticket_responses(user_id);

-- User devices
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(device_fingerprint);

-- App settings
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- ============================================================================================================
-- SUCCESS MESSAGE
-- ============================================================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================================================';
  RAISE NOTICE 'DATABASE SCHEMA CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created: 19';
  RAISE NOTICE 'Functions created: 2';
  RAISE NOTICE 'Indexes created: 40+';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run triggers and RLS policies';
  RAISE NOTICE '============================================================================================================';
END $$;

SELECT 'Part 1 of 3 completed - Tables and indexes created!' AS status;
