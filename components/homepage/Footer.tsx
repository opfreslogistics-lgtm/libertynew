'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useAppSettings } from '@/lib/hooks/useAppSettings'
import { useTheme } from '@/components/ThemeProvider'

interface FooterProps {
  data: Record<string, any>
}

export default function Footer({ data }: FooterProps) {
  const { theme } = useTheme()
  const { settings } = useAppSettings()
  
  // Footer logos - prioritize footer-specific, then fall back to app logos
  const footerLogoLight = settings.footer_logo_light || settings.app_logo_light || settings.app_logo || ''
  const footerLogoDark = settings.footer_logo_dark || settings.app_logo_dark || settings.app_logo || ''
  const phone = settings.contact_phone || '+1 (555) 123-4567'
  const email = settings.contact_email || 'contact@libertybank.com'
  const address = settings.contact_address || '123 Bank Street, Financial District, NY 10004'
  const socialFacebook = settings.social_facebook_url || ''
  const socialTwitter = settings.social_twitter_url || ''
  const socialInstagram = settings.social_instagram_url || ''
  const socialLinkedin = settings.social_linkedin_url || ''
  const appName = settings.app_name || 'Liberty National Bank'

  // Use theme-aware footer logo - always prioritize uploaded logos
  const footerLogo = theme === 'dark' ? footerLogoDark : footerLogoLight

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Company Info */}
          <div>
            {footerLogo ? (
              // Show uploaded landscape logo (replaces entire logo section - same as header)
              <div className="mb-4">
                <div className="h-12 flex items-center">
                  <Image
                    src={footerLogo}
                    alt={`${appName} Logo`}
                    width={200}
                    height={48}
                    className="h-full w-auto object-contain"
                    unoptimized
                    priority
                  />
                </div>
              </div>
            ) : (
              // Fallback: Show default logo with text
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="w-10 h-10 text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">{appName.split(' ')[0]}</h3>
                  <p className="text-xs">{appName.split(' ').slice(1).join(' ')}</p>
                </div>
              </div>
            )}
            <p className="text-sm mb-4">
              Your trusted partner for global banking solutions. Secure, reliable, and convenient.
            </p>
            <div className="flex space-x-4">
              {socialFacebook && (
                <Link href={socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
              )}
              {socialTwitter && (
                <Link href={socialTwitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
              )}
              {socialInstagram && (
                <Link href={socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
              )}
              {socialLinkedin && (
                <Link href={socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-green-600 flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Personal Banking */}
          <div>
            <h4 className="text-white font-semibold mb-4">Personal Banking</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/personal-banking" className="hover:text-green-400 transition-colors">Personal Banking</Link></li>
              <li><Link href="/credit-cards" className="hover:text-green-400 transition-colors">Credit Cards</Link></li>
              <li><Link href="/mortgage" className="hover:text-green-400 transition-colors">Mortgage & Loans</Link></li>
              <li><Link href="/wealth-management" className="hover:text-green-400 transition-colors">Wealth Management</Link></li>
              <li><Link href="/insurance" className="hover:text-green-400 transition-colors">Insurance</Link></li>
            </ul>
          </div>

          {/* Business Banking */}
          <div>
            <h4 className="text-white font-semibold mb-4">Business Banking</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/small-business" className="hover:text-green-400 transition-colors">Small Business</Link></li>
              <li><Link href="/corporate" className="hover:text-green-400 transition-colors">Corporate Banking</Link></li>
              <li><Link href="/loans" className="hover:text-green-400 transition-colors">Business Loans</Link></li>
              <li><Link href="/services" className="hover:text-green-400 transition-colors">Merchant Services</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/digital-banking" className="hover:text-green-400 transition-colors">Digital Banking</Link></li>
              <li><Link href="/security" className="hover:text-green-400 transition-colors">Security Center</Link></li>
              <li><Link href="/help" className="hover:text-green-400 transition-colors">Help Center</Link></li>
              <li><Link href="/locations" className="hover:text-green-400 transition-colors">Branch Locator</Link></li>
              <li><Link href="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

