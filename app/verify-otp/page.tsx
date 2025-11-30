'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Shield,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function VerifyOTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/login')
          return
        }

        const userId = session.user.id

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, email, first_name, last_name, role')
          .eq('id', userId)
          .single()

        if (!profile) {
          router.push('/login')
          return
        }

        setUserId(userId)
        setUserEmail(profile.email)

        // Check if OTP is actually required
        const requiresOTP = await checkOTPRequirement(userId, profile.role)
        if (!requiresOTP) {
          // Redirect to appropriate dashboard
          if (profile.role === 'admin' || profile.role === 'superadmin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
          return
        }

        // Send OTP automatically
        console.log('Sending OTP to user:', userId)
        await sendOTP(userId)
      } catch (error) {
        console.error('Session check error:', error)
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  const checkOTPRequirement = async (userId: string, role: string): Promise<boolean> => {
    // Superadmin always bypasses
    if (role === 'superadmin') {
      return false
    }

    try {
      const response = await fetch('/api/otp/check-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()
      return data.requiresOTP === true
    } catch (error) {
      console.error('Error checking OTP requirement:', error)
      return true // Default to requiring OTP on error
    }
  }

  const sendOTP = async (userId: string) => {
    try {
      setError(null)
      console.log('Calling /api/otp/send for user:', userId)
      
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      console.log('OTP send response status:', response.status)
      const data = await response.json()
      console.log('OTP send response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      // Start countdown (5 minutes = 300 seconds)
      setCountdown(300)
      console.log('OTP sent successfully, countdown started')
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      setError(error.message || 'Failed to send OTP. Please try again.')
    }
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || ''
    }
    setOtp(newOtp)
    setError(null)

    // Focus last filled input or first empty
    const lastFilled = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastFilled]?.focus()
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    if (!userId) {
      setError('Session expired. Please log in again.')
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otpCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP code')
      }

      setSuccess(true)

      // Get user role to redirect appropriately
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        // Redirect after short delay
        setTimeout(() => {
          if (profile?.role === 'admin' || profile?.role === 'superadmin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }, 1500)
      }
    } catch (error: any) {
      setError(error.message || 'Invalid OTP code. Please try again.')
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!userId || resending || countdown > 0) return

    setResending(true)
    setError(null)

    try {
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      setCountdown(300) // Reset countdown
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Identity
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to
          </p>
          {userEmail && (
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mt-1">
              {userEmail}
            </p>
          )}
        </div>

        {/* OTP Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300 flex-1">
                OTP verified successfully! Redirecting...
              </p>
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 dark:text-white transition-all"
                  disabled={loading || success}
                />
              ))}
            </div>
          </div>

          {/* Countdown Timer */}
          {countdown > 0 && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Code expires in: <span className="font-semibold text-green-700 dark:text-green-400">{formatCountdown(countdown)}</span>
              </p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || success || otp.join('').length !== 6}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Verified!
              </>
            ) : (
              <>
                Verify Code
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Resend Button */}
          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend code in {formatCountdown(countdown)}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                  Security Verification
                </p>
                <p className="text-xs text-green-800 dark:text-green-400">
                  This code is valid for 5 minutes. If you didn't request this, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

