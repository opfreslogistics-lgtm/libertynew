import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Get the current user's session to verify they are an admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: No authorization header' }, { status: 401 })
    }

    // Verify the user is an admin using the service role key
    const token = authHeader.replace('Bearer ', '')
    
    // Create a client with the token to verify
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
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    // Check if user is admin using service role to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get user ID from query parameters
    const { searchParams } = new URL(request.url)
    const userIdToDelete = searchParams.get('userId')

    if (!userIdToDelete) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent deleting superadmin
    const { data: targetUserProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userIdToDelete)
      .single()

    if (targetUserProfile?.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin account' }, { status: 403 })
    }

    // Prevent deleting own account
    if (user.id === userIdToDelete) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 })
    }

    // Permanently delete the user from auth (this will cascade delete related records if foreign keys are set up)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return NextResponse.json({ 
        error: deleteAuthError.message || 'Failed to delete user from authentication system' 
      }, { status: 500 })
    }

    // Delete user profile (should be automatically deleted by cascade, but doing it explicitly for safety)
    const { error: deleteProfileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userIdToDelete)

    if (deleteProfileError) {
      console.error('Error deleting user profile:', deleteProfileError)
      // Don't fail if profile is already deleted by cascade
      // Just log the error
    }

    // Delete related records explicitly to ensure complete deletion
    // Delete accounts
    await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete transactions
    await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete notifications
    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete cards
    await supabaseAdmin
      .from('cards')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete crypto portfolios
    await supabaseAdmin
      .from('crypto_portfolios')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete crypto transactions
    await supabaseAdmin
      .from('crypto_transactions')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete loans
    await supabaseAdmin
      .from('loans')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete bills
    await supabaseAdmin
      .from('bills')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete mobile deposits
    await supabaseAdmin
      .from('mobile_deposits')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete support tickets
    await supabaseAdmin
      .from('support_tickets')
      .delete()
      .eq('user_id', userIdToDelete)

    // Delete KYC documents
    await supabaseAdmin
      .from('kyc_documents')
      .delete()
      .eq('user_id', userIdToDelete)

    return NextResponse.json({
      success: true,
      message: 'User permanently deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

