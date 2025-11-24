'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Check if current user has permission to create users
 */
export async function canUserCreateUsers(): Promise<{ canCreate: boolean; userRoleId: number | null }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { canCreate: false, userRoleId: null }
  }

  // Use admin client to bypass RLS for checking permissions
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

  // Get user's role (any of their rows will have their role info)
  const { data: userRoles, error: roleError } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`
      role_permission_id,
      roles_permissions!inner (
        role_id,
        permission_ids
      )
    `)
    .eq('user_id', user.id)
    .limit(1)

  if (roleError || !userRoles || userRoles.length === 0) {
    return { canCreate: false, userRoleId: null }
  }

  const userRole = userRoles[0]
  const userRoleId = (userRole.roles_permissions as any).role_id

  // Get user's account via location (join through user_roles_permissions -> locations)
  const { data: userLocations } = await supabaseAdmin
    .from('user_roles_permissions')
    .select('location_id, locations!inner(account_id)')
    .eq('user_id', user.id)
    .limit(1)

  if (!userLocations || userLocations.length === 0) {
    return { canCreate: false, userRoleId }
  }

  const accountId = (userLocations[0].locations as any).account_id

  // Check account settings for user creation permission level
  const { data: accountSettings } = await supabaseAdmin
    .from('account_settings')
    .select('user_creation_permission_level')
    .eq('account_id', accountId)
    .maybeSingle()

  const requiredRoleId = accountSettings?.user_creation_permission_level ?? 5 // Default: only owners

  return {
    canCreate: userRoleId >= requiredRoleId,
    userRoleId
  }
}

/**
 * Get all role permission sets that current user can assign to new users
 */
export async function getCreatableRoles() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Use admin client to bypass RLS
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

  // Get current user's permissions
  const { data: currentUserRoles } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`
      roles_permissions!inner (
        permission_ids
      )
    `)
    .eq('user_id', user.id)
    .limit(1)

  if (!currentUserRoles || currentUserRoles.length === 0) {
    throw new Error('User role not found')
  }

  const currentUserPermissions = (currentUserRoles[0].roles_permissions as any).permission_ids

  // Get all available role permission sets
  const { data: allRoles, error } = await supabaseAdmin
    .from('roles_permissions')
    .select(`
      role_permission_id,
      name,
      description,
      permission_ids,
      role_id,
      roles!roles_permissions_role_id_fkey (
        name,
        description
      )
    `)
    .order('role_id', { ascending: true })

  if (error) {
    console.error('Error fetching roles:', error)
    throw new Error(`Failed to fetch roles: ${error.message}`)
  }

  // Filter to only roles where all target permissions are subset of creator's permissions
  const creatableRoles = allRoles.filter(role =>
    role.permission_ids.every((p: number) => currentUserPermissions.includes(p))
  )

  return creatableRoles.map(role => ({
    rolePermissionId: role.role_permission_id,
    name: role.name,
    description: role.description,
    roleName: (role.roles as any).name,
    roleId: role.role_id,
    permissionIds: role.permission_ids
  }))
}

/**
 * Get all locations that current user has access to
 */
