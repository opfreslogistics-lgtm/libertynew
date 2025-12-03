'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Shield,
  Activity,
  UserCheck,
  Briefcase,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Smartphone,
  Bitcoin,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import clsx from 'clsx'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

const COLORS = ['#047857', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { profile, fullName } = useUserProfile()
  const firstName = profile?.first_name || 'Admin'

  // Real-time stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingKYC: 0,
    pendingLoans: 0,
    pendingMobileDeposits: 0,
    pendingCryptoBuys: 0,
    pendingCryptoSells: 0,
    pendingSupportTickets: 0,
    revenue: 0,
    fraudAlerts: 0,
  })

  const [transactionTrend, setTransactionTrend] = useState<{ date: string; deposits: number; withdrawals: number; transfers: number }[]>([])
  const [accountTypes, setAccountTypes] = useState<{ name: string; value: number; color: string }[]>([])
  const [recentActivities, setRecentActivities] = useState<{
    id: string
    type: string
    user: string
    description: string
    time: string
    icon: any
    color: string
  }[]>([])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch all users (including superadmins in total count, but exclude regular admins)
      let totalUsers = 0
      let activeUsers = 0
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, account_status, role')

        if (usersError) {
          console.error('Error fetching users:', usersError)
        } else if (usersData) {
          // Count regular users and superadmins (exclude regular admins)
          totalUsers = usersData.filter(u => 
            u.role === 'user' || 
            u.role === 'superadmin' || 
            !u.role
          ).length
          // Active users: only count regular users (exclude superadmins and admins)
          activeUsers = usersData.filter(u => 
            (u.role === 'user' || !u.role) && 
            u.account_status === 'active'
          ).length
        }
      } catch (err) {
        console.error('Exception fetching users:', err)
      }

      // Fetch ALL accounts and calculate total balance (including all account types)
      let totalBalance = 0
      let accountTypesData: { name: string; value: number; color: string }[] = []
      
      try {
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('balance, account_type, status')

        if (accountsError) {
          console.error('Error fetching accounts:', accountsError)
        } else if (accountsData) {
          // Calculate total balance from all active accounts
          totalBalance = accountsData
            .filter(acc => acc.status === 'active')
            .reduce((sum, acc) => {
              const balance = parseFloat(acc.balance?.toString() || '0')
              return sum + (isNaN(balance) ? 0 : balance)
            }, 0)

          // Account types distribution
          const accountTypeMap = new Map<string, number>()
          accountsData.forEach(acc => {
            const type = acc.account_type || 'unknown'
            accountTypeMap.set(type, (accountTypeMap.get(type) || 0) + 1)
          })

          accountTypesData = Array.from(accountTypeMap.entries()).map(([name, value], index) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: COLORS[index % COLORS.length],
          }))
        }
      } catch (err) {
        console.error('Exception fetching accounts:', err)
      }

      // Fetch pending KYC
      let pendingKYC = 0
      try {
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_verifications')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')

        if (kycError) {
          console.error('Error fetching KYC data:', kycError)
        } else {
          pendingKYC = kycData?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching KYC:', err)
      }

      // Fetch pending loans
      let pendingLoans = 0
      try {
        const { data: loansData, error: loansError } = await supabase
          .from('loans')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')

        if (loansError) {
          console.error('Error fetching loans data:', loansError)
        } else {
          pendingLoans = loansData?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching loans:', err)
      }

      // Fetch pending mobile deposits
      let pendingMobileDeposits = 0
      try {
        const { data: depositsData, error: depositsError } = await supabase
          .from('mobile_deposits')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')

        if (depositsError) {
          console.error('Error fetching mobile deposits data:', depositsError)
        } else {
          pendingMobileDeposits = depositsData?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching mobile deposits:', err)
      }

      // Fetch pending support tickets
      let pendingSupportTickets = 0
      try {
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('id', { count: 'exact' })
          .in('status', ['open', 'in_progress'])

        if (ticketsError) {
          console.error('Error fetching support tickets data:', ticketsError)
        } else {
          pendingSupportTickets = ticketsData?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching support tickets:', err)
      }

      // Fetch pending crypto buy requests
      let pendingCryptoBuys = 0
      try {
        const { data: cryptoBuysData, error: cryptoBuysError } = await supabase
          .from('crypto_transactions')
          .select('id', { count: 'exact' })
          .eq('transaction_type', 'btc_buy')
          .eq('status', 'pending')

        if (cryptoBuysError) {
          console.error('Error fetching crypto buys data:', cryptoBuysError)
        } else {
          pendingCryptoBuys = cryptoBuysData?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching crypto buys:', err)
      }

      // Fetch pending crypto sell requests
      let pendingCryptoSells = 0
      try {
        const { data: cryptoSellsData, error: cryptoSellsError } = await supabase
          .from('crypto_transactions')
          .select('id', { count: 'exact' })
          .eq('transaction_type', 'btc_sell')
          .eq('status', 'pending')

        if (cryptoSellsError) {
          console.error('Error fetching crypto sells data:', cryptoSellsError)
        } else {
          pendingCryptoSells = cryptoSellsData?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching crypto sells:', err)
      }

      // Calculate fraud alerts (transactions flagged or suspicious patterns)
      // Check for transactions with suspicious patterns: large amounts, failed transactions, etc.
      let fraudAlerts = 0
      try {
        const { data: suspiciousTransactions, error: fraudError } = await supabase
          .from('transactions')
          .select('id', { count: 'exact' })
          .or('status.eq.failed,status.eq.rejected')
          .limit(100)

        if (fraudError) {
          console.error('Error fetching fraud alerts:', fraudError)
        } else {
          fraudAlerts = suspiciousTransactions?.length || 0
        }
      } catch (err) {
        console.error('Exception fetching fraud alerts:', err)
      }

      // Fetch transactions for trend
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('type, amount, date, status, category')
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(1000)

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
      }

      // Calculate transaction trends (last 7 days) - improved date matching
      const last7Days = (transactionsData && transactionsData.length > 0) ? Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0, 0, 0, 0) // Normalize to start of day
        
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
        
        const dayDeposits = transactionsData.filter(t => {
          if (t.type !== 'credit' || t.status !== 'completed') return false
          // Exclude transfers from deposits
          if (t.category === 'Internal Transfer' || t.category === 'P2P Transfer') return false
          const txnDate = new Date(t.date)
          txnDate.setHours(0, 0, 0, 0)
          return txnDate.toISOString().split('T')[0] === dateStr
        }).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
        
        const dayWithdrawals = transactionsData.filter(t => {
          if (t.type !== 'debit' || t.status !== 'completed') return false
          // Exclude transfers from withdrawals
          if (t.category === 'Internal Transfer' || t.category === 'P2P Transfer') return false
          const txnDate = new Date(t.date)
          txnDate.setHours(0, 0, 0, 0)
          return txnDate.toISOString().split('T')[0] === dateStr
        }).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
        
        const dayTransfers = transactionsData.filter(t => {
          if (t.status !== 'completed') return false
          if (t.category !== 'Internal Transfer' && t.category !== 'P2P Transfer') return false
          const txnDate = new Date(t.date)
          txnDate.setHours(0, 0, 0, 0)
          return txnDate.toISOString().split('T')[0] === dateStr
        }).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          deposits: dayDeposits,
          withdrawals: dayWithdrawals,
          transfers: dayTransfers,
        }
      }) : []

      // Calculate total deposits and withdrawals (only completed transactions, excluding transfers)
      const totalDeposits = (transactionsData || []).filter(t => 
        t.type === 'credit' && 
        t.status === 'completed' &&
        t.category !== 'Internal Transfer' &&
        t.category !== 'P2P Transfer'
      ).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0
      
      const totalWithdrawals = (transactionsData || []).filter(t => 
        t.type === 'debit' && 
        t.status === 'completed' &&
        t.category !== 'Internal Transfer' &&
        t.category !== 'P2P Transfer'
      ).reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0

      // Fetch recent activities
      const activities: typeof recentActivities = []
      
      // Recent KYC submissions
      const { data: recentKYC, error: recentKYCError } = await supabase
        .from('kyc_verifications')
        .select('id, user_id, created_at, status')
        .order('created_at', { ascending: false })
        .limit(3)

      if (!recentKYCError && recentKYC) {
        const userIds = recentKYC.map(k => k.user_id)
        const { data: kycUsers } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', userIds)

        const usersMap = new Map(kycUsers?.map(u => [u.id, `${u.first_name} ${u.last_name}`]) || [])

        recentKYC.forEach(kyc => {
          activities.push({
            id: kyc.id,
            type: 'kyc',
            user: usersMap.get(kyc.user_id) || 'Unknown User',
            description: `Submitted KYC verification`,
            time: new Date(kyc.created_at).toLocaleString(),
            icon: UserCheck,
            color: 'blue',
          })
        })
      }

      // Recent loan applications
      const { data: recentLoans, error: recentLoansError } = await supabase
        .from('loans')
        .select('id, user_id, loan_amount, created_at, status')
        .order('created_at', { ascending: false })
        .limit(3)

      if (!recentLoansError && recentLoans) {
        const loanUserIds = recentLoans.map(l => l.user_id)
        const { data: loanUsers } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', loanUserIds)

        const loanUsersMap = new Map(loanUsers?.map(u => [u.id, `${u.first_name} ${u.last_name}`]) || [])

        recentLoans.forEach(loan => {
          activities.push({
            id: loan.id,
            type: 'loan',
            user: loanUsersMap.get(loan.user_id) || 'Unknown User',
            description: `Applied for $${parseFloat(loan.loan_amount.toString()).toLocaleString()} loan`,
            time: new Date(loan.created_at).toLocaleString(),
            icon: DollarSign,
            color: 'yellow',
          })
        })
      }

      // Recent mobile deposits
      const { data: recentDeposits, error: recentDepositsError } = await supabase
        .from('mobile_deposits')
        .select('id, user_id, amount, created_at, status')
        .order('created_at', { ascending: false })
        .limit(2)

      if (!recentDepositsError && recentDeposits) {
        const depositUserIds = recentDeposits.map(d => d.user_id)
        const { data: depositUsers } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', depositUserIds)

        const depositUsersMap = new Map(depositUsers?.map(u => [u.id, `${u.first_name} ${u.last_name}`]) || [])

        recentDeposits.forEach(deposit => {
          activities.push({
            id: deposit.id,
            type: 'deposit',
            user: depositUsersMap.get(deposit.user_id) || 'Unknown User',
            description: `Mobile deposit of ${formatCurrency(parseFloat(deposit.amount.toString()))}`,
            time: new Date(deposit.created_at).toLocaleString(),
            icon: Smartphone,
            color: 'green',
          })
        })
      }

      // Recent support tickets
      const { data: recentTickets, error: recentTicketsError } = await supabase
        .from('support_tickets')
        .select('id, user_id, subject, created_at, status')
        .order('created_at', { ascending: false })
        .limit(2)

      if (!recentTicketsError && recentTickets) {
        const ticketUserIds = recentTickets.map(t => t.user_id)
        const { data: ticketUsers } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', ticketUserIds)

        const ticketUsersMap = new Map(ticketUsers?.map(u => [u.id, `${u.first_name} ${u.last_name}`]) || [])

        recentTickets.forEach(ticket => {
          activities.push({
            id: ticket.id,
            type: 'ticket',
            user: ticketUsersMap.get(ticket.user_id) || 'Unknown User',
            description: `Created support ticket: ${ticket.subject}`,
            time: new Date(ticket.created_at).toLocaleString(),
            icon: Bell,
            color: 'red',
          })
        })
      }

      // Update stats - always set stats even if some queries failed
      setStats({
        totalUsers,
        activeUsers,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        pendingKYC,
        pendingLoans,
        pendingMobileDeposits,
        pendingCryptoBuys,
        pendingCryptoSells,
        pendingSupportTickets,
        revenue: totalDeposits - totalWithdrawals,
        fraudAlerts,
      })

      setTransactionTrend(last7Days || [])
      setAccountTypes(accountTypesData || [])
      setRecentActivities(activities.slice(0, 10))
      
      console.log('[Admin Dashboard] Stats updated:', {
        totalUsers,
        activeUsers,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        pendingKYC,
        pendingLoans,
        pendingMobileDeposits,
        pendingCryptoBuys,
        pendingCryptoSells,
        pendingSupportTickets,
        revenue: totalDeposits - totalWithdrawals,
        fraudAlerts,
      })
    } catch (error) {
      console.error('[Admin Dashboard] Error fetching dashboard data:', error)
      // Even on error, try to set whatever stats we have
      // Don't keep previous stats - set to 0 to show that data couldn't be loaded
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingKYC: 0,
        pendingLoans: 0,
        pendingMobileDeposits: 0,
        pendingCryptoBuys: 0,
        pendingCryptoSells: 0,
        pendingSupportTickets: 0,
        revenue: 0,
        fraudAlerts: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    console.log('[Admin Dashboard] Component mounted, fetching data...')
    fetchDashboardData()
    
    // Set up comprehensive real-time subscriptions for all data
    const channels = [
      // User profiles changes (affects total users, active users)
      supabase
        .channel('admin_dashboard_user_profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
          console.log('[Admin Dashboard] User profiles changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // Accounts changes (affects total balance, account types)
      supabase
        .channel('admin_dashboard_accounts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, () => {
          console.log('[Admin Dashboard] Accounts changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // Transactions changes (affects deposits, withdrawals, trends)
      supabase
        .channel('admin_dashboard_transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          console.log('[Admin Dashboard] Transactions changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // KYC changes
      supabase
        .channel('admin_dashboard_kyc')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'kyc_verifications' }, () => {
          console.log('[Admin Dashboard] KYC changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // Loans changes
      supabase
        .channel('admin_dashboard_loans')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
          console.log('[Admin Dashboard] Loans changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // Mobile deposits changes
      supabase
        .channel('admin_dashboard_mobile_deposits')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mobile_deposits' }, () => {
          console.log('[Admin Dashboard] Mobile deposits changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // Crypto transactions changes
      supabase
        .channel('admin_dashboard_crypto')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crypto_transactions' }, () => {
          console.log('[Admin Dashboard] Crypto transactions changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
      
      // Support tickets changes
      supabase
        .channel('admin_dashboard_support_tickets')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
          console.log('[Admin Dashboard] Support tickets changed, refreshing...')
          fetchDashboardData()
        })
        .subscribe(),
    ]

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [])

  const quickActions = [
    { label: 'User Management', icon: Users, href: '/admin/users', color: '#047857' },
    { label: 'KYC Verification', icon: UserCheck, href: '/admin/kyc', color: '#3b82f6' },
    { label: 'Loan Applications', icon: DollarSign, href: '/admin/loans', color: '#f59e0b' },
    { label: 'Bills & Charges', icon: FileText, href: '/admin/bills', color: '#10b981' },
    { label: 'Mobile Deposits', icon: Smartphone, href: '/admin/mobile-deposits', color: '#06b6d4' },
    { label: 'Crypto Management', icon: Bitcoin, href: '/admin/crypto', color: '#8b5cf6' },
    { label: 'Support Tickets', icon: Bell, href: '/admin/support', color: '#f59e0b' },
    { label: 'Settings', icon: Settings, href: '/admin/settings', color: '#64748b' },
  ]

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {firstName}!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {(['today', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={clsx(
                  'px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all capitalize',
                  timeRange === range
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {loading ? '...' : stats.activeUsers.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(stats.totalBalance)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(stats.totalDeposits)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Deposits</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(stats.totalWithdrawals)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Withdrawals</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {loading ? '...' : formatCurrency(stats.revenue)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Net Revenue</p>
        </div>
      </div>

      {/* Pending Actions Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/admin/kyc">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-400" />
              </div>
              {stats.pendingKYC > 0 && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
                  {stats.pendingKYC} pending
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats.pendingKYC}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">KYC Pending</p>
          </div>
        </Link>

        <Link href="/admin/loans">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400" />
              </div>
              {stats.pendingLoans > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
                  {stats.pendingLoans} pending
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats.pendingLoans}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Loan Applications</p>
          </div>
        </Link>

        <Link href="/admin/mobile-deposits">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-400" />
              </div>
              {stats.pendingMobileDeposits > 0 && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-semibold">
                  {stats.pendingMobileDeposits} pending
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats.pendingMobileDeposits}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mobile Deposits</p>
          </div>
        </Link>

        <Link href="/admin/support">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 dark:text-red-400" />
              </div>
              {stats.pendingSupportTickets > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
                  {stats.pendingSupportTickets} pending
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {loading ? '...' : stats.pendingSupportTickets}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Support Tickets</p>
          </div>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Transaction Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Transaction Trends
            </h2>
            <button className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-semibold hover:underline self-start sm:self-auto">
              View Details
            </button>
          </div>
          {transactionTrend.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minHeight={250}>
              <AreaChart data={transactionTrend}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
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
              <Area
                type="monotone"
                dataKey="deposits"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorDeposits)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorWithdrawals)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="transfers"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTransfers)"
                strokeWidth={2}
              />
            </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              <p>No transaction data available yet</p>
            </div>
          )}
        </div>

        {/* Account Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Account Types
          </h2>
          {accountTypes.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={200} minHeight={200}>
              <RechartsPieChart>
                <Pie
                  data={accountTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
              >
                {accountTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
            </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              <p>No account data available yet</p>
            </div>
          )}
          {accountTypes.length > 0 && (
            <div className="space-y-2 mt-4">
              {accountTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">{type.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {type.value.toLocaleString()}
                </span>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <button className="w-full p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: action.color + '20' }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: action.color }} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-center">
                      {action.label}
                    </p>
                  </button>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Recent Activity
          </h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
              const Icon = activity.icon
              const colorMap = {
                green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
              }

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[activity.color as keyof typeof colorMap])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No recent activities</p>
            </div>
          )}
          {recentActivities.length > 0 && (
            <button className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all text-sm">
              View All Activity
            </button>
          )}
        </div>
      </div>

      {/* Crypto Pending Actions */}
      {(stats.pendingCryptoBuys > 0 || stats.pendingCryptoSells > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Crypto Pending Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/crypto">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Bitcoin className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
                  <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                    {stats.pendingCryptoBuys}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  BTC Buy Requests
                </p>
              </div>
            </Link>

            <Link href="/admin/crypto">
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <Bitcoin className="w-6 h-6 text-pink-700 dark:text-pink-400" />
                  <span className="text-2xl font-bold text-pink-700 dark:text-pink-400">
                    {stats.pendingCryptoSells}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  BTC Sell Requests
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

