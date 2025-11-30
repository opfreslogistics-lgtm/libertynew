import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Get the current user's session to verify they are an admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: No authorization header' }, { status: 401 })
    }

    // Verify the user is an admin using the service role key
    const token = authHeader.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token format' }, { status: 401 })
    }
    
    // Create a client with the token to verify
    const { createClient: createClientSSR } = await import('@supabase/supabase-js')
    const supabaseWithToken = createClientSSR(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseWithToken.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    // Check if user is admin using service role to bypass RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      role,
      accountTypes,
      // Address fields
      address,
      city,
      state,
      zipCode,
      country,
      // Personal information
      dateOfBirth,
      gender,
      maritalStatus,
      ssn,
      nationality,
      // Employment information
      employmentStatus,
      employerName,
      jobTitle,
      employmentYears,
      annualIncome,
      monthlyIncome,
      // Financial information
      creditScore,
      totalAssets,
      monthlyExpenses,
      // Security questions
      securityQuestion1,
      securityAnswer1,
      securityQuestion2,
      securityAnswer2,
      securityQuestion3,
      securityAnswer3,
      preferredLanguage,
      referralSource,
      marketingConsent,
    } = body

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields: firstName, lastName, username, email, and password are required' }, { status: 400 })
    }

    // Validate employment_status against CHECK constraint if provided
    if (employmentStatus && employmentStatus !== null && employmentStatus !== '') {
      const validEmploymentStatuses = ['employed', 'self-employed', 'unemployed', 'student', 'retired', 'other']
      if (!validEmploymentStatuses.includes(employmentStatus.trim())) {
        return NextResponse.json({ 
          error: `Invalid employment status. Must be one of: ${validEmploymentStatuses.join(', ')}` 
        }, { status: 400 })
      }
    }

    // Validate gender against CHECK constraint if provided
    if (gender && gender !== null && gender !== '') {
      const validGenders = ['male', 'female', 'other', 'prefer-not-to-say']
      if (!validGenders.includes(gender.trim())) {
        return NextResponse.json({ 
          error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` 
        }, { status: 400 })
      }
    }

    // Validate marital_status against CHECK constraint if provided
    if (maritalStatus && maritalStatus !== null && maritalStatus !== '') {
      const validMaritalStatuses = ['single', 'married', 'divorced', 'widowed', 'separated']
      if (!validMaritalStatuses.includes(maritalStatus.trim())) {
        return NextResponse.json({ 
          error: `Invalid marital status. Must be one of: ${validMaritalStatuses.join(', ')}` 
        }, { status: 400 })
      }
    }

    // Validate account types limit (max 3)
    if (accountTypes && Array.isArray(accountTypes) && accountTypes.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 account types allowed' }, { status: 400 })
    }

    // Helper function to sanitize values for CHECK constraints
    const sanitizeConstraintValue = (value: any, validValues: string[]): string | null => {
      if (!value || value === null || value === undefined) return null
      const strValue = String(value).trim()
      if (strValue === '' || strValue === 'null') return null
      return validValues.includes(strValue) ? strValue : null
    }

    // Sanitize constraint fields
    const sanitizedEmploymentStatus = sanitizeConstraintValue(employmentStatus, 
      ['employed', 'self-employed', 'unemployed', 'student', 'retired', 'other'])
    const sanitizedGender = sanitizeConstraintValue(gender, 
      ['male', 'female', 'other', 'prefer-not-to-say'])
    const sanitizedMaritalStatus = sanitizeConstraintValue(maritalStatus, 
      ['single', 'married', 'divorced', 'widowed', 'separated'])

    // Check if username is taken
    const { data: existingUser } = await supabaseAdmin
      .from('user_profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Check if email is taken
    const { data: existingEmail } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Create auth user
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        username: username.toLowerCase(),
        phone: phone || null,
      },
    })

    if (createAuthError || !authData.user) {
      return NextResponse.json({ error: createAuthError?.message || 'Failed to create user' }, { status: 400 })
    }

    // Check if profile already exists (might be created by trigger)
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle()

    let profileCreateError = null

    if (existingProfile) {
      // Profile already exists, update it instead
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          username: username.toLowerCase(),
          phone: phone || null,
          role: role || 'user',
          kyc_status: 'pending',
          // Address fields
          address: address && address.trim() ? address.trim() : null,
          city: city && city.trim() ? city.trim() : null,
          state: state && state.trim() ? state.trim() : null,
          zip_code: zipCode && zipCode.trim() ? zipCode.trim() : null,
          country: country && country.trim() ? country.trim() : 'United States',
          // Personal information
          date_of_birth: dateOfBirth && dateOfBirth.trim() ? dateOfBirth : null,
          gender: sanitizedGender,
          marital_status: sanitizedMaritalStatus,
          ssn: ssn && ssn.trim() ? ssn.trim() : null,
          nationality: nationality && nationality.trim() ? nationality.trim() : null,
          // Employment information - Use sanitized value
          employment_status: sanitizedEmploymentStatus,
          employer_name: employerName && employerName.trim() ? employerName.trim() : null,
          job_title: jobTitle && jobTitle.trim() ? jobTitle.trim() : null,
          employment_years: employmentYears ? parseInt(employmentYears) : null,
          annual_income: annualIncome ? parseFloat(annualIncome.toString()) : null,
          monthly_income: monthlyIncome ? parseFloat(monthlyIncome.toString()) : null,
          // Financial information
          credit_score: creditScore ? parseInt(creditScore.toString()) : null,
          total_assets: totalAssets ? parseFloat(totalAssets.toString()) : null,
          monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses.toString()) : null,
          // Security questions
          security_question_1: securityQuestion1 && securityQuestion1.trim() ? securityQuestion1.trim() : null,
          security_answer_1: securityAnswer1 && securityAnswer1.trim() ? securityAnswer1.trim() : null,
          security_question_2: securityQuestion2 && securityQuestion2.trim() ? securityQuestion2.trim() : null,
          security_answer_2: securityAnswer2 && securityAnswer2.trim() ? securityAnswer2.trim() : null,
          security_question_3: securityQuestion3 && securityQuestion3.trim() ? securityQuestion3.trim() : null,
          security_answer_3: securityAnswer3 && securityAnswer3.trim() ? securityAnswer3.trim() : null,
          preferred_language: preferredLanguage && preferredLanguage.trim() ? preferredLanguage.trim() : 'en',
          referral_source: referralSource && referralSource.trim() ? referralSource.trim() : null,
          marketing_consent: marketingConsent === true || marketingConsent === 'true',
          // Signup completion fields
          signup_step: 6, // Complete signup
          signup_complete: true,
          account_status: 'active',
          otp_enabled_login: true, // Enable OTP by default for security
        })
        .eq('id', authData.user.id)

      profileCreateError = updateError
    } else {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            email: email.toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            username: username.toLowerCase(),
            phone: phone || null,
            role: role || 'user',
            kyc_status: 'pending',
            // Address fields
            address: address && address.trim() ? address.trim() : null,
            city: city && city.trim() ? city.trim() : null,
            state: state && state.trim() ? state.trim() : null,
            zip_code: zipCode && zipCode.trim() ? zipCode.trim() : null,
            country: country && country.trim() ? country.trim() : 'United States',
            // Personal information
            date_of_birth: dateOfBirth && dateOfBirth.trim() ? dateOfBirth : null,
            gender: sanitizedGender,
            marital_status: sanitizedMaritalStatus,
            ssn: ssn && ssn.trim() ? ssn.trim() : null,
            nationality: nationality && nationality.trim() ? nationality.trim() : null,
            // Employment information - Use sanitized value
            employment_status: sanitizedEmploymentStatus,
            employer_name: employerName && employerName.trim() ? employerName.trim() : null,
            job_title: jobTitle && jobTitle.trim() ? jobTitle.trim() : null,
            employment_years: employmentYears ? parseInt(employmentYears) : null,
            annual_income: annualIncome ? parseFloat(annualIncome.toString()) : null,
            monthly_income: monthlyIncome ? parseFloat(monthlyIncome.toString()) : null,
            // Financial information
            credit_score: creditScore ? parseInt(creditScore.toString()) : null,
            total_assets: totalAssets ? parseFloat(totalAssets.toString()) : null,
            monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses.toString()) : null,
            // Security questions
            security_question_1: securityQuestion1 && securityQuestion1.trim() ? securityQuestion1.trim() : null,
            security_answer_1: securityAnswer1 && securityAnswer1.trim() ? securityAnswer1.trim() : null,
            security_question_2: securityQuestion2 && securityQuestion2.trim() ? securityQuestion2.trim() : null,
            security_answer_2: securityAnswer2 && securityAnswer2.trim() ? securityAnswer2.trim() : null,
            security_question_3: securityQuestion3 && securityQuestion3.trim() ? securityQuestion3.trim() : null,
            security_answer_3: securityAnswer3 && securityAnswer3.trim() ? securityAnswer3.trim() : null,
            preferred_language: preferredLanguage && preferredLanguage.trim() ? preferredLanguage.trim() : 'en',
            referral_source: referralSource && referralSource.trim() ? referralSource.trim() : null,
            marketing_consent: marketingConsent === true || marketingConsent === 'true',
          // Signup completion fields
          signup_step: 6, // Complete signup
          signup_complete: true,
          account_status: 'active',
          otp_enabled_login: true, // Enable OTP by default for security
          created_at: new Date().toISOString(),
          },
        ])

      profileCreateError = insertError
    }

    if (profileCreateError) {
      // Clean up: delete the auth user if profile creation/update fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        error: profileCreateError.message || 'Failed to create/update user profile',
        details: profileCreateError
      }, { status: 400 })
    }

    // Create accounts if requested (using RPC function to auto-generate cards)
    const createdAccounts = []
    if (accountTypes && Array.isArray(accountTypes) && accountTypes.length > 0) {
      const cardholderName = `${firstName} ${lastName}`

      for (const accountType of accountTypes) {
        // Check if account already exists for this user and type
        const { data: existingAccount } = await supabaseAdmin
          .from('accounts')
          .select('id, account_number')
          .eq('user_id', authData.user.id)
          .eq('account_type', accountType)
          .maybeSingle()

        if (existingAccount) {
          // Account already exists, skip
          createdAccounts.push(existingAccount)
          continue
        }

        // Use RPC function to create account with card
        const { data: accountData, error: accountError } = await supabaseAdmin.rpc('create_account_with_card', {
          p_user_id: authData.user.id,
          p_account_type: accountType,
          p_cardholder_name: cardholderName,
        })

        if (accountError) {
          console.error(`Error creating ${accountType} account:`, accountError)
          // Continue with other accounts even if one fails
        } else if (accountData && accountData.length > 0) {
          // Fetch the created account to return full details
          const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('*')
            .eq('id', accountData[0].account_id)
            .single()

          if (account) {
            createdAccounts.push(account)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        username: username.toLowerCase(),
        role: role || 'user',
      },
      accounts: createdAccounts,
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    // Ensure we always return JSON, never HTML
    const errorMessage = error?.message || 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

