'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, generateReferenceNumber } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAccounts } from '@/lib/hooks/useAccounts'
import NotificationModal from '@/components/NotificationModal'
import {
  DollarSign,
  Calendar,
  TrendingDown,
  TrendingUp,
  FileText,
  CheckCircle,
  Plus,
  Clock,
  Percent,
  CreditCard,
  Home as HomeIcon,
  Car,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  ArrowRight,
  Info,
  Shield,
  Zap,
  Download,
  X,
  ChevronRight,
  AlertCircle,
  Calculator,
  Loader2,
  Upload,
  Camera,
  User,
  Building2,
  Wallet,
  FileCheck,
  Mail,
  Phone,
  MapPin,
  Briefcase as BriefcaseIcon,
  DollarSign as DollarSignIcon,
  FileImage,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'

export default function LoansPage() {
  const { accounts } = useAccounts() // No loading state - accounts appear immediately
  const [showApplication, setShowApplication] = useState(false)
  const [applicationStep, setApplicationStep] = useState(1)
  const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null)
  const [loanAmount, setLoanAmount] = useState('')
  const [loanTerm, setLoanTerm] = useState('36')
  const [loanPurpose, setLoanPurpose] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'uploading' | 'processing' | 'reviewing' | 'submitted'>('idle')
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

  // Enhanced form fields - Personal Information
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
  const [idBackFile, setIdBackFile] = useState<File | null>(null)
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null)
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null)
  const [ssnTaxId, setSsnTaxId] = useState('')

  // Employment Information
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [employerName, setEmployerName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')
  const [employmentStartDate, setEmploymentStartDate] = useState('')
  const [employerAddress, setEmployerAddress] = useState('')
  const [employerPhone, setEmployerPhone] = useState('')

  // Financial Information
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [existingLoans, setExistingLoans] = useState('')
  const [otherAssets, setOtherAssets] = useState('')
  const [preferredRepaymentMethod, setPreferredRepaymentMethod] = useState('')
  const [collateral, setCollateral] = useState('')

  // Documents
  const [payslipFiles, setPayslipFiles] = useState<File[]>([])
  const [payslipPreviews, setPayslipPreviews] = useState<string[]>([])
  const [bankStatementFiles, setBankStatementFiles] = useState<File[]>([])
  const [bankStatementPreviews, setBankStatementPreviews] = useState<string[]>([])
  const [utilityBillFile, setUtilityBillFile] = useState<File | null>(null)
  const [utilityBillPreview, setUtilityBillPreview] = useState<string | null>(null)
  const [businessRegistrationFile, setBusinessRegistrationFile] = useState<File | null>(null)
  const [businessRegistrationPreview, setBusinessRegistrationPreview] = useState<string | null>(null)
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null)
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>(null)

  // Consent & Agreements
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [creditCheckAccepted, setCreditCheckAccepted] = useState(false)
  const [repaymentPolicyAccepted, setRepaymentPolicyAccepted] = useState(false)
  const [digitalSignature, setDigitalSignature] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  // Set default account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  // Loan types definition (must be before it's used)
  const loanTypes = [
    {
      id: 'personal',
      name: 'Personal Loan',
      maxAmount: 50000,
      minRate: 5.99,
      icon: Briefcase,
      color: '#047857',
      description: 'For any personal expense',
    },
    {
      id: 'auto',
      name: 'Auto Loan',
      maxAmount: 75000,
      minRate: 3.99,
      icon: Car,
      color: '#3b82f6',
      description: 'Finance your dream vehicle',
    },
    {
      id: 'home',
      name: 'Home Loan',
      maxAmount: 500000,
      minRate: 3.25,
      icon: HomeIcon,
      color: '#8b5cf6',
      description: 'Buy or refinance your home',
    },
    {
      id: 'student',
      name: 'Student Loan',
      maxAmount: 100000,
      minRate: 4.50,
      icon: GraduationCap,
      color: '#f59e0b',
      description: 'Invest in your education',
    },
  ]

  // Loan state
  const [userLoans, setUserLoans] = useState<any[]>([])
  const [loansLoading, setLoansLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<any | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentAccountId, setPaymentAccountId] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Fetch user loans
  useEffect(() => {
    fetchUserLoans()
  }, [])

  const fetchUserLoans = async () => {
    try {
      setLoansLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setUserLoans([])
        setLoansLoading(false)
        return
      }

      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (loansError) {
        console.error('Error fetching loans:', loansError)
        setUserLoans([])
      } else {
        setUserLoans(loansData || [])
      }
    } catch (error) {
      console.error('Error fetching loans:', error)
      setUserLoans([])
    } finally {
      setLoansLoading(false)
    }
  }

  // Fetch loan payments for payment history
  const [loanPayments, setLoanPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  useEffect(() => {
    const fetchLoanPayments = async () => {
      try {
        setPaymentsLoading(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setLoanPayments([])
          setPaymentsLoading(false)
          return
        }

        const { data: paymentsData, error: paymentsError } = await supabase
          .from('loan_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })

        if (paymentsError) {
          console.error('Error fetching loan payments:', paymentsError)
          setLoanPayments([])
        } else {
          setLoanPayments(paymentsData || [])
        }
      } catch (error) {
        console.error('Error fetching loan payments:', error)
        setLoanPayments([])
      } finally {
        setPaymentsLoading(false)
      }
    }

    if (userLoans.length > 0) {
      fetchLoanPayments()
    }
  }, [userLoans])

  // Separate loans by status
  // Active loans: Only loans that are "active" AND have been disbursed
  const activeLoans = userLoans
    .filter(loan => loan.status === 'active' && loan.disbursed_at && parseFloat((loan.balance_remaining || 0).toString()) > 0)
    .map(loan => {
      const loanTypeData = loanTypes.find(t => t.id === loan.loan_type)
      // Get payments for this loan
      const loanPaymentHistory = loanPayments.filter((p: any) => p.loan_id === loan.id)
      return {
        id: loan.id,
        type: loan.loan_type,
        balance: parseFloat(loan.balance_remaining?.toString() || '0'),
        originalAmount: parseFloat(loan.approved_amount?.toString() || loan.requested_amount?.toString() || '0'),
        requestedAmount: parseFloat(loan.requested_amount?.toString() || '0'),
        approvedAmount: parseFloat(loan.approved_amount?.toString() || '0'),
        disbursedAmount: parseFloat(loan.approved_amount?.toString() || loan.requested_amount?.toString() || '0'), // Amount received
        monthlyPayment: parseFloat(loan.monthly_payment?.toString() || '0'),
        nextPaymentDate: loan.next_payment_date ? new Date(loan.next_payment_date) : new Date(),
        interestRate: parseFloat(loan.interest_rate?.toString() || '0'),
        term: loan.term_months,
        paymentsRemaining: Math.ceil(parseFloat(loan.balance_remaining?.toString() || '0') / parseFloat(loan.monthly_payment?.toString() || '1')),
        icon: loanTypeData?.icon || Briefcase,
        color: loanTypeData?.color || '#047857',
        reference_number: loan.reference_number,
        purpose: loan.purpose,
        total_paid: parseFloat(loan.total_paid?.toString() || '0'),
        disbursed_at: loan.disbursed_at ? new Date(loan.disbursed_at) : null,
        approved_at: loan.approved_at ? new Date(loan.approved_at) : null,
        paymentHistory: loanPaymentHistory,
      }
    })

  // Approved but not yet disbursed loans
  const approvedLoans = userLoans.filter(loan => 
    loan.status === 'approved' && !loan.disbursed_at
  )

  const pendingLoans = userLoans.filter(loan => loan.status === 'pending')
  const declinedLoans = userLoans.filter(loan => loan.status === 'declined')
  // Only show completed loans that are actually completed (not active with 0 balance)
  const completedLoans = userLoans.filter(loan => 
    loan.status === 'completed' || 
    (loan.status === 'active' && parseFloat((loan.balance_remaining || 0).toString()) <= 0)
  )

  const purposes = [
    'Home Improvement',
    'Debt Consolidation',
    'Major Purchase',
    'Medical Expenses',
    'Wedding',
    'Vacation',
    'Business',
    'Other',
  ]

  const getLoanTypeName = (type: string) => {
    const loanTypeData = loanTypes.find(t => t.id === type)
    return loanTypeData?.name || type
  }

  // Remove duplicate loanTypes definition if it exists later

  // Get selected loan type details
  const selectedLoanTypeData = loanTypes.find(t => t.id === selectedLoanType)
  const interestRate = selectedLoanTypeData?.minRate || 5.99

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount) || 0
    const months = parseInt(loanTerm)
    const annualRate = interestRate / 100
    const monthlyRate = annualRate / 12
    
    if (principal === 0 || months === 0) return 0
    
    if (monthlyRate === 0) {
      return principal / months
    }
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    return monthlyPayment
  }

  // File upload helper
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('loan-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('loan-documents')
      .getPublicUrl(fileName)

    return publicUrl
  }

  // Upload multiple files
  const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadFile(file, folder))
    return Promise.all(uploadPromises)
  }

  // Handle file preview
  const handleFilePreview = (file: File, setPreview: (url: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Send OTP (mock for now)
  const sendOTP = async () => {
    // In production, integrate with actual OTP service
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setOtpCode(mockOtp)
    setOtpSent(true)
    setNotification({
      isOpen: true,
      type: 'info',
      title: 'OTP Sent',
      message: `Your OTP is: ${mockOtp} (This is a demo. In production, it will be sent to your email/phone.)`,
    })
  }

  // Verify OTP
  const verifyOTP = () => {
    if (otpCode && otpCode.length === 6) {
      setOtpVerified(true)
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'OTP Verified',
        message: 'Your identity has been verified successfully.',
      })
    } else {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter a valid 6-digit OTP code.',
      })
    }
  }

  // Submit loan application
  const handleSubmitApplication = async () => {
    if (!selectedLoanType || !loanAmount || !loanPurpose || !selectedAccountId) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all required fields.',
      })
      return
    }

    const amount = parseFloat(loanAmount)
    if (amount <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid loan amount.',
      })
      return
    }

    const selectedLoanTypeData = loanTypes.find(t => t.id === selectedLoanType)
    if (amount > (selectedLoanTypeData?.maxAmount || 0)) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Amount Exceeds Limit',
        message: `Maximum loan amount for ${selectedLoanTypeData?.name} is ${formatCurrency(selectedLoanTypeData?.maxAmount || 0)}.`,
      })
      return
    }

    // Calculate interest rate from selected loan type
    const interestRate = selectedLoanTypeData?.minRate || 5.99

    // Validate consent
    if (!termsAccepted || !creditCheckAccepted || !repaymentPolicyAccepted) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Consent Required',
        message: 'Please accept all terms and conditions to proceed.',
      })
      return
    }

    if (!otpVerified) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Verification Required',
        message: 'Please verify your identity with OTP.',
      })
      return
    }

    setIsSubmitting(true)
    setSubmissionStatus('uploading')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Generate reference number
      const referenceNumber = generateReferenceNumber()

      // Calculate monthly payment with the correct interest rate
      const principal = amount
      const months = parseInt(loanTerm)
      const annualRate = interestRate / 100
      const monthlyRate = annualRate / 12
      let calculatedMonthlyPayment = 0
      
      if (principal > 0 && months > 0) {
        if (monthlyRate === 0) {
          calculatedMonthlyPayment = principal / months
        } else {
          calculatedMonthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        }
      }
      
      const monthlyPayment = calculatedMonthlyPayment

      // Upload documents
      setSubmissionStatus('uploading')
      const documentUrls: any = {}

      try {
        if (idFrontFile) {
          documentUrls.id_front_url = await uploadFile(idFrontFile, 'id')
        }
        if (idBackFile) {
          documentUrls.id_back_url = await uploadFile(idBackFile, 'id')
        }
        if (payslipFiles.length > 0) {
          documentUrls.payslip_urls = await uploadFiles(payslipFiles, 'payslips')
        }
        if (bankStatementFiles.length > 0) {
          documentUrls.bank_statement_urls = await uploadFiles(bankStatementFiles, 'statements')
        }
        if (utilityBillFile) {
          documentUrls.utility_bill_url = await uploadFile(utilityBillFile, 'utility')
        }
        if (businessRegistrationFile) {
          documentUrls.business_registration_url = await uploadFile(businessRegistrationFile, 'business')
        }
        if (passportPhotoFile) {
          documentUrls.passport_photo_url = await uploadFile(passportPhotoFile, 'passport')
        }
      } catch (uploadError: any) {
        console.error('Error uploading documents:', uploadError)
        throw new Error(`Failed to upload documents: ${uploadError.message}`)
      }

      setSubmissionStatus('processing')

      // Prepare loan data with all enhanced fields
      const loanData: any = {
        user_id: user.id,
        account_id: selectedAccountId,
        loan_type: selectedLoanType,
        amount: amount.toString(), // Required NOT NULL field
        requested_amount: amount.toString(),
        interest_rate: interestRate.toString(),
        term_months: parseInt(loanTerm),
        monthly_payment: monthlyPayment.toString(),
        balance: amount.toString(), // Required NOT NULL field - starts at full amount
        original_amount: amount.toString(), // Required NOT NULL field - original loan amount
        purpose: loanPurpose,
        reference_number: referenceNumber,
        status: 'pending',
        // Personal Information
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        phone_number: phoneNumber || null,
        home_address: homeAddress || null,
        city: city || null,
        state: state || null,
        country: country || null,
        id_type: idType || null,
        id_number: idNumber || null,
        ssn_tax_id: ssnTaxId || null,
        ...documentUrls,
        // Employment Information
        employment_status: employmentStatus || null,
        employer_name: employerName || null,
        job_title: jobTitle || null,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome).toString() : null,
        annual_income: annualIncome ? parseFloat(annualIncome).toString() : null,
        employment_start_date: employmentStartDate || null,
        employer_address: employerAddress || null,
        employer_phone: employerPhone || null,
        // Financial Information
        monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses).toString() : null,
        existing_loans: existingLoans ? parseFloat(existingLoans).toString() : null,
        other_assets: otherAssets ? parseFloat(otherAssets).toString() : null,
        preferred_repayment_method: preferredRepaymentMethod || null,
        collateral: collateral || null,
        // Consent & Agreements
        terms_accepted: termsAccepted,
        credit_check_accepted: creditCheckAccepted,
        repayment_policy_accepted: repaymentPolicyAccepted,
        digital_signature: digitalSignature || null,
        otp_verified: otpVerified,
      }

      setSubmissionStatus('reviewing')

      // Create loan application
      const { data: loanDataResult, error: loanError } = await supabase
        .from('loans')
        .insert([loanData])
        .select()
        .single()

      if (loanError) {
        console.error('Error creating loan:', loanError)
        throw loanError
      }

      setSubmissionStatus('submitted')

      // Wait a moment to show success animation
      await new Promise(resolve => setTimeout(resolve, 1500))

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Application Submitted Successfully!',
        message: `Your loan application has been submitted. Reference: ${referenceNumber}. Our team will review it within 24-48 hours. You'll receive an email notification once approved.`,
      })

      // Send email notifications (non-blocking)
      const { sendLoanApplicationNotification } = await import('@/lib/utils/emailNotifications')
      const loanTypeLabel = selectedLoanType === 'personal' ? 'Personal Loan' :
                           selectedLoanType === 'auto' ? 'Auto Loan' :
                           selectedLoanType === 'home' ? 'Home Loan' :
                           selectedLoanType === 'student' ? 'Student Loan' : 'Loan'
      
      sendLoanApplicationNotification(
        user.id,
        loanTypeLabel,
        parseFloat(loanAmount),
        referenceNumber
      ).catch(error => {
        console.error('Error sending loan application email notification:', error)
        // Don't fail the application if email fails
      })

      // Reset form
      setShowApplication(false)
      setApplicationStep(1)
      setSelectedLoanType(null)
      setLoanAmount('')
      setLoanPurpose('')
      setSelectedAccountId(accounts[0]?.id || '')
      setSubmissionStatus('idle')
      // Reset all enhanced fields
      setFullName('')
      setDateOfBirth('')
      setGender('')
      setPhoneNumber('')
      setHomeAddress('')
      setCity('')
      setState('')
      setCountry('')
      setIdType('')
      setIdNumber('')
      setIdFrontFile(null)
      setIdBackFile(null)
      setIdFrontPreview(null)
      setIdBackPreview(null)
      setSsnTaxId('')
      setEmploymentStatus('')
      setEmployerName('')
      setJobTitle('')
      setMonthlyIncome('')
      setAnnualIncome('')
      setEmploymentStartDate('')
      setEmployerAddress('')
      setEmployerPhone('')
      setMonthlyExpenses('')
      setExistingLoans('')
      setOtherAssets('')
      setPreferredRepaymentMethod('')
      setCollateral('')
      setPayslipFiles([])
      setPayslipPreviews([])
      setBankStatementFiles([])
      setBankStatementPreviews([])
      setUtilityBillFile(null)
      setUtilityBillPreview(null)
      setBusinessRegistrationFile(null)
      setBusinessRegistrationPreview(null)
      setPassportPhotoFile(null)
      setPassportPhotoPreview(null)
      setTermsAccepted(false)
      setCreditCheckAccepted(false)
      setRepaymentPolicyAccepted(false)
      setDigitalSignature('')
      setOtpVerified(false)
      setOtpCode('')
      setOtpSent(false)
      
      await fetchUserLoans()
    } catch (error: any) {
      console.error('Error submitting loan application:', error)
      setSubmissionStatus('idle')
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit loan application. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle loan payment
  const handlePayLoan = async () => {
    if (!selectedLoanForPayment || !paymentAmount || !paymentAccountId) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please select a loan, enter payment amount, and choose an account.',
      })
      return
    }

    const amount = parseFloat(paymentAmount)
    if (amount <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid payment amount.',
      })
      return
    }

    // Check minimum payment requirement
    if (amount < selectedLoanForPayment.monthlyPayment) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Minimum Payment Required',
        message: `Minimum payment is ${formatCurrency(selectedLoanForPayment.monthlyPayment)}.`,
      })
      return
    }

    // Check if payment exceeds balance
    if (amount > selectedLoanForPayment.balance) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Amount Exceeds Balance',
        message: `Payment cannot exceed remaining balance of ${formatCurrency(selectedLoanForPayment.balance)}.`,
      })
      return
    }

    // Check account balance
    const selectedAccount = accounts.find(a => a.id === paymentAccountId)
    if (!selectedAccount || selectedAccount.balance < amount) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Insufficient Funds',
        message: `Account balance is ${formatCurrency(selectedAccount?.balance || 0)}. Insufficient funds for this payment.`,
      })
      return
    }

    setIsProcessingPayment(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Generate reference number
      const referenceNumber = generateReferenceNumber()
      const transactionDate = new Date().toISOString()

      // Create transaction record: "Loan Payment – REFXXXXX"
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            account_id: paymentAccountId,
            type: 'debit',
            category: 'Loan Payment',
            amount: amount,
            description: `Loan Payment – ${referenceNumber}`,
            status: 'completed',
            pending: false,
            date: transactionDate,
          },
        ])
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        throw transactionError
      }

      // Get the full loan data from database
      const { data: fullLoanData, error: loanFetchError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', selectedLoanForPayment.id)
        .single()

      if (loanFetchError || !fullLoanData) {
        throw new Error('Failed to fetch loan details')
      }

      const currentBalance = parseFloat(fullLoanData.balance_remaining?.toString() || '0')
      const currentTotalPaid = parseFloat(fullLoanData.total_paid?.toString() || '0')

      // Calculate new balance
      const newBalance = parseFloat((currentBalance - amount).toFixed(2))
      const newTotalPaid = parseFloat((currentTotalPaid + amount).toFixed(2))

      // Update loan balance and total paid
      const updateData: any = {
        balance_remaining: newBalance.toString(),
        total_paid: newTotalPaid.toString(),
      }

      // If fully paid, mark as completed
      if (newBalance <= 0) {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
        updateData.balance_remaining = '0'
      } else {
        // Update next payment date (30 days from now)
        const nextPaymentDate = new Date()
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30)
        updateData.next_payment_date = nextPaymentDate.toISOString().split('T')[0]
      }

      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', selectedLoanForPayment.id)

      if (loanUpdateError) {
        console.error('Error updating loan:', loanUpdateError)
        throw loanUpdateError
      }

      // Create loan payment record
      await supabase
        .from('loan_payments')
        .insert([
          {
            loan_id: selectedLoanForPayment.id,
            user_id: user.id,
            account_id: paymentAccountId,
            amount: amount,
            reference_number: referenceNumber,
            transaction_id: transactionData.id,
            payment_type: newBalance <= 0 ? 'final' : 'regular',
          },
        ])

      setNotification({
        isOpen: true,
        type: 'success',
        title: newBalance <= 0 ? 'Loan Paid Off!' : 'Payment Successful',
        message: newBalance <= 0
          ? `Congratulations! Your loan has been fully paid off. Reference: ${referenceNumber}`
          : `Payment of ${formatCurrency(amount)} processed successfully. Remaining balance: ${formatCurrency(newBalance)}. Reference: ${referenceNumber}`,
      })

      // Send email notifications (non-blocking)
      const { sendLoanPaymentNotification } = await import('@/lib/utils/emailNotifications')
      const loanTypeLabel = selectedLoanForPayment.loan_type === 'personal' ? 'Personal Loan' :
                           selectedLoanForPayment.loan_type === 'auto' ? 'Auto Loan' :
                           selectedLoanForPayment.loan_type === 'home' ? 'Home Loan' :
                           selectedLoanForPayment.loan_type === 'student' ? 'Student Loan' : 'Loan'
      
      sendLoanPaymentNotification(
        user.id,
        loanTypeLabel,
        amount,
        newBalance,
        referenceNumber
      ).catch(error => {
        console.error('Error sending loan payment email notification:', error)
        // Don't fail the payment if email fails
      })

      setShowPayModal(false)
      setSelectedLoanForPayment(null)
      setPaymentAmount('')
      setPaymentAccountId(accounts[0]?.id || '')
      await fetchUserLoans() // Refresh loans
    } catch (error: any) {
      console.error('Error processing payment:', error)
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: error.message || 'Failed to process payment. Please try again.',
      })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalPayment = monthlyPayment * parseInt(loanTerm)
  const totalInterest = totalPayment - parseFloat(loanAmount || '0')

  // Payment schedule data
  const paymentSchedule = Array.from({ length: Math.min(12, parseInt(loanTerm)) }, (_, i) => ({
    month: `Month ${i + 1}`,
    principal: monthlyPayment * 0.7,
    interest: monthlyPayment * 0.3,
  }))

  const totalLoanBalance = activeLoans.reduce((sum, loan) => sum + loan.balance, 0)
  const totalMonthlyPayment = activeLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
  const totalDisbursed = activeLoans.reduce((sum, loan) => sum + loan.disbursedAmount, 0)
  const totalPaid = activeLoans.reduce((sum, loan) => sum + loan.total_paid, 0)
  const totalApproved = activeLoans.reduce((sum, loan) => sum + loan.approvedAmount, 0)
  
  // Count statistics
  const totalLoansReceived = activeLoans.length // Loans that have been disbursed and are active
  const totalLoansApplied = userLoans.length // All loans applied for
  const totalLoansApproved = userLoans.filter(l => l.status === 'approved' || l.status === 'active').length
  const totalLoansCompleted = completedLoans.length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Loans & Credit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your loans and apply for new credit
          </p>
        </div>
        {!showApplication && (
          <button
            onClick={() => setShowApplication(true)}
            className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Apply for Loan
          </button>
        )}
      </div>

      {!showApplication ? (
        <>
          {/* Loan Statistics Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Loan Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Loans Applied</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLoansApplied}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Loans Received</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalLoansReceived}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved Loans</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalLoansApproved}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed Loans</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{totalLoansCompleted}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 shadow-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-green-700 dark:text-green-400" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wide">
                Amount Received
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">
                {formatCurrency(totalDisbursed)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                {totalLoansReceived} loan{totalLoansReceived !== 1 ? 's' : ''} received • Total disbursed
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-blue-700 dark:text-blue-400" />
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-semibold">
                  Paid
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-wide">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500">
                {totalDisbursed > 0 ? `${((totalPaid / totalDisbursed) * 100).toFixed(1)}% of received` : 'No payments yet'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-7 h-7 text-red-700 dark:text-red-400" />
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">
                  Remaining
                </span>
              </div>
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1 uppercase tracking-wide">
                Outstanding Balance
              </p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
                {formatCurrency(totalLoanBalance)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                {activeLoans.length} active loan{activeLoans.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-purple-700 dark:text-purple-400" />
                </div>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full font-semibold">
                  Monthly
                </span>
              </div>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 uppercase tracking-wide">
                Monthly Payment
              </p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                {formatCurrency(totalMonthlyPayment)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-500">
                Total across all loans
              </p>
            </div>
          </div>

          {/* Additional Stats Row */}
          {activeLoans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved Amount</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalApproved)}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Payoff Progress</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      {totalDisbursed > 0 ? `${((totalPaid / totalDisbursed) * 100).toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average Interest Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {((activeLoans.reduce((sum, loan) => sum + loan.interestRate, 0) / activeLoans.length) || 0).toFixed(2)}%
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
          )}

          {/* Pending Loans */}
          {pendingLoans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Applications</h2>
              <div className="space-y-4">
                {pendingLoans.map((loan) => {
                  const loanTypeData = loanTypes.find(t => t.id === loan.loan_type)
                  const Icon = loanTypeData?.icon || Briefcase
                  return (
                    <div key={loan.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: loanTypeData?.color + '20' }}>
                            <Icon className="w-6 h-6" style={{ color: loanTypeData?.color }} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{getLoanTypeName(loan.loan_type)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ref: {loan.reference_number}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Amount: {formatCurrency(parseFloat(loan.requested_amount?.toString() || '0'))}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Declined Loans */}
          {declinedLoans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Declined Applications</h2>
              <div className="space-y-4">
                {declinedLoans.map((loan) => {
                  const loanTypeData = loanTypes.find(t => t.id === loan.loan_type)
                  const Icon = loanTypeData?.icon || Briefcase
                  return (
                    <div key={loan.id} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: loanTypeData?.color + '20' }}>
                            <Icon className="w-6 h-6" style={{ color: loanTypeData?.color }} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{getLoanTypeName(loan.loan_type)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ref: {loan.reference_number}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Amount: {formatCurrency(parseFloat(loan.requested_amount?.toString() || '0'))}</p>
                            {loan.decline_reason && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Reason: {loan.decline_reason}</p>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                          Declined
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Approved but Not Disbursed Loans */}
          {approvedLoans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Approved Loans (Awaiting Disbursement)</h2>
              <div className="space-y-4">
                {approvedLoans.map((loan) => {
                  const loanTypeData = loanTypes.find(t => t.id === loan.loan_type)
                  const Icon = loanTypeData?.icon || Briefcase
                  return (
                    <div key={loan.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: loanTypeData?.color + '20' }}>
                            <Icon className="w-6 h-6" style={{ color: loanTypeData?.color }} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{getLoanTypeName(loan.loan_type)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ref: {loan.reference_number}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Approved Amount: {formatCurrency(parseFloat(loan.approved_amount?.toString() || loan.requested_amount?.toString() || '0'))}
                            </p>
                            {loan.approved_at && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Approved: {new Date(loan.approved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                          Awaiting Disbursement
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Loans */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Loans</h2>
            {activeLoans.length > 0 ? (
              activeLoans.map((loan) => {
              const Icon = loan.icon
              const payoffProgress = loan.disbursedAmount > 0 
                ? ((loan.disbursedAmount - loan.balance) / loan.disbursedAmount) * 100 
                : 0
              
              // Prepare payment history data for chart
              const paymentChartData = (loan.paymentHistory || [])
                .sort((a: any, b: any) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
                .map((payment: any, index: number) => {
                  const paymentDate = new Date(payment.payment_date)
                  const cumulativePaid = (loan.paymentHistory || [])
                    .slice(0, index + 1)
                    .reduce((sum: number, p: any) => sum + parseFloat(p.amount?.toString() || '0'), 0)
                  return {
                    date: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    amount: parseFloat(payment.amount?.toString() || '0'),
                    cumulativePaid,
                    balance: loan.originalAmount - cumulativePaid,
                  }
                })

              // Balance over time data
              const balanceHistory = [
                { date: 'Disbursed', balance: loan.originalAmount, label: 'Disbursed' },
                ...paymentChartData.map((p: any) => ({
                  date: p.date,
                  balance: p.balance,
                  label: p.date,
                })),
                { date: 'Now', balance: loan.balance, label: 'Current' },
              ]

              return (
                <div
                  key={loan.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: loan.color + '20' }}
                      >
                        <Icon className="w-7 h-7" style={{ color: loan.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getLoanTypeName(loan.type)}</h3>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ref: {loan.reference_number}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {loan.paymentsRemaining} payments remaining
                          </p>
                          {loan.disbursed_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              • Disbursed: {loan.disbursed_at.toLocaleDateString()}
                            </p>
                          )}
                          {loan.approved_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              • Approved: {loan.approved_at.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Loan Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wide">Amount Received</p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(loan.disbursedAmount)}
                      </p>
                      {loan.approvedAmount !== loan.requestedAmount && (
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                          Approved: {formatCurrency(loan.approvedAmount)}
                        </p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-wide">Total Paid</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                        {formatCurrency(loan.total_paid)}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                        {loan.disbursedAmount > 0 ? `${((loan.total_paid / loan.disbursedAmount) * 100).toFixed(1)}% paid` : '0%'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1 uppercase tracking-wide">Remaining Balance</p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-400">
                        {formatCurrency(loan.balance)}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                        {loan.paymentsRemaining} payments left
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 uppercase tracking-wide">Monthly Payment</p>
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                        {formatCurrency(loan.monthlyPayment)}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                        {loan.term} months term
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1 uppercase tracking-wide">Next Payment</p>
                      <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                        {loan.nextPaymentDate.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                        {(() => {
                          const days = Math.ceil((loan.nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          return days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Loan Summary Bar */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Approved Amount</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                          </p>
                          {loan.approvedAmount !== loan.requestedAmount && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Requested: {formatCurrency(loan.requestedAmount)}
                            </p>
                          )}
                        </div>
                        <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {loan.interestRate}% APR
                          </p>
                        </div>
                        <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Loan Purpose</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {loan.purpose || 'N/A'}
                          </p>
                        </div>
                        {loan.disbursed_at && (
                          <>
                            <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Disbursed Date</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {loan.disbursed_at.toLocaleDateString()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Payment History Chart */}
                    {paymentChartData.length > 0 && (
                  <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment History</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={paymentChartData}>
                            <defs>
                              <linearGradient id={`paymentGradient-${loan.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={loan.color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={loan.color} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                              }}
                              formatter={(value: any) => formatCurrency(value)}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="amount" 
                              stroke={loan.color} 
                              strokeWidth={2}
                              fill={`url(#paymentGradient-${loan.id})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Balance Over Time Chart */}
                    {balanceHistory.length > 1 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Balance Over Time</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={balanceHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                              }}
                              formatter={(value: any) => formatCurrency(value)}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              stroke={loan.color} 
                              strokeWidth={3}
                              dot={{ fill: loan.color, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Payoff Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Payoff Progress
                      </span>
                      <span className="text-sm font-bold" style={{ color: loan.color }}>
                        {payoffProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="h-4 rounded-full transition-all duration-500"
                        style={{
                          width: `${payoffProgress}%`,
                          backgroundColor: loan.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>Received: {formatCurrency(loan.disbursedAmount)}</span>
                      <span>Paid: {formatCurrency(loan.total_paid)}</span>
                      <span>Remaining: {formatCurrency(loan.balance)}</span>
                    </div>
                  </div>

                  {/* Payment History List */}
                  {(loan.paymentHistory || []).length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Payment History</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {loan.paymentHistory.length} payment{loan.paymentHistory.length !== 1 ? 's' : ''} total
                        </span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(loan.paymentHistory || []).slice(0, 10).map((payment: any, index: number) => {
                          const cumulativePaid = (loan.paymentHistory || [])
                            .slice(0, index + 1)
                            .reduce((sum: number, p: any) => sum + parseFloat(p.amount?.toString() || '0'), 0)
                          return (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                    {new Date(payment.payment_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Ref: {payment.reference_number}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                    Cumulative: {formatCurrency(cumulativePaid)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                  {formatCurrency(parseFloat(payment.amount?.toString() || '0'))}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {payment.payment_type === 'final' ? 'Final Payment' : 'Regular Payment'}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {(loan.paymentHistory || []).length > 10 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
                          Showing 10 of {loan.paymentHistory.length} payments
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => {
                        setSelectedLoanForPayment(loan)
                        setPaymentAmount(loan.monthlyPayment.toString())
                        setPaymentAccountId(accounts[0]?.id || '')
                        setShowPayModal(true)
                      }}
                      className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              )
            })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">No active loans</p>
                <p className="text-xs mt-1">Apply for a loan to get started</p>
              </div>
            )}
          </div>

          {/* Completed Loans */}
          {completedLoans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Completed Loans</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedLoans.length} paid off
                </span>
              </div>
              <div className="space-y-3">
                {completedLoans.slice(0, 5).map((loan) => {
                  const loanTypeData = loanTypes.find(t => t.id === loan.loan_type)
                  const Icon = loanTypeData?.icon || Briefcase
                  const totalPaid = parseFloat(loan.total_paid?.toString() || '0')
                  const approvedAmount = parseFloat(loan.approved_amount?.toString() || loan.requested_amount?.toString() || '0')
                  return (
                    <div key={loan.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: loanTypeData?.color + '20' }}>
                            <Icon className="w-6 h-6" style={{ color: loanTypeData?.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-gray-900 dark:text-white">{getLoanTypeName(loan.loan_type)}</p>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                Paid Off
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ref: {loan.reference_number}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="text-gray-600 dark:text-gray-400">
                                Received: <strong className="text-gray-900 dark:text-white">{formatCurrency(approvedAmount)}</strong>
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                Total Paid: <strong className="text-green-700 dark:text-green-400">{formatCurrency(totalPaid)}</strong>
                              </span>
                              {loan.completed_at && (
                                <span className="text-gray-600 dark:text-gray-400">
                                  Completed: <strong className="text-gray-900 dark:text-white">{new Date(loan.completed_at).toLocaleDateString()}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-700 dark:text-green-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
              {completedLoans.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
                  Showing 5 of {completedLoans.length} completed loans
                </p>
              )}
            </div>
          )}

          {/* Loan Options */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Available Loan Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loanTypes.map((loanType) => {
                const Icon = loanType.icon
                return (
                  <button
                    key={loanType.id}
                    onClick={() => {
                      setSelectedLoanType(loanType.id)
                      setShowApplication(true)
                    }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all text-left group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: loanType.color + '20' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: loanType.color }} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{loanType.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{loanType.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Up to <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(loanType.maxAmount)}</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        From <span className="font-semibold" style={{ color: loanType.color }}>{loanType.minRate}% APR</span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        /* Loan Application Form */
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Loan Application</h2>
            <button
              onClick={() => {
                setShowApplication(false)
                setApplicationStep(1)
                setSelectedLoanType(null)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Loading Animation Overlay */}
          {isSubmitting && submissionStatus !== 'idle' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 mb-6">
                    <Loader2 className="w-20 h-20 text-green-700 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {submissionStatus === 'uploading' && 'Uploading Documents...'}
                    {submissionStatus === 'processing' && 'Processing Application...'}
                    {submissionStatus === 'reviewing' && 'Reviewing Information...'}
                    {submissionStatus === 'submitted' && 'Application Submitted!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {submissionStatus === 'uploading' && 'Please wait while we upload your documents...'}
                    {submissionStatus === 'processing' && 'We\'re processing your loan application...'}
                    {submissionStatus === 'reviewing' && 'Final review in progress...'}
                    {submissionStatus === 'submitted' && 'Your application has been successfully submitted!'}
                  </p>
                  {submissionStatus === 'submitted' && (
                    <div className="mt-4">
                      <CheckCircle className="w-16 h-16 text-green-700 mx-auto animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-10 overflow-x-auto pb-4">
            {[
              { num: 1, label: 'Type' },
              { num: 2, label: 'Personal' },
              { num: 3, label: 'Employment' },
              { num: 4, label: 'Financial' },
              { num: 5, label: 'Documents' },
              { num: 6, label: 'Review' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all flex-shrink-0 ${
                      step.num === applicationStep
                        ? 'bg-green-700 text-white scale-110 shadow-lg'
                        : step.num < applicationStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.num < applicationStep ? <CheckCircle className="w-6 h-6" /> : step.num}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold text-center">
                    {step.label}
                  </p>
                </div>
                {index < 5 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all min-w-[20px] ${
                      step.num < applicationStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Loan Type */}
          {applicationStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Select Loan Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loanTypes.map((loanType) => {
                  const Icon = loanType.icon
                  return (
                    <button
                      key={loanType.id}
                      onClick={() => {
                        setSelectedLoanType(loanType.id)
                        setApplicationStep(2)
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all text-left ${
                        selectedLoanType === loanType.id
                          ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: loanType.color + '20' }}
                        >
                          <Icon className="w-7 h-7" style={{ color: loanType.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{loanType.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{loanType.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              Max: <strong>{formatCurrency(loanType.maxAmount)}</strong>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              From: <strong style={{ color: loanType.color }}>{loanType.minRate}% APR</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {applicationStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Verify your identity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Full Name <span className="text-red-500">*</span>
                </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="input-field"
                  />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Gender
                </label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  className="input-field"
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Home Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder="123 Main Street"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Identification Type <span className="text-red-500">*</span>
                </label>
                <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                  className="input-field"
                >
                    <option value="">Select ID type</option>
                    <option value="passport">Passport</option>
                    <option value="national-id">National ID</option>
                    <option value="driver-license">Driver's License</option>
                </select>
              </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter ID number"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    SSN / Tax ID
                  </label>
                  <input
                    type="text"
                    value={ssnTaxId}
                    onChange={(e) => setSsnTaxId(e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    className="input-field"
                  />
                </div>
              </div>

              {/* ID Upload Section */}
              <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileImage className="w-5 h-5" />
                  Upload Identification Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID Front */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ID Front <span className="text-red-500">*</span>
                    </label>
                    {idFrontPreview ? (
                      <div className="relative">
                        <img src={idFrontPreview} alt="ID Front" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => {
                            setIdFrontFile(null)
                            setIdFrontPreview(null)
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Click to upload</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or PDF (MAX. 10MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setNotification({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'File Too Large',
                                  message: 'File must be less than 10MB',
                                })
                                return
                              }
                              setIdFrontFile(file)
                              handleFilePreview(file, setIdFrontPreview)
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* ID Back */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ID Back <span className="text-red-500">*</span>
                    </label>
                    {idBackPreview ? (
                      <div className="relative">
                        <img src={idBackPreview} alt="ID Back" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => {
                            setIdBackFile(null)
                            setIdBackPreview(null)
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Click to upload</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or PDF (MAX. 10MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setNotification({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'File Too Large',
                                  message: 'File must be less than 10MB',
                                })
                                return
                              }
                              setIdBackFile(file)
                              handleFilePreview(file, setIdBackPreview)
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setApplicationStep(1)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setApplicationStep(3)}
                  disabled={!fullName || !dateOfBirth || !phoneNumber || !homeAddress || !city || !state || !country || !idType || !idNumber || !idFrontFile || !idBackFile}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Employment Information */}
          {applicationStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Employment Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Measure your ability to repay</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Employment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Employer / Business Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      placeholder="Company Name"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Software Engineer"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Employment Start Date
                  </label>
                  <input
                    type="date"
                    value={employmentStartDate}
                    onChange={(e) => setEmploymentStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Monthly Income <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="5000"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Annual Income
                  </label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      placeholder="60000"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Employer / Business Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={employerAddress}
                      onChange={(e) => setEmployerAddress(e.target.value)}
                      placeholder="123 Business Street"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Employer Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={employerPhone}
                      onChange={(e) => setEmployerPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setApplicationStep(2)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setApplicationStep(4)}
                  disabled={!employmentStatus || !monthlyIncome}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Financial Information */}
          {applicationStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Financial Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Income vs expenses</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Monthly Expenses <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(e.target.value)}
                      placeholder="3000"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Existing Loans
                  </label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={existingLoans}
                      onChange={(e) => setExistingLoans(e.target.value)}
                      placeholder="0"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Other Assets
                  </label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={otherAssets}
                      onChange={(e) => setOtherAssets(e.target.value)}
                      placeholder="0"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Preferred Repayment Method
                  </label>
                  <select
                    value={preferredRepaymentMethod}
                    onChange={(e) => setPreferredRepaymentMethod(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select method</option>
                    <option value="automatic-debit">Automatic Debit</option>
                    <option value="manual-payment">Manual Payment</option>
                    <option value="bank-transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Collateral (for secured loans)
                  </label>
                  <textarea
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    placeholder="Describe any collateral you're offering..."
                    rows={3}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setApplicationStep(3)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setApplicationStep(5)}
                  disabled={!monthlyExpenses}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Loan Details & Documents */}
          {applicationStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-orange-700 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loan Details & Documents</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Finalize your application</p>
                </div>
              </div>

              {/* Loan Details */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Loan Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Loan Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="0"
                        className="input-field pl-10 text-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Loan Purpose <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select purpose</option>
                      {purposes.map((purpose) => (
                        <option key={purpose} value={purpose}>{purpose}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Loan Term <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      className="input-field"
                    >
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="36">36 months</option>
                      <option value="48">48 months</option>
                      <option value="60">60 months</option>
                      <option value="72">72 months</option>
                    </select>
                  </div>
                </div>

                {/* Loan Calculator Preview */}
                {loanAmount && loanTerm && (
                  <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monthly Payment</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {formatCurrency(monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalInterest)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Payment</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalPayment)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Select Account to Receive Funds <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="input-field"
                >
                  {accounts.length === 0 ? (
                    <option>No accounts available</option>
                  ) : (
                    accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_type 
                          ? `${account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account - ${formatCurrency(account.balance)}`
                          : `Account - ${formatCurrency(account.balance)}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Documents Upload */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileImage className="w-5 h-5" />
                  Required Documents
                </h4>

                {/* Payslips */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payslips (1-3 months)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {payslipPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Payslip ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => {
                            const newFiles = [...payslipFiles]
                            const newPreviews = [...payslipPreviews]
                            newFiles.splice(index, 1)
                            newPreviews.splice(index, 1)
                            setPayslipFiles(newFiles)
                            setPayslipPreviews(newPreviews)
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {payslipPreviews.length < 3 && (
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add Payslip</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setNotification({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'File Too Large',
                                  message: 'File must be less than 10MB',
                                })
                                return
                              }
                              setPayslipFiles([...payslipFiles, file])
                              handleFilePreview(file, (url) => setPayslipPreviews([...payslipPreviews, url]))
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Bank Statements */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bank Statements (1-6 months)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {bankStatementPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Statement ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={() => {
                            const newFiles = [...bankStatementFiles]
                            const newPreviews = [...bankStatementPreviews]
                            newFiles.splice(index, 1)
                            newPreviews.splice(index, 1)
                            setBankStatementFiles(newFiles)
                            setBankStatementPreviews(newPreviews)
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {bankStatementPreviews.length < 6 && (
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add Statement</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                setNotification({
                                  isOpen: true,
                                  type: 'error',
                                  title: 'File Too Large',
                                  message: 'File must be less than 10MB',
                                })
                                return
                              }
                              setBankStatementFiles([...bankStatementFiles, file])
                              handleFilePreview(file, (url) => setBankStatementPreviews([...bankStatementPreviews, url]))
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Utility Bill */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Utility Bill / Proof of Address
                  </label>
                  {utilityBillPreview ? (
                    <div className="relative w-full md:w-1/2">
                      <img src={utilityBillPreview} alt="Utility Bill" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600" />
                      <button
                        onClick={() => {
                          setUtilityBillFile(null)
                          setUtilityBillPreview(null)
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full md:w-1/2 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Click to upload</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or PDF (MAX. 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setNotification({
                                isOpen: true,
                                type: 'error',
                                title: 'File Too Large',
                                message: 'File must be less than 10MB',
                              })
                              return
                            }
                            setUtilityBillFile(file)
                            handleFilePreview(file, setUtilityBillPreview)
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setApplicationStep(4)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setApplicationStep(6)}
                  disabled={!loanAmount || !loanPurpose || !selectedAccountId}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Review & Consent */}
          {applicationStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review & Consent</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Finalize your application</p>
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Application Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-600 dark:text-gray-400">Loan Type</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {loanTypes.find(t => t.id === selectedLoanType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-600 dark:text-gray-400">Loan Amount</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(loanAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-600 dark:text-gray-400">Purpose</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{loanPurpose}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-600 dark:text-gray-400">Term</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{loanTerm} months</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-800">
                    <span className="text-gray-600 dark:text-gray-400">Account to Receive Funds</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        const account = accounts.find(a => a.id === selectedAccountId)
                        return account?.account_type 
                          ? `${account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account`
                          : 'Not Selected'
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 pt-4">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">Monthly Payment</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(monthlyPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consent & Agreements */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Consent & Agreements
                </h4>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 text-green-700 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Terms & Conditions</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">I agree to the terms and conditions of the loan agreement</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={creditCheckAccepted}
                      onChange={(e) => setCreditCheckAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 text-green-700 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Credit Check Authorization</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">I authorize the bank to perform a credit check</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={repaymentPolicyAccepted}
                      onChange={(e) => setRepaymentPolicyAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 text-green-700 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Repayment Policy</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">I understand and agree to the repayment policy</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Digital Signature */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Digital Signature <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="Type your full name as signature"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">By typing your name, you are providing your digital signature</p>
              </div>

              {/* OTP Verification */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">OTP Verification</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Verify your identity with OTP</p>
                  </div>
                  {otpVerified && (
                    <CheckCircle2 className="w-6 h-6 text-green-700" />
                  )}
                </div>
                {!otpSent ? (
                  <button
                    onClick={sendOTP}
                    className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-all"
                  >
                    Send OTP
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="flex-1 input-field text-center text-2xl font-bold tracking-widest"
                      />
                    </div>
                    {!otpVerified && (
                      <button
                        onClick={verifyOTP}
                        disabled={otpCode.length !== 6}
                        className="w-full px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                      >
                        Verify OTP
                      </button>
                    )}
                    <button
                      onClick={sendOTP}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all text-sm"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900 dark:text-yellow-300">
                  Your application will be reviewed within 24-48 hours. You'll receive an email notification once approved.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setApplicationStep(5)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || !termsAccepted || !creditCheckAccepted || !repaymentPolicyAccepted || !digitalSignature || !otpVerified || !selectedAccountId}
                  className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && selectedLoanForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Loan</h2>
                <button
                  onClick={() => {
                    setShowPayModal(false)
                    setSelectedLoanForPayment(null)
                    setPaymentAmount('')
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Loan Details</p>
                <p className="font-bold text-blue-700 dark:text-blue-400">
                  {getLoanTypeName(selectedLoanForPayment.type)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Ref: {selectedLoanForPayment.reference_number}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Remaining Balance: {formatCurrency(selectedLoanForPayment.balance)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Minimum Payment: {formatCurrency(selectedLoanForPayment.monthlyPayment)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={selectedLoanForPayment.monthlyPayment.toString()}
                    min={selectedLoanForPayment.monthlyPayment}
                    max={selectedLoanForPayment.balance}
                    step="0.01"
                    className="input-field pl-10 text-xl font-bold"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setPaymentAmount(selectedLoanForPayment.monthlyPayment.toString())}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Min: {formatCurrency(selectedLoanForPayment.monthlyPayment)}
                  </button>
                  <button
                    onClick={() => setPaymentAmount(selectedLoanForPayment.balance.toString())}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Pay Full: {formatCurrency(selectedLoanForPayment.balance)}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Pay From Account
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="input-field"
                >
                  {accounts.length === 0 ? (
                    <option>No accounts available</option>
                  ) : (
                    accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_type 
                          ? `${account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account - ${formatCurrency(account.balance)}`
                          : `Account - ${formatCurrency(account.balance)}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {paymentAmount && parseFloat(paymentAmount) > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">New Balance After Payment</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(Math.max(0, selectedLoanForPayment.balance - parseFloat(paymentAmount || '0')))}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowPayModal(false)
                  setSelectedLoanForPayment(null)
                  setPaymentAmount('')
                }}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePayLoan}
                disabled={isProcessingPayment || !paymentAmount || !paymentAccountId || parseFloat(paymentAmount || '0') < selectedLoanForPayment.monthlyPayment}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Make Payment
                  </>
                )}
              </button>
            </div>
          </div>
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
    </div>
  )
}
