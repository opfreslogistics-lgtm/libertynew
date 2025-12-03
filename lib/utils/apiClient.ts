/**
 * API Client Utility
 * Handles API calls with proper error handling and base URL detection
 */

/**
 * Get the base URL for API calls
 * Works in both development and production
 */
export function getApiBaseUrl(): string {
  // In browser/client-side, use relative URLs (works in both dev and prod)
  if (typeof window !== 'undefined') {
    return ''
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
}

/**
 * Make an API call with proper error handling
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `API call failed: ${response.status} ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If response is not JSON, use status text
        const text = await response.text()
        if (text) {
          errorMessage = text
        }
      }
      
      return {
        error: errorMessage,
        status: response.status,
      }
    }

    // Try to parse JSON response
    try {
      const data = await response.json()
      return { data: data as T }
    } catch {
      // If response is not JSON, return empty data
      return { data: {} as T }
    }
  } catch (error: any) {
    console.error('API call error:', error)
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        error: 'Network error: Unable to connect to the server. Please check your internet connection.',
      }
    }
    
    return {
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Send OTP email via API
 */
export async function sendOTPEmail(
  recipientEmail: string,
  recipientName: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  const result = await apiCall<{ success: boolean; message?: string }>('/api/otp/send-email', {
    method: 'POST',
    body: JSON.stringify({
      recipientEmail,
      recipientName,
      otpCode,
    }),
  })

  if (result.error) {
    return {
      success: false,
      error: result.error,
    }
  }

  return {
    success: result.data?.success || false,
  }
}

