/**
 * Send OTP API Route
 * Generates and sends a 6-digit OTP code via email using Resend
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.FROM_EMAIL || 'Liberty Bank <noreply@libertybank.com>'
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'support@libertybank.com'

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
 * Send OTP email using Resend
 */
async function sendOTPEmail(
  recipientEmail: string,
  recipientName: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email would be sent in production.')
      console.log('OTP Email would be sent:', {
        to: recipientEmail,
        otpCode,
        from: FROM_EMAIL,
      })
      return { success: true } // Return success for development
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your One-Time Login Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #047857 0%, #10b981 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Liberty National Bank</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">Your One-Time Login Code</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Hello ${recipientName},
                    </p>
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Your login verification code is: <strong style="font-size: 24px; color: #047857; letter-spacing: 4px;">${otpCode}</strong>
                    </p>
                    <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      This code is valid for ${OTP_EXPIRY_MINUTES} minutes. Please enter it to complete your login.
                    </p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; border-left: 4px solid #ef4444;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        <strong>Security Notice:</strong> If you did not request this code, please ignore this message and contact our support team immediately.
                      </p>
                    </div>
                    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Thank you for banking with Liberty National Bank.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: 'Your One-Time Login Code',
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error sending OTP email:', error)
      return { success: false, error: error.message || 'Failed to send email' }
    }

    console.log('OTP email sent successfully:', {
      to: recipientEmail,
      messageId: data?.id,
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

