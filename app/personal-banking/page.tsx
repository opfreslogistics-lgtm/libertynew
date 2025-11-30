'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  CreditCard, 
  PiggyBank,
  ArrowRight,
  CheckCircle2,
  Building2,
  Smartphone,
  HeadphonesIcon
} from 'lucide-react'

export default function PersonalBankingPage() {
  const accounts = [
    {
      icon: Wallet,
      title: 'Checking Accounts',
      description: 'Manage your everyday spending with our flexible checking accounts',
      features: ['No minimum balance', 'Free online banking', 'Mobile check deposit', 'Overdraft protection'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: PiggyBank,
      title: 'Savings Accounts',
      description: 'Grow your money with competitive interest rates',
      features: ['High-yield savings', 'No monthly fees', 'Automatic savings tools', 'FDIC insured up to $250,000'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: CreditCard,
      title: 'Debit Cards',
      description: 'Secure and convenient access to your funds worldwide',
      features: ['Contactless payments', 'Zero liability protection', 'Instant transaction alerts', 'Global ATM access'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Money Market Accounts',
      description: 'Higher returns with easy access to your money',
      features: ['Competitive APY', 'Check writing privileges', 'Tiered interest rates', 'FDIC insured'],
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const benefits = [
    { icon: Shield, title: 'Security First', description: '256-bit encryption and fraud monitoring' },
    { icon: Smartphone, title: 'Mobile Banking', description: 'Bank anywhere, anytime with our app' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Expert help whenever you need it' },
    { icon: Building2, title: 'Nationwide', description: 'Access to 1000+ branches' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-6">
              <Wallet className="w-4 h-4" />
              <span>Personal Banking Solutions</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Banking That{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Works for You
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Simple, secure, and rewarding banking solutions designed for your lifestyle. 
              From everyday checking to long-term savings goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Open Account Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:border-green-600 dark:hover:border-green-500 transition-all"
              >
                Talk to an Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Account Types */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose the Right Account
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Flexible options designed to meet your unique financial needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {accounts.map((account, index) => {
              const Icon = account.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-600 group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${account.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {account.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {account.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {account.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Liberty Bank?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Experience banking that puts you first
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                >
                  <Icon className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Banking Better?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Open your account in minutes and start enjoying the benefits today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Open Account Now
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all"
            >
              Explore All Services
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
