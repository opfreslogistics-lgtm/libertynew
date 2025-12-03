'use client'

import { useState, useEffect } from 'react'
import { getAppSettings, updateAppSetting, uploadAppImage } from '@/lib/utils/appSettings'
import NotificationModal from '@/components/NotificationModal'
import {
  Settings,
  Users,
  Shield,
  FileText,
  Bell,
  Mail,
  Globe,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Key,
  UserPlus,
  Activity,
  Database,
  Image as ImageIcon,
  Palette,
  Download,
} from 'lucide-react'
import clsx from 'clsx'

type TabType = 'general' | 'admin-accounts' | 'security' | 'notifications' | 'appearance' | 'audit-logs'

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    bankName: 'Liberty National Bank',
    bankLogo: '',
    supportEmail: 'support@libertybank.com',
    supportPhone: '+1 (555) 123-4567',
    supportHours: '24/7',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  })
  
  // Load general settings on mount
  useEffect(() => {
    const loadGeneralSettings = async () => {
      try {
        const settings = await getAppSettings()
        setGeneralSettings({
          bankName: settings.app_name || 'Liberty National Bank',
          bankLogo: settings.app_logo || '',
          supportEmail: settings.support_email || 'support@libertybank.com',
          supportPhone: settings.support_phone || '+1 (555) 123-4567',
          supportHours: settings.support_hours || '24/7',
          timezone: settings.timezone || 'America/New_York',
          currency: settings.currency || 'USD',
          dateFormat: settings.date_format || 'MM/DD/YYYY',
        })
      } catch (error) {
        console.error('Error loading general settings:', error)
      }
    }
    if (activeTab === 'general') {
      loadGeneralSettings()
    }
  }, [activeTab])

  // Admin Accounts
  const adminAccounts = [
    {
      id: 'ADMIN-001',
      name: 'John Admin',
      email: 'john.admin@libertybank.com',
      role: 'Super Admin',
      status: 'active',
      lastLogin: '2024-06-20 14:30:00',
      permissions: ['all'],
    },
    {
      id: 'ADMIN-002',
      name: 'Sarah Support',
      email: 'sarah.support@libertybank.com',
      role: 'Support Manager',
      status: 'active',
      lastLogin: '2024-06-20 15:15:00',
      permissions: ['users', 'support', 'transactions'],
    },
    {
      id: 'ADMIN-003',
      name: 'Mike Tech',
      email: 'mike.tech@libertybank.com',
      role: 'IT Admin',
      status: 'active',
      lastLogin: '2024-06-20 13:45:00',
      permissions: ['security', 'system'],
    },
  ]

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: true,
    passwordMinLength: 12,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelistEnabled: false,
    encryptionLevel: 'high',
    auditLogRetention: 365,
  })
  
  // Load security settings on mount
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const settings = await getAppSettings()
        setSecuritySettings({
          twoFactorRequired: settings.two_factor_required === 'true',
          passwordMinLength: parseInt(settings.password_min_length || '12'),
          sessionTimeout: parseInt(settings.session_timeout || '30'),
          maxLoginAttempts: parseInt(settings.max_login_attempts || '5'),
          ipWhitelistEnabled: settings.ip_whitelist_enabled === 'true',
          encryptionLevel: settings.encryption_level || 'high',
          auditLogRetention: parseInt(settings.audit_log_retention || '365'),
        })
      } catch (error) {
        console.error('Error loading security settings:', error)
      }
    }
    if (activeTab === 'security') {
      loadSecuritySettings()
    }
  }, [activeTab])

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    fraudAlerts: true,
    transactionAlerts: true,
    systemAlerts: true,
    emailSmtpServer: 'smtp.libertybank.com',
    emailSmtpPort: 587,
  })
  
  // Load notification settings on mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const settings = await getAppSettings()
        setNotificationSettings({
          emailNotifications: settings.email_notifications !== 'false',
          smsNotifications: settings.sms_notifications === 'true',
          pushNotifications: settings.push_notifications !== 'false',
          fraudAlerts: settings.fraud_alerts !== 'false',
          transactionAlerts: settings.transaction_alerts !== 'false',
          systemAlerts: settings.system_alerts !== 'false',
          emailSmtpServer: settings.email_smtp_server || 'smtp.libertybank.com',
          emailSmtpPort: parseInt(settings.email_smtp_port || '587'),
        })
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }
    }
    if (activeTab === 'notifications') {
      loadNotificationSettings()
    }
  }, [activeTab])

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    logoLight: '',
    logoDark: '',
    footerLogoLight: '',
    footerLogoDark: '',
    faviconUrl: '',
    phone: '',
    email: '',
    address: '',
    socialFacebook: '',
    socialTwitter: '',
    socialInstagram: '',
    socialLinkedin: '',
  })
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState<'light' | 'dark' | null>(null)
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState<'light' | 'dark' | null>(null)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null)

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'admin-accounts', label: 'Admin Accounts', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'audit-logs', label: 'Audit Logs', icon: Activity },
  ]

  const handleSaveGeneral = async () => {
    setSavingSettings(true)
    try {
      await Promise.all([
        updateAppSetting('app_name', generalSettings.bankName, 'text', 'Application name'),
        updateAppSetting('support_email', generalSettings.supportEmail, 'text', 'Support email address'),
        updateAppSetting('support_phone', generalSettings.supportPhone, 'text', 'Support phone number'),
        updateAppSetting('support_hours', generalSettings.supportHours, 'text', 'Support hours'),
        updateAppSetting('timezone', generalSettings.timezone, 'text', 'System timezone'),
        updateAppSetting('currency', generalSettings.currency, 'text', 'Default currency'),
        updateAppSetting('date_format', generalSettings.dateFormat, 'text', 'Date format'),
      ])
      
      setNotification({ type: 'success', message: 'General settings saved successfully!' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to save settings' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSaveSecurity = async () => {
    setSavingSettings(true)
    try {
      await Promise.all([
        updateAppSetting('two_factor_required', securitySettings.twoFactorRequired.toString(), 'text', 'Require 2FA for all admin accounts'),
        updateAppSetting('password_min_length', securitySettings.passwordMinLength.toString(), 'text', 'Minimum password length'),
        updateAppSetting('session_timeout', securitySettings.sessionTimeout.toString(), 'text', 'Session timeout in minutes'),
        updateAppSetting('max_login_attempts', securitySettings.maxLoginAttempts.toString(), 'text', 'Maximum login attempts'),
        updateAppSetting('ip_whitelist_enabled', securitySettings.ipWhitelistEnabled.toString(), 'text', 'Enable IP whitelist'),
        updateAppSetting('encryption_level', securitySettings.encryptionLevel, 'text', 'Encryption level'),
        updateAppSetting('audit_log_retention', securitySettings.auditLogRetention.toString(), 'text', 'Audit log retention in days'),
      ])
      
      setNotification({ type: 'success', message: 'Security settings saved successfully!' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to save settings' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingSettings(true)
    try {
      await Promise.all([
        updateAppSetting('email_notifications', notificationSettings.emailNotifications.toString(), 'text', 'Enable email notifications'),
        updateAppSetting('sms_notifications', notificationSettings.smsNotifications.toString(), 'text', 'Enable SMS notifications'),
        updateAppSetting('push_notifications', notificationSettings.pushNotifications.toString(), 'text', 'Enable push notifications'),
        updateAppSetting('fraud_alerts', notificationSettings.fraudAlerts.toString(), 'text', 'Receive fraud alert notifications'),
        updateAppSetting('transaction_alerts', notificationSettings.transactionAlerts.toString(), 'text', 'Receive transaction alerts'),
        updateAppSetting('system_alerts', notificationSettings.systemAlerts.toString(), 'text', 'Receive system alerts'),
        updateAppSetting('email_smtp_server', notificationSettings.emailSmtpServer, 'text', 'SMTP server address'),
        updateAppSetting('email_smtp_port', notificationSettings.emailSmtpPort.toString(), 'text', 'SMTP server port'),
      ])
      
      setNotification({ type: 'success', message: 'Notification settings saved successfully!' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to save settings' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setSavingSettings(false)
    }
  }

  // Load appearance settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAppSettings()
        setAppearanceSettings({
          logoLight: settings.app_logo_light || settings.app_logo || '',
          logoDark: settings.app_logo_dark || '',
          footerLogoLight: settings.footer_logo_light || '',
          footerLogoDark: settings.footer_logo_dark || '',
          faviconUrl: settings.app_favicon || '',
          phone: settings.contact_phone || '',
          email: settings.contact_email || '',
          address: settings.contact_address || '',
          socialFacebook: settings.social_facebook_url || '',
          socialTwitter: settings.social_twitter_url || '',
          socialInstagram: settings.social_instagram_url || '',
          socialLinkedin: settings.social_linkedin_url || '',
        })
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    if (activeTab === 'appearance') {
      loadSettings()
    }
  }, [activeTab])

  const handleSaveAppearance = async () => {
    setSavingSettings(true)
    try {
      // Save all settings
      await Promise.all([
        updateAppSetting('app_logo_light', appearanceSettings.logoLight || null),
        updateAppSetting('app_logo_dark', appearanceSettings.logoDark || null),
        updateAppSetting('footer_logo_light', appearanceSettings.footerLogoLight || null),
        updateAppSetting('footer_logo_dark', appearanceSettings.footerLogoDark || null),
        updateAppSetting('app_favicon', appearanceSettings.faviconUrl || null),
        updateAppSetting('contact_phone', appearanceSettings.phone || null),
        updateAppSetting('contact_email', appearanceSettings.email || null),
        updateAppSetting('contact_address', appearanceSettings.address || null),
        updateAppSetting('social_facebook_url', appearanceSettings.socialFacebook || null),
        updateAppSetting('social_twitter_url', appearanceSettings.socialTwitter || null),
        updateAppSetting('social_instagram_url', appearanceSettings.socialInstagram || null),
        updateAppSetting('social_linkedin_url', appearanceSettings.socialLinkedin || null),
      ])
      
      setNotification({ type: 'success', message: 'Appearance settings saved successfully!' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to save settings' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, logoType: 'light' | 'dark') => {
    const file = e.target.files?.[0]
    if (!file) {
      setNotification({ type: 'warning', message: 'Please select a file to upload' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setNotification({ type: 'error', message: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, SVG, or GIF)' })
      setTimeout(() => setNotification(null), 3000)
      // Reset file input
      e.target.value = ''
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setNotification({ type: 'error', message: 'File size exceeds 10MB limit. Please choose a smaller image.' })
      setTimeout(() => setNotification(null), 3000)
      // Reset file input
      e.target.value = ''
      return
    }

    setSavingSettings(true)
    setUploadingLogo(logoType)
    try {
      const settingKey = logoType === 'light' ? 'app_logo_light' : 'app_logo_dark'
      const result = await uploadAppImage(file, settingKey)
      if (result.success && result.url) {
        setAppearanceSettings({ 
          ...appearanceSettings, 
          [logoType === 'light' ? 'logoLight' : 'logoDark']: result.url 
        })
        setNotification({ type: 'success', message: `${logoType === 'light' ? 'Light' : 'Dark'} mode logo uploaded successfully!` })
        // Refresh settings to get updated values
        const settings = await getAppSettings()
        setAppearanceSettings(prev => ({
          ...prev,
          logoLight: settings.app_logo_light || settings.app_logo || prev.logoLight,
          logoDark: settings.app_logo_dark || prev.logoDark,
        }))
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to upload logo' })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setNotification({ type: 'error', message: error.message || 'Failed to upload logo. Please check your connection and try again.' })
    } finally {
      setSavingSettings(false)
      setUploadingLogo(null)
      // Reset file input
      e.target.value = ''
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, logoType: 'light' | 'dark') => {
    const file = e.target.files?.[0]
    if (!file) {
      setNotification({ type: 'warning', message: 'Please select a file to upload' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setNotification({ type: 'error', message: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, SVG, or GIF)' })
      setTimeout(() => setNotification(null), 3000)
      e.target.value = ''
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setNotification({ type: 'error', message: 'File size exceeds 10MB limit. Please choose a smaller image.' })
      setTimeout(() => setNotification(null), 3000)
      e.target.value = ''
      return
    }

    setSavingSettings(true)
    setUploadingFooterLogo(logoType)
    try {
      const settingKey = logoType === 'light' ? 'footer_logo_light' : 'footer_logo_dark'
      const result = await uploadAppImage(file, settingKey)
      if (result.success && result.url) {
        setAppearanceSettings({ 
          ...appearanceSettings, 
          [logoType === 'light' ? 'footerLogoLight' : 'footerLogoDark']: result.url 
        })
        setNotification({ type: 'success', message: `Footer ${logoType === 'light' ? 'light' : 'dark'} mode logo uploaded successfully!` })
        // Refresh settings
        const settings = await getAppSettings()
        setAppearanceSettings(prev => ({
          ...prev,
          footerLogoLight: settings.footer_logo_light || prev.footerLogoLight,
          footerLogoDark: settings.footer_logo_dark || prev.footerLogoDark,
        }))
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to upload logo' })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setNotification({ type: 'error', message: error.message || 'Failed to upload logo. Please check your connection and try again.' })
    } finally {
      setSavingSettings(false)
      setUploadingFooterLogo(null)
      e.target.value = ''
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setNotification({ type: 'warning', message: 'Please select a file to upload' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Validate file type (favicon can be ICO, PNG, or SVG)
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setNotification({ type: 'error', message: 'Invalid file type. Please upload an ICO, PNG, SVG, or JPEG file for favicon' })
      setTimeout(() => setNotification(null), 3000)
      e.target.value = ''
      return
    }

    // Validate file size (2MB for favicon)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setNotification({ type: 'error', message: 'File size exceeds 2MB limit. Please choose a smaller favicon.' })
      setTimeout(() => setNotification(null), 3000)
      e.target.value = ''
      return
    }

    setSavingSettings(true)
    setUploadingFavicon(true)
    try {
      const result = await uploadAppImage(file, 'app_favicon')
      if (result.success && result.url) {
        setAppearanceSettings({ ...appearanceSettings, faviconUrl: result.url })
        setNotification({ type: 'success', message: 'Favicon uploaded successfully!' })
        // Refresh settings
        const settings = await getAppSettings()
        setAppearanceSettings(prev => ({
          ...prev,
          faviconUrl: settings.app_favicon || prev.faviconUrl,
        }))
      } else {
        setNotification({ type: 'error', message: result.error || 'Failed to upload favicon' })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setNotification({ type: 'error', message: error.message || 'Failed to upload favicon. Please check your connection and try again.' })
    } finally {
      setSavingSettings(false)
      setUploadingFavicon(false)
      e.target.value = ''
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleAddAdmin = () => {
    // This would open a form modal - placeholder for now
    console.log('Admin account creation form would open here')
    setShowAddAdminModal(false)
  }

  const handleEditAdmin = (adminId: string) => {
    setSelectedAdmin(adminId)
    setShowEditModal(true)
  }

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm('Are you sure you want to delete this admin account?')) {
      // Admin deletion handled - could add notification here
      console.log(`Admin ${adminId} deleted`)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system configuration and admin accounts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2',
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                General Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.bankName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, bankName: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Support Phone
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.supportPhone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Timezone
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Date Format
                    </label>
                    <select
                      value={generalSettings.dateFormat}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveGeneral}
                  disabled={savingSettings}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Admin Accounts */}
          {activeTab === 'admin-accounts' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Accounts
                </h2>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center gap-2 font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Admin
                </button>
              </div>

              <div className="space-y-4">
                {adminAccounts.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                            {admin.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {admin.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-semibold">
                            {admin.role}
                          </span>
                          <span
                            className={clsx(
                              'px-3 py-1 rounded-full font-semibold',
                              admin.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                            )}
                          >
                            {admin.status}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Last login: {admin.lastLogin.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAdmin(admin.id)}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Security Settings
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Two-Factor Authentication Required
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorRequired}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorRequired: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordMinLength: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                      min="8"
                      max="32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                      min="5"
                      max="480"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                      min="3"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Audit Log Retention (days)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.auditLogRetention}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          auditLogRetention: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                      min="30"
                      max="2555"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Encryption Level
                  </label>
                  <select
                    value={securitySettings.encryptionLevel}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        encryptionLevel: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="standard">Standard (AES-128)</option>
                    <option value="high">High (AES-256)</option>
                    <option value="maximum">Maximum (AES-256 + RSA-4096)</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveSecurity}
                  disabled={savingSettings}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Security Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Notification Settings
              </h2>
              <div className="space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Enable email notifications' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Enable SMS notifications' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Enable push notifications' },
                  { key: 'fraudAlerts', label: 'Fraud Alerts', desc: 'Receive fraud alert notifications' },
                  { key: 'transactionAlerts', label: 'Transaction Alerts', desc: 'Receive transaction alerts' },
                  { key: 'systemAlerts', label: 'System Alerts', desc: 'Receive system alerts' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      value={notificationSettings.emailSmtpServer}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailSmtpServer: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.emailSmtpPort}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailSmtpPort: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={savingSettings}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Notification Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Appearance Settings
              </h2>
              {loadingSettings ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main Logo - Light Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Main Logo - Light Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Upload a landscape logo (wider than tall). This will replace the entire logo section including text.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {appearanceSettings.logoLight && (
                        <div className="w-full sm:w-64 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center p-4">
                          <img src={appearanceSettings.logoLight} alt="Logo Light" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'light')}
                          className="hidden"
                          id="logo-light-upload"
                          disabled={uploadingLogo === 'light' || savingSettings}
                        />
                        <label
                          htmlFor="logo-light-upload"
                          className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors mb-2",
                            uploadingLogo === 'light' || savingSettings
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                          )}
                        >
                          {uploadingLogo === 'light' ? (
                            <>
                              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 inline mr-2" />
                              Upload Light Mode Logo
                            </>
                          )}
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.logoLight}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              logoLight: e.target.value,
                            })
                          }
                          className="input-field w-full"
                          placeholder="Or enter logo URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Logo - Dark Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Main Logo - Dark Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Upload a landscape logo (wider than tall). This will replace the entire logo section including text.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {appearanceSettings.logoDark && (
                        <div className="w-full sm:w-64 h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center p-4">
                          <img src={appearanceSettings.logoDark} alt="Logo Dark" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'dark')}
                          className="hidden"
                          id="logo-dark-upload"
                          disabled={uploadingLogo === 'dark' || savingSettings}
                        />
                        <label
                          htmlFor="logo-dark-upload"
                          className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors mb-2",
                            uploadingLogo === 'dark' || savingSettings
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                          )}
                        >
                          {uploadingLogo === 'dark' ? (
                            <>
                              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 inline mr-2" />
                              Upload Dark Mode Logo
                            </>
                          )}
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.logoDark}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              logoDark: e.target.value,
                            })
                          }
                          className="input-field w-full"
                          placeholder="Or enter logo URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Logo - Light Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Footer Logo - Light Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Upload a landscape logo (wider than tall). This will replace the entire footer logo section including text.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {appearanceSettings.footerLogoLight && (
                        <div className="w-full sm:w-64 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center p-4">
                          <img src={appearanceSettings.footerLogoLight} alt="Footer Logo Light" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFooterLogoUpload(e, 'light')}
                          className="hidden"
                          id="footer-logo-light-upload"
                          disabled={uploadingFooterLogo === 'light' || savingSettings}
                        />
                        <label
                          htmlFor="footer-logo-light-upload"
                          className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors mb-2",
                            uploadingFooterLogo === 'light' || savingSettings
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                          )}
                        >
                          {uploadingFooterLogo === 'light' ? (
                            <>
                              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 inline mr-2" />
                              Upload Footer Light Mode Logo
                            </>
                          )}
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.footerLogoLight}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              footerLogoLight: e.target.value,
                            })
                          }
                          className="input-field w-full"
                          placeholder="Or enter logo URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Logo - Dark Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Footer Logo - Dark Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Upload a landscape logo (wider than tall). This will replace the entire footer logo section including text.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {appearanceSettings.footerLogoDark && (
                        <div className="w-full sm:w-64 h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center p-4">
                          <img src={appearanceSettings.footerLogoDark} alt="Footer Logo Dark" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFooterLogoUpload(e, 'dark')}
                          className="hidden"
                          id="footer-logo-dark-upload"
                          disabled={uploadingFooterLogo === 'dark' || savingSettings}
                        />
                        <label
                          htmlFor="footer-logo-dark-upload"
                          className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors mb-2",
                            uploadingFooterLogo === 'dark' || savingSettings
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                          )}
                        >
                          {uploadingFooterLogo === 'dark' ? (
                            <>
                              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 inline mr-2" />
                              Upload Footer Dark Mode Logo
                            </>
                          )}
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.footerLogoDark}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              footerLogoDark: e.target.value,
                            })
                          }
                          className="input-field w-full"
                          placeholder="Or enter logo URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Favicon
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Upload a square icon (16x16, 32x32, or 48x48 pixels recommended). This appears in browser tabs, bookmarks, and browser history.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {appearanceSettings.faviconUrl && (
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                          <img src={appearanceSettings.faviconUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/jpeg,image/jpg"
                          onChange={handleFaviconUpload}
                          className="hidden"
                          id="favicon-upload"
                          disabled={uploadingFavicon || savingSettings}
                        />
                        <label
                          htmlFor="favicon-upload"
                          className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors mb-2",
                            uploadingFavicon || savingSettings
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                          )}
                        >
                          {uploadingFavicon ? (
                            <>
                              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 inline mr-2" />
                              Upload Favicon
                            </>
                          )}
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.faviconUrl}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              faviconUrl: e.target.value,
                            })
                          }
                          className="input-field w-full"
                          placeholder="Or enter favicon URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={appearanceSettings.phone}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              phone: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={appearanceSettings.email}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              email: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="info@libertybank.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Address
                        </label>
                        <textarea
                          value={appearanceSettings.address}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              address: e.target.value,
                            })
                          }
                          className="input-field"
                          rows={2}
                          placeholder="123 Bank Street, Financial District, NY 10004"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.socialFacebook}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              socialFacebook: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.socialTwitter}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              socialTwitter: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="https://twitter.com/yourhandle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.socialInstagram}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              socialInstagram: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="https://instagram.com/yourhandle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          value={appearanceSettings.socialLinkedin}
                          onChange={(e) =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              socialLinkedin: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveAppearance}
                    disabled={savingSettings}
                    className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {savingSettings ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Appearance Settings
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs */}
          {activeTab === 'audit-logs' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
                <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-2 font-semibold">
                  <Download className="w-4 h-4" />
                  Export Logs
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'LOG-001',
                    action: 'Settings Updated',
                    admin: 'John Admin',
                    timestamp: '2024-06-20 14:35:22',
                    details: 'Updated security settings',
                    ipAddress: '192.168.1.100',
                  },
                  {
                    id: 'LOG-002',
                    action: 'Admin Created',
                    admin: 'Sarah Support',
                    timestamp: '2024-06-20 13:20:15',
                    details: 'Created new admin account: ADMIN-004',
                    ipAddress: '192.168.1.101',
                  },
                  {
                    id: 'LOG-003',
                    action: 'Settings Updated',
                    admin: 'Mike Tech',
                    timestamp: '2024-06-20 12:10:45',
                    details: 'Updated notification settings',
                    ipAddress: '192.168.1.102',
                  },
                  {
                    id: 'LOG-004',
                    action: 'Admin Deleted',
                    admin: 'John Admin',
                    timestamp: '2024-06-19 16:45:30',
                    details: 'Deleted admin account: ADMIN-005',
                    ipAddress: '192.168.1.100',
                  },
                  {
                    id: 'LOG-005',
                    action: 'Settings Updated',
                    admin: 'John Admin',
                    timestamp: '2024-06-19 11:20:10',
                    details: 'Updated general settings',
                    ipAddress: '192.168.1.100',
                  },
                ].map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{log.action}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {log.admin} • {log.id}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 ml-11 mb-2">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 ml-11">
                          <span>{log.timestamp}</span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Admin</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Full Name
                </label>
                <input type="text" className="input-field" placeholder="Enter admin name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Email Address
                </label>
                <input type="email" className="input-field" placeholder="admin@libertybank.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Role
                </label>
                <select className="input-field">
                  <option>Super Admin</option>
                  <option>Support Manager</option>
                  <option>IT Admin</option>
                  <option>Financial Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['Users', 'Transactions', 'Loans', 'Cards', 'Support', 'Security', 'Reports'].map(
                    (perm) => (
                      <label key={perm} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{perm}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <NotificationModal
          isOpen={!!notification}
          title={notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : notification.type === 'warning' ? 'Warning' : 'Info'}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}