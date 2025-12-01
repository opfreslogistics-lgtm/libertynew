'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Store, CreditCard, TrendingUp, Users, Wallet, CheckCircle2, Zap, Award, ArrowRight, Shield, Clock, Globe, Star, Quote } from 'lucide-react'

export default function SmallBusinessPage() {
  const solutions = [
    { 
      icon: Wallet, 
      title: 'Business Checking', 
      desc: 'Free business checking with unlimited transactions', 
      features: ['No monthly fees', 'Free online banking', 'Mobile deposits', 'Cash management'], 
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
    },
    { 
      icon: CreditCard, 
      title: 'Business Credit Cards', 
      desc: 'Earn rewards on business expenses', 
      features: ['2% cash back', 'Employee cards', 'Expense tracking', 'Travel benefits'], 
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
    },
    { 
      icon: TrendingUp, 
      title: 'Business Loans', 
      desc: 'Financing to grow your business', 
      features: ['Up to $500K', 'Competitive rates', 'Fast approval', 'Flexible terms'], 
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    },
    { 
      icon: Users, 
      title: 'Merchant Services', 
      desc: 'Accept payments anywhere', 
      features: ['Point of sale', 'Online payments', 'Mobile processing', 'Next-day funding'], 
      color: 'from-orange-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
    }
  ]

  const benefits = [
    { icon: Shield, title: 'Secure Banking', desc: 'Bank-level security for your business finances' },
    { icon: Clock, title: '24/7 Support', desc: 'Dedicated business banking support anytime' },
    { icon: Globe, title: 'Global Access', desc: 'Manage your business finances from anywhere' },
    { icon: Zap, title: 'Fast Processing', desc: 'Quick approvals and instant transactions' }
  ]

  const stats = [
    { value: '50K+', label: 'Small Businesses' },
    { value: '$2B+', label: 'Loans Funded' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' }
  ]

  const testimonials = [
    {
      name: 'Maria Rodriguez',
      role: 'Restaurant Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'The merchant services have been a game-changer for my restaurant. Quick payments and next-day funding help my cash flow tremendously.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'Tech Startup Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'Got approved for a business loan in just 48 hours. The process was smooth and the rates were competitive. Highly recommend!',
      rating: 5
    },
    {
      name: 'Lisa Chen',
      role: 'Retail Store Owner',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      quote: 'Business checking with no monthly fees has saved us hundreds of dollars. The mobile banking app makes managing finances so easy.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section with Image */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop"
            alt="Small Business Banking"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-green-900/85 to-emerald-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <Store className="w-4 h-4" />
            <span>Small Business Solutions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Small Business{' '}
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Banking</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Everything your small business needs to succeed - from checking accounts to merchant services and business loans
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
              Open Business Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Schedule Meeting
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Business Solutions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive banking solutions designed for small business success
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, i) => {
              const Icon = solution.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={solution.image}
                      alt={solution.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${solution.color} opacity-80`}></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{solution.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{solution.desc}</p>
                    <ul className="space-y-3">
                      {solution.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Small Businesses Choose Us</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Banking solutions built for entrepreneurs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Business Owners Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Trusted by thousands of small businesses</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-green-600 dark:text-green-400 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                    unoptimized
                  />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Award className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Join 50,000+ Small Businesses</h2>
          <p className="text-xl text-green-100 mb-8">Banking solutions trusted by entrepreneurs nationwide</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              Start Banking Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
