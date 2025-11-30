'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Home, Calculator, TrendingDown, FileText, CheckCircle2, Clock, DollarSign, Award } from 'lucide-react'

export default function MortgagePage() {
  const loanTypes = [
    { icon: Home, title: 'Fixed-Rate Mortgage', rate: 'From 6.25% APR', term: '15, 20, or 30 years', desc: 'Predictable monthly payments that never change', color: 'from-blue-500 to-blue-600' },
    { icon: TrendingDown, title: 'Adjustable-Rate (ARM)', rate: 'From 5.75% APR', term: 'Initial 5, 7, or 10 years', desc: 'Lower initial rate with potential adjustments', color: 'from-purple-500 to-purple-600' },
    { icon: FileText, title: 'FHA Loans', rate: 'From 5.99% APR', term: 'Up to 30 years', desc: 'Lower down payments & flexible credit requirements', color: 'from-green-500 to-emerald-600' },
    { icon: DollarSign, title: 'VA Loans', rate: 'From 5.50% APR', term: 'Up to 30 years', desc: 'Exclusive benefits for veterans & active military', color: 'from-orange-500 to-red-600' }
  ]

  const benefits = [
    'Pre-approval in 24 hours',
    'Competitive interest rates',
    'Flexible down payment options',
    'Expert mortgage advisors',
    'No hidden fees or surprises',
    'Closing cost assistance available'
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Home className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Home Loans Made{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Competitive rates, fast approvals, and personalized service to help you find your dream home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
                Get Pre-Approved
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-green-600 transition-all">
                <Calculator className="inline w-5 h-5 mr-2" />
                Calculate Payment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Choose Your Mortgage Type
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanTypes.map((loan, i) => {
              const Icon = loan.icon
              return (
                <div key={i} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-600 group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${loan.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{loan.title}</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{loan.rate}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{loan.term}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{loan.desc}</p>
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
              <Award className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Why Choose Our Mortgages?</h2>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
              <Clock className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Get Approved in 24 Hours</h3>
              <p className="text-green-100 mb-6">Fast-track your home purchase with our streamlined approval process. Apply online and get a decision quickly.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">1</div><span>Complete application (15 min)</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">2</div><span>Submit documents</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">3</div><span>Get pre-approval letter</span></div>
              </div>
              <Link href="/signup" className="inline-block mt-6 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Start Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
