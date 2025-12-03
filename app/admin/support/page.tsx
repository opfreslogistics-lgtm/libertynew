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
  MessageSquare,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Circle,
  Send,
  Edit,
  UserPlus,
  MessageCircle,
  FileText,
  Tag,
  X,
  RefreshCw,
  TrendingUp,
  Bell,
  Shield,
} from 'lucide-react'
import clsx from 'clsx'

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketType = 'general' | 'technical' | 'billing' | 'account' | 'dispute' | 'fraud'

export default function AdminSupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TicketType>('all')
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [assigned_to, setAssignedTo] = useState('')

  const { profile } = useUserProfile()
  const [tickets, setTickets] = useState<Array<{
    id: string
    ticket_number: string
    user_id: string
    user_name: string
    user_email: string
    user_phone: string | null
    category: string
    priority: TicketPriority
    status: TicketStatus
    subject: string
    message: string
    created_at: string
    updated_at: string
    assigned_to: string | null
    assigned_to_name: string | null
    responses: number
    last_response_at: string | null
    resolved_at: string | null
    closed_at: string | null
  }>>([])
  const [loading, setLoading] = useState(true)
  const [processingTicketId, setProcessingTicketId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })
  const [ticketResponses, setTicketResponses] = useState<Array<{
    id: string
    ticket_id: string
    user_id: string | null
    admin_id: string | null
    user_name: string | null
    admin_name: string | null
    message: string
    is_internal: boolean
    created_at: string
  }>>([])
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string }>>([])

  // Fetch tickets and admin users
  useEffect(() => {
    if (profile) {
      fetchTickets()
      fetchAdminUsers()
    }
  }, [profile])

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('role', ['admin', 'superadmin'])
        .order('first_name')

      if (error) throw error

      setAdminUsers((data || []).map(u => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
      })))
    } catch (error) {
      console.error('Error fetching admin users:', error)
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (ticketsError) throw ticketsError

      // Fetch user profiles for tickets
      const userIds = [...new Set((ticketsData || []).map(t => t.user_id))]
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone')
        .in('id', userIds)

      if (usersError) throw usersError

      // Fetch assigned admin names
      const assignedIds = [...new Set((ticketsData || []).map(t => t.assigned_to).filter(Boolean))]
      const { data: assignedData, error: assignedError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', assignedIds)

      if (assignedError) throw assignedError

      // Fetch response counts and last response times
      const ticketIds = (ticketsData || []).map(t => t.id)
      const { data: responsesData, error: responsesError } = await supabase
        .from('support_ticket_responses')
        .select('ticket_id, created_at')
        .in('ticket_id', ticketIds)
        .order('created_at', { ascending: false })

      if (responsesError) throw responsesError

      // Create lookup maps
      const usersMap = new Map((usersData || []).map(u => [u.id, u]))
      const assignedMap = new Map((assignedData || []).map(a => [a.id, `${a.first_name} ${a.last_name}`]))
      
      // Calculate response counts and last response times
      const responseCounts = new Map<string, number>()
      const lastResponseTimes = new Map<string, string>()
      ;(responsesData || []).forEach(r => {
        if (!responseCounts.has(r.ticket_id)) {
          responseCounts.set(r.ticket_id, 0)
          lastResponseTimes.set(r.ticket_id, r.created_at)
        }
        responseCounts.set(r.ticket_id, (responseCounts.get(r.ticket_id) || 0) + 1)
      })

      // Combine data
      const enrichedTickets = (ticketsData || []).map(ticket => {
        const user = usersMap.get(ticket.user_id)
        return {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          user_id: ticket.user_id,
          user_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown User',
          user_email: user?.email || '',
          user_phone: user?.phone || null,
          category: ticket.category,
          priority: ticket.priority as TicketPriority,
          status: ticket.status as TicketStatus,
          subject: ticket.subject,
          message: ticket.message,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          assigned_to: ticket.assigned_to,
          assigned_to_name: ticket.assigned_to ? assignedMap.get(ticket.assigned_to) || null : null,
          responses: responseCounts.get(ticket.id) || 0,
          last_response_at: lastResponseTimes.get(ticket.id) || null,
          resolved_at: ticket.resolved_at,
          closed_at: ticket.closed_at,
        }
      })

      setTickets(enrichedTickets)
    } catch (error: any) {
      console.error('Error fetching tickets:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to load tickets. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketResponses = async (ticketId: string) => {
    try {
      const { data: responsesData, error: responsesError } = await supabase
        .from('support_ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (responsesError) throw responsesError

      // Fetch user names for responses
      const userIds = [...new Set((responsesData || []).map(r => r.user_id).filter(Boolean))]
      const adminIds = [...new Set((responsesData || []).map(r => r.admin_id).filter(Boolean))]
      const allIds = [...userIds, ...adminIds]

      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', allIds)

      if (usersError) throw usersError

      const usersMap = new Map((usersData || []).map(u => [u.id, `${u.first_name} ${u.last_name}`]))

      const enrichedResponses = (responsesData || []).map(r => ({
        id: r.id,
        ticket_id: r.ticket_id,
        user_id: r.user_id,
        admin_id: r.admin_id,
        user_name: r.user_id ? usersMap.get(r.user_id) || null : null,
        admin_name: r.admin_id ? usersMap.get(r.admin_id) || null : null,
        message: r.message,
        is_internal: r.is_internal,
        created_at: r.created_at,
      }))

      setTicketResponses(enrichedResponses)
    } catch (error: any) {
      console.error('Error fetching ticket responses:', error)
    }
  }

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2.5 hours', // TODO: Calculate from actual data
    satisfactionRate: 95, // TODO: Calculate from actual data
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesType = typeFilter === 'all' || ticket.category === typeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'low':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const getTypeName = (category: string) => {
    const names: Record<string, string> = {
      general: 'General Inquiry',
      technical: 'Technical Issue',
      billing: 'Billing Question',
      account: 'Account Issue',
      card: 'Card Problem',
      transfer: 'Transfer Issue',
      loan: 'Loan Question',
      investment: 'Investment Query',
      dispute: 'Transaction Dispute',
      fraud: 'Fraud/Security',
      other: 'Other',
    }
    return names[category] || category
  }

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'account':
        return User
      case 'billing':
      case 'loan':
        return FileText
      case 'technical':
        return AlertCircle
      case 'dispute':
      case 'fraud':
        return Shield
      default:
        return MessageSquare
    }
  }

  const handleViewTicket = async (ticketId: string) => {
    setSelectedTicket(ticketId)
    setShowTicketModal(true)
    setReplyMessage('')
    setInternalNote('')
    await fetchTicketResponses(ticketId)
  }

  const handleAssignTicket = async () => {
    if (!assigned_to || !selectedTicket) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Warning',
        message: 'Please select a staff member',
      })
      return
    }

    try {
      setProcessingTicketId(selectedTicket)
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: assigned_to,
          status: 'in_progress',
        })
        .eq('id', selectedTicket)

      if (error) throw error

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Ticket assigned successfully',
      })

    setAssignedTo('')
      await fetchTickets()
    } catch (error: any) {
      console.error('Error assigning ticket:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to assign ticket. Please try again.',
      })
    } finally {
      setProcessingTicketId(null)
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Warning',
        message: 'Please enter a message',
      })
      return
    }

    try {
      setProcessingTicketId(selectedTicket)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create response
      const { error: responseError } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: selectedTicket,
          admin_id: user.id,
          message: replyMessage.trim(),
          is_internal: false,
        })

      if (responseError) throw responseError

      // Update ticket status if it's open
      const ticket = tickets.find(t => t.id === selectedTicket)
      if (ticket && ticket.status === 'open') {
        const { error: updateError } = await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', selectedTicket)

        if (updateError) throw updateError
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Reply sent successfully',
      })

    setReplyMessage('')
      await fetchTickets()
      await fetchTicketResponses(selectedTicket)
    } catch (error: any) {
      console.error('Error sending reply:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to send reply. Please try again.',
      })
    } finally {
      setProcessingTicketId(null)
    }
  }

  const handleAddInternalNote = async () => {
    if (!internalNote.trim() || !selectedTicket) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Warning',
        message: 'Please enter a note',
      })
      return
    }

    try {
      setProcessingTicketId(selectedTicket)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: selectedTicket,
          admin_id: user.id,
          message: internalNote.trim(),
          is_internal: true,
        })

      if (error) throw error

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Internal note added successfully',
      })

    setInternalNote('')
      await fetchTicketResponses(selectedTicket)
    } catch (error: any) {
      console.error('Error adding internal note:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add internal note. Please try again.',
      })
    } finally {
      setProcessingTicketId(null)
    }
  }

  const handleResolveTicket = async () => {
    if (!selectedTicket) return

    try {
      setProcessingTicketId(selectedTicket)
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', selectedTicket)

      if (error) throw error

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Ticket marked as resolved',
      })

      await fetchTickets()
    setShowTicketModal(false)
    } catch (error: any) {
      console.error('Error resolving ticket:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to resolve ticket. Please try again.',
      })
    } finally {
      setProcessingTicketId(null)
    }
  }

  const handleCloseTicket = async () => {
    if (!selectedTicket) return

    try {
      setProcessingTicketId(selectedTicket)
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', selectedTicket)

      if (error) throw error

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Ticket closed successfully',
      })

      await fetchTickets()
    setShowTicketModal(false)
    } catch (error: any) {
      console.error('Error closing ticket:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to close ticket. Please try again.',
      })
    } finally {
      setProcessingTicketId(null)
    }
  }

  const selectedTicketData = tickets.find(t => t.id === selectedTicket)

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Support Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer support tickets and inquiries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-semibold">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={fetchTickets}
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
              <MessageSquare className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalTickets.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Circle className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
              Open
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.openTickets}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
              In Progress
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.inProgress}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Resolved
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.resolved}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Resolved Today</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            </div>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-semibold">
              Response
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.avgResponseTime}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            </div>
            <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2 py-1 rounded-full font-semibold">
              Satisfaction
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.satisfactionRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, ticket ID, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="input-field"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="mt-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="input-field md:w-64"
          >
            <option value="all">All Types</option>
            <option value="account">Account Issue</option>
            <option value="card">Card Problem</option>
            <option value="transfer">Transfer Issue</option>
            <option value="loan">Loan Question</option>
            <option value="investment">Investment Query</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing Question</option>
            <option value="dispute">Transaction Dispute</option>
            <option value="fraud">Fraud/Security</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => {
                const Icon = getTypeIcon(ticket.category)
                return (
                  <div
                    key={ticket.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Ticket Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {ticket.user_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-gray-900 dark:text-white truncate">
                              {ticket.ticket_number}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {ticket.user_name}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                          {ticket.subject}
                        </p>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getTypeName(ticket.category)}
                            </span>
                          </div>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', getPriorityColor(ticket.priority))}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(ticket.status))}>
                            {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </div>
                        {ticket.assigned_to_name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Assigned: {ticket.assigned_to_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleViewTicket(ticket.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
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
                  Ticket ID / User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Subject / Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => {
                const Icon = getTypeIcon(ticket.category)
                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {ticket.user_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{ticket.ticket_number}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.user_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {getTypeName(ticket.category)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getPriorityColor(ticket.priority))}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(ticket.status))}>
                          {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.assigned_to_name ? (
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {ticket.assigned_to_name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ticket.created_at).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
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

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicketData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ticket Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTicketData?.ticket_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Status & Priority */}
              <div className="flex items-center justify-center gap-3">
                <span className={clsx('px-6 py-3 rounded-full text-lg font-bold', getStatusColor(selectedTicketData.status))}>
                  {selectedTicketData.status === 'in_progress' ? 'IN PROGRESS' : selectedTicketData.status.toUpperCase()}
                </span>
                <span className={clsx('px-6 py-3 rounded-full text-lg font-bold', getPriorityColor(selectedTicketData.priority))}>
                  {selectedTicketData.priority.toUpperCase()} PRIORITY
                </span>
              </div>

              {/* Subject */}
              <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedTicketData?.subject}</h3>
                <p className="opacity-90">{getTypeName(selectedTicketData?.category || '')}</p>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTicketData?.user_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicketData?.user_id}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTicketData?.user_email}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTicketData?.user_phone || 'N/A'}</p>
                </div>
              </div>

              {/* Message */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Customer Message</p>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedTicketData?.message}</p>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTicketData ? new Date(selectedTicketData.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTicketData ? new Date(selectedTicketData.updated_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned To</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTicketData?.assigned_to_name || 'Unassigned'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Responses</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTicketData?.responses || 0}</p>
                </div>
              </div>

              {/* Conversation/Responses */}
              {ticketResponses.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Conversation</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {ticketResponses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-4 rounded-xl ${
                          response.is_internal
                            ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                            : response.admin_id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {response.is_internal
                                ? '🔒 Internal Note'
                                : response.admin_id
                                ? `Admin: ${response.admin_name || 'Unknown'}`
                                : `Customer: ${response.user_name || 'Unknown'}`}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(response.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign Ticket */}
              {!selectedTicketData.assigned_to && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Assign to Staff Member
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={assigned_to}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="input-field flex-1"
                      disabled={processingTicketId === selectedTicket}
                    >
                      <option value="">Select staff member...</option>
                      {adminUsers.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignTicket}
                      disabled={processingTicketId === selectedTicket}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      {processingTicketId === selectedTicket ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Assign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Reply to Customer
                </label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="input-field"
                  disabled={processingTicketId === selectedTicket}
                />
                <button
                  onClick={handleSendReply}
                  disabled={processingTicketId === selectedTicket || !replyMessage.trim()}
                  className="mt-3 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  {processingTicketId === selectedTicket ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Internal Notes (Not visible to customer)
                </label>
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add internal notes for team members..."
                  className="input-field"
                  disabled={processingTicketId === selectedTicket}
                />
                <button
                  onClick={handleAddInternalNote}
                  disabled={processingTicketId === selectedTicket || !internalNote.trim()}
                  className="mt-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  {processingTicketId === selectedTicket ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Add Note
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Close
                </button>
                {selectedTicketData && selectedTicketData.status !== 'resolved' && selectedTicketData.status !== 'closed' && (
                  <>
                    <button
                      onClick={handleResolveTicket}
                      disabled={processingTicketId === selectedTicket}
                      className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {processingTicketId === selectedTicket ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Mark as Resolved
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCloseTicket}
                      disabled={processingTicketId === selectedTicket}
                      className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {processingTicketId === selectedTicket ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Close Ticket
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
