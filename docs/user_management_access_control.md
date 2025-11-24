# User Management Access Control

**Last Updated:** 2025-11-23
**Purpose:** Define exactly how the system determines who can create, edit, and delete users

---

## Overview

User management access is controlled by a combination of:
1. The user's **role_id** (from their assigned role)
2. The account's **user_creation_permission_level** setting
3. **Permission array validation** (for role assignment)
4. **Location access validation** (users can only assign locations they have access to)

**Schema Note (Nov 2025):** The system now uses `user_roles_permissions` table with a composite primary key `(user_id, location_id)` instead of separate `user_location_access` table. Each user has one role permission set per location they can access.

---

## Can User Create Users? - Complete Logic Flow

### Step 1: Authentication Check
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return { canCreate: false }
}
```

**Requirement:** User must be authenticated in `auth.users`

---

### Step 2: Get User's Role
```sql
SELECT role_permission_id, roles_permissions.role_id, roles_permissions.permission_ids
FROM user_roles_permissions
WHERE user_id = 'user-uuid'
LIMIT 1
```

**Requirements:**
- User must have at least one row in `user_roles_permissions` table
- The role must exist in `roles_permissions` table
- Must have a valid `role_id` (1-5: staff, shift_lead, manager, regional_manager, owner)

**If missing:** `canCreate = false`

---

### Step 3: Get User's Account
```sql
SELECT location_id, locations.account_id
FROM user_roles_permissions
JOIN locations ON user_roles_permissions.location_id = locations.location_id
WHERE user_id = 'user-uuid'
LIMIT 1
```

**Requirements:**
- User must have at least one row in `user_roles_permissions` table
- This establishes which account the user belongs to (via location)
- The location must exist in `locations` table

**If missing:** `canCreate = false`

---

### Step 4: Check Account Settings
```sql
SELECT user_creation_permission_level
FROM account_settings
WHERE account_id = 'account-uuid'
```

**Requirements:**
- Account **MAY** have a row in `account_settings` (optional)
- If row exists, check the `user_creation_permission_level` column
- If row doesn't exist, use default value of `5` (owner only)

**Default behavior:** Only owners (role_id = 5) can create users

---

### Step 5: Compare Role ID
```typescript
const userRoleId = 5 // Example: owner
const requiredRoleId = accountSettings?.user_creation_permission_level ?? 5

canCreate = userRoleId >= requiredRoleId
```

**Logic:**
- User's `role_id` must be **greater than or equal to** the required level
- Higher numbers = more permissions (owner=5, staff=1)

**Examples:**
- User is Owner (5), Required is Owner (5) → ✅ Can create
- User is Manager (3), Required is Owner (5) → ❌ Cannot create
- User is Regional Manager (4), Required is Manager (3) → ✅ Can create

---

## Required Database State for User Creation Access

### Minimum Requirements for ANY User

For a user to potentially create other users, they need:

1. **auth.users table:**
   - Row with their user ID and confirmed email

2. **user_roles_permissions table (composite PK: user_id, location_id):**
   - At least ONE row linking their user_id to a role_permission_id and location_id
   ```sql
   INSERT INTO user_roles_permissions (user_id, role_permission_id, location_id)
   VALUES ('user-uuid', role_permission_id, 'location-uuid')
   ```

**Note:** The `user_roles_permissions` table now serves dual purposes:
- Assigns the user's role permissions
- Grants access to specific locations (one row per location)

### Optional: Account Settings

3. **account_settings table (OPTIONAL):**
   - If NO row exists for the account → Default: only owners can create users
   - If row exists → Use `user_creation_permission_level` value

---

## Account Settings Configuration

### Creating/Updating Account Settings Row

```sql
-- Upsert pattern (insert or update if exists)
INSERT INTO account_settings (account_id, user_creation_permission_level)
VALUES ('account-uuid', 5)
ON CONFLICT (account_id)
DO UPDATE SET user_creation_permission_level = 5;
```

**UI Location:** Owners can configure this setting at:
- **Route:** `/settings/account`
- **Component:** `app/(dashboard)/settings/account/account-settings-client.tsx`

### Permission Level Values

| Value | Role | Who Can Create Users |
|-------|------|---------------------|
| 5 | Owner | Only owners |
| 4 | Regional Manager | Regional managers and owners |
| 3 | Manager | Managers, regional managers, and owners |
| 2 | Shift Lead | Shift leads and above |
| 1 | Staff | Everyone (any authenticated user) |

### Updating Permission Level

```sql
-- Allow managers to create users
UPDATE account_settings
SET
  user_creation_permission_level = 3,
  updated_at = NOW()
WHERE account_id = 'account-uuid';
```

---

## Permission Array Validation (Role Assignment)

Even if a user CAN create users, they can only assign roles where the target permissions are a **subset** of their own.

### Logic
```typescript
// Get creator's permissions
const creatorPermissions = [1, 2, 3, 4, 5] // Example: Owner

// Get target role's permissions
const targetPermissions = [1, 2, 3] // Example: Manager Default

