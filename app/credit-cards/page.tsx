'use client'

import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { CreditCard, Gift, Shield, Plane, Star, Zap, Award, DollarSign } from 'lucide-react'

export default function CreditCardsPage() {
  const cards = [
    {
      name: 'Liberty Rewards Platinum',
      icon: Award,
      gradient: 'from-purple-600 to-indigo-700',
      rate: '15.99% - 24.99% APR',
      annual: '$95',
      rewards: '3X points on travel & dining, 1X on all purchases',
      features: ['$200 travel credit', 'Airport lounge access', 'No foreign transaction fees', 'Travel insurance'],
      bestFor: 'Frequent travelers'
    },
    {
      name: 'Liberty Cash Back',
      icon: DollarSign,
      gradient: 'from-green-600 to-emerald-700',
      rate: '14.99% - 22.99% APR',
      annual: '$0',
      rewards: '3% cash back on gas & groceries, 1% on everything else',
      features: ['No annual fee', 'Intro 0% APR for 12 months', 'Cash back redemption anytime', 'Free credit score'],
      bestFor: 'Everyday spending'
    },
    {
      name: 'Liberty Student Card',
      icon: Star,
      gradient: 'from-blue-600 to-cyan-700',
      rate: '16.99% - 23.99% APR',
      annual: '$0',
      rewards: '2% cash back on streaming & dining, 1% on other',
      features: ['No annual fee', 'Build credit history', 'Late fee forgiven first time', 'Graduation bonus'],
      bestFor: 'Students & new credit'
    },
    {
      name: 'Liberty Business Elite',
      icon: Zap,
      gradient: 'from-orange-600 to-red-700',
      rate: '14.99% - 21.99% APR',
      annual: '$125',
      rewards: '2X points on business purchases, 1.5X everywhere',
      features: ['Employee cards at no cost', 'Expense management tools', 'Business rewards', 'Travel protections'],
      bestFor: 'Business owners'
    }
  ]

  const benefits = [
    { icon: Shield, title: 'Fraud Protection', desc: 'Zero liability on unauthorized charges' },
    { icon: Gift, title: 'Welcome Bonus', desc: 'Earn up to 50,000 bonus points' },
    { icon: Plane, title: 'Travel Perks', desc: 'No foreign fees & travel insurance' },
    { icon: CreditCard, title: 'Digital Wallet', desc: 'Apple Pay, Google Pay & Samsung Pay' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <CreditCard className="w-16 h-16 mx-auto mb-6 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Credit Cards That{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Reward You
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Find the perfect card for your lifestyle with competitive rates, amazing rewards, and unbeatable benefits
            </p>
            <Link href="/signup" className="inline-flex px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {cards.map((card, idx) => {
              const Icon = card.icon
              return (
                <div key={idx} className={`relative bg-gradient-to-br ${card.gradient} rounded-3xl p-8 text-white shadow-2xl hover:scale-105 transition-all`}>
                  <Icon className="w-12 h-12 mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
                  <p className="text-sm opacity-90 mb-4">Best for: {card.bestFor}</p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                    <div className="flex justify-between mb-2"><span>APR:</span><span>{card.rate}</span></div>
                    <div className="flex justify-between"><span>Annual Fee:</span><span>{card.annual}</span></div>
                  </div>
                  <p className="font-semibold mb-4">{card.rewards}</p>
                  <ul className="space-y-2">
                    {card.features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 bg-white rounded-full"></span>{f}</li>))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Card Benefits</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{b.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
