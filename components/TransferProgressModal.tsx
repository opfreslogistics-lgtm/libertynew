'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, Lock, AlertCircle, X } from 'lucide-react'
import { formatCurrency, maskAccountNumber } from '@/lib/utils'

type CodeType = 'IMF' | 'COT' | 'TAN'

interface RequiredCode {
  type: CodeType
  value: string
  enabled: boolean
}

interface TransferProgressModalProps {
  isProcessing: boolean
  isComplete: boolean
  transferType: 'internal' | 'external' | 'p2p' | 'wire'
  transferDetails?: {
    amount: number
    fees?: number
    totalAmount?: number
    fromAccount: {
      name: string
      number: string
      type: string
    }
    toAccount?: {
      name: string
      number: string
      type?: string
    }
    referenceNumber: string
    date: string
  }
  requiredCodes?: RequiredCode[]
  showCodeForm?: boolean
  onCodeSubmit?: (code: string, codeType: CodeType) => Promise<boolean>
  onCodeCancel?: () => void
  onClose: () => void
}

export default function TransferProgressModal({
  isProcessing,
  isComplete,
  transferType,
  transferDetails,
  requiredCodes = [],
  showCodeForm = false,
  onCodeSubmit,
  onCodeCancel,
  onClose,
}: TransferProgressModalProps) {
  const [progress, setProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  
  // Code form state
  const [currentCodeStep, setCurrentCodeStep] = useState(0)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [validatedCodes, setValidatedCodes] = useState<string[]>([])
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [isProcessingAfterCode, setIsProcessingAfterCode] = useState(false)
  
  const enabledCodes = requiredCodes.filter(code => code.enabled)
  const currentCode = enabledCodes[currentCodeStep]

  // Generate particles for animation
  useEffect(() => {
    if (isProcessing && !isComplete) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.1,
      }))
      setParticles(newParticles)
    }
  }, [isProcessing, isComplete])

  // Progress animation
  useEffect(() => {
    if (isProcessing && !isComplete) {
      setProgress(0)
      setShowSuccess(false)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95
          return prev + Math.random() * 3
        })
      }, 200)
      return () => clearInterval(interval)
    } else if (isComplete) {
      // Complete the progress bar
      setProgress(100)
      // Wait for progress animation, then show success
      setTimeout(() => {
        setShowSuccess(true)
      }, 500)
    }
  }, [isProcessing, isComplete])

  const getTransferTypeLabel = () => {
    switch (transferType) {
      case 'internal':
        return 'Internal Transfer'
      case 'external':
        return 'External Transfer'
      case 'p2p':
        return 'Peer-to-Peer Transfer'
      case 'wire':
        return 'Wire Transfer'
      default:
        return 'Transfer'
    }
  }

  // Reset code form when it's shown - MUST be before any conditional returns
  useEffect(() => {
    if (showCodeForm && enabledCodes.length > 0) {
      setCurrentCodeStep(0)
      setCodeInput('')
      setCodeError('')
      setValidatedCodes([])
      setIsValidatingCode(false)
      // Auto-focus input
      setTimeout(() => {
        const input = document.getElementById('code-input-modal')
        if (input) input.focus()
      }, 100)
    }
  }, [showCodeForm, enabledCodes.length])

  // Show modal if processing, showing code form, processing after code, or if complete
  if (!isProcessing && !showCodeForm && !isProcessingAfterCode && !isComplete) return null


  const handleCodeValidate = async () => {
    if (!currentCode || !onCodeSubmit) return

    setCodeError('')
    setShowErrorAnimation(false)
    
    if (!codeInput.trim()) {
      setCodeError(`Please enter your ${currentCode.type} code`)
      return
    }

    setIsValidatingCode(true)
    
    // Wait a bit to show loading animation
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Validate the code
    const isValid = await onCodeSubmit(codeInput.trim(), currentCode.type)
    
    if (!isValid) {
      setIsValidatingCode(false)
      setCodeError(`Invalid ${currentCode.type} code. Please try again.`)
      setCodeInput('')
      
      // Trigger error animations
      setShowErrorAnimation(true)
      setTimeout(() => setShowErrorAnimation(false), 600)
      
      // Show processing for 10 seconds after incorrect code
      setIsProcessingAfterCode(true)
      await new Promise(resolve => setTimeout(resolve, 10000))
      setIsProcessingAfterCode(false)
      
      return
    }

    // Code is valid - show processing for 10 seconds
    setIsValidatingCode(false)
    setValidatedCodes(prev => [...prev, currentCode.type])
    setIsProcessingAfterCode(true)
    await new Promise(resolve => setTimeout(resolve, 10000))
    setIsProcessingAfterCode(false)

    // Check if there are more codes to validate
    if (currentCodeStep < enabledCodes.length - 1) {
      // Move to next code after processing
      setCurrentCodeStep(prev => prev + 1)
      setCodeInput('')
      setCodeError('')
      setTimeout(() => {
        const input = document.getElementById('code-input-modal')
        if (input) input.focus()
      }, 100)
    } else {
      // All codes validated - show final processing for 10 seconds
      setIsProcessingAfterCode(true)
      await new Promise(resolve => setTimeout(resolve, 10000))
      setIsProcessingAfterCode(false)
      
      // Notify parent that all codes are done - it will execute transfer
      await new Promise(resolve => setTimeout(resolve, 500))
      if (onCodeSubmit) {
        await onCodeSubmit('', currentCode.type)
      }
    }
  }

  const handleCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidatingCode) {
      handleCodeValidate()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {showCodeForm && enabledCodes.length > 0 && !isProcessingAfterCode ? (
          /* Code Form State - Matches Processing Modal Design */
          <div className="p-12">
            <div className="flex flex-col items-center justify-center">
              {/* Code Icon - Similar to Processing Icon */}
              <div className="relative w-32 h-32 mb-8">
                {/* Outer ring similar to processing */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900/30">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"
                    style={{ animationDuration: '1s' }}
                  />
                </div>
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    {isValidatingCode ? (
                      <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : (
                      <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Transaction Verification
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Please enter your verification code to proceed
              </p>

              {/* Progress Bar */}
              {enabledCodes.length > 1 && (
                <div className="w-full max-w-xs mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {enabledCodes.map((code, index) => (
                      <div
                        key={code.type}
                        className={`flex-1 flex items-center ${
                          index < enabledCodes.length - 1 ? 'mr-2' : ''
                        }`}
                      >
                        <div
                          className={`flex-1 h-2 rounded-full ${
                            validatedCodes.includes(code.type)
                              ? 'bg-green-500'
                              : index === currentCodeStep
                              ? 'bg-blue-600'
                              : index < currentCodeStep
                              ? 'bg-green-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                        {index < enabledCodes.length - 1 && (
                          <div
                            className={`w-2 h-2 rounded-full mx-1 ${
                              index < currentCodeStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Input Form */}
              {!isValidatingCode ? (
                <div className="w-full max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 text-center">
                      Enter Your {currentCode?.type} Code
                    </label>
                    <div className="relative">
                      <input
                        id="code-input-modal"
                        type="text"
                        value={codeInput}
                        onChange={(e) => {
                          setCodeInput(e.target.value)
                          setCodeError('')
                          setShowErrorAnimation(false)
                        }}
                        onKeyPress={handleCodeKeyPress}
                        placeholder={`Enter your ${currentCode?.type} code`}
                        className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-white text-center text-lg font-mono tracking-wider transition-all ${
                          codeError
                            ? 'border-red-500 focus:ring-red-500 ' + (showErrorAnimation ? 'animate-shake bg-red-50 dark:bg-red-900/20' : '')
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        autoFocus
                        disabled={isValidatingCode}
                      />
                      {codeError && (
                        <div className={`mt-2 p-3 rounded-xl transition-all ${
                          showErrorAnimation ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 animate-pulse' : ''
                        }`}>
                          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className={`w-4 h-4 ${showErrorAnimation ? 'animate-pulse' : ''}`} />
                            <span>{codeError}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onCodeCancel}
                      className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCodeValidate}
                      disabled={!codeInput.trim() || isValidatingCode}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      Verify & Continue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Verifying {currentCode?.type} Code...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please wait while we validate your code
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (isProcessingAfterCode || (!showSuccess && (isProcessing || !isComplete))) ? (
          /* Processing State */
          <div className="p-12">
            <div className="flex flex-col items-center justify-center">
              {/* Animated Circle with Particles */}
              <div className="relative w-32 h-32 mb-8">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900/30">
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"
                    style={{ animationDuration: '1s' }}
                  />
                </div>
                
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-green-500 dark:text-green-400"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
                  />
                </svg>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                </div>

                {/* Flowing particles */}
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      animationDelay: `${particle.delay}s`,
                      animationDuration: '2s',
                    }}
                  />
                ))}
              </div>

              {/* Progress text */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Processing {getTransferTypeLabel()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please wait while we process your transaction...
              </p>

              {/* Progress percentage */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="p-12">
            <div className="flex flex-col items-center justify-center">
              {/* Success Icon with Animation */}
              <div className="relative w-32 h-32 mb-8">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 bg-green-300/30 dark:bg-green-600/30 rounded-full animate-pulse" />
                
                {/* Success circle */}
                <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-scale-in">
                  <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>
              </div>

              {/* Success text */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 animate-fade-in">
                {getTransferTypeLabel()} Successful!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Transaction completed successfully
              </p>

              {/* Transfer Details */}
              {transferDetails && (
                <div className="w-full max-w-md space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  {/* Amount */}
                  <div className="text-center py-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                      Transfer Amount
                    </p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(transferDetails.totalAmount || transferDetails.amount)}
                    </p>
                  </div>

                  {/* Account Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">From</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{transferDetails.fromAccount.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{transferDetails.fromAccount.number}</p>
                    </div>
                    {transferDetails.toAccount && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">To</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{transferDetails.toAccount.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{transferDetails.toAccount.number}</p>
                      </div>
                    )}
                  </div>

                  {/* Reference Number */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Reference</p>
                    <p className="font-mono font-bold text-blue-900 dark:text-blue-300 text-sm">
                      {transferDetails.referenceNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
                style={{ animationDelay: '0.3s' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

