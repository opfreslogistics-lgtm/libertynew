'use client'

import { Bell, Search, Settings, User, Shield, Menu, AlertTriangle, CheckCircle, Clock, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

interface AdminTopBarProps {
  onMenuClick: () => void
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { profile, initials, fullName } = useUserProfile() // No loading state - use static data

  // Real notifications - Will be fetched from database
  const notifications: {
    id: string
    type: string
    title: string
    message: string
    time: string
    unread: boolean
    icon: any
    color: string
  }[] = []

  const unreadCount = 0

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 px-4">
        <div className="flex items-center justify-between h-full">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </button>
            {profile?.profile_picture_url ? (
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-red-600/20">
                <img
                  src={profile.profile_picture_url}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Top Bar */}
      <header className="hidden md:flex fixed top-0 left-64 right-0 h-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-40 px-6 shadow-sm">
        <div className="flex items-center justify-between w-full">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
              <input
                type="text"
                placeholder="Search users, transactions, or system logs..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity">
                <Shield className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">ADMIN</span>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 ml-6">
            {/* Quick Stats - Will show real data from database */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">0</p>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Alerts</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">0</p>
              </div>
            </div>

            {/* Settings */}
            <Link href="/admin/settings">
              <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              </button>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">Admin Notifications</h3>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const Icon = notification.icon
                      const colorMap = {
                        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                        yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
                      }

                      return (
                        <div
                          key={notification.id}
                          className={clsx(
                            'p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors',
                            notification.unread && 'bg-red-50/50 dark:bg-red-900/10'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[notification.color as keyof typeof colorMap])}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                {profile?.profile_picture_url ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-red-600/20">
                    <img
                      src={profile.profile_picture_url}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden lg:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      {profile?.profile_picture_url ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-red-600/20">
                          <img
                            src={profile.profile_picture_url}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {initials}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {profile?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        {profile?.role === 'superadmin' ? 'Super Admin Access' : 'Admin Access'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link href="/admin/settings">
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-left">
                        <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Admin Settings</span>
                      </button>
                    </Link>
                    <Link href="/dashboard">
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-left">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Switch to User Portal</span>
                      </button>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={async () => {
                        const { supabase } = await import('@/lib/supabase')
                        await supabase.auth.signOut()
                        window.location.href = '/'
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

