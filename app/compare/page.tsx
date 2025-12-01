'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { ArrowRight, CheckCircle2, X, Wallet, PiggyBank, TrendingUp, CreditCard } from 'lucide-react'

export default function ComparePage() {
  const accounts = [
    {
      name: 'Basic Checking',
      icon: Wallet,
      monthlyFee: '$0',
      minBalance: '$0',
      apy: '0.01%',
      features: [
        'Unlimited transactions',
        'Free online banking',
        'Mobile check deposit',
        'Free debit card',
        'ATM access',
        'Overdraft protection available'
      ],
      bestFor: 'Everyday banking',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Premium Checking',
      icon: CreditCard,
      monthlyFee: '$15',
      minBalance: '$5,000',
      apy: '0.05%',
      features: [
        'All Basic features',
        'Higher interest rate',
        'Free checks',
        'No ATM fees worldwide',
        'Priority customer service',
        'Identity theft protection',
        'Travel insurance'
      ],
      bestFor: 'High balance customers',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'High-Yield Savings',
      icon: PiggyBank,
      monthlyFee: '$0',
      minBalance: '$100',
      apy: '0.50%',
      features: [
        'Competitive interest rate',
        'No monthly fees',
        'FDIC insured',
        'Online & mobile access',
        'Automatic savings tools',
        'Unlimited deposits',
        '6 withdrawals per month'
      ],
      bestFor: 'Building savings',
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Money Market',
      icon: TrendingUp,
      monthlyFee: '$0',
      minBalance: '$2,500',
      apy: '1.25%',
      features: [
        'Higher interest rates',
        'Check writing privileges',
        'Tiered interest rates',
        'FDIC insured',
        'Online & mobile access',
        'Unlimited transactions',
        'ATM card included'
      ],
      bestFor: 'Higher balances',
      color: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&h=1080&fit=crop"
            alt="Compare Accounts"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-blue-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Compare Accounts
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Find the perfect account for your needs. Compare features, rates, and benefits side by side.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-700 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4</div>
              <div className="text-indigo-100 text-sm font-medium">Account Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$0</div>
              <div className="text-indigo-100 text-sm font-medium">Monthly Fees on Most</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-indigo-100 text-sm font-medium">Online Access</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-indigo-100 text-sm font-medium">FDIC Insured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600">Account Features</th>
                    {accounts.map((account, index) => {
                      const Icon = account.icon
                      return (
                        <th key={index} className="px-6 py-5 text-center border-b-2 border-gray-300 dark:border-gray-600">
                          <div className="flex flex-col items-center">
                            <div className={`w-14 h-14 bg-gradient-to-br ${account.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{account.name}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{account.bestFor}</p>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Monthly Fee</td>
                    {accounts.map((account, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{account.monthlyFee}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Minimum Balance</td>
                    {accounts.map((account, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{account.minBalance}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">APY</td>
                    {accounts.map((account, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">{account.apy}</span>
                      </td>
                    ))}
                  </tr>
                  {accounts[0].features.map((_, featureIndex) => (
                    <tr key={featureIndex} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${featureIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                        {accounts[0].features[featureIndex]}
                      </td>
                      {accounts.map((account, accountIndex) => (
                        <td key={accountIndex} className="px-6 py-4 text-center">
                          {account.features[featureIndex] ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <X className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Account Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {accounts.map((account, index) => {
              const Icon = account.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all">
                  <div className={`w-16 h-16 bg-gradient-to-br ${account.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{account.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full inline-block">{account.bestFor}</p>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Monthly Fee:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{account.monthlyFee}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">APY:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">{account.apy}</span>
                    </div>
                  </div>
                  <Link
                    href="/signup"
                    className="block w-full text-center py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold hover:shadow-lg hover:from-green-700 hover:to-emerald-800 transition-all"
                  >
                    Open Account
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Open an Account?</h2>
          <p className="text-xl text-green-100 mb-8">Choose the account that's right for you and get started today</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}

