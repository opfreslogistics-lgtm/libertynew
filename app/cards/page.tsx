'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCards, useCardTransactions } from '@/lib/hooks/useCards'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import {
  CreditCard,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Shield,
  Activity,
  Eye,
  EyeOff,
  ArrowUpRight,
  ShoppingCart,
  DollarSign,
  Clock,
  X,
} from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import NotificationModal from '@/components/NotificationModal'

// Allowed account types for cards (max 3)
const ALLOWED_ACCOUNT_TYPES = ['checking', 'savings', 'business']

export default function CardsPage() {
  const router = useRouter()
  const { cards, loading, error, refreshCards } = useCards()
  const [filteredCards, setFilteredCards] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({})
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
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

  // Filter cards to only show allowed account types (max 3)
  useEffect(() => {
    if (cards.length > 0) {
      const filtered = cards
        .filter(card => {
          const accountType = card.account_type?.toLowerCase() || ''
          return ALLOWED_ACCOUNT_TYPES.includes(accountType)
        })
        .slice(0, 3)
      setFilteredCards(filtered)
    }
  }, [cards])

  // Real-time subscription for balance updates
  useEffect(() => {
    const channel = supabase
      .channel('cards_balance_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'accounts',
      }, () => {
        refreshCards()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshCards])

  const handleFlipCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const handleBlockCard = async (cardId: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
      const { error } = await supabase
        .from('cards')
        .update({ status: newStatus })
        .eq('id', cardId)

      if (error) throw error

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Card Updated',
        message: `Card has been ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully.`,
      })

      refreshCards()
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update card status.',
      })
    }
  }

  const handleReportIssue = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push('/support')
  }

  const getAccountTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return 'Checking'
      case 'savings':
        return 'Savings'
      case 'business':
        return 'Business'
      default:
        return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Account'
    }
  }

  const getCardNetworkColor = (network: string) => {
    switch (network?.toLowerCase()) {
      case 'visa':
        return {
          gradient: 'from-[#1A1F71] via-[#1A237E] to-[#283593]',
          accent: '#1976D2',
          light: '#E3F2FD'
        }
      case 'mastercard':
        return {
          gradient: 'from-[#EB001B] via-[#F79E1B] to-[#FF5F00]',
          accent: '#FF6F00',
          light: '#FFF3E0'
        }
      case 'amex':
        return {
          gradient: 'from-[#006FCF] via-[#00A8E8] to-[#00D4FF]',
          accent: '#00B8D4',
          light: '#E0F7FA'
        }
      default:
        return {
          gradient: 'from-gray-700 via-gray-800 to-gray-900',
          accent: '#6B7280',
          light: '#F3F4F6'
        }
    }
  }

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '**** **** **** ****'
    const cleaned = cardNumber.replace(/\s/g, '')
    const last4 = cleaned.slice(-4)
    return `**** **** **** ${last4}`
  }

  // Calculate combined spending for all cards
  const getAllCardsTransactions = () => {
    if (selectedCardId) return []
    return filteredCards.flatMap(card => {
      // We'll fetch transactions for the selected card separately
      return []
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your cards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
        <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            My Cards
          </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage and monitor your payment cards
          </p>
        </div>
          <button
            onClick={() => refreshCards()}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
      </div>

      {filteredCards.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CreditCard className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-xl font-semibold mb-2">
              No Cards Available
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Cards are automatically created based on your account types during registration.
          </p>
        </div>
      ) : (
          <>
            {/* Cards Display - Horizontal, Small, Cute */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-6 justify-start items-start">
          {filteredCards.map((card) => (
                  <CompactCard
              key={card.id}
              card={card}
                    isFlipped={flippedCards[card.id] || false}
                    onFlip={(e) => handleFlipCard(card.id, e)}
                    onBlock={(e) => handleBlockCard(card.id, card.status, e)}
                    onViewDetails={() => setSelectedCardId(card.id)}
                    onReportIssue={handleReportIssue}
              getCardNetworkColor={getCardNetworkColor}
              getAccountTypeLabel={getAccountTypeLabel}
              maskCardNumber={maskCardNumber}
            />
          ))}
        </div>
            </div>

            {/* Unified Chart for All Cards */}
            {!selectedCardId && (
              <UnifiedSpendingChart cards={filteredCards} />
      )}

      {/* Card Details Modal */}
            {selectedCardId && (
        <CardDetailsModal
                card={filteredCards.find(c => c.id === selectedCardId)}
                onClose={() => setSelectedCardId(null)}
                getCardNetworkColor={getCardNetworkColor}
                getAccountTypeLabel={getAccountTypeLabel}
                maskCardNumber={maskCardNumber}
                refreshCards={refreshCards}
              />
            )}
          </>
        )}
      </div>

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

// Compact Card Component - Small, Cute, Horizontal
function CompactCard({
  card,
  isFlipped,
  onFlip,
  onBlock,
  onViewDetails,
  onReportIssue,
  getCardNetworkColor,
  getAccountTypeLabel,
  maskCardNumber,
}: {
  card: any
  isFlipped: boolean
  onFlip: (e: React.MouseEvent) => void
  onBlock: (e: React.MouseEvent) => void
  onViewDetails: () => void
  onReportIssue: (e: React.MouseEvent) => void
  getCardNetworkColor: (network: string) => any
  getAccountTypeLabel: (type: string) => string
  maskCardNumber: (number: string) => string
}) {
  const colors = getCardNetworkColor(card.card_network)
  const isBlocked = card.status === 'blocked'
  const cardNetworkUpper = card.card_network?.toUpperCase() || 'VISA'

  return (
    <div className="w-full sm:w-[320px] md:w-[340px] lg:w-[360px] flex-shrink-0">
      {/* Compact 3D Card */}
      <div className="perspective-1000 mb-4">
        <div
          className={`relative w-full h-56 sm:h-60 transform-style-3d transition-transform duration-500 cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={onFlip}
        >
          {/* Card Front */}
          <div
            className={`absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} p-5 text-white shadow-xl transform transition-all duration-300 hover:scale-[1.02] ${
              isBlocked ? 'opacity-60 grayscale' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm font-bold tracking-wider opacity-90">{cardNetworkUpper}</div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
          isBlocked ? 'bg-red-500/80' : 'bg-green-500/80'
        }`}>
          {isBlocked ? 'Blocked' : 'Active'}
        </div>
      </div>

            <div className="mb-6">
              <p className="text-2xl font-mono font-bold tracking-widest">
          {maskCardNumber(card.card_number)}
        </p>
      </div>

            <div className="flex items-end justify-between">
        <div>
                <p className="text-xs opacity-75 mb-1">CARDHOLDER</p>
                <p className="text-base font-semibold uppercase">
                  {(card.cardholder_name || 'CARDHOLDER').slice(0, 20)}
                </p>
        </div>
        <div className="text-right">
                <p className="text-xs opacity-75 mb-1">EXPIRES</p>
          <p className="text-base font-semibold">
                  {card.expiration_month || 'MM'}/{card.expiration_year || 'YY'}
          </p>
        </div>
      </div>

            <div className="absolute bottom-4 left-4">
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <p className="text-xs font-semibold">{getAccountTypeLabel(card.account_type)}</p>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br ${colors.gradient} p-5 text-white shadow-xl ${
              isBlocked ? 'opacity-60' : ''
            }`}
          >
            <div className="absolute top-6 left-0 right-0 h-10 bg-black/80" />
            <div className="mt-24">
              <div className="bg-black/40 rounded-lg p-4">
          <p className="text-xs opacity-75 mb-2">CVV</p>
                <p className="text-2xl font-mono font-bold">•••</p>
              </div>
          </div>
        </div>
        </div>
      </div>

      {/* Compact Controls */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {getAccountTypeLabel(card.account_type)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(card.account_balance || 0)}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            isBlocked
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {isBlocked ? 'Blocked' : 'Active'}
          </div>
      </div>

        <div className="grid grid-cols-2 gap-3">
        <button
            onClick={onBlock}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            isBlocked
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
            {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isBlocked ? 'Unblock' : 'Block'}
        </button>
        <button
            onClick={onViewDetails}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
        >
          <Activity className="w-4 h-4" />
          Details
        </button>
          <button
            onClick={onReportIssue}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-all col-span-2"
          >
            <Shield className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>
    </div>
  )
}

// Unified Spending Chart Component
function UnifiedSpendingChart({ cards }: { cards: any[] }) {
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true)
        const cardIds = cards.map(c => c.id)
        
        if (cardIds.length === 0) {
          setAllTransactions([])
          setLoading(false)
          return
        }

        // Fetch all transactions for user's cards (includes admin transactions)
        const { data, error } = await supabase
          .from('card_transactions')
          .select('*')
          .in('card_id', cardIds)
          .order('created_at', { ascending: false })
          .limit(1000)

        if (error) throw error
        // This includes all transactions: user transactions and admin-initiated transactions
        setAllTransactions(data || [])
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setAllTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllTransactions()
  }, [cards])

  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const weeklySpending = last7Days.map(date => {
    const dayTransactions = allTransactions.filter(txn => 
      new Date(txn.created_at).toISOString().split('T')[0] === date
    )
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount?.toString() || '0') || 0), 0)
    }
  })

  const totalSpent = allTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount?.toString() || '0') || 0), 0)

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-green-600" />
        Combined Spending Overview
      </h2>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : weeklySpending.some(d => d.amount > 0) ? (
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklySpending}>
              <defs>
                <linearGradient id="combinedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#combinedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Spent: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No spending data available</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Card Details Modal Component
