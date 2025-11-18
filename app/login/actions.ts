'use server'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function checkUserExists(email: string): Promise<{ exists: boolean; hasPermissions: boolean }> {
  // Create admin client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Check if user exists in auth.users using admin API
  const { data: { users }, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error checking user:', error)
    throw new Error('Unable to verify user')
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    return { exists: false, hasPermissions: false }
  }

  // Check if user has permissions
  const { data: userPermission } = await supabase
    .from('user_roles_permissions')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    exists: true,
    hasPermissions: !!userPermission
  }
}

export async function signInDirectly(email: string): Promise<{ success: boolean; error?: string }> {
  // Create admin client with service role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Get the user by email
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    return { success: false, error: 'Unable to verify user' }
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  // Generate a one-time password link for this user
  const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email!
  })

  if (otpError || !otpData) {
    console.error('Generate link error:', otpError)
    return { success: false, error: 'Failed to generate auth token' }
  }

  console.log('OTP Data properties:', Object.keys(otpData.properties || {}))

  // Create SSR client to properly set the session
  const cookieStore = await cookies()
  const supabaseSSR = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore cookies errors
          }
        },
      },
    }
  )

  // The generateLink returns a hashed_token, we need to verify it to get session tokens
  const { data: verifyData, error: verifyError } = await supabaseSSR.auth.verifyOtp({
    token_hash: otpData.properties.hashed_token,
    type: 'magiclink'
  })

  if (verifyError || !verifyData.session) {
    console.error('Verify OTP error:', verifyError)
    return { success: false, error: 'Failed to create session' }
  }

  return { success: true }
}
