import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: any = null

    const setupSubscription = async () => {
      await fetchNotifications()

      // Set up real-time subscription for notifications
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (user && !userError) {
        channel = supabase
          .channel(`notifications_changes_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('Notification change detected:', payload)
              // Refresh notifications when any change occurs
              // Use a small delay to ensure database has updated
              setTimeout(() => {
                fetchNotifications()
              }, 100)
            }
          )
          .subscribe()

        console.log('Real-time subscription set up for notifications')
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        console.log('Real-time subscription removed for notifications')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      // Fetch notifications from database - Get latest 50 for sidebar display
      const { data, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50) // Get latest 50 notifications for sidebar

      if (notificationsError) {
        throw notificationsError
      }

      setNotifications((data || []) as Notification[])
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (err: any) {
      console.error('Error marking notification as read:', err)
    }
  }

  const refreshNotifications = () => {
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    refreshNotifications,
  }
}