function CardDetailsModal({
  card,
  onClose,
  getCardNetworkColor,
  getAccountTypeLabel,
  maskCardNumber,
  refreshCards,
}: {
  card: any
  onClose: () => void
  getCardNetworkColor: (network: string) => any
  getAccountTypeLabel: (type: string) => string
  maskCardNumber: (number: string) => string
  refreshCards: () => void
}) {
  const { transactions, loading: transactionsLoading } = useCardTransactions(card?.id)
  const [showCVV, setShowCVV] = useState(false)
  const colors = card ? getCardNetworkColor(card.card_network) : null
  const isBlocked = card?.status === 'blocked'
  const cardNetworkUpper = card?.card_network?.toUpperCase() || 'VISA'

  // Calculate spending data for this specific card
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const weeklySpending = last7Days.map(date => {
    const dayTransactions = transactions.filter(txn => 
      new Date(txn.created_at).toISOString().split('T')[0] === date
    )
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount?.toString() || '0') || 0), 0)
    }
  })

  // Category breakdown
  const categorySpending: { [key: string]: number } = {}
  transactions.forEach(txn => {
    const category = txn.merchant_name || txn.transaction_type || 'Other'
    categorySpending[category] = (categorySpending[category] || 0) + (parseFloat(txn.amount?.toString() || '0') || 0)
  })

  const pieData = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const totalSpentThisMonth = transactions
    .filter(txn => {
      const txnDate = new Date(txn.created_at)
      return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, txn) => sum + (parseFloat(txn.amount?.toString() || '0') || 0), 0)

  const last5Transactions = transactions.slice(0, 5)

  const CHART_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

  if (!card) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getAccountTypeLabel(card.account_type)} Card Details
              </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Spending Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Spending Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Weekly Spending
              </h3>
              {weeklySpending.length > 0 && weeklySpending.some(d => d.amount > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklySpending}>
                    <defs>
                      <linearGradient id={`detailGradient-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors?.accent || '#10b981'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors?.accent || '#10b981'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={colors?.accent || '#10b981'}
                      strokeWidth={3}
                      fill={`url(#detailGradient-${card.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No spending data available
                </div>
              )}
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Category Breakdown
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Total Spent This Month */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
          <div>
                <p className="text-white/80 text-sm mb-1">Total Spent This Month</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalSpentThisMonth)}</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Last 5 Transactions */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Transactions
            </h3>
            {last5Transactions.length > 0 ? (
              <div className="space-y-3">
                {last5Transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        txn.transaction_type === 'debit' || txn.transaction_type === 'purchase'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {txn.transaction_type === 'debit' || txn.transaction_type === 'purchase' ? (
                          <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {txn.merchant_name || txn.transaction_type || 'Transaction'}
                      </p>
                        <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(txn.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {txn.reference_number && (
                            <span className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {txn.reference_number}
                            </span>
                        )}
                      </div>
                    </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        txn.transaction_type === 'debit' || txn.transaction_type === 'purchase'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {(txn.transaction_type === 'debit' || txn.transaction_type === 'purchase') ? '-' : '+'}
                        {formatCurrency(parseFloat(txn.amount?.toString() || '0'))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
