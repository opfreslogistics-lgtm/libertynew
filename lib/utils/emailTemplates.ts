/**
 * Email Templates
 * Professional, clean email templates for banking notifications
 */

export interface TransferEmailData {
  recipientName: string
  amount: string
  fromAccount: string
  toAccount?: string
  referenceNumber: string
  transferType: 'internal' | 'external' | 'p2p' | 'wire'
  date: string
  memo?: string
}

export interface BillPaymentEmailData {
  recipientName: string
  billName: string
  amount: string
  accountNumber: string
  referenceNumber: string
  date: string
}

export interface LoanApplicationEmailData {
  recipientName: string
  loanType: string
  requestedAmount: string
  referenceNumber: string
  date: string
}

export interface LoanApprovalEmailData {
  recipientName: string
  loanType: string
  approvedAmount: string
  interestRate: string
  monthlyPayment: string
  termMonths: number
  referenceNumber: string
}

export interface LoanPaymentEmailData {
  recipientName: string
  loanType: string
  paymentAmount: string
  balanceRemaining: string
  referenceNumber: string
  date: string
}

export interface AdminActionEmailData {
  adminName: string
  actionType: string
  userEmail?: string
  userName?: string
  details: string
  amount?: string
  date: string
}

export interface RoleChangeEmailData {
  recipientName: string
  newRole: string
  previousRole?: string
  changedBy: string
  date: string
  message?: string
}

export interface AccountFundedEmailData {
  recipientName: string
  amount: string
  accountType: string
  accountNumber: string
  fundingMethod: string
  referenceNumber: string
  date: string
  adminName?: string
}

export interface DepositApprovalEmailData {
  recipientName: string
  amount: string
  accountType: string
  accountNumber: string
  referenceNumber: string
  depositId: string
  date: string
  adminName?: string
  adminNotes?: string
}

export interface DepositRejectionEmailData {
  recipientName: string
  amount: string
  accountType: string
  accountNumber: string
  referenceNumber: string
  depositId: string
  date: string
  reason?: string
  adminNotes?: string
}

export interface CryptoTransactionEmailData {
  recipientName: string
  transactionType: string
  amount: string
  btcAmount: string
  btcPrice: string
  accountType?: string
  accountNumber?: string
  referenceNumber: string
  date: string
}

/**
 * Base email template wrapper
 */
function getEmailTemplate(title: string, content: string, contactEmail?: string): string {
  return getEmailTemplateWithLogo(title, content, '', contactEmail)
}

/**
 * Base email template wrapper with optional logo
 */
