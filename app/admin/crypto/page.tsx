'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import NotificationModal from '@/components/NotificationModal'
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  User,
  Bitcoin,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface CryptoTransaction {
  id: string
  user_id: string
  account_id: string | null
  transaction_type: 'crypto_fund' | 'btc_buy' | 'btc_sell'
  reference_number: string
  amount: number
  btc_amount: number
  btc_price: number | null
  status: 'pending' | 'completed' | 'cancelled'
  transaction_id: string | null
  admin_id: string | null
  admin_notes: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  user_name?: string
  user_email?: string
  account_type?: string
  account_number?: string
}

export default function AdminCryptoPage() {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'crypto_fund' | 'btc_buy' | 'btc_sell'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const [selectedTransaction, setSelectedTransaction] = useState<CryptoTransaction | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingTransactionId, setProcessingTransactionId] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState('') // For BTC sell deposits
  const [userAccounts, setUserAccounts] = useState<any[]>([])
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

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Check if user is admin/superadmin
      const { data: adminCheck } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (adminCheck?.role !== 'admin' && adminCheck?.role !== 'superadmin') {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Access Denied',
          message: 'Admin role required to view crypto transactions.',
        })
        setTransactions([])
        setLoading(false)
        return
      }

      // Fetch crypto transactions - only essential fields
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('crypto_transactions')
        .select('id, user_id, account_id, transaction_type, reference_number, amount, btc_amount, btc_price, status, transaction_id, admin_id, admin_notes, processed_at, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error Loading Transactions',
          message: transactionsError.message || 'Failed to fetch crypto transactions.',
        })
        setTransactions([])
        setLoading(false)
        return
      }

      if (!transactionsData || transactionsData.length === 0) {
        setTransactions([])
        setLoading(false)
        return
      }

      // Fetch user and account info in parallel
      const userIds = [...new Set(transactionsData.map(t => t.user_id))]
      const accountIds = [...new Set(transactionsData.map(t => t.account_id).filter(Boolean))]

      const [usersResult, accountsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds),
        accountIds.length > 0
          ? supabase
              .from('accounts')
              .select('id, account_type, account_number')
              .in('id', accountIds)
          : Promise.resolve({ data: [], error: null })
      ])

      const usersData = usersResult.data || []
      const accountsData = accountsResult.data || []

      // Create lookup maps
      const usersMap = new Map(usersData.map(u => [u.id, u]))
      const accountsMap = new Map(accountsData.map(a => [a.id, a]))

      // Transform data
      const transformedTransactions: CryptoTransaction[] = transactionsData.map((txn: any) => {
        const user = usersMap.get(txn.user_id)
        const account = txn.account_id ? accountsMap.get(txn.account_id) : null

        return {
          ...txn,
          amount: parseFloat(txn.amount.toString()),
          btc_amount: parseFloat(txn.btc_amount?.toString() || '0'),
          btc_price: txn.btc_price ? parseFloat(txn.btc_price.toString()) : null,
          user_name: user 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
            : 'Unknown User',
          user_email: user?.email || '',
          account_type: account?.account_type || '',
          account_number: account?.account_number || '',
        }
      })

      setTransactions(transformedTransactions)
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch transactions.',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAccounts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, account_type, account_number, balance, last4')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (error) throw error
      setUserAccounts(data || [])
    } catch (error: any) {
      console.error('Error fetching user accounts:', error)
    }
  }

  const handleApprove = async (transaction: CryptoTransaction) => {
    if (processingTransactionId) {
      console.log('[AdminCrypto] Already processing a transaction')
      return
    }

    console.log('[AdminCrypto] Starting approval for transaction:', {
      id: transaction.id,
      type: transaction.transaction_type,
      reference: transaction.reference_number,
      status: transaction.status,
    })

    setProcessingTransactionId(transaction.id)
    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }
      
      console.log('[AdminCrypto] Admin authenticated:', adminUser.id)

      if (transaction.transaction_type === 'btc_buy') {
        // Approve BTC buy - add BTC to user's balance and update crypto_balance_value_usd
        // First, ensure portfolio exists
        let { data: portfolio, error: portfolioError } = await supabase
          .from('crypto_portfolio')
          .select('crypto_balance, crypto_balance_value_usd')
          .eq('user_id', transaction.user_id)
          .maybeSingle()

        if (portfolioError) {
          console.error('[AdminCrypto] Error fetching portfolio:', portfolioError)
          throw portfolioError
        }

        // Create portfolio if it doesn't exist
        if (!portfolio) {
          console.log('[AdminCrypto] Portfolio does not exist, creating it for user:', transaction.user_id)
          const { data: newPortfolio, error: createError } = await supabase
            .from('crypto_portfolio')
            .insert([
              {
                user_id: transaction.user_id,
                funded_amount: 0.00,
                crypto_balance: 0.00000000,
                crypto_balance_value_usd: 0.00,
              },
            ])
            .select('crypto_balance, crypto_balance_value_usd')
            .single()

          if (createError) {
            console.error('[AdminCrypto] Error creating portfolio:', createError)
            throw new Error(`Failed to create portfolio: ${createError.message}`)
          }

          portfolio = newPortfolio
        }

        // Parse current balances
        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0
          if (typeof value === 'string') return parseFloat(value) || 0
          if (typeof value === 'number') return value
          return 0
        }

        const currentBtcBalance = parseDecimal(portfolio.crypto_balance)
        const currentCryptoBalanceValueUsd = parseDecimal(portfolio.crypto_balance_value_usd)
        
        const btcToAdd = parseDecimal(transaction.btc_amount)
        
        // Calculate purchase price: amount (USD paid) / btc_amount (BTC received)
        // This gives us the effective price per BTC including fees
        // Use stored btc_price if available, otherwise calculate from amount/btc_amount
        let purchasePrice = 0
        if (transaction.btc_price && transaction.btc_price > 0) {
          purchasePrice = transaction.btc_price
        } else if (transaction.btc_amount && transaction.btc_amount > 0) {
          purchasePrice = transaction.amount / transaction.btc_amount
        } else {
          throw new Error('Invalid transaction data: missing btc_price or btc_amount')
        }
        
        const btcValueUsd = btcToAdd * purchasePrice // USD value of BTC at purchase price
        
        console.log('[AdminCrypto] Purchase calculation:', {
          transaction_amount: transaction.amount,
          transaction_btc_amount: transaction.btc_amount,
          transaction_btc_price: transaction.btc_price,
          calculated_purchase_price: purchasePrice,
          btc_to_add: btcToAdd,
          btc_value_usd: btcValueUsd,
        })
        
        // Validate calculations
        if (btcToAdd <= 0) {
          throw new Error('Invalid BTC amount to add')
        }
        if (purchasePrice <= 0) {
          throw new Error('Invalid purchase price')
        }
        
        const newBtcBalance = parseFloat((currentBtcBalance + btcToAdd).toFixed(8))
        const newCryptoBalanceValueUsd = parseFloat((currentCryptoBalanceValueUsd + btcValueUsd).toFixed(2))

        console.log('[AdminCrypto] Updating BTC balance:', {
          user_id: transaction.user_id,
          current_btc_balance: currentBtcBalance,
          current_crypto_balance_value_usd: currentCryptoBalanceValueUsd,
          btc_to_add: btcToAdd,
          purchase_price: purchasePrice,
          btc_value_usd: btcValueUsd,
          new_btc_balance: newBtcBalance,
          new_crypto_balance_value_usd: newCryptoBalanceValueUsd,
        })

        console.log('[AdminCrypto] Attempting to update portfolio:', {
          user_id: transaction.user_id,
          update_data: {
            crypto_balance: newBtcBalance.toString(),
            crypto_balance_value_usd: newCryptoBalanceValueUsd.toString(),
          },
        })

        // Ensure portfolio exists before updating
        const { data: existingPortfolio, error: checkError } = await supabase
          .from('crypto_portfolio')
          .select('id')
          .eq('user_id', transaction.user_id)
          .maybeSingle()

        if (checkError) {
          console.error('[AdminCrypto] Error checking portfolio:', checkError)
          throw new Error(`Failed to check portfolio: ${checkError.message}`)
        }

        // Create portfolio if it doesn't exist
        if (!existingPortfolio) {
          console.log('[AdminCrypto] Portfolio does not exist, creating it for user:', transaction.user_id)
          const { error: createError } = await supabase
            .from('crypto_portfolio')
            .insert([
              {
                user_id: transaction.user_id,
                funded_amount: 0.00,
                crypto_balance: 0.00000000,
                crypto_balance_value_usd: 0.00,
              },
            ])

          if (createError) {
            console.error('[AdminCrypto] Error creating portfolio:', createError)
            throw new Error(`Failed to create portfolio: ${createError.message}`)
          }
        }

        // Now update the portfolio (portfolio is guaranteed to exist at this point)
        const { error: updateError, data: updatedPortfolio } = await supabase
          .from('crypto_portfolio')
          .update({ 
            crypto_balance: newBtcBalance.toString(),
            crypto_balance_value_usd: newCryptoBalanceValueUsd.toString(),
          })
          .eq('user_id', transaction.user_id)
          .select()
          .single()

        if (updateError) {
          console.error('[AdminCrypto] Error updating BTC balance:', {
            error: updateError,
            error_code: updateError.code,
            error_message: updateError.message,
            error_details: updateError.details,
            user_id: transaction.user_id,
          })
          throw new Error(`Failed to update BTC balance: ${updateError.message} (Code: ${updateError.code})`)
        }

        if (!updatedPortfolio) {
          console.error('[AdminCrypto] Portfolio update returned no data')
          throw new Error('Portfolio update returned no data')
        }

        console.log('[AdminCrypto] Portfolio update successful:', {
          updated_portfolio: updatedPortfolio,
          new_crypto_balance: updatedPortfolio.crypto_balance,
          new_crypto_balance_value_usd: updatedPortfolio.crypto_balance_value_usd,
        })

        console.log('[AdminCrypto] BTC balance updated successfully:', {
          user_id: transaction.user_id,
          old_btc_balance: currentBtcBalance,
          old_crypto_balance_value_usd: currentCryptoBalanceValueUsd,
          btc_to_add: btcToAdd,
          new_btc_balance: newBtcBalance,
          new_crypto_balance_value_usd: newCryptoBalanceValueUsd,
          updated_portfolio: updatedPortfolio,
          updated_crypto_balance_raw: updatedPortfolio?.crypto_balance,
          updated_crypto_balance_type: typeof updatedPortfolio?.crypto_balance,
          updated_crypto_balance_value_usd_raw: updatedPortfolio?.crypto_balance_value_usd,
        })

        // Update transaction status
        if (transaction.transaction_id) {
          await supabase
            .from('transactions')
            .update({
              status: 'completed',
              pending: false,
            })
            .eq('id', transaction.transaction_id)
        }

        await supabase
          .from('crypto_transactions')
          .update({
            status: 'completed',
            admin_id: adminUser.id,
            admin_notes: adminNotes || null,
            processed_at: new Date().toISOString(),
          })
          .eq('id', transaction.id)

        // Create notification
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: transaction.user_id,
              type: 'transaction',
              title: 'BTC Purchase Approved',
              message: `Your BTC buy order for ${transaction.btc_amount.toFixed(6)} BTC (${formatCurrency(transaction.amount)}) has been approved. Reference: ${transaction.reference_number}`,
              read: false,
            },
          ])

        // Send email notification
        try {
          const { sendCryptoTransactionNotification } = await import('@/lib/utils/emailNotifications')
          await sendCryptoTransactionNotification(
            transaction.user_id,
            'btc_buy',
            transaction.amount,
            btcToAdd,
            purchasePrice,
            transaction.reference_number
          )
        } catch (emailError) {
          console.error('[AdminCrypto] Error sending email notification:', emailError)
          // Don't fail the approval if email fails
        }

        console.log('[AdminCrypto] Approval completed successfully for buy order:', {
          transaction_id: transaction.id,
          user_id: transaction.user_id,
          btc_added: btcToAdd,
          value_added: btcValueUsd,
          new_btc_balance: newBtcBalance,
          new_crypto_balance_value_usd: newCryptoBalanceValueUsd,
        })

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Buy Order Approved',
          message: `BTC buy order ${transaction.reference_number} has been approved. ${btcToAdd.toFixed(8)} BTC (${formatCurrency(btcValueUsd)}) added to user's balance.`,
        })
        
        // Force refresh transactions list
        await fetchTransactions()
        
        // Clear selection
        setSelectedTransaction(null)
        setAdminNotes('')
        setSelectedAccountId('')
        setUserAccounts([])
      } else if (transaction.transaction_type === 'btc_sell') {
        // Approve BTC sell - convert to USD and deposit to selected account
        if (!selectedAccountId) {
          setNotification({
            isOpen: true,
            type: 'warning',
            title: 'Account Required',
            message: 'Please select an account to deposit the USD amount.',
          })
          setIsProcessing(false)
          setProcessingTransactionId(null)
          return
        }

        const selectedAccount = userAccounts.find(acc => acc.id === selectedAccountId)
        if (!selectedAccount) {
          throw new Error('Selected account not found')
        }

        // Find and delete pending transaction with same reference number
        const { data: pendingTransactions, error: findError } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', transaction.user_id)
          .eq('description', `BTC SELL – ${transaction.reference_number}`)
          .or('pending.eq.true,status.eq.pending')

        if (findError) {
          console.error('Error finding pending transactions:', findError)
        } else if (pendingTransactions && pendingTransactions.length > 0) {
          // Delete all pending transactions with this description
          const transactionIdsToDelete = pendingTransactions.map(t => t.id)
          const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .in('id', transactionIdsToDelete)

          if (deleteError) {
            console.error('Error deleting pending transactions:', deleteError)
            // Continue anyway - we'll create a new transaction
          } else {
            console.log(`Deleted ${pendingTransactions.length} pending transaction(s) for ${transaction.reference_number}`)
          }
        }

        // Add USD to selected account (via transaction)
        const transactionDate = new Date().toISOString()
        const { data: depositTransaction, error: depositError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: transaction.user_id,
              account_id: selectedAccountId,
              type: 'credit',
              category: 'BTC Sell',
              amount: transaction.amount,
              description: `BTC SELL – ${transaction.reference_number}`,
              status: 'completed',
              pending: false,
              date: transactionDate,
            },
          ])
          .select()
          .single()

        if (depositError) throw depositError

        // Update crypto portfolio - reduce BTC balance and crypto_balance_value_usd proportionally
        // First, ensure portfolio exists
        let { data: portfolio, error: portfolioError } = await supabase
          .from('crypto_portfolio')
          .select('crypto_balance, crypto_balance_value_usd')
          .eq('user_id', transaction.user_id)
          .maybeSingle()

        if (portfolioError) throw portfolioError

        // Create portfolio if it doesn't exist
        if (!portfolio) {
          console.log('[AdminCrypto] Portfolio does not exist, creating it for user:', transaction.user_id)
          const { data: newPortfolio, error: createError } = await supabase
            .from('crypto_portfolio')
            .insert([
              {
                user_id: transaction.user_id,
                funded_amount: 0.00,
                crypto_balance: 0.00000000,
                crypto_balance_value_usd: 0.00,
              },
            ])
            .select('crypto_balance, crypto_balance_value_usd')
            .single()

          if (createError) {
            console.error('[AdminCrypto] Error creating portfolio:', createError)
            throw new Error(`Failed to create portfolio: ${createError.message}`)
          }

          portfolio = newPortfolio
        }

        if (portfolio) {
          const parseDecimal = (value: any): number => {
            if (value === null || value === undefined) return 0
            if (typeof value === 'string') return parseFloat(value) || 0
            if (typeof value === 'number') return value
            return 0
          }

          const currentBtcBalance = parseDecimal(portfolio.crypto_balance)
          const currentCryptoBalanceValueUsd = parseDecimal(portfolio.crypto_balance_value_usd)
          const btcToSell = transaction.btc_amount || 0

          // Calculate proportion of BTC being sold
          const proportion = currentBtcBalance > 0 ? btcToSell / currentBtcBalance : 0
          const valueToDeduct = currentCryptoBalanceValueUsd * proportion

          const newBtcBalance = parseFloat((currentBtcBalance - btcToSell).toFixed(8))
          const newCryptoBalanceValueUsd = parseFloat((currentCryptoBalanceValueUsd - valueToDeduct).toFixed(2))

          await supabase
            .from('crypto_portfolio')
            .update({
              crypto_balance: newBtcBalance.toString(),
              crypto_balance_value_usd: newCryptoBalanceValueUsd.toString(),
            })
            .eq('user_id', transaction.user_id)
        }

        // Update crypto transaction
        await supabase
          .from('crypto_transactions')
          .update({
            status: 'completed',
            admin_id: adminUser.id,
            admin_notes: adminNotes || null,
            processed_at: new Date().toISOString(),
            account_id: selectedAccountId,
          })
          .eq('id', transaction.id)

        // Update main transaction
        if (transaction.transaction_id) {
          await supabase
            .from('transactions')
            .update({
              status: 'completed',
              pending: false,
              account_id: selectedAccountId,
            })
            .eq('id', transaction.transaction_id)
        }

        // Create notification
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: transaction.user_id,
              type: 'transaction',
              title: 'BTC Sale Approved',
              message: `Your BTC sell order for ${transaction.btc_amount.toFixed(6)} BTC (${formatCurrency(transaction.amount)}) has been approved and deposited to your ${selectedAccount.account_type} account. Reference: ${transaction.reference_number}`,
              read: false,
            },
          ])

        // Send email notification
        try {
          const { sendCryptoTransactionNotification } = await import('@/lib/utils/emailNotifications')
          const btcPrice = transaction.btc_price || (transaction.amount / transaction.btc_amount)
          await sendCryptoTransactionNotification(
            transaction.user_id,
            'btc_sell',
            transaction.amount,
            transaction.btc_amount,
            btcPrice,
            transaction.reference_number,
            selectedAccount.account_type,
            selectedAccount.account_number || selectedAccount.last4 ? `****${(selectedAccount.account_number || selectedAccount.last4)?.slice(-4)}` : undefined
          )
        } catch (emailError) {
          console.error('[AdminCrypto] Error sending email notification:', emailError)
          // Don't fail the approval if email fails
        }

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Sell Order Approved',
          message: `BTC sell order ${transaction.reference_number} has been approved. ${formatCurrency(transaction.amount)} deposited to user's ${selectedAccount.account_type} account.`,
        })
      }

      setAdminNotes('')
      setSelectedTransaction(null)
      setSelectedAccountId('')
      setUserAccounts([])
      await fetchTransactions()
    } catch (error: any) {
      console.error('Error approving transaction:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve transaction. Please try again.',
      })
    } finally {
      setIsProcessing(false)
      setProcessingTransactionId(null)
    }
  }

  const handleCancel = async (transaction: CryptoTransaction) => {
    if (processingTransactionId) return

    setProcessingTransactionId(transaction.id)
    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      if (transaction.transaction_type === 'btc_buy') {
        // Refund to funded_amount
        // Ensure portfolio exists
        let { data: portfolio, error: portfolioError } = await supabase
          .from('crypto_portfolio')
          .select('funded_amount')
          .eq('user_id', transaction.user_id)
          .maybeSingle()

        if (portfolioError) throw portfolioError

        // Create portfolio if it doesn't exist
        if (!portfolio) {
          const { data: newPortfolio, error: createError } = await supabase
            .from('crypto_portfolio')
            .insert([
              {
                user_id: transaction.user_id,
                funded_amount: 0.00,
                crypto_balance: 0.00000000,
                crypto_balance_value_usd: 0.00,
              },
            ])
            .select('funded_amount')
            .single()

          if (createError) throw createError
          portfolio = newPortfolio
        }

        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0
          if (typeof value === 'string') return parseFloat(value) || 0
          if (typeof value === 'number') return value
          return 0
        }

        const currentFundedAmount = parseDecimal(portfolio.funded_amount)
        const refundAmount = transaction.amount || 0
        const newFundedAmount = (currentFundedAmount + refundAmount).toFixed(2)

        await supabase
          .from('crypto_portfolio')
          .update({ funded_amount: newFundedAmount })
          .eq('user_id', transaction.user_id)
      } else if (transaction.transaction_type === 'btc_sell') {
        // Return BTC to user's balance and restore crypto_balance_value_usd proportionally
        // Ensure portfolio exists
        let { data: portfolio, error: portfolioError } = await supabase
          .from('crypto_portfolio')
          .select('crypto_balance, crypto_balance_value_usd')
          .eq('user_id', transaction.user_id)
          .maybeSingle()

        if (portfolioError) throw portfolioError

        // Create portfolio if it doesn't exist
        if (!portfolio) {
          const { data: newPortfolio, error: createError } = await supabase
            .from('crypto_portfolio')
            .insert([
              {
                user_id: transaction.user_id,
                funded_amount: 0.00,
                crypto_balance: 0.00000000,
                crypto_balance_value_usd: 0.00,
              },
            ])
            .select('crypto_balance, crypto_balance_value_usd')
            .single()

          if (createError) throw createError
          portfolio = newPortfolio
        }

        const parseDecimal = (value: any): number => {
          if (value === null || value === undefined) return 0
          if (typeof value === 'string') return parseFloat(value) || 0
          if (typeof value === 'number') return value
          return 0
        }

        const currentBtcBalance = parseDecimal(portfolio.crypto_balance)
        const currentCryptoBalanceValueUsd = parseDecimal(portfolio.crypto_balance_value_usd)
        const btcToReturn = transaction.btc_amount || 0

        // Calculate average purchase price to restore value
        const avgPurchasePrice = currentBtcBalance > 0 
          ? currentCryptoBalanceValueUsd / currentBtcBalance 
          : transaction.btc_price || 0
        const valueToRestore = btcToReturn * avgPurchasePrice

        const newBtcBalance = parseFloat((currentBtcBalance + btcToReturn).toFixed(8))
        const newCryptoBalanceValueUsd = parseFloat((currentCryptoBalanceValueUsd + valueToRestore).toFixed(2))

        await supabase
          .from('crypto_portfolio')
          .update({ 
            crypto_balance: newBtcBalance.toString(),
            crypto_balance_value_usd: newCryptoBalanceValueUsd.toString(),
          })
          .eq('user_id', transaction.user_id)
      }

      // Update transaction status
      if (transaction.transaction_id) {
        await supabase
          .from('transactions')
          .update({
            status: 'cancelled',
            pending: false,
          })
          .eq('id', transaction.transaction_id)
      }

      await supabase
        .from('crypto_transactions')
        .update({
          status: 'cancelled',
          admin_id: adminUser.id,
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)

      // Create notification
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: transaction.user_id,
            type: 'transaction',
            title: transaction.transaction_type === 'btc_buy' ? 'BTC Purchase Cancelled' : 'BTC Sale Cancelled',
            message: `Your ${transaction.transaction_type === 'btc_buy' ? 'BTC buy' : 'BTC sell'} order (${transaction.reference_number}) has been cancelled. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
            read: false,
          },
        ])

      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Transaction Cancelled',
        message: `${transaction.transaction_type === 'btc_buy' ? 'Buy' : 'Sell'} order ${transaction.reference_number} has been cancelled. Funds have been refunded.`,
      })

      setAdminNotes('')
      setSelectedTransaction(null)
      setSelectedAccountId('')
      setUserAccounts([])
      await fetchTransactions()
    } catch (error: any) {
      console.error('Error cancelling transaction:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel transaction. Please try again.',
      })
    } finally {
      setIsProcessing(false)
      setProcessingTransactionId(null)
    }
  }

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || txn.transaction_type === typeFilter
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // BTC buys are now auto-approved, so only sells can be pending
  const pendingBuyCount = 0 // Buys are auto-approved, no pending buys
  const pendingSellCount = transactions.filter(t => t.transaction_type === 'btc_sell' && t.status === 'pending').length
  const totalPending = transactions.filter(t => t.status === 'pending').length

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'crypto_fund':
        return 'Crypto Fund'
      case 'btc_buy':
        return 'BTC Buy'
      case 'btc_sell':
        return 'BTC Sell'
      default:
        return type
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'crypto_fund':
        return DollarSign
      case 'btc_buy':
        return TrendingUp
      case 'btc_sell':
        return TrendingDown
      default:
        return Bitcoin
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Crypto Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Review and process cryptocurrency transactions. BTC purchases are auto-approved. Only BTC sales require admin approval.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={fetchTransactions}
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-3 sm:px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
              Pending
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {totalPending}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Awaiting review</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Buy Requests
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {pendingBuyCount}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending BTC buys</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Sell Requests
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {pendingSellCount}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending BTC sells</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {transactions.length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">All transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, user name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="crypto_fund">Crypto Fund</option>
            <option value="btc_buy">BTC Buy</option>
            <option value="btc_sell">BTC Sell</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((txn) => {
                const TypeIcon = getTransactionIcon(txn.transaction_type)
                return (
                  <div
                    key={txn.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          <p className="font-semibold text-base text-gray-900 dark:text-white">
                            {getTransactionTypeLabel(txn.transaction_type)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                          {txn.user_name || 'Unknown'} • {txn.user_email}
                        </p>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : txn.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {txn.status === 'pending' ? 'Pending' : 
                             txn.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Ref: {txn.reference_number}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          {formatCurrency(txn.amount)}
                        </p>
                        {txn.btc_amount > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {txn.btc_amount.toFixed(6)} BTC
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {txn.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTransaction(txn)
                                setAdminNotes('')
                                if (txn.transaction_type === 'btc_sell') {
                                  fetchUserAccounts(txn.user_id)
                                }
                              }}
                              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {txn.transaction_type === 'btc_sell' && (
                              <>
                                <button
                                  onClick={() => handleApprove(txn)}
                                  disabled={isProcessing && processingTransactionId !== txn.id}
                                  className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Approve"
                                >
                                  {processingTransactionId === txn.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTransaction(txn)
                                    setAdminNotes('')
                                  }}
                                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {txn.status !== 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(txn)
                              setAdminNotes(txn.admin_notes || '')
                            }}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    BTC Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((txn) => {
                  const TypeIcon = getTransactionIcon(txn.transaction_type)
                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                          {txn.reference_number}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {getTransactionTypeLabel(txn.transaction_type)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {txn.user_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {txn.user_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(txn.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {txn.btc_amount > 0 ? (
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {txn.btc_amount.toFixed(6)} BTC
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : txn.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {txn.status === 'pending' ? 'Pending' : 
                           txn.status === 'completed' ? 'Completed' : 'Cancelled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(txn.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {txn.status === 'pending' && (
                            <>
                              {/* Only show approve/cancel for pending transactions (sells only, since buys are auto-approved) */}
                              <button
                                onClick={() => {
                                  setSelectedTransaction(txn)
                                  setAdminNotes('')
                                  if (txn.transaction_type === 'btc_sell') {
                                    fetchUserAccounts(txn.user_id)
                                  }
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </button>
                              {txn.transaction_type === 'btc_sell' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(txn)}
                                    disabled={isProcessing && processingTransactionId !== txn.id}
                                    className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                                  >
                                    {processingTransactionId === txn.id ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedTransaction(txn)
                                      setAdminNotes('')
                                    }}
                                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancel
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          {txn.status !== 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedTransaction(txn)
                                setAdminNotes(txn.admin_notes || '')
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Crypto Transaction Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Reference: {selectedTransaction.reference_number}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTransaction(null)
                    setAdminNotes('')
                    setSelectedAccountId('')
                    setUserAccounts([])
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">User</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTransaction.user_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTransaction.user_email}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getTransactionTypeLabel(selectedTransaction.transaction_type)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">USD Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                {selectedTransaction.btc_amount > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">BTC Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTransaction.btc_amount.toFixed(6)} BTC
                    </p>
                    {selectedTransaction.btc_price && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        @ {formatCurrency(selectedTransaction.btc_price)}/BTC
                      </p>
                    )}
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedTransaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : selectedTransaction.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {selectedTransaction.status === 'pending' ? 'Pending' : 
                     selectedTransaction.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedTransaction.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Account Selection for BTC Sell */}
              {selectedTransaction.transaction_type === 'btc_sell' && selectedTransaction.status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Select Account to Deposit USD
                  </label>
                  <div className="space-y-2">
                    {userAccounts.map((account) => {
                      const accountTypeLabel = account.account_type === 'fixed-deposit' 
                        ? 'Fixed Deposit' 
                        : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
                      
                      return (
                        <button
                          key={account.id}
                          onClick={() => setSelectedAccountId(account.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedAccountId === account.id
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {accountTypeLabel} Account
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ••••{account.last4}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(parseFloat(account.balance.toString()))}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedTransaction.status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this transaction..."
                    className="input-field min-h-[100px]"
                    rows={4}
                  />
                </div>
              )}

              {/* Existing Admin Notes */}
              {selectedTransaction.admin_notes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Notes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTransaction.admin_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedTransaction.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedTransaction(null)
                      setAdminNotes('')
                      setSelectedAccountId('')
                      setUserAccounts([])
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleCancel(selectedTransaction)}
                    disabled={isProcessing && processingTransactionId !== selectedTransaction.id}
                    className="flex-1 px-6 py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {processingTransactionId === selectedTransaction.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Cancel Transaction
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTransaction)}
                    disabled={isProcessing && processingTransactionId !== selectedTransaction.id || (selectedTransaction.transaction_type === 'btc_sell' && !selectedAccountId)}
                    className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {processingTransactionId === selectedTransaction.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              )}
              {selectedTransaction.status !== 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedTransaction(null)
                      setAdminNotes('')
                      setSelectedAccountId('')
                      setUserAccounts([])
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  )
}