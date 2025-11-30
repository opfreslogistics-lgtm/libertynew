import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

/**
 * Get Supabase client (lazy initialization)
 * This prevents build-time errors when environment variables are not available
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    // For build time, create a dummy client to prevent errors
    // This will be replaced with proper client at runtime
    supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-key')
    return supabaseInstance
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export lazy getter for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient()
    return (client as any)[prop]
  }
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const client = getSupabaseClient()
  const { data: { user }, error } = await client.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get user profile with role
export const getUserProfile = async (userId: string) => {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}




