/**
 * Debug OTP API Route
 * Helps debug OTP system issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// Mark route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, role, two_factor_enabled, admin_forced_2fa')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        error: 'User not found',
        profileError: profileError?.message,
      }, { status: 404 })
    }

    // Get global setting
    const { data: globalSetting, error: globalError } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('setting_key', 'otp_global_enabled')
      .single()

    // Get recent OTPs
    const { data: recentOTPs, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Check verified sessions
    const { data: verifiedSessions, error: sessionError } = await supabaseAdmin
      .from('otp_verified_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        two_factor_enabled: profile.two_factor_enabled,
        admin_forced_2fa: profile.admin_forced_2fa,
      },
      globalSetting: {
        exists: !!globalSetting,
        value: globalSetting?.setting_value,
        error: globalError?.message,
      },
      recentOTPs: recentOTPs || [],
      otpError: otpError?.message,
      verifiedSessions: verifiedSessions || [],
      sessionError: sessionError?.message,
      environment: {
        hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    })
  } catch (error: any) {
    console.error('Error in debug route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

