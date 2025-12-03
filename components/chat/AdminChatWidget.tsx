'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { MessageSquare, X, Send, Minimize2, Maximize2, Bell } from 'lucide-react'
import { format } from 'date-fns'

interface ChatMessage {
  id: string
  chat_id: string
  sender_id: string
  receiver_id: string | null
  message: string
  is_read: boolean
  timestamp: string
  sender_name?: string
}

interface ChatSession {
  id: string
  chat_id: string
  user_id: string
  admin_id: string | null
  status: 'active' | 'ended' | 'waiting'
  started_at: string
  user_name?: string
  user_email?: string
}

export default function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeChats, setActiveChats] = useState<ChatSession[]>([])
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { profile } = useUserProfile()

  // Fetch active chats
  useEffect(() => {
    if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
      fetchActiveChats()
      const interval = setInterval(fetchActiveChats, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [profile])

  // Set up real-time subscription for new chats
  useEffect(() => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) return

    const channel = supabase
      .channel('admin-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        () => {
          fetchActiveChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!selectedChat?.chat_id) return

    const channel = supabase
      .channel(`admin-chat:${selectedChat.chat_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${selectedChat.chat_id}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // Fetch sender name
          const { data: senderProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single()
          
          if (senderProfile) {
            newMessage.sender_name = `${senderProfile.first_name} ${senderProfile.last_name}`
          }

          setMessages((prev) => [...prev, newMessage])
          
          // Mark as read if this is the selected chat
          if (newMessage.receiver_id === profile?.id) {
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id)
          }

          // Play notification sound
          playNotificationSound()
          
          // Update unread count
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChat?.chat_id, profile?.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, userTyping])

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.chat_id)
    }
  }, [selectedChat])

  const fetchActiveChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .in('status', ['active', 'waiting'])
        .order('started_at', { ascending: false })

      if (error) throw error

      // Fetch user names and emails
      const userIds = [...new Set((data || []).map(c => c.user_id))]
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)

      const usersMap = new Map(
        (userProfiles || []).map(u => [
          u.id,
          { name: `${u.first_name} ${u.last_name}`, email: u.email }
        ])
      )

      const chatsWithNames = (data || []).map(chat => ({
        ...chat,
        user_name: usersMap.get(chat.user_id)?.name || 'Unknown User',
        user_email: usersMap.get(chat.user_id)?.email || '',
      }))

      setActiveChats(chatsWithNames)
      fetchUnreadCount()
    } catch (error: any) {
      console.error('Error fetching active chats:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact' })
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setUnreadCount(data?.length || 0)
    } catch (error: any) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      // Fetch sender names
      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', msg.sender_id)
            .single()
          
          return {
            ...msg,
            sender_name: senderProfile
              ? `${senderProfile.first_name} ${senderProfile.last_name}`
              : 'Unknown',
          }
        })
      )

      setMessages(messagesWithNames)

      // Mark all messages as read
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('chat_id', chatId)
          .eq('receiver_id', user.id)
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChat = async (chat: ChatSession) => {
    setSelectedChat(chat)
    
    // Assign admin to chat if it's waiting
    if (chat.status === 'waiting') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('chat_sessions')
          .update({
            admin_id: user.id,
            status: 'active',
          })
          .eq('chat_id', chat.chat_id)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedChat || sending) return

    try {
      setSending(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: selectedChat.chat_id,
          sender_id: user.id,
          receiver_id: selectedChat.user_id,
          message: currentMessage.trim(),
          is_read: false,
        })

      if (error) throw error

      setCurrentMessage('')
    } catch (error: any) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleEndChat = async () => {
    if (!selectedChat) return

    try {
      await supabase
        .from('chat_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('chat_id', selectedChat.chat_id)

      // Send transcript email
      await fetch('/api/chat/send-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: selectedChat.chat_id }),
      })

      setSelectedChat(null)
      setMessages([])
      fetchActiveChats()
    } catch (error: any) {
      console.error('Error ending chat:', error)
    }
  }

  const handleTyping = () => {
    setIsTyping(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return null
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-[9999]"
        aria-label="Open admin chat"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-[500px] h-[700px]'
      } flex flex-col`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h3 className="font-bold">Admin Chat</h3>
            <p className="text-xs text-red-100">
              {activeChats.length} active chat{activeChats.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!selectedChat ? (
            /* Chat List */
            <div className="flex-1 overflow-y-auto p-4">
              {activeChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No active chats</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        chat.status === 'waiting'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {chat.user_name}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            chat.status === 'waiting'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {chat.status === 'waiting' ? 'Waiting' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{chat.user_email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Started {format(new Date(chat.started_at), 'MMM d, HH:mm')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Chat Window */
            <>
              {/* Chat Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedChat.user_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {selectedChat.user_email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 ${
                            msg.sender_id === profile?.id
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm font-semibold mb-1 opacity-80">
                            {msg.sender_id === profile?.id ? 'You' : msg.sender_name || 'User'}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {format(new Date(msg.timestamp), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {userTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {selectedChat.user_name} is typing...
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => {
                      setCurrentMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:text-white"
                    disabled={sending || selectedChat.status === 'ended'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !currentMessage.trim() || selectedChat.status === 'ended'}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {selectedChat.status === 'active' && (
                  <button
                    onClick={handleEndChat}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    End Chat
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

