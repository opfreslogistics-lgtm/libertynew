/**
 * OTP Utility Functions
 * Helper functions for OTP verification logic
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * Check if a user requires OTP verification
 * Logic:
 * - If global setting = OFF → OTP never triggers
 * - If global setting = ON AND user's personal 2FA toggle = ON → OTP required
 * - If user's toggle = OFF → skip OTP verification
 * - Admin override always wins
 * - Superadmin always bypasses
 */
export async function userRequiresOTP(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Call the database function
    const { data, error } = await supabaseAdmin.rpc('user_requires_otp_verification', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error checking OTP requirement:', error)
      // Fallback to manual check
      return await manualOTPCheck(userId)
    }

    return data === true
  } catch (error) {
    console.error('Error in userRequiresOTP:', error)
    return await manualOTPCheck(userId)
  }
}

/**
 * Manual OTP check (fallback if function doesn't exist)
 */
async function manualOTPCheck(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    console.log('Manual OTP check for user:', userId)
    
    // Get global setting
    const { data: globalSetting, error: globalError } = await supabaseAdmin
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'otp_global_enabled')
      .single()

    if (globalError) {
      console.error('Error fetching global setting:', globalError)
      // If setting doesn't exist, default to false
      return false
    }

    // Handle JSONB value - it could be stored as boolean, string, or JSONB object
    let globalEnabled = false
    if (globalSetting?.setting_value !== null && globalSetting?.setting_value !== undefined) {
      const value = globalSetting.setting_value
      if (typeof value === 'boolean') {
        globalEnabled = value
      } else if (typeof value === 'string') {
        globalEnabled = value === 'true' || value === '"true"'
      } else if (typeof value === 'object' && value !== null) {
        // JSONB might be an object - try to extract boolean
        try {
          const strValue = JSON.stringify(value)
          globalEnabled = strValue === 'true' || strValue === '"true"'
        } catch {
          globalEnabled = false
        }
      }
    }

    console.log('Global OTP enabled:', globalEnabled)

    if (!globalEnabled) {
      return false
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, two_factor_enabled, admin_forced_2fa')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return false
    }

    console.log('User profile:', {
      role: profile.role,
      two_factor_enabled: profile.two_factor_enabled,
      admin_forced_2fa: profile.admin_forced_2fa,
    })

    // Superadmin always bypasses
    if (profile.role === 'superadmin') {
      return false
    }

    // Admin override always wins
    if (profile.admin_forced_2fa === true) {
      console.log('Admin forced 2FA is enabled')
      return true
    }

    // User's personal toggle
    const requiresOTP = profile.two_factor_enabled === true
    console.log('User requires OTP:', requiresOTP)
    return requiresOTP
  } catch (error) {
    console.error('Error in manualOTPCheck:', error)
    return false
  }
}

/**
 * Check if user has a valid verified OTP session
 */
export async function hasVerifiedOTPSession(userId: string, sessionId?: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const query = supabaseAdmin
      .from('otp_verified_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())

    if (sessionId) {
      query.eq('session_id', sessionId)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1)

    if (error) {
      console.error('Error checking verified session:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error in hasVerifiedOTPSession:', error)
    return false
  }
}

