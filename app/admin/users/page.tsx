'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { sendRoleChangeNotification, sendAccountFundedNotification } from '@/lib/utils/emailNotifications'
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Lock,
  Unlock,
  UserX,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  X,
  User,
  Shield,
  TrendingUp,
  Wallet,
  ChevronDown,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Building2,
  Briefcase,
  FileText,
  Award,
  CheckCircle2,
} from 'lucide-react'
import clsx from 'clsx'
import NotificationModal from '@/components/NotificationModal'

type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'
type UserTier = 'basic' | 'kyc_verified' | 'premium' | 'business'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [tierFilter, setTierFilter] = useState<'all' | UserTier>('all')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [actionType, setActionType] = useState<'view' | 'edit' | 'freeze' | 'fund' | 'delete' | null>(null)
  const [freezeReasonInput, setFreezeReasonInput] = useState('')
  const [fundAmount, setFundAmount] = useState('')
  const [selectedAccountType, setSelectedAccountType] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [fundingMethod, setFundingMethod] = useState<'direct-deposit' | 'ach'>('direct-deposit')
  const [fundNote, setFundNote] = useState('')
  const [userAccounts, setUserAccounts] = useState<{
    id: string
    account_id: string
    account_type: string
    account_number: string
    balance: number
    last4: string
  }[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tier: '',
    imfCode: '',
    cotCode: '',
    tanCode: '',
    imfCodeEnabled: false,
    cotCodeEnabled: false,
    tanCodeEnabled: false,
    wireTransactionPin: '',
    wireTransactionPinEnabled: false,
    otpEnabledLogin: true,
  })
  const [loading, setLoading] = useState(true)
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<'user' | 'admin' | 'superadmin' | null>(null)
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Multi-step form state - matching signup form structure
  const [addUserStep, setAddUserStep] = useState(1)
  const [addUserForm, setAddUserForm] = useState({
    // Step 1: Basic Auth Info
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Personal Information
    phone: '',
    dateOfBirth: '',
    gender: '' as '' | 'male' | 'female' | 'other' | 'prefer-not-to-say',
    maritalStatus: '' as '' | 'single' | 'married' | 'divorced' | 'widowed' | 'separated',
    ssn: '',
    nationality: '',
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    idCardFrontPreview: null as string | null,
    idCardBackPreview: null as string | null,
    // Step 3: Address Information
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    // Step 4: Employment & Financial
    employmentStatus: '' as '' | 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | 'other',
    employerName: '',
    jobTitle: '',
    employmentYears: '',
    annualIncome: '',
    monthlyIncome: '',
    creditScore: '650',
    totalAssets: '',
    monthlyExpenses: '',
    // Step 5: Security Questions
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
    securityQuestion3: '',
    securityAnswer3: '',
    preferredLanguage: 'en',
    referralSource: '',
    marketingConsent: false,
    // Step 6: Account Types & Role
    role: 'user' as 'user' | 'admin',
    createAccounts: true,
    accountTypes: [] as string[],
  })

  // Real user data - Fetched from database
  const [users, setUsers] = useState<{
    id: string
    name: string
    email: string
    phone: string | null
    username: string | null
    role: 'user' | 'admin' | 'superadmin'
    status: UserStatus
    tier: UserTier
    balance: number
    accounts: number
    joinDate: string
    lastActive: string
    profile_picture_url?: string | null
    kycStatus: string
    location: string
    otp_enabled?: boolean
  }[]>([])

  // Fetch all users from database
  useEffect(() => {
    fetchCurrentUserRole()
    fetchUsers()
  }, [])

  const fetchCurrentUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentUserRole(profile.role as 'user' | 'admin' | 'superadmin')
      }
    } catch (error) {
      console.error('Error fetching current user role:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch all user profiles (including admins)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch accounts for each user to calculate balance and account count
      const usersWithAccounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get user accounts
          const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('balance, account_type')
            .eq('user_id', profile.id)

          if (accountsError) {
            console.error('Error fetching accounts:', accountsError)
          }

          const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0) || 0
          const accountCount = accounts?.length || 0

          // Determine status based on profile data and account_status
          let status: UserStatus = 'active'
          if (profile.account_status === 'deleted') {
            status = 'suspended' // Show as suspended in UI if deleted
          } else if (profile.account_status === 'frozen') {
            status = 'suspended' // Show as suspended in UI if frozen
          } else if (profile.kyc_status === 'pending') {
            status = 'pending'
          } else if (profile.kyc_status === 'rejected') {
            status = 'suspended'
          }

          // Determine tier based on role or KYC status
          let tier: UserTier = 'basic'
          if (profile.role === 'admin' || profile.role === 'superadmin') {
            tier = 'business'
          } else if (profile.kyc_status === 'approved') {
            tier = 'kyc_verified'
          }

          return {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            phone: profile.phone,
            username: profile.username,
            role: profile.role,
            status,
            tier,
            balance: totalBalance,
            accounts: accountCount,
            joinDate: new Date(profile.created_at).toLocaleDateString(),
            lastActive: 'Recently', // TODO: Add last active tracking
            kycStatus: profile.kyc_status,
            location: profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'N/A',
            profile_picture_url: profile.profile_picture_url || null,
            otp_enabled: profile.two_factor_enabled || false,
            two_factor_enabled: profile.two_factor_enabled || false,
            admin_forced_2fa: profile.admin_forced_2fa || false,
          }
        })
      )

      setUsers(usersWithAccounts)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter

    return matchesSearch && matchesStatus && matchesTier
  })

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
      case 'suspended':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    }
  }

  const getTierBadge = (tier: UserTier) => {
    const config = {
      basic: { label: 'Basic', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400' },
      kyc_verified: { label: 'KYC Verified', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      premium: { label: 'Premium', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
      business: { label: 'Business', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
    }
    return config[tier]
  }

  // Role Management Functions (for superadmin and admin)
  const handleAssignAdmin = async (userId: string) => {
    if (currentUserRole !== 'superadmin' && currentUserRole !== 'admin') {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Permission Denied',
        message: 'Only admin or superadmin can assign admin roles.'
      })
      return
    }

    if (!confirm('Are you sure you want to assign admin role to this user?')) {
      return
    }

    try {
      // Get user's current role before changing
      const user = users.find(u => u.id === userId)
      const previousRole = (user?.role || 'user') as 'user' | 'admin' | 'superadmin'

      // Get current admin info for email
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email')
        .eq('id', currentUser?.id)
        .single()

      const adminName = adminProfile 
        ? `${adminProfile.first_name} ${adminProfile.last_name}` 
        : 'Administrator'
      const adminEmail = adminProfile?.email || ''

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

      if (error) throw error

      // Send email notification
      await sendRoleChangeNotification(
        userId,
        'admin',
        previousRole,
        adminName,
        adminEmail
      )

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Role Assigned',
        message: 'Admin role assigned successfully!'
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error assigning admin role:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Assignment Failed',
        message: `Failed to assign admin role: ${error.message}`
      })
    }
  }

  const handleToggleOTP = async (userId: string, enabled: boolean, force: boolean = false) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/update-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUserId: currentUser.id,
          targetUserId: userId,
          enabled,
          force,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update 2FA setting')
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: '2FA Updated',
        message: `Two-factor authentication ${enabled ? (force ? 'force enabled' : 'enabled') : (force ? 'force disabled' : 'disabled')} successfully for this user.`
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error toggling 2FA:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: `Failed to ${enabled ? 'enable' : 'disable'} 2FA: ${error.message}`
      })
    }
  }

  const handleRevokeAdmin = async (userId: string) => {
    if (currentUserRole !== 'superadmin' && currentUserRole !== 'admin') {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Permission Denied',
        message: 'Only admin or superadmin can revoke admin roles.'
      })
      return
    }

    const user = users.find(u => u.id === userId)
    // Only superadmin can revoke superadmin role, and prevent self-revocation
    if (user?.role === 'superadmin') {
      if (currentUserRole !== 'superadmin') {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Permission Denied',
          message: 'Cannot revoke superadmin role. Only superadmin can manage superadmin roles.'
        })
        return
      }
      // Prevent superadmin from revoking their own role
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser?.id === userId) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Action Not Allowed',
          message: 'Cannot revoke your own superadmin role.'
        })
        return
      }
    }

    if (!confirm('Are you sure you want to revoke admin access from this user?')) {
      return
    }

    try {
      // Get user's current role before changing
      const previousRole = (user?.role || 'user') as 'user' | 'admin' | 'superadmin'

      // Get current admin info for email
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email')
        .eq('id', currentUser?.id)
        .single()

      const adminName = adminProfile 
        ? `${adminProfile.first_name} ${adminProfile.last_name}` 
        : 'Administrator'
      const adminEmail = adminProfile?.email || ''

      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'user' })
        .eq('id', userId)

      if (error) throw error

      // Send email notification
      await sendRoleChangeNotification(
        userId,
        'user',
        previousRole,
        adminName,
        adminEmail
      )

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Access Revoked',
        message: 'Admin access revoked successfully!'
      })
      fetchUsers()
    } catch (error: any) {
      console.error('Error revoking admin role:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Revocation Failed',
        message: `Failed to revoke admin role: ${error.message}`
      })
    }
  }

  const fetchUserProfileForEdit = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email, phone, kyc_status, imf_code, cot_code, tan_code, imf_code_enabled, cot_code_enabled, tan_code_enabled, wire_transaction_pin, wire_transaction_pin_enabled, otp_enabled_login')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (profile) {
        const user = users.find(u => u.id === userId)
        setEditFormData({
          name: user?.name || `${profile.first_name} ${profile.last_name}`,
          email: profile.email || user?.email || '',
          phone: profile.phone || user?.phone || '',
          tier: user?.tier || 'basic',
          imfCode: profile.imf_code || '',
          cotCode: profile.cot_code || '',
          tanCode: profile.tan_code || '',
          imfCodeEnabled: profile.imf_code_enabled || false,
          cotCodeEnabled: profile.cot_code_enabled || false,
          tanCodeEnabled: profile.tan_code_enabled || false,
          wireTransactionPin: profile.wire_transaction_pin || '',
          wireTransactionPinEnabled: profile.wire_transaction_pin_enabled || false,
          otpEnabledLogin: profile.otp_enabled_login !== false, // Default to true
        })
      }
    } catch (error) {
      console.error('Error fetching user profile for edit:', error)
      // Fallback to basic user data
      const user = users.find(u => u.id === userId)
      if (user) {
        setEditFormData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          tier: user.tier,
          imfCode: '',
          cotCode: '',
          tanCode: '',
          imfCodeEnabled: false,
          cotCodeEnabled: false,
          tanCodeEnabled: false,
          wireTransactionPin: '',
          wireTransactionPinEnabled: false,
          otpEnabledLogin: true,
        })
      }
    }
  }

  const handleAction = (userId: string, action: 'view' | 'edit' | 'freeze' | 'fund' | 'delete') => {
    const user = users.find(u => u.id === userId)
    setSelectedUser(userId)
    setActionType(action)
    
    // Pre-fill edit form
    if (action === 'edit' && user) {
      // Fetch full user profile with codes
      fetchUserProfileForEdit(userId)
    }
    
    // Reset fund form and fetch accounts
    if (action === 'fund') {
      setFundAmount('')
      setSelectedAccountType('')
      setSelectedAccountId('')
      setFundingMethod('direct-deposit')
      setFundNote('')
      if (userId) {
        fetchUserAccounts(userId)
      }
    }
    
    // Reset freeze form
    if (action === 'freeze') {
      setFreezeReasonInput('Due to suspicious activity')
    }
    
    setShowUserModal(true)
  }

  const selectedUserData = users.find(u => u.id === selectedUser)

  // Fetch user accounts when opening fund modal
  const fetchUserAccounts = async (userId: string) => {
    try {
      setLoadingAccounts(true)
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedAccounts = (accounts || []).map(acc => ({
        id: acc.id,
        account_id: acc.id,
        account_type: acc.account_type,
        account_number: acc.account_number,
        balance: parseFloat(acc.balance.toString()),
        last4: acc.last4,
      }))

      setUserAccounts(formattedAccounts)
    } catch (error) {
      console.error('Error fetching user accounts:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Fetch Failed',
        message: 'Failed to fetch user accounts. Please try again.'
      })
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleFundSubmit = async () => {
    if (!fundAmount || !selectedAccountId) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select an account and enter an amount.'
      })
      return
    }

    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than 0.'
      })
      return
    }

    try {
      // Get current admin user
      const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser()
      if (adminError || !adminUser) {
        throw new Error('Admin authentication failed')
      }

      // Get selected account
      const selectedAccount = userAccounts.find(acc => acc.account_id === selectedAccountId)
      if (!selectedAccount) {
        throw new Error('Selected account not found')
      }

      // Generate unique reference number (e.g., REF843939)
      const generateReferenceNumber = () => {
        const prefix = 'REF'
        const randomNum = Math.floor(100000 + Math.random() * 900000) // 6-digit number
        return `${prefix}${randomNum}`
      }
      
      const referenceNumber = generateReferenceNumber()
      
      // Get current account balance BEFORE creating transaction
      const { data: currentAccount, error: accountFetchError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', selectedAccountId)
        .single()

      if (accountFetchError || !currentAccount) {
        throw new Error('Failed to fetch account balance')
      }

      const currentBalance = parseFloat(currentAccount.balance?.toString() || '0')
      const newBalance = currentBalance + amount

      // Create transaction record
      const transactionType = fundingMethod === 'direct-deposit' ? 'Direct Deposit' : 'ACH Transfer'
      const transactionDescription = `${transactionType} – ${referenceNumber}`
      
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: selectedUserData?.id,
            account_id: selectedAccountId,
            type: 'credit',
            category: 'Admin Funding',
            amount: amount,
            description: transactionDescription,
            reference_number: referenceNumber,
            status: 'completed',
            pending: false,
            date: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        throw new Error('Failed to create transaction record')
      }

      // Update account balance directly (ensures it updates even if trigger doesn't fire)
      const { error: balanceUpdateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccountId)
      
      if (balanceUpdateError) {
        console.error('[Admin Funding] Error updating balance:', balanceUpdateError)
        throw new Error('Failed to update account balance')
      }

      // Create notification for the user
      const accountTypeLabel = selectedAccount.account_type === 'fixed-deposit' 
        ? 'Fixed Deposit' 
        : selectedAccount.account_type.charAt(0).toUpperCase() + selectedAccount.account_type.slice(1)
      
      try {
        const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: selectedUserData?.id,
            type: 'transaction',
            title: 'Account Funded',
              message: `Your ${accountTypeLabel} account has been funded with ${formatCurrency(amount)} via ${transactionType}. Reference: ${referenceNumber}`,
            data: {
              transaction_id: transactionData?.id,
              account_id: selectedAccountId,
              amount: amount,
              funding_method: fundingMethod,
              account_type: selectedAccount.account_type,
                reference_number: referenceNumber,
            },
            read: false,
          },
        ])
          .select()
          .single()

      if (notificationError) {
          console.error('[Admin Funding] Error creating notification:', notificationError)
          console.error('[Admin Funding] Notification error details:', {
            code: notificationError.code,
            message: notificationError.message,
            details: notificationError.details,
            hint: notificationError.hint,
          })
        } else {
          console.log('[Admin Funding] Notification created successfully:', notificationData)
        }
      } catch (notifErr: any) {
        console.error('[Admin Funding] Exception creating notification:', notifErr)
        // Don't fail the funding if notification creation fails, just log it
      }

      // Get admin info for email
      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', adminUser.id)
        .single()

      const adminName = adminProfile 
        ? `${adminProfile.first_name} ${adminProfile.last_name}` 
        : 'Administrator'

      // Send email notification
      await sendAccountFundedNotification(
        selectedUserData?.id!,
        amount,
        selectedAccount.account_type,
        selectedAccount.account_number || selectedAccountId,
        fundingMethod,
        referenceNumber,
        adminName
      )

      // Force refresh accounts to show updated balance
      if (selectedUserData?.id) {
        await fetchUserAccounts(selectedUserData.id)
      }
      
      // Refresh all users list to update balances in the table
      await fetchUsers()

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Account Funded',
        message: `Successfully funded ${formatCurrency(amount)} to ${selectedUserData?.name}'s ${selectedAccount.account_type} account via ${transactionType}. Reference: ${referenceNumber}`
      })
      
      setShowUserModal(false)
      setFundAmount('')
      setSelectedAccountId('')
      setSelectedAccountType('')
      setFundNote('')
    } catch (error: any) {
      console.error('Error funding account:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Funding Failed',
        message: error.message || 'Failed to fund account. Please try again.'
      })
    }
  }

  const handleFreezeSubmit = async () => {
    if (!selectedUserData) return

    try {
      const isFrozen = selectedUserData.status === 'suspended' || selectedUserData.status === 'frozen'
      const accountStatus = isFrozen ? 'active' : 'frozen'
      const freezeReason = isFrozen ? null : (freezeReasonInput || 'Due to suspicious activity')

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          account_status: accountStatus,
          freeze_reason: freezeReason,
          frozen_at: isFrozen ? null : new Date().toISOString(),
        })
        .eq('id', selectedUserData.id)

      if (updateError) throw updateError

      // Also update kyc_status to match (for compatibility)
      if (accountStatus === 'frozen') {
        await supabase
          .from('user_profiles')
          .update({ kyc_status: 'rejected' })
          .eq('id', selectedUserData.id)
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Account Status Updated',
        message: `Account ${isFrozen ? 'unfrozen' : 'frozen'} successfully for ${selectedUserData.name}`
      })
      
      // Refresh users list
      await fetchUsers()
      setShowUserModal(false)
      setFreezeReasonInput('')
    } catch (error: any) {
      console.error('Error freezing account:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to freeze/unfreeze account. Please try again.'
      })
    }
  }

  const handleDeleteAccount = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Action Not Allowed',
        message: 'Cannot delete superadmin account.'
      })
      return
    }

    // Prevent deleting own account
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser?.id === userId) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Action Not Allowed',
        message: 'Cannot delete your own account.'
      })
      return
    }

    if (!confirm(`Are you sure you want to PERMANENTLY DELETE the account for ${user.name}? This action cannot be undone and the user will not be able to login. All user data will be permanently removed.`)) {
      return
    }

    try {
      // Get current session token for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Authentication Required',
          message: 'You must be logged in to delete users.'
        })
        return
      }

      // Call API route to permanently delete user
      const response = await fetch(`/api/admin/delete-user?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Account Deleted',
        message: `Account for ${user.name} has been permanently deleted.`
      })
      
      // Refresh users list
      await fetchUsers()
      setShowUserModal(false)
    } catch (error: any) {
      console.error('Error deleting account:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Deletion Failed',
        message: error.message || 'Failed to delete account. Please try again.'
      })
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedUserData) return

    try {
      // Parse name into first and last name
      const nameParts = editFormData.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Update user profile with all fields including codes
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: editFormData.email,
          phone: editFormData.phone,
          kyc_status: editFormData.tier === 'kyc_verified' ? 'approved' : editFormData.tier === 'premium' ? 'approved' : 'pending',
          imf_code: editFormData.imfCode || null,
          cot_code: editFormData.cotCode || null,
          tan_code: editFormData.tanCode || null,
          imf_code_enabled: editFormData.imfCodeEnabled,
          cot_code_enabled: editFormData.cotCodeEnabled,
          tan_code_enabled: editFormData.tanCodeEnabled,
          wire_transaction_pin: editFormData.wireTransactionPin || null,
          wire_transaction_pin_enabled: editFormData.wireTransactionPinEnabled,
          otp_enabled_login: editFormData.otpEnabledLogin,
        })
        .eq('id', selectedUserData.id)

      if (updateError) throw updateError

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'User Updated',
        message: `User information updated successfully for ${selectedUserData.name}`
      })
      await fetchUsers()
      setShowUserModal(false)
    } catch (error: any) {
      console.error('Error updating user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: `Failed to update user: ${error.message}`
      })
    }
  }

  const handleAddUserWithFormData = async (formData: any) => {
    try {
      setAddUserLoading(true)

      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      if (formData.createAccounts && formData.accountTypes.length === 0) {
        throw new Error('Please select at least one account type or disable account creation')
      }

      if (formData.createAccounts && formData.accountTypes.length > 3) {
        throw new Error('You can select a maximum of 3 account types')
      }

      // Get current session token for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to create users')
      }

      // Call API route to create user with all form data
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          role: (currentUserRole === 'superadmin' || currentUserRole === 'admin') ? formData.role : 'user',
          accountTypes: formData.createAccounts ? formData.accountTypes : [],
          // Address fields
          address: formData.address || null,
          addressLine2: formData.addressLine2 || null,
          city: formData.city || null,
          state: formData.state || null,
          zipCode: formData.zipCode || null,
          country: formData.country || 'United States',
          // Personal information
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          maritalStatus: formData.maritalStatus || null,
          ssn: formData.ssn || null,
          nationality: formData.nationality || null,
          // Employment information
          employmentStatus: formData.employmentStatus || null,
          employerName: formData.employerName || null,
          jobTitle: formData.jobTitle || null,
          employmentYears: formData.employmentYears || null,
          annualIncome: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
          monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : null,
          // Credit score
          creditScore: formData.creditScore ? parseInt(formData.creditScore) : null,
          totalAssets: formData.totalAssets ? parseFloat(formData.totalAssets) : null,
          monthlyExpenses: formData.monthlyExpenses ? parseFloat(formData.monthlyExpenses) : null,
          // Security questions
          securityQuestion1: formData.securityQuestion1 || null,
          securityAnswer1: formData.securityAnswer1 || null,
          securityQuestion2: formData.securityQuestion2 || null,
          securityAnswer2: formData.securityAnswer2 || null,
          securityQuestion3: formData.securityQuestion3 || null,
          securityAnswer3: formData.securityAnswer3 || null,
          preferredLanguage: formData.preferredLanguage || 'en',
          referralSource: formData.referralSource || null,
          marketingConsent: formData.marketingConsent || false,
          // ID card files (will be handled separately if needed)
        }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error(`Server error: Received ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      // Upload profile picture if provided
      if (formData.profilePicFile && result.user?.id) {
        try {
          setUploadingProfilePic(true)
          
          const fileExt = formData.profilePicFile.name.split('.').pop()
          const fileName = `${result.user.id}/profile.${fileExt}`

          const { data: existingFiles } = await supabase.storage
            .from('profile-pictures')
            .list(result.user.id)
          
          if (existingFiles && existingFiles.length > 0) {
            const filesToDelete = existingFiles.map(f => `${result.user.id}/${f.name}`)
            await supabase.storage
              .from('profile-pictures')
              .remove(filesToDelete)
          }

          const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, formData.profilePicFile, {
              cacheControl: '3600',
              upsert: true,
            })

          if (uploadError) {
            console.error('Error uploading profile picture:', uploadError)
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-pictures')
              .getPublicUrl(fileName)
            
            await supabase
              .from('user_profiles')
              .update({ profile_picture_url: publicUrl })
              .eq('id', result.user.id)
          }
        } catch (error: any) {
          console.error('Error uploading profile picture:', error)
        } finally {
          setUploadingProfilePic(false)
        }
      }

      alert(`User "${result.user.firstName} ${result.user.lastName}" created successfully!${result.accounts && result.accounts.length > 0 ? ` ${result.accounts.length} account(s) created.` : ''}`)
      
      await fetchUsers()
      setShowUserModal(false)
      setProfilePicFile(null)
      setProfilePicPreview(null)
    } catch (error: any) {
      console.error('Error creating user:', error)
      throw error // Re-throw to let the form component handle the error display
    } finally {
      setAddUserLoading(false)
      setUploadingProfilePic(false)
    }
  }

  const handleAddUser = async () => {
    try {
      setAddUserLoading(true)

      // Validation
      if (addUserForm.password !== addUserForm.confirmPassword) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Password Mismatch',
          message: 'Passwords do not match. Please try again.'
        })
        setAddUserLoading(false)
        return
      }

      if (addUserForm.password.length < 8) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Invalid Password',
          message: 'Password must be at least 8 characters long.'
        })
        setAddUserLoading(false)
        return
      }

      if (addUserForm.createAccounts && addUserForm.accountTypes.length === 0) {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Account Selection Required',
          message: 'Please select at least one account type or disable account creation.'
        })
        setAddUserLoading(false)
        return
      }

      if (addUserForm.createAccounts && addUserForm.accountTypes.length > 3) {
                                      setNotification({
                                        isOpen: true,
                                        type: 'warning',
                                        title: 'Too Many Accounts',
                                        message: 'You can select a maximum of 3 account types.'
                                      })
        setAddUserLoading(false)
        return
      }

      // Get current session token for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Authentication Required',
          message: 'You must be logged in to create users.'
        })
        setAddUserLoading(false)
        return
      }

      // Call API route to create user
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: addUserForm.firstName,
          lastName: addUserForm.lastName,
          username: addUserForm.username,
          email: addUserForm.email,
          phone: addUserForm.phone || null,
          password: addUserForm.password,
          role: (currentUserRole === 'superadmin' || currentUserRole === 'admin') ? addUserForm.role : 'user',
          accountTypes: addUserForm.createAccounts ? addUserForm.accountTypes : [],
          // Address fields
          address: addUserForm.address || null,
          city: addUserForm.city || null,
          state: addUserForm.state || null,
          zipCode: addUserForm.zipCode || null,
          country: addUserForm.country || 'United States',
          // Personal information
          dateOfBirth: addUserForm.dateOfBirth || null,
          // Employment information
          employmentStatus: addUserForm.employmentStatus && addUserForm.employmentStatus.trim() ? addUserForm.employmentStatus.trim() : null,
          employerName: addUserForm.employerName || null,
          annualIncome: addUserForm.annualIncome ? parseFloat(addUserForm.annualIncome) : null,
          // Credit score
          creditScore: addUserForm.creditScore ? parseInt(addUserForm.creditScore) : null,
        }),
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error(`Server error: Received ${response.status} ${response.statusText}. Please check the server logs.`)
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      // Upload profile picture if provided (after user is created)
      if (profilePicFile && result.user?.id) {
        try {
          setUploadingProfilePic(true)
          
          const fileExt = profilePicFile.name.split('.').pop()
          const fileName = `${result.user.id}/profile.${fileExt}`

          // Delete old profile picture if exists
          const { data: existingFiles } = await supabase.storage
            .from('profile-pictures')
            .list(result.user.id)
          
          if (existingFiles && existingFiles.length > 0) {
            const filesToDelete = existingFiles.map(f => `${result.user.id}/${f.name}`)
            await supabase.storage
              .from('profile-pictures')
              .remove(filesToDelete)
          }

          // Upload new picture
          const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, profilePicFile, {
              cacheControl: '3600',
              upsert: true,
            })

          if (uploadError) {
            console.error('Error uploading profile picture:', uploadError)
            setNotification({
              isOpen: true,
              type: 'warning',
              title: 'Partial Success',
              message: 'User created successfully, but profile picture upload failed.'
            })
          } else {
            // Get public URL and update profile
            const { data: { publicUrl } } = supabase.storage
              .from('profile-pictures')
              .getPublicUrl(fileName)
            
            await supabase
              .from('user_profiles')
              .update({ profile_picture_url: publicUrl })
              .eq('id', result.user.id)
          }
        } catch (error: any) {
          console.error('Error uploading profile picture:', error)
          // Don't fail the user creation if image upload fails
          setNotification({
            isOpen: true,
            type: 'warning',
            title: 'Partial Success',
            message: 'User created successfully, but profile picture upload failed.'
          })
        } finally {
          setUploadingProfilePic(false)
        }
      }

      alert(`User "${result.user.firstName} ${result.user.lastName}" created successfully!${result.accounts && result.accounts.length > 0 ? ` ${result.accounts.length} account(s) created.` : ''}`)
      
      // Refresh users list
      await fetchUsers()
      
      // Close modal and reset form
      setShowUserModal(false)
      setAddUserForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        createAccounts: true,
        accountTypes: ['checking'],
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        dateOfBirth: '',
        employmentStatus: '',
        employerName: '',
        annualIncome: '',
        creditScore: '',
      })
      setProfilePicFile(null)
      setProfilePicPreview(null)
    } catch (error: any) {
      console.error('Error creating user:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create user. Please try again.'
      })
    } finally {
      setAddUserLoading(false)
      setUploadingProfilePic(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage all user accounts and permissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalUsers.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-semibold">
              Active
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.activeUsers.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-700 dark:text-red-400" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
              Suspended
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.suspendedUsers.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Suspended</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-semibold">
              Pending
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.pendingUsers.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending KYC</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                User Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="input-field"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="kyc_verified">KYC Verified</option>
                <option value="premium">Premium</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setTierFilter('all')
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 sm:pl-12 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Users List - Mobile Card View / Desktop Table View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="px-4 sm:px-6 py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-4 sm:px-6 py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <User className="w-12 h-12 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const tierBadge = getTierBadge(user.tier)
                return (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* User Photo */}
                      <div className="flex-shrink-0">
                        {user.profile_picture_url ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-red-600/20">
                            <img
                              src={user.profile_picture_url}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(user.status))}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', tierBadge.color)}>
                            {tierBadge.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{user.email}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(user.balance)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleAction(user.id, 'view')}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user.id, 'edit')}
                          className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user.id, 'fund')}
                          className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                          title="Fund"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user.id, 'freeze')}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title={user.status === 'suspended' ? 'Unfreeze' : 'Freeze'}
                        >
                          {user.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && user.role !== 'superadmin' && (
                          <button
                            onClick={() => handleAction(user.id, 'delete')}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <UserX className="w-4 h-4" />
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
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Tier / Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => {
                    const tierBadge = getTierBadge(user.tier)
                    
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_picture_url ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-red-600/20">
                            <img
                              src={user.profile_picture_url}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.username && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            @{user.username}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                        </div>
                        )}
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-red-600 dark:text-red-400 font-semibold capitalize">
                              {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(user.status))}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', tierBadge.color)}>
                          {tierBadge.label}
                        </span>
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                              {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(user.balance)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 dark:text-white">{user.accounts}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.lastActive}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleAction(user.id, 'view')}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user.id, 'edit')}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(user.id, 'freeze')}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title={user.status === 'suspended' ? 'Unfreeze Account' : 'Freeze Account'}
                        >
                          {user.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && user.role !== 'superadmin' && (
                          <button
                            onClick={() => handleAction(user.id, 'delete')}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user.id, 'fund')}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
                          title="Fund Account"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        
                        {/* Role Management (Visible to superadmin and admin) */}
                        {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && (
                          <>
                            {user.role === 'user' ? (
                              <button
                                onClick={() => handleAssignAdmin(user.id)}
                                className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg transition-colors"
                                title="Assign Admin Role"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            ) : user.role === 'admin' ? (
                              <button
                                onClick={() => handleRevokeAdmin(user.id)}
                                className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg transition-colors"
                                title="Revoke Admin Role"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : null}
                          </>
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

      {/* Legacy Add User Modal - Keeping for reference */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h2>
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    setProfilePicFile(null)
                    setProfilePicPreview(null)
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={async (e) => {
                e.preventDefault()
                await handleAddUser()
              }} className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Picture</h3>
                  <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      {profilePicPreview ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-600 shadow-lg">
                          <img
                            src={profilePicPreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200 dark:border-gray-600 shadow-lg">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (!file) return

                            // Validate file
                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
                            const maxSize = 5 * 1024 * 1024 // 5MB

                            if (!allowedTypes.includes(file.type)) {
                              setNotification({
                                isOpen: true,
                                type: 'error',
                                title: 'Invalid File Type',
                                message: 'Please upload an image file (JPEG, PNG, WEBP, or GIF).'
                              })
                              return
                            }

                            if (file.size > maxSize) {
                              setNotification({
                                isOpen: true,
                                type: 'error',
                                title: 'File Too Large',
                                message: 'File size exceeds 5MB limit. Please choose a smaller image.'
                              })
                              return
                            }

                            setProfilePicFile(file)
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setProfilePicPreview(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                          input.click()
                        }}
                        disabled={uploadingProfilePic}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      >
                        {uploadingProfilePic ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        Profile Picture
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Upload a profile picture for this user (optional). Recommended size: 400x400px. Max file size: 5MB.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (!file) return

                              const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
                              const maxSize = 5 * 1024 * 1024

                              if (!allowedTypes.includes(file.type)) {
                                setNotification({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'Invalid File Type',
                                  message: 'Please upload an image file (JPEG, PNG, WEBP, or GIF).'
                                })
                                return
                              }

                              if (file.size > maxSize) {
                                setNotification({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'File Too Large',
                                  message: 'File size exceeds 5MB limit. Please choose a smaller image.'
                                })
                                return
                              }

                              setProfilePicFile(file)
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setProfilePicPreview(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                            input.click()
                          }}
                          disabled={uploadingProfilePic}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {profilePicPreview ? 'Change Picture' : 'Upload Picture'}
                        </button>
                        {profilePicPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePicFile(null)
                              setProfilePicPreview(null)
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-xl font-semibold text-sm transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addUserForm.firstName}
                        onChange={(e) => setAddUserForm({ ...addUserForm, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addUserForm.lastName}
                        onChange={(e) => setAddUserForm({ ...addUserForm, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={addUserForm.username}
                        onChange={(e) => setAddUserForm({ ...addUserForm, username: e.target.value.toLowerCase() })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="john.doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={addUserForm.email}
                        onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={addUserForm.phone}
                        onChange={(e) => setAddUserForm({ ...addUserForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Role *
                        {currentUserRole !== 'superadmin' && currentUserRole !== 'admin' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            (Only admin or superadmin can assign admin role)
                          </span>
                        )}
                      </label>
                      <select
                        required
                        value={addUserForm.role}
                        onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value as 'user' | 'admin' })}
                        disabled={currentUserRole !== 'superadmin' && currentUserRole !== 'admin'}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="user">User</option>
                        {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && (
                          <option value="admin">Admin</option>
                        )}
                      </select>
                      {currentUserRole !== 'superadmin' && currentUserRole !== 'admin' && addUserForm.role === 'admin' && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Only admin or superadmin can create admin users. Role will be set to User.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={addUserForm.password}
                        onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="At least 8 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={addUserForm.confirmPassword}
                        onChange={(e) => setAddUserForm({ ...addUserForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Creation */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Account Setup</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addUserForm.createAccounts}
                        onChange={(e) => setAddUserForm({ ...addUserForm, createAccounts: e.target.checked, accountTypes: e.target.checked ? ['checking'] : [] })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                      />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Create bank accounts for this user
                      </span>
                    </label>

                    {addUserForm.createAccounts && (
                      <div className="space-y-4 ml-8">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Select up to 3 account types. Each account will automatically receive a unique account number and debit card.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {([
                            { id: 'checking', name: 'Checking Account', icon: CreditCard, desc: 'Daily transactions', color: 'from-blue-500 to-blue-600' },
                            { id: 'savings', name: 'Savings Account', icon: Building2, desc: 'Earn interest', color: 'from-green-500 to-green-600' },
                            { id: 'business', name: 'Business Account', icon: Briefcase, desc: 'Business banking', color: 'from-purple-500 to-purple-600' },
                            { id: 'fixed-deposit', name: 'Fixed Deposit', icon: FileText, desc: 'Fixed term savings', color: 'from-orange-500 to-orange-600' },
                            { id: 'investment', name: 'Investment Account', icon: Award, desc: 'Investment portfolio', color: 'from-indigo-500 to-indigo-600' },
                          ] as Array<{ id: string, name: string, icon: any, desc: string, color: string }>).map((type) => {
                            const Icon = type.icon
                            const isSelected = addUserForm.accountTypes.includes(type.id)
                            const isDisabled = !isSelected && addUserForm.accountTypes.length >= 3
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setAddUserForm({ ...addUserForm, accountTypes: addUserForm.accountTypes.filter(t => t !== type.id) })
                                  } else {
                                    if (addUserForm.accountTypes.length < 3) {
                                      setAddUserForm({ ...addUserForm, accountTypes: [...addUserForm.accountTypes, type.id] })
                                    } else {
                                      setNotification({
                                        isOpen: true,
                                        type: 'warning',
                                        title: 'Too Many Accounts',
                                        message: 'You can select a maximum of 3 account types.'
                                      })
                                    }
                                  }
                                }}
                                disabled={isDisabled}
                                className={`p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                                  isSelected
                                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                    : isDisabled
                                    ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-600'
                                }`}
                              >
                                {isSelected && (
                                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${type.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
                                )}
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                                      <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    {isSelected && (
                                      <CheckCircle2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    )}
                                  </div>
                                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{type.name}</h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {addUserForm.accountTypes.length}/3 selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={addUserForm.address}
                        onChange={(e) => setAddUserForm({ ...addUserForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={addUserForm.city}
                        onChange={(e) => setAddUserForm({ ...addUserForm, city: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={addUserForm.state}
                        onChange={(e) => setAddUserForm({ ...addUserForm, state: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={addUserForm.zipCode}
                        onChange={(e) => setAddUserForm({ ...addUserForm, zipCode: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={addUserForm.country}
                        onChange={(e) => setAddUserForm({ ...addUserForm, country: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={addUserForm.dateOfBirth}
                        onChange={(e) => setAddUserForm({ ...addUserForm, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Credit Score
                      </label>
                      <input
                        type="number"
                        min="300"
                        max="850"
                        value={addUserForm.creditScore}
                        onChange={(e) => setAddUserForm({ ...addUserForm, creditScore: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                        placeholder="700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Range: 300-850
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Employment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Employment Status
                      </label>
                      <select
                        value={addUserForm.employmentStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          // Clear employment fields if selecting unemployed, student, or retired
                          if (['unemployed', 'student', 'retired'].includes(newStatus)) {
                            setAddUserForm({ 
                              ...addUserForm, 
                              employmentStatus: newStatus,
                              employerName: '',
                            })
                          } else {
                            setAddUserForm({ ...addUserForm, employmentStatus: newStatus })
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                      >
                        <option value="">Select Employment Status</option>
                        <option value="employed">Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="student">Student</option>
                        <option value="retired">Retired</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {!['unemployed', 'student', 'retired'].includes(addUserForm.employmentStatus) && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Employer Name
                        </label>
                        <input
                          type="text"
                          value={addUserForm.employerName}
                          onChange={(e) => setAddUserForm({ ...addUserForm, employerName: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Company Name"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Annual Income
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={addUserForm.annualIncome}
                          onChange={(e) => setAddUserForm({ ...addUserForm, annualIncome: e.target.value })}
                          className="w-full px-4 py-2.5 pl-8 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false)
                      setProfilePicFile(null)
                      setProfilePicPreview(null)
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addUserLoading}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addUserLoading ? 'Creating User...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUserData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {actionType === 'view' && 'User Details'}
                  {actionType === 'edit' && 'Edit User'}
                  {actionType === 'freeze' && (selectedUserData?.status === 'suspended' || selectedUserData?.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account')}
                  {actionType === 'fund' && 'Fund Account'}
                  {actionType === 'delete' && 'Delete Account'}
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Profile Header */}
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUserData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedUserData.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getStatusColor(selectedUserData.status))}>
                      {selectedUserData.status.charAt(0).toUpperCase() + selectedUserData.status.slice(1)}
                    </span>
                    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', getTierBadge(selectedUserData.tier).color)}>
                      {getTierBadge(selectedUserData.tier).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedUserData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedUserData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedUserData.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Account Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Balance</p>
                        <p className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(selectedUserData.balance)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Accounts</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedUserData.accounts} accounts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Join Date</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedUserData.joinDate}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Two-Factor Authentication</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedUserData.two_factor_enabled ? 'Enabled' : 'Disabled'}
                              {selectedUserData.admin_forced_2fa && (
                                <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Admin Forced)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUserData.two_factor_enabled || false}
                            onChange={(e) => {
                              if (selectedUserData) {
                                handleToggleOTP(selectedUserData.id, e.target.checked, false)
                                // Optimistically update UI
                                const updatedUsers = users.map(u => 
                                  u.id === selectedUserData.id 
                                    ? { ...u, two_factor_enabled: e.target.checked, otp_enabled: e.target.checked }
                                    : u
                                )
                                setUsers(updatedUsers)
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                      {currentUserRole === 'admin' || currentUserRole === 'superadmin' ? (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => {
                              if (selectedUserData && confirm(`Are you sure you want to ${selectedUserData.admin_forced_2fa ? 'remove admin force' : 'force enable'} 2FA for this user?`)) {
                                handleToggleOTP(selectedUserData.id, !selectedUserData.admin_forced_2fa, true)
                              }
                            }}
                            className={`w-full px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                              selectedUserData?.admin_forced_2fa
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                            }`}
                          >
                            {selectedUserData?.admin_forced_2fa ? 'Remove Admin Force' : 'Force Enable 2FA (Admin Override)'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {actionType === 'edit' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Edit User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        User Tier
                      </label>
                      <select
                        value={editFormData.tier}
                        onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                        className="input-field"
                      >
                        <option value="basic">Basic</option>
                        <option value="kyc_verified">KYC Verified</option>
                        <option value="premium">Premium</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>

                  {/* Transaction Codes Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Transaction Security Codes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Set verification codes that will be required when this user performs transactions.
                    </p>
                    
                    <div className="space-y-4">
                      {/* IMF Code */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                            IMF Code
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.imfCodeEnabled}
                              onChange={(e) => setEditFormData({ ...editFormData, imfCodeEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {editFormData.imfCodeEnabled ? 'ON' : 'OFF'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={editFormData.imfCode}
                          onChange={(e) => setEditFormData({ ...editFormData, imfCode: e.target.value })}
                          placeholder="Enter IMF code"
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                          disabled={!editFormData.imfCodeEnabled}
                        />
                      </div>

                      {/* COT Code */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                            COT Code
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.cotCodeEnabled}
                              onChange={(e) => setEditFormData({ ...editFormData, cotCodeEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {editFormData.cotCodeEnabled ? 'ON' : 'OFF'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={editFormData.cotCode}
                          onChange={(e) => setEditFormData({ ...editFormData, cotCode: e.target.value })}
                          placeholder="Enter COT code"
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                          disabled={!editFormData.cotCodeEnabled}
                        />
                      </div>

                      {/* TAN Code */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                            TAN Code
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.tanCodeEnabled}
                              onChange={(e) => setEditFormData({ ...editFormData, tanCodeEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {editFormData.tanCodeEnabled ? 'ON' : 'OFF'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={editFormData.tanCode}
                          onChange={(e) => setEditFormData({ ...editFormData, tanCode: e.target.value })}
                          placeholder="Enter TAN code"
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                          disabled={!editFormData.tanCodeEnabled}
                        />
                      </div>

                      {/* Wire Transaction PIN */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                            Wire Transaction PIN
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.wireTransactionPinEnabled}
                              onChange={(e) => setEditFormData({ ...editFormData, wireTransactionPinEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {editFormData.wireTransactionPinEnabled ? 'ON' : 'OFF'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={editFormData.wireTransactionPin}
                          onChange={(e) => setEditFormData({ ...editFormData, wireTransactionPin: e.target.value })}
                          placeholder="Enter wire transaction PIN (4-6 digits)"
                          maxLength={6}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 dark:text-white"
                          disabled={!editFormData.wireTransactionPinEnabled}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          This PIN will be required when user performs wire transfers.
                        </p>
                      </div>

                      {/* OTP Login */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                              OTP Login Verification
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Require 6-digit OTP code on login
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.otpEnabledLogin}
                              onChange={(e) => setEditFormData({ ...editFormData, otpEnabledLogin: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                              {editFormData.otpEnabledLogin ? 'ON' : 'OFF'}
                            </span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          When enabled, a 6-digit OTP code will be generated and sent to the user after successful password authentication. The user must enter this code to complete login.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> When codes are enabled, users will be prompted to enter them during transactions (transfer, fund, withdraw). Multiple codes will be validated sequentially. Wire Transaction PIN is specifically for wire transfers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Freeze Form */}
              {actionType === 'freeze' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                          {selectedUserData?.status === 'suspended' || selectedUserData?.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-400">
                          {selectedUserData?.status === 'suspended' || selectedUserData?.status === 'frozen'
                            ? 'This will restore full access to the user account and allow all transactions.'
                            : 'This will temporarily suspend the user account and prevent all transactions. The user will not be able to login or perform any operations.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedUserData?.status !== 'suspended' && selectedUserData?.status !== 'frozen' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Reason (Required)
                      </label>
                      <textarea
                        rows={4}
                        value={freezeReasonInput}
                        onChange={(e) => setFreezeReasonInput(e.target.value)}
                        placeholder="Enter reason for freezing this account (e.g., Due to suspicious activity)..."
                        className="input-field"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Delete Account Form */}
              {actionType === 'delete' && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                          ⚠️ Permanent Account Deletion
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-400">
                          This action will PERMANENTLY DELETE the user account. The user will not be able to login, and this action cannot be undone. All account data will be marked as deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      User Information:
                    </p>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Name:</strong> {selectedUserData?.name}</p>
                      <p><strong>Email:</strong> {selectedUserData?.email}</p>
                      <p><strong>Accounts:</strong> {selectedUserData?.accounts} account(s)</p>
                      <p><strong>Total Balance:</strong> {formatCurrency(selectedUserData?.balance || 0)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <strong>Warning:</strong> Make sure all balances are zero or transferred before deleting. This action will prevent the user from accessing their account permanently.
                    </p>
                  </div>
                </div>
              )}

              {/* Fund Form */}
              {actionType === 'fund' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Fund User Account</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Select Account to Fund *
                    </label>
                    {loadingAccounts ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                      </div>
                    ) : userAccounts.length === 0 ? (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          This user has no active accounts. Please create an account first.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userAccounts.map((account) => {
                          const accountTypeLabel = account.account_type === 'fixed-deposit' 
                            ? 'Fixed Deposit' 
                            : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
                          
                          return (
                            <button
                              key={account.account_id}
                              onClick={() => {
                                setSelectedAccountId(account.account_id)
                                setSelectedAccountType(account.account_type)
                              }}
                              className={clsx(
                                'w-full p-4 rounded-xl border-2 transition-all text-left',
                                selectedAccountId === account.account_id
                                  ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {accountTypeLabel} Account
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ****{account.last4} • {account.account_number}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(account.balance)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Funding Method *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFundingMethod('direct-deposit')}
                        className={clsx(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          fundingMethod === 'direct-deposit'
                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <p className="font-semibold text-gray-900 dark:text-white">Direct Deposit</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Instant deposit</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundingMethod('ach')}
                        className={clsx(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          fundingMethod === 'ach'
                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <p className="font-semibold text-gray-900 dark:text-white">ACH Transfer</p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Bank transfer</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Amount to Fund *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="0.00"
                        className="input-field pl-10 text-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Note / Reference (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={fundNote}
                      onChange={(e) => setFundNote(e.target.value)}
                      placeholder="Enter reason or reference for this funding..."
                      className="input-field"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Admin Funding
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          This action will be logged in the audit trail. The user will receive a notification about this credit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                {actionType === 'view' && (
                  <button 
                    onClick={() => setActionType('edit')}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Edit User
                  </button>
                )}
                {actionType === 'edit' && (
                  <button 
                    onClick={handleEditSubmit}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Save Changes
                  </button>
                )}
                {actionType === 'freeze' && (
                  <button 
                    onClick={handleFreezeSubmit}
                    disabled={!freezeReasonInput && selectedUserData?.status !== 'suspended' && selectedUserData?.status !== 'frozen'}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                  >
                    {selectedUserData?.status === 'suspended' || selectedUserData?.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
                  </button>
                )}
                {actionType === 'delete' && (
                  <button 
                    onClick={() => selectedUserData && handleDeleteAccount(selectedUserData.id)}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Permanently Delete Account
                  </button>
                )}
                {actionType === 'fund' && (
                  <button 
                    onClick={handleFundSubmit}
                    disabled={!fundAmount || !selectedAccountId || loadingAccounts}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Fund Account
                  </button>
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