function getEmailTemplateWithLogo(title: string, content: string, logoHtml: string, contactEmail?: string): string {
  // Default logo URL if none is provided
  const DEFAULT_LOGO_URL = 'https://ancomjvybjnaapxjsfbk.supabase.co/storage/v1/object/public/app-images/app-settings/app_logo_dark_1764461829920_27d4d2.png'
  
  // Always show logo if provided, otherwise use default logo
  const headerContent = logoHtml 
    ? logoHtml
    : `<img src="${DEFAULT_LOGO_URL}" alt="Liberty National Bank" style="max-width: 200px; max-height: 60px; margin: 0 auto; display: block; height: auto; width: auto;" />`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #047857 100%); border-radius: 8px 8px 0 0;">
              ${headerContent}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666666; line-height: 1.6;">
              <p style="margin: 0 0 10px;">This is an automated message from Liberty National Bank.</p>
              <p style="margin: 0 0 10px;"><strong>Please do not reply to this email.</strong> This email address is not monitored and replies will not be received.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Liberty National Bank. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Transfer notification email template
 */
export function getTransferEmailTemplate(data: TransferEmailData): { subject: string; html: string } {
  const transferTypeLabels = {
    internal: 'Internal Transfer',
    external: 'External Transfer',
    p2p: 'Peer-to-Peer Transfer',
    wire: 'Wire Transfer',
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">Transfer Notification</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      This email confirms that a <strong>${transferTypeLabels[data.transferType]}</strong> has been successfully processed from your account.
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #16a34a; margin-bottom: 5px;">${data.amount}</div>
        <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Transfer Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Transaction Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Transfer Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${transferTypeLabels[data.transferType]}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">From Account</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.fromAccount}</td>
        </tr>
        ${data.toAccount ? `
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">To Account</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.toAccount}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Transaction Date</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #16a34a; font-weight: 600;">✓ Completed</td>
        </tr>
        ${data.memo ? `
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600; vertical-align: top;">Memo / Note</td>
          <td style="padding: 15px 20px; color: #111827; font-weight: 500;">${data.memo}</td>
        </tr>
        ` : `
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600; vertical-align: top;">Memo / Note</td>
          <td style="padding: 15px 20px; color: #9ca3af; font-style: italic;">No memo provided</td>
        </tr>
        `}
      </table>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 15px 20px; margin: 0 0 20px;">
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        <strong>Security Notice:</strong> If you did not initiate this transfer, please contact us immediately through your online banking portal or visit your nearest branch.
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `${transferTypeLabels[data.transferType]} - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate('Transfer Notification', content),
  }
}

/**
 * Bill payment email template
 */
export function getBillPaymentEmailTemplate(data: BillPaymentEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">Bill Payment Confirmation</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      Your bill payment has been <strong>successfully processed</strong> and will be sent to the payee.
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #16a34a; margin-bottom: 5px;">${data.amount}</div>
        <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Payment Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Payment Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Bill Payee</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.billName}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Account Used</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.accountNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Payment Date</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; color: #16a34a; font-weight: 600;">✓ Processed</td>
        </tr>
      </table>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `Bill Payment Confirmation - ${data.billName} - ${data.amount}`,
    html: getEmailTemplate('Bill Payment Confirmation', content),
  }
}

/**
 * Loan application email template
 */
export function getLoanApplicationEmailTemplate(data: LoanApplicationEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">Loan Application Received</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      Thank you for submitting your loan application. We have <strong>received your application</strong> and our team will review it within <strong>24-48 hours</strong>.
    </p>
    
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #3b82f6; margin-bottom: 5px;">${data.requestedAmount}</div>
        <div style="font-size: 14px; color: #1e40af; font-weight: 600; text-transform: uppercase;">Requested Loan Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Application Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Loan Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.loanType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Application Reference</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Application Date</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; color: #f59e0b; font-weight: 600;">⏳ Under Review</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 6px; padding: 15px 20px; margin: 0 0 20px;">
      <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
        <strong>Next Steps:</strong> You will receive an email notification once your application has been reviewed. Please ensure all required documents are submitted to expedite the process.
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `Loan Application Received - ${data.loanType} - ${data.referenceNumber}`,
    html: getEmailTemplate('Loan Application Received', content),
  }
}

/**
 * Loan approval email template
 */
export function getLoanApprovalEmailTemplate(data: LoanApprovalEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">🎉 Loan Application Approved</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      We are <strong>pleased to inform you</strong> that your loan application has been <strong style="color: #16a34a;">approved</strong>!
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #16a34a; margin-bottom: 5px;">${data.approvedAmount}</div>
        <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Approved Loan Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Loan Terms & Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Loan Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.loanType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Interest Rate</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.interestRate}% APR</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Monthly Payment</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #16a34a; font-weight: 600; font-size: 18px;">${data.monthlyPayment}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Loan Term</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.termMonths} months (${Math.round(data.termMonths / 12)} years)</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; color: #16a34a; font-weight: 600;">✓ Approved</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 15px 20px; margin: 0 0 20px;">
      <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">
        <strong>Next Steps:</strong> Please log in to your account to view the full loan details, review the terms, and complete the final steps to activate your loan.
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `Loan Approved - ${data.loanType} - ${data.approvedAmount}`,
    html: getEmailTemplate('Loan Application Approved', content),
  }
}

/**
 * Loan payment email template
 */