export async function getAssignableLocations() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Use admin client to bypass RLS
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

  // Get user's accessible locations from user_roles_permissions
  const { data: userLocations, error } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`
      location_id,
      locations!inner (
        location_id,
        name,
        account_id
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching locations:', error)
    throw new Error(`Failed to fetch locations: ${error.message}`)
  }

  if (!userLocations || userLocations.length === 0) {
    console.warn('No locations found for user:', user.id)
    return []
  }

  return userLocations.map(ul => ({
    locationId: ul.location_id,
    locationName: (ul.locations as any).name,
    accountId: (ul.locations as any).account_id
  }))
}

/**
 * Create a new user with specified role and location access
 */
export async function createUser(
  email: string,
  rolePermissionId: number,
  locationId: string,
  fullName?: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' }
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    // 1. Check if user can create users
    const { canCreate } = await canUserCreateUsers()
    if (!canCreate) {
      return { success: false, error: 'You do not have permission to create users' }
    }

    // Use admin client to bypass RLS for all queries
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

    // 2. Get current user's permissions
    const { data: creatorRoles } = await supabaseAdmin
      .from('user_roles_permissions')
      .select(`
        roles_permissions!inner (
          permission_ids
        )
      `)
      .eq('user_id', user.id)
      .limit(1)

    if (!creatorRoles || creatorRoles.length === 0) {
      return { success: false, error: 'Creator role not found' }
    }

    const creatorRole = creatorRoles[0]

    // 3. Get target role's permissions
    const { data: targetRole } = await supabaseAdmin
      .from('roles_permissions')
      .select('permission_ids, role_id')
      .eq('role_permission_id', rolePermissionId)
      .single()

    if (!targetRole) {
      return { success: false, error: 'Target role not found' }
    }

    // 4. VALIDATE: Can creator assign this role? (Permission array check)
    const creatorPermissions = (creatorRole.roles_permissions as any).permission_ids
    const targetPermissions = targetRole.permission_ids

    const canAssignRole = targetPermissions.every((p: number) => creatorPermissions.includes(p))

    if (!canAssignRole) {
      return {
        success: false,
        error: 'You do not have sufficient permissions to create users with this role'
      }
    }

    // 5. Validate location access
    const { data: creatorLocations } = await supabaseAdmin
      .from('user_roles_permissions')
      .select('location_id, locations!inner(account_id)')
      .eq('user_id', user.id)

    const creatorLocationIds = creatorLocations?.map(l => l.location_id) || []
    const accountId = creatorLocations?.[0] ? (creatorLocations[0].locations as any).account_id : null

    if (!accountId) {
      return { success: false, error: 'Creator account not found' }
    }

    // Ensure creator has access to the specified location
    if (!creatorLocationIds.includes(locationId)) {
      return {
        success: false,
        error: 'You do not have access to this location'
      }
    }

    // 6. Check if user already exists

    const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.find(u => u.email?.toLowerCase() === normalizedEmail)

    if (existingUser) {
      return { success: false, error: `A user with the email "${normalizedEmail}" already exists in the system` }
    }

    // 7. Create user in auth.users
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        display_name: fullName || null,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
    })

    if (createError || !newUserData.user) {
      console.error('Failed to create user in auth:', createError)
      return { success: false, error: 'Failed to create user account' }
    }

    const newUserId = newUserData.user.id

    // 8. Assign role permission with location (single row)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles_permissions')
      .insert({
        user_id: newUserId,
        role_permission_id: rolePermissionId,
        location_id: locationId
      })

    if (roleError) {
      console.error('Failed to assign role:', roleError)
      // Rollback: delete created user
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return { success: false, error: `Failed to assign role to user: ${roleError.message}` }
    }

    // 9. Log in audit table
    await supabaseAdmin
      .from('user_audit_logs')
      .insert({
        modified_user_id: newUserId,
        modified_by_user_id: user.id,
        action: 'created',
        changes: {
          email: normalizedEmail,
          full_name: fullName || null,
          role_permission_id: rolePermissionId,
          location_id: locationId
        }
      })

    return { success: true, userId: newUserId }

  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Get all users in the current user's account
 */
export async function getAccountUsers() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Use admin client to bypass RLS
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

  // Get current user's account via user_roles_permissions -> locations
  const { data: userLocations } = await supabaseAdmin
    .from('user_roles_permissions')
    .select('location_id, locations!inner(account_id)')
    .eq('user_id', user.id)
    .limit(1)

  if (!userLocations || userLocations.length === 0) {
    return []
  }

  const accountId = (userLocations[0].locations as any).account_id

  // Get all users with access to this account's locations
  const { data: accountUsers, error } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`
      user_id,
      location_id,
      locations!inner (
        location_id,
        name,
        account_id
      )
    `)
    .eq('locations.account_id', accountId)

  if (error) {
    console.error('Error fetching account users:', error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  // Group by user_id to get unique users with their locations
  const userMap = new Map<string, any>()

  for (const entry of accountUsers) {
    if (!userMap.has(entry.user_id)) {
      userMap.set(entry.user_id, {
        userId: entry.user_id,
        locations: []
      })
    }
    userMap.get(entry.user_id).locations.push({
      locationId: entry.location_id,
      locationName: (entry.locations as any).name
    })
  }

  const userIds = Array.from(userMap.keys())

  // Get user details from auth.users (using existing supabaseAdmin)
  const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers()

  // Get role information
  const { data: userRoles, error: roleError } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`
      user_id,
      role_permission_id,
      roles_permissions!inner (
        name,
        role_id,
        roles!roles_permissions_role_id_fkey (
          name
        )
      )
    `)
    .in('user_id', userIds)

  if (roleError) {
    console.error('Error fetching user roles:', roleError)
  }

  // Combine all data
  const enrichedUsers = userIds.map(userId => {
    const authUser = authUsers.find(u => u.id === userId)
    const userRole = userRoles?.find(ur => ur.user_id === userId)
    const userData = userMap.get(userId)

    return {
      userId,
      email: authUser?.email || 'Unknown',
      displayName: authUser?.user_metadata?.display_name || null,
      createdAt: authUser?.created_at,
      roleName: (userRole?.roles_permissions as any)?.roles?.name || 'No role',
      rolePermissionName: (userRole?.roles_permissions as any)?.name || 'No permission set',
      rolePermissionId: userRole?.role_permission_id,
      locations: userData.locations
    }
  })

  return enrichedUsers.sort((a, b) => a.email.localeCompare(b.email))
}

/**
 * Update a user's information
 */
export async function updateUser(
  targetUserId: string,
  updates: {
    fullName?: string
    rolePermissionId?: number
    locationIds?: string[]
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Check if user can manage users
    const { canCreate } = await canUserCreateUsers()
    if (!canCreate) {
      return { success: false, error: 'You do not have permission to update users' }
    }

    // Cannot update yourself (use profile page instead)
    if (targetUserId === user.id) {
      return { success: false, error: 'Use your profile page to update your own information' }
    }

    // Use admin client to bypass RLS
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

    // Get target user's current role (any row will have their role info)
    const { data: targetRoles } = await supabaseAdmin
      .from('user_roles_permissions')
      .select(`
        roles_permissions!inner (
          permission_ids
        )
      `)
      .eq('user_id', targetUserId)
      .limit(1)

    if (!targetRoles || targetRoles.length === 0) {
      return { success: false, error: 'Target user not found' }
    }

    const targetRole = targetRoles[0]

    // Get current user's permissions (any row will have their role info)
    const { data: creatorRoles } = await supabaseAdmin
      .from('user_roles_permissions')
      .select(`
        roles_permissions!inner (
          permission_ids
        )
      `)
      .eq('user_id', user.id)
      .limit(1)

    if (!creatorRoles || creatorRoles.length === 0) {
      return { success: false, error: 'Your role not found' }
    }

    const creatorRole = creatorRoles[0]

    // Validate: Can only update users with equal or lesser permissions
    const canUpdate = (targetRole.roles_permissions as any).permission_ids.every((p: number) =>
      (creatorRole.roles_permissions as any).permission_ids.includes(p)
    )

    if (!canUpdate) {
      return { success: false, error: 'You cannot update users with higher permissions than yours' }
    }

    const changes: Record<string, any> = {}

    // Update display name if provided
    if (updates.fullName !== undefined) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        {
          user_metadata: {
            display_name: updates.fullName || null
          }
        }
      )

      if (updateError) {
        console.error('Failed to update display name:', updateError)
        return { success: false, error: 'Failed to update user name' }
      }

      changes.display_name = updates.fullName || null
    }

    // Update role if provided
    if (updates.rolePermissionId !== undefined) {
      // Get new role's permissions
      const { data: newRole } = await supabaseAdmin
        .from('roles_permissions')
        .select('permission_ids')
        .eq('role_permission_id', updates.rolePermissionId)
        .single()

      if (!newRole) {
        return { success: false, error: 'Target role not found' }
      }

      // Validate creator can assign this role
      const canAssignRole = newRole.permission_ids.every((p: number) =>
        (creatorRole.roles_permissions as any).permission_ids.includes(p)
      )

      if (!canAssignRole) {
        return {
          success: false,
          error: 'You do not have sufficient permissions to assign this role'
        }
      }

      // Update role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles_permissions')
        .update({ role_permission_id: updates.rolePermissionId })
        .eq('user_id', targetUserId)

      if (roleError) {
        console.error('Failed to update role:', roleError)
        return { success: false, error: 'Failed to update user role' }
      }

      changes.role_permission_id = updates.rolePermissionId
    }

    // Update locations if provided
    if (updates.locationIds !== undefined) {
      // Get creator's locations from user_roles_permissions
      const { data: creatorLocations } = await supabaseAdmin
        .from('user_roles_permissions')
        .select('location_id, role_permission_id, locations!inner(account_id)')
        .eq('user_id', user.id)

      const creatorLocationIds = creatorLocations?.map(l => l.location_id) || []
      const accountId = creatorLocations?.[0] ? (creatorLocations[0].locations as any).account_id : null

      if (!accountId) {
        return { success: false, error: 'Creator account not found' }
      }

      // Ensure creator has access to all specified locations
      const invalidLocations = updates.locationIds.filter((locId: string) => !creatorLocationIds.includes(locId))
      if (invalidLocations.length > 0) {
        return {
          success: false,
          error: 'You do not have access to some of the specified locations'
        }
      }

      // Get target user's current role_permission_id (same for all their locations)
      const currentRolePermissionId = targetRoles[0].roles_permissions ?
        (await supabaseAdmin
          .from('user_roles_permissions')
          .select('role_permission_id')
          .eq('user_id', targetUserId)
          .limit(1)
          .then(res => res.data?.[0]?.role_permission_id)) : null

      if (!currentRolePermissionId) {
        return { success: false, error: 'Failed to get user\'s current role' }
      }

      // Delete existing location assignments
      await supabaseAdmin
        .from('user_roles_permissions')
        .delete()
        .eq('user_id', targetUserId)

      // Insert new location assignments (one row per location)
      const locationAccessRows = updates.locationIds.map((locationId: string) => ({
        user_id: targetUserId,
        location_id: locationId,
        role_permission_id: updates.rolePermissionId || currentRolePermissionId
      }))

      const { error: locationError } = await supabaseAdmin
        .from('user_roles_permissions')
        .insert(locationAccessRows)

      if (locationError) {
        console.error('Failed to update locations:', locationError)
        return { success: false, error: 'Failed to update location access' }
      }

      changes.location_ids = updates.locationIds
    }

    // Log update in audit table
    if (Object.keys(changes).length > 0) {
      await supabaseAdmin
        .from('user_audit_logs')
        .insert({
          modified_user_id: targetUserId,
          modified_by_user_id: user.id,
          action: 'updated',
          changes
        })
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Delete a user (only if creator has permission)
 */
export async function deleteUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Check if user can create users (same permission level for deletion)
    const { canCreate } = await canUserCreateUsers()
    if (!canCreate) {
      return { success: false, error: 'You do not have permission to delete users' }
    }

    // Cannot delete yourself
    if (targetUserId === user.id) {
      return { success: false, error: 'You cannot delete your own account' }
    }

    // Use admin client to bypass RLS
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

    // Get target user's role (any row will have their role info)
    const { data: targetRoles } = await supabaseAdmin
      .from('user_roles_permissions')
      .select(`
        roles_permissions!inner (
          permission_ids
        )
      `)
      .eq('user_id', targetUserId)
      .limit(1)

    if (!targetRoles || targetRoles.length === 0) {
      return { success: false, error: 'Target user not found' }
    }

    const targetRole = targetRoles[0]

    // Get current user's permissions (any row will have their role info)
    const { data: creatorRoles } = await supabaseAdmin
      .from('user_roles_permissions')
      .select(`
        roles_permissions!inner (
          permission_ids
        )
      `)
      .eq('user_id', user.id)
      .limit(1)

    if (!creatorRoles || creatorRoles.length === 0) {
      return { success: false, error: 'Your role not found' }
    }

    const creatorRole = creatorRoles[0]

    // Validate: Can only delete users with equal or lesser permissions
    const canDelete = (targetRole.roles_permissions as any).permission_ids.every((p: number) =>
      (creatorRole.roles_permissions as any).permission_ids.includes(p)
    )

    if (!canDelete) {
      return { success: false, error: 'You cannot delete users with higher permissions than yours' }
    }

    // Delete user from auth.users (cascade will handle other tables)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return { success: false, error: 'Failed to delete user' }
    }

    // Log deletion
    await supabaseAdmin
      .from('user_audit_logs')
      .insert({
        modified_user_id: targetUserId,
        modified_by_user_id: user.id,
        action: 'deleted',
        changes: {
          deleted_at: new Date().toISOString()
        }
      })

    return { success: true }

  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}
