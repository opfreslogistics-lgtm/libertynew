'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Home, Calculator, TrendingDown, FileText, CheckCircle2, Clock, DollarSign, Award, ArrowRight, Shield, Star, Quote } from 'lucide-react'

export default function MortgagePage() {
  const loanTypes = [
    { 
      icon: Home, 
      title: 'Fixed-Rate Mortgage', 
      rate: 'From 6.25% APR', 
      term: '15, 20, or 30 years', 
      desc: 'Predictable monthly payments that never change', 
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'
    },
    { 
      icon: TrendingDown, 
      title: 'Adjustable-Rate (ARM)', 
      rate: 'From 5.75% APR', 
      term: 'Initial 5, 7, or 10 years', 
      desc: 'Lower initial rate with potential adjustments', 
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'
    },
    { 
      icon: FileText, 
      title: 'FHA Loans', 
      rate: 'From 5.99% APR', 
      term: 'Up to 30 years', 
      desc: 'Lower down payments & flexible credit requirements', 
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop'
    },
    { 
      icon: DollarSign, 
      title: 'VA Loans', 
      rate: 'From 5.50% APR', 
      term: 'Up to 30 years', 
      desc: 'Exclusive benefits for veterans & active military', 
      color: 'from-orange-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'
    }
  ]

  const stats = [
    { value: '24hrs', label: 'Pre-Approval Time' },
    { value: '5.50%', label: 'Lowest Rate' },
    { value: '10K+', label: 'Homes Financed' },
    { value: '98%', label: 'Satisfaction Rate' }
  ]

  const testimonials = [
    {
      name: 'Jennifer Martinez',
      role: 'First-Time Homebuyer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      quote: 'The mortgage process was so smooth! Got pre-approved in 24 hours and closed on our dream home in just 30 days. The team was amazing!',
      rating: 5
    },
    {
      name: 'Thomas Anderson',
      role: 'Homeowner',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      quote: 'Refinanced with Liberty and saved $300/month. The competitive rates and excellent service made it an easy decision.',
      rating: 5
    },
    {
      name: 'Amanda Johnson',
      role: 'Veteran',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      quote: 'VA loan benefits were incredible - no down payment and great rates. The mortgage advisor walked me through every step.',
      rating: 5
    }
  ]

  const benefits = [
    'Pre-approval in 24 hours',
    'Competitive interest rates',
    'Flexible down payment options',
    'Expert mortgage advisors',
    'No hidden fees or surprises',
    'Closing cost assistance available'
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section with Image */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop"
            alt="Mortgage Loans"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-green-900/85 to-emerald-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
              <Home className="w-4 h-4" />
              <span>Home Loans</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Home Loans Made{' '}
              <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Simple
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Competitive rates, fast approvals, and personalized service to help you find your dream home
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                Get Pre-Approved
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculate Payment
              </Link>
            </div>
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

      {/* Loan Types Section with Images */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Choose Your Mortgage Type
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find the perfect mortgage solution for your home buying needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanTypes.map((loan, i) => {
              const Icon = loan.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={loan.image}
                      alt={loan.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${loan.color} opacity-80`}></div>
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{loan.title}</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{loan.rate}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{loan.term}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{loan.desc}</p>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Award className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Why Choose Our Mortgages?</h2>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl">
              <Clock className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Get Approved in 24 Hours</h3>
              <p className="text-green-100 mb-6">Fast-track your home purchase with our streamlined approval process. Apply online and get a decision quickly.</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</div><span>Complete application (15 min)</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">2</div><span>Submit documents</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">3</div><span>Get pre-approval letter</span></div>
              </div>
              <Link href="/signup" className="inline-block w-full text-center px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Start Application
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
            <p className="text-lg text-gray-600 dark:text-gray-400">Trusted by thousands of homeowners</p>
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
          <Home className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Ready to Find Your Dream Home?</h2>
          <p className="text-xl text-green-100 mb-8">Get pre-approved today and start your home buying journey</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
              Get Pre-Approved
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all">
              Contact Advisor
            </Link>
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
