'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Card {
  id: string
  user_id: string
  account_id: string
  card_number: string
  card_network: 'visa' | 'mastercard' | 'amex'
  cardholder_name: string
  expiration_month: string
  expiration_year: string
  cvv: string
  billing_address: string | null
  status: 'active' | 'blocked' | 'expired' | 'cancelled'
  is_virtual: boolean
  created_at: string
  updated_at: string
  last_used_at: string | null
  last4?: string
  account_balance?: number
  // Joined data
  account_type?: string
  account_number?: string
}

export interface CardTransaction {
  id: string
  card_id: string
  user_id: string
  account_id: string
  transaction_id: string | null
  transaction_type: string
  amount: number
  merchant_name: string | null
  location: string | null
  reference_number: string
  created_at: string
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCards()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('cards_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id || '')}`,
        },
        () => {
          fetchCards()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchCards = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      // First, get user's accounts to ensure cards exist for each account type
      const { data: userAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, account_type, balance')
        .eq('user_id', user.id)

      if (accountsError) {
        throw accountsError
      }

      // Ensure cards exist for each account type
      if (userAccounts && userAccounts.length > 0) {
        // Get user profile for cardholder name and billing address
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, address, city, state, country, zip_code')
          .eq('id', user.id)
          .single()

        for (const account of userAccounts) {
          // Check if card already exists for this specific account (one card per account)
          const { data: existingCard } = await supabase
            .from('cards')
            .select('id')
            .eq('account_id', account.id)
            .neq('status', 'cancelled')
            .limit(1)
            .single()

          // If card doesn't exist, create it
          if (!existingCard) {
            // Generate card details
            const cardNetwork = Math.random() < 0.5 ? 'visa' : 'mastercard'
            const last4 = Math.floor(1000 + Math.random() * 9000).toString()
            
            // Generate card number based on account type
            let cardNumberPrefix = '4000'
            switch (account.account_type) {
              case 'checking':
                cardNumberPrefix = '4532'
                break
              case 'savings':
                cardNumberPrefix = '5123'
                break
              case 'fixed-deposit':
                cardNumberPrefix = '5555'
                break
              case 'business':
                cardNumberPrefix = '4111'
                break
            }
            
            const cardNumber = cardNumberPrefix + 
              Math.floor(1000000000000 + Math.random() * 9000000000000).toString().slice(0, 12) + 
              last4

            // Generate expiration (2-5 years from now)
            const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
            const expYear = String((new Date().getFullYear() + Math.floor(Math.random() * 3) + 2) % 100).padStart(2, '0')
            const cvv = Math.floor(100 + Math.random() * 900).toString()

            // Cardholder name
            const cardholderName = userProfile 
              ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
              : 'Cardholder'

            // Billing address
            const billingAddress = userProfile
              ? `${userProfile.address || ''}, ${userProfile.city || ''}, ${userProfile.state || ''} ${userProfile.zip_code || ''}, ${userProfile.country || ''}`.trim()
              : ''

            // Create the card
            const { error: createError } = await supabase
              .from('cards')
              .insert([
                {
                  user_id: user.id,
                  account_id: account.id,
                  account_type: account.account_type,
                  card_number: cardNumber,
                  card_network: cardNetwork,
                  cardholder_name: cardholderName,
                  expiration_month: expMonth,
                  expiration_year: expYear,
                  cvv: cvv,
                  billing_address: billingAddress || null,
                  status: 'active',
                  is_virtual: true,
                  last4: last4,
                },
              ])

            if (createError) {
              console.error('Error creating card:', createError)
            }
          }
        }
      }

      // Fetch cards with account information
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select(`
          *,
          accounts:account_id (
            account_type,
            account_number,
            balance
          )
        `)
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })

      if (cardsError) {
        throw cardsError
      }

      // Create a map of account types to balances
      const accountBalanceMap = new Map(
        (userAccounts || []).map(acc => [acc.account_type, parseFloat(acc.balance?.toString() || '0')])
      )

      // Transform the data to include account info
      const transformedCards = (cardsData || []).map((card: any) => {
        const cardAccountType = card.account_type || card.accounts?.account_type || ''
        const accountBalance = accountBalanceMap.get(cardAccountType) || 0
        
        return {
          ...card,
          account_type: cardAccountType,
          account_number: card.accounts?.account_number || '',
          account_balance: accountBalance,
          // Ensure last4 exists
          last4: card.last4 || (card.card_number ? card.card_number.slice(-4) : ''),
        }
      })

      setCards(transformedCards as Card[])
    } catch (err: any) {
      console.error('Error fetching cards:', err)
      setError(err.message || 'Failed to fetch cards')
    } finally {
      setLoading(false)
    }
  }

  const refreshCards = () => {
    fetchCards()
  }

  return {
    cards,
    loading,
    error,
    refreshCards,
  }
}

export function useCardTransactions(cardId?: string) {
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cardId) {
      fetchCardTransactions(cardId)
    }
  }, [cardId])

  const fetchCardTransactions = async (cardId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const { data, error: transactionsError } = await supabase
        .from('card_transactions')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (transactionsError) {
        throw transactionsError
      }

      const transformedTransactions = (data || []).map((txn: any) => ({
        ...txn,
        amount: parseFloat(txn.amount.toString()),
      }))

      setTransactions(transformedTransactions as CardTransaction[])
    } catch (err: any) {
      console.error('Error fetching card transactions:', err)
      setError(err.message || 'Failed to fetch card transactions')
    } finally {
      setLoading(false)
    }
  }

  return {
    transactions,
    loading,
    error,
    refreshTransactions: () => cardId && fetchCardTransactions(cardId),
  }
}

