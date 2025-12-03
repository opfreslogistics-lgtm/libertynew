'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import NotificationModal from '@/components/NotificationModal'
import { extractCheckData, type CheckData } from '@/lib/utils/checkOCR'
import {
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
  FileText,
  Shield,
  Clock,
  DollarSign,
  Image as ImageIcon,
  RotateCw,
  Check,
  AlertTriangle,
  Download,
  Eye,
  Smartphone,
  Banknote,
  Scan,
} from 'lucide-react'
import clsx from 'clsx'

type DepositStep = 'account' | 'amount' | 'photos' | 'review' | 'processing' | 'complete'

export default function MobileDepositPage() {
  const { accounts, refreshAccounts } = useAccounts() // No loading state - accounts appear immediately
  const [currentStep, setCurrentStep] = useState<DepositStep>('photos')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [backImage, setBackImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [showLimits, setShowLimits] = useState(false)
  const [photoAnimation, setPhotoAnimation] = useState<'front' | 'back' | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [currentPhotoType, setCurrentPhotoType] = useState<'front' | 'back'>('front')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState({
    stage: '',
    progress: 0,
  })
  const [ocrResults, setOcrResults] = useState<{
    front?: CheckData
    back?: CheckData
  }>({})
  const [showOCRResults, setShowOCRResults] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({
    currentStep: 0,
    progress: 0,
    stage: '',
  })
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
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const depositLimits = {
    perCheque: 5000,
    daily: 10000,
    monthly: 25000,
    dailyUsed: 0,
    monthlyUsed: 0,
  }

  const steps = [
    { id: 'photos', label: 'Scan Check', icon: Camera },
    { id: 'account', label: 'Account', icon: Banknote },
    { id: 'review', label: 'Review', icon: Eye },
  ]

  const getStepIndex = (step: DepositStep) => {
    const stepOrder: DepositStep[] = ['photos', 'account', 'review', 'processing', 'complete']
    return stepOrder.indexOf(step)
  }

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (typeof window !== 'undefined' && window.innerWidth < 768)
      setIsMobile(isMobileDevice)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Start camera when entering photos step (only on mobile)
  useEffect(() => {
    if (currentStep === 'photos' && isMobile) {
      if (!frontImage) {
        setCurrentPhotoType('front')
        // Small delay to ensure component is mounted
        const timer = setTimeout(() => {
          startCamera()
        }, 100)
        return () => {
          clearTimeout(timer)
          stopCamera()
        }
      } else if (!backImage) {
        setCurrentPhotoType('back')
        // Small delay to ensure component is mounted
        const timer = setTimeout(() => {
          startCamera()
        }, 100)
        return () => {
          clearTimeout(timer)
          stopCamera()
        }
      } else if (frontImage && backImage && !isProcessingOCR) {
        // Both images captured, auto-advance to account selection
        const timer = setTimeout(() => {
          setCurrentStep('account')
        }, 1000)
        return () => clearTimeout(timer)
      }
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, frontImage, backImage, isMobile, isProcessingOCR])

  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      setCameraError('Unable to access camera. Please check permissions.')
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Camera Access Denied',
        message: 'Please allow camera access to take photos of your cheque.',
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9)

    // Trigger animation
    setPhotoAnimation(currentPhotoType)
    
    // Stop camera
    stopCamera()

    // Set the image after animation delay
    setTimeout(() => {
      if (currentPhotoType === 'front') {
        setFrontImage(imageData)
      } else {
        setBackImage(imageData)
      }
      // Clear animation
      setTimeout(() => setPhotoAnimation(null), 600)
    }, 300)
    
    // Process OCR on both front and back images
    processCheckOCR(imageData, currentPhotoType)
  }

  const processCheckOCR = async (imageData: string, type: 'front' | 'back') => {
    // Small delay before showing popup for smooth appearance
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setIsProcessingOCR(true)
    setOcrProgress({ stage: 'Initializing scanner...', progress: 0 })
    
    try {
      // Different stages for front vs back
      const stages = type === 'front' ? [
        { stage: 'Analyzing image quality...', progress: 10 },
        { stage: 'Detecting check boundaries...', progress: 25 },
        { stage: 'Extracting text...', progress: 40 },
        { stage: 'Reading amount...', progress: 60 },
        { stage: 'Reading routing number...', progress: 75 },
        { stage: 'Verifying data...', progress: 90 },
      ] : [
        { stage: 'Analyzing image quality...', progress: 10 },
        { stage: 'Detecting check boundaries...', progress: 25 },
        { stage: 'Extracting text...', progress: 40 },
        { stage: 'Verifying endorsement...', progress: 60 },
        { stage: 'Reading signature...', progress: 75 },
        { stage: 'Verifying data...', progress: 90 },
      ]
      
      // Show progress stages with slower, smoother transitions
      for (const stageInfo of stages) {
        setOcrProgress(stageInfo)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Slower: 1 second between stages
      }
      
      // Perform actual OCR
      const checkData = await extractCheckData(imageData)
      setOcrResults(prev => ({ ...prev, [type]: checkData }))
      
      setOcrProgress({ stage: 'Complete!', progress: 100 })
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Auto-fill amount if found (only from front)
      if (type === 'front' && checkData.amount) {
        setAmount(checkData.amount)
        setShowOCRResults(true)
      }
      
      // Smooth fade out
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('OCR processing error:', error)
      setOcrProgress({ stage: 'Scan complete', progress: 100 })
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Don't show error to user, OCR is optional
    } finally {
      setIsProcessingOCR(false)
      setOcrProgress({ stage: '', progress: 0 })
    }
  }

  const retakePhoto = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontImage(null)
      setCurrentPhotoType('front')
      setOcrResults(prev => ({ ...prev, front: undefined }))
      setAmount('')
      setShowOCRResults(false)
    } else {
      setBackImage(null)
      setCurrentPhotoType('back')
      setOcrResults(prev => ({ ...prev, back: undefined }))
    }
    // Reset file input
    setFileInputKey(prev => prev + 1)
    // Small delay before restarting camera (mobile only)
    if (isMobile) {
      setTimeout(() => {
        startCamera()
      }, 100)
    }
  }

  const handleFileUpload = async (type: 'front' | 'back', file: File) => {
    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageData = reader.result as string
      
      // Trigger animation
      setPhotoAnimation(type)
      
      // Set the image after animation delay
      setTimeout(() => {
      if (type === 'front') {
          setFrontImage(imageData)
      } else {
          setBackImage(imageData)
        }
        // Clear animation
        setTimeout(() => setPhotoAnimation(null), 600)
      }, 300)
      
      // Process OCR on both front and back images
      processCheckOCR(imageData, type)
    }
    reader.readAsDataURL(file)
  }

  const currentStepIndex = getStepIndex(currentStep)


  const handleSubmit = async () => {
    if (!selectedAccount || !amount || !frontImage || !backImage) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please complete all steps before submitting.',
      })
      return
    }

    setCurrentStep('processing')
    setIsProcessing(true)
    setProcessingProgress({ currentStep: 0, progress: 0, stage: 'Initializing...' })
    
    try {
      // Progressive scanning steps
      const processingSteps = [
        { currentStep: 1, stage: 'Verifying cheque authenticity...', progress: 20 },
        { currentStep: 2, stage: 'Checking image quality...', progress: 40 },
        { currentStep: 3, stage: 'Processing MICR data...', progress: 60 },
        { currentStep: 4, stage: 'Validating endorsement...', progress: 80 },
        { currentStep: 5, stage: 'Finalizing deposit...', progress: 95 },
      ]

      // Show progressive steps
      for (const stepInfo of processingSteps) {
        setProcessingProgress(stepInfo)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second between steps
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Generate reference number
      const refNum = `REF${Math.floor(100000 + Math.random() * 900000)}`
      setReferenceNumber(refNum)

      // Generate deposit_id (format: MD-YYYYMMDD-XXXXXX)
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const randomPart = Math.floor(100000 + Math.random() * 900000).toString()
      const depositId = `MD-${year}${month}${day}-${randomPart}`

      setProcessingProgress({ currentStep: 5, progress: 100, stage: 'Complete!' })
      await new Promise(resolve => setTimeout(resolve, 800))

      // Create mobile deposit record
      const { data: depositData, error: depositError } = await supabase
        .from('mobile_deposits')
        .insert([
          {
            user_id: user.id,
            account_id: selectedAccount,
            deposit_id: depositId,
            reference_number: refNum,
            amount: parseFloat(amount),
            front_image_url: frontImage, // Store as base64 for now
            back_image_url: backImage, // Store as base64 for now
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (depositError) throw depositError

      // Create transaction record with MD format
      const transactionDate = new Date().toISOString()
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            account_id: selectedAccount,
            type: 'credit',
            category: 'Mobile Deposit',
            amount: parseFloat(amount),
            description: `MD – ${refNum}`,
            status: 'pending', // Will be updated when admin approves
            pending: true, // Pending until admin approval
            date: transactionDate,
          },
        ])
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        // Don't fail the deposit if transaction creation fails, but log it
      } else {
        // Link transaction to deposit
        await supabase
          .from('mobile_deposits')
          .update({ transaction_id: transactionData.id })
          .eq('id', depositData.id)
      }

      // Create notification
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            type: 'transaction',
            title: 'Mobile Deposit Submitted',
            message: `Your mobile deposit of ${formatCurrency(parseFloat(amount))} has been submitted and is pending review. Reference: ${refNum}`,
            read: false,
          },
        ])

      // Send email notifications (non-blocking)
      const { sendMobileDepositNotification } = await import('@/lib/utils/emailNotifications')
      const selectedAccountData = accounts.find(acc => acc.id === selectedAccount)
      const accountType = selectedAccountData?.account_type || 'account'
      
      sendMobileDepositNotification(
        user.id,
        parseFloat(amount),
        accountType,
        refNum,
        depositId
      ).catch(error => {
        console.error('Error sending mobile deposit email notification:', error)
        // Don't fail the deposit if email fails
      })

      setIsProcessing(false)
      setCurrentStep('complete')
    } catch (error: any) {
      console.error('Error submitting deposit:', error)
      setIsProcessing(false)
      setCurrentStep('review')
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Deposit Failed',
        message: error.message || 'Failed to submit deposit. Please try again.',
      })
    }
  }

  const resetDeposit = () => {
    setCurrentStep('photos')
    setSelectedAccount('')
    setAmount('')
    setFrontImage(null)
    setBackImage(null)
    setReferenceNumber('')
    setOcrResults({})
    setShowOCRResults(false)
    setCurrentPhotoType('front')
    setProcessingProgress({ currentStep: 0, progress: 0, stage: '' })
  }

  const selectedAcc = accounts.find(acc => acc.id === selectedAccount)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Mobile Cheque Deposit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deposit cheques instantly from your phone
          </p>
        </div>
        <button
          onClick={() => setShowLimits(true)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-sm font-semibold"
        >
          <Info className="w-4 h-4" />
          Deposit Limits
        </button>
      </div>

      {/* Info Banner */}
      {currentStep !== 'complete' && currentStep !== 'processing' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Quick & Secure Deposits
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Deposit cheques 24/7 without visiting a branch. Funds typically available within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {currentStep !== 'complete' && currentStep !== 'processing' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = getStepIndex(step.id as DepositStep) < currentStepIndex
              const isCurrent = step.id === currentStep
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all mb-2',
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-green-700 text-white scale-110'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <p
                      className={clsx(
                        'text-xs font-semibold text-center',
                        isCurrent
                          ? 'text-green-700 dark:text-green-400'
                          : isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                  {!isLast && (
                    <div
                      className={clsx(
                        'h-1 flex-1 mx-2 rounded transition-all',
                        isCompleted
                          ? 'bg-green-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Step 1: Photos (Front & Back Combined) */}
        {currentStep === 'photos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentPhotoType === 'front' ? 'Capture Front of Cheque' : 'Capture Back of Cheque'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentPhotoType === 'front' 
                  ? 'Position the front of your cheque in the frame and tap capture'
                  : 'Endorse the back, then position it in the frame and tap capture'}
              </p>
            </div>

            {/* Camera Preview or File Upload or Captured Image */}
            {((currentPhotoType === 'front' && !frontImage) || (currentPhotoType === 'back' && !backImage)) ? (
              <div className="space-y-4">
                {/* Mobile: Show camera preview */}
                {isMobile ? (
                  <>
                    {cameraError ? (
                      <div className="w-full max-w-md mx-auto aspect-[4/3] max-h-[300px] border-2 border-red-300 dark:border-red-700 rounded-xl flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-6">
                        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white mb-2">
                            Camera Access Required
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {cameraError}
                          </p>
            <button
                            onClick={startCamera}
                            className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold transition-all"
            >
                            Try Again
            </button>
          </div>
                      </div>
                    ) : cameraActive ? (
                  <div className="relative w-full max-w-md mx-auto aspect-[4/3] max-h-[300px] rounded-xl overflow-hidden bg-black border-2 border-gray-300 dark:border-gray-600">
                    {/* Live Camera Feed */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => {
                        // Ensure video plays
                        if (videoRef.current) {
                          videoRef.current.play().catch(console.error)
                        }
                      }}
                    />
                    
                    {/* Camera Overlay with Guide */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner guides */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
                      
                      {/* Center guide text */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                          <p className="text-white text-sm font-semibold">
                            Align cheque here
              </p>
            </div>
              </div>
            </div>

                    {/* Capture Animation Overlay */}
                    {photoAnimation === currentPhotoType && (
                      <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center animate-ping">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-scale-in shadow-2xl">
                          <CheckCircle className="w-16 h-16 text-white" />
            </div>
              </div>
            )}

                    {/* Capture Button */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button
                        onClick={capturePhoto}
                        disabled={photoAnimation === currentPhotoType}
                        className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
              </button>
            </div>

                    {/* Cancel/Close Camera Button */}
              <button
                      onClick={stopCamera}
                      className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full text-white transition-all"
              >
                      <X className="w-5 h-5" />
              </button>
                  </div>
                ) : (
                      <div className="w-full max-w-md mx-auto aspect-[4/3] max-h-[300px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-pulse">
                          <Camera className="w-8 h-8 text-green-700 dark:text-green-400" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">
                            Starting Camera...
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Please allow camera access
                          </p>
            </div>
          </div>
        )}
                  </>
                ) : (
                  /* Desktop: Show file upload styled as capture */
                  <div className="relative w-full max-w-md mx-auto aspect-[4/3] max-h-[300px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                    {/* Upload area with capture button styling */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                          Capture Photo
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click the button below to select an image
              </p>
            </div>

                      {/* Hidden file input */}
                <input
                        key={fileInputKey}
                        ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(currentPhotoType, file)
                          }
                  }}
                  className="hidden"
                />
                      
                      {/* Capture button that triggers file input */}
                <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                  </div>
                </button>
                    </div>

                    {/* Capture Animation Overlay */}
                    {photoAnimation === currentPhotoType && (
                      <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center animate-ping z-10">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-scale-in shadow-2xl">
                          <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Corner guides (same as camera) */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gray-400/60 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gray-400/60 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gray-400/60 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gray-400/60 rounded-br-lg" />
                    </div>
                  </div>
                )}

                {/* Hidden canvas for capturing (mobile only) */}
                {isMobile && <canvas ref={canvasRef} className="hidden" />}

                {/* Tips */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Tips for best results:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Place on flat surface',
                      'Use good lighting',
                      'All corners visible',
                      'Keep camera steady',
                    ].map((tip, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-400">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Endorsement reminder for back */}
                {currentPhotoType === 'back' && frontImage && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                          Don't forget to endorse!
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-400">
                          Write on the back: Your signature, "For Mobile Deposit Only", and "Liberty Bank"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Show captured image */
              <div className="space-y-4">
                <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-green-600 animate-fade-in">
                  <img 
                    src={currentPhotoType === 'front' ? frontImage! : backImage!} 
                    alt={`${currentPhotoType === 'front' ? 'Front' : 'Back'} of cheque`} 
                    className="w-full max-h-[300px] object-contain bg-gray-50 dark:bg-gray-900" 
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => retakePhoto(currentPhotoType)}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg flex items-center gap-2"
                      title="Retake photo"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span className="text-sm font-semibold">Retake</span>
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 p-3 bg-green-600/95 backdrop-blur-sm text-white rounded-lg shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                      <p className="text-sm font-semibold">
                        {currentPhotoType === 'front' ? 'Front' : 'Back'} captured successfully!
                      </p>
                </div>
                  </div>
                </div>

                {/* Next step prompt */}
                {currentPhotoType === 'front' && frontImage && !backImage && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                          Front photo captured!
                        </p>
                        <p className="text-xs text-green-800 dark:text-green-400">
                          Now flip the cheque, endorse the back, and we'll capture it next.
                  </p>
                </div>
                      <button
                        onClick={() => {
                          setCurrentPhotoType('back')
                          setFileInputKey(prev => prev + 1)
                          if (isMobile) {
                            setTimeout(() => startCamera(), 300)
                          }
                        }}
                        className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                frontImage 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                {frontImage ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                <span className="text-sm font-semibold">Front</span>
              </div>
              <div className="h-0.5 w-8 bg-gray-300 dark:bg-gray-600" />
              <div className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                backImage 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                {backImage ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                <span className="text-sm font-semibold">Back</span>
              </div>
            </div>

            {/* OCR Processing Overlay */}
            {isProcessingOCR && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-500 ease-out animate-scale-in">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Scan className="w-10 h-10 text-green-700 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Scanning Check
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-all duration-500">
                        {ocrProgress.stage || 'Processing...'}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-green-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${ocrProgress.progress}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {ocrProgress.progress >= 10 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Image quality verified</span>
                        </div>
                      )}
                      {ocrProgress.progress >= 25 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Check boundaries detected</span>
                        </div>
                      )}
                      {ocrProgress.progress >= 40 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Text extracted</span>
                        </div>
                      )}
                      {ocrProgress.progress >= 60 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Amount identified</span>
                        </div>
                      )}
                      {ocrProgress.progress >= 75 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Bank details read</span>
                        </div>
                      )}
                      {ocrProgress.progress >= 90 && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Data verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  stopCamera()
                  // Don't allow going back if OCR is processing
                  if (!isProcessingOCR) {
                    // Reset if going back
                    if (frontImage && backImage) {
                      // Already completed, just go back
                    }
                  }
                }}
                disabled={isProcessingOCR}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={() => {
                  stopCamera()
                  if (frontImage && backImage) {
                    setCurrentStep('account')
                  }
                }}
                disabled={!frontImage || !backImage || isProcessingOCR}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {frontImage && backImage ? 'Continue' : 'Capture Both Sides'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Account Selection (with Amount from OCR) */}
        {currentStep === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Deposit Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose which account to deposit the cheque into
              </p>
            </div>

            {/* OCR Results Banner */}
            {showOCRResults && ocrResults.front && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                      Check Information Detected
                    </p>
                    <div className="space-y-1 text-sm text-green-800 dark:text-green-400">
                      {ocrResults.front.amount && (
                        <p>Amount: <span className="font-semibold">{formatCurrency(parseFloat(ocrResults.front.amount))}</span></p>
                      )}
                      {ocrResults.front.routingNumber && (
                        <p>Routing: •••{ocrResults.front.routingNumber.slice(-4)}</p>
                      )}
                      {ocrResults.front.checkNumber && (
                        <p>Check #: {ocrResults.front.checkNumber}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Display/Edit */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Deposit Amount
              </label>
                <input
                type="text"
                value={amount}
                  onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '')
                  setAmount(value)
                }}
                placeholder="0.00"
                className="w-full px-4 py-3 text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              {amount && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {formatCurrency(parseFloat(amount) || 0)}
                </p>
              )}
                  </div>

            {/* Account Selection */}
            <div className="space-y-3">
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">No accounts available</p>
              </div>
            ) : (
                accounts.map((account) => {
                  const accountTypeLabel = account.account_type === 'fixed-deposit' 
                    ? 'Fixed Deposit' 
                    : account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)
                  
                  return (
                    <button
                      key={account.id}
                      onClick={() => setSelectedAccount(account.id)}
                      className={clsx(
                        'w-full p-4 rounded-xl border-2 transition-all text-left',
                        selectedAccount === account.id
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {accountTypeLabel} Account
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ••••{account.last4}
                          </p>
                  </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
                    </button>
                  )
                })
            )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCurrentStep('photos')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedAccount && amount) {
                    setCurrentStep('review')
                  }
                }}
                disabled={!selectedAccount || !amount}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Review Deposit
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verify all information before submitting
              </p>
            </div>

            <div className="space-y-4">
              {/* Deposit Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deposit to:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedAcc ? (selectedAcc.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedAcc.account_type.charAt(0).toUpperCase() + selectedAcc.account_type.slice(1)) + ' Account' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ••••{selectedAcc?.last4}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(parseFloat(amount))}
                  </span>
                </div>
              </div>

              {/* Images Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Front
                  </p>
                  <div className="w-full h-[300px] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  <img
                    src={frontImage!}
                    alt="Front"
                      className="w-full h-full object-contain"
                  />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Back
                  </p>
                  <div className="w-full h-[300px] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  <img
                    src={backImage!}
                    alt="Back"
                      className="w-full h-full object-contain"
                  />
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Keep Your Cheque
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Please keep the physical cheque for 15 days after deposit. Do not destroy it until the deposit is fully processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('account')}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Scan className="w-5 h-5" />
                Submit Deposit
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {currentStep === 'processing' && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Scan className="w-10 h-10 text-green-700 dark:text-green-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Your Deposit
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-all duration-500">
              {processingProgress.stage || 'Please wait while we verify your cheque...'}
            </p>
            
            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${processingProgress.progress}%` }}
                />
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              {[
                { text: 'Verifying cheque authenticity', progress: 20 },
                { text: 'Checking image quality', progress: 40 },
                { text: 'Processing MICR data', progress: 60 },
                { text: 'Validating endorsement', progress: 80 },
                { text: 'Finalizing deposit', progress: 95 },
              ].map((step, index) => {
                const isCompleted = processingProgress.progress >= step.progress
                const isCurrent = processingProgress.progress >= step.progress - 10 && processingProgress.progress < step.progress + 10
                
                return (
                  <div
                    key={index}
                    className={clsx(
                      'flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-500',
                      isCompleted ? 'opacity-100' : isCurrent ? 'opacity-70' : 'opacity-30'
                    )}
                    style={{ 
                      animationDelay: `${index * 0.2}s`,
                      transform: isCompleted ? 'translateX(0)' : 'translateX(-10px)'
                    }}
                  >
                    <div className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500',
                      isCompleted 
                        ? 'bg-green-600' 
                        : isCurrent
                        ? 'bg-green-400 animate-pulse'
                        : 'bg-gray-400'
                    )}>
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                      )}
                    </div>
                    <p className={clsx(
                      'text-sm transition-all duration-500',
                      isCompleted 
                        ? 'text-gray-900 dark:text-white font-semibold' 
                        : isCurrent
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 dark:text-gray-500'
                    )}>
                      {step.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Complete */}
        {currentStep === 'complete' && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-700 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Deposit Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your cheque has been received and is being processed
            </p>

            <div className="max-w-md mx-auto space-y-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference Number:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(parseFloat(amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedAcc ? (selectedAcc.account_type === 'fixed-deposit' ? 'Fixed Deposit' : selectedAcc.account_type.charAt(0).toUpperCase() + selectedAcc.account_type.slice(1)) + ' Account' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold">
                    Pending Credit
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-left">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Funds Availability
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Funds will typically be available within 1-2 business days. You'll receive a notification once processed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={resetDeposit}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
              >
                Make Another Deposit
              </button>
              <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all flex items-center gap-2">
                <Download className="w-5 h-5" />
                Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Limits Modal */}
      {showLimits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Limits</h2>
              <button
                onClick={() => setShowLimits(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Per Cheque</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(depositLimits.perCheque)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Limit</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(depositLimits.daily)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(depositLimits.dailyUsed / depositLimits.daily) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Used: {formatCurrency(depositLimits.dailyUsed)} today
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Limit</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(depositLimits.monthly)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(depositLimits.monthlyUsed / depositLimits.monthly) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Used: {formatCurrency(depositLimits.monthlyUsed)} this month
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLimits(false)}
              className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-all"
            >
              Got It
            </button>
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

