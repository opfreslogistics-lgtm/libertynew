# 📊 Complete Database Setup Guide for Supabase

## 🎯 Quick Setup (5 Minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. In the left sidebar, click **SQL Editor**
4. Click **New query** button

### Step 2: Run the Complete Setup Script

1. Open the file: `database_setup_complete.sql`
2. **Copy ALL the contents** (Ctrl+A, then Ctrl+C)
3. **Paste into Supabase SQL Editor** (Ctrl+V)
4. Click **RUN** button (or press Ctrl+Enter)
5. Wait for it to complete (~30 seconds)

You should see: `Database setup completed successfully!`

That's it! Your database is now fully set up. ✅

---

## ✅ What This Script Does

The script sets up everything you need:

### 1. **Functions** (2 functions)
- `update_updated_at_column()` - Auto-updates timestamps
- `check_first_user()` - Makes first user a superadmin

### 2. **Tables** (18 tables)
- ✅ user_profiles
- ✅ accounts
- ✅ cards
- ✅ transactions
- ✅ wire_transfers
- ✅ bills
- ✅ loans
- ✅ notifications
- ✅ kyc_documents
- ✅ support_tickets
- ✅ saved_recipients
- ✅ otp_sessions
- ✅ trusted_devices
- ✅ crypto_portfolio
- ✅ crypto_transactions
- ✅ mobile_deposits
- ✅ app_settings

### 3. **Indexes** (30+ indexes for performance)
All critical queries are optimized with proper indexes

### 4. **Triggers** (15 triggers)
Automatic timestamp updates and first-user admin assignment

### 5. **Row Level Security (RLS)**
All tables secured with proper policies:
- Users can only see/edit their own data
- Admins can see/edit all data
- Proper access control for all operations

### 6. **Default Settings**
Basic app configuration (name, contact info, etc.)

---

## 🔍 Verify Setup

After running the script, verify everything is set up correctly:

### Check Tables Exist

In Supabase SQL Editor, run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 18 tables listed.

### Check Functions Exist

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

You should see:
- `check_first_user`
- `update_updated_at_column`

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `rowsecurity = true`

---

## 📦 Storage Buckets Setup

The SQL script cannot create storage buckets automatically. You need to create them manually:

### Create These Buckets:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket** for each:

#### Bucket 1: app-images
- **Name:** `app-images`
- **Public:** ✅ Yes
- **File size limit:** 10 MB
- **Allowed MIME types:** image/*

#### Bucket 2: kyc-documents
- **Name:** `kyc-documents`
- **Public:** ❌ No (Private)
- **File size limit:** 10 MB
- **Allowed MIME types:** image/*

#### Bucket 3: bill-logos
- **Name:** `bill-logos`
- **Public:** ✅ Yes
- **File size limit:** 5 MB
- **Allowed MIME types:** image/*

#### Bucket 4: mobile-deposits
- **Name:** `mobile-deposits`
- **Public:** ❌ No (Private)
- **File size limit:** 10 MB
- **Allowed MIME types:** image/*

### Configure Storage Policies

For each bucket, you need to set up access policies:

#### For Public Buckets (app-images, bill-logos):

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-images');

-- Allow anyone to read
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-images');
```

Repeat for `bill-logos` bucket.

#### For Private Buckets (kyc-documents, mobile-deposits):

```sql
-- Users can upload their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all files
CREATE POLICY "Admins can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
  )
);
```

Repeat for `mobile-deposits` bucket.

---

## 🧪 Test Your Setup

### 1. Create a Test User

Sign up in your app (or use Supabase Auth → Users → Add User)

### 2. Verify First User is Admin

```sql
SELECT id, email, role FROM user_profiles;
```

The first user should have `role = 'superadmin'`

### 3. Test Account Creation

```sql
-- Insert test account (replace USER_ID with actual user ID)
INSERT INTO accounts (user_id, account_type, account_number, balance)
VALUES 
  ('USER_ID_HERE', 'checking', 'ACC1234567890', 1000.00);

-- Verify
SELECT * FROM accounts;
```

### 4. Test RLS (Row Level Security)

Try to query as a regular user - they should only see their own data:

```sql
-- This should work (viewing own account)
SELECT * FROM accounts WHERE user_id = auth.uid();

-- This should return nothing (viewing other accounts)
SELECT * FROM accounts WHERE user_id != auth.uid();
```

---

## 🐛 Troubleshooting

### Error: "Function check_first_user() does not exist"

**Cause:** The function wasn't created before the trigger.

**Fix:** Run the complete setup script again. The script creates functions BEFORE creating triggers.

### Error: "Relation already exists"

**Cause:** Table already exists from previous attempt.

**Fix:** Either:
1. Drop the table and run again: `DROP TABLE table_name CASCADE;`
2. Or skip that specific CREATE TABLE statement

### Error: "Permission denied"

**Cause:** RLS policy blocking access.

**Fix:** Check if the user has the correct role in `user_profiles` table.

### Storage Upload Fails

**Cause:** Storage buckets not created or policies not set.

**Fix:** 
1. Check buckets exist in Storage → All buckets
2. Verify policies are set up (Storage → Bucket → Policies)

---

## 📋 Post-Setup Checklist

After running the setup, verify:

- [ ] All 18 tables created
- [ ] All 2 functions exist
- [ ] All triggers working (updated_at auto-updates)
- [ ] RLS enabled on all tables
- [ ] RLS policies created
- [ ] First user is superadmin
- [ ] Storage buckets created
- [ ] Storage policies configured
- [ ] App settings inserted

---

## 🔐 Security Notes

### Important Security Features:

1. **Row Level Security (RLS)** - Enabled on all tables
2. **User Isolation** - Users can only access their own data
3. **Admin Access** - Admins can manage all data
4. **Secure Storage** - Private buckets for sensitive documents
5. **Password Hashing** - Handled by Supabase Auth
6. **JWT Tokens** - Secure authentication

### Recommended Next Steps:

1. **Enable 2FA** - For admin accounts
2. **Set up Email Verification** - In Supabase Auth settings
3. **Configure SMTP** - For email notifications
4. **Backup Database** - Regular automated backups
5. **Monitor Logs** - Check Supabase logs regularly

---

## 📞 Need Help?

If you encounter issues:

1. **Check Supabase Logs:** Dashboard → Database → Logs
2. **Verify Table Structure:** Use Table Editor to inspect tables
3. **Test Queries:** Use SQL Editor to test queries
4. **Check RLS Policies:** Dashboard → Authentication → Policies

---

## ✅ Success!

If you've completed all steps, your database is now:

- ✅ Fully configured
- ✅ Secured with RLS
- ✅ Optimized with indexes
- ✅ Ready for production

**Next:** Deploy your app to Vercel and add Supabase credentials!

See: `START_HERE.md` for Vercel deployment instructions.
