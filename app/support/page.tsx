'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import NotificationModal from '@/components/NotificationModal'
import UserChatWidget from '@/components/chat/UserChatWidget'
import {
  Search,
  MessageSquare,
  HelpCircle,
  FileText,
  Send,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronDown,
  X,
  Headphones,
  Book,
  Video,
  AlertCircle,
  Info,
  ExternalLink,
  Download,
  Star,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react'
import clsx from 'clsx'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketCategory, setTicketCategory] = useState('')
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketPriority, setTicketPriority] = useState('medium')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const faqs = [
    {
      id: '1',
      category: 'Transfers',
      question: 'How do I transfer money to another account?',
      answer:
        'Navigate to the Transfer page and select the account you want to transfer from and to. Enter the amount and confirm the transfer. Internal transfers are instant, while external transfers may take 1-3 business days.',
      helpful: 245,
    },
    {
      id: '2',
      category: 'Cards',
      question: 'How do I freeze my card?',
      answer:
        'Go to the Cards page and toggle the "Card Frozen" switch to temporarily disable your card. This will prevent all transactions until you unfreeze it. You can unfreeze it anytime from the same page.',
      helpful: 189,
    },
    {
      id: '3',
      category: 'Investments',
      question: 'What are the fees for crypto trading?',
      answer:
        'We charge a 2.5% fee on all cryptocurrency transactions. This fee is clearly displayed before you confirm any trade. There are no hidden fees or additional charges.',
      helpful: 156,
    },
    {
      id: '4',
      category: 'Security',
      question: 'How do I set up two-factor authentication?',
      answer:
        'Go to Settings > Security and enable Two-Factor Authentication. You can use SMS or an authenticator app like Google Authenticator. We highly recommend enabling 2FA for enhanced security.',
      helpful: 312,
    },
    {
      id: '5',
      category: 'Accounts',
      question: 'How do I open a new account?',
      answer:
        'You can open a new account from the Dashboard by clicking "Add Account". Choose between checking, savings, or business accounts. The process takes less than 5 minutes.',
      helpful: 98,
    },
    {
      id: '6',
      category: 'Loans',
      question: 'What documents do I need for a loan application?',
      answer:
        'You\'ll need proof of identity (driver\'s license or passport), proof of income (pay stubs or tax returns), and proof of address (utility bill or bank statement). All documents can be uploaded digitally.',
      helpful: 134,
    },
  ]

  const { profile } = useUserProfile()
  const [supportTickets, setSupportTickets] = useState<Array<{
    id: string;
    ticket_number: string;
    category: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
  }>>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
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
  const [replyMessage, setReplyMessage] = useState('')
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [sendingReply, setSendingReply] = useState(false)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Fetch user's support tickets
  useEffect(() => {
    fetchTickets()
  }, [profile])

  const fetchTickets = async () => {
    if (!profile) return
    
    try {
      setLoadingTickets(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSupportTickets(data || [])
    } catch (error: any) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoadingTickets(false)
    }
  }

  const fetchTicketResponses = async (ticketId: string) => {
    try {
      setLoadingResponses(true)
      const { data: responsesData, error: responsesError } = await supabase
        .from('support_ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false) // Users can't see internal notes
        .order('created_at', { ascending: true })

      if (responsesError) throw responsesError

      // Fetch user names for responses
      const userIds = [...new Set((responsesData || []).map(r => r.user_id).filter(Boolean))]
      const adminIds = [...new Set((responsesData || []).map(r => r.admin_id).filter(Boolean))]
      const allIds = [...userIds, ...adminIds]

      if (allIds.length > 0) {
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
      } else {
        setTicketResponses([])
      }
    } catch (error: any) {
      console.error('Error fetching ticket responses:', error)
    } finally {
      setLoadingResponses(false)
    }
  }

  const handleViewTicket = async (ticketId: string) => {
    setSelectedTicket(ticketId)
    setShowTicketModal(true)
    setReplyMessage('')
    await fetchTicketResponses(ticketId)
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
      setSendingReply(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      // Create response
      const { error: responseError } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: selectedTicket,
          user_id: user.id,
          message: replyMessage.trim(),
          is_internal: false,
        })

      if (responseError) throw responseError

      // Update ticket updated_at timestamp
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedTicket)

      if (updateError) throw updateError

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Reply sent successfully',
      })

      setReplyMessage('')
      await fetchTicketResponses(selectedTicket)
      await fetchTickets() // Refresh ticket list to update last update time
    } catch (error: any) {
      console.error('Error sending reply:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to send reply. Please try again.',
      })
    } finally {
      setSendingReply(false)
    }
  }

  const quickLinks = [
    { icon: Book, label: 'User Guide', description: 'Complete platform documentation', color: '#047857' },
    { icon: Video, label: 'Video Tutorials', description: 'Step-by-step video guides', color: '#3b82f6' },
    { icon: Download, label: 'Download App', description: 'Mobile banking on the go', color: '#8b5cf6' },
    { icon: FileText, label: 'Legal Documents', description: 'Terms, policies & agreements', color: '#f59e0b' },
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone Support',
      info: '1-800-LIBERTY',
      availability: '24/7 Available',
      color: '#047857',
    },
    {
      icon: Mail,
      title: 'Email Support',
      info: 'support@libertybank.com',
      availability: 'Response within 24 hours',
      color: '#3b82f6',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      info: 'Chat with an agent',
      availability: 'Mon-Fri, 9AM-6PM EST',
      color: '#8b5cf6',
    },
    {
      icon: MapPin,
      title: 'Visit Branch',
      info: 'Find nearest location',
      availability: '200+ branches nationwide',
      color: '#f59e0b',
    },
  ]

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Please log in to create a support ticket.',
      })
      return
    }

    try {
      setSubmittingTicket(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      // Generate unique ticket_id
      const generateTicketId = () => {
        const prefix = 'TKT'
        const date = new Date()
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
        const randomNum = Math.floor(100000 + Math.random() * 900000) // 6-digit number
        return `${prefix}-${dateStr}-${randomNum}`
      }
      
      const ticketId = generateTicketId()

      // Create ticket in database
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          category: ticketCategory,
          priority: ticketPriority,
          subject: ticketSubject.trim(),
          message: ticketMessage.trim(),
          status: 'open',
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Create initial response (the ticket message itself)
      const { error: responseError } = await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message: ticketMessage.trim(),
          is_internal: false,
        })

      if (responseError) {
        console.error('Error creating initial response:', responseError)
        // Continue even if response creation fails
      }

      // Send email notifications
      try {
        // Get admin email from settings
        const adminEmailResponse = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationType: 'support_ticket',
            recipientEmail: 'admin@libertybank.com', // This will be fetched from settings in the API route
            recipientName: 'Admin',
            subject: `New Support Ticket: ${ticketSubject}`,
            metadata: {
              ticketNumber: ticket.ticket_number || ticketId,
              userName: `${profile.first_name} ${profile.last_name}`,
              userEmail: profile.email,
              category: ticketCategory,
              priority: ticketPriority,
              subject: ticketSubject,
              message: ticketMessage,
              date: new Date().toLocaleString(),
            },
          }),
        })

        // Send confirmation email to user
        const userEmailResponse = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationType: 'support_ticket_confirmation',
            recipientEmail: profile.email,
            recipientName: `${profile.first_name} ${profile.last_name}`,
            subject: `Support Ticket Created - ${ticket.ticket_number || ticketId}`,
            metadata: {
              userName: `${profile.first_name} ${profile.last_name}`,
              ticketNumber: ticket.ticket_number || ticketId,
              category: ticketCategory,
              subject: ticketSubject,
              message: ticketMessage,
              date: new Date().toLocaleString(),
            },
          }),
        })

        if (!adminEmailResponse.ok || !userEmailResponse.ok) {
          console.error('Failed to send email notifications')
        }
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError)
        // Continue even if email fails
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Ticket Created',
        message: `Support ticket created successfully! Ticket ID: ${ticket.ticket_number || ticketId}. Our team will respond within 24 hours.`,
      })

    setShowTicketForm(false)
    setTicketCategory('')
    setTicketSubject('')
    setTicketMessage('')
    setTicketPriority('medium')
      
      // Refresh tickets list
      await fetchTickets()
    } catch (error: any) {
      console.error('Error creating ticket:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create support ticket. Please try again.',
      })
    } finally {
      setSubmittingTicket(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'open':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Support & Help Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find answers or get in touch with our support team
          </p>
        </div>
        <button
          onClick={() => setShowTicketForm(true)}
          className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
        >
          <Send className="w-5 h-5" />
          New Ticket
        </button>
      </div>

      {/* Live Chat Banner */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Headphones className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Need Immediate Help?</h2>
              <p className="text-green-100">Chat with our support team now - Average response time: 2 minutes</p>
            </div>
          </div>
          <button 
            onClick={() => {
              // Dispatch custom event to open chat
              window.dispatchEvent(new CustomEvent('openChat'))
            }}
            className="px-8 py-3 bg-white text-green-700 hover:bg-gray-100 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Start Live Chat
          </button>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactMethods.map((method, index) => {
          const Icon = method.icon
          return (
            <button
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all text-left group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: method.color + '20' }}
              >
                <Icon className="w-6 h-6" style={{ color: method.color }} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{method.title}</h3>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{method.info}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{method.availability}</p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-green-700" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full p-4 flex items-start justify-between text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                            {faq.category}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{faq.question}</p>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{faq.answer}</p>
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({faq.helpful})
                          </button>
                          <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            Contact Support
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No FAQs found matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-700" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Support Tickets</h2>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {supportTickets.length} tickets
              </span>
            </div>

            {supportTickets.length > 0 ? (
              <div className="space-y-3">
                {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                          {ticket.ticket_number}
                        </span>
                        <span className={clsx('text-xs px-2 py-1 rounded-full font-semibold', getStatusColor(ticket.status))}>
                          {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                        <span className={clsx('text-xs font-semibold', getPriorityColor(ticket.priority))}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {ticket.category} • Created {new Date(ticket.created_at).toLocaleDateString()} • Updated {new Date(ticket.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleViewTicket(ticket.id)}
                      className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold transition-all text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
                ))}
              </div>
            ) : loadingTickets ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Loading tickets...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No support tickets yet</p>
                <p className="text-xs mt-1">Create a ticket to get help</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Links</h2>
            <div className="space-y-3">
              {quickLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: link.color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: link.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{link.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{link.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status Widget */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-gray-900 dark:text-white">System Status</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              All systems operational
            </p>
            <button className="text-sm text-green-700 dark:text-green-400 font-semibold hover:underline flex items-center gap-1">
              View Status Page
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Pro Tip</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Enable two-factor authentication in Settings for enhanced account security. It only takes 2 minutes!
            </p>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Support Ticket</h2>
              <button
                onClick={() => setShowTicketForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Category *
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="account">Account Issue</option>
                    <option value="card">Card Problem</option>
                    <option value="transfer">Transfer Issue</option>
                    <option value="loan">Loan Question</option>
                    <option value="investment">Investment Query</option>
                    <option value="technical">Technical Problem</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Priority *
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Issue affecting service</option>
                    <option value="high">High - Urgent issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Message *
                </label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  rows={6}
                  className="input-field"
                  placeholder="Describe your issue in detail. Include any relevant information such as transaction IDs, dates, or error messages."
                  required
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  Our support team typically responds within 24 hours. For urgent issues, please call our 24/7 hotline at 1-800-LIBERTY.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {submittingTicket ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                  <Send className="w-5 h-5" />
                  Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (() => {
        const ticket = supportTickets.find(t => t.id === selectedTicket)
        if (!ticket) return null

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Ticket Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {ticket.ticket_number}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowTicketModal(false)
                      setSelectedTicket(null)
                      setTicketResponses([])
                      setReplyMessage('')
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Status & Priority */}
                <div className="flex items-center justify-center gap-3">
                  <span className={clsx('px-6 py-3 rounded-full text-lg font-bold', getStatusColor(ticket.status))}>
                    {ticket.status === 'in_progress' ? 'IN PROGRESS' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                  <span className={clsx('px-6 py-3 rounded-full text-lg font-bold', getPriorityColor(ticket.priority))}>
                    {ticket.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {/* Subject */}
                <div className="bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{ticket.subject}</h3>
                  <p className="opacity-90">{ticket.category}</p>
                </div>

                {/* Ticket Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(ticket.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Original Message */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your Original Message</p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{ticket.message}</p>
                </div>

                {/* Conversation */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Conversation</h3>
                  {loadingResponses ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : ticketResponses.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {ticketResponses.map((response) => (
                        <div
                          key={response.id}
                          className={`p-4 rounded-xl ${
                            response.admin_id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {response.admin_id
                                  ? `Support Team: ${response.admin_name || 'Admin'}`
                                  : `You: ${response.user_name || 'You'}`}
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
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No responses yet. Support team will reply soon.</p>
                    </div>
                  )}
                </div>

                {/* Reply Section */}
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Reply to Support Team
                    </label>
                    <textarea
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      className="input-field"
                      disabled={sendingReply}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className="mt-3 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      {sendingReply ? (
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
                )}

                {ticket.status === 'resolved' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        This ticket has been resolved. If you need further assistance, please create a new ticket.
                      </p>
                    </div>
                  </div>
                )}

                {ticket.status === 'closed' && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <p className="font-semibold text-gray-800 dark:text-gray-300">
                        This ticket has been closed. If you need further assistance, please create a new ticket.
                      </p>
                    </div>
                  </div>
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

      {/* Chat Widget */}
      <UserChatWidget />
    </div>
  )
}
