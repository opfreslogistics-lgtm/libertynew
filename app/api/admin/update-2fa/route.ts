/**
 * Admin Update User 2FA API Route
 * Allows admins to force enable/disable 2FA for any user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { adminUserId, targetUserId, enabled, force } = body

    if (!adminUserId || !targetUserId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Admin user ID, target user ID, and enabled status are required' },
        { status: 400 }
      )
    }

    // Verify admin user is actually an admin
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role')
      .eq('id', adminUserId)
      .single()

    if (adminError || !adminProfile) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    if (adminProfile.role !== 'admin' && adminProfile.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Verify target user exists
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role, email, first_name, last_name')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    // Superadmin cannot have 2FA forced (always bypasses anyway)
    if (targetProfile.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot modify 2FA settings for superadmin accounts' },
        { status: 403 }
      )
    }

    // Update based on force flag
    if (force === true) {
      // Force enable/disable via admin override
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          admin_forced_2fa: enabled,
          two_factor_enabled: enabled // Also set user's personal setting
        })
        .eq('id', targetUserId)

      if (updateError) {
        console.error('Error updating admin-forced 2FA:', updateError)
        return NextResponse.json(
          { error: 'Failed to update 2FA setting' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Two-factor authentication ${enabled ? 'force enabled' : 'force disabled'} for user ${targetProfile.email}`,
        admin_forced_2fa: enabled,
        two_factor_enabled: enabled,
      })
    } else {
      // Just update user's personal setting (not forcing)
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ two_factor_enabled: enabled })
        .eq('id', targetUserId)

      if (updateError) {
        console.error('Error updating 2FA setting:', updateError)
        return NextResponse.json(
          { error: 'Failed to update 2FA setting' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} for user ${targetProfile.email}`,
        two_factor_enabled: enabled,
      })
    }
  } catch (error: any) {
    console.error('Error in admin update 2FA route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

