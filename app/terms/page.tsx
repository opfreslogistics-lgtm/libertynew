'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { FileText, Scale, AlertCircle, CheckCircle2, Shield, Lock, Users, CreditCard, TrendingUp, X, ArrowRight, Calendar, Mail, Phone, MapPin } from 'lucide-react'

export default function TermsPage() {
  const lastUpdated = 'January 1, 2024'

  const keyPoints = [
    {
      icon: Shield,
      title: 'Account Security',
      description: 'You are responsible for maintaining the confidentiality of your account credentials',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: CreditCard,
      title: 'Fees & Charges',
      description: 'All fees are clearly disclosed in our fee schedule',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Lock,
      title: 'Authorized Use',
      description: 'Use our services only for lawful purposes',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Eligibility',
      description: 'Must be 18+ and authorized to conduct business in the U.S.',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const prohibitedActivities = [
    'Use services for illegal or unauthorized purposes',
    'Attempt to gain unauthorized access to our systems',
    'Interfere with or disrupt our services',
    'Transmit viruses, malware, or harmful code',
    'Use automated systems without permission'
  ]

  const fees = [
    { name: 'Monthly Maintenance', description: 'Varies by account type' },
    { name: 'Transaction Fees', description: 'For certain transaction types' },
    { name: 'Overdraft Fees', description: '$35 per overdraft transaction' },
    { name: 'Wire Transfer', description: '$25 domestic, $45 international' },
    { name: 'ATM Fees', description: '$2.50 for out-of-network ATMs' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=1080&fit=crop"
            alt="Terms & Conditions"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-900/85 to-blue-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <Scale className="w-4 h-4" />
            <span>Legal Terms</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Terms & Conditions
          </h1>
          <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using our services
          </p>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl p-8 border-2 border-yellow-300 dark:border-yellow-800 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-300 mb-3">Important Notice</h3>
                <p className="text-yellow-900 dark:text-yellow-300 leading-relaxed text-lg">
                  By accessing or using Liberty Bank's services, you agree to be bound by these Terms and Conditions. 
                  If you do not agree, please do not use our services. These terms govern your use of our website, 
                  mobile applications, and banking services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Key Terms at a Glance</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Important points you should know
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyPoints.map((point, index) => {
              const Icon = point.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
                  <div className={`w-14 h-14 bg-gradient-to-br ${point.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{point.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{point.description}</p>
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
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                These Terms and Conditions ("Terms") govern your use of Liberty Bank's website, mobile applications, and banking services. 
                By opening an account, accessing our website, or using any of our services, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                2. Account Opening and Eligibility
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Eligibility Requirements</h3>
                <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
                  <li>You must be at least 18 years of age</li>
                  <li>You must be a legal resident of the United States or authorized to conduct business in the U.S.</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You must not be prohibited from opening an account by law or regulation</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You are responsible for maintaining the accuracy of your account information and must promptly notify us of any changes. 
                  You must keep your login credentials secure and confidential.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                3. Use of Services
              </h2>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6 border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Permitted Use</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  You agree to use our services only for lawful purposes and in accordance with these Terms.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  Prohibited Activities
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  {prohibitedActivities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                4. Account Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                You are responsible for:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Maintaining the confidentiality of your account credentials</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">All activities that occur under your account</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Immediately notifying us of any unauthorized access</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Using strong passwords and enabling two-factor authentication</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                5. Fees and Charges
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                You agree to pay all fees and charges associated with your accounts as disclosed in our fee schedule. 
                Current fee schedules are available on our website and will be provided when you open an account.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Fee Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {fees.map((fee, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{fee.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{fee.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                6. Transactions and Payments
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Transaction Processing</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We will process transactions in accordance with our policies and applicable laws. Processing times may vary 
                    depending on the type of transaction.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Payment Authorization</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    By initiating a payment, you authorize us to debit your account for the amount specified. You are responsible 
                    for ensuring sufficient funds are available.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                To the maximum extent permitted by law, Liberty Bank shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of our services.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                8. Dispute Resolution
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                Any disputes arising from these Terms or your use of our services will be resolved through binding arbitration 
                in accordance with the rules of the American Arbitration Association, except where prohibited by law.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                9. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the 
                updated Terms on our website and updating the "Last Updated" date. Your continued use of our services after 
                changes become effective constitutes acceptance of the modified Terms.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                10. Termination
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                We may suspend or terminate your access to our services at any time, with or without cause or notice, for any 
                reason including violation of these Terms, fraudulent activity, or as required by law.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6">
                11. Governing Law
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                These Terms are governed by the laws of the State of New York, United States, without regard to conflict of law principles.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                12. Contact Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Liberty Bank Legal Department</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Email: legal@libertybank.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Phone: 1-800-LIBERTY
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Address: 123 Banking Street, Financial District, NY 10001
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Questions About Our Terms?</h2>
          <p className="text-xl text-blue-100 mb-8">Our legal team is here to help</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Contact Legal Department
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
