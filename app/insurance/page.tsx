'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Shield, Home, Car, Heart, Briefcase, Users, CheckCircle2, Phone, ArrowRight, Star, Quote, Clock, Globe, TrendingUp } from 'lucide-react'

export default function InsurancePage() {
  const products = [
    { 
      icon: Home, 
      title: 'Home Insurance', 
      desc: 'Protect your home and belongings with comprehensive coverage', 
      coverage: 'From $50/month', 
      color: 'from-blue-500 to-blue-600', 
      features: ['Property damage', 'Personal liability', 'Additional living expenses', 'Natural disasters'],
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'
    },
    { 
      icon: Car, 
      title: 'Auto Insurance', 
      desc: 'Comprehensive vehicle coverage for peace of mind', 
      coverage: 'From $75/month', 
      color: 'from-green-500 to-emerald-600', 
      features: ['Collision coverage', 'Comprehensive', 'Liability protection', 'Roadside assistance'],
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
    },
    { 
      icon: Heart, 
      title: 'Life Insurance', 
      desc: 'Financial security for your loved ones', 
      coverage: 'From $30/month', 
      color: 'from-red-500 to-pink-600', 
      features: ['Term & whole life', 'Death benefit', 'Living benefits', 'No medical exam options'],
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop'
    },
    { 
      icon: Briefcase, 
      title: 'Business Insurance', 
      desc: 'Protect your business assets and operations', 
      coverage: 'Custom quotes', 
      color: 'from-purple-500 to-purple-600', 
      features: ['Property coverage', 'Liability protection', 'Workers comp', 'Business interruption'],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
    }
  ]

  const benefits = [
    { icon: Shield, title: '24/7 Claims Support', desc: 'Round-the-clock assistance when you need it most' },
    { icon: Clock, title: 'Fast Claims Processing', desc: 'Quick and efficient claims handling' },
    { icon: Globe, title: 'Global Coverage', desc: 'Protection that travels with you worldwide' },
    { icon: TrendingUp, title: 'Competitive Rates', desc: 'Affordable premiums with comprehensive coverage' }
  ]

  const testimonials = [
    {
      name: 'Michael Thompson',
      role: 'Homeowner',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'When our home was damaged in a storm, Liberty Insurance was there immediately. The claims process was smooth and they helped us get back on our feet quickly.',
      rating: 5
    },
    {
      name: 'Sarah Martinez',
      role: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'Business insurance gave me peace of mind. The coverage is comprehensive and the rates are competitive. Highly recommend!',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Family Man',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      quote: 'Life insurance through Liberty was easy to set up and affordable. Knowing my family is protected gives me great peace of mind.',
      rating: 5
    }
  ]

  const stats = [
    { value: '500K+', label: 'Protected Families' },
    { value: '98%', label: 'Claims Satisfaction' },
    { value: '24/7', label: 'Support Available' },
    { value: '$2B+', label: 'Claims Paid Annually' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section with Image */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=1080&fit=crop"
            alt="Insurance Protection"
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
            <span>Insurance Protection</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Insurance That{' '}
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Protects</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Comprehensive coverage options to protect what matters most. Get peace of mind with our trusted insurance solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
              Get a Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Call Agent
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

      {/* Insurance Products with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Insurance Products</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage options designed to protect what matters most to you
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {products.map((product, i) => {
              const Icon = product.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-80`}></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{product.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{product.desc}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">{product.coverage}</p>
                    <ul className="space-y-2 mb-6">
                      {product.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold hover:gap-3 transition-all">
                      Get Quote
                      <ArrowRight className="w-5 h-5" />
                    </Link>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose Liberty Insurance?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the difference of trusted insurance protection
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Trusted by thousands of satisfied customers</p>
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
          <Users className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Trusted by Over 500,000 Families</h2>
          <p className="text-xl text-green-100 mb-8">Let our insurance experts find the right coverage for you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              Contact Insurance Specialist
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Call Now
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
