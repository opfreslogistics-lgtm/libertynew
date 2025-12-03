-- ============================================
-- REQUIRED FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if first user should be superadmin
CREATE OR REPLACE FUNCTION check_first_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM user_profiles) = 1 THEN
    NEW.role = 'superadmin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ACCOUNTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_type text NOT NULL,
  account_number text NOT NULL,
  balance numeric(15, 2) NULL DEFAULT 0.00,
  status text NULL DEFAULT 'active'::text,
  last4 text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_account_number_key UNIQUE (account_number),
  CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles (id) ON DELETE CASCADE,
  CONSTRAINT accounts_account_type_check CHECK (
    (
      account_type = ANY (
        ARRAY[
          'checking'::text,
          'savings'::text,
          'business'::text,
          'fixed-deposit'::text,
          'investment'::text
        ]
      )
    )
  ),
  CONSTRAINT accounts_status_check CHECK (
    (
      status = ANY (
        ARRAY['active'::text, 'frozen'::text, 'closed'::text]
      )
    )
  )
) TABLESPACE pg_default;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON public.accounts USING btree (account_number) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_accounts_account_type ON public.accounts USING btree (account_type) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts USING btree (status) TABLESPACE pg_default;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at column
DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
CREATE POLICY "Users can view their own accounts"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own accounts (if needed)
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
CREATE POLICY "Users can insert their own accounts"
  ON public.accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own accounts
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
CREATE POLICY "Users can update their own accounts"
  ON public.accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own accounts
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
CREATE POLICY "Users can delete their own accounts"
  ON public.accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMPLETE!
-- ============================================