export function getLoanPaymentEmailTemplate(data: LoanPaymentEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">Loan Payment Received</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      This email confirms that your <strong>loan payment has been successfully processed</strong>.
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #16a34a; margin-bottom: 5px;">${data.paymentAmount}</div>
        <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Payment Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Payment Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Loan Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.loanType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Remaining Balance</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-size: 16px;">${data.balanceRemaining}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Payment Date</td>
          <td style="padding: 15px 20px; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
      </table>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `Loan Payment Confirmation - ${data.loanType} - ${data.paymentAmount}`,
    html: getEmailTemplate('Loan Payment Confirmation', content),
  }
}

/**
 * Admin action notification email template
 */
export function getAdminActionEmailTemplate(data: AdminActionEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Admin Action Notification</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.adminName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      This is a notification of an admin action that was performed in the system.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Action Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.actionType}</td>
      </tr>
      ${data.userName ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">User:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.userName}${data.userEmail ? ` (${data.userEmail})` : ''}</td>
      </tr>
      ` : ''}
      ${data.amount ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.amount}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Details:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.details}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date & Time:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
  `

  return {
    subject: `Admin Action: ${data.actionType}`,
    html: getEmailTemplate('Admin Action Notification', content),
  }
}

export interface OTPEmailData {
  recipientName: string
  otpCode: string
  expiresInMinutes: number
  logoUrl?: string // Optional logo URL
  contactEmail?: string // Contact email from admin settings
}

/**
 * OTP (One-Time Password) email template
 * Updated to match website's green/emerald color scheme and include logo
 */
export function getOTPEmailTemplate(data: OTPEmailData): { subject: string; html: string } {
  // Default logo URL if none is provided
  const DEFAULT_LOGO_URL = 'https://ancomjvybjnaapxjsfbk.supabase.co/storage/v1/object/public/app-images/app-settings/app_logo_dark_1764461829920_27d4d2.png'
  
  const logoUrlToUse = data.logoUrl || DEFAULT_LOGO_URL
  const logoHtml = `<img src="${logoUrlToUse}" alt="Liberty National Bank" style="max-width: 200px; max-height: 60px; margin: 0 auto; display: block; height: auto; width: auto;" />`

  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Your Login Verification Code</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      You have requested to log in to your Liberty National Bank account. Please use the verification code below to complete your login.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #047857 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
        <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.otpCode}</p>
      </div>
    </div>
    
    <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Security Notice:</strong> This code will expire in ${data.expiresInMinutes} minutes. Never share this code with anyone. Liberty National Bank will never ask for this code via phone or email.
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      If you did not request this code, please ignore this email immediately. Do not reply to this email.
    </p>
  `

  return {
    subject: `Your Login Verification Code - ${data.otpCode}`,
    html: getEmailTemplateWithLogo('Login Verification Code', content, logoHtml, data.contactEmail),
  }
}

/**
 * Role change email template
 */
export function getRoleChangeEmailTemplate(data: RoleChangeEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Role Change Notification</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      Your account role has been updated.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      ${data.previousRole ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Previous Role:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.previousRole}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">New Role:</td>
        <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.newRole}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Changed By:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.changedBy}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date & Time:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
    
    ${data.message ? `
    <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">${data.message}</p>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      If you have any questions about this change, please contact our support team.
    </p>
  `

  return {
    subject: `Account Role Changed - ${data.newRole}`,
    html: getEmailTemplate('Role Change Notification', content),
  }
}

/**
 * Account funded email template
 */
export function getAccountFundedEmailTemplate(data: AccountFundedEmailData): { subject: string; html: string } {
  // Determine title based on funding method
  const fundingMethodLower = data.fundingMethod?.toLowerCase() || ''
  let title = 'Account Funded Notification'
  let description = 'Your account has been <strong>successfully funded</strong>. The funds are now available in your account.'
  
  if (fundingMethodLower.includes('ach') || fundingMethodLower.includes('ach transfer')) {
    title = 'ACH Received'
    description = 'An <strong>ACH transfer</strong> has been received and credited to your account. The funds are now available.'
  } else if (fundingMethodLower.includes('direct deposit') || fundingMethodLower.includes('direct-deposit')) {
    title = 'Direct Deposit Received'
    description = 'A <strong>direct deposit</strong> has been received and credited to your account. The funds are now available.'
  } else if (fundingMethodLower.includes('wire') || fundingMethodLower.includes('wire transfer')) {
    title = 'Wire Transfer Received'
    description = 'A <strong>wire transfer</strong> has been received and credited to your account. The funds are now available.'
  } else if (fundingMethodLower.includes('transfer')) {
    title = 'Transfer Received'
    description = 'A <strong>transfer</strong> has been received and credited to your account. The funds are now available.'
  } else if (data.fundingMethod) {
    title = `${data.fundingMethod} Received`
    description = `A <strong>${data.fundingMethod}</strong> has been received and credited to your account. The funds are now available.`
  }
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">${title}</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      ${description}
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #16a34a; margin-bottom: 5px;">${data.amount}</div>
        <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Amount Received</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Funding Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Account Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.accountType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Account Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.accountNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Funding Method</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.fundingMethod}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Transaction Date</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
        ${data.adminName ? `
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Processed By</td>
          <td style="padding: 15px 20px; color: #111827; font-weight: 500;">${data.adminName}</td>
        </tr>
        ` : `
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; color: #16a34a; font-weight: 600;">✓ Completed</td>
        </tr>
        `}
      </table>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `${title} - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate(title, content),
  }
}

