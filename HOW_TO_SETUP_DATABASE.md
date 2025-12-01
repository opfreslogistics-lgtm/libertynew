# 🚀 How to Setup Your Database

## File Name: `liberty_bank_complete_database.sql`

This is your **COMPLETE, WORKING** database setup script.

---

## ⚡ Quick Setup (2 Minutes)

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query** button

### Step 2: Copy & Paste
1. Open the file: **`liberty_bank_complete_database.sql`**
2. Select ALL (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
4. Paste into Supabase SQL Editor (Ctrl+V or Cmd+V)

### Step 3: Run
1. Click the **RUN** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait ~30 seconds

### Step 4: Success!
You should see:
```
Database setup completed successfully!
```

---

## ✅ What Gets Created

This script creates **EVERYTHING**:

### Tables (18)
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

### Functions (2)
- ✅ `update_updated_at_column()` - Auto-updates timestamps
- ✅ `check_first_user()` - Makes first user superadmin

### Plus
- ✅ 30+ Indexes for performance
- ✅ 15 Triggers for automation
- ✅ Row Level Security on all tables
- ✅ 60+ Security policies
- ✅ Default app settings

---

## 📦 After Setup: Create Storage Buckets

The script cannot create storage buckets automatically. Create them manually:

### In Supabase Dashboard → Storage:

1. **app-images**
   - Public: ✅ Yes
   - Max file size: 10 MB

2. **bill-logos**
   - Public: ✅ Yes
   - Max file size: 5 MB

3. **kyc-documents**
   - Public: ❌ No
   - Max file size: 10 MB

4. **mobile-deposits**
   - Public: ❌ No
   - Max file size: 10 MB

---

## ✅ Verify Setup

Run this query to check tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 18 tables.

---

## 🎯 Next Steps

1. ✅ Database setup complete
2. 🚀 Deploy app to Vercel (see `START_HERE.md`)
3. 🔑 Add Supabase credentials to Vercel
4. 👤 Sign up first user (becomes admin automatically)

---

## 🆘 Troubleshooting

### Error: "function already exists"
✅ This is OK! Script handles it with `CREATE OR REPLACE`

### Error: "table already exists"
✅ This is OK! Script uses `IF NOT EXISTS`

### Error: "permission denied"
❌ Make sure you're logged in as project owner

---

## 📞 Need Help?

If setup fails:
1. Check Supabase logs: Dashboard → Database → Logs
2. Copy the ENTIRE error message
3. Make sure you copied the ENTIRE SQL file

---

**File to use:** `liberty_bank_complete_database.sql`

**Time needed:** 2 minutes

**Result:** Fully configured database ready for production! 🎉
