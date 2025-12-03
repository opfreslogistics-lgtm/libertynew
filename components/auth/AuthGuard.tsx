'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      setLoading(true)

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        if (requireAuth) {
          router.push(redirectTo || '/')
          return
        }
        setAuthenticated(false)
        setLoading(false)
        return
      }

      if (!session && requireAuth) {
        // No session and auth is required
        router.push(redirectTo || '/login')
        return
      }

      if (session && requireAuth) {
        // Check user profile for OTP status and role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, otp_enabled_login, otp_code')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile error:', profileError)
          if (requireAuth) {
            router.push(redirectTo || '/login')
            return
          }
          setAuthenticated(false)
          setLoading(false)
          return
        }

        // Check if OTP is required but not completed
        // If user has OTP enabled and still has an OTP code stored (didn't complete verification), log them out
        // Skip OTP check for superadmin role
        if (profile.role !== 'superadmin' && profile.otp_enabled_login && profile.otp_code) {
          // User logged in but didn't complete OTP verification - log them out
          console.warn('User has incomplete OTP verification, logging out...')
          await supabase.auth.signOut()
          router.push('/login')
          return
        }

        setAuthenticated(true)

        // Check if admin is required
        if (requireAdmin) {
          if (profile.role !== 'admin' && profile.role !== 'superadmin') {
            // User is not admin, redirect to user dashboard
            router.push('/dashboard')
            return
          }

          setIsAdmin(true)
        }
      }

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (requireAuth && !session) {
          router.push(redirectTo || '/')
        } else if (session && requireAuth) {
          setAuthenticated(true)
        }
      })

      setLoading(false)

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      if (requireAuth) {
        router.push(redirectTo || '/login')
      }
      setLoading(false)
    }
  }

  // Loading is now handled by PageLoader component
  // Just return null while loading to prevent flash
  if (loading) {
    return null
  }

  if (requireAuth && !authenticated) {
    return null // Will redirect
  }

  if (requireAdmin && !isAdmin) {
    return null // Will redirect
  }

  return <>{children}</>
}




