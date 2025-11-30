'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { useTransactions } from '@/lib/hooks/useTransactions'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Download,
  Eye,
  EyeOff,
  PiggyBank,
  Zap,
  Shield,
  Award,
  Building2,
  Target,
  Activity,
  DollarSign,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Sparkles,
  TrendingUpIcon,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

// Elite color palette
const COLORS = {
  primary: '#047857',
  primaryLight: '#10b981',
  primaryDark: '#065f46',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
}

const CHART_COLORS = ['#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']

export default function DashboardPage() {
  const { budgets } = useStore()
  const { accounts, loading: accountsLoading, refreshAccounts } = useAccounts() // Fetch real accounts from database
  const { transactions: dbTransactions, refreshTransactions } = useTransactions() // Fetch real transactions from database
  const [showBalance, setShowBalance] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const { profile, fullName } = useUserProfile()
  
  // Get first name for welcome message
  const firstName = profile?.first_name || 'User'

  // Convert database transactions to store format for compatibility
  const transactions = dbTransactions.map(txn => ({
    id: txn.id,
    accountId: txn.account_id || '',
    type: txn.type,
    amount: txn.amount,
    description: txn.description || '',
    category: txn.category || '',
    date: new Date(txn.date),
    pending: txn.pending,
    merchant: txn.merchant || undefined,
    location: undefined,
  }))

  // Refresh transactions and accounts when component mounts (only once)
  useEffect(() => {
    refreshTransactions()
    refreshAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-refresh accounts when page becomes visible (user navigates back)
  // Use a ref to prevent multiple simultaneous refreshes
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !accountsLoading) {
        // Clear any pending refresh
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
        // Debounce the refresh
        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccounts()
          refreshTransactions()
        }, 500)
      }
    }

    const handleFocus = () => {
      if (!accountsLoading) {
        // Clear any pending refresh
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
        // Debounce the refresh
        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccounts()
          refreshTransactions()
        }, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Helper function to safely parse balance
  const parseBalance = (balance: any): number => {
    if (balance === null || balance === undefined) return 0
    if (typeof balance === 'number') return balance
    if (typeof balance === 'string') {
      const parsed = parseFloat(balance)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  // Calculate balances from real accounts with safe parsing
  const checkingBalance = parseBalance(accounts.find(acc => acc.account_type === 'checking')?.balance)
  const savingsBalance = parseBalance(accounts.find(acc => acc.account_type === 'savings')?.balance)
  const businessBalance = parseBalance(accounts.find(acc => acc.account_type === 'business')?.balance)
  const fixedDepositBalance = parseBalance(accounts.find(acc => acc.account_type === 'fixed-deposit')?.balance)
  const totalBalance = accounts.reduce((sum, acc) => sum + parseBalance(acc.balance), 0)

  // Calculate financial metrics from real transactions
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Filter transactions: only completed, non-pending transactions in current month
  const monthlyTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date)
    const isCurrentMonth = txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear
    // Only count completed, non-pending transactions (same as balance trigger logic)
    const isCompleted = !txn.pending
    return isCurrentMonth && isCompleted
  })
  
  // Calculate monthly income (credits only)
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
  
  // Calculate monthly expenses (debits only)
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
  
  // Calculate monthly savings and rate
  const monthlySavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 
    ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) 
    : '0.0'

  // Calculate balance trend data from transactions (last 6 months)
  const calculateBalanceTrend = () => {
    const trendData: { date: string; balance: number }[] = []
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0)
      
      // Calculate balance up to the end of this month
      let balance = 0
      transactions.forEach(txn => {
        const txnDate = new Date(txn.date)
        if (txnDate <= monthEnd) {
          if (txn.type === 'credit') {
            balance += txn.amount
          } else {
            balance -= txn.amount
          }
        }
      })
      
      trendData.push({
        date: monthName,
        balance: balance,
      })
    }
    
    return trendData.length > 0 ? trendData : [
      { date: 'Jan', balance: 0 },
      { date: 'Feb', balance: 0 },
      { date: 'Mar', balance: 0 },
      { date: 'Apr', balance: 0 },
      { date: 'May', balance: 0 },
      { date: 'Jun', balance: 0 },
    ]
  }

  const balanceTrendData = calculateBalanceTrend()

  // Calculate spending by category from transactions
  const calculateSpendingByCategory = () => {
    const categoryMap: { [key: string]: number } = {}
    
    transactions
      .filter(t => t.type === 'debit')
      .forEach(txn => {
        const category = txn.category || 'Other'
        categoryMap[category] = (categoryMap[category] || 0) + txn.amount
      })
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value,
        color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 categories
  }

  const spendingData = calculateSpendingByCategory()

  // Calculate income vs expenses by month (last 6 months)
  const calculateIncomeExpenses = () => {
    const monthData: { [key: string]: { income: number; expenses: number } } = {}
    
    transactions.forEach(txn => {
      const txnDate = new Date(txn.date)
      const monthKey = txnDate.toLocaleString('default', { month: 'short' })
      
      if (!monthData[monthKey]) {
        monthData[monthKey] = { income: 0, expenses: 0 }
      }
      
      if (txn.type === 'credit') {
        monthData[monthKey].income += txn.amount
      } else {
        monthData[monthKey].expenses += txn.amount
      }
    })
    
    // Generate last 6 months
    const result: { month: string; income: number; expenses: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      result.push({
        month: monthName,
        income: monthData[monthName]?.income || 0,
        expenses: monthData[monthName]?.expenses || 0,
      })
    }
    
    return result.length > 0 ? result : [
      { month: 'Jan', income: 0, expenses: 0 },
      { month: 'Feb', income: 0, expenses: 0 },
      { month: 'Mar', income: 0, expenses: 0 },
      { month: 'Apr', income: 0, expenses: 0 },
      { month: 'May', income: 0, expenses: 0 },
      { month: 'Jun', income: 0, expenses: 0 },
    ]
  }

  const incomeExpensesData = calculateIncomeExpenses()

  // Recent transactions - Use real transactions with new format
  const recentTransactions = transactions.slice(0, 5).map((txn) => {
    // Parse description to extract transaction type and reference
    const description = txn.description || ''
    
    // Extract reference number from description (format: "TYPE – REF123456")
    let displayName = description
    let referenceNumber = ''
    
    // Try to extract reference number
    const refMatch = description.match(/REF\d{6}/)
    if (refMatch) {
      referenceNumber = refMatch[0]
      // Extract transaction type (everything before "–")
      const typeMatch = description.match(/^([^–]+)/)
      if (typeMatch) {
        displayName = description.trim()
      }
    }
    
    // If no reference found, use description as-is
    if (!referenceNumber) {
      displayName = description || txn.category || 'Transaction'
    }
    
    // Format date as "MMM DD, YYYY"
    const formattedDate = new Date(txn.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    // Determine debit/credit label based on status
    let debitCreditLabel = ''
    if (txn.status === 'cancelled') {
      debitCreditLabel = 'Cancelled'
    } else if (txn.pending) {
      // For pending transactions, show "Pending Credit" or "Pending Debit"
      debitCreditLabel = txn.type === 'credit' ? 'Pending Credit' : 'Pending Debit'
    } else {
      debitCreditLabel = txn.type === 'credit' ? 'Credited' : 'Debited'
    }
    
    return {
      id: txn.id,
      name: displayName,
      subtitle: `${debitCreditLabel} • ${formattedDate}`,
      amount: txn.amount,
      type: txn.type === 'credit' ? 'income' : 'expense',
      date: formattedDate,
      category: txn.category || 'Transaction',
      transactionType: txn.type,
      status: txn.status,
      pending: txn.pending,
    }
  })

  return (
    <>
      {/* Hero Section with Quick Stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your money today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link href="/transfer">
              <button className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
                <Send className="w-4 h-4" />
                Send Money
              </button>
            </Link>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Welcome to Liberty Bank!</h3>
                <p className="text-white/90 text-sm">Get started by funding your account or making a deposit</p>
              </div>
            </div>
            <button className="hidden md:flex px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-semibold transition-all items-center gap-2">
              View Insights
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Total Balance Card - Premium */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">Total Balance</p>
                <p className="text-xs text-white/70">All accounts combined</p>
              </div>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-3 hover:bg-white/10 rounded-xl transition-all">
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-5xl md:text-6xl font-bold mb-3">
              {showBalance ? formatCurrency(totalBalance) : '••••••'}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80">Start banking with Liberty</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-xs mb-1 font-medium">Monthly Income</p>
              <p className="text-xl font-bold">{formatCurrency(monthlyIncome)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-xs mb-1 font-medium">Expenses</p>
              <p className="text-xl font-bold">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-xs mb-1 font-medium">Saved</p>
              <p className="text-xl font-bold text-green-100">{formatCurrency(monthlySavings)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-xs mb-1 font-medium">Savings Rate</p>
              <p className="text-xl font-bold text-green-100">{savingsRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid - Display only real accounts from database */}
      {accountsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Loading accounts...</p>
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Accounts Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Contact support to create your first account</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${accounts.length >= 3 ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
          {accounts.slice(0, 3).map((account) => {
            const getAccountConfig = (type: string) => {
              switch (type) {
                case 'checking':
                  return {
                    icon: Wallet,
                    name: 'Checking',
                    bgGradient: 'bg-gradient-to-br from-green-700 to-green-800',
                    textColor: 'text-white',
                    cardBg: 'bg-white/20',
                    badgeColor: 'bg-white/20',
                    badgeText: 'text-white',
                    isFeatured: true,
                  }
                case 'savings':
                  return {
                    icon: PiggyBank,
                    name: 'Savings',
                    bgGradient: '',
                    textColor: 'text-gray-900 dark:text-white',
                    cardBg: 'bg-green-100 dark:bg-green-900/30',
                    badgeColor: 'bg-green-100 dark:bg-green-900/30',
                    badgeText: 'text-green-700 dark:text-green-400',
                    isFeatured: false,
                  }
                case 'business':
                  return {
                    icon: Building2,
                    name: 'Business',
                    bgGradient: '',
                    textColor: 'text-gray-900 dark:text-white',
                    cardBg: 'bg-blue-100 dark:bg-blue-900/30',
                    badgeColor: 'bg-blue-100 dark:bg-blue-900/30',
                    badgeText: 'text-blue-700 dark:text-blue-400',
                    isFeatured: false,
                  }
                case 'fixed-deposit':
                  return {
                    icon: Target,
                    name: 'Fixed Deposit',
                    bgGradient: '',
                    textColor: 'text-gray-900 dark:text-white',
                    cardBg: 'bg-purple-100 dark:bg-purple-900/30',
                    badgeColor: 'bg-purple-100 dark:bg-purple-900/30',
                    badgeText: 'text-purple-700 dark:text-purple-400',
                    isFeatured: false,
                  }
                default:
                  return {
                    icon: Wallet,
                    name: account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1),
                    bgGradient: '',
                    textColor: 'text-gray-900 dark:text-white',
                    cardBg: 'bg-gray-100 dark:bg-gray-700',
                    badgeColor: 'bg-gray-100 dark:bg-gray-700',
                    badgeText: 'text-gray-700 dark:text-gray-400',
                    isFeatured: false,
                  }
              }
            }

            const config = getAccountConfig(account.account_type)
            const Icon = config.icon
            const accountBalance = parseBalance(account.balance)

            if (config.isFeatured) {
              return (
                <div key={account.id} className="group bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-white/90 text-sm font-semibold">{config.name}</p>
                          <p className="text-white/60 text-xs">****{account.last4}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-3xl md:text-4xl font-bold mb-3">
                      {showBalance ? formatCurrency(accountBalance) : '••••••'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Available Balance</span>
                      <div className="flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full font-semibold">
                        <Activity className="w-3 h-3" />
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={account.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${config.cardBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${config.textColor}`} />
                      </div>
                      <div>
                        <p className={`${config.textColor} text-sm font-semibold`}>{config.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">****{account.last4}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 ${config.cardBg} rounded-lg flex items-center justify-center`}>
                      <Activity className={`w-4 h-4 ${config.textColor}`} />
                    </div>
                  </div>
                  <p className={`text-3xl md:text-4xl font-bold ${config.textColor} mb-3`}>
                    {showBalance ? formatCurrency(accountBalance) : '••••••'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Available Balance</span>
                    <span className={`text-xs ${config.badgeColor} ${config.badgeText} px-2 py-1 rounded-full font-semibold`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                </div>
              )
            }
          })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Balance Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Balance Trend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                6M
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                1Y
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={balanceTrendData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
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
              />
              <Area type="monotone" dataKey="balance" stroke="#047857" strokeWidth={3} fill="url(#balanceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Spending Breakdown</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">This month</p>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <PieChartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
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
          <div className="grid grid-cols-2 gap-3 mt-4">
            {spendingData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your latest activity</p>
          </div>
          <Link href="/history">
            <button className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' :
                  transaction.type === 'expense' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowDownLeft className={`w-5 h-5 text-green-600 dark:text-green-400`} />
                  ) : transaction.type === 'expense' ? (
                    <ArrowUpRight className={`w-5 h-5 text-red-600 dark:text-red-400`} />
                  ) : (
                    <Send className={`w-5 h-5 text-blue-600 dark:text-blue-400`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{transaction.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.subtitle}</p>
                </div>
              </div>
              <p className={`text-lg font-bold text-right flex-shrink-0 ml-4 ${
                transaction.type === 'income' ? 'text-green-600 dark:text-green-400' :
                'text-gray-900 dark:text-white'
              }`}>
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/transfer">
          <button className="w-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6 text-green-700 dark:text-green-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Transfer</p>
          </button>
        </Link>
        <Link href="/budget">
          <button className="w-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-purple-700 dark:text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Budget</p>
          </button>
        </Link>
        <Link href="/crypto">
          <button className="w-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:scale-105 active:scale-95 group">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <TrendingUpIcon className="w-6 h-6 text-orange-700 dark:text-orange-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Crypto</p>
          </button>
        </Link>
      </div>
    </>
  )
}
