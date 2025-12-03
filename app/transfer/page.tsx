'use client'

import { useState, useEffect } from 'react'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatCurrency, maskAccountNumber } from '@/lib/utils'
import { getUserTransactionCodes, RequiredCode } from '@/lib/utils/transactionCodes'
import NotificationModal from '@/components/NotificationModal'
import TransferProgressModal from '@/components/TransferProgressModal'
import { supabase } from '@/lib/supabase'
import { sendTransferNotification } from '@/lib/utils/emailNotifications'
import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  User,
  Building2,
  CreditCard,
  Wallet,
  Send,
  Calendar,
  Repeat,
  Plus,
  Check,
  AlertCircle,
  Info,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  Smartphone,
  Mail,
  Phone,
  ChevronRight,
  X,
  Search,
  Loader2,
} from 'lucide-react'

type TransferType = 'internal' | 'external' | 'p2p' | 'wire'
type RecurringFrequency = 'once' | 'daily' | 'weekly' | 'monthly'

export default function TransferPage() {
  const { accounts, refreshAccounts } = useAccounts() // Only use real accounts from database
  const [transferType, setTransferType] = useState<TransferType>('internal')
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [externalRoutingNumber, setExternalRoutingNumber] = useState('')
  const [externalAccountNumber, setExternalAccountNumber] = useState('')
  const [externalBankName, setExternalBankName] = useState('')
  const [externalAccountHolderName, setExternalAccountHolderName] = useState('')
  const [scheduled, setScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [recurring, setRecurring] = useState<RecurringFrequency>('once')
  const [memo, setMemo] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transferSuccessDetails, setTransferSuccessDetails] = useState<any>(null)
  const [requiredCodes, setRequiredCodes] = useState<RequiredCode[]>([])
  const [pendingTransfer, setPendingTransfer] = useState(false)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)

  // Notification modal state
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  })

  // Recent recipients - Empty for new users
  const recentRecipients: Array<{ id: string; name: string; email: string; avatar: string; lastUsed: string; amount: number }> = []

  const quickAmounts = [50, 100, 250, 500, 1000]

  const selectedAccount = accounts.find(acc => acc.id === fromAccount)
  
  // Helper function to get account display name
  const getAccountDisplayName = (account: any) => {
    if (!account) return 'Account'
    if (account.account_type) {
      const type = account.account_type === 'fixed-deposit' 
        ? 'Fixed Deposit' 
        : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
      return `${type} Account`
    }
    return account.name || 'Account'
  }
  
  // Helper function to get account number display
  const getAccountNumberDisplay = (account: any) => {
    if (!account) return 'N/A'
    if (account.account_number) {
      return maskAccountNumber(account.account_number)
    }
    if (account.last4) {
      return `****${account.last4}`
    }
    return 'N/A'
  }

  // Fetch transaction codes on mount
  useEffect(() => {
    const fetchCodes = async () => {
      const codes = await getUserTransactionCodes()
      setRequiredCodes(codes)
    }
    fetchCodes()
  }, [])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form based on transfer type
    if (!fromAccount || !amount || parseFloat(amount) <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all required fields and enter a valid amount.',
      })
      return
    }

    // Validate transfer type specific fields
    if (transferType === 'internal' && !toAccount) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select a destination account for internal transfer.',
      })
      return
    }

    if (transferType === 'external' && (!externalRoutingNumber || !externalAccountNumber || !externalBankName || !externalAccountHolderName)) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all required external transfer details (routing number, account number, bank name, and account holder name).',
      })
      return
    }

    if (transferType === 'p2p' && !recipientEmail && !recipientPhone) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter recipient email or phone number for P2P transfer.',
      })
      return
    }

    // Validate balance
    const fromAccountData = accounts.find(acc => acc.id === fromAccount)
    if (fromAccountData && parseFloat(fromAccountData.balance.toString()) < parseFloat(amount)) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough funds in the source account to complete this transfer.',
      })
      return
    }

    // Start processing animation first
    setIsProcessingTransaction(true)
    
    // Show processing for exactly 10 seconds before checking codes
    const initialProcessingTime = 10000 // 10 seconds
    await new Promise(resolve => setTimeout(resolve, initialProcessingTime))

    // Check if user has any enabled codes
    const codes = await getUserTransactionCodes()
    setRequiredCodes(codes)

    if (codes.length > 0) {
      // Show code form in the processing modal
      setPendingTransfer(true)
      setRequiredCodes(codes)
      // Processing modal will show code form instead
    } else {
      // No codes required, execute transfer immediately
      await executeTransfer()
    }
  }

  const handleCodeSubmit = async (code: string, codeType: string): Promise<boolean> => {
    // If code is empty, it means all codes have been validated (called from useEffect in modal)
    if (!code && codeType) {
      await handleCodeValidationSuccess()
      return true
    }
    
    const codeToValidate = requiredCodes.find(c => c.type === codeType && c.enabled)
    if (!codeToValidate) return false
    
    // Validate the code
    if (code.trim() !== codeToValidate.value) {
      return false
    }
    
    return true
  }

  const handleCodeValidationSuccess = async () => {
    setPendingTransfer(false)
    // All codes validated - continue with final processing for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000))
    // Execute transfer - it will handle transitioning to success
    await executeTransfer()
  }

  const handleCodeValidationCancel = () => {
    setPendingTransfer(false)
    setIsProcessingTransaction(false)
  }

  const executeTransfer = async () => {
    if (!fromAccount || !amount) {
      return
    }

    const transferAmount = parseFloat(amount)
    const fromAccountData = accounts.find(acc => acc.id === fromAccount)
    
    if (!fromAccountData || parseFloat(fromAccountData.balance.toString()) < transferAmount) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Balance',
        message: 'You do not have enough funds in the source account to complete this transfer.',
      })
        setIsProcessingTransaction(false)
      return
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Generate reference number
      const referenceNumber = `REF${Math.floor(100000 + Math.random() * 900000)}`
      const transactionDate = new Date().toISOString()

      // Fetch latest source account balance from database to ensure accuracy
      const { data: sourceAccountData, error: sourceFetchError } = await supabase
        .from('accounts')
        .select('balance, account_type')
        .eq('id', fromAccount)
        .single()
      
      if (sourceFetchError) {
        throw new Error('Failed to fetch source account balance')
      }
      
      const currentSourceBalance = parseFloat((sourceAccountData?.balance || 0).toString())
      
      // Double-check balance is sufficient
      if (currentSourceBalance < transferAmount) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Insufficient Balance',
          message: 'You do not have enough funds in the source account to complete this transfer.',
        })
        setIsProcessingTransaction(false)
        return
      }
      
      // Update source account balance
      const newSourceBalance = currentSourceBalance - transferAmount
      console.log(`[Transfer] Updating source account ${fromAccount}: ${currentSourceBalance} - ${transferAmount} = ${newSourceBalance}`)
      
      const { error: balanceError, data: updatedSourceData } = await supabase
        .from('accounts')
        .update({ 
          balance: newSourceBalance.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', fromAccount)
        .select('balance')
      
      if (balanceError) {
        console.error('[Transfer] Error updating source balance:', balanceError)
        throw balanceError
      }
      
      console.log(`[Transfer] Source account updated successfully:`, updatedSourceData)

      // Prepare transaction description based on transfer type using new format
      let transactionDescription = ''
      let toAccountData: any = null
      const fromAccountType = sourceAccountData?.account_type || ''

      if (transferType === 'internal') {
        toAccountData = accounts.find(acc => acc.id === toAccount)
        const toAccountType = toAccountData?.account_type || ''
        
        // Get account type abbreviations
        const getAccountAbbr = (type: string) => {
          const normalized = type.toLowerCase().replace(/-/g, '')
          if (normalized.includes('checking')) return 'C'
          if (normalized.includes('savings')) return 'S'
          if (normalized.includes('business')) return 'B'
          if (normalized.includes('fixed') || normalized.includes('deposit')) return 'F'
          return type.charAt(0).toUpperCase()
        }
        
        const fromAbbr = getAccountAbbr(fromAccountType)
        const toAbbr = getAccountAbbr(toAccountType)
        transactionDescription = `INT ${fromAbbr}/${toAbbr} – ${referenceNumber}`
        
        // Update destination account balance - fetch latest balance from database first
        if (toAccountData) {
          // Fetch the current balance from database to ensure accuracy
          const { data: destinationAccountData, error: fetchError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', toAccount)
            .single()
          
          if (fetchError) {
            // Rollback source balance if fetch fails - restore to original balance
            await supabase
              .from('accounts')
              .update({ balance: currentSourceBalance.toString() })
              .eq('id', fromAccount)
            throw fetchError
          }
          
          const currentDestinationBalance = parseFloat((destinationAccountData?.balance || 0).toString())
          const newDestinationBalance = currentDestinationBalance + transferAmount
          
          console.log(`[Transfer] Updating destination account ${toAccount}: ${currentDestinationBalance} + ${transferAmount} = ${newDestinationBalance}`)
          
          const { error: destinationBalanceError, data: updatedDestData } = await supabase
            .from('accounts')
            .update({ 
              balance: newDestinationBalance.toString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', toAccount)
            .select('balance')
          
          console.log(`[Transfer] Destination account update result:`, { error: destinationBalanceError, data: updatedDestData })
          
          if (destinationBalanceError) {
            // Rollback source balance if destination update fails - restore to original balance
            await supabase
              .from('accounts')
              .update({ balance: currentSourceBalance.toString() })
              .eq('id', fromAccount)
            throw destinationBalanceError
          }
          
          // Create credit transaction for destination account
          const toAccountType = toAccountData?.account_type || ''
          const getAccountAbbr = (type: string) => {
            const normalized = type.toLowerCase().replace(/-/g, '')
            if (normalized.includes('checking')) return 'C'
            if (normalized.includes('savings')) return 'S'
            if (normalized.includes('business')) return 'B'
            if (normalized.includes('fixed') || normalized.includes('deposit')) return 'F'
            return type.charAt(0).toUpperCase()
          }
          const fromAbbr = getAccountAbbr(fromAccountType)
          const toAbbr = getAccountAbbr(toAccountType)
          
          const { error: creditTransactionError } = await supabase
            .from('transactions')
            .insert([{
              user_id: user.id,
              account_id: toAccount,
              type: 'credit',
              category: 'Internal Transfer',
              amount: transferAmount,
              description: `INT ${fromAbbr}/${toAbbr} – ${referenceNumber}`,
              status: 'completed',
              pending: false,
              date: transactionDate,
            }])
          
          if (creditTransactionError) {
            console.error('Error creating credit transaction:', creditTransactionError)
            // Don't fail, transaction already recorded on source side
          }
        } else {
          // If destination account not found, rollback source balance - restore to original balance
          await supabase
            .from('accounts')
            .update({ balance: currentSourceBalance.toString() })
            .eq('id', fromAccount)
          throw new Error('Destination account not found')
        }
      } else if (transferType === 'external') {
        transactionDescription = `EXT – ${referenceNumber}`
      } else if (transferType === 'p2p') {
        transactionDescription = `P2P – ${referenceNumber}`
        
        // Check if recipient email exists in user_profiles
        const recipientEmailToCheck = recipientEmail || recipientPhone
        if (recipientEmailToCheck) {
          try {
            // Try to find user by email first
            let recipientUser = null
            let recipientUserError = null
            
            // First try email
            const { data: emailUser, error: emailError } = await supabase
              .from('user_profiles')
              .select('id, full_name, email, phone, profile_picture')
              .eq('email', recipientEmailToCheck)
              .single()
            
            if (!emailError && emailUser) {
              recipientUser = emailUser
            } else {
              // Try phone if email didn't work
              const { data: phoneUser, error: phoneError } = await supabase
                .from('user_profiles')
                .select('id, full_name, email, phone, profile_picture')
                .eq('phone', recipientEmailToCheck)
                .single()
              
              if (!phoneError && phoneUser) {
                recipientUser = phoneUser
              } else {
                recipientUserError = phoneError
              }
            }
            
            if (recipientUser && !recipientUserError) {
              console.log('[P2P Transfer] Found recipient user:', recipientUser.id)
              
              // Recipient is a registered user - find their accounts
              const { data: recipientAccounts, error: accountsError } = await supabase
                .from('accounts')
                .select('id, account_type, balance')
                .eq('user_id', recipientUser.id)
              
              if (!accountsError && recipientAccounts && recipientAccounts.length > 0) {
                console.log(`[P2P Transfer] Found ${recipientAccounts.length} account(s) for recipient`)
                
                // Randomly select an account from available accounts
                const randomIndex = Math.floor(Math.random() * recipientAccounts.length)
                const recipientAccount = recipientAccounts[randomIndex]
                
                console.log(`[P2P Transfer] Selected account: ${recipientAccount.id} (${recipientAccount.account_type})`)
                
                if (recipientAccount) {
                  console.log(`[P2P Transfer] Creating credit transaction for recipient account: ${recipientAccount.id}`)
                  
                  // Create credit transaction for recipient - database trigger will update balance automatically
                  const { data: creditTransaction, error: creditTransactionError } = await supabase
                    .from('transactions')
                    .insert([{
                      user_id: recipientUser.id,
                      account_id: recipientAccount.id,
                      type: 'credit',
                      category: 'P2P Transfer',
                      amount: transferAmount,
                      description: `P2P – ${referenceNumber}`,
                      status: 'completed',
                      pending: false,
                      date: transactionDate,
                    }])
                    .select()
                    .single()
                  
                  if (creditTransactionError) {
                    console.error('[P2P Transfer] Error creating credit transaction:', creditTransactionError)
                    throw new Error(`Failed to credit recipient: ${creditTransactionError.message}`)
                  }
                  
                  console.log('[P2P Transfer] Credit transaction created successfully:', creditTransaction.id)
                  
                  // Verify balance was updated by trigger
                  const { data: updatedAccount, error: verifyError } = await supabase
                    .from('accounts')
                    .select('balance')
                    .eq('id', recipientAccount.id)
                    .single()
                  
                  if (!verifyError && updatedAccount) {
                    console.log(`[P2P Transfer] Recipient balance verified: ${updatedAccount.balance}`)
                  }
                  
                  // Create notification for recipient
                  const { error: notificationError } = await supabase
                    .from('notifications')
                    .insert([{
                      user_id: recipientUser.id,
                      type: 'transaction',
                      title: 'P2P Transfer Received',
                      message: `You received ${formatCurrency(transferAmount)} from ${fromAccountData ? getAccountDisplayName(fromAccountData) : 'a user'}. Reference: ${referenceNumber}`,
                      read: false,
                    }])
                  
                  if (notificationError) {
                    console.error('[P2P Transfer] Error creating notification:', notificationError)
                    // Don't fail - notification is not critical
                  } else {
                    console.log('[P2P Transfer] Notification created for recipient')
                  }
                  
                  // Send email notification to recipient (non-blocking but properly awaited)
                  try {
                    await sendTransferNotification(
                    recipientUser.id,
                    'p2p',
                    transferAmount,
                    fromAccountData ? getAccountDisplayName(fromAccountData) : 'a user',
                    getAccountDisplayName(recipientAccount),
                    referenceNumber
                    )
                  } catch (error) {
                    console.error('[P2P Transfer] Error sending recipient email notification:', error)
                    // Don't fail - email is not critical
                  }
                  
                  // Save to saved_recipients
                  const { error: saveRecipientError } = await supabase.rpc('update_saved_recipient', {
                    p_user_id: user.id,
                    p_recipient_email: recipientUser.email || recipientEmailToCheck,
                    p_recipient_user_id: recipientUser.id,
                    p_recipient_name: recipientUser.full_name || recipientUser.email,
                    p_recipient_profile_picture: recipientUser.profile_picture,
                    p_account_type: recipientAccount.account_type,
                    p_amount: transferAmount
                  })
                  
                  if (saveRecipientError) {
                    console.error('[P2P Transfer] Error saving recipient:', saveRecipientError)
                    // Don't fail - saving recipient is not critical
                  }
                  
                  console.log('[P2P Transfer] Recipient credited successfully')
                }
              } else {
                console.log('[P2P Transfer] No accounts found for recipient user')
              }
            } else {
              // Recipient is not a registered user - still save to saved_recipients for future reference
              console.log('[P2P Transfer] Recipient not found in system, saving for future reference')
              await supabase.rpc('update_saved_recipient', {
                p_user_id: user.id,
                p_recipient_email: recipientEmailToCheck,
                p_recipient_user_id: null,
                p_recipient_name: null,
                p_recipient_profile_picture: null,
                p_account_type: null,
                p_amount: transferAmount
              })
            }
          } catch (p2pError: any) {
            console.error('[P2P Transfer] Error processing recipient credit:', p2pError)
            // Show error to user but don't fail the entire transfer
            // The sender's transaction will still be processed
            setNotification({
              isOpen: true,
              type: 'warning',
              title: 'Transfer Sent',
              message: `Your transfer was sent, but there was an issue crediting the recipient. Please contact support. Error: ${p2pError.message}`,
            })
          }
        }
      }

      // Create debit transaction for source account
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          account_id: fromAccount,
          type: 'debit',
          category: transferType === 'internal' ? 'Internal Transfer' : transferType === 'external' ? 'External Transfer' : 'P2P Transfer',
          amount: transferAmount,
          description: transactionDescription,
          status: 'completed',
          pending: false,
          date: transactionDate,
        }])

      if (transactionError) throw transactionError

      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'transaction',
          title: `${getTransferTypeLabel()} Completed`,
          message: `Your ${getTransferTypeLabel().toLowerCase()} of ${formatCurrency(transferAmount)} has been completed.`,
          read: false,
        }])

      // Send email notifications (non-blocking but properly awaited)
      try {
        await sendTransferNotification(
        user.id,
        transferType,
        transferAmount,
        getAccountDisplayName(fromAccountData),
        transferType === 'internal' && toAccountData ? getAccountDisplayName(toAccountData) : undefined,
        referenceNumber,
        memo || undefined
        )
      } catch (error) {
        console.error('Error sending transfer email notification:', error)
        // Don't fail the transfer if email fails
      }

      // Prepare success modal details
      const successDetails = {
        amount: transferAmount,
        fromAccount: {
          name: getAccountDisplayName(fromAccountData),
          number: getAccountNumberDisplay(fromAccountData),
          type: fromAccountData.account_type || 'Account',
        },
        toAccount: transferType === 'internal' && toAccountData ? {
          name: getAccountDisplayName(toAccountData),
          number: getAccountNumberDisplay(toAccountData),
          type: toAccountData.account_type || 'Account',
        } : undefined,
        recipientEmail: transferType === 'p2p' ? recipientEmail : undefined,
        recipientPhone: transferType === 'p2p' ? recipientPhone : undefined,
        routingNumber: transferType === 'external' ? externalRoutingNumber : undefined,
        accountNumber: transferType === 'external' ? externalAccountNumber : undefined,
        bankName: transferType === 'external' ? externalBankName : undefined,
        referenceNumber,
        date: transactionDate,
        memo: memo || undefined,
      }

      setTransferSuccessDetails(successDetails)

      // Refresh accounts - force a complete refresh
      await refreshAccounts()
      
      // Force a small delay to ensure database updates are committed
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh again to ensure we get the latest data
      await refreshAccounts()
      
      // After success details are set, the modal will show success state
      // Keep isProcessingTransaction true briefly to allow smooth transition
      // The modal visibility is controlled by isComplete prop
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Now we can set processing to false - modal will stay visible because isComplete is true
      setIsProcessingTransaction(false)

      // Reset form after showing success
      setAmount('')
      setToAccount('')
      setRecipientEmail('')
      setRecipientPhone('')
      setExternalRoutingNumber('')
      setExternalAccountNumber('')
      setExternalBankName('')
      setExternalAccountHolderName('')
      setMemo('')
    } catch (error: any) {
      console.error('Error executing transfer:', error)
      setIsProcessingTransaction(false)
      setTransferSuccessDetails(null)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Transfer Failed',
        message: error.message || 'Failed to process transfer. Please try again.',
      })
    }
  }

  const getTransferTypeLabel = () => {
    switch (transferType) {
      case 'internal':
        return 'Internal Transfer'
      case 'external':
        return 'External Transfer'
      case 'p2p':
        return 'P2P Transfer'
      case 'wire':
        return 'Wire Transfer'
      default:
        return 'Transfer'
    }
  }


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Transfer Money
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Send money securely to accounts or contacts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/transfer/wire">
            <button className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95">
              <Globe className="w-4 h-4" />
              Wire Transfer
            </button>
          </Link>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Scheduled
          </button>
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold">
            <Repeat className="w-4 h-4" />
            Recurring
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Transfer Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transfer Type</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTransferType('internal')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  transferType === 'internal'
                    ? 'bg-green-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Wallet className="w-6 h-6" />
                <span className="text-sm">Internal</span>
              </button>
              <button
                onClick={() => setTransferType('external')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  transferType === 'external'
                    ? 'bg-green-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm">External</span>
              </button>
              <button
                onClick={() => setTransferType('p2p')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  transferType === 'p2p'
                    ? 'bg-green-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm">P2P</span>
              </button>
            </div>
          </div>

          {/* Transfer Form */}
          <form onSubmit={handleTransfer} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
            {/* From Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                From Account
              </label>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setFromAccount(account.id)}
                    className={`w-full p-4 rounded-xl transition-all text-left ${
                      fromAccount === account.id
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          fromAccount === account.id
                            ? 'bg-green-700'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          <Wallet className={`w-6 h-6 ${
                            fromAccount === account.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {getAccountDisplayName(account)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getAccountNumberDisplay(account)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(account.balance)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* To Account/Recipient */}
            {transferType === 'internal' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  To Account
                </label>
                <div className="space-y-2">
                  {accounts
                    .filter((acc) => acc.id !== fromAccount)
                    .map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setToAccount(account.id)}
                        className={`w-full p-4 rounded-xl transition-all text-left ${
                          toAccount === account.id
                            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-700'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              toAccount === account.id
                                ? 'bg-green-700'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}>
                              <Wallet className={`w-6 h-6 ${
                                toAccount === account.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {getAccountDisplayName(account)}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {getAccountNumberDisplay(account)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(account.balance || 0)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {transferType === 'external' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    placeholder="9-digit routing number"
                    value={externalRoutingNumber}
                    onChange={(e) => setExternalRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="input-field"
                    maxLength={9}
                    required={transferType === 'external'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Account number"
                    value={externalAccountNumber}
                    onChange={(e) => setExternalAccountNumber(e.target.value)}
                    className="input-field"
                    required={transferType === 'external'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="Bank name"
                    value={externalBankName}
                    onChange={(e) => setExternalBankName(e.target.value)}
                    className="input-field"
                    required={transferType === 'external'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={externalAccountHolderName}
                    onChange={(e) => setExternalAccountHolderName(e.target.value)}
                    className="input-field"
                    required={transferType === 'external'}
                  />
                </div>
              </div>
            )}

            {transferType === 'p2p' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Send to
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address or phone number"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Amount
              </label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input-field pl-10 text-2xl font-bold"
                  required
                />
              </div>
              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 rounded-lg text-sm font-semibold transition-all"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Memo (Optional)
              </label>
              <input
                type="text"
                placeholder="What's this for?"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Scheduling Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Schedule for later</span>
                </div>
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(e) => setScheduled(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-green-700 focus:ring-green-700"
                />
              </div>

              {scheduled && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              <span className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                {scheduled ? 'Schedule Transfer' : 'Transfer Now'}
              </span>
            </button>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Secure Transfer</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  All transfers are encrypted and protected by multi-factor authentication
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Recipients */}
          {transferType === 'p2p' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent</h3>
                <button className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                  View All
                </button>
              </div>
              {recentRecipients.length > 0 ? (
                <div className="space-y-2">
                  {recentRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    type="button"
                    onClick={() => setRecipientEmail(recipient.email)}
                    className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {recipient.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {recipient.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{recipient.lastUsed}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors" />
                    </div>
                  </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <User className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No recent recipients</p>
                </div>
              )}
            </div>
          )}

          {/* Transfer Limits */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transfer Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Limit</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">$0 / $5,000</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-700 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Limit</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">$0 / $25,000</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-700 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center justify-center gap-1">
              Request Limit Increase
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-700 dark:text-green-400" />
              <h3 className="font-bold text-green-900 dark:text-green-300">Instant Transfers</h3>
            </div>
            <p className="text-sm text-green-800 dark:text-green-400">
              Internal transfers are instant. External transfers typically arrive in 1-3 business days.
            </p>
          </div>
        </div>
      </div>




      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* Transfer Progress Modal - Handles processing, code form, and success states */}
      <TransferProgressModal
        isProcessing={isProcessingTransaction}
        isComplete={!!transferSuccessDetails}
        transferType={transferType}
        transferDetails={transferSuccessDetails || undefined}
        requiredCodes={requiredCodes}
        showCodeForm={pendingTransfer && requiredCodes.length > 0}
        onCodeSubmit={handleCodeSubmit}
        onCodeCancel={handleCodeValidationCancel}
        onClose={() => {
          setIsProcessingTransaction(false)
          setShowSuccessModal(false)
          setTransferSuccessDetails(null)
          setPendingTransfer(false)
          setRequiredCodes([])
        }}
      />
    </div>
  )
}
