'use client'

import { CheckCircle, X, Copy, Clock, Building2, User, Wallet, Mail, Phone, Globe, DollarSign } from 'lucide-react'
import { formatCurrency, maskAccountNumber } from '@/lib/utils'
import { useState } from 'react'

interface TransferSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  transferType: 'internal' | 'external' | 'p2p' | 'wire'
  transferDetails: {
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
    recipientEmail?: string
    recipientPhone?: string
    routingNumber?: string
    accountNumber?: string
    bankName?: string
    swiftCode?: string
    referenceNumber: string
    date: string
    memo?: string
    purpose?: string
    currency?: string
    transferType?: string
    beneficiaryName?: string
  }
}

export default function TransferSuccessModal({
  isOpen,
  onClose,
  transferType,
  transferDetails,
}: TransferSuccessModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const getTransferTypeIcon = () => {
    switch (transferType) {
      case 'internal':
        return <Wallet className="w-6 h-6" />
      case 'external':
        return <Building2 className="w-6 h-6" />
      case 'p2p':
        return <User className="w-6 h-6" />
      case 'wire':
        return <Globe className="w-6 h-6" />
      default:
        return <Wallet className="w-6 h-6" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with Centered Success Icon */}
        <div className="px-6 pt-8 pb-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{getTransferTypeLabel()} Successful!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction completed successfully</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount and Key Details - Horizontal Layout */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Amount */}
            <div className="text-center py-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                {transferType === 'wire' && transferDetails.fees ? 'Total Amount' : 'Transfer Amount'}
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(transferDetails.totalAmount || transferDetails.amount)}
              </p>
              {transferType === 'wire' && transferDetails.fees && (
                <div className="mt-2 pt-2 border-t border-green-300 dark:border-green-700 text-xs">
                  <div className="flex justify-between px-2">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transferDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between px-2 mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Fees:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transferDetails.fees)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reference Number */}
            <div className="flex flex-col justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Reference</p>
                    <p className="font-mono font-bold text-blue-900 dark:text-blue-300 text-sm truncate">
                      {transferDetails.referenceNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(transferDetails.referenceNumber)}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex-shrink-0"
                  title="Copy reference number"
                >
                  <Copy className={`w-4 h-4 ${copied ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Transfer Details - Grid Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* From Account */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-green-700 dark:text-green-400" />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">From Account</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">{transferDetails.fromAccount.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{transferDetails.fromAccount.number}</p>
            </div>

            {/* To Account/Recipient */}
            {transferType === 'internal' && transferDetails.toAccount && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">To Account</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">{transferDetails.toAccount.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{transferDetails.toAccount.number}</p>
              </div>
            )}

            {transferType === 'p2p' && (
              <>
                {transferDetails.recipientEmail && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recipient Email</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{transferDetails.recipientEmail}</p>
                  </div>
                )}
                {transferDetails.recipientPhone && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recipient Phone</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{transferDetails.recipientPhone}</p>
                  </div>
                )}
              </>
            )}

            {(transferType === 'external' || transferType === 'wire') && (
              <>
                {transferType === 'wire' && transferDetails.beneficiaryName && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Beneficiary</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{transferDetails.beneficiaryName}</p>
                  </div>
                )}
                {transferDetails.bankName && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-orange-700 dark:text-orange-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Bank Name</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{transferDetails.bankName}</p>
                  </div>
                )}
                {transferDetails.accountNumber && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Number</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{maskAccountNumber(transferDetails.accountNumber)}</p>
                  </div>
                )}
                {transferDetails.routingNumber && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Routing Number</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{maskAccountNumber(transferDetails.routingNumber)}</p>
                  </div>
                )}
                {transferType === 'wire' && transferDetails.swiftCode && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-violet-700 dark:text-violet-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">SWIFT Code</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{transferDetails.swiftCode}</p>
                  </div>
                )}
                {transferType === 'wire' && transferDetails.currency && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Currency</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{transferDetails.currency}</p>
                  </div>
                )}
              </>
            )}

            {/* Date and Memo Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-xs">
                  {new Date(transferDetails.date).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {transferDetails.memo && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Memo</p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">{transferDetails.memo}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

