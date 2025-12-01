'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { Calculator, Home, TrendingUp, DollarSign, PiggyBank, ArrowRight, Info } from 'lucide-react'

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<string | null>(null)

  const calculators = [
    {
      id: 'mortgage',
      title: 'Mortgage Calculator',
      icon: Home,
      description: 'Calculate your monthly mortgage payment',
      color: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'
    },
    {
      id: 'loan',
      title: 'Loan Calculator',
      icon: TrendingUp,
      description: 'Estimate monthly loan payments',
      color: 'from-green-500 to-emerald-600',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    },
    {
      id: 'savings',
      title: 'Savings Calculator',
      icon: PiggyBank,
      description: 'See how your savings can grow',
      color: 'from-purple-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
    },
    {
      id: 'retirement',
      title: 'Retirement Calculator',
      icon: DollarSign,
      description: 'Plan for your retirement',
      color: 'from-orange-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop'
    }
  ]

  const MortgageCalculator = () => {
    const [loanAmount, setLoanAmount] = useState('300000')
    const [interestRate, setInterestRate] = useState('6.5')
    const [loanTerm, setLoanTerm] = useState('30')
    const [downPayment, setDownPayment] = useState('60000')

    const principal = parseFloat(loanAmount) - parseFloat(downPayment)
    const monthlyRate = parseFloat(interestRate) / 100 / 12
    const numPayments = parseFloat(loanTerm) * 12

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    const totalInterest = (monthlyPayment * numPayments) - principal
    const totalPayment = monthlyPayment * numPayments

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mortgage Payment Calculator</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Home Price ($)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="300000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Down Payment ($)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="60000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="6.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Loan Term (years)</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="30">30 years</option>
              </select>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl p-8 shadow-lg border-2 border-green-200 dark:border-green-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              Payment Summary
            </h4>
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Monthly Payment</span>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${monthlyPayment.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-green-200 dark:border-green-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Interest</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-green-200 dark:border-green-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Payment</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${totalPayment.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4 inline mr-1" />
                  This calculator provides estimates only. Actual rates and payments may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const LoanCalculator = () => {
    const [loanAmount, setLoanAmount] = useState('10000')
    const [interestRate, setInterestRate] = useState('8.5')
    const [loanTerm, setLoanTerm] = useState('36')

    const principal = parseFloat(loanAmount) || 0
    const monthlyRate = (parseFloat(interestRate) || 0) / 100 / 12
    const numPayments = parseFloat(loanTerm) || 1

    const monthlyPayment = principal > 0 && monthlyRate > 0 && numPayments > 0
      ? principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0
    const totalInterest = (monthlyPayment * numPayments) - principal
    const totalPayment = monthlyPayment * numPayments

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Payment Calculator</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Loan Amount ($)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="8.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Loan Term (months)</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="12">12 months (1 year)</option>
                <option value="24">24 months (2 years)</option>
                <option value="36">36 months (3 years)</option>
                <option value="48">48 months (4 years)</option>
                <option value="60">60 months (5 years)</option>
                <option value="72">72 months (6 years)</option>
                <option value="84">84 months (7 years)</option>
              </select>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl p-8 shadow-lg border-2 border-green-200 dark:border-green-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              Payment Summary
            </h4>
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Monthly Payment</span>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${monthlyPayment.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-green-200 dark:border-green-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Interest</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-green-200 dark:border-green-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Payment</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${totalPayment.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4 inline mr-1" />
                  This calculator provides estimates only. Actual rates and payments may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SavingsCalculator = () => {
    const [initialDeposit, setInitialDeposit] = useState('1000')
    const [monthlyContribution, setMonthlyContribution] = useState('100')
    const [interestRate, setInterestRate] = useState('2.5')
    const [years, setYears] = useState('10')

    const principal = parseFloat(initialDeposit) || 0
    const monthlyDeposit = parseFloat(monthlyContribution) || 0
    const annualRate = (parseFloat(interestRate) || 0) / 100
    const numYears = parseFloat(years) || 0
    const monthlyRate = annualRate / 12
    const numMonths = numYears * 12

    // Future value calculation: FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
    let futureValue = 0
    if (monthlyRate > 0) {
      const compoundPrincipal = principal * Math.pow(1 + monthlyRate, numMonths)
      const futureValueOfAnnuity = monthlyDeposit * ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate)
      futureValue = compoundPrincipal + futureValueOfAnnuity
    } else {
      futureValue = principal + (monthlyDeposit * numMonths)
    }

    const totalContributions = principal + (monthlyDeposit * numMonths)
    const totalInterest = futureValue - totalContributions

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Growth Calculator</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Initial Deposit ($)</label>
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Contribution ($)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Period (years)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="10"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl p-8 shadow-lg border-2 border-purple-200 dark:border-purple-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Savings Summary
            </h4>
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Future Value</span>
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ${futureValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-purple-200 dark:border-purple-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Contributions</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${totalContributions.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-purple-200 dark:border-purple-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Total Interest Earned</span>
                <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                  ${totalInterest.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4 inline mr-1" />
                  This calculator assumes monthly compounding. Actual results may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const RetirementCalculator = () => {
    const [currentAge, setCurrentAge] = useState('30')
    const [retirementAge, setRetirementAge] = useState('65')
    const [currentSavings, setCurrentSavings] = useState('50000')
    const [monthlyContribution, setMonthlyContribution] = useState('500')
    const [expectedReturn, setExpectedReturn] = useState('7')
    const [retirementWithdrawal, setRetirementWithdrawal] = useState('4000')

    const age = parseFloat(currentAge) || 0
    const retireAge = parseFloat(retirementAge) || 0
    const savings = parseFloat(currentSavings) || 0
    const monthly = parseFloat(monthlyContribution) || 0
    const annualReturn = (parseFloat(expectedReturn) || 0) / 100
    const monthlyReturn = annualReturn / 12
    const yearsToRetire = retireAge - age
    const monthsToRetire = yearsToRetire * 12

    // Calculate future value of current savings
    const futureValueOfSavings = savings > 0 && monthlyReturn > 0
      ? savings * Math.pow(1 + monthlyReturn, monthsToRetire)
      : savings

    // Calculate future value of monthly contributions
    const futureValueOfContributions = monthly > 0 && monthlyReturn > 0
      ? monthly * ((Math.pow(1 + monthlyReturn, monthsToRetire) - 1) / monthlyReturn)
      : monthly * monthsToRetire

    const totalRetirementSavings = futureValueOfSavings + futureValueOfContributions

    // Calculate how long retirement savings will last
    const monthlyWithdrawal = parseFloat(retirementWithdrawal) || 0
    const withdrawalRate = monthlyReturn > 0 ? monthlyReturn : 0.01 / 12
    let monthsRetirementWillLast = 0
    if (monthlyWithdrawal > 0 && totalRetirementSavings > 0) {
      if (withdrawalRate > 0) {
        monthsRetirementWillLast = Math.log(1 + (totalRetirementSavings * withdrawalRate) / monthlyWithdrawal) / Math.log(1 + withdrawalRate)
      } else {
        monthsRetirementWillLast = totalRetirementSavings / monthlyWithdrawal
      }
    }
    const yearsRetirementWillLast = monthsRetirementWillLast / 12

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Retirement Planning Calculator</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Age</label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Retirement Age</label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="65"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Retirement Savings ($)</label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Contribution ($)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Annual Return (%)</label>
              <input
                type="number"
                step="0.1"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="7"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Withdrawal in Retirement ($)</label>
              <input
                type="number"
                value={retirementWithdrawal}
                onChange={(e) => setRetirementWithdrawal(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="4000"
              />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl p-8 shadow-lg border-2 border-orange-200 dark:border-orange-800">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              Retirement Summary
            </h4>
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Retirement Savings at {retirementAge}</span>
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    ${totalRetirementSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-orange-200 dark:border-orange-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Years Until Retirement</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  {yearsToRetire} years
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-orange-200 dark:border-orange-800">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Savings Will Last</span>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  {yearsRetirementWillLast > 0 ? `${yearsRetirementWillLast.toFixed(1)} years` : 'N/A'}
                </span>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4 inline mr-1" />
                  This calculator provides estimates. Consult a financial advisor for personalized planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop"
            alt="Financial Calculators"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/85 to-green-900/90 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold mb-6">
            <Calculator className="w-4 h-4" />
            <span>Financial Tools</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Financial Calculators
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Make informed financial decisions with our easy-to-use calculators
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4</div>
              <div className="text-indigo-100 text-sm font-medium">Financial Calculators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-indigo-100 text-sm font-medium">Free to Use</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-indigo-100 text-sm font-medium">Available Online</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Easy</div>
              <div className="text-indigo-100 text-sm font-medium">Simple & Accurate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Options */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Choose a Calculator</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select a calculator to get started with your financial planning
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {calculators.map((calc) => {
              const Icon = calc.icon
              return (
                <button
                  key={calc.id}
                  onClick={() => setActiveCalculator(calc.id)}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl hover:scale-105 ${
                    activeCalculator === calc.id
                      ? 'border-green-500 dark:border-green-500 ring-2 ring-green-500/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${calc.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{calc.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{calc.description}</p>
                </button>
              )
            })}
          </div>

          {/* Active Calculator Display */}
          {activeCalculator === 'mortgage' && <MortgageCalculator />}
          {activeCalculator === 'loan' && <LoanCalculator />}
          {activeCalculator === 'savings' && <SavingsCalculator />}
          {activeCalculator === 'retirement' && <RetirementCalculator />}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Need Help with Your Calculations?</h2>
          <p className="text-xl text-green-100 mb-8">Speak with one of our financial advisors</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
            Contact an Advisor
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}

