# 🏦 Liberty Bank - Exact Database Setup

## Your Database Tables (19 tables)

✅ user_profiles  
✅ accounts  
✅ cards  
✅ transactions  
✅ card_transactions  
✅ bills  
✅ bill_payments  
✅ crypto_portfolio  
✅ crypto_transactions  
✅ kyc_verifications  
✅ loans  
✅ loan_payments  
✅ mobile_deposits  
✅ notifications  
✅ saved_recipients  
✅ support_tickets  
✅ support_ticket_responses  
✅ user_devices  
✅ app_settings  

---

## 🚀 Quick Setup (ONE FILE - 2 Minutes)

### Use This File: `liberty_bank_COMPLETE_ALL_IN_ONE.sql`

**📊 File Size:** 52 KB (1,161 lines)

### Steps:

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Click your project
   - Click **SQL Editor**
   - Click **New query**

2. **Copy & Paste**
   - Open: `liberty_bank_COMPLETE_ALL_IN_ONE.sql`
   - Select ALL (Ctrl+A)
   - Copy (Ctrl+C)
   - Paste into SQL Editor (Ctrl+V)

3. **Run**
   - Click **RUN** button
   - Wait ~30 seconds

4. **Success!**
   ```
   Database fully configured!
   ```

---

## 📋 Alternative: Step-by-Step Setup (3 Parts)

If the all-in-one file is too large, run these 3 files in order:

### Part 1: Tables & Indexes
**File:** `liberty_bank_exact_schema.sql`
- Creates 19 tables
- Creates functions
- Creates 40+ indexes

### Part 2: Triggers
**File:** `liberty_bank_triggers.sql`
- Creates 14 triggers
- Enables first-user-admin
- Auto-updates timestamps

### Part 3: Security
**File:** `liberty_bank_rls_policies.sql`
- Enables RLS on all tables
- Creates 60+ security policies
- Inserts default settings

---

## ✅ What Gets Created

### Functions (2):
- `update_updated_at_column()` - Auto-updates timestamps
- `check_first_user()` - Makes first user superadmin ⭐

### Tables (19):
All your exact tables with proper structure

### Indexes (40+):
For fast queries on:
- User lookups
- Transaction searches
- Account queries
- All foreign keys

### Triggers (14):
- First user → superadmin
- Auto-update timestamps on 13 tables

### Security (60+ policies):
- Users see only their data
- Admins see all data
- Proper access control

### Default Settings:
- App name
- Contact info
- Support details
- Currency & timezone

---

## 🔍 Verify Setup

Run this query to check tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show all 19 tables.

---

## 📦 Next: Storage Buckets

After database setup, run:

**File:** `liberty_bank_storage_buckets_setup.sql`

This creates 7 storage buckets with security policies.

---

## 🆘 If Errors Occur

### Error: "function already exists"
✅ This is OK! Script handles it.

### Error: "table already exists"
✅ This is OK! Script uses IF NOT EXISTS.

### Error: "permission denied"
❌ Make sure you're logged in as project owner.

### Error: "relation storage.buckets does not exist"
❌ This error is for storage script, not this one.

---

## 🎯 Complete Setup Order

```
1. ✅ Run: liberty_bank_COMPLETE_ALL_IN_ONE.sql (Database)
2. ✅ Run: liberty_bank_storage_buckets_setup.sql (Storage)
3. ✅ Deploy to Vercel
4. ✅ Add Supabase env vars
5. ✅ Test signup (first user = superadmin)
```

---

## 📊 Table Differences from Previous Version

### Added Tables (not in old version):
- ✅ `card_transactions` - Separate card transaction tracking
- ✅ `bill_payments` - Bill payment history
- ✅ `loan_payments` - Loan payment tracking
- ✅ `support_ticket_responses` - Support ticket messages
- ✅ `user_devices` - Device tracking (renamed from trusted_devices)
- ✅ `kyc_verifications` - KYC documents (renamed from kyc_documents)

### Removed Tables (were in old version):
- ❌ `wire_transfers` - Merged into transactions
- ❌ `otp_sessions` - Not needed
- ❌ `trusted_devices` - Renamed to user_devices

---

## 💯 Success Checklist

After running the SQL:

- [ ] See success message
- [ ] All 19 tables exist (check Table Editor)
- [ ] Functions exist (check Database → Functions)
- [ ] Can sign up test user
- [ ] First user has role = 'superadmin'
- [ ] RLS enabled (check Policies tab)

---

## 🎉 You're Ready!

**File to use:** `liberty_bank_COMPLETE_ALL_IN_ONE.sql`

**Time:** 2 minutes

**Result:** Complete database matching your exact structure!

**Next:** Run storage setup, then deploy to Vercel! 🚀
