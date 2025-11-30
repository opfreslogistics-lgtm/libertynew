'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Shield, Home, Car, Heart, Briefcase, Users, CheckCircle2, Phone } from 'lucide-react'

export default function InsurancePage() {
  const products = [
    { icon: Home, title: 'Home Insurance', desc: 'Protect your home and belongings', coverage: 'From $50/month', color: 'from-blue-500 to-blue-600', features: ['Property damage', 'Personal liability', 'Additional living expenses', 'Natural disasters'] },
    { icon: Car, title: 'Auto Insurance', desc: 'Comprehensive vehicle coverage', coverage: 'From $75/month', color: 'from-green-500 to-emerald-600', features: ['Collision coverage', 'Comprehensive', 'Liability protection', 'Roadside assistance'] },
    { icon: Heart, title: 'Life Insurance', desc: 'Financial security for your loved ones', coverage: 'From $30/month', color: 'from-red-500 to-pink-600', features: ['Term & whole life', 'Death benefit', 'Living benefits', 'No medical exam options'] },
    { icon: Briefcase, title: 'Business Insurance', desc: 'Protect your business assets', coverage: 'Custom quotes', color: 'from-purple-500 to-purple-600', features: ['Property coverage', 'Liability protection', 'Workers comp', 'Business interruption'] }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Insurance That{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Protects</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Comprehensive coverage options to protect what matters most
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
              Get a Quote
            </Link>
            <Link href="/support" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-green-600 transition-all">
              <Phone className="inline w-5 h-5 mr-2" />
              Call Agent
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Insurance Products</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product, i) => {
              const Icon = product.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-600 group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${product.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{product.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{product.desc}</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">{product.coverage}</p>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold hover:gap-3 transition-all">
                    Get Quote →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Trusted by Over 500,000 Families</h2>
          <p className="text-xl text-green-100 mb-8">Let our insurance experts find the right coverage for you</p>
          <Link href="/contact" className="inline-block px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Contact Insurance Specialist
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
