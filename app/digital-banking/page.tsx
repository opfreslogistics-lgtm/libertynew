'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Smartphone, Zap, Shield, QrCode, Bell, CreditCard, Send, CheckCircle2, Download, ArrowRight, Lock, Globe, TrendingUp, Clock, BarChart3, Star, Quote, Users } from 'lucide-react'

export default function DigitalBankingPage() {
  const features = [
    { 
      icon: Smartphone, 
      title: 'Mobile App', 
      desc: 'Bank anytime, anywhere with our award-winning mobile app', 
      highlights: ['Face ID / Touch ID', 'Mobile check deposit', 'Account management', 'Bill pay'], 
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
    },
    { 
      icon: QrCode, 
      title: 'Contactless Payments', 
      desc: 'Pay with your phone using Apple Pay, Google Pay & more', 
      highlights: ['Tap to pay', 'In-app purchases', 'Secure transactions', 'Instant alerts'], 
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop'
    },
    { 
      icon: Bell, 
      title: 'Real-Time Alerts', 
      desc: 'Stay informed with instant transaction notifications', 
      highlights: ['Custom alerts', 'Fraud detection', 'Balance updates', 'Payment reminders'], 
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop'
    },
    { 
      icon: Send, 
      title: 'Instant Transfers', 
      desc: 'Send money instantly to anyone with Zelle®', 
      highlights: ['Split bills', 'Request money', 'Send to anyone', 'No fees'], 
      color: 'from-orange-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop'
    }
  ]

  const appFeatures = [
    'Mobile check deposit', 'Fingerprint login', 'Card freeze/unfreeze', 
    'Spending insights', 'Budgeting tools', 'Savings goals',
    'ATM locator', 'Customer support chat', 'Document upload'
  ]

  const benefits = [
    { icon: Shield, title: 'Bank-Level Security', desc: '256-bit encryption protects all your transactions' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Instant transfers and real-time balance updates' },
    { icon: Globe, title: 'Global Access', desc: 'Bank from anywhere in the world, 24/7' },
    { icon: Lock, title: 'Zero Liability', desc: 'Protected against unauthorized transactions' }
  ]

  const stats = [
    { value: '10M+', label: 'Active Users', icon: Users },
    { value: '4.9/5', label: 'App Rating', icon: Star },
    { value: '99.9%', label: 'Uptime', icon: TrendingUp },
    { value: '24/7', label: 'Support', icon: Clock }
  ]

  const testimonials = [
    {
      name: 'Jessica Martinez',
      role: 'Small Business Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'The mobile app has completely transformed how I manage my business finances. Depositing checks on the go is a game-changer!',
      rating: 5
    },
    {
      name: 'Robert Kim',
      role: 'Freelance Designer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'I love the instant notifications. Every transaction is immediately visible, giving me complete control over my spending.',
      rating: 5
    },
    {
      name: 'Amanda Chen',
      role: 'Marketing Manager',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      quote: 'The budgeting tools help me save more than I ever thought possible. Best banking app I\'ve ever used!',
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
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop"
            alt="Digital Banking"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/90 via-blue-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
                <Smartphone className="w-4 h-4" />
                <span>Digital Banking</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Banking in Your{' '}
                <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Pocket</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Experience the future of banking with our powerful digital tools and award-winning mobile app. 
                Bank securely from anywhere, anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download App
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Balance</span>
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$12,458.50</div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">+5.2%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ icon: Send, label: 'Send' }, { icon: QrCode, label: 'Pay' }, { icon: CreditCard, label: 'Cards' }].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center text-white">
                      <item.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center text-white">
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/90">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Digital Features with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Digital Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need for modern banking, all in one powerful app
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-80`}></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{feature.desc}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          {h}
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

      {/* App Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Zap className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Everything You Need in One App</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Award-winning mobile banking at your fingertips</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {appFeatures.map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 transition-all hover:shadow-md">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <span className="text-gray-900 dark:text-white font-medium text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose Digital Banking?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Security, convenience, and innovation all in one place
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-all">
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
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Users Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Join millions of satisfied customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
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
          <Download className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Download Our App Today</h2>
          <p className="text-xl text-green-100 mb-8">Join millions banking smarter with Liberty</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              <span>App Store</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <span>Google Play</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
