/**
 * Email Notification Helpers
 * Convenient functions to send email notifications for common banking actions
 */

import { notifyUser, notifyAdmins, notifyUserAndAdmins } from './emailService'
import { formatCurrency } from '@/lib/utils'

/**
 * Send transfer notification emails
 */
export async function sendTransferNotification(
  userId: string,
  transferType: 'internal' | 'external' | 'p2p' | 'wire',
  amount: number,
  fromAccount: string,
  toAccount?: string,
  referenceNumber?: string,
  memo?: string
): Promise<void> {
  try {
    console.log('📧 sendTransferNotification called:', {
      userId,
      transferType,
      amount,
      referenceNumber,
    })

    const notificationType = `transfer_${transferType}` as const
    const transferTypeLabels = {
      internal: 'Internal Transfer',
      external: 'External Transfer',
      p2p: 'Peer-to-Peer Transfer',
      wire: 'Wire Transfer',
    }

    const metadata = {
      amount: formatCurrency(amount),
      fromAccount,
      toAccount,
      referenceNumber: referenceNumber || 'N/A',
      transferType,
      date: new Date().toLocaleString(),
      memo,
    }

    const subject = `${transferTypeLabels[transferType]} - ${formatCurrency(amount)} - ${referenceNumber || 'N/A'}`

    console.log('📧 Calling notifyUser for transfer notification')
    // Notify user
    const userResult = await notifyUser(userId, notificationType, subject, metadata)
    console.log('📧 notifyUser result for transfer:', userResult)

    console.log('📧 Calling notifyAdmins for transfer notification')
    // Notify admins
    const adminResult = await notifyAdmins(notificationType, `Admin: ${subject}`, {
      ...metadata,
      userId,
    })
    console.log('📧 notifyAdmins result for transfer:', adminResult)
  } catch (error) {
    console.error('❌ Error sending transfer notification:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    // Don't throw - email failures shouldn't break the transfer
  }
}

/**
 * Send bill payment notification emails
 */
export async function sendBillPaymentNotification(
  userId: string,
  billName: string,
  amount: number,
  accountNumber: string,
  referenceNumber?: string
): Promise<void> {
  try {
    const metadata = {
      billName,
      amount: formatCurrency(amount),
      accountNumber,
      referenceNumber: referenceNumber || 'N/A',
      date: new Date().toLocaleString(),
    }

    const subject = `Bill Payment Confirmation - ${billName} - ${formatCurrency(amount)}`

    // Notify user
    await notifyUser(userId, 'bill_payment', subject, metadata)

    // Notify admins
    await notifyAdmins('bill_payment', `Admin: ${subject}`, {
      ...metadata,
      userId,
    })
  } catch (error) {
    console.error('Error sending bill payment notification:', error)
    // Don't throw - email failures shouldn't break the payment
  }
}

/**
 * Send loan application notification emails
 */
export async function sendLoanApplicationNotification(
  userId: string,
  loanType: string,
  requestedAmount: number,
  referenceNumber?: string
): Promise<void> {
  try {
    const metadata = {
      loanType,
      requestedAmount: formatCurrency(requestedAmount),
      referenceNumber: referenceNumber || 'N/A',
      date: new Date().toLocaleString(),
    }

    const subject = `Loan Application Received - ${loanType} - ${referenceNumber || 'N/A'}`

    // Notify user
    await notifyUser(userId, 'loan_application', subject, metadata)

    // Notify admins
    await notifyAdmins('loan_application', `Admin: ${subject}`, {
      ...metadata,
      userId,
    })
  } catch (error) {
    console.error('Error sending loan application notification:', error)
    // Don't throw - email failures shouldn't break the application
  }
}

/**
 * Send loan approval notification emails
 */
export async function sendLoanApprovalNotification(
  userId: string,
  loanType: string,
  approvedAmount: number,
  interestRate: number,
  monthlyPayment: number,
  termMonths: number,
  referenceNumber?: string
): Promise<void> {
  try {
    const metadata = {
      loanType,
      approvedAmount: formatCurrency(approvedAmount),
      interestRate: `${interestRate}%`,
      monthlyPayment: formatCurrency(monthlyPayment),
      termMonths,
      referenceNumber: referenceNumber || 'N/A',
    }

    const subject = `Loan Approved - ${loanType} - ${formatCurrency(approvedAmount)}`

    // Notify user
    await notifyUser(userId, 'loan_approved', subject, metadata)

    // Notify admins
    await notifyAdmins('loan_approved', `Admin: ${subject}`, {
      ...metadata,
      userId,
    })
  } catch (error) {
    console.error('Error sending loan approval notification:', error)
    // Don't throw - email failures shouldn't break the approval
  }
}

/**
 * Send loan payment notification emails
 */
export async function sendLoanPaymentNotification(
  userId: string,
  loanType: string,
  paymentAmount: number,
  balanceRemaining: number,
  referenceNumber?: string
): Promise<void> {
  try {
    const metadata = {
      loanType,
      paymentAmount: formatCurrency(paymentAmount),
      balanceRemaining: formatCurrency(balanceRemaining),
      referenceNumber: referenceNumber || 'N/A',
      date: new Date().toLocaleString(),
    }

    const subject = `Loan Payment Confirmation - ${loanType} - ${formatCurrency(paymentAmount)}`

    // Notify user
    await notifyUser(userId, 'loan_payment', subject, metadata)

    // Notify admins
    await notifyAdmins('loan_payment', `Admin: ${subject}`, {
      ...metadata,
      userId,
    })
  } catch (error) {
    console.error('Error sending loan payment notification:', error)
    // Don't throw - email failures shouldn't break the payment
  }
}

/**
 * Send role change notification emails
 */
export async function sendRoleChangeNotification(
  userId: string,
  newRole: 'user' | 'admin' | 'superadmin',
  previousRole: 'user' | 'admin' | 'superadmin',
  changedByAdminName: string,
  changedByAdminEmail: string
): Promise<void> {
  try {
    const metadata = {
      newRole,
      previousRole,
      changedBy: changedByAdminName,
      changedByEmail: changedByAdminEmail,
      date: new Date().toLocaleString(),
    }

    const roleLabels: Record<string, string> = {
      user: 'Regular User',
      admin: 'Administrator',
      superadmin: 'Super Administrator',
    }

    const subject = `Account Role Changed - ${roleLabels[newRole]}`

    // Notify the user whose role was changed
    await notifyUser(userId, 'role_changed', subject, metadata)

    // Notify other admins about the role change
    await notifyAdmins('admin_action', `Admin Action: Role Changed to ${roleLabels[newRole]}`, {
      ...metadata,
      userId,
      actionType: 'Role Change',
      details: `User role changed from ${roleLabels[previousRole]} to ${roleLabels[newRole]} by ${changedByAdminName}`,
    })
  } catch (error) {
    console.error('Error sending role change notification:', error)
    // Don't throw - email failures shouldn't break the role change
  }
}

/**
 * Send account funded notification emails
 */
export async function sendAccountFundedNotification(
  userId: string,
  amount: number,
  accountType: string,
  accountNumber: string,
  fundingMethod: string,
  referenceNumber?: string,
  adminName?: string
): Promise<void> {
  try {
    const accountTypeLabel = accountType === 'fixed-deposit' 
      ? 'Fixed Deposit' 
      : accountType.charAt(0).toUpperCase() + accountType.slice(1)

    const metadata = {
      amount: formatCurrency(amount),
      accountType: accountTypeLabel,
      accountNumber,
      fundingMethod: fundingMethod === 'direct-deposit' ? 'Direct Deposit' : 'ACH Transfer',
      referenceNumber: referenceNumber || 'N/A',
      date: new Date().toLocaleString(),
      adminName: adminName || 'Administrator',
    }

    const subject = `Account Funded - ${formatCurrency(amount)} - ${referenceNumber || 'N/A'}`

    // Notify the user
    await notifyUser(userId, 'account_funded', subject, metadata)

    // Notify admins about the funding
    await notifyAdmins('admin_action', `Admin Action: Account Funded - ${formatCurrency(amount)}`, {
      ...metadata,
      userId,
      actionType: 'Account Funding',
      details: `Account ${accountTypeLabel} (${accountNumber}) funded with ${formatCurrency(amount)} via ${metadata.fundingMethod}`,
    })
  } catch (error) {
    console.error('Error sending account funded notification:', error)
    // Don't throw - email failures shouldn't break the funding
  }
}

/**
 * Send mobile deposit notification emails
 */
export async function sendMobileDepositNotification(
  userId: string,
  amount: number,
  accountType: string,
  referenceNumber?: string,
  depositId?: string
): Promise<void> {
  try {
    const metadata = {
      amount: formatCurrency(amount),
      accountType: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      referenceNumber: referenceNumber || 'N/A',
      depositId: depositId || 'N/A',
      date: new Date().toLocaleString(),
      status: 'pending',
    }

    const subject = `Mobile Deposit Submitted - ${formatCurrency(amount)} - ${referenceNumber || 'N/A'}`

    // Notify user
    await notifyUser(userId, 'deposit_submitted', subject, metadata)

    // Notify admins about the mobile deposit
    await notifyAdmins('deposit_submitted', `Admin: New Mobile Deposit - ${formatCurrency(amount)} - ${referenceNumber || 'N/A'}`, {
      ...metadata,
      userId,
      actionType: 'Mobile Deposit Submission',
      details: `User submitted a mobile deposit of ${formatCurrency(amount)} for ${metadata.accountType} account. Deposit ID: ${depositId || 'N/A'}`,
    })
  } catch (error) {
    console.error('Error sending mobile deposit notification:', error)
    // Don't throw - email failures shouldn't break the deposit
  }
}

/**
 * Send mobile deposit approval notification emails
 */
export async function sendDepositApprovalNotification(
  userId: string,
  amount: number,
  accountType: string,
  accountNumber: string,
  referenceNumber: string,
  depositId: string,
  adminName?: string,
  adminNotes?: string
): Promise<void> {
  try {
    const metadata = {
      amount: formatCurrency(amount),
      accountType: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      accountNumber,
      referenceNumber,
      depositId,
      date: new Date().toLocaleString(),
      adminName: adminName || 'Administrator',
      adminNotes: adminNotes || undefined,
    }

    const subject = `Mobile Deposit Approved - ${formatCurrency(amount)} - ${referenceNumber}`

    // Notify user
    await notifyUser(userId, 'deposit_approved', subject, metadata)

    // Notify admins about the approval
    await notifyAdmins('deposit_approved', `Admin: Mobile Deposit Approved - ${formatCurrency(amount)} - ${referenceNumber}`, {
      ...metadata,
      userId,
      actionType: 'Mobile Deposit Approval',
      details: `Mobile deposit of ${formatCurrency(amount)} (${referenceNumber}) has been approved and credited to user's ${metadata.accountType} account.`,
    })
  } catch (error) {
    console.error('Error sending deposit approval notification:', error)
    // Don't throw - email failures shouldn't break the approval
  }
}

/**
 * Send mobile deposit rejection notification emails
 */
export async function sendDepositRejectionNotification(
  userId: string,
  amount: number,
  accountType: string,
  accountNumber: string,
  referenceNumber: string,
  depositId: string,
  reason?: string,
  adminNotes?: string
): Promise<void> {
  try {
    const metadata = {
      amount: formatCurrency(amount),
      accountType: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      accountNumber,
      referenceNumber,
      depositId,
      date: new Date().toLocaleString(),
      reason: reason || undefined,
      adminNotes: adminNotes || undefined,
    }

    const subject = `Mobile Deposit Rejected - ${formatCurrency(amount)} - ${referenceNumber}`

    // Notify user
    await notifyUser(userId, 'deposit_rejected', subject, metadata)

    // Notify admins about the rejection
    await notifyAdmins('deposit_rejected', `Admin: Mobile Deposit Rejected - ${formatCurrency(amount)} - ${referenceNumber}`, {
      ...metadata,
      userId,
      actionType: 'Mobile Deposit Rejection',
      details: `Mobile deposit of ${formatCurrency(amount)} (${referenceNumber}) has been rejected. Reason: ${reason || adminNotes || 'No reason provided'}`,
    })
  } catch (error) {
    console.error('Error sending deposit rejection notification:', error)
    // Don't throw - email failures shouldn't break the rejection
  }
}

/**
 * Send card transaction notification emails
 */
export async function sendCardTransactionNotification(
  userId: string,
  actionType: 'debit' | 'credit' | 'atm_withdrawal' | 'online_purchase' | 'fee' | 'chargeback' | 'refund',
  amount: number,
  cardType: string,
  accountType: string,
  referenceNumber?: string,
  merchantName?: string
): Promise<void> {
  try {
    const actionLabels: Record<string, string> = {
      debit: 'Card Purchase',
      credit: 'Card Top-Up',
      atm_withdrawal: 'ATM Withdrawal',
      online_purchase: 'Online Purchase',
      fee: 'Card Fee',
      chargeback: 'Chargeback',
      refund: 'Card Refund',
    }

    const isDebit = ['debit', 'atm_withdrawal', 'online_purchase', 'fee', 'chargeback'].includes(actionType)
    const actionLabel = actionLabels[actionType] || 'Card Transaction'
    const transactionType = isDebit ? 'Debited' : 'Credited'

    const metadata = {
      actionType: actionLabel,
      transactionType,
      amount: formatCurrency(amount),
      cardType: cardType.charAt(0).toUpperCase() + cardType.slice(1),
      accountType: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      referenceNumber: referenceNumber || 'N/A',
      merchantName: merchantName || null,
      date: new Date().toLocaleString(),
    }

    const subject = `${actionLabel} - ${formatCurrency(amount)} - ${referenceNumber || 'N/A'}`

    // Notify user
    await notifyUser(userId, 'card_transaction', subject, metadata)

    // Notify admins about the card transaction
    await notifyAdmins('card_transaction', `Admin: ${actionLabel} - ${formatCurrency(amount)} - ${referenceNumber || 'N/A'}`, {
      ...metadata,
      userId,
      actionType: 'Card Transaction',
      details: `${transactionType} ${formatCurrency(amount)} on ${metadata.cardType} card (${metadata.accountType} account). Merchant: ${merchantName || 'N/A'}`,
    })
  } catch (error) {
    console.error('Error sending card transaction notification:', error)
    // Don't throw - email failures shouldn't break the transaction
  }
}

/**
 * Send crypto transaction notification emails
 */
export async function sendCryptoTransactionNotification(
  userId: string,
  transactionType: 'btc_buy' | 'btc_sell' | 'crypto_fund',
  amount: number,
  btcAmount: number,
  btcPrice: number,
  referenceNumber: string,
  accountType?: string,
  accountNumber?: string
): Promise<void> {
  try {
    const typeLabels: Record<string, string> = {
      btc_buy: 'BTC Purchase',
      btc_sell: 'BTC Sale',
      crypto_fund: 'Crypto Account Funded',
    }

    const typeLabel = typeLabels[transactionType] || 'Crypto Transaction'
    const transactionLabel = transactionType === 'btc_buy' ? 'Purchased' : transactionType === 'btc_sell' ? 'Sold' : 'Funded'

    const metadata = {
      transactionType: typeLabel,
      transactionLabel,
      amount: formatCurrency(amount),
      btcAmount: `${btcAmount.toFixed(8)} BTC`,
      btcPrice: formatCurrency(btcPrice),
      referenceNumber,
      accountType: accountType ? accountType.charAt(0).toUpperCase() + accountType.slice(1) : undefined,
      accountNumber: accountNumber || undefined,
      date: new Date().toLocaleString(),
    }

    const subject = `${typeLabel} Approved - ${formatCurrency(amount)} - ${referenceNumber}`

    // Notify user
    await notifyUser(userId, 'crypto_transaction', subject, metadata)

    // Notify admins
    await notifyAdmins('crypto_transaction', `Admin: ${typeLabel} Approved - ${formatCurrency(amount)} - ${referenceNumber}`, {
      ...metadata,
      userId,
      actionType: 'Crypto Transaction',
      details: `User ${transactionLabel.toLowerCase()} ${btcAmount.toFixed(8)} BTC (${formatCurrency(amount)}) at ${formatCurrency(btcPrice)} per BTC. Reference: ${referenceNumber}`,
    })
  } catch (error) {
    console.error('Error sending crypto transaction notification:', error)
    // Don't throw - email failures shouldn't break the transaction
  }
}

