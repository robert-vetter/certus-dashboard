# User Creation Guide

**Last Updated:** 2025-11-23
**Purpose:** Step-by-step guide for creating new users in the Certus Operations Dashboard

---

## Overview

Creating a new user involves multiple steps across different tables. This guide explains what happens when a user is created, the required database insertions, and the validation logic that protects the system.

**Key Principle:** Users can only create other users with equal or lesser permissions than their own.

**Schema Change (Nov 2025):** The system now uses `user_roles_permissions` table with a composite primary key `(user_id, location_id)` instead of separate `user_location_access` table. Each user has one role permission set per location they can access.

---

## Account Creation vs User Creation

**Important Distinction:** This guide covers **user creation** within an existing account. **Account creation** is a separate process handled in a different project.

### New Account Creation Process (Background Information)

When a new account is created (handled in a separate onboarding project), the following occurs:

1. **Row in `auth.users`** - First account owner user is created
2. **X rows in `user_roles_permissions`** - One row per location (for X locations)
   ```sql
   INSERT INTO user_roles_permissions (user_id, role_permission_id, location_id)
   VALUES
     ('owner-uuid', 1, 'location-1-uuid'),
     ('owner-uuid', 1, 'location-2-uuid'),
     ('owner-uuid', 1, 'location-3-uuid');
   ```
3. **One row in `account_settings`** - Sets default user creation permission level
   ```sql
   INSERT INTO account_settings (account_id, user_creation_permission_level)
   VALUES ('new-account-uuid', 5); -- Default: only owners can create users
   ```

**This guide focuses on creating additional users within an existing account.**

---

## Prerequisites

Before creating a user, the creator must:

1. **Have permission to create users** (determined by `account_settings.user_creation_permission_level`)
2. **Have all the permissions** they want to assign to the new user (permission array subset check)
3. **Have access to the locations** they want to assign to the new user

---

## Step-by-Step Process

### Step 1: Validate Creator Permissions

Before any user creation begins, the system validates:

**1.1 Check if creator can create users**
```sql
-- Get creator's role_id
SELECT rp.role_id
FROM user_roles_permissions urp
JOIN roles_permissions rp ON urp.role_permission_id = rp.role_permission_id
WHERE urp.user_id = 'creator-user-uuid'
LIMIT 1;

-- Get account's user creation permission level
SELECT user_creation_permission_level
FROM account_settings
WHERE account_id = 'account-uuid';

-- Creator's role_id must be >= user_creation_permission_level
```

**1.2 Validate permission array subset**
```typescript
// Get creator's permissions
const creatorPermissions = [1, 2, 3, 4, 5]; // Example

// Get target role's permissions
const targetPermissions = [1, 2, 3]; // Example

// Validation check
const canAssignRole = targetPermissions.every(p =>
  creatorPermissions.includes(p)
);

// Result: true (all target permissions exist in creator's array)
```

**1.3 Validate location access**
```sql
-- Get creator's accessible locations
SELECT location_id
FROM user_roles_permissions
WHERE user_id = 'creator-user-uuid';

-- All target location_ids must be in creator's accessible locations
```

---

### Step 2: Create User in auth.users

**Method:** Supabase Admin API

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const { data: newUserData, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'newuser@example.com',
  email_confirm: true, // Auto-confirm email
  user_metadata: {
    display_name: 'Full Name',
    created_by: 'creator-user-uuid',
    created_at: new Date().toISOString()
  }
});

const newUserId = newUserData.user.id;
```

**Result:** New user created in `auth.users` table with:
- `id`: UUID (auto-generated)
- `email`: Provided email address
- `email_confirmed_at`: Current timestamp (auto-confirmed)
- `user_metadata`: Creator info and display name

---

### Step 3: Assign Role Permission and Location

**Table:** `user_roles_permissions` (composite PK: user_id + location_id)

**Single Location:**
```sql
INSERT INTO user_roles_permissions (user_id, role_permission_id, location_id)
VALUES (
  'new-user-uuid',
  3, -- role_permission_id selected by creator
  'location-uuid'
);
```

**Multiple Locations (one row per location):**
```sql
INSERT INTO user_roles_permissions (user_id, role_permission_id, location_id)
VALUES
  ('new-user-uuid', 3, 'location-uuid-1'),
  ('new-user-uuid', 3, 'location-uuid-2'),
  ('new-user-uuid', 3, 'location-uuid-3');
