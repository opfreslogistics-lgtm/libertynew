'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react'
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
}

export default function UserChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [adminTyping, setAdminTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { profile } = useUserProfile()

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, adminTyping])

  // Listen for open chat event
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true)
    }

    window.addEventListener('openChat', handleOpenChat)
    return () => window.removeEventListener('openChat', handleOpenChat)
  }, [])

  // Create or fetch chat session
  useEffect(() => {
    if (isOpen && profile) {
      initializeChat()
    }
  }, [isOpen, profile])

  // Set up real-time subscription
  useEffect(() => {
    if (!chatSession?.chat_id) return

    const channel = supabase
      .channel(`chat:${chatSession.chat_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatSession.chat_id}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // Fetch sender name if it's an admin
          if (newMessage.sender_id !== profile?.id) {
            const { data: senderProfile } = await supabase
              .from('user_profiles')
              .select('first_name, last_name')
              .eq('id', newMessage.sender_id)
              .single()
            
            if (senderProfile) {
              newMessage.sender_name = `${senderProfile.first_name} ${senderProfile.last_name}`
            }
          }

          setMessages((prev) => [...prev, newMessage])
          
          // Mark as read
          if (newMessage.receiver_id === profile?.id) {
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id)
          }

          // Play notification sound
          playNotificationSound()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_sessions',
          filter: `chat_id=eq.${chatSession.chat_id}`,
        },
        (payload) => {
          const updatedSession = payload.new as ChatSession
          setChatSession(updatedSession)
          
          if (updatedSession.status === 'ended') {
            setIsOpen(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatSession?.chat_id, profile?.id])

  const initializeChat = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !profile) return

      // Check for existing active or waiting session so we don't create duplicates
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'waiting'])
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      if (existingSession) {
        setChatSession(existingSession)
        await fetchMessages(existingSession.chat_id)
      } else {
        // Create new chat session
        const chatId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const { data: newSession, error } = await supabase
          .from('chat_sessions')
          .insert({
            chat_id: chatId,
            user_id: user.id,
            status: 'waiting',
          })
          .select()
          .single()

        if (error) throw error

        setChatSession(newSession)
      }
    } catch (error: any) {
      console.error('Error initializing chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      // Fetch sender names for messages
      const messagesWithNames = await Promise.all(
        (data || []).map(async (msg) => {
          if (msg.sender_id === profile?.id) {
            return { ...msg, sender_name: `${profile.first_name} ${profile.last_name}` }
          }
          
          const { data: senderProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', msg.sender_id)
            .single()
          
          return {
            ...msg,
            sender_name: senderProfile ? `${senderProfile.first_name} ${senderProfile.last_name}` : 'Support',
          }
        })
      )

      setMessages(messagesWithNames)
    } catch (error: any) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !chatSession || sending) return

    try {
      setSending(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Find admin to assign if session is waiting
      if (chatSession.status === 'waiting') {
        const { data: admins } = await supabase
          .from('user_profiles')
          .select('id')
          .in('role', ['admin', 'superadmin'])
          .limit(1)

        if (admins && admins.length > 0) {
          await supabase
            .from('chat_sessions')
            .update({
              admin_id: admins[0].id,
              status: 'active',
            })
            .eq('chat_id', chatSession.chat_id)
        }
      }

      // Get current session to get admin_id
      const { data: updatedSession } = await supabase
        .from('chat_sessions')
        .select('admin_id')
        .eq('chat_id', chatSession.chat_id)
        .single()

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatSession.chat_id,
          sender_id: user.id,
          receiver_id: updatedSession?.admin_id || null,
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
    if (!chatSession) return

    try {
      await supabase
        .from('chat_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('chat_id', chatSession.chat_id)

      // Send transcript email
      await fetch('/api/chat/send-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatSession.chat_id }),
      })

      setIsOpen(false)
      setChatSession(null)
      setMessages([])
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
    // Create a simple notification sound
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } flex flex-col`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h3 className="font-bold">Live Support</h3>
            <p className="text-xs text-green-100">
              {chatSession?.status === 'waiting' ? 'Waiting for admin...' : 'Chat with support'}
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
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Start a conversation with our support team</p>
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
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1 opacity-80">
                        {msg.sender_id === profile?.id ? 'You' : msg.sender_name || 'Support'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                {adminTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Support is typing...
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
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700 dark:bg-gray-700 dark:text-white"
                disabled={sending || chatSession?.status === 'ended'}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !currentMessage.trim() || chatSession?.status === 'ended'}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {chatSession?.status === 'active' && (
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
    </div>
  )
}

