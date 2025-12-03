'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  FileText,
  Image as ImageIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Shield,
  ZoomIn,
} from 'lucide-react'
import clsx from 'clsx'

type KYCStatus = 'pending' | 'approved' | 'rejected' | 'under_review'

export default function AdminKYCPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | KYCStatus>('all')
  const [selectedKYC, setSelectedKYC] = useState<string | null>(null)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingKYCId, setProcessingKYCId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const [kycApplications, setKycApplications] = useState<Array<{
    id: string
    user_id: string
    user_name: string
    user_email: string
    status: KYCStatus
    created_at: string
    submitted_at: string
    first_name: string
    last_name: string
    date_of_birth: string
      nationality: string
    country_of_residence: string
    address_line1: string
    city: string
    state: string
    postal_code: string
    phone_number: string
    id_type: string
    id_number: string
    id_front_url: string
    id_back_url: string | null
    proof_of_address_url: string | null
    selfie_url: string
    verified_by: string | null
    verified_at: string | null
    rejection_reason: string | null
    notes: string | null
  }>>([])

  useEffect(() => {
    fetchKYCApplications()
  }, [])

  const fetchKYCApplications = async () => {
    try {
      setLoading(true)
      
      // Fetch KYC applications
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (kycError) throw kycError

      // Fetch user profiles
      const userIds = [...new Set((kycData || []).map(k => k.user_id))]
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)

      if (usersError) throw usersError

      const usersMap = new Map((usersData || []).map(u => [u.id, { name: `${u.first_name} ${u.last_name}`, email: u.email }]))

      const enrichedKYC = (kycData || []).map(kyc => {
        const user = usersMap.get(kyc.user_id)
        return {
          id: kyc.id,
          user_id: kyc.user_id,
          user_name: user?.name || 'Unknown User',
          user_email: user?.email || '',
          status: kyc.status as KYCStatus,
          created_at: kyc.created_at,
          submitted_at: kyc.submitted_at,
          first_name: kyc.first_name,
          last_name: kyc.last_name,
          date_of_birth: kyc.date_of_birth,
          nationality: kyc.nationality,
          country_of_residence: kyc.country_of_residence,
          address_line1: kyc.address_line1,
          city: kyc.city,
          state: kyc.state,
          postal_code: kyc.postal_code,
          phone_number: kyc.phone_number,
          id_type: kyc.id_type,
          id_number: kyc.id_number,
          id_front_url: kyc.id_front_url,
          id_back_url: kyc.id_back_url,
          proof_of_address_url: kyc.proof_of_address_url,
          selfie_url: kyc.selfie_url,
          verified_by: kyc.verified_by,
          verified_at: kyc.verified_at,
          rejection_reason: kyc.rejection_reason,
          notes: kyc.notes,
        }
      })

      setKycApplications(enrichedKYC)
    } catch (error: any) {
      console.error('Error fetching KYC applications:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to load KYC applications. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    pending: kycApplications.filter(k => k.status === 'pending').length,
    approved: kycApplications.filter(k => k.status === 'approved').length,
    rejected: kycApplications.filter(k => k.status === 'rejected').length,
    under_review: kycApplications.filter(k => k.status === 'under_review').length,
  }

  const filteredApplications = kycApplications.filter(kyc => {
    const matchesSearch = 
      kyc.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kyc.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kyc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${kyc.first_name} ${kyc.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || kyc.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: KYCStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'under_review':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
    }
  }

  const handleApprove = async () => {
    if (!selectedKYC) return

    try {
      setProcessingKYCId(selectedKYC)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update KYC status
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'approved',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          notes: internalNotes.trim() || null,
        })
        .eq('id', selectedKYC)

      if (updateError) throw updateError

      // Create notification for user
      const kyc = kycApplications.find(k => k.id === selectedKYC)
      if (kyc) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: kyc.user_id,
            type: 'kyc_status',
            title: 'KYC Approved',
            message: 'Your KYC verification has been approved. You can now buy and sell crypto.',
            data: { kyc_id: selectedKYC },
          })

        if (notificationError) console.error('Error creating notification:', notificationError)
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `KYC approved for ${kyc?.user_name || 'user'}`,
      })

    setShowKYCModal(false)
      await fetchKYCApplications()
    } catch (error: any) {
      console.error('Error approving KYC:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to approve KYC. Please try again.',
      })
    } finally {
      setProcessingKYCId(null)
    }
  }

  const handleReject = async () => {
    if (!selectedKYC || !rejectionReason.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please provide a rejection reason',
      })
      return
    }

    try {
      setProcessingKYCId(selectedKYC)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update KYC status
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'rejected',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
          notes: internalNotes.trim() || null,
        })
        .eq('id', selectedKYC)

      if (updateError) throw updateError

      // Create notification for user
      const kyc = kycApplications.find(k => k.id === selectedKYC)
      if (kyc) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: kyc.user_id,
            type: 'kyc_status',
            title: 'KYC Rejected',
            message: `Your KYC verification was rejected. Reason: ${rejectionReason.trim()}`,
            data: { kyc_id: selectedKYC },
          })

        if (notificationError) console.error('Error creating notification:', notificationError)
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `KYC rejected for ${kyc?.user_name || 'user'}`,
      })

      setShowKYCModal(false)
      setRejectionReason('')
      await fetchKYCApplications()
    } catch (error: any) {
      console.error('Error rejecting KYC:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to reject KYC. Please try again.',
      })
    } finally {
      setProcessingKYCId(null)
    }
  }

  const handleViewImage = (url: string) => {
    setSelectedImage(url)
    setShowImageModal(true)
  }

  const selectedKYCData = kycApplications.find(k => k.id === selectedKYC)

  const handleViewKYC = (kycId: string) => {
    setSelectedKYC(kycId)
    setShowKYCModal(true)
    setRejectionReason('')
    setInternalNotes('')
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            KYC Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve user identity documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-semibold">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={fetchKYCApplications}
            disabled={loading}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
              Urgent
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.pending.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Verified
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.approved.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Rejected
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.rejected.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-orange-700 dark:text-orange-400" />
            </div>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-semibold">
              Resubmit
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.under_review.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
          </select>
        </div>
      </div>

      {/* KYC Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">No KYC applications found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.map((kyc) => {
                const hasIdFront = !!kyc.id_front_url
                const hasIdBack = !!kyc.id_back_url
                const hasProofOfAddress = !!kyc.proof_of_address_url
                const hasSelfie = !!kyc.selfie_url
                const documentsCount = [hasIdFront, hasIdBack, hasProofOfAddress, hasSelfie].filter(Boolean).length

                return (
                  <div
                    key={kyc.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* KYC Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {kyc.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-gray-900 dark:text-white truncate">
                              {kyc.user_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {kyc.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(kyc.status))}>
                            {kyc.status === 'under_review' ? 'Under Review' : kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                          <Mail className="w-3 h-3 inline mr-1" />
                          {kyc.user_email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {kyc.phone_number}
                        </p>
                        <div className="flex items-center gap-1 mb-1">
                          {hasIdFront && (
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center" title="ID Front">
                              <FileText className="w-3 h-3 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          {hasIdBack && (
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center" title="ID Back">
                              <FileText className="w-3 h-3 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          {hasProofOfAddress && (
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center" title="Proof of Address">
                              <FileText className="w-3 h-3 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          {hasSelfie && (
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center" title="Selfie">
                              <ImageIcon className="w-3 h-3 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {documentsCount}/4
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(kyc.submitted_at || kyc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleViewKYC(kyc.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Review
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
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.map((kyc) => {
                const hasIdFront = !!kyc.id_front_url
                const hasIdBack = !!kyc.id_back_url
                const hasProofOfAddress = !!kyc.proof_of_address_url
                const hasSelfie = !!kyc.selfie_url
                const documentsCount = [hasIdFront, hasIdBack, hasProofOfAddress, hasSelfie].filter(Boolean).length

                return (
                  <tr
                    key={kyc.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {kyc.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{kyc.user_name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{kyc.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                            {kyc.user_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                            {kyc.phone_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                          {hasIdFront && (
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" title="ID Front">
                              <FileText className="w-4 h-4 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          {hasIdBack && (
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" title="ID Back">
                              <FileText className="w-4 h-4 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          {hasProofOfAddress && (
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" title="Proof of Address">
                              <FileText className="w-4 h-4 text-green-700 dark:text-green-400" />
                            </div>
                          )}
                          {hasSelfie && (
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center" title="Selfie">
                              <ImageIcon className="w-4 h-4 text-green-700 dark:text-green-400" />
                        </div>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {documentsCount}/4
                          </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(kyc.status))}>
                          {kyc.status === 'under_review' ? 'Under Review' : kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                        <span className="font-semibold uppercase text-sm text-gray-600 dark:text-gray-400">
                          N/A
                    </span>
                  </td>
                  <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(kyc.submitted_at || kyc.created_at).toLocaleDateString()}
                        </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleViewKYC(kyc.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Review
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

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[200] p-4">
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => {
                setShowImageModal(false)
                setSelectedImage(null)
              }}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Document"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* KYC Review Modal */}
      {showKYCModal && selectedKYCData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    KYC Verification Review
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedKYCData.user_name} • {selectedKYCData.id.substring(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={() => setShowKYCModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <span className={clsx('px-6 py-3 rounded-full text-lg font-bold', getStatusColor(selectedKYCData.status))}>
                  {selectedKYCData.status === 'under_review' ? 'UNDER REVIEW' : selectedKYCData.status.toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedKYCData.first_name} {selectedKYCData.last_name}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Birth</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedKYCData.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {selectedKYCData.id_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedKYCData.id_number}
                      </p>
                    </div>
                    {(selectedKYCData as any).id_expiry_date && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Expiry Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date((selectedKYCData as any).id_expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">Contact & Location</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedKYCData.phone_number}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedKYCData.address_line1}
                        {(selectedKYCData as any).address_line2 && `, ${(selectedKYCData as any).address_line2}`}
                        <br />
                        {selectedKYCData.city}, {selectedKYCData.state} {selectedKYCData.postal_code}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nationality</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedKYCData.nationality}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Country of Residence</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedKYCData.country_of_residence}
                      </p>
                    </div>
                    {selectedKYCData.submitted_at && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(selectedKYCData.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Submitted Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedKYCData.id_front_url && (
                    <div
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-red-600 transition-all cursor-pointer"
                      onClick={() => handleViewImage(selectedKYCData.id_front_url)}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group">
                        <img
                          src={selectedKYCData.id_front_url}
                          alt="ID Front"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          ID Front ({selectedKYCData.id_type})
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedKYCData.id_back_url && (
                    <div
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-red-600 transition-all cursor-pointer"
                      onClick={() => handleViewImage(selectedKYCData.id_back_url!)}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group">
                        <img
                          src={selectedKYCData.id_back_url}
                          alt="ID Back"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          ID Back
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedKYCData.proof_of_address_url && (
                    <div
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-red-600 transition-all cursor-pointer"
                      onClick={() => handleViewImage(selectedKYCData.proof_of_address_url!)}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group">
                        <img
                          src={selectedKYCData.proof_of_address_url}
                          alt="Proof of Address"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          Proof of Address
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedKYCData.selfie_url && (
                    <div
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-red-600 transition-all cursor-pointer"
                      onClick={() => handleViewImage(selectedKYCData.selfie_url)}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative group">
                        <img
                          src={selectedKYCData.selfie_url}
                          alt="Selfie"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          Selfie with ID
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedKYCData.rejection_reason && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{selectedKYCData.rejection_reason}</p>
                </div>
              )}

              {/* Internal Notes (if exists) */}
              {selectedKYCData.notes && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Internal Notes</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">{selectedKYCData.notes}</p>
                </div>
              )}

              {/* Decision Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Verification Decision</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Rejection Reason / Notes (Required for rejection/resubmit)
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection or specify what needs to be resubmitted..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Internal Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add internal notes for audit trail..."
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowKYCModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                {selectedKYCData.status === 'pending' && (
                  <>
                <button
                      onClick={handleApprove}
                      disabled={processingKYCId === selectedKYCData.id}
                      className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {processingKYCId === selectedKYCData.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Approve KYC
                        </>
                      )}
                </button>
                <button
                  onClick={handleReject}
                      disabled={processingKYCId === selectedKYCData.id || !rejectionReason.trim()}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {processingKYCId === selectedKYCData.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                  <XCircle className="w-5 h-5" />
                          Reject KYC
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