```

**Important:**
- The user gets the **same role_permission_id** for all their locations
- Each row represents access to one specific location
- Composite PK prevents duplicate (user_id, location_id) entries

**Rollback if this fails:**
```typescript
// Delete the auth user if role/location assignment fails
await supabaseAdmin.auth.admin.deleteUser(newUserId);
```

---

### Step 4: Log Creation in Audit Table

**Table:** `user_audit_logs`

```sql
INSERT INTO user_audit_logs (modified_user_id, modified_by_user_id, action, changes)
VALUES (
  'new-user-uuid',
  'creator-user-uuid',
  'created',
  '{
    "email": "newuser@example.com",
    "full_name": "Full Name",
    "role_permission_id": 3,
    "location_id": "uuid1"
  }'::jsonb
);
```

**Purpose:** Creates audit trail for compliance and debugging.

---

## Complete Example: Creating a Manager

### Scenario
- **Creator:** Owner with permissions `[1, 2, 3, 4, 5]`
- **Target User:** Manager with permission set `[1, 2, 3]`
- **Location:** 1 location (Main St)

### Database Insertions

**1. auth.users (via Supabase Admin API)**
```typescript
const { data } = await supabaseAdmin.auth.admin.createUser({
  email: 'manager@restaurant.com',
  email_confirm: true,
  user_metadata: {
    display_name: 'John Manager',
    created_by: 'owner-uuid',
    created_at: '2025-11-23T10:30:00Z'
  }
});
// Result: id = 'manager-uuid'
```

**2. user_roles_permissions (single row for single location)**
```sql
INSERT INTO user_roles_permissions (user_id, role_permission_id, location_id)
VALUES ('manager-uuid', 5, 'main-st-uuid');
-- 5 is the role_permission_id for "Manager Default"
```

**3. user_audit_logs**
```sql
INSERT INTO user_audit_logs (modified_user_id, modified_by_user_id, action, changes)
VALUES (
  'manager-uuid',
  'owner-uuid',
  'created',
  '{
    "email": "manager@restaurant.com",
    "full_name": "John Manager",
    "role_permission_id": 5,
    "location_id": "main-st-uuid"
  }'::jsonb
);
```

---

## Multi-Location User Example

### Scenario: Regional Manager with 3 Locations

**Database Insertions:**
```sql
-- One row per location, same role_permission_id
INSERT INTO user_roles_permissions (user_id, role_permission_id, location_id)
VALUES
  ('regional-manager-uuid', 7, 'north-region-1-uuid'),
  ('regional-manager-uuid', 7, 'north-region-2-uuid'),
  ('regional-manager-uuid', 7, 'north-region-3-uuid');
-- 7 is the role_permission_id for "Regional Manager Default"
```

**To get user's accessible locations:**
```sql
SELECT location_id, locations.name
FROM user_roles_permissions
JOIN locations ON user_roles_permissions.location_id = locations.location_id
WHERE user_id = 'regional-manager-uuid';
```

---

## Account Settings: User Creation Control

The `account_settings` table controls who can create users at the account level.

### Creating/Updating Account Settings

```sql
-- Insert or update account settings (upsert)
INSERT INTO account_settings (account_id, user_creation_permission_level)
VALUES ('account-uuid', 5)
ON CONFLICT (account_id)
DO UPDATE SET user_creation_permission_level = 5;
```

### Permission Levels

| Value | Role | Who Can Create Users |
|-------|------|---------------------|
| 5 | Owner | Only owners (default) |
| 4 | Regional Manager | Regional managers and owners |
| 3 | Manager | Managers, regional managers, and owners |
| 2 | Shift Lead | Shift leads and above |
| 1 | Staff | Everyone (any authenticated user) |

### UI for Account Settings

Owners can configure this setting at:
- **Route:** `/settings/account`
- **Component:** `app/(dashboard)/settings/account/account-settings-client.tsx`

---

## Permission Validation Examples

### Example 1: Owner Creating Manager (✅ Allowed)
```typescript
// Owner has permissions: [1, 2, 3, 4, 5]
// Manager Default has permissions: [1, 2, 3]

