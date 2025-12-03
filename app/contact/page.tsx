'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { getAppSettings } from '@/lib/utils/appSettings'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contactEmail, setContactEmail] = useState('contact@libertybank.com')
  const [contactPhone, setContactPhone] = useState('+1 (555) 123-4567')
  const [loadingSettings, setLoadingSettings] = useState(true)
  
  // Address constant
  const headquartersAddress = '4425 Singing Hills Blvd, Sioux City, IA 51106, USA'
  const addressParts = {
    street: '4425 Singing Hills Blvd',
    city: 'Sioux City',
    state: 'IA',
    zip: '51106',
    country: 'USA'
  }

  // Fetch settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAppSettings()
        if (settings.contact_email) {
          setContactEmail(settings.contact_email)
        }
        if (settings.contact_phone) {
          setContactPhone(settings.contact_phone)
        }
      } catch (error) {
        console.error('Error loading contact settings:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    loadSettings()
  }, [])

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      description: 'Call us anytime',
      primary: contactPhone,
      secondary: 'Available 24/7',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Send us an email',
      primary: contactEmail,
      secondary: 'We respond within 24 hours',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: MapPin,
      title: 'Address',
      description: 'Visit our headquarters',
      primary: addressParts.street,
      secondary: `${addressParts.city}, ${addressParts.state} ${addressParts.zip}`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'We\'re here to help',
      primary: 'Mon-Fri: 8:00 AM - 8:00 PM',
      secondary: 'Sat-Sun: 9:00 AM - 5:00 PM',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Submit contact form
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }
      
      setSubmitted(true)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      // Error handling - could add toast notification here
      console.error('Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-6">
                <MessageSquare className="w-4 h-4" />
                <span>Get in Touch</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                We're Here to{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Help You
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Have a question or need assistance? Our friendly team is ready to help. 
                Reach out to us through any of the channels below or fill out the form.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {method.description}
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {method.primary}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.secondary}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                {submitted ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-1">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="account">Account Services</option>
                        <option value="loan">Loan Information</option>
                        <option value="investment">Investment Services</option>
                        <option value="business">Business Banking</option>
                        <option value="support">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white transition-all resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || submitted}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : submitted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Message Sent</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Map / Office Info */}
              <div className="space-y-8">
                {/* Google Maps Embed */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="relative h-64 lg:h-80 w-full">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(headquartersAddress)}&hl=en&z=14&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                      title="Liberty International Bank Headquarters Location"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Visit Our Headquarters
                    </h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Address</p>
                          <p>{addressParts.street}<br />{addressParts.city}, {addressParts.state} {addressParts.zip}<br />{addressParts.country}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Office Hours</p>
                          <p>Monday - Friday: 8:00 AM - 8:00 PM<br />Saturday - Sunday: 9:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white">
                  <Building2 className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-3">
                    Need Immediate Assistance?
                  </h3>
                  <p className="mb-6 text-white/90">
                    Our 24/7 customer support team is always ready to help you with any questions or concerns.
                  </p>
                  <div className="space-y-3">
                    <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center space-x-3 text-white hover:text-green-200 transition-colors">
                      <Phone className="w-5 h-5" />
                      <span className="font-semibold">{contactPhone}</span>
                    </a>
                    <a href={`mailto:${contactEmail}`} className="flex items-center space-x-3 text-white hover:text-green-200 transition-colors">
                      <Mail className="w-5 h-5" />
                      <span className="font-semibold">{contactEmail}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Offices */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Global Presence
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We have offices and branches across the globe to serve you better
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  city: 'Sioux City',
                  country: 'United States',
                  address: headquartersAddress,
                  phone: contactPhone
                },
                {
                  city: 'London',
                  country: 'United Kingdom',
                  address: '456 Finance Square, City of London',
                  phone: '+44 20 1234 5678'
                },
                {
                  city: 'Singapore',
                  country: 'Singapore',
                  address: '789 Banking Tower, Marina Bay',
                  phone: '+65 6123 4567'
                }
              ].map((office, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-green-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {office.city}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {office.country}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>{office.address}</p>
                    <p>{office.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}


