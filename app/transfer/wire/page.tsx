'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatCurrency, maskAccountNumber, generateReferenceNumber } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { getWireTransactionPin, getWireBeneficiaries, searchBeneficiaries, saveWireBeneficiary, WireBeneficiary } from '@/lib/utils/wireTransfer'
import NotificationModal from '@/components/NotificationModal'
import TransferProgressModal from '@/components/TransferProgressModal'
import { sendTransferNotification } from '@/lib/utils/emailNotifications'
import {
  ArrowRight,
  Building2,
  Globe,
  Shield,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Upload,
  Download,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Clock,
  DollarSign,
  X,
  Loader2,
  User,
  Search,
} from 'lucide-react'

type TransferType = 'domestic' | 'international'
type WireStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export default function WireTransferPage() {
  const { accounts, refreshAccounts } = useAccounts() // Only use real accounts from database
  const [currentStep, setCurrentStep] = useState<WireStep>(1)
  const [transferType, setTransferType] = useState<TransferType>('domestic')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Sender Information (Auto-filled)
  const [senderAccount, setSenderAccount] = useState(accounts[0]?.id || '')
  
  // Beneficiary Information
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('')
  const [beneficiaryCity, setBeneficiaryCity] = useState('')
  const [beneficiaryCountry, setBeneficiaryCountry] = useState('')
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('')
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('')
  
  // Bank Information
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [bankAddress, setBankAddress] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [iban, setIban] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [sortCode, setSortCode] = useState('')
  
  // Intermediary Bank (for international)
  const [useIntermediary, setUseIntermediary] = useState(false)
  const [intermediaryBankName, setIntermediaryBankName] = useState('')
  const [intermediarySwift, setIntermediarySwift] = useState('')
  const [intermediaryAba, setIntermediaryAba] = useState('')
  
  // Transfer Details
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [purpose, setPurpose] = useState('')
  const [reference, setReference] = useState('')
  const [scheduleType, setScheduleType] = useState<'now' | 'later' | 'recurring'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  
  // Security
  const [pin, setPin] = useState('')
  const [otp, setOtp] = useState('')
  const [agreed, setAgreed] = useState(false)
  
  // Saved beneficiary
  const [saveBeneficiary, setSaveBeneficiary] = useState(false)
  const [beneficiaryNickname, setBeneficiaryNickname] = useState('')
  
  // Beneficiary autocomplete
  const [beneficiarySuggestions, setBeneficiarySuggestions] = useState<WireBeneficiary[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false)
  const beneficiaryInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Wire Transaction PIN
  const [wirePinRequired, setWirePinRequired] = useState(false)
  const [wirePinValue, setWirePinValue] = useState('')

  // Notification and Success
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transferSuccessDetails, setTransferSuccessDetails] = useState<any>(null)
  
  const selectedAccount = accounts.find(acc => acc.id === senderAccount)
  
  const transferFees = {
    domestic: 25,
    international: 45,
    intermediary: 15,
  }
  
  const totalFees = transferType === 'domestic' 
    ? transferFees.domestic 
    : transferFees.international + (useIntermediary ? transferFees.intermediary : 0)
  
  const totalAmount = parseFloat(amount || '0') + totalFees
  
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY']
  
  const purposes = [
    'Invoice Payment',
    'Salary Payment',
    'Gift',
    'Family Support',
    'Loan Repayment',
    'Business Payment',
    'School Fees',
    'Rent Payment',
    'Medical Expenses',
    'Other',
  ]

  // Load wire PIN requirement on mount
  useEffect(() => {
    const checkWirePin = async () => {
      const { enabled } = await getWireTransactionPin()
      setWirePinRequired(enabled)
    }
    checkWirePin()
  }, [])

  // Handle beneficiary name input with autocomplete
  useEffect(() => {
    const handleBeneficiarySearch = async () => {
      if (beneficiaryName.trim().length >= 1 && currentStep === 2) {
        setIsLoadingBeneficiaries(true)
        const results = await searchBeneficiaries(beneficiaryName)
        setBeneficiarySuggestions(results)
        setShowSuggestions(results.length > 0)
        setIsLoadingBeneficiaries(false)
      } else {
        setBeneficiarySuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(handleBeneficiarySearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [beneficiaryName, currentStep])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        beneficiaryInputRef.current &&
        !beneficiaryInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fill beneficiary data when selected from suggestions
  const selectBeneficiary = (beneficiary: WireBeneficiary) => {
    setBeneficiaryName(beneficiary.beneficiary_name)
    setBeneficiaryAddress(beneficiary.beneficiary_address || '')
    setBeneficiaryCity(beneficiary.beneficiary_city || '')
    setBeneficiaryCountry(beneficiary.beneficiary_country || '')
    setBeneficiaryPhone(beneficiary.beneficiary_phone || '')
    setBeneficiaryEmail(beneficiary.beneficiary_email || '')
    setBankName(beneficiary.bank_name)
    setBankBranch(beneficiary.bank_branch || '')
    setBankAddress(beneficiary.bank_address || '')
    setAccountNumber(beneficiary.account_number)
    setIban(beneficiary.iban || '')
    setSwiftCode(beneficiary.swift_code || '')
    setRoutingNumber(beneficiary.routing_number || '')
    setSortCode(beneficiary.sort_code || '')
    setIntermediaryBankName(beneficiary.intermediary_bank_name || '')
    setIntermediarySwift(beneficiary.intermediary_swift || '')
    setIntermediaryAba(beneficiary.intermediary_aba || '')
    setTransferType(beneficiary.transfer_type)
    setCurrency(beneficiary.currency)
    setBeneficiaryNickname(beneficiary.nickname || '')
    setShowSuggestions(false)
  }

  const handleNext = async () => {
    // Validate step 6 before proceeding
    if (currentStep === 6) {
      // Check if wire PIN is required and validate
      if (wirePinRequired) {
        if (!wirePinValue.trim()) {
          setNotification({
            isOpen: true,
            type: 'warning',
            title: 'Transaction PIN Required',
            message: 'Please enter your wire transaction PIN to continue.',
          })
          return
        }

        const { pin } = await getWireTransactionPin()
        if (pin && wirePinValue.trim() !== pin) {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Invalid PIN',
            message: 'The transaction PIN you entered is incorrect. Please try again.',
          })
          setWirePinValue('')
          return
        }
      }

      // Validate other required fields
      if (!agreed || !otp) {
        setNotification({
          isOpen: true,
          type: 'warning',
          title: 'Missing Information',
          message: 'Please complete all security verification steps.',
        })
        return
      }
    }

    if (currentStep < 7) {
      if (currentStep === 6) {
        // Execute wire transfer
        await executeWireTransfer()
      } else {
        setCurrentStep((currentStep + 1) as WireStep)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WireStep)
    }
  }

  const executeWireTransfer = async () => {
    if (!senderAccount || !amount || parseFloat(amount) <= 0) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Invalid Transfer',
        message: 'Please check all required fields and amount.',
      })
      return
    }

    const transferAmount = parseFloat(amount)
    const fromAccountData = accounts.find(acc => acc.id === senderAccount)
    
    if (!fromAccountData || parseFloat(fromAccountData.balance.toString()) < totalAmount) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Balance',
        message: `You need ${formatCurrency(totalAmount)} but only have ${formatCurrency(parseFloat(fromAccountData?.balance?.toString() || '0'))} available.`,
      })
      return
    }

    setIsProcessing(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Generate reference number (using standard REF format)
      const referenceNumber = generateReferenceNumber()
      const transactionDate = new Date().toISOString()

      // Update source account balance (deduct total amount including fees)
      const newSourceBalance = parseFloat(fromAccountData.balance.toString()) - totalAmount
      const { error: balanceError } = await supabase
        .from('accounts')
        .update({ balance: newSourceBalance.toString() })
        .eq('id', senderAccount)
      
      if (balanceError) throw balanceError

      // Create wire transfer transaction record using new format
      const wireType = transferType === 'domestic' ? 'DWIRE' : 'INTL WIRE'
      const transactionDescription = `${wireType} – ${referenceNumber}`
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          account_id: senderAccount,
          type: 'debit',
          category: transferType === 'domestic' ? 'Wire Transfer - Domestic' : 'Wire Transfer - International',
          amount: totalAmount,
          description: transactionDescription,
          status: 'completed',
          pending: false,
          date: transactionDate,
        }])

      if (transactionError) throw transactionError

      // Save beneficiary if checkbox is checked
      if (saveBeneficiary && beneficiaryName && bankName && accountNumber) {
        try {
          await saveWireBeneficiary({
            nickname: beneficiaryNickname || beneficiaryName,
            beneficiary_name: beneficiaryName,
            beneficiary_address: beneficiaryAddress,
            beneficiary_city: beneficiaryCity,
            beneficiary_country: beneficiaryCountry,
            beneficiary_phone: beneficiaryPhone,
            beneficiary_email: beneficiaryEmail,
            bank_name: bankName,
            bank_branch: bankBranch,
            bank_address: bankAddress,
            account_number: accountNumber,
            iban: iban,
            swift_code: swiftCode,
            routing_number: routingNumber,
            sort_code: sortCode,
            intermediary_bank_name: useIntermediary ? intermediaryBankName : null,
            intermediary_swift: useIntermediary ? intermediarySwift : null,
            intermediary_aba: useIntermediary ? intermediaryAba : null,
            transfer_type: transferType,
            currency: currency,
          })
        } catch (error) {
          console.error('Error saving beneficiary:', error)
          // Don't fail the transfer if saving beneficiary fails
        }
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'transaction',
          title: 'Wire Transfer Submitted',
          message: `Your wire transfer of ${formatCurrency(transferAmount)} (${formatCurrency(totalFees)} fees) has been submitted. Reference: ${referenceNumber}`,
          read: false,
        }])

      // Send email notifications (non-blocking but properly awaited)
      const accountDisplayName = fromAccountData.account_type ? 
        (fromAccountData.account_type === 'fixed-deposit' ? 'Fixed Deposit' : fromAccountData.account_type.charAt(0).toUpperCase() + fromAccountData.account_type.slice(1)) + ' Account' :
        fromAccountData.name || 'Account'
      
      try {
        await sendTransferNotification(
        user.id,
        'wire',
        transferAmount,
        accountDisplayName,
        `${beneficiaryName} - ${bankName}`,
        referenceNumber,
        purpose || undefined
        )
      } catch (error) {
        console.error('Error sending wire transfer email notification:', error)
        // Don't fail the transfer if email fails
      }

      // Prepare success details
      const successDetails = {
        amount: transferAmount,
        fees: totalFees,
        totalAmount: totalAmount,
        fromAccount: {
          name: fromAccountData.account_type ? 
            (fromAccountData.account_type === 'fixed-deposit' ? 'Fixed Deposit' : fromAccountData.account_type.charAt(0).toUpperCase() + fromAccountData.account_type.slice(1)) + ' Account' :
            fromAccountData.name || 'Account',
          number: fromAccountData.account_number ? maskAccountNumber(fromAccountData.account_number) : `****${fromAccountData.last4 || ''}`,
          type: fromAccountData.account_type || 'Account',
        },
        beneficiaryName: beneficiaryName,
        bankName: bankName,
        accountNumber: accountNumber ? maskAccountNumber(accountNumber) : '',
        swiftCode: swiftCode,
        routingNumber: routingNumber,
        referenceNumber,
        date: transactionDate,
        purpose: purpose,
        currency: currency,
        transferType: transferType === 'domestic' ? 'Domestic Wire' : 'International Wire',
      }

      setTransferSuccessDetails(successDetails)
      setCurrentStep(7)
      
      await refreshAccounts()
      
      // After success details are set, stop processing to trigger success state
      // The modal will handle the smooth transition
      await new Promise(resolve => setTimeout(resolve, 800))
      setIsProcessing(false)
    } catch (error: any) {
      console.error('Error executing wire transfer:', error)
      setIsProcessing(false)
      setTransferSuccessDetails(null)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Transfer Failed',
        message: error.message || 'Failed to process wire transfer. Please try again.',
      })
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Transfer Type</h2>
              <p className="text-gray-600 dark:text-gray-400">Select whether this is a domestic or international wire transfer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setTransferType('domestic')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  transferType === 'domestic'
                    ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transferType === 'domestic' ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      transferType === 'domestic' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Domestic Wire</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Within the same country</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Same day</span>
                      <span className="text-gray-400">•</span>
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">${transferFees.domestic} fee</span>
                    </div>
                  </div>
                  {transferType === 'domestic' && (
                    <Check className="w-6 h-6 text-green-700" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setTransferType('international')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  transferType === 'international'
                    ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transferType === 'international' ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <Globe className={`w-6 h-6 ${
                      transferType === 'international' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">International Wire</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">To another country</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">1-3 business days</span>
                      <span className="text-gray-400">•</span>
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">${transferFees.international} fee</span>
                    </div>
                  </div>
                  {transferType === 'international' && (
                    <Check className="w-6 h-6 text-green-700" />
                  )}
                </div>
              </button>
            </div>

            {/* Sender Account Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                From Account
              </label>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSenderAccount(account.id)}
                    className={`w-full p-4 rounded-xl transition-all text-left ${
                      senderAccount === account.id
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-700'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          senderAccount === account.id ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          <Building2 className={`w-6 h-6 ${
                            senderAccount === account.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {account.account_type ? 
                              (account.account_type === 'fixed-deposit' ? 'Fixed Deposit' : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)) + ' Account' :
                              account.name || 'Account'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {account.account_number ? maskAccountNumber(account.account_number) : `****${account.last4 || ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(account.balance)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Beneficiary Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Enter the recipient's details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Beneficiary Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={beneficiaryInputRef}
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => {
                      setBeneficiaryName(e.target.value)
                      if (e.target.value.trim().length >= 1) {
                        setShowSuggestions(true)
                      }
                    }}
                    onFocus={() => {
                      if (beneficiarySuggestions.length > 0) {
                        setShowSuggestions(true)
                      }
                    }}
                    placeholder="Start typing to search saved beneficiaries..."
                    className="input-field"
                    required
                  />
                  {isLoadingBeneficiaries && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>
                
                {/* Beneficiary Suggestions Dropdown */}
                {showSuggestions && beneficiarySuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto"
                  >
                    {beneficiarySuggestions.map((beneficiary) => (
                      <button
                        key={beneficiary.id}
                        type="button"
                        onClick={() => selectBeneficiary(beneficiary)}
                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {beneficiary.nickname || beneficiary.beneficiary_name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {beneficiary.beneficiary_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {beneficiary.bank_name}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {beneficiary.transfer_type === 'domestic' ? 'Domestic' : 'International'}
                              </span>
                            </div>
                          </div>
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {transferType === 'international' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Beneficiary Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={beneficiaryAddress}
                      onChange={(e) => setBeneficiaryAddress(e.target.value)}
                      placeholder="Street address"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={beneficiaryCity}
                      onChange={(e) => setBeneficiaryCity(e.target.value)}
                      placeholder="City"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={beneficiaryCountry}
                      onChange={(e) => setBeneficiaryCountry(e.target.value)}
                      placeholder="Country"
                      className="input-field"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={beneficiaryPhone}
                    onChange={(e) => setBeneficiaryPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={beneficiaryEmail}
                    onChange={(e) => setBeneficiaryEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-300">
                The beneficiary name must match exactly with their bank account name to avoid delays or rejection.
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bank Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Enter the beneficiary's bank details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Bank of America, Barclays, Chase"
                  className="input-field"
                  required
                />
              </div>

              {transferType === 'international' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Bank Branch
                    </label>
                    <input
                      type="text"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      placeholder="Branch name or number"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Bank Address
                    </label>
                    <input
                      type="text"
                      value={bankAddress}
                      onChange={(e) => setBankAddress(e.target.value)}
                      placeholder="Bank branch address"
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {transferType === 'domestic' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ABA Routing Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="9-digit routing number"
                    maxLength={9}
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Beneficiary account number"
                  className="input-field"
                  required
                />
              </div>

              {transferType === 'international' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      IBAN (if applicable)
                    </label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="International Bank Account Number"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      SWIFT/BIC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="8 or 11 character SWIFT code"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Intermediary Bank */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Use Intermediary Bank</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Required for some international transfers</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={useIntermediary}
                        onChange={(e) => setUseIntermediary(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-green-700 focus:ring-green-700"
                      />
                    </div>
                  </div>

                  {useIntermediary && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Intermediary Bank Name
                        </label>
                        <input
                          type="text"
                          value={intermediaryBankName}
                          onChange={(e) => setIntermediaryBankName(e.target.value)}
                          placeholder="Correspondent bank name"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Intermediary SWIFT
                        </label>
                        <input
                          type="text"
                          value={intermediarySwift}
                          onChange={(e) => setIntermediarySwift(e.target.value)}
                          placeholder="SWIFT code"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Intermediary ABA (if USA)
                        </label>
                        <input
                          type="text"
                          value={intermediaryAba}
                          onChange={(e) => setIntermediaryAba(e.target.value)}
                          placeholder="9-digit ABA number"
                          maxLength={9}
                          className="input-field"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transfer Details</h2>
              <p className="text-gray-600 dark:text-gray-400">Specify the amount and purpose</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-10 text-2xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Purpose of Payment <span className="text-red-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select purpose</option>
                  {purposes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., Invoice #233, Rent payment"
                  className="input-field"
                />
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Fee Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transfer Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(parseFloat(amount || '0'))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wire Transfer Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transferType === 'domestic' ? transferFees.domestic : transferFees.international)}
                  </span>
                </div>
                {useIntermediary && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Intermediary Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(transferFees.intermediary)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Beneficiary */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <input
                type="checkbox"
                id="saveBeneficiary"
                checked={saveBeneficiary}
                onChange={(e) => setSaveBeneficiary(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-700 focus:ring-green-700"
              />
              <div className="flex-1">
                <label htmlFor="saveBeneficiary" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  Save beneficiary for future transfers
                </label>
                {saveBeneficiary && (
                  <input
                    type="text"
                    value={beneficiaryNickname}
                    onChange={(e) => setBeneficiaryNickname(e.target.value)}
                    placeholder="Enter nickname (e.g., John's Account)"
                    className="input-field mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review & Confirm</h2>
              <p className="text-gray-600 dark:text-gray-400">Please verify all details before proceeding</p>
            </div>

            <div className="space-y-4">
              {/* Sender Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Sender Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Account</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedAccount?.account_type ? 
                        (selectedAccount.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedAccount.account_type.charAt(0).toUpperCase() + selectedAccount.account_type.slice(1)) + ' Account' :
                        selectedAccount?.name || 'Account'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedAccount?.account_number ? maskAccountNumber(selectedAccount.account_number) : `****${selectedAccount?.last4 || ''}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Available Balance</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedAccount?.balance || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Beneficiary Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Beneficiary Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{beneficiaryName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Bank</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{bankName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Account Number</p>
                    <p className="font-semibold text-gray-900 dark:text-white">****{accountNumber.slice(-4)}</p>
                  </div>
                  {swiftCode && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">SWIFT Code</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{swiftCode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Transfer Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(parseFloat(amount || '0'))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Currency</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Purpose</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{purpose}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Fees</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalFees)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Debit</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Processing Time */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Estimated Processing Time</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {transferType === 'domestic' ? 'Same business day' : '1-3 business days'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Verification</h2>
              <p className="text-gray-600 dark:text-gray-400">Verify your identity to complete the transfer</p>
            </div>

            <div className="space-y-4">
              {wirePinRequired && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Wire Transaction PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={wirePinValue}
                      onChange={(e) => setWirePinValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter your wire transaction PIN (4-6 digits)"
                      maxLength={6}
                      className="input-field pl-10"
                      required={wirePinRequired}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the wire transaction PIN set by your administrator
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  One-Time Password (OTP) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="input-field flex-1"
                    required
                  />
                  <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all whitespace-nowrap">
                    Send OTP
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  OTP will be sent to your registered email and phone number
                </p>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="agreed"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-green-700 focus:ring-green-700"
                    required
                  />
                  <label htmlFor="agreed" className="text-sm text-gray-900 dark:text-white cursor-pointer">
                    I acknowledge and agree to the following:
                  </label>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 ml-8">
                  <li>• Wire transfers are <strong>irrevocable</strong> and cannot be cancelled once processed</li>
                  <li>• I have verified all beneficiary details are correct</li>
                  <li>• I understand the fees and processing times</li>
                  <li>• I authorize Liberty Bank to debit my account for the total amount</li>
                  <li>• I comply with all applicable laws and regulations</li>
                </ul>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-300">Important Warning</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    Beware of fraud. Never send money to someone you don't know or trust. Wire transfers cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-700 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transfer Submitted!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your wire transfer has been successfully submitted</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {transferSuccessDetails?.referenceNumber || 'WT-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transferSuccessDetails?.amount || parseFloat(amount || '0'))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fees</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transferSuccessDetails?.fees || totalFees)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Debit</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transferSuccessDetails?.totalAmount || totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Arrival</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {transferType === 'domestic' ? 'Today' : '1-3 business days'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Receipt
              </button>
              <button 
                onClick={() => {
                  setShowSuccessModal(true)
                }}
                className="flex-1 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-all"
              >
                View Details
              </button>
              <button 
                onClick={() => {
                  // Reset form and go back to step 1
                  setCurrentStep(1)
                  setBeneficiaryName('')
                  setBeneficiaryAddress('')
                  setBeneficiaryCity('')
                  setBeneficiaryCountry('')
                  setBeneficiaryPhone('')
                  setBeneficiaryEmail('')
                  setBankName('')
                  setBankBranch('')
                  setBankAddress('')
                  setAccountNumber('')
                  setIban('')
                  setSwiftCode('')
                  setRoutingNumber('')
                  setAmount('')
                  setPurpose('')
                  setReference('')
                  setWirePinValue('')
                  setOtp('')
                  setAgreed(false)
                  setSaveBeneficiary(false)
                  setBeneficiaryNickname('')
                  setShowSuccessModal(false)
                  setTransferSuccessDetails(null)
                }}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
              >
                New Transfer
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Wire Transfer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Send money domestically or internationally via wire transfer
        </p>
      </div>

      {/* Progress Steps */}
      {currentStep < 7 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 6 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step
                      ? 'bg-green-700'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
            <span>Type</span>
            <span>Beneficiary</span>
            <span>Bank</span>
            <span>Details</span>
            <span>Review</span>
            <span>Verify</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 7 && (
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          {currentStep < 6 && (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {currentStep === 6 && (
            <button
              onClick={handleNext}
              disabled={!agreed || !otp || (wirePinRequired && !wirePinValue) || isProcessing}
              className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Submit Transfer
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      {/* Transfer Progress Modal - Handles both processing and success states */}
      <TransferProgressModal
        isProcessing={isProcessing}
        isComplete={!!transferSuccessDetails && !isProcessing}
          transferType="wire"
        transferDetails={transferSuccessDetails ? {
            amount: transferSuccessDetails.amount,
            fees: transferSuccessDetails.fees,
            totalAmount: transferSuccessDetails.totalAmount,
            fromAccount: transferSuccessDetails.fromAccount,
          toAccount: undefined,
            referenceNumber: transferSuccessDetails.referenceNumber,
            date: transferSuccessDetails.date,
        } : undefined}
        onClose={() => {
          setIsProcessing(false)
          setShowSuccessModal(false)
          setTransferSuccessDetails(null)
        }}
      />
    </div>
  )
}



