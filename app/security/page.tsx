'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Shield, Lock, Eye, Fingerprint, CheckCircle2, AlertCircle, Bell, Server } from 'lucide-react'

export default function SecurityPage() {
  const features = [
    { icon: Lock, title: '256-bit Encryption', desc: 'Bank-level encryption protects your data at all times' },
    { icon: Fingerprint, title: 'Biometric Authentication', desc: 'Face ID, Touch ID, and fingerprint login' },
    { icon: Eye, title: '24/7 Fraud Monitoring', desc: 'Real-time monitoring and instant fraud alerts' },
    { icon: Bell, title: 'Instant Alerts', desc: 'Get notified of all account activity immediately' },
    { icon: Server, title: 'Secure Data Centers', desc: 'Your data stored in military-grade facilities' },
    { icon: Shield, title: 'Zero Liability', desc: 'You\'re not responsible for unauthorized transactions' }
  ]

  const tips = [
    'Never share your password or PIN with anyone',
    'Enable two-factor authentication (2FA)',
    'Use strong, unique passwords',
    'Monitor your accounts regularly',
    'Be wary of phishing emails and calls',
    'Keep your contact information updated',
    'Use secure networks when banking online',
    'Report suspicious activity immediately'
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Your Security is Our{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              Priority
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Advanced security measures and fraud protection to keep your money and information safe
          </p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            How We Protect You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-600">
                  <Icon className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <AlertCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Security Tips</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Follow these best practices to keep your account secure
              </p>
              <ul className="space-y-4">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
              <Shield className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Report Fraud Immediately</h3>
              <p className="text-green-100 mb-6">
                If you notice suspicious activity or believe your account has been compromised, contact us immediately.
              </p>
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="font-semibold mb-1">24/7 Fraud Hotline</div>
                  <div className="text-2xl font-bold">1-800-FRAUD-99</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="font-semibold mb-1">Report Online</div>
                  <div className="text-lg">support@libertybank.com</div>
                </div>
              </div>
              <Link href="/contact" className="block w-full text-center py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Contact Security Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            FDIC Insured
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your deposits are insured up to $250,000 by the Federal Deposit Insurance Corporation
          </p>
          <div className="bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FDIC Member</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Member FDIC. Equal Housing Lender. NMLS# 123456
            </p>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
