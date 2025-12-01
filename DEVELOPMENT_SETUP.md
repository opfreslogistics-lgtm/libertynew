# Development Setup Guide - Liberty Bank

This guide will help you set up the project for local development and customization.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ============================================
# SUPABASE CONFIGURATION (Required)
# ============================================
# Get these from your Supabase project dashboard:
# https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# EMAIL CONFIGURATION - Option 1: Nodemailer (Gmail)
# ============================================
# For Gmail, you need to create an App Password:
# 1. Go to https://myaccount.google.com/security
# 2. Enable 2-Step Verification
# 3. Create App Password for "Mail"
# 4. Remove ALL spaces from the password
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password-no-spaces
EMAIL_FROM=Liberty Bank <your-email@gmail.com>
EMAIL_REPLY_TO=support@libertybank.com

# ============================================
# EMAIL CONFIGURATION - Option 2: Resend (Alternative)
# ============================================
# If using Resend instead of Nodemailer, uncomment these:
# Get API key from: https://resend.com
# RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# FROM_EMAIL=Liberty Bank <noreply@libertybank.com>
# REPLY_TO_EMAIL=support@libertybank.com

# ============================================
# NODE ENVIRONMENT
# ============================================
# Set to "development" for local development
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
liberty/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   └── ...                # Other pages
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client configuration
│   └── supabaseAdmin.ts   # Admin Supabase client
├── middleware.ts          # Next.js middleware for route protection
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Development Configuration

### Current Development Settings

- **React Strict Mode**: Enabled for better development experience
- **TypeScript**: Build errors are ignored (for faster development)
- **Image Optimization**: Disabled in development for faster builds
- **Source Maps**: Disabled in development (can be enabled if needed)

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Run linter
npm run lint
```

## 🛠️ Customization Guide

### 1. Styling

The project uses **Tailwind CSS** for styling. Configuration is in `tailwind.config.ts`.

To customize:
- Colors, fonts, and theme: Edit `tailwind.config.ts`
- Global styles: Edit `app/globals.css`

### 2. Components

All reusable components are in the `components/` directory. You can:
- Modify existing components
- Create new components
- Import and use them in pages

### 3. Pages

Pages are in the `app/` directory using Next.js App Router:
- Each folder represents a route
- `page.tsx` is the page component
- `layout.tsx` is the layout wrapper

### 4. API Routes

API routes are in `app/api/`:
- Each folder is an endpoint
- `route.ts` contains the handler
- Supports GET, POST, PUT, DELETE, etc.

### 5. Database

The project uses **Supabase** as the backend:
- Database client: `lib/supabase.ts`
- Admin client: `lib/supabaseAdmin.ts`
- All database operations go through these clients

## 🔐 Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key (private, server-only) |
| `EMAIL_SERVICE` | No | Email service provider (gmail, hotmail, etc.) |
| `EMAIL_USER` | No* | Email address for sending emails |
| `EMAIL_PASSWORD` | No* | Email password or app password |
| `EMAIL_FROM` | No | Display name and email for sender |
| `EMAIL_REPLY_TO` | No | Reply-to email address |
| `RESEND_API_KEY` | No | Resend API key (alternative to Nodemailer) |
| `NODE_ENV` | No | Environment mode (development/production) |

*Required if using Nodemailer for email functionality

## 🐛 Troubleshooting

### Issue: "Supabase environment variables are not set"

**Solution**: Make sure `.env.local` exists and contains all required Supabase variables.

### Issue: Build fails with TypeScript errors

**Solution**: The project is configured to ignore TypeScript build errors for faster development. To fix errors:
1. Check the error messages
2. Fix the TypeScript issues
3. Optionally remove `ignoreBuildErrors: true` from `next.config.js`

### Issue: Email not sending

**Solution**: 
1. Verify email credentials in `.env.local`
2. For Gmail, ensure you're using an App Password (not your regular password)
3. Remove all spaces from Gmail App Password
4. Check that 2-Step Verification is enabled on your Google account

### Issue: Port 3000 already in use

**Solution**: 
```bash
# Use a different port
npm run dev -- -p 3001
```

## 📝 Development Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use TypeScript** - The project is fully typed
3. **Follow Next.js conventions** - Use App Router patterns
4. **Test locally** - Always test changes before deploying
5. **Check console** - Monitor browser console and terminal for errors

## 🚀 Next Steps

1. ✅ Set up environment variables
2. ✅ Start development server
3. ✅ Explore the codebase
4. ✅ Make your customizations
5. ✅ Test your changes
6. ✅ Deploy when ready

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Happy Coding! 🎉**

