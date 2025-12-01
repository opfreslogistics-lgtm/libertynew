# ⚡ Quick Database Setup (2 Minutes)

## 🚀 Steps:

### 1️⃣ Open Supabase SQL Editor
- Go to https://supabase.com/dashboard
- Click your project
- Click **SQL Editor** (left sidebar)
- Click **New query**

### 2️⃣ Run Setup Script
- Open file: `database_setup_complete.sql`
- **Copy everything** (Ctrl+A, Ctrl+C)
- **Paste** into SQL Editor (Ctrl+V)
- Click **RUN** (or Ctrl+Enter)
- Wait 30 seconds ⏳

### 3️⃣ Create Storage Buckets
- Go to **Storage** in Supabase
- Create 4 buckets:

| Bucket Name | Public? | Max Size |
|------------|---------|----------|
| `app-images` | ✅ Yes | 10 MB |
| `bill-logos` | ✅ Yes | 5 MB |
| `kyc-documents` | ❌ No | 10 MB |
| `mobile-deposits` | ❌ No | 10 MB |

## ✅ Done!

Your database is ready. Now:
1. Deploy app to Vercel (see `START_HERE.md`)
2. Add Supabase credentials as environment variables
3. Sign up first user (will be auto-admin)

---

## 🆘 Error: "Function check_first_user() does not exist"

**Solution:** You're running incomplete SQL. Use `database_setup_complete.sql` instead!

The complete file includes:
- ✅ Function definitions FIRST
- ✅ Then table creations
- ✅ Then triggers
- ✅ Then RLS policies

---

## 📚 Detailed Guides Available:

- **DATABASE_SETUP_GUIDE.md** - Complete setup instructions
- **database_setup_complete.sql** - The actual SQL script

---

**Time:** 2-5 minutes  
**Difficulty:** Easy 😊  
**Requirements:** Supabase account
