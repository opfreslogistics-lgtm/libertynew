/**
 * Server-Side Email Service
 * Directly calls Nodemailer (same approach as OTP emails)
 * Use this for server-side email sending instead of fetch
 */

import nodemailer from 'nodemailer'
import { getAppSetting } from '@/lib/utils/appSettings'
import {
  getTransferEmailTemplate,
  getBillPaymentEmailTemplate,
  getLoanApplicationEmailTemplate,
  getLoanApprovalEmailTemplate,
  getLoanPaymentEmailTemplate,
  getAdminActionEmailTemplate,
  getRoleChangeEmailTemplate,
  getAccountFundedEmailTemplate,
  getDepositApprovalEmailTemplate,
  getDepositRejectionEmailTemplate,
} from '@/lib/utils/emailTemplates'

// Create transporter using environment variables (same as OTP route)
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

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Liberty National Bank <noreply@libertybank.com>'

export interface ServerEmailData {
  notificationType: string
  recipientEmail: string
  recipientName?: string
  subject: string
  metadata?: Record<string, any>
}

/**
 * Send email directly using Nodemailer (server-side only)
 * Same approach as OTP emails
 */
export async function sendEmailDirect(data: ServerEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const transporter = createTransporter()

    if (!transporter) {
      console.log('📧 Email (Development Mode - Email not configured):', {
        to: data.recipientEmail,
        subject: data.subject,
        notificationType: data.notificationType,
        recipientName: data.recipientName || 'Valued Customer',
      })
      return { success: true, error: 'EMAIL_USER and EMAIL_PASSWORD not configured' }
    }

    // Fetch logo and contact email from app settings
    const logoUrl = await getAppSetting('app_logo_light') || await getAppSetting('app_logo') || null
    const contactEmail = await getAppSetting('contact_email') || await getAppSetting('support_email') || null

    let emailHtml = ''
    let emailSubject = data.subject

    // Generate email content based on notification type (same as /api/email/send route)
    switch (data.notificationType) {
      case 'transfer_internal':
      case 'transfer_external':
      case 'transfer_p2p':
      case 'transfer_wire': {
        const transferData = {
          recipientName: data.recipientName || 'Valued Customer',
          amount: data.metadata?.amount || '$0.00',
          fromAccount: data.metadata?.fromAccount || 'N/A',
          toAccount: data.metadata?.toAccount,
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          transferType: data.metadata?.transferType || 'internal',
          date: data.metadata?.date || new Date().toLocaleString(),
          memo: data.metadata?.memo,
        }
        const template = getTransferEmailTemplate(transferData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'bill_payment': {
        const billData = {
          recipientName: data.recipientName || 'Valued Customer',
          billName: data.metadata?.billName || 'Bill Payment',
          amount: data.metadata?.amount || '$0.00',
          accountNumber: data.metadata?.accountNumber || 'N/A',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          date: data.metadata?.date || new Date().toLocaleString(),
        }
        const template = getBillPaymentEmailTemplate(billData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'loan_application': {
        const loanAppData = {
          recipientName: data.recipientName || 'Valued Customer',
          loanType: data.metadata?.loanType || 'Personal Loan',
          requestedAmount: data.metadata?.requestedAmount || '$0.00',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          date: data.metadata?.date || new Date().toLocaleString(),
        }
        const template = getLoanApplicationEmailTemplate(loanAppData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'loan_approved': {
        const loanApprovalData = {
          recipientName: data.recipientName || 'Valued Customer',
          loanType: data.metadata?.loanType || 'Personal Loan',
          approvedAmount: data.metadata?.approvedAmount || '$0.00',
          interestRate: data.metadata?.interestRate || '0.00',
          monthlyPayment: data.metadata?.monthlyPayment || '$0.00',
          termMonths: data.metadata?.termMonths || 12,
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
        }
        const template = getLoanApprovalEmailTemplate(loanApprovalData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'loan_payment': {
        const loanPaymentData = {
          recipientName: data.recipientName || 'Valued Customer',
          loanType: data.metadata?.loanType || 'Personal Loan',
          paymentAmount: data.metadata?.paymentAmount || '$0.00',
          balanceRemaining: data.metadata?.balanceRemaining || '$0.00',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          date: data.metadata?.date || new Date().toLocaleString(),
        }
        const template = getLoanPaymentEmailTemplate(loanPaymentData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'account_funded': {
        const accountFundedData = {
          recipientName: data.recipientName || 'Valued Customer',
          amount: data.metadata?.amount || '$0.00',
          accountType: data.metadata?.accountType || 'Account',
          accountNumber: data.metadata?.accountNumber || 'N/A',
          fundingMethod: data.metadata?.fundingMethod || 'Direct Deposit',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          date: data.metadata?.date || new Date().toLocaleString(),
          adminName: data.metadata?.adminName,
        }
        const template = getAccountFundedEmailTemplate(accountFundedData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'deposit_approved': {
        const depositApprovalData = {
          recipientName: data.recipientName || 'Valued Customer',
          amount: data.metadata?.amount || '$0.00',
          accountType: data.metadata?.accountType || 'Account',
          accountNumber: data.metadata?.accountNumber || 'N/A',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          depositId: data.metadata?.depositId || 'N/A',
          date: data.metadata?.date || new Date().toLocaleString(),
          adminName: data.metadata?.adminName,
          adminNotes: data.metadata?.adminNotes,
        }
        const template = getDepositApprovalEmailTemplate(depositApprovalData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'deposit_rejected': {
        const depositRejectionData = {
          recipientName: data.recipientName || 'Valued Customer',
          amount: data.metadata?.amount || '$0.00',
          accountType: data.metadata?.accountType || 'Account',
          accountNumber: data.metadata?.accountNumber || 'N/A',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          depositId: data.metadata?.depositId || 'N/A',
          date: data.metadata?.date || new Date().toLocaleString(),
          reason: data.metadata?.reason,
          adminNotes: data.metadata?.adminNotes,
        }
        const template = getDepositRejectionEmailTemplate(depositRejectionData)
        emailHtml = template.html
        emailSubject = template.subject
        break
      }

      case 'crypto_transaction': {
        const cryptoData = {
          recipientName: data.recipientName || 'Valued Customer',
          transactionType: data.metadata?.transactionType || 'Crypto Transaction',
          transactionLabel: data.metadata?.transactionLabel || 'Processed',
          amount: data.metadata?.amount || '$0.00',
          btcAmount: data.metadata?.btcAmount || '0.00000000 BTC',
          btcPrice: data.metadata?.btcPrice || '$0.00',
          referenceNumber: data.metadata?.referenceNumber || 'N/A',
          accountType: data.metadata?.accountType,
          accountNumber: data.metadata?.accountNumber,
          date: data.metadata?.date || new Date().toLocaleString(),
        }
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${emailSubject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333333; margin-bottom: 20px;">${emailSubject}</h2>
              <p style="color: #666666; line-height: 1.6;">Dear ${cryptoData.recipientName},</p>
              <p style="color: #666666; line-height: 1.6;">Your ${cryptoData.transactionType} has been approved and processed successfully.</p>
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #666666; margin: 10px 0;"><strong>Transaction Type:</strong> ${cryptoData.transactionType}</p>
                <p style="color: #16a34a; font-size: 18px; font-weight: 600; margin: 10px 0;"><strong>Amount:</strong> ${cryptoData.amount}</p>
                <p style="color: #666666; margin: 10px 0;"><strong>BTC Amount:</strong> ${cryptoData.btcAmount}</p>
                <p style="color: #666666; margin: 10px 0;"><strong>BTC Price:</strong> ${cryptoData.btcPrice}</p>
                ${cryptoData.accountType ? `<p style="color: #666666; margin: 10px 0;"><strong>Account:</strong> ${cryptoData.accountType} ${cryptoData.accountNumber ? `(${cryptoData.accountNumber})` : ''}</p>` : ''}
                <p style="color: #666666; margin: 10px 0;"><strong>Reference Number:</strong> ${cryptoData.referenceNumber}</p>
                <p style="color: #666666; margin: 10px 0;"><strong>Date:</strong> ${cryptoData.date}</p>
              </div>
              <p style="color: #666666; line-height: 1.6; margin-top: 20px;">Thank you for banking with Liberty National Bank.</p>
            </div>
          </body>
          </html>
        `
        break
      }

      default: {
        // Generic email template
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${emailSubject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${emailSubject}</h2>
            <p>Dear ${data.recipientName || 'Valued Customer'},</p>
            <p>${data.metadata?.message || 'This is an automated notification from Liberty National Bank.'}</p>
            ${data.metadata?.details ? `<p>${data.metadata.details}</p>` : ''}
            <p>Thank you for banking with us.</p>
          </body>
          </html>
        `
      }
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || FROM_EMAIL
    const replyTo = process.env.EMAIL_REPLY_TO || contactEmail || 'support@libertybank.com'

    const mailOptions = {
      from: fromEmail,
      to: data.recipientEmail,
      replyTo: replyTo,
      subject: emailSubject,
      html: emailHtml,
    }

    console.log('📧 Attempting to send email (direct Nodemailer):', {
      to: data.recipientEmail,
      subject: emailSubject,
      notificationType: data.notificationType,
      from: fromEmail,
    })

    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully (direct Nodemailer):', {
      to: data.recipientEmail,
      subject: emailSubject,
      notificationType: data.notificationType,
      messageId: info.messageId,
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Error sending email (direct Nodemailer):', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}





