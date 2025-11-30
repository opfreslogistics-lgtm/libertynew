/**
 * Verify OTP API Route
 * Verifies the OTP code and creates a verified session
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { userId, otpCode } = body

    if (!userId || !otpCode) {
      return NextResponse.json(
        { error: 'User ID and OTP code are required' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Invalid OTP code format. Please enter a 6-digit code.' },
        { status: 400 }
      )
    }

    // Find the most recent pending OTP for this user
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code. Please request a new code.' },
        { status: 401 }
      )
    }

    // Check if OTP has expired
    const expiresAt = new Date(otpRecord.expires_at)
    const now = new Date()
    if (now > expiresAt) {
      // Mark as expired
      await supabaseAdmin
        .from('otp_verifications')
        .update({ status: 'expired' })
        .eq('id', otpRecord.id)

      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new code.' },
        { status: 401 }
      )
    }

    // Verify OTP code
    if (otpRecord.otp_code !== otpCode) {
      return NextResponse.json(
        { error: 'Invalid OTP code. Please try again.' },
        { status: 401 }
      )
    }

    // OTP is valid - mark as used
    await supabaseAdmin
      .from('otp_verifications')
      .update({ 
        status: 'used',
        verified_at: new Date().toISOString()
      })
      .eq('id', otpRecord.id)

    // Get user's session from Supabase Auth
    const { data: { session } } = await supabaseAdmin.auth.getSession()
    
    // Create verified session record (expires in 24 hours)
    const sessionExpiresAt = new Date()
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 24)

    const sessionId = session?.access_token || `session_${userId}_${Date.now()}`

    await supabaseAdmin
      .from('otp_verified_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        expires_at: sessionExpiresAt.toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      sessionId,
    })
  } catch (error: any) {
    console.error('Error in verify OTP route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

