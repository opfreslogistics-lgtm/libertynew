/**
 * Supabase Admin Client
 * Helper function to create admin client with proper error handling
 * This prevents build-time errors when environment variables are not available
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdmin: SupabaseClient | null = null

/**
 * Get or create Supabase admin client
 * Lazily initializes the client only when needed (runtime, not build time)
 */
export function getSupabaseAdmin(): SupabaseClient {
  // Return existing client if already initialized
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  // Create and cache the admin client
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdmin
}

/**
 * Check if environment variables are properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
