-- ============================================================================================================
-- LIBERTY BANK - TRIGGERS (Part 2 of 3)
-- ============================================================================================================
-- 
-- Run this AFTER running liberty_bank_exact_schema.sql
-- This creates all triggers for automatic timestamp updates and first user admin
-- ============================================================================================================

-- ============================================================================================================
-- CREATE TRIGGERS
-- ============================================================================================================

-- Trigger: First user becomes superadmin
DROP TRIGGER IF EXISTS check_first_user_trigger ON user_profiles;
CREATE TRIGGER check_first_user_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_first_user();

-- Trigger: Update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger: Update updated_at on bills
DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on crypto_portfolio
DROP TRIGGER IF EXISTS update_crypto_portfolio_updated_at ON crypto_portfolio;
CREATE TRIGGER update_crypto_portfolio_updated_at
  BEFORE UPDATE ON crypto_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on kyc_verifications
DROP TRIGGER IF EXISTS update_kyc_verifications_updated_at ON kyc_verifications;
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on loans
DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on mobile_deposits
DROP TRIGGER IF EXISTS update_mobile_deposits_updated_at ON mobile_deposits;
CREATE TRIGGER update_mobile_deposits_updated_at
  BEFORE UPDATE ON mobile_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on saved_recipients
DROP TRIGGER IF EXISTS update_saved_recipients_updated_at ON saved_recipients;
CREATE TRIGGER update_saved_recipients_updated_at
  BEFORE UPDATE ON saved_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on support_tickets
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on user_devices
DROP TRIGGER IF EXISTS update_user_devices_updated_at ON user_devices;
CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on app_settings
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================================================
-- SUCCESS MESSAGE
-- ============================================================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================================================';
  RAISE NOTICE 'TRIGGERS CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers created: 14';
  RAISE NOTICE '  - First user auto-admin trigger';
  RAISE NOTICE '  - 13 timestamp update triggers';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run RLS policies';
  RAISE NOTICE '============================================================================================================';
END $$;

SELECT 'Part 2 of 3 completed - Triggers created!' AS status;
