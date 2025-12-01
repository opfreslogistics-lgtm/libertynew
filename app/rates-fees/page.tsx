'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { DollarSign, CreditCard, Wallet, TrendingUp, AlertCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react'

export default function RatesFeesPage() {
  const accountRates = [
    {
      type: 'Checking Accounts',
      apy: '0.01%',
      minBalance: '$0',
      monthlyFee: '$0',
      features: ['No minimum balance', 'Unlimited transactions', 'Free online banking']
    },
    {
      type: 'Savings Accounts',
      apy: '0.50%',
      minBalance: '$100',
      monthlyFee: '$0',
      features: ['High-yield savings', 'FDIC insured', 'No monthly fees']
    },
    {
      type: 'Money Market Accounts',
      apy: '1.25%',
      minBalance: '$2,500',
      monthlyFee: '$0',
      features: ['Tiered interest rates', 'Check writing', 'Higher yields']
    },
    {
      type: 'Certificates of Deposit (CD)',
      apy: '2.50% - 4.00%',
      minBalance: '$1,000',
      monthlyFee: 'N/A',
      features: ['Fixed rates', 'Terms from 3-60 months', 'FDIC insured']
    }
  ]

  const creditCardRates = [
    {
      card: 'Liberty Rewards Platinum',
      apr: '15.99% - 24.99%',
      annualFee: '$95',
      foreignFee: '0%'
    },
    {
      card: 'Liberty Cash Back',
      apr: '14.99% - 22.99%',
      annualFee: '$0',
      foreignFee: '0%'
    },
    {
      card: 'Liberty Student Card',
      apr: '16.99% - 23.99%',
      annualFee: '$0',
      foreignFee: '0%'
    }
  ]

  const loanRates = [
    {
      type: 'Personal Loans',
      rate: '6.99% - 18.99% APR',
      term: '12-60 months',
      minAmount: '$1,000',
      maxAmount: '$50,000'
    },
    {
      type: 'Auto Loans',
      rate: '4.99% - 9.99% APR',
      term: '24-84 months',
      minAmount: '$5,000',
      maxAmount: '$100,000'
    },
    {
      type: 'Home Equity Loans',
      rate: '5.99% - 12.99% APR',
      term: '5-30 years',
      minAmount: '$10,000',
      maxAmount: '$500,000'
    }
  ]

  const commonFees = [
    { service: 'Overdraft Fee', amount: '$35', description: 'Per overdraft transaction' },
    { service: 'Wire Transfer (Domestic)', amount: '$25', description: 'Outgoing domestic wire' },
    { service: 'Wire Transfer (International)', amount: '$45', description: 'Outgoing international wire' },
    { service: 'Stop Payment', amount: '$30', description: 'Per request' },
    { service: 'Returned Deposit Item', amount: '$12', description: 'Per returned item' },
    { service: 'Cashier\'s Check', amount: '$10', description: 'Per check' },
    { service: 'Account Research', amount: '$25/hour', description: 'Minimum 1 hour' },
    { service: 'ATM Fee (Out of Network)', amount: '$2.50', description: 'Per transaction' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop"
            alt="Rates and Fees"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-emerald-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <DollarSign className="w-4 h-4" />
            <span>Transparent Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Rates & Fees
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Competitive rates and transparent fees. No hidden charges, no surprises.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">0%</div>
              <div className="text-green-100 text-sm font-medium">Foreign Transaction Fees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$0</div>
              <div className="text-green-100 text-sm font-medium">Monthly Fees on Most Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.00%</div>
              <div className="text-green-100 text-sm font-medium">Highest CD Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-green-100 text-sm font-medium">Transparent Pricing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Rates */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Account Interest Rates</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Competitive rates to help your money grow
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {accountRates.map((account, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{account.type}</h3>
                  <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">APY</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{account.apy}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Minimum Balance</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{account.minBalance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{account.monthlyFee}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {account.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Card Rates */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Credit Card Rates</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Competitive APR rates and no foreign transaction fees
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {creditCardRates.map((card, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{card.card}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">APR</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{card.apr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Annual Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{card.annualFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Foreign Fee</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{card.foreignFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Rates */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Loan Rates</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Competitive rates for all your borrowing needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {loanRates.map((loan, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-green-100 dark:border-green-900/30">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{loan.type}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loan.rate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Loan Term</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{loan.term}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Loan Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{loan.minAmount} - {loan.maxAmount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Need Personalized Rate Information?</h2>
          <p className="text-xl text-green-100 mb-8">Contact us for a customized quote based on your needs</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Get a Quote
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Common Fees */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Common Fees</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Transparent fee structure for all services
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Fee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {commonFees.map((fee, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{fee.service}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">{fee.amount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{fee.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Important Information</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Rates and fees are subject to change. Actual rates may vary based on creditworthiness, account type, and other factors. 
                  Please contact us for personalized rate quotes. All rates are accurate as of the last update date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}

