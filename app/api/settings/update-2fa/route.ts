/**
 * Update User 2FA Setting API Route
 * Allows users to toggle their personal 2FA setting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { userId, enabled } = body

    if (!userId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and enabled status are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Superadmin cannot disable 2FA (always bypasses anyway, but for consistency)
    if (userProfile.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Superadmin accounts have special security settings' },
        { status: 403 }
      )
    }

    // Update user's 2FA setting
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ two_factor_enabled: enabled })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating 2FA setting:', updateError)
      return NextResponse.json(
        { error: 'Failed to update 2FA setting' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      two_factor_enabled: enabled,
    })
  } catch (error: any) {
    console.error('Error in update 2FA route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

