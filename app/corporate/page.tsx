'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Building2, Globe, Shield, TrendingUp, Users, DollarSign, CheckCircle2, Briefcase } from 'lucide-react'

export default function CorporatePage() {
  const services = [
    { icon: DollarSign, title: 'Treasury Management', desc: 'Optimize cash flow and liquidity', features: ['Cash concentration', 'Automated sweeps', 'Investment options', 'Real-time reporting'], color: 'from-blue-500 to-blue-600' },
    { icon: Globe, title: 'International Banking', desc: 'Global payment and trade solutions', features: ['Foreign exchange', 'Wire transfers', 'Trade finance', 'Multi-currency accounts'], color: 'from-green-500 to-emerald-600' },
    { icon: TrendingUp, title: 'Corporate Lending', desc: 'Flexible credit solutions', features: ['Lines of credit', 'Term loans', 'Equipment financing', 'Real estate loans'], color: 'from-purple-500 to-purple-600' },
    { icon: Shield, title: 'Risk Management', desc: 'Hedge against market volatility', features: ['Interest rate hedging', 'Currency hedging', 'Commodity hedging', 'Credit protection'], color: 'from-orange-500 to-red-600' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Corporate & Institutional{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Banking</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Sophisticated financial solutions for large enterprises and institutions
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
              Request Consultation
            </Link>
            <Link href="/about" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-green-600 transition-all">
              Our Expertise
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Enterprise Solutions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-600 group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{service.desc}</p>
                  <ul className="space-y-3">
                    {service.features.map((f, idx) => (
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

      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Users className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dedicated Relationship Managers</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Our experienced corporate banking team provides personalized attention and strategic guidance
              </p>
              <ul className="space-y-4">
                {['Industry expertise', 'Customized solutions', '24/7 support', 'Strategic advisory'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
              <Briefcase className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Fortune 500 Partner</h3>
              <p className="text-green-100 mb-6">Trusted by over 2,000 corporations worldwide with assets under management exceeding $50B</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">$50B+</div>
                  <div className="text-sm text-green-100">Assets Under Management</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">2,000+</div>
                  <div className="text-sm text-green-100">Corporate Clients</div>
                </div>
              </div>
              <Link href="/contact" className="inline-block w-full text-center py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
