'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'
import AdminChatWidget from '@/components/chat/AdminChatWidget'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isMobileOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
      <div className="flex-1 flex flex-col">
        <AdminTopBar onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 md:ml-64 md:mt-16">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
      <AdminChatWidget />
    </div>
  )
}

