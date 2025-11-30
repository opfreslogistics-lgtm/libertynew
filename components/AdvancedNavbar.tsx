'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  X,
  User,
  Search,
  Bell,
  Settings,
  LogOut,
  Building2,
  Phone,
  Mail,
  Globe,
  Shield,
  Sun,
  Moon,
  ChevronDown,
  Wallet,
  CreditCard,
  Home,
  TrendingUp,
  Store,
  Briefcase,
  Smartphone,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import { useAppSettings } from '@/lib/hooks/useAppSettings'

export default function AdvancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  
  const { theme, toggleTheme } = useTheme()
  const { settings } = useAppSettings()
  
  // Get logo URLs - prioritize uploaded logos
  const logoLight = settings.app_logo_light || settings.app_logo || ''
  const logoDark = settings.app_logo_dark || settings.app_logo || ''
  const contactPhone = settings.contact_phone || '1-800-LIBERTY (1-800-542-3789)'
  const contactEmail = settings.contact_email || 'support@libertybank.com'
  const appName = settings.app_name || 'Liberty Bank'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Navigation menu structure with dropdowns
  const navigationMenu = [
    {
      label: 'Personal',
      hasDropdown: true,
      items: [
        { label: 'Personal Banking', href: '/personal-banking', icon: Wallet },
        { label: 'Credit Cards', href: '/credit-cards', icon: CreditCard },
        { label: 'Mortgage & Loans', href: '/mortgage', icon: Home },
        { label: 'Wealth Management', href: '/wealth-management', icon: TrendingUp },
        { label: 'Insurance', href: '/insurance', icon: Shield },
      ]
    },
    {
      label: 'Business',
      hasDropdown: true,
      items: [
        { label: 'Small Business', href: '/small-business', icon: Store },
        { label: 'Corporate Banking', href: '/corporate', icon: Building2 },
        { label: 'Business Loans', href: '/loans', icon: TrendingUp },
        { label: 'Merchant Services', href: '/services', icon: Briefcase },
      ]
    },
    {
      label: 'Digital',
      hasDropdown: false,
      href: '/digital-banking'
    },
    {
      label: 'About',
      hasDropdown: false,
      href: '/about'
    },
    {
      label: 'Contact',
      hasDropdown: false,
      href: '/contact'
    }
  ]

  return (
    <>
      {/* TOP BAR - Promotional/Info Bar */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{contactPhone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{contactEmail}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/locations" className="hover:text-green-200 transition-colors">Branch Locator</Link>
            <span className="text-green-300">|</span>
            <Link href="/contact" className="hover:text-green-200 transition-colors">Contact Us</Link>
            <span className="text-green-300">|</span>
            <Link href="/security" className="hover:text-green-200 transition-colors flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </Link>
            <span className="text-green-300">|</span>
            <button
              onClick={toggleTheme}
              className="hover:text-green-200 transition-colors flex items-center space-x-1"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MIDDLE BAR - Quick Access & Search */}
      <div className={`transition-all duration-300 ${
        isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md' : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              {/* Always prioritize uploaded logo - theme-aware */}
              {(theme === 'dark' ? logoDark : logoLight) ? (
                <div className="h-12 flex items-center">
                  <Image
                    src={theme === 'dark' ? logoDark : logoLight}
                    alt={`${appName} Logo`}
                    width={200}
                    height={48}
                    className="h-full w-auto max-w-[200px] object-contain group-hover:opacity-90 transition-opacity duration-300"
                    unoptimized
                    priority
                  />
                </div>
              ) : (
                // Fallback only when no logo uploaded
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      {appName}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Banking Beyond Borders</p>
                  </div>
                </div>
              )}
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts, services, help..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-semibold transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Open Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR WITH DROPDOWNS */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-800' 
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1">
              <NavLink href="/" active={pathname === '/'}>Home</NavLink>
              
              {navigationMenu.map((item, index) => (
                item.hasDropdown ? (
                  <div 
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 ${
                        item.items?.some(i => pathname.startsWith(i.href))
                          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
                      openDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}>
                      {item.items?.map((subItem, subIndex) => {
                        const Icon = subItem.icon
                        return (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <NavLink 
                    key={index} 
                    href={item.href!} 
                    active={pathname === item.href || pathname.startsWith(item.href!)}
                  >
                    {item.label}
                  </NavLink>
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
              
              {/* Personal Banking Submenu */}
              <div className="py-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-4">
                  Personal Banking
                </div>
                <MobileNavLink href="/personal-banking" onClick={() => setIsMobileMenuOpen(false)}>Personal Banking</MobileNavLink>
                <MobileNavLink href="/credit-cards" onClick={() => setIsMobileMenuOpen(false)}>Credit Cards</MobileNavLink>
                <MobileNavLink href="/mortgage" onClick={() => setIsMobileMenuOpen(false)}>Mortgage & Loans</MobileNavLink>
                <MobileNavLink href="/wealth-management" onClick={() => setIsMobileMenuOpen(false)}>Wealth Management</MobileNavLink>
                <MobileNavLink href="/insurance" onClick={() => setIsMobileMenuOpen(false)}>Insurance</MobileNavLink>
              </div>
              
              {/* Business Banking Submenu */}
              <div className="py-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-4">
                  Business Banking
                </div>
                <MobileNavLink href="/small-business" onClick={() => setIsMobileMenuOpen(false)}>Small Business</MobileNavLink>
                <MobileNavLink href="/corporate" onClick={() => setIsMobileMenuOpen(false)}>Corporate Banking</MobileNavLink>
                <MobileNavLink href="/loans" onClick={() => setIsMobileMenuOpen(false)}>Business Loans</MobileNavLink>
                <MobileNavLink href="/services" onClick={() => setIsMobileMenuOpen(false)}>Merchant Services</MobileNavLink>
              </div>
              
              <MobileNavLink href="/digital-banking" onClick={() => setIsMobileMenuOpen(false)}>Digital Banking</MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>About</MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</MobileNavLink>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    toggleTheme()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                    <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

// NavLink Component
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative ${
        active
          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>
      )}
    </Link>
  )
}

// Mobile NavLink Component
function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {children}
    </Link>
  )
}
