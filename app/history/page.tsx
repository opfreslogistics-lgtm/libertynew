'use client'

import { useState, useEffect } from 'react'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatCurrency, formatDate } from '@/lib/utils'
import React from 'react'
import { useTransactions } from '@/lib/hooks/useTransactions'
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  X,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  ShoppingBag,
  Coffee,
  Car,
  Home as HomeIcon,
  Smartphone,
  Film,
  Utensils,
  Briefcase,
  DollarSign,
  MapPin,
  Receipt,
  Tag,
  BarChart3,
  PieChart as PieChartIcon,
  SlidersHorizontal,
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
} from 'recharts'

const COLORS = ['#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']

export default function HistoryPage() {
  const { accounts } = useAccounts() // Only use real accounts from database
  const { transactions: dbTransactions, refreshTransactions } = useTransactions()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('30days')
  const [category, setCategory] = useState('all')
  const [transactionType, setTransactionType] = useState<'all' | 'credit' | 'debit'>('all')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Convert database transactions to store format for compatibility
  const rawTransactions = dbTransactions.map(txn => ({
    id: txn.id,
    accountId: txn.account_id || '',
    type: txn.type,
    amount: txn.amount,
    description: txn.description || '',
    category: txn.category || '',
    date: new Date(txn.date),
    pending: txn.pending,
    status: txn.status || 'completed', // Ensure status is always present
    merchant: txn.merchant || undefined,
    location: undefined,
  }))

  // Deduplicate transactions: Remove pending transactions if a completed version exists
  // Extract reference number from description for better matching
  const extractReferenceNumber = (description: string): string => {
    if (!description) return ''
    // Match patterns like "BTC SELL – REF123456" or "MD – REF123456"
    const refMatch = description.match(/REF\d{6}/i)
    if (refMatch) return refMatch[0]
    // If no reference, use the full description
    return description
  }
  
  const transactionMap = new Map<string, typeof rawTransactions[0]>()
  
  rawTransactions.forEach(txn => {
    // Extract reference number for better matching (works even if account_id differs)
    const refNumber = extractReferenceNumber(txn.description || '')
    
    // Create a key based on reference number, amount, and type
    // Don't include accountId since pending transactions may have null accountId
    const key = refNumber 
      ? `${refNumber}_${txn.amount}_${txn.type}`
      : `${txn.description || ''}_${txn.amount}_${txn.type}_${txn.accountId || 'null'}`
    
    const existing = transactionMap.get(key)
    
    if (!existing) {
      // No existing transaction with this key, add it
      transactionMap.set(key, txn)
    } else {
      // Transaction with same key exists
      const existingIsPending = existing.pending === true || existing.status === 'pending'
      const currentIsPending = txn.pending === true || txn.status === 'pending'
      
      if (existingIsPending && !currentIsPending) {
        // Existing is pending, current is completed - replace with completed
        transactionMap.set(key, txn)
      } else if (!existingIsPending && currentIsPending) {
        // Existing is completed, current is pending - keep completed (don't replace)
        // Do nothing, keep existing
      } else if (existingIsPending && currentIsPending) {
        // Both are pending - keep the most recent one
        if (new Date(txn.date) > new Date(existing.date)) {
          transactionMap.set(key, txn)
        }
      } else {
        // Both are completed - keep the most recent one
        if (new Date(txn.date) > new Date(existing.date)) {
          transactionMap.set(key, txn)
        }
      }
    }
  })
  
  // Convert map back to array
  const transactions = Array.from(transactionMap.values())

  const categories = [
    { name: 'All Categories', value: 'all', icon: Filter },
    { name: 'Food & Dining', value: 'Food & Dining', icon: Utensils },
    { name: 'Transport', value: 'Transport', icon: Car },
    { name: 'Income', value: 'Income', icon: DollarSign },
    { name: 'Entertainment', value: 'Entertainment', icon: Film },
    { name: 'Shopping', value: 'Shopping', icon: ShoppingBag },
    { name: 'Bills', value: 'Bills', icon: Receipt },
  ]

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.value === categoryName)
    return cat ? cat.icon : Tag
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === 'all' || t.category === category
    const matchesType = transactionType === 'all' || t.type === transactionType
    const matchesAccount = selectedAccount === 'all' || t.accountId === selectedAccount
    const matchesMinAmount = !minAmount || t.amount >= parseFloat(minAmount)
    const matchesMaxAmount = !maxAmount || t.amount <= parseFloat(maxAmount)
    
    return matchesSearch && matchesCategory && matchesType && matchesAccount && matchesMinAmount && matchesMaxAmount
  })

  // All transactions go to posted section (no separate pending section)
  // Filter out cancelled transactions
  const postedTransactions = filteredTransactions.filter((t) => 
    t.status !== 'cancelled'
  )
  
  // Calculate pending total for the chart
  const pendingTotal = filteredTransactions
    .filter(t => t.pending === true || t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)

  const transaction = selectedTransaction
    ? transactions.find((t) => t.id === selectedTransaction)
    : null

  // Calculate statistics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  // Spending by category
  const spendingByCategory = categories
    .filter(c => c.value !== 'all')
    .map(cat => ({
      name: cat.name,
      value: filteredTransactions
        .filter(t => t.category === cat.value && t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0)
    }))
    .filter(item => item.value > 0)

  // Daily spending trend
  const dailyData = filteredTransactions
    .reduce((acc: any[], t) => {
      const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = acc.find(item => item.date === date)
      if (existing) {
        if (t.type === 'credit') existing.income += t.amount
        else existing.expenses += t.amount
      } else {
        acc.push({
          date,
          income: t.type === 'credit' ? t.amount : 0,
          expenses: t.type === 'debit' ? t.amount : 0,
        })
      }
      return acc
    }, [])
    .slice(-7)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and analyze your account activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Income
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total received</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Expenses
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total spent</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
              Net
            </span>
          </div>
          <p className={`text-3xl font-bold mb-1 ${totalIncome - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Net cash flow</p>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="credit">Income Only</option>
                <option value="debit">Expenses Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="input-field"
              >
                <option value="all">All Accounts</option>
                {accounts.map((acc) => {
                  const accountName = acc.account_type 
                    ? `${acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} Account`
                    : acc.name || 'Account'
                  return (
                    <option key={acc.id} value={acc.id}>{accountName}</option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Min Amount
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="$0"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Max Amount
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="No limit"
                className="input-field"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCategory('all')
                  setTransactionType('all')
                  setSelectedAccount('all')
                  setMinAmount('')
                  setMaxAmount('')
                  setDateRange('30days')
                }}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Category Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">7-Day Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGradient)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expensesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pending Total */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pending Total</h3>
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrency(pendingTotal)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTransactions.filter(t => t.pending === true || t.status === 'pending').length} pending transaction{filteredTransactions.filter(t => t.pending === true || t.status === 'pending').length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* All Transactions (Posted) */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              All Transactions ({postedTransactions.length})
            </h2>
            <div className="space-y-2">
              {postedTransactions.length > 0 ? (
                postedTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => setSelectedTransaction(transaction.id)}
                    isSelected={selectedTransaction === transaction.id}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No transactions found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Detail Panel */}
        <div className="lg:col-span-1">
          {transaction ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Details
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                  <p
                    className={`text-4xl font-bold mb-2 ${
                      transaction.type === 'credit'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      (transaction.pending || transaction.status === 'pending')
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : transaction.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {(transaction.pending || transaction.status === 'pending') ? 'Awaiting Approval' : transaction.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date & Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                  <div className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon(transaction.category), {
                      className: 'w-4 h-4 text-gray-600 dark:text-gray-400'
                    })}
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {transaction.category}
                    </p>
                  </div>
                </div>

                {transaction.merchant && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Merchant</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {transaction.merchant}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {transaction.id}
                  </p>
                </div>

                <button className="w-full mt-4 px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-20">
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a transaction to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TransactionCard({
  transaction,
  onClick,
  isSelected,
  getCategoryIcon,
}: {
  transaction: any
  onClick: () => void
  isSelected: boolean
  getCategoryIcon: (category: string) => any
}) {
  const isCredit = transaction.type === 'credit'
  const CategoryIcon = getCategoryIcon(transaction.category)

  // Parse description to get transaction type and reference
  const description = transaction.description || ''
  
  // Format date as "MMM DD, YYYY"
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  // Determine debit/credit label based on status
  // Check both pending field and status field for accuracy
  const isPending = transaction.pending === true || transaction.status === 'pending'
  let debitCreditLabel = ''
  if (transaction.status === 'cancelled') {
    debitCreditLabel = 'Cancelled'
  } else if (isPending) {
    // For pending transactions, show "Pending Credit" or "Pending Debit"
    debitCreditLabel = isCredit ? 'Pending Credit' : 'Pending Debit'
  } else if (transaction.status === 'completed') {
    // For completed transactions, show "Credited" or "Debited"
    debitCreditLabel = isCredit ? 'Credited' : 'Debited'
  } else {
    // Default to "Credited" or "Debited" based on type
    debitCreditLabel = isCredit ? 'Credited' : 'Debited'
  }
  
  // Display name is the full description (already in format "TYPE – REF123456")
  const displayName = description || transaction.category || 'Transaction'
  const subtitle = `${debitCreditLabel} • ${formattedDate}`

  return (
    <button
      onClick={onClick}
      className={`w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border transition-all hover:shadow-xl text-left ${
        isSelected
          ? 'border-green-700 ring-2 ring-green-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCredit
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          <CategoryIcon
            className={`w-6 h-6 ${
              isCredit
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p
            className={`text-lg font-bold ${
              isCredit
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(transaction.amount)}
          </p>
          {(transaction.pending || transaction.status === 'pending') && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
              Awaiting Approval
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
