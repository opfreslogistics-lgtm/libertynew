'use client'

import { useAppSettings } from '@/lib/hooks/useAppSettings'
import { useTheme } from '@/components/ThemeProvider'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AuthTopBar() {
  const { settings } = useAppSettings()
  const { theme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const appName = settings.app_name || 'Liberty National Bank'
  // Get logo URLs - prioritize uploaded logos (same logic as AdvancedNavbar)
  const logoLight = settings.app_logo_light || settings.app_logo || ''
  const logoDark = settings.app_logo_dark || settings.app_logo || ''
  // Theme-aware logo selection
  const logoUrl = theme === 'dark' ? logoDark : logoLight
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 AuthTopBar Debug:', {
      theme,
      logoLight,
      logoDark,
      logoUrl,
      allSettings: settings
    })
  }, [theme, logoLight, logoDark, logoUrl, settings])

  const isLoginPage = pathname === '/login'
  const isSignupPage = pathname === '/signup'

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Far Left */}
          <div className="flex items-center pl-4 sm:pl-6 lg:pl-8">
            <Link href="/" className="flex items-center group">
              {logoUrl ? (
                <div className="h-10 sm:h-12 flex items-center">
                  <Image
                    src={logoUrl}
                    alt={`${appName} Logo`}
                    width={200}
                    height={48}
                    className="h-full w-auto max-w-[160px] sm:max-w-[200px] object-contain group-hover:opacity-90 transition-opacity duration-300"
                    unoptimized
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-700 to-green-800 rounded-xl shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="hidden sm:block text-lg font-bold text-gray-900 dark:text-white">
                    {appName}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 pr-4 sm:pr-6 lg:pr-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
            >
              Support
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
            {isLoginPage ? (
              <Link
                href="/signup"
                className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            ) : isSignupPage ? (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  Open Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden pr-4 sm:pr-6 lg:pr-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-gray-200 dark:border-gray-800 mt-2 pt-4">
            <Link
              href="/"
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/support"
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
            {isLoginPage ? (
              <Link
                href="/signup"
                className="block px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-800 rounded-lg text-center transition-all shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            ) : isSignupPage ? (
              <Link
                href="/login"
                className="block px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-800 rounded-lg text-center transition-all shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-800 rounded-lg text-center transition-all shadow-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Open Account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
