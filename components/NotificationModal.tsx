'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: NotificationType
  title: string
  message: string
  autoClose?: boolean
  autoCloseDelay?: number
}

export default function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 10000,
}: NotificationModalProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto close after delay
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  // Use portal to render at document root for proper z-index
  useEffect(() => {
    if (isOpen && mounted) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, mounted])

  if (!isOpen || !mounted) return null

  const getIcon = () => {
    const iconClass = 'w-8 h-8'
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-500`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />
      default:
        return <Info className={`${iconClass} text-blue-500`} />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-600 to-emerald-700',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          button: 'bg-green-600 hover:bg-green-700',
        }
      case 'error':
        return {
          bg: 'from-red-600 to-rose-700',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          button: 'bg-red-600 hover:bg-red-700',
        }
      case 'warning':
        return {
          bg: 'from-yellow-600 to-amber-700',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        }
      case 'info':
        return {
          bg: 'from-blue-600 to-cyan-700',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          button: 'bg-blue-600 hover:bg-blue-700',
        }
      default:
        return {
          bg: 'from-gray-600 to-gray-700',
          iconBg: 'bg-gray-100 dark:bg-gray-900/30',
          button: 'bg-gray-600 hover:bg-gray-700',
        }
    }
  }

  const colors = getColors()

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 notification-backdrop"
      onClick={onClose}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 notification-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', zIndex: 10000 }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.bg} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
              {getIcon()}
            </div>
            <h2 className="text-xl font-bold text-white drop-shadow-sm">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-center leading-relaxed text-base">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 ${colors.button} text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )

  // Render using portal to ensure it's at the root level
  return createPortal(modalContent, document.body)
}

