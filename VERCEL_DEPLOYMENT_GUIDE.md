# Vercel Deployment Guide for Liberty Bank

This guide will help you deploy the Liberty Bank application to Vercel successfully.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A Supabase project set up with the required database schema
3. Your Supabase credentials (URL and Anon Key)
4. (Optional) Email service credentials for email notifications

## Step 1: Prepare Your Repository

Make sure all changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Fixed Vercel deployment issues"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository containing this code

## Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To find these values:
- Go to your Supabase project dashboard
- Navigate to Settings → API
- Copy the "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional Variables (for email functionality):

```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=production
```

**Note:** If you're using Gmail, you'll need to generate an "App Password" from your Google Account settings, not your regular password.

## Step 4: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll receive a production URL

## Troubleshooting

### Build Fails with "Module not found" errors

**Solution:** This has been fixed in the latest code. Make sure you've pulled the latest changes where `lib/supabase.ts` has been updated to use direct initialization instead of a Proxy pattern.

### Environment Variables Not Working

**Solution:** 
- Make sure environment variable names start with `NEXT_PUBLIC_` for client-side variables
- Redeploy after adding/changing environment variables
- Check for typos in variable names

### Database Connection Errors

**Solution:**
- Verify your Supabase URL and Anon Key are correct
- Ensure your Supabase project is active and not paused
- Check that Row Level Security (RLS) policies are properly configured

### Email Sending Fails

**Solution:**
- Verify EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD are set correctly
- If using Gmail, ensure you're using an App Password, not your regular password
- Enable "Less secure app access" if needed (though App Passwords are preferred)

## Post-Deployment Checklist

After successful deployment:

- [ ] Test user registration
- [ ] Test login functionality
- [ ] Verify database connections work
- [ ] Test email notifications (if configured)
- [ ] Check admin panel access
- [ ] Test dashboard features
- [ ] Verify all static pages load correctly

## Continuous Deployment

Once set up, Vercel will automatically redeploy your application when you push changes to your main branch.

To disable automatic deployments:
1. Go to Project Settings → Git
2. Disable "Auto Deploy"

## Domain Configuration

To use a custom domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Performance Tips

1. **Enable Vercel Analytics:** Track performance and user behavior
2. **Configure Caching:** Adjust caching headers for static assets
3. **Image Optimization:** Use Next.js Image component (already implemented)
4. **Database Optimization:** Add appropriate indexes in Supabase

## Security Recommendations

1. **Never commit `.env` files** - Use Vercel environment variables
2. **Rotate keys regularly** - Update Supabase keys periodically
3. **Enable Supabase RLS** - Ensure Row Level Security is properly configured
4. **Use HTTPS only** - Vercel provides this by default
5. **Set up proper CORS** - Configure in Supabase settings if needed

## Support

If you encounter issues:

1. Check Vercel deployment logs (Project → Deployments → View Function Logs)
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure database schema matches the application requirements

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** December 1, 2025

**Build Status:** ✅ Build Successful

**Required Next.js Version:** 14.0.0 or higher
