/**
 * Admin Global OTP Setting API Route
 * Allows admins to enable/disable OTP globally for all users
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Get global OTP setting
    const { data: setting, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('setting_key', 'otp_global_enabled')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching global OTP setting:', error)
      return NextResponse.json(
        { error: 'Failed to fetch global OTP setting' },
        { status: 500 }
      )
    }

    // Handle JSONB boolean value - it could be stored as boolean, string, or JSONB object
    let enabled = false
    if (setting?.setting_value) {
      const value = setting.setting_value
      if (typeof value === 'boolean') {
        enabled = value
      } else if (typeof value === 'string') {
        enabled = value === 'true' || value === '"true"'
      } else if (typeof value === 'object' && value !== null) {
        // JSONB might be an object or boolean
        enabled = value === true || String(value) === 'true'
      }
    }

    return NextResponse.json({
      success: true,
      enabled,
    })
  } catch (error: any) {
    console.error('Error in get global OTP setting route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { adminUserId, enabled } = body

    if (!adminUserId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Admin user ID and enabled status are required' },
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

    // Update or insert global setting
    // Store boolean as JSONB properly
    const { error: upsertError } = await supabaseAdmin
      .from('app_settings')
      .upsert({
        setting_key: 'otp_global_enabled',
        setting_value: enabled, // This will be stored as JSONB boolean
        updated_by: adminUserId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'setting_key',
      })

    if (upsertError) {
      console.error('Error updating global OTP setting:', upsertError)
      return NextResponse.json(
        { error: 'Failed to update global OTP setting' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Global OTP verification ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled,
    })
  } catch (error: any) {
    console.error('Error in update global OTP setting route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

