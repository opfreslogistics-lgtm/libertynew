'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthGuidanceSidebar } from '@/components/auth/AuthGuidanceSidebar'
import AuthTopBar from '@/components/auth/AuthTopBar'
import Link from 'next/link'
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showFrozenModal, setShowFrozenModal] = useState(false)
  const [showDeletedModal, setShowDeletedModal] = useState(false)
  const [freezeReason, setFreezeReason] = useState<string | null>(null)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Check user role and account status
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, account_status, freeze_reason, signup_complete')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            // Check if account is deleted
            if (profile.account_status === 'deleted') {
              await supabase.auth.signOut()
              setShowDeletedModal(true)
              setCheckingSession(false)
              return
            }

            // Check if account is frozen
            if (profile.account_status === 'frozen') {
              await supabase.auth.signOut()
              setFreezeReason(profile.freeze_reason || 'Due to suspicious activity')
              setShowFrozenModal(true)
              setCheckingSession(false)
              return
            }


            // Account is active, redirect based on role
            if (profile.role === 'admin' || profile.role === 'superadmin') {
              window.location.href = '/admin'
            } else {
              window.location.href = '/dashboard'
            }
            return
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      // First, verify password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to sign in')
      }

      // Get user profile to check role and account status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, role, account_status, freeze_reason, signup_complete, otp_enabled_login, first_name, last_name, email')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      // Check if account is deleted
      if (profile?.account_status === 'deleted') {
        await supabase.auth.signOut()
        setShowDeletedModal(true)
        setLoading(false)
        return
      }

      // Check if account is frozen
      if (profile?.account_status === 'frozen') {
        await supabase.auth.signOut()
        setFreezeReason(profile.freeze_reason || 'Due to suspicious activity')
        setShowFrozenModal(true)
        setLoading(false)
        return
      }

      // Check if OTP is enabled (default to true if null)
      // Skip OTP for superadmin role
      const isOtpEnabled = profile?.otp_enabled_login !== false && profile?.role !== 'superadmin'

      if (isOtpEnabled) {
        // Generate 6-digit OTP code
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 10) // OTP expires in 10 minutes

        // Save OTP to database
        const { error: otpUpdateError } = await supabase
          .from('user_profiles')
          .update({
            otp_code: generatedOtp,
            otp_generated_at: new Date().toISOString(),
            otp_expires_at: expiresAt.toISOString(),
          })
          .eq('id', authData.user.id)

        if (otpUpdateError) {
          console.error('Error saving OTP:', otpUpdateError)
          throw new Error('Failed to generate OTP. Please try again.')
        }

        // Send OTP email via Nodemailer
        try {
          const recipientName = profile?.first_name 
            ? `${profile.first_name} ${profile.last_name || ''}`.trim()
            : 'Valued Customer'
          const recipientEmail = profile?.email || authData.user.email || email

          // Use improved API client with better error handling
          const { sendOTPEmail } = await import('@/lib/utils/apiClient')
          const emailResult = await sendOTPEmail(recipientEmail, recipientName, generatedOtp)

          if (emailResult.success) {
            console.log('✅ OTP email sent successfully to:', recipientEmail)
          } else {
            console.warn('⚠️ OTP email sending failed:', emailResult.error)
            // Don't throw error - OTP is still saved in database, user can still verify manually
            // The OTP code is available in the database for manual verification if needed
          }
        } catch (emailErr: any) {
          console.error('Error sending OTP email:', emailErr)
          // Don't throw error - OTP is still saved, user can still verify
          // Log the error but continue with the login flow
        }

        // Show OTP verification modal
        setPendingUserId(authData.user.id)
        setPendingRole(profile?.role || 'user')
        setShowOTPModal(true)
        setLoading(false)
        setOtpCode(['', '', '', '', '', ''])
        setOtpError(null)
      } else {
        // OTP disabled, redirect directly
      await new Promise(resolve => setTimeout(resolve, 500))
      
        if (profile?.role === 'admin' || profile?.role === 'superadmin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
      setLoading(false)
    }
  }



  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <AuthTopBar />
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          <AuthGuidanceSidebar type="login" />
          <div className="flex-1 flex items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-green-700 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Checking session...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <AuthTopBar />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <AuthGuidanceSidebar type="login" />
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-700 focus:ring-green-700 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                  Secure Login
                </p>
                <p className="text-xs text-green-800 dark:text-green-400">
                  Your session is protected with bank-level encryption
                </p>
              </div>
            </div>
          </div>
            </div>

          </div>
        </div>
      </div>

      {/* Account Frozen Modal */}
      {showFrozenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Decorative gradient header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
            
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Account Temporarily Frozen
              </h2>

              {/* Message */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-900 dark:text-amber-300 text-center leading-relaxed">
                  {freezeReason || 'Your account has been frozen due to suspicious activity.'}
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                If you believe this is an error, please contact our support team immediately. We're here to help resolve this issue.
              </p>

              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>support@libertybank.com</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <span>📞</span>
                  <span>+1 (800) 123-4567</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowFrozenModal(false)
                  setEmail('')
                  setPassword('')
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deleted Modal */}
      {showDeletedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Decorative gradient header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
            
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Account Not Found
              </h2>

              {/* Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-900 dark:text-red-300 text-center leading-relaxed">
                  Your information is not associated with any account in our system.
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                This account may have been permanently deleted. If you believe this is an error, please contact our support team for assistance.
              </p>

              {/* Contact Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>support@libertybank.com</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <span>📞</span>
                  <span>+1 (800) 123-4567</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDeletedModal(false)
                  setEmail('')
                  setPassword('')
                }}
                className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <OTPModal
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          otpError={otpError}
          setOtpError={setOtpError}
          otpLoading={otpLoading}
          setOtpLoading={setOtpLoading}
          pendingUserId={pendingUserId}
          pendingRole={pendingRole}
          onCancel={async () => {
            await supabase.auth.signOut()
            setShowOTPModal(false)
            setOtpCode(['', '', '', '', '', ''])
            setOtpError(null)
            setPendingUserId(null)
            setPendingRole(null)
          }}
        />
      )}
    </div>
  )
}

// OTP Modal Component
function OTPModal({
  otpCode,
  setOtpCode,
  otpError,
  setOtpError,
  otpLoading,
  setOtpLoading,
  pendingUserId,
  pendingRole,
  onCancel,
}: {
  otpCode: string[]
  setOtpCode: (code: string[]) => void
  otpError: string | null
  setOtpError: (error: string | null) => void
  otpLoading: boolean
  setOtpLoading: (loading: boolean) => void
  pendingUserId: string | null
  pendingRole: string | null
  onCancel: () => void
}) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus first input when modal opens
    setTimeout(() => {
      firstInputRef.current?.focus()
    }, 100)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Decorative gradient header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700"></div>
        
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
            Enter Verification Code
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            We've generated a 6-digit code. Please enter it below to complete your login.
          </p>

          {/* OTP Error */}
          {otpError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300 flex-1">{otpError}</p>
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      if (value.length <= 1) {
                        const newCode = [...otpCode]
                        newCode[index] = value
                        setOtpCode(newCode)
                        setOtpError(null)
                        
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement
                          nextInput?.focus()
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                        const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement
                        prevInput?.focus()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, 6)
                      const newCode = [...otpCode]
                      for (let i = 0; i < 6; i++) {
                        newCode[i] = pastedData[i] || ''
                      }
                      setOtpCode(newCode)
                      setOtpError(null)
                    }}
                    id={`otp-input-${index}`}
                    className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 text-gray-900 dark:text-white transition-all"
                    ref={index === 0 ? firstInputRef : undefined}
                  />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={async () => {
                  const enteredOtp = otpCode.join('')
                  if (enteredOtp.length !== 6) {
                    setOtpError('Please enter the complete 6-digit code')
                    return
                  }

                  if (!pendingUserId) {
                    setOtpError('Session expired. Please login again.')
                    return
                  }

                  setOtpLoading(true)
                  setOtpError(null)

                  try {
                    // Get user profile to check OTP
                    const { data: profile, error: profileError } = await supabase
                      .from('user_profiles')
                      .select('otp_code, otp_expires_at')
                      .eq('id', pendingUserId)
                      .single()

                    if (profileError) throw profileError

                    // Check if OTP exists and hasn't expired
                    if (!profile?.otp_code) {
                      throw new Error('OTP code has expired. Please login again.')
                    }

                    const now = new Date()
                    const expiresAt = profile.otp_expires_at ? new Date(profile.otp_expires_at) : null

                    if (expiresAt && now > expiresAt) {
                      throw new Error('OTP code has expired. Please login again.')
                    }

                    // Verify OTP
                    if (profile.otp_code !== enteredOtp) {
                      throw new Error('Invalid verification code. Please try again.')
                    }

                    // Clear OTP from database
                    await supabase
                      .from('user_profiles')
                      .update({
                        otp_code: null,
                        otp_expires_at: null,
                        otp_generated_at: null,
                      })
                      .eq('id', pendingUserId)

                    // Redirect based on role
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    if (pendingRole === 'admin' || pendingRole === 'superadmin') {
                      window.location.href = '/admin'
                    } else {
                      window.location.href = '/dashboard'
                    }
                  } catch (err: any) {
                    setOtpError(err.message || 'Verification failed. Please try again.')
                    setOtpLoading(false)
                }
              }}
              disabled={otpLoading || otpCode.join('').length !== 6}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="w-full mt-3 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>

            {/* Info */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              The code expires in 10 minutes. Need help? Contact support.
            </p>
            </div>
          </div>
        </div>
  )
}
