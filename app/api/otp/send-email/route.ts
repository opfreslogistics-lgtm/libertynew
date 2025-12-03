/**
 * OTP Email API Route
 * Sends OTP code via email using Nodemailer
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getOTPEmailTemplate } from '@/lib/utils/emailTemplates'
import { getAppSetting } from '@/lib/utils/appSettings'

// Create transporter using environment variables
const createTransporter = () => {
  // Support multiple email service providers
  const emailService = process.env.EMAIL_SERVICE || 'gmail' // gmail, outlook, smtp, etc.
  const emailUser = process.env.EMAIL_USER || process.env.EMAIL_FROM
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
  const emailHost = process.env.EMAIL_HOST
  const emailPort = parseInt(process.env.EMAIL_PORT || '587')
  const emailSecure = process.env.EMAIL_SECURE === 'true'

  if (!emailUser || !emailPassword) {
    console.warn('EMAIL_USER and EMAIL_PASSWORD are required for Nodemailer')
    return null
  }

  // Configure transporter
  if (emailHost) {
    // Custom SMTP server
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    })
  } else if (emailService === 'gmail') {
    // Optimized Gmail configuration
    // Using explicit SMTP settings for better reliability
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS (port 587), not SSL (port 465)
      auth: {
        user: emailUser,
        pass: emailPassword, // App Password (no spaces!)
      },
      // Connection pool settings for better performance
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      // TLS options
      tls: {
        // Don't fail on invalid certificates (useful for development)
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
      },
    })
  } else {
    // Use service-based configuration for other services (Outlook, etc.)
    return nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    })
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { recipientEmail, recipientName, otpCode } = body

    // Validate required fields
    if (!recipientEmail || !otpCode) {
      return NextResponse.json(
        { error: 'Recipient email and OTP code are required' },
        { status: 400 }
      )
    }

    // Create transporter
    const transporter = createTransporter()

    if (!transporter) {
      // In development, log the email details
      console.log('📧 OTP Email (Development Mode - Email not configured):', {
        to: recipientEmail,
        otpCode,
        recipientName: recipientName || 'Valued Customer',
      })
      return NextResponse.json({
        success: true,
        message: 'OTP email logged (EMAIL_USER and EMAIL_PASSWORD not configured)',
      })
    }

    // Fetch logo and contact email from app settings
    const logoUrl = await getAppSetting('app_logo') || await getAppSetting('app_logo_light') || null
    const contactEmail = await getAppSetting('contact_email') || await getAppSetting('support_email') || null

    // Generate email template with logo and contact email
    const emailTemplate = getOTPEmailTemplate({
      recipientName: recipientName || 'Valued Customer',
      otpCode,
      expiresInMinutes: 10,
      logoUrl: logoUrl || undefined,
      contactEmail: contactEmail || undefined,
    })

    // Email configuration
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Liberty Bank <noreply@libertybank.com>'
    const replyTo = process.env.EMAIL_REPLY_TO || 'support@libertybank.com'

    // Send email
    const mailOptions = {
      from: fromEmail,
      to: recipientEmail,
      replyTo: replyTo,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ OTP email sent successfully:', {
      to: recipientEmail,
      messageId: info.messageId,
      otpCode,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'OTP email sent successfully',
        messageId: info.messageId,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error: any) {
    console.error('❌ Error sending OTP email:', error)
    
    // Return a proper error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send OTP email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

