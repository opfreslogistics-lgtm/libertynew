'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { TrendingUp, PieChart, Shield, Target, Briefcase, Award, Users, BarChart3, CheckCircle2 } from 'lucide-react'

export default function WealthManagementPage() {
  const services = [
    { icon: PieChart, title: 'Investment Planning', desc: 'Customized portfolios aligned with your goals', color: 'from-blue-500 to-indigo-600' },
    { icon: TrendingUp, title: 'Retirement Planning', desc: '401(k), IRA, and pension management', color: 'from-green-500 to-emerald-600' },
    { icon: Shield, title: 'Estate Planning', desc: 'Protect and transfer wealth efficiently', color: 'from-purple-500 to-purple-600' },
    { icon: Target, title: 'Tax Optimization', desc: 'Minimize taxes and maximize returns', color: 'from-orange-500 to-red-600' }
  ]

  const tiers = [
    { name: 'Wealth Essentials', min: '$100K+', fee: '0.75%', features: ['Dedicated advisor', 'Portfolio review', 'Online tools', 'Quarterly reports'], icon: Award },
    { name: 'Wealth Premier', min: '$500K+', fee: '0.50%', features: ['Senior advisor', 'Tax planning', 'Estate planning', 'Monthly reviews'], icon: Briefcase },
    { name: 'Private Wealth', min: '$2M+', fee: '0.35%', features: ['Private banker', 'Family office services', 'Alternative investments', 'Weekly access'], icon: Users }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Wealth Management for{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Your Future</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Expert guidance and personalized strategies to grow, protect, and transfer your wealth
          </p>
          <Link href="/contact" className="inline-flex px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
            Schedule Consultation
          </Link>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-600 group">
                  <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{service.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Wealth Management Tiers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => {
              const Icon = tier.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all border border-gray-200 dark:border-gray-700">
                  <Icon className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{tier.name}</h3>
                  <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-1">Assets: {tier.min}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Annual Fee: {tier.fee}</p>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="block text-center py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all">
                    Get Started
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Start Growing Your Wealth Today</h2>
          <p className="text-xl text-green-100 mb-8">Schedule a complimentary consultation with one of our wealth advisors</p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Book Consultation
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