/**
 * Deposit approval email template
 */
export function getDepositApprovalEmailTemplate(data: DepositApprovalEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">✅ Mobile Deposit Approved</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      Great news! Your mobile deposit has been <strong style="color: #16a34a;">approved</strong> and the funds have been credited to your account.
    </p>
    
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #16a34a; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #16a34a; margin-bottom: 5px;">${data.amount}</div>
        <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Deposit Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Deposit Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Account Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.accountType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Account Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.accountNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Deposit ID</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.depositId}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Approved Date</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
        ${data.adminName ? `
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Processed By</td>
          <td style="padding: 15px 20px; color: #111827; font-weight: 500;">${data.adminName}</td>
        </tr>
        ` : `
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; color: #16a34a; font-weight: 600;">✓ Approved</td>
        </tr>
        `}
      </table>
    </div>
    ${data.adminNotes ? `
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 15px 20px; margin: 0 0 20px;">
      <p style="margin: 0 0 8px; color: #047857; font-weight: 600; font-size: 14px;">Admin Notes:</p>
      <p style="margin: 0; color: #065f46; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${data.adminNotes}</p>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `Mobile Deposit Approved - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate('Mobile Deposit Approved', content),
  }
}

/**
 * Deposit rejection email template
 */
export function getDepositRejectionEmailTemplate(data: DepositRejectionEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">⚠️ Mobile Deposit Rejected</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      We regret to inform you that your mobile deposit has been <strong style="color: #ef4444;">rejected</strong> and the funds were not credited to your account.
    </p>
    
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #ef4444; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: #ef4444; margin-bottom: 5px;">${data.amount}</div>
        <div style="font-size: 14px; color: #991b1b; font-weight: 600; text-transform: uppercase;">Rejected Deposit Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Deposit Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Account Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.accountType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Account Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.accountNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Deposit ID</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.depositId}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Rejected Date</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Status</td>
          <td style="padding: 15px 20px; color: #ef4444; font-weight: 600;">✗ Rejected</td>
        </tr>
      </table>
    </div>
    ${data.reason || data.adminNotes ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 15px 20px; margin: 0 0 20px;">
      <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 14px;">Reason for Rejection:</p>
      <p style="margin: 0; color: #7f1d1d; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${data.reason || data.adminNotes || 'Please contact customer support for more information.'}</p>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `Mobile Deposit Rejected - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate('Mobile Deposit Rejected', content),
  }
}