const canCreate = [1, 2, 3].every(p => [1, 2, 3, 4, 5].includes(p));
// Result: true (all manager permissions exist in owner's array)
```

---

### Example 2: Manager Creating Owner (❌ Denied)
```typescript
// Manager has permissions: [1, 2, 3]
// Owner Default has permissions: [1, 2, 3, 4, 5]

const canCreate = [1, 2, 3, 4, 5].every(p => [1, 2, 3].includes(p));
// Result: false (4 and 5 are not in manager's array)
```

---

### Example 3: Manager Creating Staff (✅ Allowed)
```typescript
// Manager has permissions: [1, 2, 3]
// Staff Default has permissions: [1]

const canCreate = [1].every(p => [1, 2, 3].includes(p));
// Result: true (staff's permission 1 exists in manager's array)
```

---

## Error Handling & Rollback

If any step fails after the user is created in `auth.users`, the system must rollback:

```typescript
try {
  // Step 1: Create user in auth
  const { data: newUser } = await supabaseAdmin.auth.admin.createUser({...});
  const newUserId = newUser.user.id;

  // Step 2: Assign role and location
  const { error: roleError } = await supabaseAdmin
    .from('user_roles_permissions')
    .insert({
      user_id: newUserId,
      role_permission_id: rolePermissionId,
      location_id: locationId
    });

  if (roleError) {
    // ROLLBACK: Delete auth user
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    throw new Error(`Failed to assign role: ${roleError.message}`);
  }

  // Step 3: Log creation (non-critical, no rollback needed)
  await supabaseAdmin.from('user_audit_logs').insert({...});

} catch (error) {
  return { success: false, error: error.message };
}
```

---

## UI Implementation

The user creation UI is located at:
- **Page:** `app/(dashboard)/settings/users/page.tsx`
- **Client Component:** `app/(dashboard)/settings/users/users-client.tsx`
- **Dialog Form:** `app/(dashboard)/settings/users/create-user-dialog.tsx`
- **Server Actions:** `app/(dashboard)/settings/users/actions.ts`

### User Creation Flow

1. User clicks "Create User" button
2. Dialog opens with form:
   - Email input (required)
   - Full Name input (optional)
   - Role dropdown (auto-filtered to creatable roles)
   - Location selector (auto-selected if only one location)
3. User fills form and submits
4. Server action validates and creates user
5. Page refreshes to show new user
6. Success/error message displayed

### Auto-Selection Behavior

- **Role:** Auto-selected if only one creatable role
- **Location:** Auto-selected and disabled if only one location
- Validation ensures location is always selected

---

## Security Considerations

1. **Permission Subset Validation:** Prevents privilege escalation (users can't create users more powerful than themselves)
2. **Location Access Validation:** Ensures users can only assign access to locations they control
3. **Account Isolation:** Composite PK with location_id ensures proper account boundaries
4. **Audit Logging:** All user creation actions are logged for compliance
5. **Rollback on Failure:** Partial creation is prevented by rollback logic
6. **Email Uniqueness:** System checks for existing users before creation
7. **Admin Client Usage:** All database operations use service role to bypass RLS

---

## Troubleshooting

### User Creation Fails with "Permission Denied"
**Cause:** Creator doesn't have required role_id based on `user_creation_permission_level`
**Solution:** Account owner must lower the `user_creation_permission_level` or upgrade creator's role

### User Creation Fails with "Insufficient Permissions"
**Cause:** Creator trying to assign permissions they don't have
**Solution:** Choose a role with permissions that are a subset of creator's permissions

### User Creation Fails with "Location Access Denied"
**Cause:** Creator trying to assign locations they don't have access to
**Solution:** Only select locations the creator has access to, or have an owner assign the locations

### User Created but Can't See Any Data
**Cause:** User has no location assignments
**Solution:** Assign at least one location in `user_roles_permissions` table

---

## Related Documentation

- **[Roles & Permissions](./roles_and_permissions.md)** — Role definitions and permission structure
- **[Database Schema](./database_schema.md)** — Full database schema reference
- **[User Management Access Control](./user_management_access_control.md)** — Detailed access control logic
- **[Authentication Flow](./auth/authentication.md)** — Login and session management
