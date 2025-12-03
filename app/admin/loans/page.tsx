'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateReferenceNumber } from '@/lib/utils'
import NotificationModal from '@/components/NotificationModal'
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Percent,
  CreditCard,
  Building,
  Briefcase,
  Home,
  Car,
  GraduationCap,
  X,
  ChevronRight,
  RefreshCw,
  Edit,
  Ban,
  PlayCircle,
  PauseCircle,
  Trash2,
} from 'lucide-react'
import clsx from 'clsx'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type LoanStatus = 'pending' | 'approved' | 'declined' | 'active' | 'completed' | 'defaulted'
type LoanType = 'personal' | 'auto' | 'home' | 'student'

interface Loan {
  id: string
  user_id: string
  account_id: string | null
  loan_type: string
  requested_amount: number
  amount: number
  interest_rate: number
  term_months: number
  monthly_payment: number | null
  purpose: string | null
  reference_number: string
  status: string
  balance_remaining: number
  total_paid: number
  created_at: string
  approved_at: string | null
  declined_at: string | null
  disbursed_at: string | null
  completed_at: string | null
  next_payment_date: string | null
  admin_id: string | null
  admin_notes: string | null
  decline_reason: string | null
  // Joined data
  user_name?: string
  user_email?: string
  user_phone?: string
  credit_score?: number | null
  account_type?: string
  account_number?: string
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LoanStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | LoanType>('all')
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [showDisbursementModal, setShowDisbursementModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [disbursementAmount, setDisbursementAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loanPayments, setLoanPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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
    fetchLoans()
  }, [])

  // Fetch loan payments when a loan is selected
  useEffect(() => {
    const fetchLoanPayments = async () => {
      if (!selectedLoan) {
        setLoanPayments([])
        return
      }

      try {
        setPaymentsLoading(true)
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('loan_payments')
          .select('*')
          .eq('loan_id', selectedLoan)
          .order('payment_date', { ascending: false })

        if (paymentsError) {
          console.error('Error fetching loan payments:', paymentsError)
          setLoanPayments([])
        } else {
          setLoanPayments(paymentsData || [])
        }
      } catch (error) {
        console.error('Error fetching loan payments:', error)
        setLoanPayments([])
      } finally {
        setPaymentsLoading(false)
      }
    }

    fetchLoanPayments()
  }, [selectedLoan])

