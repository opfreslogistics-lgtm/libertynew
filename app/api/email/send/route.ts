/**
 * Email API Route
 * Handles sending emails using Nodemailer
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import {
  getTransferEmailTemplate,
  getBillPaymentEmailTemplate,
  getLoanApplicationEmailTemplate,
  getLoanApprovalEmailTemplate,
  getLoanPaymentEmailTemplate,
  getAdminActionEmailTemplate,
  getRoleChangeEmailTemplate,
  getAccountFundedEmailTemplate,
  getOTPEmailTemplate,
  getContactFormEmailTemplate,
  getContactConfirmationEmailTemplate,
  getSupportTicketEmailTemplate,
  getSupportTicketConfirmationEmailTemplate,
  getDepositApprovalEmailTemplate,
  getDepositRejectionEmailTemplate,
  getCryptoTransactionEmailTemplate,
} from '@/lib/utils/emailTemplates'
import { getAppSetting } from '@/lib/utils/appSettings'

// Create transporter using environment variables (same as OTP route)
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

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Liberty National Bank <noreply@libertybank.com>'

// Handle CORS preflight requests (same as OTP route)
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
    console.log('📧 Email API route called')
    
    const body = await request.json()
    const {
      notificationType,
      recipientEmail,
      recipientName,
      subject,
      metadata,
    } = body

    console.log('📧 Email API request data:', {
      notificationType,
      recipientEmail,
      recipientName,
      subject: subject?.substring(0, 50),
      hasMetadata: !!metadata,
    })

    if (!recipientEmail || !subject) {
      console.error('❌ Missing required fields:', { recipientEmail: !!recipientEmail, subject: !!subject })
      return NextResponse.json(
        { error: 'Missing required fields: recipientEmail, subject' },
        { status: 400 }
      )
    }

    // Fetch logo and contact email from app settings BEFORE generating templates
    const logoUrl = await getAppSetting('app_logo_light') || await getAppSetting('app_logo') || null
    const contactEmail = await getAppSetting('contact_email') || await getAppSetting('support_email') || null

    let emailHtml = ''
    let emailSubject = subject

    // Generate email content based on notification type
    switch (notificationType) {
      case 'transfer_internal':
      case 'transfer_external':
      case 'transfer_p2p':
      case 'transfer_wire': {
        const transferData = {
          recipientName: recipientName || 'Valued Customer',
          amount: metadata?.amount || '$0.00',
          fromAccount: metadata?.fromAccount || 'N/A',
          toAccount: metadata?.toAccount,
          referenceNumber: metadata?.referenceNumber || 'N/A',
          transferType: metadata?.transferType || 'internal',
          date: metadata?.date || new Date().toLocaleString(),
          memo: metadata?.memo,
        }
        const template = getTransferEmailTemplate(transferData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'bill_payment': {
        const billData = {
          recipientName: recipientName || 'Valued Customer',
          billName: metadata?.billName || 'Bill Payment',
          amount: metadata?.amount || '$0.00',
          accountNumber: metadata?.accountNumber || 'N/A',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getBillPaymentEmailTemplate(billData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'loan_application': {
        const loanAppData = {
          recipientName: recipientName || 'Valued Customer',
          loanType: metadata?.loanType || 'Personal Loan',
          requestedAmount: metadata?.requestedAmount || '$0.00',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getLoanApplicationEmailTemplate(loanAppData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'loan_approved': {
        const loanApprovalData = {
          recipientName: recipientName || 'Valued Customer',
          loanType: metadata?.loanType || 'Personal Loan',
          approvedAmount: metadata?.approvedAmount || '$0.00',
          interestRate: metadata?.interestRate || '0.00',
          monthlyPayment: metadata?.monthlyPayment || '$0.00',
          termMonths: metadata?.termMonths || 12,
          referenceNumber: metadata?.referenceNumber || 'N/A',
        }
        const template = getLoanApprovalEmailTemplate(loanApprovalData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'loan_payment': {
        const loanPaymentData = {
          recipientName: recipientName || 'Valued Customer',
          loanType: metadata?.loanType || 'Personal Loan',
          paymentAmount: metadata?.paymentAmount || '$0.00',
          balanceRemaining: metadata?.balanceRemaining || '$0.00',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getLoanPaymentEmailTemplate(loanPaymentData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'admin_action': {
        const adminActionData = {
          adminName: recipientName || 'Admin',
          actionType: metadata?.actionType || 'Action',
          userEmail: metadata?.userEmail,
          userName: metadata?.userName,
          details: metadata?.details || 'No details provided',
          amount: metadata?.amount,
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getAdminActionEmailTemplate(adminActionData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'role_changed': {
        const roleChangeData = {
          recipientName: recipientName || 'Valued Customer',
          newRole: metadata?.newRole || 'user',
          previousRole: metadata?.previousRole,
          changedBy: metadata?.changedBy || 'Administrator',
          date: metadata?.date || new Date().toLocaleString(),
          message: metadata?.message,
        }
        const template = getRoleChangeEmailTemplate(roleChangeData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'account_funded': {
        const accountFundedData = {
          recipientName: recipientName || 'Valued Customer',
          amount: metadata?.amount || '$0.00',
          accountType: metadata?.accountType || 'Account',
          accountNumber: metadata?.accountNumber || 'N/A',
          fundingMethod: metadata?.fundingMethod || 'Direct Deposit',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          date: metadata?.date || new Date().toLocaleString(),
          adminName: metadata?.adminName,
        }
        const template = getAccountFundedEmailTemplate(accountFundedData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'otp_login': {
        const otpData = {
          recipientName: recipientName || 'Valued Customer',
          otpCode: metadata?.otpCode || '000000',
          expiresInMinutes: metadata?.expiresInMinutes || 10,
          logoUrl: logoUrl || undefined,
          contactEmail: contactEmail || undefined,
        }
        const template = getOTPEmailTemplate(otpData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'contact_form': {
        const contactData = {
          senderName: metadata?.senderName || 'Unknown',
          senderEmail: metadata?.senderEmail || 'No email provided',
          senderPhone: metadata?.senderPhone || 'Not provided',
          subject: metadata?.subject || 'No subject',
          message: metadata?.message || 'No message',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getContactFormEmailTemplate(contactData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'contact_confirmation': {
        const confirmationData = {
          name: metadata?.name || recipientName || 'Valued Customer',
          subject: metadata?.subject || 'Your Inquiry',
          message: metadata?.message || '',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getContactConfirmationEmailTemplate(confirmationData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'support_ticket': {
        // Get admin email from settings if not provided
        const adminEmail = recipientEmail === 'admin@libertybank.com' 
          ? (await getAppSetting('support_email') || await getAppSetting('contact_email') || recipientEmail)
          : recipientEmail
          
        // Update recipientEmail to use admin email
        if (recipientEmail === 'admin@libertybank.com') {
          const updatedRecipient = adminEmail
          // Re-assign for email sending later
          mailOptions.to = updatedRecipient
        }
        
        const ticketData = {
          ticketNumber: metadata?.ticketNumber || 'N/A',
          userName: metadata?.userName || 'Unknown',
          userEmail: metadata?.userEmail || 'No email',
          category: metadata?.category || 'General',
          priority: metadata?.priority || 'medium',
          subject: metadata?.subject || 'No subject',
          message: metadata?.message || 'No message',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getSupportTicketEmailTemplate(ticketData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'support_ticket_confirmation': {
        const ticketConfirmationData = {
          userName: metadata?.userName || recipientName || 'Valued Customer',
          ticketNumber: metadata?.ticketNumber || 'N/A',
          category: metadata?.category || 'General',
          subject: metadata?.subject || 'Your Issue',
          message: metadata?.message || '',
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getSupportTicketConfirmationEmailTemplate(ticketConfirmationData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'deposit_approved': {
        const depositApprovalData = {
          recipientName: recipientName || 'Valued Customer',
          amount: metadata?.amount || '$0.00',
          accountType: metadata?.accountType || 'Account',
          accountNumber: metadata?.accountNumber || 'N/A',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          depositId: metadata?.depositId || 'N/A',
          date: metadata?.date || new Date().toLocaleString(),
          adminName: metadata?.adminName,
          adminNotes: metadata?.adminNotes,
        }
        const template = getDepositApprovalEmailTemplate(depositApprovalData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'deposit_rejected': {
        const depositRejectionData = {
          recipientName: recipientName || 'Valued Customer',
          amount: metadata?.amount || '$0.00',
          accountType: metadata?.accountType || 'Account',
          accountNumber: metadata?.accountNumber || 'N/A',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          depositId: metadata?.depositId || 'N/A',
          date: metadata?.date || new Date().toLocaleString(),
          reason: metadata?.reason,
          adminNotes: metadata?.adminNotes,
        }
        const template = getDepositRejectionEmailTemplate(depositRejectionData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'card_transaction':
      case 'deposit_submitted': {
        // Generic transaction notification template
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333333; margin-bottom: 20px;">${subject}</h2>
              <p style="color: #666666; line-height: 1.6;">Dear ${recipientName || 'Valued Customer'},</p>
              <p style="color: #666666; line-height: 1.6;">${metadata?.message || 'This is an automated notification from Liberty National Bank.'}</p>
              ${metadata?.details ? `<p style="color: #666666; line-height: 1.6;">${metadata.details}</p>` : ''}
              ${metadata?.amount ? `<p style="color: #16a34a; font-size: 18px; font-weight: 600; margin: 20px 0;">Amount: ${metadata.amount}</p>` : ''}
              ${metadata?.referenceNumber ? `<p style="color: #666666; line-height: 1.6;">Reference: ${metadata.referenceNumber}</p>` : ''}
              <p style="color: #666666; line-height: 1.6; margin-top: 20px;">Thank you for banking with Liberty National Bank.</p>
            </div>
          </body>
          </html>
        `
        break
      }

      case 'crypto_transaction': {
        const cryptoData = {
          recipientName: recipientName || 'Valued Customer',
          transactionType: metadata?.transactionType || 'Crypto Transaction',
          amount: metadata?.amount || '$0.00',
          btcAmount: metadata?.btcAmount || '0.00000000 BTC',
          btcPrice: metadata?.btcPrice || '$0.00',
          referenceNumber: metadata?.referenceNumber || 'N/A',
          accountType: metadata?.accountType,
          accountNumber: metadata?.accountNumber,
          date: metadata?.date || new Date().toLocaleString(),
        }
        const template = getCryptoTransactionEmailTemplate(cryptoData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      default: {
        // Generic email template
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${subject}</h2>
            <p>Dear ${recipientName || 'Valued Customer'},</p>
            <p>${metadata?.message || 'This is an automated notification from Liberty National Bank.'}</p>
            ${metadata?.details ? `<p>${metadata.details}</p>` : ''}
            <p>Thank you for banking with us.</p>
          </body>
          </html>
        `
      }
    }

    // Create transporter
    const transporter = createTransporter()

    if (!transporter) {
      // In development, log the email details
      console.log('📧 Email (Development Mode - Email not configured):', {
        to: recipientEmail,
        subject: emailSubject,
        notificationType,
        recipientName: recipientName || 'Valued Customer',
      })
      return NextResponse.json({
        success: true,
        message: 'Email logged (EMAIL_USER and EMAIL_PASSWORD not configured)',
      })
    }

    // Get FROM email from env or settings
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || FROM_EMAIL
    const replyTo = process.env.EMAIL_REPLY_TO || contactEmail || 'support@libertybank.com'

    // Get final recipient email (may have been updated in switch statement for admin emails)
    let finalRecipientEmail = recipientEmail
    
    // For support tickets sent to admin, get the actual admin email
    if (notificationType === 'support_ticket' && recipientEmail === 'admin@libertybank.com') {
      finalRecipientEmail = await getAppSetting('support_email') || await getAppSetting('contact_email') || recipientEmail
    }
    
    // Send email using Nodemailer (same as OTP implementation)
    const mailOptions = {
      from: fromEmail,
      to: finalRecipientEmail,
      replyTo: replyTo,
      subject: emailSubject,
      html: emailHtml,
    }

    console.log('📧 Attempting to send email:', {
      to: finalRecipientEmail,
      subject: emailSubject,
      notificationType,
      from: fromEmail,
    })

    console.log('📧 Sending email via Nodemailer:', {
      from: fromEmail,
      to: finalRecipientEmail,
      subject: emailSubject,
      notificationType,
    })

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully via Nodemailer:', {
      to: finalRecipientEmail,
      subject: emailSubject,
      notificationType,
      messageId: info.messageId,
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully',
        messageId: info.messageId 
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
    console.error('❌ Error in email API route:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