/**
 * Crypto transaction email template
 */
export function getCryptoTransactionEmailTemplate(data: CryptoTransactionEmailData): { subject: string; html: string } {
  const isBuy = data.transactionType.toLowerCase().includes('buy') || data.transactionType.toLowerCase().includes('purchase')
  const isSell = data.transactionType.toLowerCase().includes('sell')
  const statusColor = isBuy ? '#16a34a' : isSell ? '#3b82f6' : '#6b7280'
  const statusBg = isBuy ? '#f0fdf4' : isSell ? '#eff6ff' : '#f9fafb'
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 700;">Crypto Transaction ${isBuy ? 'Completed' : isSell ? 'Completed' : 'Processed'}</h2>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 30px; color: #666666; line-height: 1.6; font-size: 15px;">
      Your <strong>${data.transactionType}</strong> has been <strong style="color: ${statusColor};">successfully processed</strong>.
    </p>
    
    <div style="background: linear-gradient(135deg, ${statusBg} 0%, ${isBuy ? '#dcfce7' : isSell ? '#dbeafe' : '#f3f4f6'} 100%); border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 36px; font-weight: 700; color: ${statusColor}; margin-bottom: 5px;">${data.amount}</div>
        <div style="font-size: 14px; color: ${statusColor}; font-weight: 600; text-transform: uppercase;">Transaction Amount</div>
      </div>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 0 0 30px; overflow: hidden;">
      <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; color: #333333; font-size: 16px; font-weight: 600;">Transaction Details</h3>
      </div>
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600; width: 40%;">Transaction Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.transactionType}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">BTC Amount</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace;">${data.btcAmount}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">BTC Price</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.btcPrice}</td>
        </tr>
        ${data.accountType ? `
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Account Type</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500;">${data.accountType}</td>
        </tr>
        ` : ''}
        ${data.accountNumber ? `
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Account Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-family: monospace;">${data.accountNumber}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #374151; font-weight: 600;">Reference Number</td>
          <td style="padding: 15px 20px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-family: monospace; letter-spacing: 0.5px;">${data.referenceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 15px 20px; color: #374151; font-weight: 600;">Transaction Date</td>
          <td style="padding: 15px 20px; color: #111827; font-weight: 500;">${data.date}</td>
        </tr>
      </table>
    </div>
    
    <p style="margin: 20px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; text-align: center;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `

  return {
    subject: `${data.transactionType} - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate('Crypto Transaction', content),
  }
}

// Contact Form Email Templates
export interface ContactFormEmailData {
  senderName: string
  senderEmail: string
  senderPhone: string
  subject: string
  message: string
  date: string
}

export function getContactFormEmailTemplate(data: ContactFormEmailData): { subject: string; html: string } {
  const content = `
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">
      You have received a new message from your website contact form.
    </p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600; width: 35%;">Name:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.senderName}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Email:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;"><a href="mailto:${data.senderEmail}" style="color: #047857;">${data.senderEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Phone:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.senderPhone}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Subject:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.subject}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Date:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.date}</td>
      </tr>
    </table>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #047857; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #333333; font-weight: 600;">Message:</p>
      <p style="margin: 0; color: #666666; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
    </div>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Please respond to this inquiry within 24 hours.
    </p>
  `

  return {
    subject: `New Contact Form Submission: ${data.subject}`,
    html: getEmailTemplate('New Contact Form Submission', content),
  }
}

export interface ContactConfirmationEmailData {
  name: string
  subject: string
  message: string
  date: string
}

export function getContactConfirmationEmailTemplate(data: ContactConfirmationEmailData): { subject: string; html: string } {
  const content = `
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">
      Dear ${data.name},
    </p>
    
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">
      Thank you for contacting Liberty National Bank. We have received your message and one of our team members will respond to you within 24 hours.
    </p>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #047857; border-radius: 4px;">
      <p style="margin: 0 0 12px; color: #333333; font-weight: 600;">Your Message Details:</p>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600; width: 30%;">Subject:</td>
          <td style="padding: 8px 0; color: #666666;">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date:</td>
          <td style="padding: 8px 0; color: #666666;">${data.date}</td>
        </tr>
      </table>
      <p style="margin: 12px 0 0; color: #666666; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
    </div>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      If you have an urgent matter, please call us at 1-800-LIBERTY or visit your nearest branch.
    </p>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Thank you for choosing Liberty National Bank.
    </p>
  `

  return {
    subject: 'We received your message - Liberty National Bank',
    html: getEmailTemplate('Message Received Confirmation', content),
  }
}

// Support Ticket Email Templates
export interface SupportTicketEmailData {
  ticketNumber: string
  userName: string
  userEmail: string
  category: string
  priority: string
  subject: string
  message: string
  date: string
}

export function getSupportTicketEmailTemplate(data: SupportTicketEmailData): { subject: string; html: string } {
  const priorityColor = data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981'
  
  const content = `
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">
      A new support ticket has been created and requires your attention.
    </p>
    
    <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border-radius: 8px; border: 2px solid ${priorityColor};">
      <p style="margin: 0; color: ${priorityColor}; font-weight: 700; font-size: 14px; text-transform: uppercase;">
        ${data.priority} Priority Ticket
      </p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600; width: 35%;">Ticket Number:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666; font-family: monospace; font-weight: 600;">${data.ticketNumber}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">User:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.userName}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Email:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;"><a href="mailto:${data.userEmail}" style="color: #047857;">${data.userEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Category:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.category}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Subject:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.subject}</td>
      </tr>
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #333333; font-weight: 600;">Created:</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666666;">${data.date}</td>
      </tr>
    </table>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #047857; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #333333; font-weight: 600;">Issue Description:</p>
      <p style="margin: 0; color: #666666; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
    </div>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Please review and respond to this ticket as soon as possible.
    </p>
  `

  return {
    subject: `New Support Ticket [${data.priority.toUpperCase()}]: ${data.subject} - ${data.ticketNumber}`,
    html: getEmailTemplate('New Support Ticket', content),
  }
}

export interface SupportTicketConfirmationEmailData {
  userName: string
  ticketNumber: string
  category: string
  subject: string
  message: string
  date: string
}

export function getSupportTicketConfirmationEmailTemplate(data: SupportTicketConfirmationEmailData): { subject: string; html: string } {
  const content = `
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">
      Dear ${data.userName},
    </p>
    
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6; font-size: 16px;">
      Thank you for contacting Liberty National Bank Support. Your ticket has been created and our support team will assist you shortly.
    </p>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #047857; border-radius: 4px;">
      <p style="margin: 0 0 12px; color: #333333; font-weight: 600; font-size: 18px;">Ticket Information:</p>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600; width: 30%;">Ticket Number:</td>
          <td style="padding: 8px 0; color: #666666; font-family: monospace; font-weight: 600;">${data.ticketNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">Category:</td>
          <td style="padding: 8px 0; color: #666666;">${data.category}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">Subject:</td>
          <td style="padding: 8px 0; color: #666666;">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">Created:</td>
          <td style="padding: 8px 0; color: #666666;">${data.date}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #6b7280; border-radius: 4px;">
      <p style="margin: 0 0 8px; color: #333333; font-weight: 600;">Your Message:</p>
      <p style="margin: 0; color: #666666; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
    </div>
    
    <div style="margin: 20px 0; padding: 16px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af; line-height: 1.6; font-size: 14px;">
        <strong>What happens next?</strong><br>
        Our support team typically responds within 24 hours. You can view and track your ticket in the Support section of your account dashboard.
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      For urgent matters, please call our 24/7 hotline at <strong>1-800-LIBERTY</strong>.
    </p>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Thank you for choosing Liberty National Bank.
    </p>
  `

  return {
    subject: `Support Ticket Created - ${data.ticketNumber}`,
    html: getEmailTemplate('Support Ticket Confirmation', content),
  }
}