  const fetchLoans = async () => {
    try {
      setLoading(true)
      
      // Verify admin access
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Check if user is admin
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'admin' && profileData?.role !== 'superadmin') {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Access Denied',
          message: 'Admin role required to view loans.',
        })
        setLoans([])
        setLoading(false)
        return
      }

      // Fetch loans first
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false })

      if (loansError) {
        console.error('Error fetching loans:', loansError)
        throw loansError
      }

      // Fetch user profiles and accounts separately
      const userIds = [...new Set((loansData || []).map(loan => loan.user_id))]
      const accountIds = [...new Set((loansData || []).map(loan => loan.account_id).filter(Boolean))]

      const { data: userProfilesData } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone, credit_score')
        .in('id', userIds)

      const { data: accountsData } = accountIds.length > 0 ? await supabase
        .from('accounts')
        .select('id, account_type, account_number')
        .in('id', accountIds) : { data: [] }

      // Create lookup maps
      const userProfilesMap = new Map((userProfilesData || []).map(profile => [profile.id, profile]))
      const accountsMap = new Map((accountsData || []).map(account => [account.id, account]))

      // Transform the data
      const transformedLoans: Loan[] = (loansData || []).map((loan: any) => {
        const userProfile = userProfilesMap.get(loan.user_id)
        const account = loan.account_id ? accountsMap.get(loan.account_id) : null

        return {
          ...loan,
          user_name: userProfile
            ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown'
            : 'Unknown',
          user_email: userProfile?.email || '',
          user_phone: userProfile?.phone || '',
          credit_score: userProfile?.credit_score || null,
          account_type: account?.account_type || '',
          account_number: account?.account_number || '',
        }
      })

      setLoans(transformedLoans)
    } catch (error: any) {
      console.error('Error fetching loans:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch loans. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Enhanced statistics calculation
  // Exclude approved AND disbursed loans from all calculations
  const allVisibleLoans = loans.filter(l => !(l.status === 'approved' && l.disbursed_at))
  
  const pendingLoans = allVisibleLoans.filter(l => l.status === 'pending')
  // Only show active loans that still have a balance (not fully paid) and are disbursed
  const activeLoansList = allVisibleLoans.filter(l => 
    l.status === 'active' && 
    l.disbursed_at && 
    parseFloat((l.balance_remaining || 0).toString()) > 0
  )
  const approvedLoans = allVisibleLoans.filter(l => l.status === 'approved' && !l.disbursed_at)
  const completedLoans = loans.filter(l => l.status === 'completed')
  const defaultedLoans = loans.filter(l => l.status === 'defaulted')
  
  // Calculate stats excluding completed/fully paid loans
  const activeLoansForStats = allVisibleLoans.filter(l => 
    l.status === 'active' && 
    l.disbursed_at && 
    parseFloat((l.balance_remaining || 0).toString()) > 0
  )
  // Loans needing action: pending, approved (not disbursed), or active with balance
  const loansNeedingAction = allVisibleLoans.filter(l => 
    l.status === 'pending' || 
    (l.status === 'approved' && !l.disbursed_at) ||
    (l.status === 'active' && l.disbursed_at && parseFloat((l.balance_remaining || 0).toString()) > 0)
  )

  const stats = {
    totalLoans: loansNeedingAction.length, // Only count loans that need action (pending, approved-not-disbursed, active with balance)
    pendingApplications: pendingLoans.length, // Count of pending loans
    activeLoans: activeLoansList.length, // Count of active loans with balance > 0
    totalDisbursed: allVisibleLoans
      .filter(l => l.status === 'active' && l.disbursed_at && parseFloat((l.balance_remaining || 0).toString()) > 0) // Only count active disbursed loans with remaining balance
      .reduce((sum, l) => sum + parseFloat((l.amount || l.requested_amount || 0).toString()), 0),
    totalOutstanding: activeLoansList
      .reduce((sum, l) => sum + parseFloat((l.balance_remaining || 0).toString()), 0),
    defaultRate: loansNeedingAction.length > 0 
      ? ((defaultedLoans.length / loansNeedingAction.length) * 100).toFixed(1)
      : '0.0',
    totalCollected: completedLoans
      .reduce((sum, l) => sum + parseFloat((l.total_paid || 0).toString()), 0),
    totalRevenue: loans
      .filter(l => l.status === 'completed' || (l.status === 'active' && parseFloat((l.balance_remaining || 0).toString()) > 0))
      .reduce((sum, l) => {
        const principal = parseFloat((l.amount || l.requested_amount || 0).toString())
        const totalPaid = parseFloat((l.total_paid || 0).toString())
        return sum + (totalPaid - principal) // Interest collected
      }, 0),
  }

  // Filter loans - exclude approved AND disbursed loans from the main table
  // Get IDs of loans shown in sections to exclude from main table
  const pendingLoanIds = new Set(pendingLoans.slice(0, 5).map(l => l.id))
  const activeLoanIds = new Set(activeLoansList.slice(0, 5).map(l => l.id))
  
  const filteredLoans = loans.filter(loan => {
    // Exclude loans that are approved AND disbursed (they should not appear)
    const isApprovedAndDisbursed = loan.status === 'approved' && loan.disbursed_at
    if (isApprovedAndDisbursed) {
      return false
    }

    // Exclude completed loans by default (unless specifically filtering for completed)
    if (loan.status === 'completed' && statusFilter === 'all') {
      return false
    }

    // Exclude fully paid active loans by default
    const isFullyPaid = loan.status === 'active' && parseFloat((loan.balance_remaining || 0).toString()) <= 0
    if (isFullyPaid && statusFilter === 'all') {
      return false
    }

    // Remove duplicates - exclude loans that are shown in the sections
    // When statusFilter is 'all', exclude loans shown in sections
    // When filtering by specific status, show all matching loans
    if (statusFilter === 'all') {
      if (pendingLoanIds.has(loan.id)) {
        return false // Already shown in Pending Applications section
      }
      if (activeLoanIds.has(loan.id)) {
        return false // Already shown in Active Loans section
      }
    }

    const matchesSearch = 
      (loan.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.reference_number || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' 
      ? true // Show all except the excluded ones above
      : loan.status === statusFilter
    const matchesType = typeFilter === 'all' || loan.loan_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'declined':
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'completed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
      case 'defaulted':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'high':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getLoanTypeIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return Briefcase
      case 'auto':
        return Car
      case 'home':
        return Home
      case 'student':
        return GraduationCap
      default:
        return DollarSign
    }
  }

  const getLoanTypeName = (type: string) => {
    const names: Record<string, string> = {
      personal: 'Personal Loan',
      auto: 'Auto Loan',
      home: 'Home Loan',
      student: 'Student Loan',
    }
    return names[type] || type
  }

  const handleViewLoan = (loanId: string) => {
    setSelectedLoan(loanId)
    setShowLoanModal(true)
    setRejectionReason('')
    setInterestRate('')
  }

  // Calculate approved amount based on credit score
  const calculateApprovedAmount = (requestedAmount: number, creditScore: number | null): number => {
    if (!creditScore || creditScore < 500) {
      return 0 // Auto-decline
    }

    let minPercent = 0
    let maxPercent = 0

    if (creditScore >= 750) {
      // 750-850: Auto-approve up to 100%
      minPercent = 0.95
      maxPercent = 1.0
    } else if (creditScore >= 650) {
      // 650-749: Approve 60-80%
      minPercent = 0.60
      maxPercent = 0.80
    } else if (creditScore >= 500) {
      // 500-649: Approve 30-50%
      minPercent = 0.30
      maxPercent = 0.50
    }

    // Randomly determine approved amount within the allowed range
    const randomPercent = minPercent + Math.random() * (maxPercent - minPercent)
    const approvedAmount = requestedAmount * randomPercent

    return Math.round(approvedAmount * 100) / 100 // Round to 2 decimal places
  }

  const handleApproveLoan = async () => {
    if (!selectedLoanData) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No loan selected.',
      })
      return
    }

    // Check credit score
    const creditScore = selectedLoanData.credit_score || 0
    if (creditScore < 500) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Auto-Decline',
        message: `Credit score of ${creditScore} is below 500. This loan must be declined.`,
      })
      return
    }

    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      // Calculate approved amount based on credit score
      const approvedAmount = calculateApprovedAmount(
        selectedLoanData.requested_amount,
        creditScore
      )

      if (approvedAmount <= 0) {
        throw new Error('Approved amount cannot be zero')
      }

      // Recalculate monthly payment for approved amount
      const { data: paymentData, error: paymentError } = await supabase
        .rpc('calculate_monthly_payment', {
          amount: approvedAmount,
          interest_rate: selectedLoanData.interest_rate,
          term_months: selectedLoanData.term_months,
        })

      const newMonthlyPayment = paymentData || (approvedAmount * (selectedLoanData.interest_rate / 100 / 12) * Math.pow(1 + (selectedLoanData.interest_rate / 100 / 12), selectedLoanData.term_months)) / (Math.pow(1 + (selectedLoanData.interest_rate / 100 / 12), selectedLoanData.term_months) - 1)

      // Calculate next payment date (30 days from now)
      const nextPaymentDate = new Date()
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30)

      // Update loan status to approved
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'approved',
          amount: approvedAmount,
          balance_remaining: approvedAmount,
          monthly_payment: Math.round(newMonthlyPayment * 100) / 100,
          next_payment_date: nextPaymentDate.toISOString().split('T')[0],
          approved_at: new Date().toISOString(),
          admin_id: adminUser.id,
          admin_notes: `Approved ${approvedAmount.toFixed(2)} of ${selectedLoanData.requested_amount.toFixed(2)} requested (${((approvedAmount / selectedLoanData.requested_amount) * 100).toFixed(1)}%) based on credit score of ${creditScore}`,
        })
        .eq('id', selectedLoanData.id)

      if (updateError) {
        console.error('Error approving loan:', updateError)
        throw updateError
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Loan Approved',
        message: `Loan approved for ${formatCurrency(approvedAmount)} (${((approvedAmount / selectedLoanData.requested_amount) * 100).toFixed(1)}% of requested amount). Ready for disbursement.`,
      })

      // Send email notifications (non-blocking)
      const { sendLoanApprovalNotification } = await import('@/lib/utils/emailNotifications')
      const loanTypeLabel = selectedLoanData.loan_type === 'personal' ? 'Personal Loan' :
                           selectedLoanData.loan_type === 'auto' ? 'Auto Loan' :
                           selectedLoanData.loan_type === 'home' ? 'Home Loan' :
                           selectedLoanData.loan_type === 'student' ? 'Student Loan' : 'Loan'
      
      sendLoanApprovalNotification(
        selectedLoanData.user_id,
        loanTypeLabel,
        approvedAmount,
        selectedLoanData.interest_rate,
        Math.round(newMonthlyPayment * 100) / 100,
        selectedLoanData.term_months,
        selectedLoanData.reference_number || undefined
      ).catch(error => {
        console.error('Error sending loan approval email notification:', error)
        // Don't fail the approval if email fails
      })

    setShowLoanModal(false)
    setShowDisbursementModal(true)
      setDisbursementAmount(approvedAmount.toString())
      await fetchLoans() // Refresh loans list
    } catch (error: any) {
      console.error('Error approving loan:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve loan. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectLoan = async () => {
    if (!selectedLoanData) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No loan selected.',
      })
      return
    }

    if (!rejectionReason.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Reason',
        message: 'Please provide a rejection reason.',
      })
      return
    }

    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      // Update loan status to declined
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
          admin_id: adminUser.id,
          decline_reason: rejectionReason,
        })
        .eq('id', selectedLoanData.id)

      if (updateError) {
        console.error('Error declining loan:', updateError)
        throw updateError
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Loan Declined',
        message: 'Loan application has been declined.',
      })

    setShowLoanModal(false)
      setRejectionReason('')
      await fetchLoans() // Refresh loans list
    } catch (error: any) {
      console.error('Error declining loan:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Decline Failed',
        message: error.message || 'Failed to decline loan. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisburseLoan = async () => {
    if (!selectedLoanData) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No loan selected.',
      })
      return
    }

    const amount = parseFloat(disbursementAmount)
    if (!amount || amount <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid disbursement amount.',
      })
      return
    }

    const approvedAmount = selectedLoanData.amount || selectedLoanData.requested_amount
    if (amount > approvedAmount) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Amount Exceeds Approval',
        message: `Disbursement amount cannot exceed approved amount of ${formatCurrency(approvedAmount)}.`,
      })
      return
    }

    if (!selectedLoanData.account_id) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Missing Account',
        message: 'Loan does not have an associated account. Cannot disburse funds.',
      })
      return
    }

    setIsProcessing(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      // Generate reference number for transaction
      const referenceNumber = generateReferenceNumber()
      const transactionDate = new Date().toISOString()

      // Create transaction record: "Loan Credit – REFXXXXX"
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: selectedLoanData.user_id,
            account_id: selectedLoanData.account_id,
            type: 'credit',
            category: 'Loan Credit',
            amount: amount,
            description: `Loan Credit – ${referenceNumber}`,
            status: 'completed',
            pending: false,
            date: transactionDate,
          },
        ])
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        throw transactionError
      }

      // Update loan status to active and set disbursement info
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          admin_id: adminUser.id,
        })
        .eq('id', selectedLoanData.id)

      if (loanUpdateError) {
        console.error('Error updating loan:', loanUpdateError)
        throw loanUpdateError
      }

      // Create notification for user
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: selectedLoanData.user_id,
            type: 'loan_status',
            title: 'Loan Disbursed',
            message: `Your loan of ${formatCurrency(amount)} has been disbursed to your account. Reference: ${referenceNumber}`,
          },
        ])

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Loan Disbursed',
        message: `Successfully disbursed ${formatCurrency(amount)} to user's account. Transaction reference: ${referenceNumber}`,
      })

    setShowDisbursementModal(false)
      setDisbursementAmount('')
      await fetchLoans() // Refresh loans list
    } catch (error: any) {
      console.error('Error disbursing loan:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Disbursement Failed',
        message: error.message || 'Failed to disburse loan. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedLoanData = loans.find(l => l.id === selectedLoan)

  const handleDeleteLoan = async () => {
    if (!loanToDelete) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No loan selected for deletion.',
      })
      return
    }

    const loan = loans.find(l => l.id === loanToDelete)
    if (!loan) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Loan not found.',
      })
      return
    }

    // Prevent deletion of active loans with balance
    if (loan.status === 'active' && parseFloat((loan.balance_remaining || 0).toString()) > 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Cannot Delete Active Loan',
        message: 'Cannot delete an active loan with outstanding balance. Please wait until the loan is fully paid or completed.',
      })
      setShowDeleteModal(false)
      setLoanToDelete(null)
      return
    }

    setIsProcessing(true)
    try {
      // First, delete related loan payments
      const { error: paymentsDeleteError } = await supabase
        .from('loan_payments')
        .delete()
        .eq('loan_id', loanToDelete)

      if (paymentsDeleteError) {
        console.error('Error deleting loan payments:', paymentsDeleteError)
        // Continue with loan deletion even if payments deletion fails
      }

      // Delete related transactions (optional - you may want to keep transaction history)
      // Uncomment if you want to delete transactions too:
      // const { error: transactionsDeleteError } = await supabase
      //   .from('transactions')
      //   .delete()
      //   .eq('description', `Loan Credit – ${loan.reference_number}`)
      //   .or(`description.ilike.%Loan Payment – ${loan.reference_number}%`)

      // Delete the loan
      const { error: loanDeleteError } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanToDelete)

      if (loanDeleteError) {
        console.error('Error deleting loan:', loanDeleteError)
        throw loanDeleteError
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Loan Deleted',
        message: `Loan ${loan.reference_number} has been successfully deleted.`,
      })

      setShowDeleteModal(false)
      setLoanToDelete(null)
      await fetchLoans() // Refresh loans list
    } catch (error: any) {
      console.error('Error deleting loan:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Deletion Failed',
        message: error.message || 'Failed to delete loan. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Loans Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review, approve, and manage loan applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-semibold">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={fetchLoans}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer" onClick={() => setStatusFilter('pending')}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
              Pending
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.pendingApplications}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting Review</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer" onClick={() => setStatusFilter('active')}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Active
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.activeLoans}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ongoing Repayment</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats.totalDisbursed)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Disbursed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-purple-700 dark:text-purple-400" />
            </div>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-semibold">
              Outstanding
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(stats.totalOutstanding)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Amount Owed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Risk
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.defaultRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Default Rate</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-700 dark:text-gray-400" />
            </div>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 px-2 py-1 rounded-full font-semibold">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalLoans.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">All Loans</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => {
              setStatusFilter('pending')
              setSearchQuery('')
            }}
            className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-400">Review Pending</span>
          </button>
          <button
            onClick={() => {
              setStatusFilter('active')
              setSearchQuery('')
            }}
            className="px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5 text-green-700 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-400">Active Loans</span>
          </button>
          <button
            onClick={() => {
              setStatusFilter('defaulted')
              setSearchQuery('')
            }}
            className="px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl transition-all flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400" />
            <span className="font-semibold text-red-700 dark:text-red-400">High Risk</span>
          </button>
          <button
            onClick={() => {
              setStatusFilter('all')
              setSearchQuery('')
            }}
            className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl transition-all flex items-center gap-2"
          >
            <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <span className="font-semibold text-blue-700 dark:text-blue-400">All Loans</span>
          </button>
          <button
            onClick={fetchLoans}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-400">Refresh</span>
          </button>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Loan Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pending', value: pendingLoans.length, color: '#f59e0b' },
                  { name: 'Active', value: activeLoansList.length, color: '#10b981' },
                  { name: 'Approved', value: approvedLoans.length, color: '#3b82f6' },
                  { name: 'Completed', value: completedLoans.length, color: '#6b7280' },
                  { name: 'Defaulted', value: defaultedLoans.length, color: '#ef4444' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Pending', value: pendingLoans.length, color: '#f59e0b' },
                  { name: 'Active', value: activeLoansList.length, color: '#10b981' },
                  { name: 'Approved', value: approvedLoans.length, color: '#3b82f6' },
                  { name: 'Completed', value: completedLoans.length, color: '#6b7280' },
                  { name: 'Defaulted', value: defaultedLoans.length, color: '#ef4444' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Disbursement Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Disbursement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={(() => {
              // Group loans by month
              const monthlyData: Record<string, { month: string; disbursed: number; collected: number }> = {}
              loans.filter(l => l.disbursed_at).forEach(loan => {
                const date = new Date(loan.disbursed_at!)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = { month: monthKey, disbursed: 0, collected: 0 }
                }
                monthlyData[monthKey].disbursed += parseFloat((loan.amount || loan.requested_amount || 0).toString())
              })
              loans.filter(l => l.status === 'completed' || l.status === 'active').forEach(loan => {
                const date = loan.completed_at ? new Date(loan.completed_at) : new Date(loan.disbursed_at || loan.created_at)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = { month: monthKey, disbursed: 0, collected: 0 }
                }
                monthlyData[monthKey].collected += parseFloat((loan.total_paid || 0).toString())
              })
              return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
            })()}>
              <defs>
                <linearGradient id="colorDisbursed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Area type="monotone" dataKey="disbursed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDisbursed)" name="Disbursed" />
              <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Applications Section */}
      {pendingLoans.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Applications</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {pendingLoans.length} loan application{pendingLoans.length !== 1 ? 's' : ''} awaiting review
              </p>
            </div>
            <button
              onClick={() => setStatusFilter('pending')}
              className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-xl font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-all"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {pendingLoans.slice(0, 5).map((loan) => {
              const Icon = getLoanTypeIcon(loan.loan_type)
              return (
                <div key={loan.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-900 dark:text-white">{loan.user_name || 'Unknown'}</p>
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                            Credit: {loan.credit_score || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getLoanTypeName(loan.loan_type)} • {formatCurrency(loan.requested_amount)} • {loan.term_months} months
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Ref: {loan.reference_number} • Applied: {new Date(loan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewLoan(loan.id)}
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                      <button
                        onClick={() => {
                          setLoanToDelete(loan.id)
                          setShowDeleteModal(true)
                        }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                        title="Delete Loan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Loans Section */}
      {activeLoansList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Loans</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activeLoansList.length} active loan{activeLoansList.length !== 1 ? 's' : ''} in repayment
              </p>
            </div>
            <button
              onClick={() => setStatusFilter('active')}
              className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-semibold hover:bg-green-200 dark:hover:bg-green-900/40 transition-all"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activeLoansList.slice(0, 5).map((loan) => {
              const Icon = getLoanTypeIcon(loan.loan_type)
              const payoffProgress = loan.amount 
                ? ((parseFloat((loan.amount || 0).toString()) - parseFloat((loan.balance_remaining || 0).toString())) / parseFloat((loan.amount || 0).toString())) * 100
                : 0
              const nextPaymentDate = loan.next_payment_date ? new Date(loan.next_payment_date) : null
              const daysUntilPayment = nextPaymentDate ? Math.ceil((nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
              const isOverdue = daysUntilPayment !== null && daysUntilPayment < 0
              const isDueSoon = daysUntilPayment !== null && daysUntilPayment >= 0 && daysUntilPayment <= 7
              
              return (
                <div key={loan.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-green-700 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-gray-900 dark:text-white">{loan.user_name || 'Unknown'}</p>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
                              Overdue
                            </span>
                          )}
                          {isDueSoon && !isOverdue && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
                              Due Soon
                            </span>
                          )}
                          {!isOverdue && !isDueSoon && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
                              On Track
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {getLoanTypeName(loan.loan_type)} • Ref: {loan.reference_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewLoan(loan.id)}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {(parseFloat((loan.balance_remaining || 0).toString()) <= 0) && (
                        <button
                          onClick={() => {
                            setLoanToDelete(loan.id)
                            setShowDeleteModal(true)
                          }}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
                          title="Delete Loan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remaining Balance</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat((loan.balance_remaining || 0).toString()))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monthly Payment</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat((loan.monthly_payment || 0).toString()))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Payment</p>
                      <p className={`text-sm font-semibold ${isOverdue ? 'text-red-700 dark:text-red-400' : isDueSoon ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                        {nextPaymentDate ? nextPaymentDate.toLocaleDateString() : 'N/A'}
                      </p>
                      {daysUntilPayment !== null && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {isOverdue ? `${Math.abs(daysUntilPayment)} days overdue` : `${daysUntilPayment} days remaining`}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Progress</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        {payoffProgress.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">Payoff Progress</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Paid: {formatCurrency(parseFloat((loan.total_paid || 0).toString()))} / {formatCurrency(parseFloat((loan.amount || loan.requested_amount || 0).toString()))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500 bg-green-700"
                        style={{ width: `${Math.min(100, payoffProgress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or loan ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field md:w-48"
          >
            <option value="all">All (Excluding Completed)</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed (Archive)</option>
            <option value="declined">Declined</option>
            <option value="defaulted">Defaulted</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="input-field md:w-48"
          >
            <option value="all">All Types</option>
            <option value="personal">Personal</option>
            <option value="auto">Auto</option>
            <option value="home">Home</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No loans found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLoans.map((loan) => {
                const Icon = getLoanTypeIcon(loan.loan_type)
                const initials = (loan.user_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div
                    key={loan.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Loan Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-gray-900 dark:text-white truncate">
                              {loan.user_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {loan.reference_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                              <Icon className="w-3 h-3 text-red-700 dark:text-red-400" />
                            </div>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {getLoanTypeName(loan.loan_type)}
                            </span>
                          </div>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(loan.status))}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                          {formatCurrency(loan.requested_amount)}
                        </p>
                        {loan.amount && loan.amount !== loan.requested_amount && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Approved: {formatCurrency(loan.amount)}
                          </p>
                        )}
                        {loan.balance_remaining > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Balance: {formatCurrency(loan.balance_remaining)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {loan.interest_rate}% APR • {loan.term_months} months
                        </p>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleViewLoan(loan.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                        {(loan.status === 'completed' || loan.status === 'declined' || (loan.status === 'active' && parseFloat((loan.balance_remaining || 0).toString()) <= 0)) && (
                          <button
                            onClick={() => {
                              setLoanToDelete(loan.id)
                              setShowDeleteModal(true)
                            }}
                            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
                          >
                            Delete
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
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Loan ID / Borrower
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Interest / Term
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLoans.map((loan) => {
                const Icon = getLoanTypeIcon(loan.loan_type)
                const initials = (loan.user_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <tr
                    key={loan.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {initials}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{loan.user_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{loan.reference_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-red-700 dark:text-red-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {getLoanTypeName(loan.loan_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(loan.requested_amount)}
                      </p>
                        {loan.amount && loan.amount !== loan.requested_amount && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Approved: {formatCurrency(loan.amount)}
                          </p>
                        )}
                        {loan.balance_remaining > 0 && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Balance: {formatCurrency(loan.balance_remaining)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {loan.interest_rate}% APR
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                          {loan.term_months} months
                      </p>
                        {loan.monthly_payment && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ${loan.monthly_payment.toFixed(2)}/mo
                          </p>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(loan.status))}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {loan.credit_score || 'N/A'}
                        </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                          {loan.account_type ? `${loan.account_type.charAt(0).toUpperCase() + loan.account_type.slice(1)} Account` : 'No account'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(loan.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewLoan(loan.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                        {(loan.status === 'completed' || loan.status === 'declined' || (loan.status === 'active' && parseFloat((loan.balance_remaining || 0).toString()) <= 0)) && (
                          <button
                            onClick={() => {
                              setLoanToDelete(loan.id)
                              setShowDeleteModal(true)
                            }}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                            title="Delete Loan"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
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

      {/* Loan Review Modal */}
      {showLoanModal && selectedLoanData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Loan Application Review
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedLoanData.reference_number} • {selectedLoanData.user_name || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => setShowLoanModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Loan Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-semibold">Requested Amount</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {formatCurrency(selectedLoanData.requested_amount)}
                  </p>
                  {selectedLoanData.amount && selectedLoanData.amount !== selectedLoanData.requested_amount && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Approved: {formatCurrency(selectedLoanData.amount)}
                    </p>
                  )}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">Monthly Payment</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {selectedLoanData.monthly_payment ? formatCurrency(selectedLoanData.monthly_payment) : 'N/A'}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-semibold">Credit Score</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {selectedLoanData.credit_score || 'N/A'}
                  </p>
                  {selectedLoanData.credit_score && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {selectedLoanData.credit_score >= 750 ? 'Excellent' :
                       selectedLoanData.credit_score >= 650 ? 'Good' :
                       selectedLoanData.credit_score >= 500 ? 'Fair' : 'Poor'}
                    </p>
                  )}
                </div>
              </div>

              {/* Approval Range Info */}
              {selectedLoanData.status === 'pending' && selectedLoanData.credit_score && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Approval Range Based on Credit Score ({selectedLoanData.credit_score}):
                  </p>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">
                    {selectedLoanData.credit_score >= 750 ? (
                      <p>✅ Auto-approve up to 100% of requested amount (${formatCurrency(selectedLoanData.requested_amount)})</p>
                    ) : selectedLoanData.credit_score >= 650 ? (
                      <p>✅ Approve 60-80% of requested amount (${formatCurrency(selectedLoanData.requested_amount * 0.60)} - {formatCurrency(selectedLoanData.requested_amount * 0.80)})</p>
                    ) : selectedLoanData.credit_score >= 500 ? (
                      <p>⚠️ Approve 30-50% of requested amount (${formatCurrency(selectedLoanData.requested_amount * 0.30)} - {formatCurrency(selectedLoanData.requested_amount * 0.50)})</p>
                    ) : (
                      <p>❌ Auto-decline (Credit score below 500)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Borrower Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Borrower Information</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.user_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.user_email || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.user_phone || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.account_type ? `${selectedLoanData.account_type.charAt(0).toUpperCase() + selectedLoanData.account_type.slice(1)} Account` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Loan Details</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loan Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getLoanTypeName(selectedLoanData.loan_type)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loan Purpose</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.purpose || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Term</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.term_months} months
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interest Rate</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedLoanData.interest_rate}% APR
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History & Repayment Tracking */}
              {(selectedLoanData.status === 'active' || selectedLoanData.status === 'completed') && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Repayment Tracking</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-semibold">Remaining Balance</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {formatCurrency(parseFloat((selectedLoanData.balance_remaining || 0).toString()))}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-semibold">Total Paid</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(parseFloat((selectedLoanData.total_paid || 0).toString()))}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">Next Payment</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                        {selectedLoanData.next_payment_date ? new Date(selectedLoanData.next_payment_date).toLocaleDateString() : 'N/A'}
                      </p>
                      {selectedLoanData.next_payment_date && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {(() => {
                            const days = Math.ceil((new Date(selectedLoanData.next_payment_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            return days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`
                          })()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Progress */}
                  {selectedLoanData.amount && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Payoff Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {((parseFloat((selectedLoanData.amount || 0).toString()) - parseFloat((selectedLoanData.balance_remaining || 0).toString())) / parseFloat((selectedLoanData.amount || 0).toString()) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500 bg-green-700"
                          style={{
                            width: `${Math.min(100, ((parseFloat((selectedLoanData.amount || 0).toString()) - parseFloat((selectedLoanData.balance_remaining || 0).toString())) / parseFloat((selectedLoanData.amount || 0).toString())) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment History</h4>
                    {paymentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : loanPayments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No payments recorded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {loanPayments.map((payment) => (
                          <div key={payment.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(parseFloat((payment.amount || 0).toString()))}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(payment.payment_date).toLocaleDateString()} • Ref: {payment.reference_number}
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                            </div>
                    </div>
                  ))}
                </div>
                    )}
              </div>
                </div>
              )}

              {/* Decision Section */}
              {selectedLoanData.status === 'pending' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Loan Decision</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Rejection Reason (Required for rejection)
                    </label>
                    <textarea
                      rows={4}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="input-field"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowLoanModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                {selectedLoanData.status === 'pending' && (
                  <>
                    <button
                      onClick={handleRejectLoan}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                      <XCircle className="w-5 h-5" />
                          Decline Loan
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleApproveLoan}
                      disabled={isProcessing}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                      <CheckCircle className="w-5 h-5" />
                      Approve Loan
                        </>
                      )}
                    </button>
                  </>
                )}
                {selectedLoanData.status === 'approved' && (
                  <button
                    onClick={() => {
                      setShowLoanModal(false)
                      setShowDisbursementModal(true)
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Disburse Funds
                  </button>
                )}
                {(selectedLoanData.status === 'completed' || selectedLoanData.status === 'declined' || (selectedLoanData.status === 'active' && parseFloat((selectedLoanData.balance_remaining || 0).toString()) <= 0)) && (
                  <button
                    onClick={() => {
                      setShowLoanModal(false)
                      setLoanToDelete(selectedLoanData.id)
                      setShowDeleteModal(true)
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Loan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disbursement Modal */}
      {showDisbursementModal && selectedLoanData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Disburse Loan Funds
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedLoanData.reference_number} • {selectedLoanData.user_name || 'Unknown'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Approved Loan Amount</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(selectedLoanData.amount || selectedLoanData.requested_amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Disbursement Amount
                </label>
                <input
                  type="number"
                  value={disbursementAmount}
                  onChange={(e) => setDisbursementAmount(e.target.value)}
                  placeholder={selectedLoanData?.requested_amount?.toString() || '0'}
                  className="input-field"
                />
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  ⚠️ This action will transfer funds to the borrower's account. Please verify all details before proceeding.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowDisbursementModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDisburseLoan}
                disabled={isProcessing || !disbursementAmount}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                <CheckCircle className="w-5 h-5" />
                Confirm Disbursement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && loanToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-700 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Delete Loan
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {(() => {
                const loan = loans.find(l => l.id === loanToDelete)
                return loan ? (
                  <>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                        Are you sure you want to delete this loan?
                      </p>
                      <div className="space-y-1 text-sm text-red-700 dark:text-red-400">
                        <p><strong>Reference:</strong> {loan.reference_number}</p>
                        <p><strong>Borrower:</strong> {loan.user_name || 'Unknown'}</p>
                        <p><strong>Amount:</strong> {formatCurrency(loan.requested_amount)}</p>
                        <p><strong>Status:</strong> {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        ⚠️ This will permanently delete the loan and all associated payment records. This action cannot be undone.
                      </p>
                    </div>
                  </>
                ) : null
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setLoanToDelete(null)
                }}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLoan}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Loan
                  </>
                )}
              </button>
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

