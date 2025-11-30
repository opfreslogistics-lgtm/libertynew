# Vercel Deployment Guide

## Quick Deploy via Vercel Dashboard (5 minutes)

### Step 1: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account (or create account if needed)

### Step 2: Import Your Repository
1. Click "Add New" → "Project"
2. Find your repository: `opfreslogistics-lgtm/liberty`
3. Click "Import"

### Step 3: Configure Project
Vercel will auto-detect Next.js. Just add environment variables:

**Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Optional Email Variables (for notifications):**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your app will be live at: `https://liberty-xxx.vercel.app`

### Step 5: Add Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as shown

---

## Alternative: Deploy via CLI

If you prefer CLI, run these commands:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to link project
```

---

## Troubleshooting

### Build Fails
- Make sure all environment variables are set
- Check build logs in Vercel dashboard

### 404 Errors
- Ensure environment variables are correct
- Check Supabase URL is valid

### API Routes Not Working
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check API route logs in Vercel dashboard

---

## Your Repository
- **GitHub**: https://github.com/opfreslogistics-lgtm/liberty
- **Branch**: cursor/debug-liberty-vercel-deployment-error-claude-4.5-sonnet-thinking-315e

## Build Status
✅ Build tested and passing
✅ All deployment issues fixed
✅ Ready for production
