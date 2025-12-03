'use client'

import { Bell, Search, Settings, User, Sparkles, ChevronDown, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { useTheme } from '@/components/ThemeProvider'

interface TopBarProps {
  onMenuClick?: () => void
  isAdmin?: boolean
}

export function TopBar({ onMenuClick, isAdmin = false }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { profile, initials, fullName } = useUserProfile() // No loading state - use static data
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={`hidden md:flex fixed top-0 left-64 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-40 px-6 shadow-sm ${isAdmin ? 'right-0' : 'right-0 xl:right-80'}`}>
      <div className="flex items-center justify-between w-full">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-700 transition-colors" />
            <input
              type="text"
              placeholder="Search transactions, accounts, or ask AI assistant..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity">
              <Sparkles className="w-3 h-3 text-green-700 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">AI</span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 ml-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Settings */}
          <Link href="/settings">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all group"
            >
              {profile?.profile_picture_url ? (
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-green-100 dark:ring-green-900/30">
                  <img
                    src={profile.profile_picture_url}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center ring-2 ring-green-100 dark:ring-green-900/30">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {fullName}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-green-700 dark:text-green-400 font-semibold">
                    {profile?.role === 'superadmin' || profile?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-3 mb-3">
                    {profile?.profile_picture_url ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-green-200 dark:ring-green-800">
                        <img
                          src={profile.profile_picture_url}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center ring-2 ring-green-200 dark:ring-green-800">
                        <span className="text-lg font-bold text-white">{initials}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {fullName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {profile?.email || 'No email'}
                      </p>
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
                  <Link href="/settings">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Account Settings
                    </button>
                  </Link>
                  <Link href="/settings">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Security & Privacy
                    </button>
                  </Link>
                  <Link href="/support">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-full right-6 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <button className="text-xs text-green-700 dark:text-green-400 font-semibold">Mark all read</button>
          </div>
          {false ? (
            <div className="space-y-3">
              {/* Notifications will appear here when there are real notifications */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

