/**
 * Generate and Send OTP API Route
 * Generates a 6-digit OTP code and sends it to the user's email using Nodemailer
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getOTPEmailTemplate } from '@/lib/utils/emailTemplates'
import nodemailer from 'nodemailer'

// OTP expires in 10 minutes
const OTP_EXPIRY_MINUTES = 10

// Create transporter using environment variables (same as other email routes)
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail'
  const emailUser = process.env.EMAIL_USER || process.env.EMAIL_FROM
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
  const emailHost = process.env.EMAIL_HOST
  const emailPort = parseInt(process.env.EMAIL_PORT || '587')
  const emailSecure = process.env.EMAIL_SECURE === 'true'

  if (!emailUser || !emailPassword) {
    console.warn('EMAIL_USER and EMAIL_PASSWORD are required for Nodemailer')
    return null
  }

  if (emailHost) {
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    })
  } else if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
      },
    })
  } else {
    return nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    })
  }
}

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Liberty Bank <noreply@libertybank.com>'
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || 'support@libertybank.com'

/**
 * Generate a random 6-digit OTP code
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP email using Nodemailer
 */
async function sendOTPEmail(
  recipientEmail: string,
  recipientName: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.warn('EMAIL_USER and EMAIL_PASSWORD not configured. Email would be sent in production.')
      console.log('OTP Email would be sent:', {
        to: recipientEmail,
        otpCode,
        from: FROM_EMAIL,
      })
      return { success: true } // Return success for development
    }

    // Get email template
    const emailTemplate = getOTPEmailTemplate({
      recipientName,
      otpCode,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    })

    // Send email using Nodemailer
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: recipientEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    console.log('OTP email sent successfully:', {
      to: recipientEmail,
      messageId: info.messageId,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error sending OTP email:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, otp_enabled')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (profileError || !userProfile) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { error: 'If an account exists with this email, an OTP code has been sent.' },
        { status: 200 } // Return 200 to prevent email enumeration
      )
    }

    // Check if OTP is enabled for this user
    if (!userProfile.otp_enabled) {
      return NextResponse.json(
        { error: 'OTP is not enabled for this account. Please contact support.' },
        { status: 403 }
      )
    }

    // Generate OTP code
    const otpCode = generateOTPCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES)

    // Invalidate any existing unused OTP codes for this user
    await supabase
      .from('login_otp_codes')
      .update({ used: true })
      .eq('user_id', userProfile.id)
      .eq('used', false)

    // Store OTP code in database
    const { error: otpError } = await supabase
      .from('login_otp_codes')
      .insert({
        user_id: userProfile.id,
        email: userProfile.email,
        code: otpCode,
        expires_at: expiresAt.toISOString(),
        used: false,
        attempts: 0,
      })

    if (otpError) {
      console.error('Error storing OTP code:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate OTP code. Please try again.' },
        { status: 500 }
      )
    }

    // Send OTP via email using Nodemailer
    const recipientName = `${userProfile.first_name} ${userProfile.last_name}`.trim() || 'Valued Customer'
    
    const emailResult = await sendOTPEmail(
      userProfile.email,
      recipientName,
      otpCode
    )

    if (!emailResult.success) {
      console.error('Error sending OTP email:', emailResult.error)
      // Still return success to prevent enumeration, but log the error
      // The OTP code is still stored in the database, so user can request a new one
    }

    // Log email notification attempt in database
    try {
      await supabase.from('email_notifications').insert({
        user_id: userProfile.id,
        notification_type: 'otp_login',
        recipient_email: userProfile.email,
        recipient_name: recipientName,
        subject: `Your Login Verification Code - ${otpCode}`,
        email_sent: emailResult.success,
        email_sent_at: emailResult.success ? new Date().toISOString() : null,
        email_error: emailResult.error || null,
        metadata: {
          otpCode,
          expiresInMinutes: OTP_EXPIRY_MINUTES,
        },
      })
    } catch (logError) {
      console.error('Error logging email notification:', logError)
      // Don't fail if logging fails
    }

    // Return success (don't reveal if user exists)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email and OTP is enabled, a verification code has been sent.',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    })
  } catch (error: any) {
    console.error('Error in generate OTP route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

