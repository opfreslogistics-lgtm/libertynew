/**
 * Check OTP Requirement API Route
 * Checks if a user requires OTP verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { userRequiresOTP } from '@/lib/utils/otp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user requires OTP
    const requiresOTP = await userRequiresOTP(userId)

    return NextResponse.json({
      success: true,
      requiresOTP,
    })
  } catch (error: any) {
    console.error('Error in check OTP requirement route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

