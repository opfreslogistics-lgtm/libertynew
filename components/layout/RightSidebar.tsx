'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatDate, generateReferenceNumber } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  Zap,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowUpRight,
  Phone,
  MessageSquare,
  HelpCircle,
  Target,
  PiggyBank,
  Shield,
  Award,
  Sparkles,
  ChevronRight,
  X,
  User,
  Receipt,
  CheckCircle,
  Send,
  Loader2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function RightSidebar() {
  const router = useRouter()
  const [showQuickPay, setShowQuickPay] = useState(false)
  const { profile } = useUserProfile()
  const { notifications: dbNotifications, loading: notificationsLoading, unreadCount, refreshNotifications, markAsRead } = useNotifications()

  // Get credit score from user profile
  const creditScore = profile?.credit_score || 0
  
  // Calculate credit score percentage (0-850 scale)
  const creditScorePercentage = creditScore > 0 ? Math.min((creditScore / 850) * 100, 100) : 0
  
  // Get credit score rating
  const getCreditScoreRating = (score: number) => {
    if (score >= 800) return { text: 'Excellent', color: 'text-green-400' }
    if (score >= 740) return { text: 'Very Good', color: 'text-green-400' }
    if (score >= 670) return { text: 'Good', color: 'text-yellow-400' }
    if (score >= 580) return { text: 'Fair', color: 'text-orange-400' }
    return { text: 'Poor', color: 'text-red-400' }
  }
  
  const creditRating = creditScore > 0 ? getCreditScoreRating(creditScore) : null

  // Format notification time helper function
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(date)
  }

  // Format notifications for display - Show only latest 2 notifications
  const displayNotifications = useMemo(() => {
    // Get only the latest 2 notifications
    const latestNotifications = dbNotifications.slice(0, 2)
    
    return latestNotifications.map(notif => {
    // Determine icon based on notification type
    let Icon = Bell
    let type: 'success' | 'warning' | 'info' = 'info'
    
    if (notif.type === 'transaction') {
      Icon = DollarSign
      type = 'success'
    } else if (notif.type === 'account_update') {
      Icon = Shield
      type = 'info'
    } else if (notif.type === 'kyc_status' || notif.type === 'loan_status' || notif.type === 'deposit_status') {
      Icon = CheckCircle2
      type = 'success'
    } else if (notif.type === 'admin_action') {
      Icon = AlertCircle
      type = 'warning'
    }

    // Format time
    const timeAgo = formatNotificationTime(notif.created_at)

    return {
      id: notif.id,
      type,
      icon: Icon,
      title: notif.title,
      message: notif.message,
      time: timeAgo,
      read: notif.read,
    }
    })
  }, [dbNotifications])

  const notifications = displayNotifications

  // Real-time updates are handled by the useNotifications hook
  // No need for periodic refresh since we have real-time subscriptions

  // Bills state - Static, no loading
  const [bills] = useState<Array<{
    id: string
    bill_name: string
    amount: number
    due_date: string
    bill_logo_url: string | null
    description: string | null
    status: string
  }>>([])
  const [showBillsModal, setShowBillsModal] = useState(false)
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<string | null>(null)
  const [payingBillId, setPayingBillId] = useState<string | null>(null)

  // Upcoming bills - Show 2 latest
  const upcomingBills = useMemo(() => {
    return bills.slice(0, 2).map(bill => {
      const dueDate = new Date(bill.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        id: bill.id,
        name: bill.bill_name,
        amount: parseFloat(bill.amount.toString()),
        dueDate: formatDate(dueDate),
        daysLeft,
        urgent: daysLeft <= 3 && daysLeft >= 0,
        logo: bill.bill_logo_url,
        description: bill.description,
      }
    })
  }, [bills])

  // Saved recipients for P2P transfers - Static, no loading
  const [savedRecipients] = useState<Array<{
    id: string
    recipient_email: string
    recipient_name: string | null
    recipient_profile_picture: string | null
    last_account_type: string | null
    last_transferred_at: string | null
    total_transactions: number
    total_amount: number
  }>>([])
  const [showQuickTransferModal, setShowQuickTransferModal] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string
    email: string
    name: string | null
    profile_picture: string | null
    last_account_type: string | null
  } | null>(null)
  const [quickTransferAmount, setQuickTransferAmount] = useState('')
  const [quickTransferFromAccount, setQuickTransferFromAccount] = useState('')
  const [quickTransferProcessing, setQuickTransferProcessing] = useState(false)
  
  // Get accounts once, no loading state
  const { accounts } = useAccounts()

  const handleQuickTransfer = async () => {
    if (!selectedRecipient || !quickTransferAmount || !quickTransferFromAccount) {
      return
    }

    setQuickTransferProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const transferAmount = parseFloat(quickTransferAmount)
      const fromAccountData = accounts.find(acc => acc.id === quickTransferFromAccount)
      
      if (!fromAccountData || parseFloat(fromAccountData.balance.toString()) < transferAmount) {
        throw new Error('Insufficient balance')
      }

      // Generate reference number
      const referenceNumber = `REF${Math.floor(100000 + Math.random() * 900000)}`
      const transactionDate = new Date().toISOString()

      // Fetch latest source account balance
      const { data: sourceAccountData, error: sourceFetchError } = await supabase
        .from('accounts')
        .select('balance, account_type')
        .eq('id', quickTransferFromAccount)
        .single()
      
      if (sourceFetchError) throw sourceFetchError
      
      const currentSourceBalance = parseFloat((sourceAccountData?.balance || 0).toString())
      const newSourceBalance = currentSourceBalance - transferAmount

      // Update source account balance
      const { error: balanceError } = await supabase
        .from('accounts')
        .update({ 
          balance: newSourceBalance.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', quickTransferFromAccount)
      
      if (balanceError) throw balanceError

      // Check if recipient is a registered user
      let recipientUser = null
      
      // Try email first
      const { data: emailUser, error: emailError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, phone, profile_picture')
        .eq('email', selectedRecipient.email)
        .single()
      
      if (!emailError && emailUser) {
        recipientUser = emailUser
      } else {
        // Try phone if email didn't work
        const { data: phoneUser, error: phoneError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, phone, profile_picture')
          .eq('phone', selectedRecipient.email)
          .single()
        
        if (!phoneError && phoneUser) {
          recipientUser = phoneUser
        }
      }
      
      if (recipientUser) {
        console.log('[Quick Transfer] Found recipient user:', recipientUser.id)
        
        // Find recipient accounts - randomly select one
        const { data: recipientAccounts, error: accountsError } = await supabase
          .from('accounts')
          .select('id, account_type, balance')
          .eq('user_id', recipientUser.id)
        
        if (!accountsError && recipientAccounts && recipientAccounts.length > 0) {
          console.log(`[Quick Transfer] Found ${recipientAccounts.length} account(s) for recipient`)
          
          // Randomly select an account from available accounts
          const randomIndex = Math.floor(Math.random() * recipientAccounts.length)
          const recipientAccount = recipientAccounts[randomIndex]
          
          console.log(`[Quick Transfer] Selected account: ${recipientAccount.id} (${recipientAccount.account_type})`)
          
          if (recipientAccount) {
            console.log(`[Quick Transfer] Creating credit transaction for recipient account: ${recipientAccount.id}`)
            
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
              console.error('[Quick Transfer] Error creating credit transaction:', creditTransactionError)
              throw new Error(`Failed to credit recipient: ${creditTransactionError.message}`)
            }
            
            console.log('[Quick Transfer] Credit transaction created successfully:', creditTransaction.id)
            
            // Verify balance was updated by trigger
            const { data: updatedAccount, error: verifyError } = await supabase
              .from('accounts')
              .select('balance')
              .eq('id', recipientAccount.id)
              .single()
            
            if (!verifyError && updatedAccount) {
              console.log(`[Quick Transfer] Recipient balance verified: ${updatedAccount.balance}`)
            }
            
            // Create notification for recipient
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert([{
                user_id: recipientUser.id,
                type: 'transaction',
                title: 'P2P Transfer Received',
                message: `You received ${formatCurrency(transferAmount)} from ${fromAccountData ? (fromAccountData.account_type || 'Account') : 'a user'}. Reference: ${referenceNumber}`,
                read: false,
              }])
            
            if (notificationError) {
              console.error('[Quick Transfer] Error creating notification:', notificationError)
              // Don't fail - notification is not critical
            } else {
              console.log('[Quick Transfer] Notification created for recipient')
            }
            
            // Send email notification to recipient (non-blocking)
            const { sendTransferNotification } = await import('@/lib/utils/emailNotifications')
            const fromAccountDisplay = fromAccountData ? `${fromAccountData.account_type?.charAt(0).toUpperCase() + fromAccountData.account_type?.slice(1)} Account` : 'Account'
            const recipientAccountDisplay = `${recipientAccount.account_type?.charAt(0).toUpperCase() + recipientAccount.account_type?.slice(1)} Account`
            
            sendTransferNotification(
              recipientUser.id,
              'p2p',
              transferAmount,
              fromAccountDisplay,
              recipientAccountDisplay,
              referenceNumber
            ).catch(error => {
              console.error('[Quick Transfer] Error sending recipient email notification:', error)
              // Don't fail - email is not critical
            })
            
            // Update saved recipient
            const { error: saveRecipientError } = await supabase.rpc('update_saved_recipient', {
              p_user_id: user.id,
              p_recipient_email: recipientUser.email || selectedRecipient.email,
              p_recipient_user_id: recipientUser.id,
              p_recipient_name: recipientUser.full_name || recipientUser.email,
              p_recipient_profile_picture: recipientUser.profile_picture,
              p_account_type: recipientAccount.account_type,
              p_amount: transferAmount
            })
            
            if (saveRecipientError) {
              console.error('[Quick Transfer] Error saving recipient:', saveRecipientError)
              // Don't fail - saving recipient is not critical
            }
            
            console.log('[Quick Transfer] Recipient credited successfully')
          }
        }
      }

      // Create debit transaction for source account
      await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          account_id: quickTransferFromAccount,
          type: 'debit',
          category: 'P2P Transfer',
          amount: transferAmount,
          description: `P2P – ${referenceNumber}`,
          status: 'completed',
          pending: false,
          date: transactionDate,
        }])
      
      // Create notification for sender
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'transaction',
          title: 'P2P Transfer Completed',
          message: `Your P2P transfer of ${formatCurrency(transferAmount)} to ${selectedRecipient.name || selectedRecipient.email} has been completed. Reference: ${referenceNumber}`,
          read: false,
        }])

      // Send email notifications (non-blocking)
      const { sendTransferNotification } = await import('@/lib/utils/emailNotifications')
      const fromAccountDisplay = fromAccountData ? `${fromAccountData.account_type?.charAt(0).toUpperCase() + fromAccountData.account_type?.slice(1)} Account` : 'Account'
      
      sendTransferNotification(
        user.id,
        'p2p',
        transferAmount,
        fromAccountDisplay,
        selectedRecipient.name || selectedRecipient.email,
        referenceNumber
      ).catch(error => {
        console.error('Error sending quick transfer email notification:', error)
        // Don't fail the transfer if email fails
      })

      // Close modal and reset
      setShowQuickTransferModal(false)
      setSelectedRecipient(null)
      setQuickTransferAmount('')
      setQuickTransferFromAccount('')
      
      // Refresh notifications only
      refreshNotifications()
    } catch (error: any) {
      console.error('Error processing quick transfer:', error)
      // Error will be handled by the form's error state
      console.error('Transfer error:', error)
    } finally {
      setQuickTransferProcessing(false)
    }
  }

  // Financial tips - Empty for new users
  const tips: Array<{ icon: any; title: string; message: string }> = []

  return (
    <aside className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:top-16 xl:bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm overflow-y-auto">
      <div className="flex-1 flex flex-col p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Activity Center</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Stay updated with your finances</p>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5" />
            <h3 className="font-semibold">Financial Health</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Credit Score</span>
              <span className="text-xl font-bold">
                {creditScore > 0 ? creditScore : '--'}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: `${creditScorePercentage}%` }} 
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Info className="w-3 h-3" />
              <span>
                {creditScore > 0 && creditRating ? creditRating.text : 'No data available yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          {notificationsLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mb-2 opacity-50 animate-pulse" />
              <p className="text-xs">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notif) => {
              const Icon = notif.icon
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer group ${
                    !notif.read ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                  onClick={() => {
                    // Mark as read when clicked
                    if (!notif.read) {
                      markAsRead(notif.id)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      notif.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        notif.type === 'success' ? 'text-green-600 dark:text-green-400' :
                        notif.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{notif.time}</p>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No notifications</p>
            </div>
          )}
        </div>

        {/* Upcoming Bills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Bills
            </h3>
            {bills.length > 2 && (
              <button
                onClick={() => router.push('/budget')}
                className="text-xs text-green-700 hover:text-green-800 dark:text-green-400 font-semibold"
              >
                View More
              </button>
            )}
          </div>
          {upcomingBills.length > 0 ? (
            <div className="space-y-2">
              {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-700 dark:hover:border-green-700 transition-all cursor-pointer"
                onClick={() => router.push('/budget')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {bill.logo ? (
                      <img
                        src={bill.logo}
                        alt={bill.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{bill.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due {bill.dueDate}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</p>
                </div>
                {bill.urgent && (
                  <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">{bill.daysLeft} days left</span>
                  </div>
                )}
              </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No upcoming bills</p>
            </div>
          )}
        </div>

        {/* Quick Transfer - Saved Recipients */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Transfer
          </h3>
          {savedRecipients.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {savedRecipients.slice(0, 4).map((recipient) => (
                <button
                  key={recipient.id}
                  onClick={() => {
                    setSelectedRecipient({
                      id: recipient.id,
                      email: recipient.recipient_email,
                      name: recipient.recipient_name,
                      profile_picture: recipient.recipient_profile_picture,
                      last_account_type: recipient.last_account_type,
                    })
                    setShowQuickTransferModal(true)
                    if (accounts.length > 0) {
                      const checkingAccount = accounts.find(a => a.account_type === 'checking')
                      setQuickTransferFromAccount(checkingAccount?.id || accounts[0].id)
                    }
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-700 border border-transparent transition-all group"
                >
                  {recipient.recipient_profile_picture ? (
                    <img
                      src={recipient.recipient_profile_picture}
                      alt={recipient.recipient_name || recipient.recipient_email}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-green-700 transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {(recipient.recipient_name || recipient.recipient_email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-gray-900 dark:text-white font-medium truncate w-full text-center">
                    {recipient.recipient_name ? recipient.recipient_name.split(' ')[0] : recipient.recipient_email.split('@')[0]}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400 mb-3">
              <User className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No saved recipients</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Send a P2P transfer to save contacts</p>
            </div>
          )}
          <Link href="/transfer">
            <button className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold text-sm transition-all">
              Send Money
            </button>
          </Link>
        </div>

        {/* Financial Tips */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Smart Tips
          </h3>
          {tips.length > 0 ? (
            <div className="space-y-2">
              {tips.map((tip, idx) => {
              const Icon = tip.icon
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex gap-3">
                    <Icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{tip.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{tip.message}</p>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Sparkles className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No tips available</p>
            </div>
          )}
        </div>

        {/* Quick Support */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h3>
          <div className="space-y-2">
            <Link href="/support">
              <button className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all flex items-center gap-3 text-left">
                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Live Chat</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get instant help</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </Link>
            <button className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all flex items-center gap-3 text-left">
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Call Us</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1-800-LIBERTY</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bills Modal */}
      {showBillsModal && (
        <BillsPaymentModal
          bills={bills}
          selectedBillId={selectedBillForPayment}
          onClose={() => {
            setShowBillsModal(false)
            setSelectedBillForPayment(null)
          }}
          onPaymentSuccess={() => {
            // Only refresh notifications
            refreshNotifications()
          }}
        />
      )}

      {/* Quick Transfer Modal */}
      {showQuickTransferModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedRecipient.profile_picture ? (
                  <img
                    src={selectedRecipient.profile_picture}
                    alt={selectedRecipient.name || selectedRecipient.email}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-700"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center text-white font-bold">
                    {(selectedRecipient.name || selectedRecipient.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedRecipient.name || selectedRecipient.email}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRecipient.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQuickTransferModal(false)
                  setSelectedRecipient(null)
                  setQuickTransferAmount('')
                  setQuickTransferFromAccount('')
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* From Account */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  From Account
                </label>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setQuickTransferFromAccount(account.id)}
                      className={`w-full p-3 rounded-xl transition-all text-left ${
                        quickTransferFromAccount === account.id
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-700'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {account.account_type ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1) : 'Account'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(account.balance)} available
                          </p>
                        </div>
                        {quickTransferFromAccount === account.id && (
                          <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quickTransferAmount}
                    onChange={(e) => setQuickTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 text-xl font-bold bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-700 focus:ring-2 focus:ring-green-700/20 outline-none transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[50, 100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuickTransferAmount(amt.toString())}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 rounded-lg text-sm font-semibold transition-all"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleQuickTransfer}
                disabled={!quickTransferAmount || !quickTransferFromAccount || quickTransferProcessing || parseFloat(quickTransferAmount) <= 0}
                className="w-full py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {quickTransferProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send {quickTransferAmount ? formatCurrency(parseFloat(quickTransferAmount)) : '$0.00'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

// Bills Payment Modal Component
function BillsPaymentModal({
  bills,
  selectedBillId,
  onClose,
  onPaymentSuccess,
}: {
  bills: Array<{
    id: string
    bill_name: string
    amount: number
    due_date: string
    bill_logo_url: string | null
    description: string | null
    status: string
  }>
  selectedBillId: string | null
  onClose: () => void
  onPaymentSuccess: () => void
}) {
  const { accounts } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [payingBillId, setPayingBillId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      const checkingAccount = accounts.find(a => a.account_type === 'checking')
      if (checkingAccount) {
        setSelectedAccountId(checkingAccount.id)
      } else {
        setSelectedAccountId(accounts[0].id)
      }
    }
  }, [accounts, selectedAccountId])

  const handlePayBill = async (billId: string) => {
    if (!selectedAccountId) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Warning',
        message: 'Please select an account to pay from',
      })
      return
    }

    const bill = bills.find(b => b.id === billId)
    if (!bill) return

    const selectedAccount = accounts.find(a => a.id === selectedAccountId)
    if (!selectedAccount) return

    const billAmount = parseFloat(bill.amount.toString())
    const accountBalance = parseFloat(selectedAccount.balance.toString())

    if (accountBalance < billAmount) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Funds',
        message: `Your ${selectedAccount.account_type} account has insufficient balance.`,
      })
      return
    }

    try {
      setPayingBillId(billId)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Generate reference number
      const referenceNumber = generateReferenceNumber()

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: selectedAccountId,
          type: 'debit',
          amount: billAmount,
          description: `BILL – ${referenceNumber}`,
          category: 'bills',
          date: new Date().toISOString(),
          pending: false,
          status: 'completed',
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create bill payment record
      const { error: paymentError } = await supabase
        .from('bill_payments')
        .insert({
          bill_id: billId,
          user_id: user.id,
          account_id: selectedAccountId,
          payment_amount: billAmount,
          payment_method: 'manual',
          transaction_id: transaction.id,
          reference_number: referenceNumber,
        })

      if (paymentError) throw paymentError

      // Update bill status
      const { error: billUpdateError } = await supabase
        .from('bills')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', billId)

      if (billUpdateError) throw billUpdateError

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Payment Successful',
        message: `Bill "${bill.bill_name}" has been paid successfully.`,
      })

      // Send email notifications (non-blocking)
      const { sendBillPaymentNotification } = await import('@/lib/utils/emailNotifications')
      const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
      const accountDisplay = selectedAccount?.account_number 
        ? `****${selectedAccount.account_number.slice(-4)}` 
        : selectedAccount?.last4 
        ? `****${selectedAccount.last4}` 
        : 'Account'
      
      sendBillPaymentNotification(
        user.id,
        bill.bill_name,
        billAmount,
        accountDisplay,
        referenceNumber
      ).catch(error => {
        console.error('Error sending bill payment email notification:', error)
        // Don't fail the payment if email fails
      })

      setTimeout(() => {
        onPaymentSuccess()
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('Error paying bill:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: error.message || 'Failed to process payment. Please try again.',
      })
    } finally {
      setPayingBillId(null)
    }
  }

  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue')

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upcoming Bills
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {pendingBills.length} bill{pendingBills.length !== 1 ? 's' : ''} pending
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {pendingBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold">All bills paid!</p>
                <p className="text-sm">You have no pending bills.</p>
              </div>
            ) : (
              pendingBills.map((bill) => {
                const dueDate = new Date(bill.due_date)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const isOverdue = daysLeft < 0
                const isUrgent = daysLeft <= 3 && daysLeft >= 0
                const billAmount = parseFloat(bill.amount.toString())

                return (
                  <div
                    key={bill.id}
                    className={`p-4 rounded-xl border-2 ${
                      selectedBillId === bill.id
                        ? 'border-green-700 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : isOverdue
                        ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                        : isUrgent
                        ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {bill.bill_logo_url ? (
                        <img
                          src={bill.bill_logo_url}
                          alt={bill.bill_name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                          <Receipt className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {bill.bill_name}
                        </h3>
                        {bill.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {bill.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(billAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
                            <p className={`text-sm font-semibold ${
                              isOverdue ? 'text-red-600 dark:text-red-400' :
                              isUrgent ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-gray-900 dark:text-white'
                            }`}>
                              {formatDate(dueDate)}
                            </p>
                          </div>
                        </div>
                        {isOverdue && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            <span className="font-semibold">Overdue by {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {isUrgent && !isOverdue && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                            <Clock className="w-3 h-3" />
                            <span className="font-semibold">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Account Selection - Enhanced */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-green-600" />
                          Pay From Account
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={payingBillId === bill.id}
                          >
                            {accounts.map((account) => {
                              const balance = parseFloat(account.balance.toString())
                              const accountType = account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
                              const accountNumber = account.account_number || account.last4 ? `****${(account.account_number || account.last4)?.slice(-4)}` : ''
                              return (
                                <option key={account.id} value={account.id}>
                                  {accountType} {accountNumber} - {formatCurrency(balance)}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        {selectedAccountId && (() => {
                          const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
                          const balance = selectedAccount ? parseFloat(selectedAccount.balance.toString()) : 0
                          const hasInsufficientFunds = balance < billAmount
                          return selectedAccount && (
                            <div className={`mt-2 p-3 rounded-lg ${hasInsufficientFunds ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'}`}>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">Available Balance:</span>
                                <span className={`font-bold ${hasInsufficientFunds ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                  {formatCurrency(balance)}
                                </span>
                              </div>
                              {hasInsufficientFunds && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Insufficient funds. Please select another account.
                                </p>
                              )}
                            </div>
                          )
                        })()}
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment Summary</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Bill Amount:</span>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(billAmount)}</span>
                          </div>
                          {selectedAccountId && (() => {
                            const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
                            const balance = selectedAccount ? parseFloat(selectedAccount.balance.toString()) : 0
                            const newBalance = balance - billAmount
                            return (
                              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400">New Balance:</span>
                                <span className={`font-bold ${newBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                  {formatCurrency(newBalance)}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Pay Button */}
                      <button
                        onClick={() => handlePayBill(bill.id)}
                        disabled={(() => {
                          if (payingBillId === bill.id || !selectedAccountId) return true
                          const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
                          if (!selectedAccount) return true
                          return parseFloat(selectedAccount.balance.toString()) < billAmount
                        })()}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:shadow-none"
                      >
                        {payingBillId === bill.id ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Pay {formatCurrency(billAmount)} Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full ${
            notification.type === 'success' ? 'border-2 border-green-500' :
            notification.type === 'error' ? 'border-2 border-red-500' :
            'border-2 border-yellow-500'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              )}
              <h3 className={`text-lg font-bold ${
                notification.type === 'success' ? 'text-green-600 dark:text-green-400' :
                notification.type === 'error' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {notification.title}
              </h3>
            </div>
            <p className="text-gray-900 dark:text-white mb-4">{notification.message}</p>
            <button
              onClick={() => setNotification({ ...notification, isOpen: false })}
              className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}

