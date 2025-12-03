'use client'

import { Menu, Bell, Search, X, Sparkles, ChevronDown, Building2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAppSettings } from '@/lib/hooks/useAppSettings'
import { useTheme } from '@/components/ThemeProvider'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

interface MobileTopBarProps {
  onMenuClick: () => void
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { settings } = useAppSettings()
  const { theme } = useTheme()
  const { profile, initials, fullName } = useUserProfile() // No loading state - use static data
  
  const appName = settings.app_name || 'Liberty National Bank'
  // Get logo URL - prioritize uploaded logos with proper fallback
  const logoDark = settings.app_logo_dark || settings.app_logo || ''
  const logoLight = settings.app_logo_light || settings.app_logo || ''
  const logoUrl = (theme === 'dark' && logoDark) 
    ? logoDark 
    : (logoLight || logoDark || '')

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-50 px-4">
        <div className="flex items-center justify-between h-full">
          {/* Left: Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Center: Logo */}
          <Link href="/dashboard" className="flex items-center group">
            {logoUrl ? (
              <div className="h-8 flex items-center">
                <Image
                  src={logoUrl}
                  alt={`${appName} Logo`}
                  width={120}
                  height={32}
                  className="h-full w-auto object-contain transition-transform group-hover:scale-105"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Liberty</h1>
              </div>
            )}
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95"
            >
              {showSearch ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95 relative">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* Profile Picture */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="relative"
            >
              {profile?.profile_picture_url ? (
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-green-100 dark:ring-green-900/30 active:scale-95 transition-transform">
                  <img
                    src={profile.profile_picture_url}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center ring-2 ring-green-100 dark:ring-green-900/30 active:scale-95 transition-transform">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions, accounts..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Profile Dropdown */}
        {showProfile && (
          <div className="absolute top-full right-4 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3 mb-3">
                {profile?.profile_picture_url ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-green-200 dark:ring-green-800">
                    <img
                      src={profile.profile_picture_url}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center ring-2 ring-green-200 dark:ring-green-800">
                    <span className="text-xl font-bold text-white">{initials}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{fullName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{profile?.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-700 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {profile?.role === 'superadmin' || profile?.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
            <div className="p-2">
              <Link href="/settings" onClick={() => setShowProfile(false)}>
                <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Account Settings
                </button>
              </Link>
              <Link href="/settings" onClick={() => setShowProfile(false)}>
                <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Security & Privacy
                </button>
              </Link>
              <Link href="/support" onClick={() => setShowProfile(false)}>
                <button className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Help & Support
                </button>
              </Link>
              <hr className="my-2 border-gray-200 dark:border-gray-700" />
              <button
                onClick={async () => {
                  const { supabase } = await import('@/lib/supabase')
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from going under the fixed header */}
      <div className="md:hidden h-16"></div>
    </>
  )
}

