'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, generateReferenceNumber } from '@/lib/utils'
import NotificationModal from '@/components/NotificationModal'
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  RefreshCw,
  User,
  Building2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  CreditCard as CardIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'

interface Card {
  id: string
  user_id: string
  account_id: string
  card_number: string
  card_network: 'visa' | 'mastercard' | 'amex'
  cardholder_name: string
  expiration_month: string
  expiration_year: string
  status: 'active' | 'blocked' | 'expired' | 'cancelled'
  last4?: string
  account_type?: string
  account_balance?: number
  user_name?: string
  user_email?: string
}

export default function AdminCardSpenderPage() {
  const [users, setUsers] = useState<any[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [selectedAccountType, setSelectedAccountType] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [modalAccountType, setModalAccountType] = useState<string>('')
  const [modalUserId, setModalUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all')
  const [actionType, setActionType] = useState<'debit' | 'credit' | 'atm_withdrawal' | 'online_purchase' | 'fee' | 'chargeback' | 'refund'>('debit')
  const [amount, setAmount] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [showActionModal, setShowActionModal] = useState(false)
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
    fetchUsers()
    fetchAllCards()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAllCards = async () => {
    try {
      setLoading(true)
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select(`
          *,
          accounts:account_id (
            account_type,
            balance
          ),
          user_profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (cardsError) throw cardsError

      const transformedCards = (cardsData || []).map((card: any) => ({
        ...card,
        account_type: card.accounts?.account_type || '',
        account_balance: card.accounts?.balance ? parseFloat(card.accounts.balance.toString()) : 0,
        user_name: card.user_profiles 
          ? `${card.user_profiles.first_name || ''} ${card.user_profiles.last_name || ''}`.trim()
          : 'Unknown',
        user_email: card.user_profiles?.email || '',
        last4: card.last4 || (card.card_number ? card.card_number.slice(-4) : ''),
      }))

      setCards(transformedCards as Card[])
    } catch (error: any) {
      console.error('Error fetching cards:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch cards.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCardAction = async () => {
    if (!selectedCardId || !amount || parseFloat(amount) <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please select a card and enter a valid amount.',
      })
      return
    }

    const selectedCard = cards.find(c => c.id === selectedCardId)
    if (!selectedCard) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Selected card not found.',
      })
      return
    }

    if (selectedCard.status === 'blocked') {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Card Blocked',
        message: 'Cannot perform actions on a blocked card. Please unblock it first.',
      })
      return
    }

    setActionLoading(true)
    try {
      const { data: { user: adminUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      const actionAmount = parseFloat(amount)
      const refNum = generateReferenceNumber()
      
      // Determine if this is a debit or credit transaction
      const isDebit = ['debit', 'atm_withdrawal', 'online_purchase', 'fee', 'chargeback'].includes(actionType)
      const transactionType = isDebit ? 'debit' : 'credit'
      
      // Determine transaction description based on action type
      let transactionDescription = ''
      let cardTransactionType = ''
      
      switch (actionType) {
        case 'debit':
          transactionDescription = `CARD PURCHASE – ${refNum}`
          cardTransactionType = 'purchase'
          break
        case 'credit':
          transactionDescription = `CARD CREDIT – ${refNum}`
          cardTransactionType = 'topup'
          break
        case 'atm_withdrawal':
          transactionDescription = `ATM WITHDRAWAL – ${refNum}`
          cardTransactionType = 'atm_withdrawal'
          break
        case 'online_purchase':
          transactionDescription = `ONLINE PURCHASE – ${refNum}`
          cardTransactionType = 'purchase'
          break
        case 'fee':
          transactionDescription = `CARD FEE – ${refNum}`
          cardTransactionType = 'fee'
          break
        case 'chargeback':
          transactionDescription = `CHARGEBACK – ${refNum}`
          cardTransactionType = 'chargeback'
          break
        case 'refund':
          transactionDescription = `CARD REFUND – ${refNum}`
          cardTransactionType = 'refund'
          break
        default:
          transactionDescription = `CARD TRANSACTION – ${refNum}`
          cardTransactionType = 'purchase'
      }

      // Check current account balance for insufficient funds check
      const { data: accountData, error: accountFetchError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', selectedCard.account_id)
        .single()

      if (accountFetchError) throw accountFetchError

      const currentBalance = parseFloat(accountData.balance.toString() || '0')
      
      // Check for insufficient funds before proceeding
      if (isDebit && currentBalance < actionAmount) {
        throw new Error('Insufficient funds. Transaction declined.')
      }

      // Create transaction in main transactions table FIRST
      // The database trigger will automatically update the account balance
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: selectedCard.user_id,
            account_id: selectedCard.account_id,
            type: transactionType,
            category: 'Card Transaction',
            amount: actionAmount,
            description: transactionDescription,
            merchant: merchantName || null,
            status: 'completed',
            pending: false,
            date: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (transactionError) throw transactionError

      // Wait a moment for the trigger to update the balance
      await new Promise(resolve => setTimeout(resolve, 300))

      // Create card transaction record
      const { error: cardTransactionError } = await supabase
        .from('card_transactions')
        .insert([
          {
            card_id: selectedCardId,
            user_id: selectedCard.user_id,
            account_id: selectedCard.account_id,
            transaction_id: transactionData.id,
            transaction_type: cardTransactionType,
            amount: actionAmount,
            merchant_name: merchantName || null,
            reference_number: refNum,
          },
        ])

      if (cardTransactionError) throw cardTransactionError

      // Update card last_used_at
      await supabase
        .from('cards')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', selectedCardId)

      // Create action label for notification
      const actionLabels: Record<string, string> = {
        debit: 'Card Purchase',
        credit: 'Card Top-Up',
        atm_withdrawal: 'ATM Withdrawal',
        online_purchase: 'Online Purchase',
        fee: 'Card Fee',
        chargeback: 'Chargeback',
        refund: 'Card Refund',
      }
      const actionLabel = actionLabels[actionType] || 'Card Transaction'

      // Create notification for user
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: selectedCard.user_id,
            type: 'transaction',
            title: actionLabel,
            message: `${actionLabel} of ${formatCurrency(actionAmount)}${merchantName ? ` at ${merchantName}` : ''} has been processed on your ${selectedCard.account_type || 'card'}. Reference: ${refNum}`,
            read: false,
          },
        ])

      // Send email notifications (non-blocking)
      const { sendCardTransactionNotification } = await import('@/lib/utils/emailNotifications')
      
      // Get account type from selected card
      const cardAccountType = selectedCard.account_type || 'Account'
      
      sendCardTransactionNotification(
        selectedCard.user_id,
        actionType,
        actionAmount,
        cardAccountType,
        cardAccountType,
        refNum,
        merchantName || undefined
      ).catch(error => {
        console.error('Error sending card transaction email notification:', error)
        // Don't fail the action if email fails
      })

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Action Successful',
        message: `${transactionDescription.replace(` – ${refNum}`, '')} of ${formatCurrency(actionAmount)} processed successfully. Reference: ${refNum}`,
      })

      setShowActionModal(false)
      setAmount('')
      setMerchantName('')
      await fetchAllCards()
    } catch (error: any) {
      console.error('Error performing card action:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Action Failed',
        message: error.message || 'Failed to process card action. Please try again.',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleBlockCard = async (cardId: string, currentStatus: string) => {
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

      await fetchAllCards()
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update card status.',
      })
    }
  }

  // Filter cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = 
      card.cardholder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.last4?.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter
    const matchesUser = !selectedUserId || card.user_id === selectedUserId
    const matchesAccountType = !selectedAccountType || card.account_type === selectedAccountType
    return matchesSearch && matchesStatus && matchesUser && matchesAccountType
  })

  // Calculate analytics
  const totalDebits = filteredCards.reduce((sum, card) => {
    // This would need to be calculated from card_transactions
    return sum
  }, 0)

  const activeCardsCount = filteredCards.filter(c => c.status === 'active').length
  const blockedCardsCount = filteredCards.filter(c => c.status === 'blocked').length

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Card Spender
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage card transactions and perform card actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllCards}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CardIcon className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {filteredCards.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {activeCardsCount}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Cards</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-red-700 dark:text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {blockedCardsCount}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Blocked Cards</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-700 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {new Set(filteredCards.map(c => c.user_id)).size}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={selectedAccountType}
            onChange={(e) => {
              setSelectedAccountType(e.target.value)
              setSelectedUserId('') // Reset user when account type changes
            }}
            className="input-field"
          >
            <option value="">All Account Types</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="fixed-deposit">Fixed Deposit</option>
            <option value="business">Business</option>
          </select>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="input-field"
            disabled={!selectedAccountType}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          <button
            onClick={() => {
              setModalAccountType(selectedAccountType)
              setModalUserId(selectedUserId)
              setShowActionModal(true)
            }}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <DollarSign className="w-4 h-4" />
            Perform Card Action
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No cards found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Card Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base text-gray-900 dark:text-white mb-1 truncate">
                        {card.user_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                        {card.user_email}
                      </p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                        {card.card_network.toUpperCase()} ••••{card.last4}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {card.cardholder_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {card.account_type ? card.account_type.charAt(0).toUpperCase() + card.account_type.slice(1) : 'N/A'}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {formatCurrency(card.account_balance || 0)}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block ${
                        card.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedCardId(card.id)
                          setShowActionModal(true)
                        }}
                        className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold transition-all"
                      >
                        Action
                      </button>
                      <button
                        onClick={() => handleBlockCard(card.id, card.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          card.status === 'active'
                            ? 'bg-red-700 hover:bg-red-800 text-white'
                            : 'bg-green-700 hover:bg-green-800 text-white'
                        }`}
                      >
                        {card.status === 'active' ? <><Lock className="w-3 h-3 inline mr-1" />Block</> : <><Unlock className="w-3 h-3 inline mr-1" />Unblock</>}
                      </button>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Card</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{card.user_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{card.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {card.card_network.toUpperCase()} ••••{card.last4}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{card.cardholder_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {card.account_type ? card.account_type.charAt(0).toUpperCase() + card.account_type.slice(1) : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(card.account_balance || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        card.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCardId(card.id)
                            setShowActionModal(true)
                          }}
                          className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          Action
                        </button>
                        <button
                          onClick={() => handleBlockCard(card.id, card.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            card.status === 'active'
                              ? 'bg-red-700 hover:bg-red-800 text-white'
                              : 'bg-green-700 hover:bg-green-800 text-white'
                          }`}
                        >
                          {card.status === 'active' ? <><Lock className="w-3 h-3 inline mr-1" />Block</> : <><Unlock className="w-3 h-3 inline mr-1" />Unblock</>}
                        </button>
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

      {/* Action Modal */}
      {showActionModal && (
        <CardActionModal
          cards={cards}
          users={users}
          initialAccountType={modalAccountType}
          initialUserId={modalUserId}
          selectedCardId={selectedCardId}
          onSelectCard={setSelectedCardId}
          actionType={actionType}
          onActionTypeChange={setActionType}
          amount={amount}
          onAmountChange={setAmount}
          merchantName={merchantName}
          onMerchantNameChange={setMerchantName}
          onConfirm={handleCardAction}
          onClose={() => {
            setShowActionModal(false)
            setSelectedCardId('')
            setAmount('')
            setMerchantName('')
            setModalAccountType('')
            setModalUserId('')
          }}
          loading={actionLoading}
        />
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

// Card Action Modal Component
function CardActionModal({
  cards,
  users,
  initialAccountType,
  initialUserId,
  selectedCardId,
  onSelectCard,
  actionType,
  onActionTypeChange,
  amount,
  onAmountChange,
  merchantName,
  onMerchantNameChange,
  onConfirm,
  onClose,
  loading,
}: {
  cards: Card[]
  users: any[]
  initialAccountType: string
  initialUserId: string
  selectedCardId: string
  onSelectCard: (id: string) => void
  actionType: string
  onActionTypeChange: (type: any) => void
  amount: string
  onAmountChange: (amount: string) => void
  merchantName: string
  onMerchantNameChange: (name: string) => void
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  const [modalUserId, setModalUserId] = useState<string>(initialUserId || '')
  const [modalAccountType, setModalAccountType] = useState<string>(initialAccountType || '')
  
  // Filter cards by user, account type, and active status
  const availableCards = cards.filter(c => {
    const matchesUser = !modalUserId || c.user_id === modalUserId
    const matchesAccountType = !modalAccountType || c.account_type === modalAccountType
    const isActive = c.status === 'active'
    return matchesUser && matchesAccountType && isActive
  })

  const selectedCard = availableCards.find(c => c.id === selectedCardId)
  const isDebit = ['debit', 'atm_withdrawal', 'online_purchase', 'fee', 'chargeback'].includes(actionType)
  
  // Get available account types for selected user
  const userCards = modalUserId ? cards.filter(c => c.user_id === modalUserId && c.status === 'active') : []
  const availableAccountTypes = Array.from(new Set(userCards.map(c => c.account_type).filter(Boolean)))

  // Reset card selection when user or account type changes
  useEffect(() => {
    if (modalUserId || modalAccountType) {
      onSelectCard('')
    }
  }, [modalUserId, modalAccountType, onSelectCard])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Perform Card Action
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Credit or debit a user's card
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Step 1: User Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Step 1: Select User
            </label>
            <select
              value={modalUserId}
              onChange={(e) => {
                setModalUserId(e.target.value)
                setModalAccountType('')
              }}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Account Type Selection */}
          {modalUserId && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Step 2: Select Account Type
              </label>
              {availableAccountTypes.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    No active cards found for this user.
                  </p>
                </div>
              ) : (
                <select
                  value={modalAccountType}
                  onChange={(e) => setModalAccountType(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Choose account type...</option>
                  {availableAccountTypes.map(type => (
                    <option key={type} value={type}>
                      {type ? type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ') : 'N/A'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 3: Card Selection */}
          {modalAccountType && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                Step 3: Select Card
              </label>
              {availableCards.length === 0 ? (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    No active cards found for {modalAccountType.replace('-', ' ')} account type.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedCardId}
                  onChange={(e) => onSelectCard(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Choose a card...</option>
                  {availableCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.card_network.toUpperCase()} ••••{card.last4} - Balance: {formatCurrency(card.account_balance || 0)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 4: Action Type */}
          {selectedCard && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Step 4: Select Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => onActionTypeChange(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="debit">Debit (Charge/Withdraw)</option>
                <option value="credit">Credit (Top Up/Deposit)</option>
                <option value="atm_withdrawal">ATM Withdrawal</option>
                <option value="online_purchase">Online Purchase</option>
                <option value="fee">Fee</option>
                <option value="chargeback">Chargeback</option>
                <option value="refund">Refund</option>
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                {isDebit ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    This will <span className="font-semibold text-red-600 dark:text-red-400">debit</span> the account balance
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    This will <span className="font-semibold text-green-600 dark:text-green-400">credit</span> the account balance
                  </>
                )}
              </p>
            </div>
          )}

          {/* Step 5: Amount & Merchant */}
          {selectedCard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-5 border border-cyan-200 dark:border-cyan-800">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Step 5: Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pl-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Merchant Name */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-5 border border-teal-200 dark:border-teal-800">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Merchant Name (Optional)
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => onMerchantNameChange(e.target.value)}
                  placeholder="e.g., Amazon, Walmart..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Selected Card Summary */}
          {selectedCard && (
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-700/50 dark:via-gray-700/30 dark:to-gray-700/50 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Transaction Summary
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cardholder</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedCard.cardholder_name}</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                    {selectedCard.account_type?.replace('-', ' ') || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {formatCurrency(selectedCard.account_balance || 0)}
                  </p>
                </div>
                <div className={`bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 ${isDebit ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400">New Balance</p>
                  <p className={`font-bold text-sm ${
                    amount && !isNaN(parseFloat(amount))
                      ? isDebit 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {amount && !isNaN(parseFloat(amount))
                      ? formatCurrency(
                          isDebit
                            ? (selectedCard.account_balance || 0) - parseFloat(amount)
                            : (selectedCard.account_balance || 0) + parseFloat(amount)
                        )
                      : formatCurrency(selectedCard.account_balance || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !selectedCardId || !amount || parseFloat(amount) <= 0 || selectedCard?.status === 'blocked'}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm Action
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

