/**
 * Email Notification Service
 * Handles sending email notifications for various banking actions
 * Uses fetch to call /api/email/send route (same pattern as OTP)
 */

import { supabase } from '@/lib/supabase'

// Email API URL - always use relative URL (works in both client and server contexts)
const EMAIL_API_URL = '/api/email/send'

export interface EmailNotificationData {
  notificationType: string
  recipientEmail: string
  recipientName?: string
  subject: string
  metadata?: Record<string, any>
  userId?: string
  adminId?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

/**
 * Send email notification
 */
export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
  try {
    console.log('📧 Sending email notification:', {
      to: data.recipientEmail,
      type: data.notificationType,
      subject: data.subject,
    })
    
    // Call Next.js API route to send email (same pattern as OTP)
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationType: data.notificationType,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        subject: data.subject,
        metadata: data.metadata,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText }
      }
      console.error('❌ Email sending failed:', {
        status: response.status,
        statusText: response.statusText,
        error,
        url: EMAIL_API_URL,
      })
      await logEmailNotification(data, `HTTP ${response.status}: ${JSON.stringify(error)}`)
      return false
    }

    const result = await response.json()
    
    if (!result.success) {
      console.error('❌ Email API returned error:', result)
      await logEmailNotification(data, result.error || result.message || 'Unknown error')
      return false
    }

    console.log('✅ Email sent successfully:', {
      to: data.recipientEmail,
      type: data.notificationType,
      messageId: result.messageId,
    })

    // Log email notification in database
    await logEmailNotification(data)

    return true
  } catch (error) {
    console.error('❌ Error sending email notification:', error)
    // Still log the attempt
    await logEmailNotification(data, error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

/**
 * Log email notification in database
 */
async function logEmailNotification(
  data: EmailNotificationData,
  error?: string
): Promise<void> {
  try {
    const { error: dbError } = await supabase.from('email_notifications').insert({
      user_id: data.userId || null,
      admin_id: data.adminId || null,
      notification_type: data.notificationType,
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName || null,
      subject: data.subject,
      email_sent: !error,
      email_sent_at: !error ? new Date().toISOString() : null,
      email_error: error || null,
      metadata: data.metadata || null,
    })

    if (dbError) {
      console.error('Error logging email notification:', dbError)
    }
  } catch (error) {
    console.error('Error logging email notification:', error)
  }
}

/**
 * Get admin emails
 */
export async function getAdminEmails(): Promise<Array<{ email: string; name: string }>> {
  try {
    console.log('📧 Fetching admin emails')
    
    // Primary method: Query user_profiles directly
    const { data: adminProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'active')

    if (!profileError && adminProfiles && adminProfiles.length > 0) {
      const admins = adminProfiles
        .filter(profile => profile.email) // Only include admins with emails
        .map(profile => ({
          email: profile.email,
          name: profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.first_name || profile.last_name || 'Admin',
        }))
      
      console.log('📧 Admin emails (direct query):', admins.length)
      return admins
    }

    // Fallback: Try RPC function
    if (profileError) {
      console.warn('⚠️ Direct query failed, trying RPC function:', profileError)
      const { data, error } = await supabase.rpc('get_admin_emails')

      if (!error && data && data.length > 0) {
        console.log('📧 Admin emails (RPC):', data.length)
        return data
      }
    }

    console.warn('⚠️ No admin emails found')
    return []
  } catch (error) {
    console.error('❌ Error fetching admin emails:', error)
    return []
  }
}

/**
 * Get user email and name
 */
export async function getUserEmailInfo(
  userId: string
): Promise<{ email: string; name: string } | null> {
  try {
    console.log('📧 Fetching user email info for userId:', userId)
    
    // Primary method: Query user_profiles directly (same as OTP approach - get email from database)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single()
    
    if (!profileError && profileData && profileData.email) {
      const email = profileData.email
      const name = profileData.first_name && profileData.last_name
        ? `${profileData.first_name} ${profileData.last_name}`
        : profileData.first_name || profileData.last_name || 'User'

      console.log('📧 User email info (direct query):', { email, name })
      return { email, name }
    }

    // Fallback: Try RPC function
    if (profileError) {
      console.warn('⚠️ Direct query failed, trying RPC function:', profileError)
      const { data, error } = await supabase.rpc('get_user_email_info', {
        user_uuid: userId,
      })

      if (!error && data && data.length > 0 && data[0].email) {
        console.log('📧 User email info (RPC):', data[0])
        return data[0]
      }
    }

    console.error('❌ No email found for user:', userId, { profileError, profileData })
    return null
  } catch (error) {
    console.error('❌ Error fetching user email info:', error)
    return null
  }
}

/**
 * Send notification to user
 */
export async function notifyUser(
  userId: string,
  notificationType: string,
  subject: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    console.log('📧 notifyUser called:', { userId, notificationType, subject })
    
    const userInfo = await getUserEmailInfo(userId)
    if (!userInfo) {
      console.error('❌ User email info not found for userId:', userId)
      return false
    }

    if (!userInfo.email) {
      console.error('❌ User email is empty for userId:', userId)
      return false
    }

    console.log('📧 Sending email to user:', { email: userInfo.email, name: userInfo.name })

    const result = await sendEmailNotification({
      notificationType,
      recipientEmail: userInfo.email,
      recipientName: userInfo.name,
      subject,
      metadata,
      userId,
    })

    console.log('📧 notifyUser result:', { userId, success: result })
    return result
  } catch (error) {
    console.error('❌ Error in notifyUser:', error)
    return false
  }
}

/**
 * Send notification to admins
 */
export async function notifyAdmins(
  notificationType: string,
  subject: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const adminEmails = await getAdminEmails()
  if (adminEmails.length === 0) {
    console.warn('No admin emails found')
    return false
  }

  const results = await Promise.all(
    adminEmails.map((admin) =>
      sendEmailNotification({
        notificationType,
        recipientEmail: admin.email,
        recipientName: admin.name,
        subject,
        metadata,
        adminId: admin.email, // Store admin identifier
      })
    )
  )

  return results.every((result) => result)
}

/**
 * Send notification to both user and admins
 */
export async function notifyUserAndAdmins(
  userId: string,
  notificationType: string,
  userSubject: string,
  adminSubject: string,
  userMetadata?: Record<string, any>,
  adminMetadata?: Record<string, any>
): Promise<boolean> {
  const [userResult, adminResult] = await Promise.all([
    notifyUser(userId, notificationType, userSubject, userMetadata),
    notifyAdmins(notificationType, adminSubject, adminMetadata || userMetadata),
  ])

  return userResult && adminResult
}

