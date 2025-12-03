'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const pathname = usePathname()
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const hideLoader = () => {
    // Clear any existing timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }

    // Fade out animation
    setOpacity(0)
    
    // Hide loader after fade out
    fadeTimeoutRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 300) // Match fade out duration
  }

  useEffect(() => {
    // Show loader on pathname change
    setIsLoading(true)
    setOpacity(1)

    // Check if page is already loaded
    const checkPageReady = () => {
      if (typeof window === 'undefined') return false

      // Check if DOM is ready
      if (document.readyState !== 'complete') return false

      // Check if images are loaded
      const images = document.querySelectorAll('img')
      let imagesLoaded = true
      
      images.forEach((img) => {
        if (!img.complete) {
          imagesLoaded = false
        }
      })

      return imagesLoaded
    }

    // Minimum loading time for smooth UX - 10 seconds delay on each page
    const minLoadTime = 10000 // 10 seconds delay on each page

    // Check immediately if page is ready
    if (checkPageReady()) {
      loadingTimeoutRef.current = setTimeout(() => {
        hideLoader()
      }, minLoadTime)
    } else {
      // Wait for page to be ready
      const handleReady = () => {
        if (checkPageReady()) {
          loadingTimeoutRef.current = setTimeout(() => {
            hideLoader()
          }, minLoadTime)
        }
      }

      // Listen for load event
      window.addEventListener('load', handleReady)
      
      // Also check periodically
      const checkInterval = setInterval(() => {
        if (checkPageReady()) {
          clearInterval(checkInterval)
          handleReady()
        }
      }, 100)

      // Fallback: hide after max time
      loadingTimeoutRef.current = setTimeout(() => {
        clearInterval(checkInterval)
        hideLoader()
      }, 12000) // Max 12 seconds (10s + 2s buffer)

      return () => {
        window.removeEventListener('load', handleReady)
        clearInterval(checkInterval)
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
        }
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current)
        }
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [pathname])

  // Initial load check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleInitialLoad = () => {
        // Delay to ensure everything is rendered - 10 seconds delay for initial load
        setTimeout(() => {
          if (document.readyState === 'complete') {
            hideLoader()
          }
        }, 10000) // 10 seconds delay for initial load
      }

      if (document.readyState === 'complete') {
        handleInitialLoad()
      } else {
        window.addEventListener('load', handleInitialLoad)
        return () => window.removeEventListener('load', handleInitialLoad)
      }
    }
  }, [])

  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] flex items-center justify-center transition-opacity duration-300"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Logo/Brand */}
        <div className="relative mb-8">
          {/* Animated logo container */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-green-700/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-green-700 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
            
            {/* Middle pulsing circle */}
            <div className="absolute inset-4 bg-green-700/10 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
            
            {/* Inner logo/icon with opacity animation */}
            <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse" style={{ animationDuration: '1.5s' }}>
              <span className="text-white font-bold text-xl">L</span>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1 mt-4">
          <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
          <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></div>
          <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></div>
        </div>
      </div>
    </div>
  )
}

