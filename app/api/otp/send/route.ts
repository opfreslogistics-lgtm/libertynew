/**
 * Send OTP API Route
 * Generates and sends a 6-digit OTP code via email using Nodemailer
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import nodemailer from 'nodemailer'
import { getOTPEmailTemplate } from '@/lib/utils/emailTemplates'

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

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Liberty Bank <noreply@libertybank.com>'
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || 'support@libertybank.com'

const OTP_EXPIRY_MINUTES = 5
const MAX_OTP_REQUESTS_PER_HOUR = 5

/**
 * Generate a random 6-digit numeric OTP code
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Check rate limiting for OTP requests
 */
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabaseAdmin = getSupabaseAdmin()
  const now = new Date()
  const hourWindow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0)

  // Get or create rate limit record for this hour
  const { data: rateLimit, error } = await supabaseAdmin
    .from('otp_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('hour_window', hourWindow.toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    // Error other than "not found"
    console.error('Rate limit check error:', error)
    return { allowed: true, remaining: MAX_OTP_REQUESTS_PER_HOUR } // Allow on error
  }

  if (!rateLimit) {
    // First request this hour
    await supabaseAdmin.from('otp_rate_limits').insert({
      user_id: userId,
      hour_window: hourWindow.toISOString(),
      request_count: 1,
    })
    return { allowed: true, remaining: MAX_OTP_REQUESTS_PER_HOUR - 1 }
  }

  if (rateLimit.request_count >= MAX_OTP_REQUESTS_PER_HOUR) {
    return { allowed: false, remaining: 0 }
  }

  // Increment count
  await supabaseAdmin
    .from('otp_rate_limits')
    .update({ request_count: rateLimit.request_count + 1 })
    .eq('id', rateLimit.id)

  return { allowed: true, remaining: MAX_OTP_REQUESTS_PER_HOUR - (rateLimit.request_count + 1) }
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
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, role')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check rate limiting
    const rateLimit = await checkRateLimit(userId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Too many OTP requests. Maximum ${MAX_OTP_REQUESTS_PER_HOUR} requests per hour. Please try again later.`,
          remaining: 0
        },
        { status: 429 }
      )
    }

    // Generate OTP code
    const otpCode = generateOTPCode()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES)

    // Invalidate any existing pending OTPs for this user
    await supabaseAdmin
      .from('otp_verifications')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'pending')

    // Store new OTP in database
    console.log('Storing OTP in database:', {
      user_id: userId,
      otp_code: otpCode,
      expires_at: expiresAt.toISOString(),
    })

    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .insert({
        user_id: userId,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (otpError) {
      console.error('Error storing OTP:', otpError)
      console.error('OTP Error details:', JSON.stringify(otpError, null, 2))
      return NextResponse.json(
        { error: 'Failed to generate OTP. Please try again.', details: otpError.message },
        { status: 500 }
      )
    }

    console.log('OTP stored successfully:', otpRecord)

    // Send OTP via email
    const recipientName = `${userProfile.first_name} ${userProfile.last_name}`.trim() || 'Valued Customer'
    
    console.log('Sending OTP email to:', userProfile.email)
    const emailResult = await sendOTPEmail(
      userProfile.email,
      recipientName,
      otpCode
    )

    if (!emailResult.success) {
      console.error('Error sending OTP email:', emailResult.error)
      // Still return success to prevent enumeration, but log the error
      // The OTP is stored, so user can request a new one if email fails
    } else {
      console.log('OTP email sent successfully')
    }

    return NextResponse.json({
      success: true,
      message: 'OTP code has been sent to your email',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      remainingRequests: rateLimit.remaining,
    })
  } catch (error: any) {
    console.error('Error in send OTP route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

