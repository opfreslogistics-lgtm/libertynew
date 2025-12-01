'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Shield, Lock, Eye, FileText, CheckCircle2, Calendar, Users, Database, Key, Bell, Globe, ArrowRight, TrendingUp, AlertCircle, Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPage() {
  const lastUpdated = 'January 1, 2024'

  const privacyFeatures = [
    {
      icon: Lock,
      title: '256-bit SSL Encryption',
      description: 'Bank-level security for all data transmission',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Shield,
      title: 'Multi-Factor Authentication',
      description: 'Additional layer of security for your account',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Database,
      title: 'Secure Data Centers',
      description: 'Your data is stored in highly secure facilities',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Key,
      title: 'Access Controls',
      description: 'Strict access controls and employee training',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const userRights = [
    { icon: Eye, text: 'Access your personal information' },
    { icon: FileText, text: 'Request corrections to inaccurate data' },
    { icon: Bell, text: 'Opt-out of marketing communications' },
    { icon: Database, text: 'Request deletion of your information' },
    { icon: Shield, text: 'File complaints with regulatory authorities' }
  ]

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee', icon: TrendingUp },
    { number: '256-bit', label: 'SSL Encryption', icon: Lock },
    { number: '24/7', label: 'Security Monitoring', icon: Shield },
    { number: '100%', label: 'FDIC Insured', icon: CheckCircle2 }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&h=1080&fit=crop"
            alt="Privacy Policy"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-emerald-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            <span>Your Privacy Matters</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed">
            Your privacy and data security are our top priorities
          </p>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-green-100 text-sm font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">Policy Summary</h3>
                <p className="text-blue-900 dark:text-blue-300 leading-relaxed">
                  This Privacy Policy explains how Liberty Bank collects, uses, shares, and protects your personal information. 
                  We are committed to maintaining the confidentiality and security of your information. We never sell your personal 
                  data and only share it as necessary to provide our services or as required by law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">How We Protect Your Data</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Industry-leading security measures to keep your information safe
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {privacyFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
                1. Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                We collect information that you provide directly to us, information we obtain automatically when you use our services, 
                and information from third parties to provide you with the best banking experience.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Personal Information
                </h3>
                <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
                  <li>Name, address, phone number, email address</li>
                  <li>Social Security Number or Tax ID</li>
                  <li>Date of birth and government-issued identification</li>
                  <li>Financial information (account numbers, balances, transaction history)</li>
                  <li>Employment and income information</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Automatically Collected Information
                </h3>
                <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
                  <li>Device information (IP address, browser type, device identifiers)</li>
                  <li>Usage data (pages visited, time spent, clicks)</li>
                  <li>Location data (when using mobile banking)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                We use the information we collect to provide, maintain, and improve our banking services:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Process transactions and manage your accounts</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Verify your identity and prevent fraud</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Communicate about your accounts and services</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Comply with legal obligations and regulations</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                3. How We Share Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                We do not sell your personal information. We may share your information with:
              </p>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Providers</h4>
                  <p className="text-gray-600 dark:text-gray-400">Third-party vendors who help us operate our business</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Financial Partners</h4>
                  <p className="text-gray-600 dark:text-gray-400">Credit bureaus, payment processors, and other financial institutions</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Requirements</h4>
                  <p className="text-gray-600 dark:text-gray-400">When required by law, court order, or regulatory authority</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Key className="w-8 h-8 text-green-600 dark:text-green-400" />
                4. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
                <li>256-bit SSL encryption for data transmission</li>
                <li>Multi-factor authentication</li>
                <li>Regular security audits and monitoring</li>
                <li>Secure data centers with restricted access</li>
                <li>Employee training on data protection</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                5. Your Rights and Choices
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                You have the right to:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {userRights.map((right, index) => {
                  const Icon = right.icon
                  return (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <Icon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{right.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. 
                You can manage cookie preferences through your browser settings.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                7. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal 
                information from children.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting 
                the new policy on our website and updating the "Last Updated" date.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Globe className="w-8 h-8 text-green-600 dark:text-green-400" />
                9. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-green-200 dark:border-green-800 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Liberty Bank Privacy Office</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Email: privacy@libertybank.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Phone: 1-800-LIBERTY
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Address: 123 Banking Street, Financial District, NY 10001
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Have Questions About Your Privacy?</h2>
          <p className="text-xl text-green-100 mb-8">Our privacy team is here to help</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Contact Privacy Office
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
