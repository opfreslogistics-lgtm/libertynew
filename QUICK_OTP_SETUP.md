# Quick OTP Email Setup - .env.local

## Copy this to your `.env.local` file:

```env
# OTP Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
EMAIL_REPLY_TO=support@libertybank.com
```

## How to Get Gmail App Password:

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: **Mail** → **Other (Custom name)**
   - Name it: "Liberty Bank OTP"
   - Click **Generate**
   - **Copy the 16-digit password** (remove all spaces!)

3. **Add to .env.local:**
   ```env
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
   (No spaces, no dashes, just the 16 characters)

4. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```

## Test It:

1. Go to `/login`
2. Enter your credentials
3. Check your email for OTP code
4. ✅ If you receive the email, it's working!

## For Vercel:

Add the same variables in:
- Vercel Dashboard → Settings → Environment Variables
- Set for **Production**, **Preview**, and **Development**

---

**Need more help?** See `OTP_EMAIL_SETUP.md` for detailed instructions.