// Validation
const canAssignRole = targetPermissions.every(p =>
  creatorPermissions.includes(p)
)
```

### Examples

**Example 1: Owner creating Manager ✅**
- Owner permissions: `[1, 2, 3, 4, 5]`
- Manager permissions: `[1, 2, 3]`
- Result: All manager permissions exist in owner's array → **Allowed**

**Example 2: Manager creating Owner ❌**
- Manager permissions: `[1, 2, 3]`
- Owner permissions: `[1, 2, 3, 4, 5]`
- Result: Permissions 4 and 5 missing from manager's array → **Denied**

**Example 3: Manager creating Staff ✅**
- Manager permissions: `[1, 2, 3]`
- Staff permissions: `[1]`
- Result: Permission 1 exists in manager's array → **Allowed**

---

## Complete Example: Can This User Create Users?

### Scenario
**User:** John Doe (Manager)
**Account:** Restaurant Chain ABC
**Question:** Can John create users?

### Database State Check

**1. auth.users ✅**
```sql
id: 'john-uuid'
email: 'john@restaurant.com'
email_confirmed_at: '2025-11-01 10:00:00'
```

**2. user_roles_permissions ✅** (composite PK: user_id, location_id)
```sql
user_id: 'john-uuid'
role_permission_id: 5
location_id: 'downtown-location-uuid'
roles_permissions.role_id: 3 (manager)
roles_permissions.permission_ids: [1, 2, 3]
locations.account_id: 'abc-account-uuid'
```

**3. account_settings**
```sql
account_id: 'abc-account-uuid'
user_creation_permission_level: 3 (manager)
```

### Calculation
```
User's role_id: 3 (manager)
Required role_id: 3 (manager)

3 >= 3 → TRUE
```

**Result:** ✅ **John CAN create users**

### What roles can John assign?

John's permissions: `[1, 2, 3]`

Available roles to assign:
- ✅ Staff (permissions: `[1]`) - subset of John's
- ✅ Shift Lead (permissions: `[1, 2]`) - subset of John's
- ✅ Manager (permissions: `[1, 2, 3]`) - subset of John's
- ❌ Regional Manager (permissions: `[1, 2, 3, 4]`) - includes 4, which John doesn't have
- ❌ Owner (permissions: `[1, 2, 3, 4, 5]`) - includes 4 and 5, which John doesn't have

---

## Default Behavior Summary

If **NO** `account_settings` row exists:
- Default `user_creation_permission_level` = 5 (owner only)
- Only users with `role_id >= 5` can create users
- Typically only franchise owners

If account wants managers to create users:
1. Insert or update `account_settings` row
2. Set `user_creation_permission_level = 3`
3. All managers, regional managers, and owners can now create users

---

## Edge Cases

### User has no locations/role
```sql
SELECT * FROM user_roles_permissions WHERE user_id = 'user-uuid'
-- Returns: 0 rows
```
**Result:** Cannot create users (no role assigned and no account association)

**Note:** Since `user_roles_permissions` now handles both role assignment and location access with composite PK (user_id, location_id), a user with no rows has neither a role nor location access.

### Account has no settings row
```sql
SELECT * FROM account_settings WHERE account_id = 'account-uuid'
-- Returns: 0 rows
```
**Result:** Default to level 5 (only owners can create users)

### User is owner but account level is set to 1 (staff)
```
User role_id: 5 (owner)
Required level: 1 (staff)

5 >= 1 → TRUE
```
**Result:** Owner can still create users (higher role always has access)

---

## Implementation in Code

The complete logic is in [actions.ts:9-75](app/(dashboard)/settings/users/actions.ts#L9-L75):

```typescript
export async function canUserCreateUsers() {
  // 1. Check authentication
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { canCreate: false, userRoleId: null }
  }

  // Use admin client to bypass RLS
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 2. Get user's role
  const { data: userRoles, error: roleError } = await supabaseAdmin
    .from('user_roles_permissions')
    .select(`role_permission_id, roles_permissions!inner (role_id, permission_ids)`)
    .eq('user_id', user.id)
    .limit(1)

  if (roleError || !userRoles || userRoles.length === 0) {
    return { canCreate: false, userRoleId: null }
  }

  const userRole = userRoles[0]
  const userRoleId = (userRole.roles_permissions as any).role_id

  // 3. Get user's account (via location join)
  const { data: userLocations } = await supabaseAdmin
    .from('user_roles_permissions')
    .select('location_id, locations!inner(account_id)')
    .eq('user_id', user.id)
    .limit(1)

  if (!userLocations || userLocations.length === 0) {
    return { canCreate: false, userRoleId }
  }

  const accountId = (userLocations[0].locations as any).account_id

  // 4. Check account settings
  const { data: accountSettings } = await supabaseAdmin
    .from('account_settings')
    .select('user_creation_permission_level')
    .eq('account_id', accountId)
    .maybeSingle()

  // 5. Compare role ID (default to 5 if no settings)
  const requiredRoleId = accountSettings?.user_creation_permission_level ?? 5

  return {
    canCreate: userRoleId >= requiredRoleId,
    userRoleId
  }
}
```

**Important Implementation Details:**
- Uses **admin client** to bypass RLS policies
- Changed from `.single()` to `.limit(1)` with array access
- Gets account_id via join through `locations` table
- All database queries use `supabaseAdmin` instead of regular client

---

## Related Documentation

- **[Roles & Permissions](./roles_and_permissions.md)** - Complete role hierarchy and permission structure
- **[User Creation Guide](./user_creation_guide.md)** - Step-by-step user creation process
- **[Database Schema](./database_schema.md)** - Full database schema reference
