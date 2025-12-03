import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'
import { format } from 'date-fns'

// Create transporter (same as email route)
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail'
  const emailUser = process.env.EMAIL_USER || process.env.EMAIL_FROM
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
  const emailHost = process.env.EMAIL_HOST
  const emailPort = parseInt(process.env.EMAIL_PORT || '587')
  const emailSecure = process.env.EMAIL_SECURE === 'true'

  if (!emailUser || !emailPassword) {
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

const getChatTranscriptEmailTemplate = (data: {
  userName: string
  adminName: string | null
  chatId: string
  startTime: string
  endTime: string
  messages: Array<{
    sender_name: string
    message: string
    timestamp: string
  }>
  isUser: boolean
}) => {
  const { userName, adminName, chatId, startTime, endTime, messages, isUser } = data

  const messagesHtml = messages
    .map(
      (msg) => `
    <div style="margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <strong style="color: #047857;">${msg.sender_name}</strong>
        <span style="color: #6b7280; font-size: 12px;">${format(
          new Date(msg.timestamp),
          'MMM d, yyyy HH:mm'
        )}</span>
      </div>
      <p style="color: #374151; margin: 0; white-space: pre-wrap;">${msg.message}</p>
    </div>
  `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chat Transcript - ${chatId}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #047857 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Chat Transcript</h1>
          <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 14px;">Chat ID: ${chatId}</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #374151; margin: 0 0 20px 0;">Dear ${isUser ? userName : adminName || 'Support Team'},</p>
          
          <p style="color: #374151; margin: 0 0 20px 0;">
            Thank you for chatting with our support team. Below is a complete transcript of your conversation.
          </p>

          <!-- Chat Details -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #047857; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">Chat Details</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Started</p>
                <p style="color: #374151; margin: 0; font-weight: 600;">${format(new Date(startTime), 'MMM d, yyyy HH:mm')}</p>
              </div>
              <div>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Ended</p>
                <p style="color: #374151; margin: 0; font-weight: 600;">${format(new Date(endTime), 'MMM d, yyyy HH:mm')}</p>
              </div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Participants</p>
              <p style="color: #374151; margin: 0; font-weight: 600;">
                ${userName}${adminName ? ` & ${adminName}` : ' & Support Team'}
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #047857; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">Conversation</h2>
            ${messagesHtml}
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Thank you for chatting with support. We hope we were able to assist you today.
            </p>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
              If you have any further questions, please don't hesitate to reach out to us.
            </p>
          </div>

          <!-- Closing -->
          <p style="color: #374151; margin: 30px 0 0 0;">
            Best regards,<br>
            <strong style="color: #047857;">Liberty National Bank Support Team</strong>
          </p>
        </div>

        <!-- Footer Bar -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId } = body

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
    }

    // Fetch chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('chat_id', chatId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 })
    }

    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Fetch user and admin profiles
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('id', session.user_id)
      .single()

    const adminProfile = session.admin_id
      ? await supabase
          .from('user_profiles')
          .select('first_name, last_name, email')
          .eq('id', session.admin_id)
          .single()
      : null

    const userName = userProfile
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : 'User'
    const adminName = adminProfile?.data
      ? `${adminProfile.data.first_name} ${adminProfile.data.last_name}`
      : null

    // Format messages with sender names
    const formattedMessages = await Promise.all(
      (messages || []).map(async (msg) => {
        const { data: senderProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', msg.sender_id)
          .single()

        return {
          sender_name: senderProfile
            ? `${senderProfile.first_name} ${senderProfile.last_name}`
            : msg.sender_id === session.user_id
            ? userName
            : 'Support',
          message: msg.message,
          timestamp: msg.timestamp,
        }
      })
    )

    // Create transporter
    const transporter = createTransporter()

    if (!transporter) {
      console.log('📧 Chat transcript email (Development Mode - Email not configured):', {
        chatId,
        userName,
        messageCount: formattedMessages.length,
      })
      return NextResponse.json({
        success: true,
        message: 'Email logged (EMAIL_USER and EMAIL_PASSWORD not configured)',
      })
    }

    const fromEmail =
      process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Liberty National Bank <noreply@libertybank.com>'

    // Send email to user
    if (userProfile?.email) {
      const userEmailHtml = getChatTranscriptEmailTemplate({
        userName,
        adminName,
        chatId,
        startTime: session.started_at,
        endTime: session.ended_at || new Date().toISOString(),
        messages: formattedMessages,
        isUser: true,
      })

      await transporter.sendMail({
        from: fromEmail,
        to: userProfile.email,
        subject: `Chat Transcript - ${chatId}`,
        html: userEmailHtml,
      })
    }

    // Send email to admin
    if (adminProfile?.data?.email) {
      const adminEmailHtml = getChatTranscriptEmailTemplate({
        userName,
        adminName,
        chatId,
        startTime: session.started_at,
        endTime: session.ended_at || new Date().toISOString(),
        messages: formattedMessages,
        isUser: false,
      })

      await transporter.sendMail({
        from: fromEmail,
        to: adminProfile.data.email,
        subject: `Chat Transcript - ${chatId} - ${userName}`,
        html: adminEmailHtml,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Chat transcript emails sent successfully',
    })
  } catch (error: any) {
    console.error('Error sending chat transcript:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}






