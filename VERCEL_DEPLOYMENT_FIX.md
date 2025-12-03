# Vercel Deployment Fix - Login/Signup "Failed to fetch" Error

## Issues Fixed

### 1. API Route Error Handling
- ✅ Improved error handling in `/api/otp/send-email` route
- ✅ Added CORS support for preflight requests
- ✅ Better error messages and logging

### 2. Client-Side Fetch Calls
- ✅ Created `lib/utils/apiClient.ts` utility for consistent API calls
- ✅ Improved error handling in login page
- ✅ Better network error detection and user-friendly messages

### 3. Vercel Configuration
- ✅ Increased API route timeout from 10s to 30s
- ✅ CORS headers properly configured in `vercel.json`

## Required Environment Variables in Vercel

Make sure these are set in your Vercel project settings (Settings → Environment Variables):

### Required (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional (Email/OTP)
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
EMAIL_REPLY_TO=support@libertybank.com
NODE_ENV=production
```

**For Gmail OTP Setup:**
1. Enable 2-Step Verification on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Copy the 16-digit password (remove spaces!)
5. Add to Vercel environment variables

See `OTP_EMAIL_SETUP.md` for detailed instructions.

## How to Deploy

1. **Push changes to your repository**
   ```bash
   git add .
   git commit -m "Fix login/signup API fetch errors"
   git push
   ```

2. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables listed above
   - Make sure to set them for **Production**, **Preview**, and **Development** environments

3. **Redeploy**
   - Vercel will automatically redeploy on push
   - Or manually trigger a redeploy from the Vercel dashboard

## Testing After Deployment

1. **Test Signup**
   - Go to `/signup`
   - Fill out the form
   - Should complete without "Failed to fetch" errors

2. **Test Login**
   - Go to `/login`
   - Enter credentials
   - Should work even if email sending fails (OTP is saved in database)

## Troubleshooting

### Still Getting "Failed to fetch"?
1. Check Vercel function logs (Dashboard → Functions → View Logs)
2. Verify environment variables are set correctly
3. Check browser console for detailed error messages
4. Verify Supabase URL and keys are correct

### OTP Email Not Sending?
- This is OK! The OTP is still saved in the database
- Users can verify manually if needed
- Check email environment variables if you want email functionality

### API Routes Timing Out?
- Increased timeout to 30s in `vercel.json`
- If still timing out, check function logs for slow operations

## Changes Made

1. **lib/utils/apiClient.ts** (NEW)
   - Utility for API calls with proper error handling
   - Base URL detection for production
   - Network error detection

2. **app/login/page.tsx**
   - Updated to use new API client utility
   - Better error handling that doesn't break login flow

3. **app/api/otp/send-email/route.ts**
   - Added CORS support
   - Better error handling
   - Improved request parsing

4. **vercel.json**
   - Increased API function timeout to 30s
   - CORS headers already configured

## Notes

- The login/signup will work even if email sending fails
- OTP codes are saved in the database regardless of email status
- All API calls now have proper error handling
- Network errors are detected and shown with user-friendly messages

