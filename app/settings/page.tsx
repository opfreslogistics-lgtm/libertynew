'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { supabase } from '@/lib/supabase'
import {
  User,
  Shield,
  Bell,
  Smartphone,
  Key,
  Mail,
  MessageSquare,
  Globe,
  MapPin,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Download,
  Upload,
  Trash2,
  LogOut,
  Settings as SettingsIcon,
  ChevronRight,
  Check,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  Fingerprint,
  Monitor,
  Moon,
  Sun,
  Palette,
  Languages,
  DollarSign,
  FileText,
  HelpCircle,
  ExternalLink,
  XCircle,
  Clock,
} from 'lucide-react'
import clsx from 'clsx'
import NotificationModal from '@/components/NotificationModal'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { profile, loading, fullName, initials, refresh } = useUserProfile()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'privacy' | 'kyc'>('profile')
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Form state for profile information
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateOfBirth: '',
    employmentStatus: '',
    employerName: '',
    annualIncome: '',
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !loading) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        country: profile.country || 'United States',
        dateOfBirth: profile.date_of_birth || '',
        employmentStatus: profile.employment_status || '',
        employerName: profile.employer_name || '',
        annualIncome: profile.annual_income?.toString() || '',
      })
    }
  }, [profile, loading])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaveMessage(null) // Clear any previous messages
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required')
      }

      if (!formData.email.trim() || !formData.email.includes('@')) {
        throw new Error('Valid email is required')
      }

      // Check if email is being changed and if it's already taken by another user
      const emailChanged = formData.email.trim().toLowerCase() !== profile?.email?.toLowerCase()
      if (emailChanged) {
        const { data: existingUser } = await supabase
          .from('user_profiles')
          .select('id, email')
          .eq('email', formData.email.trim().toLowerCase())
          .neq('id', user.id)
          .maybeSingle()

        if (existingUser) {
          throw new Error('This email is already registered to another account')
        }
      }

      // Update user profile in database
      const updateData: any = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zip_code: formData.zipCode.trim() || null,
        country: formData.country.trim() || null,
        date_of_birth: formData.dateOfBirth || null,
        employment_status: formData.employmentStatus.trim() || null,
        employer_name: formData.employerName.trim() || null,
        annual_income: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
        updated_at: new Date().toISOString(),
      }

      // Only include email in update if it has changed
      if (emailChanged) {
        updateData.email = formData.email.trim().toLowerCase()
      }

      // Update email in auth if changed
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email.trim().toLowerCase(),
        })
        if (emailError) {
          console.warn('Could not update auth email:', emailError)
          // Continue with profile update even if auth email update fails
        }
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      // Refresh profile data
      await refresh()

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)

    } catch (error: any) {
      console.error('Error saving profile:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    largeTransactions: true,
    lowBalance: true,
    monthlyStatement: true,
    securityAlerts: true,
    promotions: false,
  })
  const [twoFactor, setTwoFactor] = useState(false)
  const [biometric, setBiometric] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [preferences, setPreferences] = useState({
    language: 'en-US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
  })
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'kyc', label: 'KYC Verification', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ] as const

  // Device tracking state
  const [devices, setDevices] = useState<Array<{
    id: string
    name: string
    location: string
    lastActive: string
    current: boolean
    deviceType?: string
    browser?: string
    os?: string
  }>>([])
  const [devicesLoading, setDevicesLoading] = useState(true)
  const [registeringDevice, setRegisteringDevice] = useState(false)

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={enabled} onChange={onChange} className="sr-only peer" />
      <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
    </label>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all',
                    activeTab === tab.id
                      ? 'bg-green-700 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    {profile?.profile_picture_url || profilePicPreview ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-700 shadow-lg">
                        <img
                          src={profilePicPreview || profile?.profile_picture_url || ''}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-green-700 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {loading ? '...' : initials}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingProfilePic}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      {uploadingProfilePic ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
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

                        try {
                          setUploadingProfilePic(true)

                          // Get current user
                          const { data: { user }, error: userError } = await supabase.auth.getUser()
                          if (userError || !user) {
                            throw new Error('User not authenticated')
                          }

                          // Create preview
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setProfilePicPreview(reader.result as string)
                          }
                          reader.readAsDataURL(file)

                          // Upload to Supabase Storage
                          const fileExt = file.name.split('.').pop()
                          const fileName = `${user.id}/profile.${fileExt}`

                          // Delete old profile picture if exists
                          if (profile?.profile_picture_url) {
                            const oldFileName = profile.profile_picture_url.split('/').pop()
                            if (oldFileName) {
                              await supabase.storage
                                .from('profile-pictures')
                                .remove([`${user.id}/${oldFileName}`])
                            }
                          }

                          // Upload new picture
                          const { error: uploadError } = await supabase.storage
                            .from('profile-pictures')
                            .upload(fileName, file, {
                              cacheControl: '3600',
                              upsert: true,
                            })

                          if (uploadError) throw uploadError

                          // Get public URL
                          const { data: { publicUrl } } = supabase.storage
                            .from('profile-pictures')
                            .getPublicUrl(fileName)

                          // Update user profile
                          const { error: updateError } = await supabase
                            .from('user_profiles')
                            .update({ profile_picture_url: publicUrl })
                            .eq('id', user.id)

                          if (updateError) throw updateError

                          // Refresh profile
                          await refresh()
                          setNotification({
                            isOpen: true,
                            type: 'success',
                            title: 'Profile Picture Updated',
                            message: 'Your profile picture has been updated successfully!'
                          })
                        } catch (error: any) {
                          console.error('Error uploading profile picture:', error)
                          setNotification({
                            isOpen: true,
                            type: 'error',
                            title: 'Upload Failed',
                            message: error.message || 'Failed to upload profile picture. Please try again.'
                          })
                          setProfilePicPreview(null)
                        } finally {
                          setUploadingProfilePic(false)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {loading ? 'Loading...' : fullName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile?.role === 'superadmin' || profile?.role === 'admin' ? 'Admin Member' : 'Premium Member'}
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-sm text-green-700 dark:text-green-400 font-semibold hover:underline"
                    >
                      {profile?.profile_picture_url ? 'Change Profile Picture' : 'Upload Profile Picture'}
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="input-field pl-10"
                        disabled={loading || saving}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input-field pl-10"
                        disabled={loading || saving}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Username
                    </label>
                    <input 
                      type="text" 
                      defaultValue={profile?.username || ''} 
                      className="input-field"
                      disabled={loading || true}
                      readOnly
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Username cannot be changed
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="input-field pl-10"
                        disabled={loading || saving}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Date of Birth
                    </label>
                    <input 
                      type="date" 
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Employment Status
                    </label>
                    <input 
                      type="text" 
                      value={formData.employmentStatus}
                      onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Employer Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.employerName}
                      onChange={(e) => handleInputChange('employerName', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Annual Income
                    </label>
                    <input 
                      type="number" 
                      value={formData.annualIncome}
                      onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                      className="input-field"
                      disabled={loading || saving}
                      placeholder="$0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  {saveMessage && (
                    <div
                      className={`p-4 rounded-xl border-2 ${
                        saveMessage.type === 'success'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {saveMessage.type === 'success' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        <p className="font-semibold">{saveMessage.text}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || loading}
                      className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        // Reset form to original values
                        if (profile) {
                          setFormData({
                            firstName: profile.first_name || '',
                            lastName: profile.last_name || '',
                            email: profile.email || '',
                            phone: profile.phone || '',
                            address: profile.address || '',
                            city: profile.city || '',
                            state: profile.state || '',
                            zipCode: profile.zip_code || '',
                            country: profile.country || 'United States',
                            dateOfBirth: profile.date_of_birth || '',
                            employmentStatus: profile.employment_status || '',
                            employerName: profile.employer_name || '',
                            annualIncome: profile.annual_income?.toString() || '',
                          })
                        }
                        setSaveMessage(null)
                      }}
                      disabled={saving || loading}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <Key className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Change Password</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last changed 3 months ago
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-all"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-green-700 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {twoFactor ? 'Enabled via SMS' : 'Add an extra layer of security'}
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch 
                        enabled={twoFactor} 
                        onChange={async () => {
                          const newValue = !twoFactor
                          setTwoFactor(newValue)
                          try {
                            setSavingSecurity(true)
                            const { data: { user }, error: userError } = await supabase.auth.getUser()
                            if (userError || !user) throw new Error('User not authenticated')

                            const { error: updateError } = await supabase
                              .from('user_profiles')
                              .update({ two_factor_enabled: newValue })
                              .eq('id', user.id)

                            if (updateError) throw updateError
                            await refresh()
                          } catch (error: any) {
                            console.error('Error updating 2FA:', error)
                            setTwoFactor(!newValue) // Revert on error
                            setNotification({
                              isOpen: true,
                              type: 'error',
                              title: 'Update Failed',
                              message: 'Failed to update two-factor authentication. Please try again.'
                            })
                          } finally {
                            setSavingSecurity(false)
                          }
                        }} 
                      />
                    </div>
                  </div>

                  {/* Biometric Login */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                          <Fingerprint className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Biometric Login</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Use Face ID / Touch ID
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch 
                        enabled={biometric} 
                        onChange={async () => {
                          const newValue = !biometric
                          setBiometric(newValue)
                          try {
                            setSavingSecurity(true)
                            const { data: { user }, error: userError } = await supabase.auth.getUser()
                            if (userError || !user) throw new Error('User not authenticated')

                            const { error: updateError } = await supabase
                              .from('user_profiles')
                              .update({ biometric_enabled: newValue })
                              .eq('id', user.id)

                            if (updateError) throw updateError
                            await refresh()
                          } catch (error: any) {
                            console.error('Error updating biometric:', error)
                            setBiometric(!newValue) // Revert on error
                            setNotification({
                              isOpen: true,
                              type: 'error',
                              title: 'Update Failed',
                              message: 'Failed to update biometric login. Please try again.'
                            })
                          } finally {
                            setSavingSecurity(false)
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Devices */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Devices</h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{devices.length} devices</span>
                </div>

                <div className="space-y-4">
                  {devicesLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading devices...</p>
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="text-center py-8">
                      <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">No devices found</p>
                    </div>
                  ) : (
                    devices.map((device) => {
                      const DeviceIcon = device.deviceType === 'mobile' ? Smartphone : 
                                        device.deviceType === 'tablet' ? Smartphone : Monitor
                      return (
                        <div
                          key={device.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                                <DeviceIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">{device.name}</p>
                                  {device.current && (
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {device.browser && device.os ? `${device.browser} on ${device.os}` : device.location}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {device.location} • Last active: {device.lastActive}
                                </p>
                              </div>
                            </div>
                            {!device.current && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to remove ${device.name}?`)) return
                                  
                                  try {
                                    const { data: { session } } = await supabase.auth.getSession()
                                    if (!session) return

                                    const response = await fetch(`/api/devices/delete?id=${device.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${session.access_token}`,
                                      },
                                    })

                                    if (response.ok) {
                                      // Refresh devices list
                                      const fetchResponse = await fetch('/api/devices/fetch', {
                                        headers: {
                                          'Authorization': `Bearer ${session.access_token}`,
                                        },
                                      })
                                      if (fetchResponse.ok) {
                                        const result = await fetchResponse.json()
                                        setDevices(result.devices || [])
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error deleting device:', error)
                                    setNotification({
                                      isOpen: true,
                                      type: 'error',
                                      title: 'Remove Failed',
                                      message: 'Failed to remove device. Please try again.'
                                    })
                                  }
                                }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                              >
                                <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <button
                  onClick={async () => {
                    if (!confirm('Are you sure you want to sign out of all devices except this one?')) return
                    
                    try {
                      const { data: { session } } = await supabase.auth.getSession()
                      if (!session) return

                      const response = await fetch('/api/devices/signout-all', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`,
                        },
                      })

                      if (response.ok) {
                        // Refresh devices list
                        const fetchResponse = await fetch('/api/devices/fetch', {
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                          },
                        })
                        if (fetchResponse.ok) {
                          const result = await fetchResponse.json()
                          setDevices(result.devices || [])
                        }
                        setNotification({
                          isOpen: true,
                          type: 'success',
                          title: 'Devices Signed Out',
                          message: 'All other devices have been signed out successfully.'
                        })
                      }
                    } catch (error) {
                      console.error('Error signing out devices:', error)
                      setNotification({
                        isOpen: true,
                        type: 'error',
                        title: 'Sign Out Failed',
                        message: 'Failed to sign out devices. Please try again.'
                      })
                    }
                  }}
                  disabled={devices.filter(d => !d.current).length === 0}
                  className="w-full mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Sign Out All Other Devices
                </button>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                {/* Communication Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Communication Channels
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive updates via email
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.email}
                        onChange={async () => {
                          const newValue = !notifications.email
                          setNotifications({ ...notifications, email: newValue })
                          await saveNotificationPreferences({ ...notifications, email: newValue })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive push alerts on your device
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.push}
                        onChange={async () => {
                          const newValue = !notifications.push
                          setNotifications({ ...notifications, push: newValue })
                          await saveNotificationPreferences({ ...notifications, push: newValue })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">SMS Notifications</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive text messages
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.sms}
                        onChange={async () => {
                          const newValue = !notifications.sms
                          setNotifications({ ...notifications, sms: newValue })
                          await saveNotificationPreferences({ ...notifications, sms: newValue })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Alert Types */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Large Transaction Alerts
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Notify for transactions over $1,000
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.largeTransactions}
                        onChange={async () => {
                          const newValue = !notifications.largeTransactions
                          setNotifications({ ...notifications, largeTransactions: newValue })
                          await saveNotificationPreferences({ ...notifications, largeTransactions: newValue })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Low Balance Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Alert when balance falls below $500
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.lowBalance}
                        onChange={async () => {
                          const newValue = !notifications.lowBalance
                          setNotifications({ ...notifications, lowBalance: newValue })
                          await saveNotificationPreferences({ ...notifications, lowBalance: newValue })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Security Alerts</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Suspicious activity and login attempts
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.securityAlerts}
                        onChange={async () => {
                          const newValue = !notifications.securityAlerts
                          setNotifications({ ...notifications, securityAlerts: newValue })
                          await saveNotificationPreferences({ ...notifications, securityAlerts: newValue })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Monthly Statements</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive monthly account summaries
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.monthlyStatement}
                        onChange={async () => {
                          const newValue = !notifications.monthlyStatement
                          setNotifications({ ...notifications, monthlyStatement: newValue })
                          await saveNotificationPreferences({ ...notifications, monthlyStatement: newValue })
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Promotions & Offers
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Special offers and product updates
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={notifications.promotions}
                        onChange={async () => {
                          const newValue = !notifications.promotions
                          setNotifications({ ...notifications, promotions: newValue })
                          await saveNotificationPreferences({ ...notifications, promotions: newValue })
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Display Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        {theme === 'dark' ? (
                          <Moon className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                        ) : (
                          <Sun className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Theme</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold transition-all"
                    >
                      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Languages className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Language</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">English (US)</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-700 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Currency</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">USD ($)</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all">
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Document Preferences
                </h2>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-orange-700 dark:text-orange-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Download Statements
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          View and download account statements
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-700 dark:text-red-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">Tax Documents</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Access your tax forms and documents
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <KYCTabContent profile={profile} />
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Privacy & Data
                </h2>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">Download My Data</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Request a copy of your personal data
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">Privacy Policy</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Read our privacy policy
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">Terms of Service</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          View our terms and conditions
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-400 mb-4">
                      These actions are permanent and cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {passwordMessage && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <p className="font-semibold">{passwordMessage.text}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'} 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password" 
                    className="input-field pr-10"
                    disabled={changingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password (min 8 characters)" 
                    className="input-field pr-10"
                    disabled={changingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password" 
                    className="input-field pr-10"
                    disabled={changingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setPasswordMessage(null)
                }}
                disabled={changingPassword}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setChangingPassword(true)
                    setPasswordMessage(null)

                    // Validate inputs
                    if (!passwordData.currentPassword) {
                      setPasswordMessage({ type: 'error', text: 'Please enter your current password' })
                      setChangingPassword(false)
                      return
                    }

                    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
                      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters' })
                      setChangingPassword(false)
                      return
                    }

                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
                      setChangingPassword(false)
                      return
                    }

                    // Verify current password by attempting to sign in
                    const { data: { user }, error: userError } = await supabase.auth.getUser()
                    if (userError || !user) {
                      throw new Error('User not authenticated')
                    }

                    // Verify current password
                    const { error: verifyError } = await supabase.auth.signInWithPassword({
                      email: user.email!,
                      password: passwordData.currentPassword,
                    })

                    if (verifyError) {
                      setPasswordMessage({ type: 'error', text: 'Current password is incorrect' })
                      setChangingPassword(false)
                      return
                    }

                    // Update password
                    const { error: updateError } = await supabase.auth.updateUser({
                      password: passwordData.newPassword,
                    })

                    if (updateError) throw updateError

                    // Update password_changed_at in user_profiles
                    await supabase
                      .from('user_profiles')
                      .update({ password_changed_at: new Date().toISOString() })
                      .eq('id', user.id)

                    setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
                    
                    // Clear form and close modal after 2 seconds
                    setTimeout(() => {
                  setShowPasswordModal(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setPasswordMessage(null)
                    }, 2000)

                  } catch (error: any) {
                    console.error('Error changing password:', error)
                    setPasswordMessage({ 
                      type: 'error', 
                      text: error.message || 'Failed to change password. Please try again.' 
                    })
                  } finally {
                    setChangingPassword(false)
                  }
                }}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-700 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Delete Account
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  ⚠️ Warning: This will permanently delete your account
                </p>
                <ul className="text-xs text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>All your account data will be permanently deleted</li>
                  <li>All transactions and history will be removed</li>
                  <li>All accounts and balances will be deleted</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Type <strong className="text-red-600">DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteAccountConfirm}
                  onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="input-field"
                  disabled={deletingAccount}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteAccountModal(false)
                  setDeleteAccountConfirm('')
                }}
                disabled={deletingAccount}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteAccountConfirm !== 'DELETE') {
                    setNotification({
                      isOpen: true,
                      type: 'warning',
                      title: 'Confirmation Required',
                      message: 'Please type DELETE to confirm account deletion.'
                    })
                    return
                  }

                  try {
                    setDeletingAccount(true)
                    const { data: { user }, error: userError } = await supabase.auth.getUser()
                    if (userError || !user) throw new Error('User not authenticated')

                    // Mark account as deleted in user_profiles
                    const { error: updateError } = await supabase
                      .from('user_profiles')
                      .update({
                        account_status: 'deleted',
                        deleted_at: new Date().toISOString(),
                      })
                      .eq('id', user.id)

                    if (updateError) throw updateError

                    // Sign out the user
                    await supabase.auth.signOut()

                    // Redirect to login with message
                    setNotification({
                      isOpen: true,
                      type: 'success',
                      title: 'Account Deleted',
                      message: 'Your account has been deleted. You will be redirected to the login page.'
                    })
                    setTimeout(() => {
                      window.location.href = '/login'
                    }, 2000)
                  } catch (error: any) {
                    console.error('Error deleting account:', error)
                    setNotification({
                      isOpen: true,
                      type: 'error',
                      title: 'Deletion Failed',
                      message: `Failed to delete account: ${error.message || 'Please try again.'}`
                    })
                    setDeletingAccount(false)
                  }
                }}
                disabled={deletingAccount || deleteAccountConfirm !== 'DELETE'}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {deletingAccount ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// KYC Tab Component
function KYCTabContent({ profile }: { profile: any }) {
  const [kycData, setKycData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    nationality: '',
    country_of_residence: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    phone_number: '',
    id_type: 'passport' as 'passport' | 'driver_license' | 'national_id' | 'other',
    id_number: '',
    id_expiry_date: '',
  })

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    id_front: null,
    id_back: null,
    proof_of_address: null,
    selfie: null,
  })

  const [previews, setPreviews] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchKYCData()
  }, [])

  const fetchKYCData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setKycData(data)
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          date_of_birth: data.date_of_birth || '',
          nationality: data.nationality || '',
          country_of_residence: data.country_of_residence || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          phone_number: data.phone_number || '',
          id_type: data.id_type || 'passport',
          id_number: data.id_number || '',
          id_expiry_date: data.id_expiry_date || '',
        })
        setPreviews({
          id_front: data.id_front_url || '',
          id_back: data.id_back_url || '',
          proof_of_address: data.proof_of_address_url || '',
          selfie: data.selfie_url || '',
        })
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleFileChange = async (field: string, file: File | null) => {
    if (!file) return

    // Create immediate preview from file
    const blobUrl = URL.createObjectURL(file)
    setFiles({ ...files, [field]: file })
    setPreviews({ ...previews, [field]: blobUrl })

    setUploading({ ...uploading, [field]: true })
    try {
      const path = field === 'selfie' ? 'selfies' : field === 'proof_of_address' ? 'address-proof' : 'id-documents'
      const url = await uploadFile(file, path)
      
      // Update preview with uploaded URL (revoke blob URL to free memory)
      URL.revokeObjectURL(blobUrl)
      setPreviews({ ...previews, [field]: url })
    } catch (error: any) {
      console.error('Error uploading file:', error)
      // Remove preview on error
      URL.revokeObjectURL(blobUrl)
      setPreviews(prev => {
        const newPreviews = { ...prev }
        delete newPreviews[field]
        return newPreviews
      })
      setFiles(prev => {
        const newFiles = { ...prev }
        newFiles[field] = null
        return newFiles
      })
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload file. Please try again.',
      })
    } finally {
      setUploading({ ...uploading, [field]: false })
    }
  }

  const handleSubmitKYC = async () => {
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || 
        !formData.nationality || !formData.country_of_residence || !formData.address_line1 ||
        !formData.city || !formData.state || !formData.postal_code || !formData.phone_number ||
        !formData.id_number || !files.id_front || !files.selfie) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields and upload required documents.',
      })
      return
    }

    try {
      setSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Upload files if not already uploaded (check if URL starts with http or blob)
      let idFrontUrl = previews.id_front || ''
      let idBackUrl = previews.id_back || ''
      let proofOfAddressUrl = previews.proof_of_address || ''
      let selfieUrl = previews.selfie || ''

      if (files.id_front && !idFrontUrl.startsWith('http') && !idFrontUrl.startsWith('blob')) {
        idFrontUrl = await uploadFile(files.id_front, 'id-documents')
      }
      if (files.id_back && !idBackUrl.startsWith('http') && !idBackUrl.startsWith('blob')) {
        idBackUrl = await uploadFile(files.id_back, 'id-documents')
      }
      if (files.proof_of_address && !proofOfAddressUrl.startsWith('http') && !proofOfAddressUrl.startsWith('blob')) {
        proofOfAddressUrl = await uploadFile(files.proof_of_address, 'address-proof')
      }
      if (files.selfie && !selfieUrl.startsWith('http') && !selfieUrl.startsWith('blob')) {
        selfieUrl = await uploadFile(files.selfie, 'selfies')
      }

      // Create or update KYC submission
      const kycPayload = {
        user_id: user.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality.trim(),
        country_of_residence: formData.country_of_residence.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim() || null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        phone_number: formData.phone_number.trim(),
        id_type: formData.id_type,
        id_number: formData.id_number.trim(),
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl || null,
        id_expiry_date: formData.id_expiry_date || null,
        proof_of_address_url: proofOfAddressUrl || null,
        selfie_url: selfieUrl,
        status: kycData?.status === 'rejected' ? 'pending' : (kycData?.status || 'pending'),
        submitted_at: new Date().toISOString(),
      }

      let error
      if (kycData) {
        // Update existing KYC
        const { error: updateError } = await supabase
          .from('kyc_verifications')
          .update(kycPayload)
          .eq('id', kycData.id)
        error = updateError
      } else {
        // Create new KYC
        const { error: insertError } = await supabase
          .from('kyc_verifications')
          .insert(kycPayload)
        error = insertError
      }

      if (error) throw error

      // Update user KYC status
      const { error: userUpdateError } = await supabase
        .from('user_profiles')
        .update({ kyc_status: 'pending' })
        .eq('id', user.id)

      if (userUpdateError) console.error('Error updating user KYC status:', userUpdateError)

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'KYC Submitted',
        message: 'Your KYC verification has been submitted successfully. Our team will review it shortly.',
      })

      await fetchKYCData()
    } catch (error: any) {
      console.error('Error submitting KYC:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit KYC. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const kycStatus = kycData?.status || 'not_submitted'
  const isApproved = kycStatus === 'approved'
  const isPending = kycStatus === 'pending' || kycStatus === 'under_review'
  const isRejected = kycStatus === 'rejected'

  return (
    <div className="space-y-6">
      {/* KYC Status Banner */}
      {isApproved && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">KYC Verified</h3>
              <p className="text-green-100">Your identity has been verified. You can now buy and sell crypto.</p>
              {kycData?.verified_at && (
                <p className="text-sm text-green-200 mt-2">
                  Verified on {new Date(kycData.verified_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">KYC Under Review</h3>
              <p className="text-yellow-100">Your KYC submission is being reviewed by our team. This usually takes 1-2 business days.</p>
              {kycData?.submitted_at && (
                <p className="text-sm text-yellow-200 mt-2">
                  Submitted on {new Date(kycData.submitted_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">KYC Rejected</h3>
              <p className="text-red-100">{kycData?.rejection_reason || 'Your KYC submission was rejected. Please review and resubmit.'}</p>
              <button
                onClick={() => {
                  setKycData(null)
                  setFormData({
                    first_name: '',
                    last_name: '',
                    date_of_birth: '',
                    nationality: '',
                    country_of_residence: '',
                    address_line1: '',
                    address_line2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    phone_number: '',
                    id_type: 'passport',
                    id_number: '',
                    id_expiry_date: '',
                  })
                  setFiles({
                    id_front: null,
                    id_back: null,
                    proof_of_address: null,
                    selfie: null,
                  })
                  setPreviews({})
                }}
                className="mt-4 px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Resubmit KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {!isApproved && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  KYC Verification
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Secure identity verification
                </p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <Info className="w-4 h-4 inline mr-2" />
                Complete your Know Your Customer (KYC) verification to enable crypto trading. All information is encrypted and secure. This process typically takes 1-2 business days.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verify your identity details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g., United States"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Country of Residence *
                  </label>
                  <input
                    type="text"
                    value={formData.country_of_residence}
                    onChange={(e) => setFormData({ ...formData, country_of_residence: e.target.value })}
                    placeholder="e.g., United States"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Address Information</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your residential address</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Identity Documents</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload your government-issued ID</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ID Type *
                  </label>
                  <select
                    value={formData.id_type}
                    onChange={(e) => setFormData({ ...formData, id_type: e.target.value as any })}
                    className="input-field"
                    required
                  >
                    <option value="passport">Passport</option>
                    <option value="driver_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ID Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.id_expiry_date}
                    onChange={(e) => setFormData({ ...formData, id_expiry_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      ID Front Photo *
                    </label>
                    <div className="relative">
                      {previews.id_front ? (
                        <div className="relative group">
                          <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <img
                              src={previews.id_front}
                              alt="ID Front"
                              className="w-full h-64 object-contain"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Preview%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            {uploading.id_front && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <p className="text-white text-sm font-semibold">Uploading...</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  if (previews.id_front?.startsWith('blob:')) {
                                    URL.revokeObjectURL(previews.id_front)
                                  }
                                  setPreviews(prev => {
                                    const newPreviews = { ...prev }
                                    delete newPreviews.id_front
                                    return newPreviews
                                  })
                                  setFiles(prev => ({ ...prev, id_front: null }))
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all"
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Uploaded successfully</span>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-700 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400 mb-3 transition-colors" />
                            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, or PDF (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileChange('id_front', file)
                            }}
                            className="hidden"
                            disabled={uploading.id_front}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      ID Back Photo
                    </label>
                    <div className="relative">
                      {previews.id_back ? (
                        <div className="relative group">
                          <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <img
                              src={previews.id_back}
                              alt="ID Back"
                              className="w-full h-64 object-contain"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Preview%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            {uploading.id_back && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <p className="text-white text-sm font-semibold">Uploading...</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  if (previews.id_back?.startsWith('blob:')) {
                                    URL.revokeObjectURL(previews.id_back)
                                  }
                                  setPreviews(prev => {
                                    const newPreviews = { ...prev }
                                    delete newPreviews.id_back
                                    return newPreviews
                                  })
                                  setFiles(prev => ({ ...prev, id_back: null }))
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all"
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Uploaded successfully</span>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-700 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400 mb-3 transition-colors" />
                            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, or PDF (MAX. 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileChange('id_back', file)
                            }}
                            className="hidden"
                            disabled={uploading.id_back}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Documents */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Additional Documents</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Proof of address and selfie verification</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Proof of Address (Utility Bill, Bank Statement)
                  </label>
                  <div className="relative">
                    {previews.proof_of_address ? (
                      <div className="relative group">
                        <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <img
                            src={previews.proof_of_address}
                            alt="Proof of Address"
                            className="w-full h-64 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Preview%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          {uploading.proof_of_address && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-white text-sm font-semibold">Uploading...</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                if (previews.proof_of_address?.startsWith('blob:')) {
                                  URL.revokeObjectURL(previews.proof_of_address)
                                }
                                setPreviews(prev => {
                                  const newPreviews = { ...prev }
                                  delete newPreviews.proof_of_address
                                  return newPreviews
                                })
                                setFiles(prev => ({ ...prev, proof_of_address: null }))
                              }}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Uploaded successfully</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-700 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400 mb-3 transition-colors" />
                          <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, or PDF (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileChange('proof_of_address', file)
                          }}
                          className="hidden"
                          disabled={uploading.proof_of_address}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Selfie with ID *
                  </label>
                  <div className="relative">
                    {previews.selfie ? (
                      <div className="relative group">
                        <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          <img
                            src={previews.selfie}
                            alt="Selfie"
                            className="w-full h-64 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Preview%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          {uploading.selfie && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-white text-sm font-semibold">Uploading...</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                if (previews.selfie?.startsWith('blob:')) {
                                  URL.revokeObjectURL(previews.selfie)
                                }
                                setPreviews(prev => {
                                  const newPreviews = { ...prev }
                                  delete newPreviews.selfie
                                  return newPreviews
                                })
                                setFiles(prev => ({ ...prev, selfie: null }))
                              }}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-all"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Uploaded successfully</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-green-700 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-green-700 dark:group-hover:text-green-400 mb-3 transition-colors" />
                          <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            PNG or JPG (MAX. 5MB)
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                            Take a clear selfie holding your ID next to your face
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileChange('selfie', file)
                          }}
                          className="hidden"
                          disabled={uploading.selfie}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-6 -mx-6 -mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-green-700 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Security & Privacy</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    By submitting, you agree to our Terms of Service and Privacy Policy. All information is encrypted and stored securely.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSubmitKYC}
                disabled={submitting || isPending}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting KYC...
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6" />
                    {kycData ? 'Update KYC Submission' : 'Submit KYC Verification'}
                  </>
                )}
              </button>
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
