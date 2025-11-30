'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Store, CreditCard, TrendingUp, Users, Wallet, CheckCircle2, Zap, Award } from 'lucide-react'

export default function SmallBusinessPage() {
  const solutions = [
    { icon: Wallet, title: 'Business Checking', desc: 'Free business checking with unlimited transactions', features: ['No monthly fees', 'Free online banking', 'Mobile deposits', 'Cash management'], color: 'from-blue-500 to-blue-600' },
    { icon: CreditCard, title: 'Business Credit Cards', desc: 'Earn rewards on business expenses', features: ['2% cash back', 'Employee cards', 'Expense tracking', 'Travel benefits'], color: 'from-green-500 to-emerald-600' },
    { icon: TrendingUp, title: 'Business Loans', desc: 'Financing to grow your business', features: ['Up to $500K', 'Competitive rates', 'Fast approval', 'Flexible terms'], color: 'from-purple-500 to-purple-600' },
    { icon: Users, title: 'Merchant Services', desc: 'Accept payments anywhere', features: ['Point of sale', 'Online payments', 'Mobile processing', 'Next-day funding'], color: 'from-orange-500 to-red-600' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Store className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Small Business{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Banking</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Everything your small business needs to succeed - from checking accounts to merchant services
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
              Open Business Account
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-green-600 transition-all">
              Schedule Meeting
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, i) => {
              const Icon = solution.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-600 group">
                  <div className={`w-14 h-14 bg-gradient-to-br ${solution.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{solution.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{solution.desc}</p>
                  <ul className="space-y-3">
                    {solution.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Award className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Join 50,000+ Small Businesses</h2>
          <p className="text-xl text-green-100 mb-8">Banking solutions trusted by entrepreneurs nationwide</p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Start Banking Today
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
