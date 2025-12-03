# OTP Email Configuration Guide

This guide shows you how to configure OTP email functionality in your `.env.local` file.

## Quick Setup for Gmail (Recommended)

Add these variables to your `.env.local` file:

```env
# Email Service Configuration for OTP
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
EMAIL_REPLY_TO=support@libertybank.com
```

## Step-by-Step Gmail Setup

### 1. Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Liberty Bank OTP" as the name
5. Click **Generate**
6. Copy the 16-digit password (no spaces!)

### 3. Add to .env.local
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Liberty Bank <your-email@gmail.com>
EMAIL_REPLY_TO=support@libertybank.com
```

**Important:** Remove all spaces from the app password when adding to `.env.local`:
```env
EMAIL_PASSWORD=abcdefghijklmnop
```

## Alternative: Outlook/Hotmail Setup

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Liberty Bank <your-email@outlook.com>
EMAIL_REPLY_TO=support@libertybank.com
```

## Custom SMTP Server Setup

If you have your own SMTP server:

```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@your-domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Liberty Bank <noreply@your-domain.com>
EMAIL_REPLY_TO=support@your-domain.com
```

### SMTP Port Options:
- **Port 587** (TLS) - Recommended: `EMAIL_SECURE=false`
- **Port 465** (SSL) - Use: `EMAIL_SECURE=true`
- **Port 25** (Unencrypted) - Not recommended

## Complete .env.local Example

Here's a complete example with all variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OTP Email Configuration (Optional but Recommended)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password-no-spaces
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
EMAIL_REPLY_TO=support@libertybank.com

# Environment
NODE_ENV=development
```

## Testing Your Configuration

After adding the variables:

1. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Test OTP Email:**
   - Go to `/login`
   - Enter your credentials
   - Check your email for the OTP code
   - If you see the code, configuration is working! ✅

## Troubleshooting

### "Failed to send OTP email" Error

1. **Check App Password:**
   - Make sure there are NO spaces in the password
   - Verify it's a 16-digit app password, not your regular password

2. **Verify 2-Step Verification:**
   - Must be enabled on your Google account
   - Regular password won't work without app password

3. **Check Email Variables:**
   ```bash
   # Make sure variables are set (don't run this, just check manually)
   echo $EMAIL_USER
   echo $EMAIL_PASSWORD
   ```

4. **Check Server Logs:**
   - Look for error messages in your terminal
   - Check for "Authentication failed" or "Invalid credentials"

### Gmail "Less Secure App" Error

- Gmail no longer supports "Less Secure Apps"
- **Solution:** Use App Password (see Step 2 above)

### Email Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. Check server logs for errors
4. Try a different email service

## For Vercel Deployment

When deploying to Vercel, add the same variables in:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - `EMAIL_SERVICE`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`
   - `EMAIL_REPLY_TO`
3. Set for **Production**, **Preview**, and **Development** environments
4. Redeploy your application

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Use App Passwords, not your regular password
- Rotate app passwords regularly
- Don't share your `.env.local` file

## Without Email Configuration

If you don't configure email:
- ✅ Login/Signup will still work
- ✅ OTP codes are saved in the database
- ⚠️ Users won't receive email with OTP code
- ⚠️ Users need to check database or use alternative verification

The system is designed to work even without email, but email is recommended for better user experience.

