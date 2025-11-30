-- Add RPC functions for email notifications
-- These functions are needed by lib/utils/emailService.ts

-- Function to get admin emails
CREATE OR REPLACE FUNCTION get_admin_emails()
RETURNS TABLE (email text, name text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(auth.users.email, '') as email,
    COALESCE(user_profiles.first_name || ' ' || user_profiles.last_name, 'Admin') as name
  FROM user_profiles
  INNER JOIN auth.users ON auth.users.id = user_profiles.id
  WHERE user_profiles.role IN ('admin', 'superadmin')
    AND user_profiles.account_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user email info
CREATE OR REPLACE FUNCTION get_user_email_info(user_uuid uuid)
RETURNS TABLE (email text, name text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(auth.users.email, '') as email,
    COALESCE(user_profiles.first_name || ' ' || user_profiles.last_name, 'User') as name
  FROM user_profiles
  INNER JOIN auth.users ON auth.users.id = user_profiles.id
  WHERE user_profiles.id = user_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create email_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  admin_id text,
  notification_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  email_error text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(notification_type);

-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for email_notifications
DROP POLICY IF EXISTS "Admins can view all email notifications" ON email_notifications;
CREATE POLICY "Admins can view all email notifications" ON email_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "System can insert email notifications" ON email_notifications;
CREATE POLICY "System can insert email notifications" ON email_notifications
  FOR INSERT WITH CHECK (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_emails() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_email_info(uuid) TO authenticated, anon;

COMMENT ON FUNCTION get_admin_emails() IS 'Returns email addresses and names of all active admins';
COMMENT ON FUNCTION get_user_email_info(uuid) IS 'Returns email address and name for a specific user';
