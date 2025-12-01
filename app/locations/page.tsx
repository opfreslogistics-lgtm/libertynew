'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Search,
  Navigation,
  Building2,
  Globe,
  ArrowRight,
  CheckCircle2,
  Calendar,
  User,
  MessageSquare
} from 'lucide-react'

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  const branches = [
    {
      id: 1,
      name: 'Financial District Branch',
      type: 'Full Service',
      address: '123 Bank Street, Financial District',
      city: 'New York',
      state: 'NY',
      zip: '10004',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      email: 'financial.district@libertybank.com',
      hours: {
        weekday: 'Monday - Friday: 8:00 AM - 8:00 PM',
        weekend: 'Saturday - Sunday: 9:00 AM - 5:00 PM'
      },
      services: ['Personal Banking', 'Business Banking', 'Investment Services', 'Mortgage Services', 'ATMs'],
      coordinates: { lat: 40.7074, lng: -74.0113 },
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      name: 'London City Branch',
      type: 'Full Service',
      address: '456 Finance Square, City of London',
      city: 'London',
      state: '',
      zip: 'EC2N 1AJ',
      country: 'United Kingdom',
      phone: '+44 20 1234 5678',
      email: 'london.city@libertybank.com',
      hours: {
        weekday: 'Monday - Friday: 9:00 AM - 6:00 PM',
        weekend: 'Saturday: 9:00 AM - 2:00 PM, Sunday: Closed'
      },
      services: ['Personal Banking', 'Business Banking', 'International Services', 'Investment Services', 'ATMs'],
      coordinates: { lat: 51.5154, lng: -0.0922 },
      image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      name: 'Singapore Marina Bay',
      type: 'Full Service',
      address: '789 Banking Tower, Marina Bay',
      city: 'Singapore',
      state: '',
      zip: '018956',
      country: 'Singapore',
      phone: '+65 6123 4567',
      email: 'marina.bay@libertybank.com',
      hours: {
        weekday: 'Monday - Friday: 9:00 AM - 6:00 PM',
        weekend: 'Saturday: 10:00 AM - 3:00 PM, Sunday: Closed'
      },
      services: ['Personal Banking', 'Business Banking', 'Investment Services', 'Trade Finance', 'ATMs'],
      coordinates: { lat: 1.2808, lng: 103.8598 },
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop'
    },
    {
      id: 4,
      name: 'Tokyo Financial Center',
      type: 'Full Service',
      address: '321 Banking Plaza, Marunouchi',
      city: 'Tokyo',
      state: '',
      zip: '100-0005',
      country: 'Japan',
      phone: '+81 3 1234 5678',
      email: 'tokyo.financial@libertybank.com',
      hours: {
        weekday: 'Monday - Friday: 9:00 AM - 5:00 PM',
        weekend: 'Saturday: 9:00 AM - 1:00 PM, Sunday: Closed'
      },
      services: ['Personal Banking', 'Business Banking', 'Investment Services', 'ATMs'],
      coordinates: { lat: 35.6812, lng: 139.7671 },
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
    },
    {
      id: 5,
      name: 'Dubai International Financial Centre',
      type: 'Full Service',
      address: '555 Banking Tower, DIFC',
      city: 'Dubai',
      state: '',
      zip: 'P.O. Box 12345',
      country: 'United Arab Emirates',
      phone: '+971 4 123 4567',
      email: 'dubai.difc@libertybank.com',
      hours: {
        weekday: 'Sunday - Thursday: 8:00 AM - 6:00 PM',
        weekend: 'Friday - Saturday: Closed'
      },
      services: ['Personal Banking', 'Business Banking', 'Investment Services', 'Wealth Management', 'ATMs'],
      coordinates: { lat: 25.2150, lng: 55.2794 },
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop'
    },
    {
      id: 6,
      name: 'Sydney CBD Branch',
      type: 'Full Service',
      address: '777 Banking Center, Martin Place',
      city: 'Sydney',
      state: 'NSW',
      zip: '2000',
      country: 'Australia',
      phone: '+61 2 9123 4567',
      email: 'sydney.cbd@libertybank.com',
      hours: {
        weekday: 'Monday - Friday: 9:00 AM - 5:00 PM',
        weekend: 'Saturday: 9:00 AM - 12:00 PM, Sunday: Closed'
      },
      services: ['Personal Banking', 'Business Banking', 'Investment Services', 'ATMs'],
      coordinates: { lat: -33.8688, lng: 151.2093 },
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    }
  ]

  const filteredBranches = branches.filter(branch => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      branch.name.toLowerCase().includes(query) ||
      branch.city.toLowerCase().includes(query) ||
      branch.country.toLowerCase().includes(query) ||
      branch.address.toLowerCase().includes(query)
    )
  })

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
                <MapPin className="w-4 h-4" />
                <span>Branch Locator</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Find a{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Branch Near You
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Visit us at any of our branches worldwide. Our friendly staff is ready to assist you 
                with all your banking needs.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by city, country, or address..."
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 dark:text-white text-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Branches Grid */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Our Branches
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredBranches.length} {filteredBranches.length === 1 ? 'branch' : 'branches'} found
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className={`group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                    selectedLocation === branch.id 
                      ? 'border-green-600 dark:border-green-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={branch.image}
                      alt={branch.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-800/40 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        {branch.type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {branch.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-white/90 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{branch.city}, {branch.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Address */}
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {branch.address}<br />
                            {branch.city}{branch.state ? `, ${branch.state}` : ''} {branch.zip}<br />
                            {branch.country}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <a href={`tel:${branch.phone}`} className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                          {branch.phone}
                        </a>
                      </div>

                      {/* Hours */}
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">Hours</p>
                          <p>{branch.hours.weekday}</p>
                          <p>{branch.hours.weekend}</p>
                        </div>
                      </div>

                      {/* Services */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Services Available</p>
                        <div className="flex flex-wrap gap-2">
                          {branch.services.slice(0, 3).map((service, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium"
                            >
                              {service}
                            </span>
                          ))}
                          {branch.services.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium">
                              +{branch.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                      <button
                        onClick={() => setSelectedLocation(selectedLocation === branch.id ? null : branch.id)}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      <a
                        href={`tel:${branch.phone}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBranches.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No branches found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try searching with different keywords or browse all branches.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Find Us on the Map
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {selectedLocation 
                  ? `Viewing: ${branches.find(b => b.id === selectedLocation)?.name}`
                  : 'Click on a branch card above to view it on the map'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="relative h-96 lg:h-[600px] w-full">
                {selectedLocation ? (
                  (() => {
                    const branch = branches.find(b => b.id === selectedLocation)
                    if (!branch) return null
                    const mapAddress = `${branch.address}, ${branch.city}${branch.state ? `, ${branch.state}` : ''} ${branch.zip}, ${branch.country}`
                    return (
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&hl=en&z=14&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                        title={`${branch.name} Location`}
                      ></iframe>
                    )
                  })()
                ) : (
                  <iframe
                    src="https://maps.google.com/maps?q=Liberty+Bank+branches&hl=en&z=2&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    title="Liberty Bank Branches Worldwide"
                  ></iframe>
                )}
              </div>
              {selectedLocation && (
                <div className="p-6 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {branches.find(b => b.id === selectedLocation)?.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {branches.find(b => b.id === selectedLocation)?.address}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const branch = branches.find(b => b.id === selectedLocation)
                        if (branch) {
                          const mapAddress = `${branch.address}, ${branch.city}${branch.state ? `, ${branch.state}` : ''} ${branch.zip}, ${branch.country}`
                          window.open(`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}`, '_blank')
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Get Directions</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Visit Information */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Planning a Visit?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Here's what you need to know before visiting our branches
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-green-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      What to Bring
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Valid government-issued photo ID</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Account number or card (if applicable)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Any relevant documents for your inquiry</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-blue-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Schedule Appointment
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    For specialized services or to meet with a financial advisor, we recommend scheduling an appointment in advance.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Schedule Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
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
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Need More Information?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Can't find what you're looking for? Our team is ready to help you find the perfect branch 
              or answer any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-green-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Contact Us</span>
              </Link>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}

