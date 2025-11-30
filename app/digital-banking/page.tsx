'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Smartphone, Zap, Shield, QrCode, Bell, CreditCard, Send, CheckCircle2, Download } from 'lucide-react'

export default function DigitalBankingPage() {
  const features = [
    { icon: Smartphone, title: 'Mobile App', desc: 'Bank anytime, anywhere with our award-winning mobile app', highlights: ['Face ID / Touch ID', 'Mobile check deposit', 'Account management', 'Bill pay'], color: 'from-blue-500 to-blue-600' },
    { icon: QrCode, title: 'Contactless Payments', desc: 'Pay with your phone using Apple Pay, Google Pay & more', highlights: ['Tap to pay', 'In-app purchases', 'Secure transactions', 'Instant alerts'], color: 'from-green-500 to-emerald-600' },
    { icon: Bell, title: 'Real-Time Alerts', desc: 'Stay informed with instant transaction notifications', highlights: ['Custom alerts', 'Fraud detection', 'Balance updates', 'Payment reminders'], color: 'from-purple-500 to-purple-600' },
    { icon: Send, title: 'Instant Transfers', desc: 'Send money instantly to anyone with Zelle®', highlights: ['Split bills', 'Request money', 'Send to anyone', 'No fees'], color: 'from-orange-500 to-red-600' }
  ]

  const appFeatures = [
    'Mobile check deposit', 'Fingerprint login', 'Card freeze/unfreeze', 
    'Spending insights', 'Budgeting tools', 'Savings goals',
    'ATM locator', 'Customer support chat', 'Document upload'
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Smartphone className="w-16 h-16 mb-6 text-green-600 dark:text-green-400" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                Banking in Your{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Pocket</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Experience the future of banking with our powerful digital tools and mobile app
              </p>
              <div className="flex gap-4">
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download App
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-green-600 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Total Balance</span>
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$12,458.50</div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">+5.2%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ icon: Send, label: 'Send' }, { icon: QrCode, label: 'Pay' }, { icon: CreditCard, label: 'Cards' }].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center text-white">
                      <item.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Digital Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-600 group">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Zap className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Everything You Need in One App</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Award-winning mobile banking at your fingertips</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {appFeatures.map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center border border-gray-200 dark:border-gray-700">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <span className="text-gray-900 dark:text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Download className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Download Our App Today</h2>
          <p className="text-xl text-green-100 mb-8">Join millions banking smarter with Liberty</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
              App Store
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white/10 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all">
              Google Play
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
