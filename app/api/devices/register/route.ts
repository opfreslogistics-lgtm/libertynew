import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const body = await request.json()
    const {
      deviceId,
      deviceName,
      deviceType,
      browser,
      browserVersion,
      os,
      osVersion,
      userAgent,
      ipAddress,
      location,
    } = body

    // Get current user session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { createClient: createClientSSR } = await import('@supabase/supabase-js')
    const supabaseWithToken = createClientSSR(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseWithToken.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if device already exists
    const { data: existingDevice } = await supabaseAdmin
      .from('user_devices')
      .select('id')
      .eq('user_id', user.id)
      .eq('device_id', deviceId)
      .maybeSingle()

    if (existingDevice) {
      // Update existing device
      const { error: updateError } = await supabaseAdmin
        .from('user_devices')
        .update({
          device_name: deviceName,
          device_type: deviceType,
          browser,
          browser_version: browserVersion,
          os,
          os_version: osVersion,
          user_agent: userAgent,
          ip_address: ipAddress || null,
          location: location || null,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDevice.id)

      if (updateError) {
        console.error('Error updating device:', updateError)
        return NextResponse.json({ error: 'Failed to update device' }, { status: 500 })
      }
    } else {
      // Set all other devices for this user as not current
      await supabaseAdmin
        .from('user_devices')
        .update({ is_current: false })
        .eq('user_id', user.id)

      // Insert new device as current
      const { error: insertError } = await supabaseAdmin
        .from('user_devices')
        .insert([
          {
            user_id: user.id,
            device_id: deviceId,
            device_name: deviceName,
            device_type: deviceType,
            browser,
            browser_version: browserVersion,
            os,
            os_version: osVersion,
            user_agent: userAgent,
            ip_address: ipAddress || null,
            location: location || null,
            is_current: true,
            last_active_at: new Date().toISOString(),
          },
        ])

      if (insertError) {
        console.error('Error inserting device:', insertError)
        return NextResponse.json({ error: 'Failed to register device' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in device registration:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

