'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Shield, Lock, Eye, Fingerprint, CheckCircle2, AlertCircle, Bell, Server, ArrowRight, Star, Quote, TrendingUp } from 'lucide-react'

export default function SecurityPage() {
  const features = [
    { 
      icon: Lock, 
      title: '256-bit Encryption', 
      desc: 'Bank-level encryption protects your data at all times',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop'
    },
    { 
      icon: Fingerprint, 
      title: 'Biometric Authentication', 
      desc: 'Face ID, Touch ID, and fingerprint login',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
    },
    { 
      icon: Eye, 
      title: '24/7 Fraud Monitoring', 
      desc: 'Real-time monitoring and instant fraud alerts',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    },
    { 
      icon: Bell, 
      title: 'Instant Alerts', 
      desc: 'Get notified of all account activity immediately',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop'
    },
    { 
      icon: Server, 
      title: 'Secure Data Centers', 
      desc: 'Your data stored in military-grade facilities',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop'
    },
    { 
      icon: Shield, 
      title: 'Zero Liability', 
      desc: 'You\'re not responsible for unauthorized transactions',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop'
    }
  ]

  const tips = [
    'Never share your password or PIN with anyone',
    'Enable two-factor authentication (2FA)',
    'Use strong, unique passwords',
    'Monitor your accounts regularly',
    'Be wary of phishing emails and calls',
    'Keep your contact information updated',
    'Use secure networks when banking online',
    'Report suspicious activity immediately'
  ]

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '256-bit', label: 'Encryption' },
    { value: '24/7', label: 'Monitoring' },
    { value: '$0', label: 'Liability' }
  ]

  const testimonials = [
    {
      name: 'David Kim',
      role: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'The instant fraud alerts saved me from a potential scam. I got notified immediately when someone tried to use my card.',
      rating: 5
    },
    {
      name: 'Sarah Patel',
      role: 'Accountant',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'Biometric authentication makes banking so secure and convenient. I feel confident my accounts are protected.',
      rating: 5
    },
    {
      name: 'Michael Brown',
      role: 'IT Professional',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      quote: 'As someone in tech, I appreciate the bank-level encryption and security measures. Top-notch protection!',
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
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&h=1080&fit=crop"
            alt="Security Protection"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-green-900/85 to-emerald-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            <span>Bank-Level Security</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Your Security is Our{' '}
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
              Priority
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Advanced security measures and fraud protection to keep your money and information safe
          </p>
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

      {/* Security Features with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              How We Protect You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Multi-layered security measures to keep your accounts safe
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/50 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security Tips Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <AlertCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Security Tips</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Follow these best practices to keep your account secure
              </p>
              <ul className="space-y-4">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
              <Shield className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Report Fraud Immediately</h3>
              <p className="text-green-100 mb-6">
                If you notice suspicious activity or believe your account has been compromised, contact us immediately.
              </p>
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="font-semibold mb-1 text-sm">24/7 Fraud Hotline</div>
                  <div className="text-2xl font-bold">1-800-FRAUD-99</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="font-semibold mb-1 text-sm">Report Online</div>
                  <div className="text-lg">support@libertybank.com</div>
                </div>
              </div>
              <Link href="/contact" className="block w-full text-center py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Contact Security Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Trusted security that gives you peace of mind</p>
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

      {/* FDIC Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            FDIC Insured
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your deposits are insured up to $250,000 by the Federal Deposit Insurance Corporation
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FDIC Member</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Member FDIC. Equal Housing Lender. NMLS# 123456
            </p>
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
          <Shield className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Your Security is Our Commitment</h2>
          <p className="text-xl text-green-100 mb-8">Experience banking with confidence and peace of mind</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              Learn More
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Open Secure Account
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
