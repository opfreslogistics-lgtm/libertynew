import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Warn if using placeholder values (but only in browser, not during build)
if (typeof window !== 'undefined' && (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key')) {
  console.warn('Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get user profile with role
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}




