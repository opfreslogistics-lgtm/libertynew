'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Building2, Globe, Shield, TrendingUp, Users, DollarSign, CheckCircle2, Briefcase, ArrowRight, Clock, BarChart3, Star, Quote } from 'lucide-react'

export default function CorporatePage() {
  const services = [
    { 
      icon: DollarSign, 
      title: 'Treasury Management', 
      desc: 'Optimize cash flow and liquidity', 
      features: ['Cash concentration', 'Automated sweeps', 'Investment options', 'Real-time reporting'], 
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    },
    { 
      icon: Globe, 
      title: 'International Banking', 
      desc: 'Global payment and trade solutions', 
      features: ['Foreign exchange', 'Wire transfers', 'Trade finance', 'Multi-currency accounts'], 
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop'
    },
    { 
      icon: TrendingUp, 
      title: 'Corporate Lending', 
      desc: 'Flexible credit solutions', 
      features: ['Lines of credit', 'Term loans', 'Equipment financing', 'Real estate loans'], 
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    },
    { 
      icon: Shield, 
      title: 'Risk Management', 
      desc: 'Hedge against market volatility', 
      features: ['Interest rate hedging', 'Currency hedging', 'Commodity hedging', 'Credit protection'], 
      color: 'from-orange-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    }
  ]

  const stats = [
    { value: '$50B+', label: 'Assets Under Management', icon: BarChart3 },
    { value: '2,000+', label: 'Corporate Clients', icon: Building2 },
    { value: '150+', label: 'Countries Served', icon: Globe },
    { value: '24/7', label: 'Global Support', icon: Clock }
  ]

  const testimonials = [
    {
      name: 'Robert Anderson',
      role: 'CFO, Tech Corp',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'Liberty\'s treasury management solutions have streamlined our cash operations significantly. The real-time reporting is exceptional.',
      rating: 5
    },
    {
      name: 'Patricia Lee',
      role: 'VP Finance, Global Industries',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'International banking services are top-notch. Multi-currency accounts and trade finance have simplified our global operations.',
      rating: 5
    },
    {
      name: 'Michael Chang',
      role: 'CEO, Manufacturing Group',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      quote: 'The corporate lending team understood our needs and provided flexible financing solutions that helped us expand operations.',
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
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop"
            alt="Corporate Banking"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-blue-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" />
            <span>Enterprise Banking</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Corporate & Institutional{' '}
            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Banking</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sophisticated financial solutions for large enterprises and institutions worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
              Request Consultation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Our Expertise
            </Link>
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

      {/* Enterprise Solutions with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Enterprise Solutions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive financial services designed for large-scale operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-80`}></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{service.desc}</p>
                    <ul className="space-y-3">
                      {service.features.map((f, idx) => (
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

      {/* Relationship Managers Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Users className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Dedicated Relationship Managers</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Our experienced corporate banking team provides personalized attention and strategic guidance
              </p>
              <ul className="space-y-4">
                {['Industry expertise', 'Customized solutions', '24/7 support', 'Strategic advisory'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
              <Briefcase className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Fortune 500 Partner</h3>
              <p className="text-green-100 mb-6">Trusted by over 2,000 corporations worldwide with assets under management exceeding $50B</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">$50B+</div>
                  <div className="text-sm text-green-100">Assets Under Management</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">2,000+</div>
                  <div className="text-sm text-green-100">Corporate Clients</div>
                </div>
              </div>
              <Link href="/contact" className="inline-block w-full text-center py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Corporate Clients Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Trusted by leading enterprises worldwide</p>
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
          <Building2 className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Partner With Liberty Bank</h2>
          <p className="text-xl text-green-100 mb-8">Experience enterprise banking solutions designed for your success</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              Request Consultation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
