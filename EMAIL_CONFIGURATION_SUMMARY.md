# Email Configuration Summary - Liberty Bank

## Overview

Your bank application has **TWO email service packages** installed, but currently **only ONE is actively used**.

## Email Service

### **Nodemailer** ✅ (Only Email Service)
- **Package**: `nodemailer@^6.10.1`
- **Status**: ✅ **ACTIVELY USED**
- **Location**: Used in all email API routes

## Current Email Implementation

### Active Email Routes (Using Nodemailer)

1. **`/api/otp/send-email`** - OTP verification emails
   - File: `app/api/otp/send-email/route.ts`
   - Uses: Nodemailer

2. **`/api/email/send`** - General email notifications
   - File: `app/api/email/send/route.ts`
   - Uses: Nodemailer
   - Handles multiple notification types:
     - Transfer notifications (internal, external, P2P, wire)
     - Bill payment confirmations
     - Loan applications, approvals, payments
     - Admin actions
     - Role changes
     - Account funding
     - Contact form submissions
     - Support tickets
     - Card transactions
     - Mobile deposits

### Email Service Utilities

1. **`lib/utils/emailService.ts`**
   - Main email service wrapper
   - Calls `/api/email/send` route
   - Logs emails to database

2. **`lib/utils/emailNotifications.ts`**
   - Helper functions for specific notification types
   - Wraps `emailService.ts` functions

3. **`lib/utils/emailTemplates.ts`**
   - HTML email templates for all notification types

## Configuration Locations

### Environment Variables Required

All email services use the **same environment variables**:

```env
# Email Service Configuration
EMAIL_SERVICE=gmail                    # gmail, hotmail, smtp, etc.
EMAIL_USER=your-email@gmail.com        # Your email address
EMAIL_PASSWORD=your-app-password       # App password (for Gmail)
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
EMAIL_REPLY_TO=support@libertybank.com

# Optional: Custom SMTP
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Configuration Files

1. **`app/api/otp/send-email/route.ts`**
   - Lines 12-70: `createTransporter()` function
   - Configures Nodemailer for OTP emails

2. **`app/api/email/send/route.ts`**
   - Lines 26-82: `createTransporter()` function
   - Configures Nodemailer for general emails
   - **Same configuration as OTP route**

## Summary

### Total Email Configurations: **2 Locations, 1 Service**

1. ✅ **OTP Email Route** (`/api/otp/send-email`)
   - Uses: Nodemailer
   - Configuration: Same as general email route

2. ✅ **General Email Route** (`/api/email/send`)
   - Uses: Nodemailer
   - Configuration: Same as OTP route

## Email Service: Nodemailer Only

All email functionality uses **Nodemailer** exclusively. This provides a simple, unified email configuration.

## Current Setup

**Single Email Service: Nodemailer**
- ✅ Simple - one service to configure
- ✅ Works with Gmail, Outlook, custom SMTP
- ✅ Fully implemented across all routes
- ✅ Consistent configuration

## Current Setup: Single Configuration

**All emails use the same Nodemailer configuration:**
- Same environment variables
- Same SMTP settings
- Same email templates
- Same error handling

**You only need to configure email ONCE in `.env.local`:**

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Liberty Bank <noreply@libertybank.com>
EMAIL_REPLY_TO=support@libertybank.com
```

This single configuration works for:
- ✅ OTP emails
- ✅ Transfer notifications
- ✅ Bill payments
- ✅ Loan notifications
- ✅ Admin actions
- ✅ Contact forms
- ✅ Support tickets
- ✅ All other email types

## Configuration

Simply configure email once in `.env.local` and all email routes will use the same configuration.

