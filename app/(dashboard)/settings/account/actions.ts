'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Get account settings for the current user's account
 */
export async function getAccountSettings() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Get user's account via user_roles_permissions -> locations
  const { data: userLocations } = await supabaseAdmin
    .from('user_roles_permissions')
    .select('location_id, locations!inner(account_id)')
    .eq('user_id', user.id)
    .limit(1)

  if (!userLocations || userLocations.length === 0) {
    throw new Error('No account found for user')
  }

  const accountId = (userLocations[0].locations as any).account_id

  // Get account settings
  const { data: settings, error } = await supabaseAdmin
    .from('account_settings')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching account settings:', error)
    throw new Error(`Failed to fetch account settings: ${error.message}`)
  }

  return {
    accountId,
    userCreationPermissionLevel: settings?.user_creation_permission_level ?? 5
  }
}

/**
 * Update account settings
 */
export async function updateAccountSettings(
  userCreationPermissionLevel: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user's account
    const { data: userLocations } = await supabaseAdmin
      .from('user_roles_permissions')
      .select('location_id, locations!inner(account_id)')
      .eq('user_id', user.id)
      .limit(1)

    if (!userLocations || userLocations.length === 0) {
      return { success: false, error: 'No account found for user' }
    }

    const accountId = (userLocations[0].locations as any).account_id

    // Check if user is an owner (role_id 5)
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles_permissions')
      .select('roles_permissions!inner(role_id)')
      .eq('user_id', user.id)
      .limit(1)

    if (!userRoles || userRoles.length === 0) {
      return { success: false, error: 'User role not found' }
    }

    const userRoleId = (userRoles[0].roles_permissions as any).role_id

    // Only owners (role_id 5) can update account settings
    if (userRoleId !== 5) {
      return { success: false, error: 'Only account owners can update account settings' }
    }

    // Validate permission level (1-5)
    if (userCreationPermissionLevel < 1 || userCreationPermissionLevel > 5) {
      return { success: false, error: 'Permission level must be between 1 and 5' }
    }

    // Upsert account settings
    const { error: upsertError } = await supabaseAdmin
      .from('account_settings')
      .upsert({
        account_id: accountId,
        user_creation_permission_level: userCreationPermissionLevel
      }, {
        onConflict: 'account_id'
      })

    if (upsertError) {
      console.error('Error updating account settings:', upsertError)
      return { success: false, error: `Failed to update settings: ${upsertError.message}` }
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating account settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
