'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import NotificationModal from '@/components/NotificationModal'
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  DollarSign,
  User,
  Building2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  Smartphone,
} from 'lucide-react'

interface MobileDeposit {
  id: string
  user_id: string
  account_id: string
  reference_number: string
  amount: number
  front_image_url: string | null
  back_image_url: string | null
  status: 'pending' | 'credited' | 'cancelled'
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

export default function AdminMobileDepositsPage() {
  const [deposits, setDeposits] = useState<MobileDeposit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'credited' | 'cancelled'>('all')
  const [selectedDeposit, setSelectedDeposit] = useState<MobileDeposit | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageType, setImageType] = useState<'front' | 'back'>('front')
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingDepositId, setProcessingDepositId] = useState<string | null>(null)
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
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    try {
      setLoading(true)

      // Verify admin access
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Auth error:', userError)
        throw new Error('User not authenticated')
      }

      // Check if user is admin
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('Current user role:', profileData?.role)

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
          message: 'Admin role required to view mobile deposits.',
        })
        setDeposits([])
        setLoading(false)
        return
      }

      // Fetch deposits - only essential fields for faster loading
      const { data: depositsData, error: depositsError } = await supabase
        .from('mobile_deposits')
        .select('id, user_id, account_id, reference_number, amount, status, transaction_id, admin_id, admin_notes, processed_at, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (depositsError) {
        console.error('Error fetching deposits:', depositsError)
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error Loading Deposits',
          message: depositsError.message || 'Failed to fetch mobile deposits. Please try again.',
        })
        setDeposits([])
        setLoading(false)
        return
      }

    if (!depositsData || depositsData.length === 0) {
      console.log('No deposits found in database')
      setDeposits([])
      setLoading(false)
      return
    }

      if (!depositsData || depositsData.length === 0) {
        setDeposits([])
        setLoading(false)
        return
      }

      // Fetch user and account info in parallel for faster loading
      const userIds = [...new Set(depositsData.map(d => d.user_id))]
      const accountIds = [...new Set(depositsData.map(d => d.account_id))]

      const [usersResult, accountsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds),
        supabase
          .from('accounts')
          .select('id, account_type, account_number')
          .in('id', accountIds)
      ])

      const usersData = usersResult.data || []
      const accountsData = accountsResult.data || []

      // Create lookup maps
      const usersMap = new Map((usersData || []).map(u => [u.id, u]))
      const accountsMap = new Map((accountsData || []).map(a => [a.id, a]))

      // Transform data to include user and account info
      const transformedDeposits: MobileDeposit[] = depositsData.map((deposit: any) => {
        const user = usersMap.get(deposit.user_id)
        const account = accountsMap.get(deposit.account_id)
        
        return {
          ...deposit,
          user_name: user 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
            : 'Unknown User',
          user_email: user?.email || '',
          account_type: account?.account_type || '',
          account_number: account?.account_number || '',
          amount: parseFloat(deposit.amount.toString()),
        }
      })

      setDeposits(transformedDeposits)
    } catch (error: any) {
      console.error('Error fetching deposits:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch deposits. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (deposit: MobileDeposit) => {
    if (processingDepositId) {
      return // Prevent multiple simultaneous actions
    }

    setProcessingDepositId(deposit.id)
    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      // Update deposit status
      // Delete ALL pending transactions with this reference number and create a new completed one
      const depositDescription = `MD – ${deposit.reference_number}`
      
      // Find and delete ALL pending transactions with this description
      // This handles cases where there might be duplicates or the transaction_id isn't set correctly
      const { data: allTransactions, error: findError } = await supabase
        .from('transactions')
        .select('id, pending, status')
        .eq('user_id', deposit.user_id)
        .eq('description', depositDescription)

      // Filter to only get truly pending transactions
      const pendingTransactions = allTransactions?.filter(t => 
        t.pending === true || t.status === 'pending'
      ) || []

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
          console.log(`Deleted ${pendingTransactions.length} pending transaction(s) for ${deposit.reference_number}`)
        }
      }

      // Create a new completed transaction
      const { data: newTransaction, error: createError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: deposit.user_id,
            account_id: deposit.account_id,
            type: 'credit',
            category: 'Mobile Deposit',
            amount: deposit.amount,
            description: `MD – ${deposit.reference_number}`,
            status: 'completed', // Set to completed since we're approving
            pending: false,
            date: new Date().toISOString(), // Use current date for the completed transaction
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating completed transaction:', createError)
        throw new Error('Failed to create transaction. Please try again.')
      }

      const transactionId = newTransaction.id

      // Update deposit status and link the new completed transaction (balance already updated by trigger)
      const { error: depositError } = await supabase
        .from('mobile_deposits')
        .update({
          status: 'credited',
          transaction_id: transactionId,
          admin_id: adminUser.id,
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', deposit.id)

      console.log('Completed transaction created and linked to deposit:', transactionId)

      if (depositError) throw depositError

      // Create notification for user
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: deposit.user_id,
            type: 'transaction',
            title: 'Mobile Deposit Approved',
            message: `Your mobile deposit of ${formatCurrency(deposit.amount)} (${deposit.reference_number}) has been approved and credited to your account.`,
            read: false,
          },
        ])

      // Send email notification
      try {
        const { sendDepositApprovalNotification } = await import('@/lib/utils/emailNotifications')
        const { data: accountData } = await supabase
          .from('accounts')
          .select('account_type, account_number, last4')
          .eq('id', deposit.account_id)
          .single()
        
        const accountType = accountData?.account_type || 'Account'
        const accountNumber = accountData?.account_number || accountData?.last4 
          ? `****${(accountData.account_number || accountData.last4)?.slice(-4)}` 
          : 'N/A'
        
        const { data: adminProfile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', adminUser.id)
          .single()
        
        await sendDepositApprovalNotification(
          deposit.user_id,
          deposit.amount,
          accountType,
          accountNumber,
          deposit.reference_number,
          deposit.id,
          adminProfile?.full_name || 'Administrator',
          adminNotes || undefined
        )
      } catch (emailError) {
        console.error('[AdminMobileDeposits] Error sending email notification:', emailError)
        // Don't fail the approval if email fails
      }

      setAdminNotes('')
      setSelectedDeposit(null)
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Deposit Approved',
        message: `Mobile deposit ${deposit.reference_number} for ${formatCurrency(deposit.amount)} has been approved and credited successfully.`,
      })
      
      // Refresh deposits list
      await fetchDeposits()
    } catch (error: any) {
      console.error('Error approving deposit:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve deposit. Please try again.',
      })
    } finally {
      setIsProcessing(false)
      setProcessingDepositId(null)
    }
  }

  const handleCancel = async (deposit: MobileDeposit) => {
    if (processingDepositId) {
      return // Prevent multiple simultaneous actions
    }

    setProcessingDepositId(deposit.id)
    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      // Delete ALL pending transactions with this reference number
      const depositDescription = `MD – ${deposit.reference_number}`
      
      // Find and delete ALL pending transactions with this description
      const { data: allTransactions, error: findError } = await supabase
        .from('transactions')
        .select('id, pending, status')
        .eq('user_id', deposit.user_id)
        .eq('description', depositDescription)

      // Filter to only get truly pending transactions
      const pendingTransactions = allTransactions?.filter(t => 
        t.pending === true || t.status === 'pending'
      ) || []

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
        } else {
          console.log(`Deleted ${pendingTransactions.length} pending transaction(s) for ${deposit.reference_number}`)
        }
      }

      // Update deposit status
      const { error: depositError } = await supabase
        .from('mobile_deposits')
        .update({
          status: 'cancelled',
          admin_id: adminUser.id,
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', deposit.id)

      if (depositError) throw depositError

      // Create notification for user
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: deposit.user_id,
            type: 'transaction',
            title: 'Mobile Deposit Cancelled',
            message: `Your mobile deposit of ${formatCurrency(deposit.amount)} (${deposit.reference_number}) has been cancelled. ${adminNotes ? 'Reason: ' + adminNotes : ''}`,
            read: false,
          },
        ])

      // Send email notification
      try {
        const { sendDepositRejectionNotification } = await import('@/lib/utils/emailNotifications')
        const { data: accountData } = await supabase
          .from('accounts')
          .select('account_type, account_number, last4')
          .eq('id', deposit.account_id)
          .single()
        
        const accountType = accountData?.account_type || 'Account'
        const accountNumber = accountData?.account_number || accountData?.last4 
          ? `****${(accountData.account_number || accountData.last4)?.slice(-4)}` 
          : 'N/A'
        
        await sendDepositRejectionNotification(
          deposit.user_id,
          deposit.amount,
          accountType,
          accountNumber,
          deposit.reference_number,
          deposit.id,
          adminNotes || 'No reason provided',
          adminNotes || undefined
        )
      } catch (emailError) {
        console.error('[AdminMobileDeposits] Error sending email notification:', emailError)
        // Don't fail the rejection if email fails
      }

      setAdminNotes('')
      setSelectedDeposit(null)
      
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Deposit Cancelled',
        message: `Mobile deposit ${deposit.reference_number} for ${formatCurrency(deposit.amount)} has been cancelled.${adminNotes ? ' Reason: ' + adminNotes : ''}`,
      })
      
      // Refresh deposits list
      await fetchDeposits()
    } catch (error: any) {
      console.error('Error cancelling deposit:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel deposit. Please try again.',
      })
    } finally {
      setIsProcessing(false)
      setProcessingDepositId(null)
    }
  }

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch =
      deposit.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = deposits.filter(d => d.status === 'pending').length
  const creditedCount = deposits.filter(d => d.status === 'credited').length
  const cancelledCount = deposits.filter(d => d.status === 'cancelled').length

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Mobile Deposits
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Review and process mobile cheque deposits
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={fetchDeposits}
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
            {pendingCount}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Awaiting review</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Credited
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {creditedCount}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Approved</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Cancelled
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {cancelledCount}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Rejected</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {deposits.length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">All deposits</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="credited">Credited</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Deposits List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No deposits found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                        {deposit.user_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                        {deposit.user_email}
                      </p>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          deposit.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : deposit.status === 'credited'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {deposit.status === 'pending' ? 'Pending' : 
                           deposit.status === 'credited' ? 'Credited' : 'Cancelled'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Ref: {deposit.reference_number}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(deposit.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {deposit.account_type ? 
                          (deposit.account_type === 'fixed-deposit' ? 'Fixed Deposit' : deposit.account_type.charAt(0).toUpperCase() + deposit.account_type.slice(1)) 
                          : 'Account'} ••••{deposit.account_number?.slice(-4) || ''}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit)
                              setAdminNotes('')
                            }}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(deposit)}
                            disabled={isProcessing && processingDepositId !== deposit.id}
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            {processingDepositId === deposit.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit)
                              setAdminNotes('')
                            }}
                            disabled={isProcessing && processingDepositId !== deposit.id}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel"
                          >
                            {processingDepositId === deposit.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                      {deposit.status !== 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedDeposit(deposit)
                            setAdminNotes(deposit.admin_notes || '')
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
              ))}
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
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Amount
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
                {filteredDeposits.map((deposit) => (
                  <tr
                    key={deposit.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">
                        {deposit.reference_number}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {deposit.user_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deposit.user_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {deposit.account_type ? 
                            (deposit.account_type === 'fixed-deposit' ? 'Fixed Deposit' : deposit.account_type.charAt(0).toUpperCase() + deposit.account_type.slice(1)) 
                            : 'Account'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ••••{deposit.account_number?.slice(-4) || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(deposit.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          deposit.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : deposit.status === 'credited'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {deposit.status === 'pending' ? 'Pending Credit' : 
                         deposit.status === 'credited' ? 'Credited' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(deposit.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {deposit.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDeposit(deposit)
                                setAdminNotes('')
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleApprove(deposit)}
                              disabled={isProcessing && processingDepositId !== deposit.id}
                              className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                            >
                              {processingDepositId === deposit.id ? (
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
                                setSelectedDeposit(deposit)
                                setAdminNotes('')
                              }}
                              disabled={isProcessing && processingDepositId !== deposit.id}
                              className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                            >
                              {processingDepositId === deposit.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </>
                              )}
                            </button>
                          </>
                        )}
                        {deposit.status !== 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit)
                              setAdminNotes(deposit.admin_notes || '')
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
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Deposit Detail Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mobile Deposit Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Reference: {selectedDeposit.reference_number}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDeposit(null)
                    setAdminNotes('')
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Deposit Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">User</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedDeposit.user_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDeposit.user_email}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedDeposit.account_type ? 
                      (selectedDeposit.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedDeposit.account_type.charAt(0).toUpperCase() + selectedDeposit.account_type.slice(1)) 
                      : 'Account'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ••••{selectedDeposit.account_number?.slice(-4) || ''}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedDeposit.amount)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedDeposit.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : selectedDeposit.status === 'credited'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {selectedDeposit.status === 'pending' ? 'Pending Credit' : 
                     selectedDeposit.status === 'credited' ? 'Credited' : 'Cancelled'}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Submitted</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedDeposit.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {selectedDeposit.processed_at && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Processed</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedDeposit.processed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Cheque Images */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Cheque Images
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedDeposit.front_image_url && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Front
                      </p>
                      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={selectedDeposit.front_image_url}
                          alt="Front of cheque"
                          className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setImageType('front')
                            setShowImageModal(true)
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {selectedDeposit.back_image_url && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Back
                      </p>
                      <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={selectedDeposit.back_image_url}
                          alt="Back of cheque"
                          className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setImageType('back')
                            setShowImageModal(true)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedDeposit.status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this deposit..."
                    className="input-field min-h-[100px]"
                    rows={4}
                  />
                </div>
              )}

              {/* Existing Admin Notes */}
              {selectedDeposit.admin_notes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Notes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDeposit.admin_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedDeposit.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedDeposit(null)
                      setAdminNotes('')
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleCancel(selectedDeposit)}
                    disabled={isProcessing && processingDepositId !== selectedDeposit.id}
                    className="flex-1 px-6 py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {processingDepositId === selectedDeposit.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Cancel Deposit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedDeposit)}
                    disabled={isProcessing && processingDepositId !== selectedDeposit.id}
                    className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {processingDepositId === selectedDeposit.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Approve & Credit
                      </>
                    )}
                  </button>
                </div>
              )}
              {selectedDeposit.status !== 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedDeposit(null)
                      setAdminNotes('')
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

      {/* Image Modal */}
      {showImageModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors z-10"
            >
              <XCircle className="w-6 h-6 text-white" />
            </button>
            <img
              src={imageType === 'front' ? selectedDeposit.front_image_url! : selectedDeposit.back_image_url!}
              alt={imageType === 'front' ? 'Front of cheque' : 'Back of cheque'}
              className="w-full rounded-xl border-4 border-white/20"
            />
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
              