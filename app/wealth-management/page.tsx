'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { TrendingUp, PieChart, Shield, Target, Briefcase, Award, Users, BarChart3, CheckCircle2, ArrowRight, Clock, Globe, Star, Quote } from 'lucide-react'

export default function WealthManagementPage() {
  const services = [
    { 
      icon: PieChart, 
      title: 'Investment Planning', 
      desc: 'Customized portfolios aligned with your goals', 
      color: 'from-blue-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    },
    { 
      icon: TrendingUp, 
      title: 'Retirement Planning', 
      desc: '401(k), IRA, and pension management', 
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop'
    },
    { 
      icon: Shield, 
      title: 'Estate Planning', 
      desc: 'Protect and transfer wealth efficiently', 
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    },
    { 
      icon: Target, 
      title: 'Tax Optimization', 
      desc: 'Minimize taxes and maximize returns', 
      color: 'from-orange-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'
    }
  ]

  const tiers = [
    { name: 'Wealth Essentials', min: '$100K+', fee: '0.75%', features: ['Dedicated advisor', 'Portfolio review', 'Online tools', 'Quarterly reports'], icon: Award },
    { name: 'Wealth Premier', min: '$500K+', fee: '0.50%', features: ['Senior advisor', 'Tax planning', 'Estate planning', 'Monthly reviews'], icon: Briefcase },
    { name: 'Private Wealth', min: '$2M+', fee: '0.35%', features: ['Private banker', 'Family office services', 'Alternative investments', 'Weekly access'], icon: Users }
  ]

  const stats = [
    { value: '$50B+', label: 'Assets Managed', icon: BarChart3 },
    { value: '5,000+', label: 'Wealth Clients', icon: Users },
    { value: '15%', label: 'Avg. Returns', icon: TrendingUp },
    { value: '25+', label: 'Years Experience', icon: Clock }
  ]

  const testimonials = [
    {
      name: 'Robert Thompson',
      role: 'High Net Worth Individual',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'Private Wealth services have been exceptional. My portfolio has grown significantly and the personalized attention is unmatched.',
      rating: 5
    },
    {
      name: 'Patricia Williams',
      role: 'Retiree',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'Retirement planning with Liberty gave me confidence. The advisors helped me create a sustainable income strategy for my golden years.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Business Executive',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      quote: 'Estate planning services protected my family\'s future. The tax optimization strategies saved us significantly.',
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
            alt="Wealth Management"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Wealth Management</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Wealth Management for{' '}
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Your Future</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Expert guidance and personalized strategies to grow, protect, and transfer your wealth
          </p>
          <Link href="/contact" className="inline-flex px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all items-center gap-2">
            Schedule Consultation
            <ArrowRight className="w-5 h-5" />
          </Link>
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

      {/* Services Section with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive wealth management solutions tailored to your needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-80`}></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{service.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Wealth Management Tiers */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Wealth Management Tiers</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the level of service that matches your wealth management needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => {
              const Icon = tier.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-md hover:shadow-xl hover:scale-105 transition-all border border-gray-100 dark:border-gray-700">
                  <Icon className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{tier.name}</h3>
                  <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-1">Assets: {tier.min}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Annual Fee: {tier.fee}</p>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="block text-center py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all">
                    Get Started
                  </Link>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Trusted by high-net-worth individuals and families</p>
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
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Start Growing Your Wealth Today</h2>
          <p className="text-xl text-green-100 mb-8">Schedule a complimentary consultation with one of our wealth advisors</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              Book Consultation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
