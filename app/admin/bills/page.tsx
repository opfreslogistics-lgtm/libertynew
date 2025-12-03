'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import NotificationModal from '@/components/NotificationModal'
import {
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  DollarSign,
  Calendar,
  User,
  FileText,
  CreditCard,
  Zap,
  Wifi,
  Droplet,
  Phone,
  Building,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Send,
  Percent,
} from 'lucide-react'
import clsx from 'clsx'

type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export default function AdminBillsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BillStatus>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFeeConfigModal, setShowFeeConfigModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<string | null>(null)
  const [showBillModal, setShowBillModal] = useState(false)

  const { profile } = useUserProfile()
  const [bills, setBills] = useState<Array<{
    id: string
    user_id: string
    user_name: string
    user_email: string
    bill_name: string
    amount: number
    description: string | null
    due_date: string
    bill_logo_url: string | null
    status: BillStatus
    created_at: string
    paid_at: string | null
  }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [processingBillId, setProcessingBillId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Form states
  const [billForm, setBillForm] = useState({
    userId: '',
    billName: '',
    amount: '',
    description: '',
    dueDate: '',
  })

  // Fetch users and bills
  useEffect(() => {
    if (profile) {
      fetchUsers()
      fetchBills()
    }
  }, [profile])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'user')
        .order('first_name')

      if (error) throw error

      setUsers((data || []).map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
      })))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchBills = async () => {
    try {
      setLoading(true)
      
      // Fetch bills
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false })

      if (billsError) throw billsError

      // Fetch user profiles for bills
      const userIds = [...new Set((billsData || []).map(b => b.user_id))]
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)

      if (usersError) throw usersError

      const usersMap = new Map((usersData || []).map(u => [u.id, { name: `${u.first_name} ${u.last_name}`, email: u.email }]))

      const enrichedBills = (billsData || []).map(bill => {
        const user = usersMap.get(bill.user_id)
        return {
          id: bill.id,
          user_id: bill.user_id,
          user_name: user?.name || 'Unknown User',
          user_email: user?.email || '',
          bill_name: bill.bill_name,
          amount: parseFloat(bill.amount.toString()),
          description: bill.description,
          due_date: bill.due_date,
          bill_logo_url: bill.bill_logo_url,
          status: bill.status as BillStatus,
          created_at: bill.created_at,
          paid_at: bill.paid_at,
        }
      })

      setBills(enrichedBills)
    } catch (error: any) {
      console.error('Error fetching bills:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to load bills. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadBillLogo = async (file: File): Promise<string> => {
    try {
      setUploadingLogo(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `bills/${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('bill-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('bill-logos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      throw error
    } finally {
      setUploadingLogo(false)
    }
  }

  // Fee configuration
  const feeConfig = [
    { id: 1, name: 'Wire Transfer Fee', amount: 45.00, type: 'fixed' },
    { id: 2, name: 'International Transfer Fee', amount: 3.5, type: 'percentage' },
    { id: 3, name: 'ATM Withdrawal Fee', amount: 2.50, type: 'fixed' },
    { id: 4, name: 'Card Replacement Fee', amount: 25.00, type: 'fixed' },
    { id: 5, name: 'Monthly Maintenance Fee', amount: 15.00, type: 'fixed' },
    { id: 6, name: 'Overdraft Fee', amount: 35.00, type: 'fixed' },
    { id: 7, name: 'Loan Processing Fee', amount: 2.0, type: 'percentage' },
    { id: 8, name: 'Early Withdrawal Penalty', amount: 50.00, type: 'fixed' },
  ]

  const stats = {
    totalBills: bills.length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    overdueBills: bills.filter(b => b.status === 'overdue').length,
    totalRevenue: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0),
    monthlyRevenue: bills.filter(b => {
      if (b.status !== 'paid' || !b.paid_at) return false
      const paidDate = new Date(b.paid_at)
      const now = new Date()
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
    }).reduce((sum, b) => sum + b.amount, 0),
    collectionRate: bills.length > 0 ? (bills.filter(b => b.status === 'paid').length / bills.length) * 100 : 0,
  }

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.bill_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }


  const handleCreateBill = async () => {
    if (!billForm.userId || !billForm.billName || !billForm.amount || !billForm.dueDate) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields (User, Bill Name, Amount, Due Date)',
      })
      return
    }

    try {
      setProcessingBillId('creating')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload logo if provided
      let logoUrl = null
      if (logoFile) {
        logoUrl = await uploadBillLogo(logoFile)
      }

      // Create bill
      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
          user_id: billForm.userId,
          bill_name: billForm.billName.trim(),
          amount: parseFloat(billForm.amount),
          due_date: billForm.dueDate,
          bill_logo_url: logoUrl,
          description: billForm.description.trim() || null,
          status: 'pending',
          assigned_by: user.id,
        })
        .select()
        .single()

      if (billError) throw billError

      // Create notification for user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: billForm.userId,
          type: 'general',
          title: 'New Bill Assigned',
          message: `A new bill "${billForm.billName}" for $${parseFloat(billForm.amount).toFixed(2)} has been assigned to you. Due date: ${new Date(billForm.dueDate).toLocaleDateString()}`,
          data: { bill_id: bill.id, bill_name: billForm.billName, amount: parseFloat(billForm.amount) },
        })

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
        // Continue even if notification fails
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Bill "${billForm.billName}" has been assigned successfully. The user has been notified.`,
      })

    setShowCreateModal(false)
    setBillForm({
      userId: '',
        billName: '',
      amount: '',
      description: '',
      dueDate: '',
      })
      setLogoFile(null)
      setLogoPreview(null)
      await fetchBills()
    } catch (error: any) {
      console.error('Error creating bill:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create bill. Please try again.',
      })
    } finally {
      setProcessingBillId(null)
    }
  }

  const handleViewBill = (billId: string) => {
    setSelectedBill(billId)
    setShowBillModal(true)
  }

  const handleSendReminder = async (billId: string) => {
    const bill = bills.find(b => b.id === billId)
    if (!bill) return

    try {
      // Create notification for user
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: bill.user_id,
          type: 'general',
          title: 'Bill Payment Reminder',
          message: `Reminder: Your bill "${bill.bill_name}" for $${bill.amount.toFixed(2)} is due on ${new Date(bill.due_date).toLocaleDateString()}`,
          data: { bill_id: bill.id },
        })

      if (error) throw error

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Payment reminder sent to user',
      })
    } catch (error: any) {
      console.error('Error sending reminder:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to send reminder. Please try again.',
      })
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Bills & Charges
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user bills, fees, and service charges
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFeeConfigModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-semibold"
          >
            <Percent className="w-4 h-4" />
            Fee Config
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Create Bill
          </button>
          <button 
            onClick={fetchBills}
            disabled={loading}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalBills.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Bills</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
              Pending
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.pendingBills}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payment</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Overdue
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.overdueBills}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Bills</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Revenue
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${(stats.totalRevenue / 1000).toFixed(0)}K
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            </div>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-semibold">
              Monthly
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${(stats.monthlyRevenue / 1000).toFixed(1)}K
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            </div>
            <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-1 rounded-full font-semibold">
              Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.collectionRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or bill ID..."
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
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No bills found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Bill Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {bill.bill_logo_url ? (
                          <img
                            src={bill.bill_logo_url}
                            alt={bill.bill_name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Receipt className="w-4 h-4 text-red-700 dark:text-red-400" />
                          </div>
                        )}
                        <p className="font-semibold text-base text-gray-900 dark:text-white truncate">
                          {bill.bill_name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                        {bill.user_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        ID: {bill.id.substring(0, 8)}...
                      </p>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(bill.status))}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {new Date(bill.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {bill.status === 'pending' && (
                        <button
                          onClick={() => handleSendReminder(bill.id)}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="Send Reminder"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewBill(bill.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-1 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Bill ID / User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBills.map((bill) => {
                return (
                  <tr
                    key={bill.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{bill.id.substring(0, 8)}...</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{bill.user_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          {bill.bill_logo_url ? (
                            <img
                              src={bill.bill_logo_url}
                              alt={bill.bill_name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                              <Receipt className="w-4 h-4 text-red-700 dark:text-red-400" />
                        </div>
                          )}
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {bill.bill_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{bill.description || 'No description'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                          ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(bill.due_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(bill.status))}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {bill.status === 'pending' && (
                          <button
                            onClick={() => handleSendReminder(bill.id)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-all"
                            title="Send Reminder"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewBill(bill.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
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

      {/* Create Bill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Bill
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Assign a bill or charge to a user
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Select User *
                </label>
                <select
                  value={billForm.userId}
                  onChange={(e) => setBillForm({ ...billForm, userId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Bill Name / Title *
                </label>
                <input
                  type="text"
                  value={billForm.billName}
                  onChange={(e) => setBillForm({ ...billForm, billName: e.target.value })}
                  placeholder="e.g., Electricity Bill, Internet Subscription"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Bill Logo (Image)
                </label>
                <div className="space-y-3">
                  {logoPreview && (
                    <div className="relative w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Bill logo preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setLogoPreview(null)
                          setLogoFile(null)
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setLogoFile(file)
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setLogoPreview(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="input-field"
                    disabled={uploadingLogo}
                  />
                  {uploadingLogo && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uploading logo...</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={billForm.description}
                  onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                  placeholder="Enter bill description or notes..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={billForm.dueDate}
                  onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>

            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBill}
                disabled={processingBillId === 'creating' || uploadingLogo}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {processingBillId === 'creating' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Assign Bill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Configuration Modal */}
      {showFeeConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Fee Configuration
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage system-wide fees and charges
                  </p>
                </div>
                <button
                  onClick={() => setShowFeeConfigModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-3">
                {feeConfig.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{fee.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fee.type === 'fixed' ? 'Fixed Fee' : 'Percentage Fee'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {fee.type === 'fixed' ? `$${fee.amount.toFixed(2)}` : `${fee.amount}%`}
                      </p>
                      <button className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowFeeConfigModal(false)}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Details Modal */}
      {showBillModal && (() => {
        const selectedBillData = bills.find(b => b.id === selectedBill)
        if (!selectedBillData) return null

        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bill Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                      {selectedBillData.id.substring(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <span className={clsx('px-6 py-3 rounded-full text-lg font-bold', getStatusColor(selectedBillData.status))}>
                  {selectedBillData.status.toUpperCase()}
                </span>
              </div>

                {/* Bill Logo & Name */}
                <div className="flex items-center gap-4">
                  {selectedBillData.bill_logo_url ? (
                    <img
                      src={selectedBillData.bill_logo_url}
                      alt={selectedBillData.bill_name}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Receipt className="w-10 h-10 text-red-700 dark:text-red-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBillData.bill_name}</h3>
                  </div>
              </div>

              {/* Amount Card */}
              <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center">
                <p className="text-sm opacity-90 mb-2">Bill Amount</p>
                <p className="text-5xl font-bold">
                    ${selectedBillData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* Bill Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">User</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedBillData.user_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedBillData.user_email}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedBillData.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedBillData.created_at).toLocaleDateString()}
                  </p>
                </div>
                  {selectedBillData.paid_at && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedBillData.paid_at).toLocaleDateString()}
                  </p>
                </div>
                  )}
              </div>

              {/* Description */}
                {selectedBillData.description && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description / Notes</p>
                    <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap">
                  {selectedBillData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowBillModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Close
              </button>
              {selectedBillData.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleSendReminder(selectedBillData.id)}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Reminder
                  </button>
                  <button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('bills')
                            .update({ status: 'cancelled' })
                            .eq('id', selectedBillData.id)

                          if (error) throw error

                          setNotification({
                            isOpen: true,
                            type: 'success',
                            title: 'Success',
                            message: 'Bill cancelled successfully',
                          })

                          setShowBillModal(false)
                          await fetchBills()
                        } catch (error: any) {
                          console.error('Error cancelling bill:', error)
                          setNotification({
                            isOpen: true,
                            type: 'error',
                            title: 'Error',
                            message: error.message || 'Failed to cancel bill. Please try again.',
                          })
                        }
                      }}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Bill
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        )
      })()}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  )
}

