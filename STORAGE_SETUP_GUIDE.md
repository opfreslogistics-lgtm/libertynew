# 📦 Storage Buckets Setup Guide

## File Name: `liberty_bank_storage_buckets_setup.sql`

This script creates **ALL storage buckets** and their security policies automatically!

---

## 🚀 Quick Setup (1 Minute)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**

### Step 2: Copy & Paste
1. Open file: **`liberty_bank_storage_buckets_setup.sql`**
2. Select ALL (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into SQL Editor (Ctrl+V)

### Step 3: Run
1. Click **RUN** button (or Ctrl+Enter)
2. Wait ~10 seconds

### Step 4: Verify
You should see:
```
Storage buckets setup completed successfully!
```

Then check: **Storage** → **All buckets** in Supabase Dashboard

---

## ✅ What Gets Created

### 7 Storage Buckets:

| Bucket Name | Public? | Size Limit | Purpose |
|-------------|---------|------------|---------|
| **profile-pictures** | ✅ Yes | 10 MB | User profile images |
| **app-images** | ✅ Yes | 10 MB | App logos, banners |
| **bill-logos** | ✅ Yes | 5 MB | Bill company logos |
| **kyc-documents** | ❌ No | 10 MB | KYC verification files |
| **loan-documents** | ❌ No | 10 MB | Loan application docs |
| **mobile-deposits** | ❌ No | 10 MB | Check deposit images |
| **documents** | ❌ No | 50 MB | General documents |

### 40+ Security Policies:

✅ **Public Buckets:**
- Anyone can view
- Only admins can upload/edit/delete (except profile-pictures)
- Users can upload their own profile pictures

✅ **Private Buckets:**
- Users can only see/manage their own files
- Admins can see/manage all files
- Proper folder-based isolation

---

## 🔒 Security Features

### File Organization:
Files are stored in user-specific folders:
```
kyc-documents/
  └── USER_ID/
      ├── passport_front.jpg
      └── passport_back.jpg
```

### Access Control:
- ✅ Users access only their folder
- ✅ Admins access all folders
- ✅ File size limits enforced
- ✅ MIME type restrictions

### Allowed File Types:

**Images:**
- JPEG, PNG, WebP, GIF

**Documents (documents bucket):**
- PDF
- Word (DOC, DOCX)
- Excel (XLS, XLSX)
- Text files
- CSV

---

## 🎯 Usage Examples

### Upload Profile Picture (User)
```typescript
const { data, error } = await supabase.storage
  .from('profile-pictures')
  .upload(`${userId}/avatar.jpg`, file);
```

### Upload KYC Document (User)
```typescript
const { data, error } = await supabase.storage
  .from('kyc-documents')
  .upload(`${userId}/passport_front.jpg`, file);
```

### Upload App Logo (Admin)
```typescript
const { data, error } = await supabase.storage
  .from('app-images')
  .upload('app-settings/logo.png', file);
```

---

## 🔍 Verify Setup

After running the script, check in Supabase:

### Method 1: Dashboard
Go to **Storage** → You should see all 7 buckets

### Method 2: SQL Query
```sql
SELECT 
  id,
  name,
  public,
  ROUND(file_size_limit / 1048576.0, 2) || ' MB' AS size_limit
FROM storage.buckets
ORDER BY name;
```

You should see:
```
app-images        | true  | 10.00 MB
bill-logos        | true  | 5.00 MB
documents         | false | 50.00 MB
kyc-documents     | false | 10.00 MB
loan-documents    | false | 10.00 MB
mobile-deposits   | false | 10.00 MB
profile-pictures  | true  | 10.00 MB
```

---

## 🆘 Troubleshooting

### Error: "relation storage.buckets does not exist"
**Cause:** Your Supabase project doesn't have Storage enabled.
**Fix:** Contact Supabase support or ensure Storage is enabled for your project.

### Error: "permission denied for table buckets"
**Cause:** Not running as admin.
**Fix:** Make sure you're logged in as project owner in Supabase Dashboard.

### Buckets show but no policies
**Cause:** Policies might not have been created.
**Fix:** Re-run the script. It will skip bucket creation (already exists) and create policies.

### Can't upload files
**Cause:** Policies not working or wrong folder structure.
**Fix:** 
1. Check you're authenticated
2. Use correct folder structure: `bucket_name/user_id/filename.ext`
3. Check MIME type is allowed

---

## 📋 Complete Setup Order

1. ✅ Run `liberty_bank_complete_database.sql` (database tables)
2. ✅ Run `liberty_bank_storage_buckets_setup.sql` (this file)
3. ✅ Deploy app to Vercel
4. ✅ Add Supabase credentials
5. ✅ Test file uploads

---

## 🎉 Success!

After running this script:

✅ 7 storage buckets created  
✅ 40+ security policies active  
✅ File size limits configured  
✅ MIME type restrictions set  
✅ User/Admin access control ready  

**Your storage is production-ready!** 🚀

---

## 📞 Need Help?

If something doesn't work:
1. Check Supabase logs: Dashboard → Database → Logs
2. Verify you're project owner
3. Make sure main database is set up first
4. Check browser console for upload errors

---

**File to use:** `liberty_bank_storage_buckets_setup.sql`

**Time needed:** 1 minute

**Prerequisites:** Main database must be set up first

**Result:** Complete storage system with security! 📦
