# Authentication System - RBAC

**Version:** 2.0
**Last Updated:** 2025-11-15
**Status:** ✅ Implemented

---

## Overview

The Certus Operations Dashboard uses **Supabase Auth with Magic Links** for passwordless authentication, combined with a **Role-Based Access Control (RBAC)** system for granular permissions management.

**Key Features:**
- Passwordless magic link authentication
- Pre-populated `auth.users` table (users must be added by admin)
- Flexible role-permission mapping
- Multiple permission sets per role
- Audit logging for user changes

---

## Database Schema

### Core Tables

#### 1. `roles`
Defines available roles in the system.

```sql
CREATE TABLE public.roles (
  role_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_role_permission_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Roles:**
1. **staff** - Regular crew member at one location
2. **shift_lead** - Senior staff member who leads shifts
3. **manager** - Store/location manager
4. **regional_manager** - Manages multiple locations in a region
5. **owner** - Franchise/business owner with full system-wide access

#### 2. `permissions`
Defines individual permissions.

```sql
CREATE TABLE public.permissions (
  permission_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Permissions:**
- `permission_1` - Basic permission level 1
- `permission_2` - Basic permission level 2
- `permission_3` - Basic permission level 3
- `permission_4` - Basic permission level 4
- `permission_5` - Basic permission level 5

#### 3. `roles_permissions`
Maps roles to sets of permissions (bridge table).

```sql
CREATE TABLE public.roles_permissions (
  role_permission_id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(role_id),
  permission_ids INTEGER[] NOT NULL DEFAULT '{}',
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE(role_id, name)
);
```

**Key Points:**
- One role can have multiple permission sets
- `permission_ids` is an array of permission IDs
- Each permission set has a unique name per role
- Example: "Manager Default", "Manager Advanced", etc.

**Example Data:**
```sql
-- Role 1 (staff) gets permission 1
INSERT INTO roles_permissions (role_id, permission_ids, name, description)
VALUES (1, ARRAY[1], 'Staff Default', 'Default permission set for staff role');

-- Role 5 (owner) gets all permissions 1-5
INSERT INTO roles_permissions (role_id, permission_ids, name, description)
VALUES (5, ARRAY[1, 2, 3, 4, 5], 'Owner Default', 'Full access');
```

#### 4. `user_roles_permissions`
Assigns permission sets to users.

```sql
CREATE TABLE public.user_roles_permissions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role_permission_id INTEGER REFERENCES roles_permissions(role_permission_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Points:**
- Links user UUID to a specific role-permission set
- One user = one permission set at a time
- No `account_id` column (look up via relationships)

#### 5. `user_audit_logs`
Tracks all changes to user permissions.

```sql
CREATE TABLE public.user_audit_logs (
  audit_log_id SERIAL PRIMARY KEY,
  modified_user_id UUID REFERENCES auth.users(id),
  modified_by_user_id UUID REFERENCES auth.users(id),
  action TEXT CHECK (action IN ('created', 'updated', 'deleted', 'role_changed')),
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Points:**
- `modified_user_id` - User whose permissions were changed
- `modified_by_user_id` - User who made the change
- `changes` - JSONB object with before/after values

---

## Authentication Flow

### Pre-requisites

Users must be manually added to two tables before they can log in:

1. **`auth.users`** (Supabase managed) - Contains email and UUID
2. **`user_roles_permissions`** - Maps their UUID to a permission set

### Login Flow

#### Step 1: User Enters Email ([app/login/page.tsx](../../app/login/page.tsx:38-88))

User visits `/login` and enters their email address.

#### Step 2: Server-Side Validation ([app/login/actions.ts](../../app/login/actions.ts:5-43))

```typescript
// Server action checks if user exists
export async function checkUserExists(email: string) {
  // Create admin client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if user exists in auth.users
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    return { exists: false, hasPermissions: false }
  }

  // Check if user has permissions assigned
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
```

**Validation Results:**
- **Email not in `auth.users`** → "Email not found. Please contact your administrator."
- **Email in `auth.users` but not in `user_roles_permissions`** → "No permissions assigned. Please contact your administrator."
- **Both pass** → Send magic link

#### Step 3: Send Magic Link

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: normalizedEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})
```

Supabase sends branded email with magic link button.

#### Step 4: User Clicks Magic Link

User receives email and clicks the "Sign In" button, which redirects to `/auth/callback?code=xyz123...`

#### Step 5: Callback Verification ([app/auth/callback/route.ts](../../app/auth/callback/route.ts:10-38))

```typescript
// Exchange code for session
const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

if (!error && user) {
  // Double-check permissions before allowing access
  const { data: userPermission, error: permissionError } = await supabase
    .from('user_roles_permissions')
    .select('user_id, role_permission_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (permissionError || !userPermission) {
    // No permissions = sign out and redirect with error
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_permissions`)
  }

  // Success - redirect to dashboard
  return NextResponse.redirect(`${origin}/overview`)
}
```

#### Step 6: Session Active

- User is logged in
- Session stored in HTTP-only cookies
- Middleware protects all dashboard routes
- Session auto-refreshes

#### Step 7: Location Access Determination (Two-Tier Pattern)

After successful authentication, the system determines which location(s) the user can access.

**Tier 1: Franchise Owner (Multi-Location Access)**

If user has `role_permission_id = 5` (owner permissions):

```typescript
// Check if user has an account (franchise owner)
const { data: accountData } = await supabaseAdmin
  .from('accounts')
  .select('account_id, email')
  .eq('email', user.email)
  .maybeSingle();

if (accountData) {
  // Fetch ALL locations for this account
  const { data: allLocations } = await supabaseAdmin
    .from('locations')
    .select('location_id, name, certus_notification_email')
    .eq('account_id', accountData.account_id);

  if (allLocations && allLocations.length > 0) {
    locations = allLocations;

    // Use selected location from URL param, or default to first location
    if (searchParams.locationId) {
      const locationIdNum = parseInt(searchParams.locationId);
      selectedLocation = locations.find(loc => loc.location_id === locationIdNum) || locations[0];
    } else {
      selectedLocation = locations[0];
    }
  }
}
```

**Franchise Owner Capabilities:**
- Access to **all locations** under their account
- Can switch between locations via URL parameter (`?locationId=123`)
- Location selector shown in UI
- Default to first location if no selection

**Tier 2: Single Location Manager**

If not a franchise owner or no account found, fall back to email-based lookup:

```typescript
// Single location manager - look up by email
const { data: locationResults } = await supabaseAdmin
  .from('locations')
  .select('location_id, name, certus_notification_email')
  .eq('certus_notification_email', user.email)
  .limit(1);

if (locationResults && locationResults.length > 0) {
  selectedLocation = locationResults[0];
  locations = [selectedLocation]; // Only one location
}
```

**Single Location Manager Capabilities:**
- Access to **one specific location** only
- No location selector in UI (fixed to their location)
- Tied to location via `certus_notification_email` field
- Cannot switch locations

**No Access Scenario:**

If neither pattern matches (no account AND email not in locations):

```typescript
if (!selectedLocation) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>No Location Found</h2>
      <p>No location is associated with {user.email}.</p>
      <p>Please contact your administrator.</p>
      <button>Sign Out</button>
    </div>
  );
}
```

**Implementation References:**
- [app/(dashboard)/overview/page.tsx](../../app/(dashboard)/overview/page.tsx:34-112) — Reference implementation
- [app/(dashboard)/call-logs/page.tsx](../../app/(dashboard)/call-logs/page.tsx:34-112) — Same pattern
- Both pages implement identical location access logic

---

## Row Level Security (RLS)

### Policies Created

#### `user_roles_permissions` Table

```sql
ALTER TABLE public.user_roles_permissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
  ON public.user_roles_permissions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin users can manage permissions
CREATE POLICY "Admins can manage permissions"
  ON public.user_roles_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles_permissions urp
      JOIN roles_permissions rp ON urp.role_permission_id = rp.role_permission_id
      JOIN roles r ON rp.role_id = r.role_id
      WHERE urp.user_id = auth.uid() AND r.name = 'owner'
    )
  );
```

#### `roles`, `permissions`, `roles_permissions` Tables

```sql
-- All authenticated users can read roles and permissions
CREATE POLICY "Authenticated users can read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read role-permission mappings"
  ON public.roles_permissions FOR SELECT
  TO authenticated
  USING (true);
```

#### `user_audit_logs` Table

```sql
-- Owners can view all audit logs
-- Regular users can view logs related to themselves
CREATE POLICY "Users can view relevant audit logs"
  ON public.user_audit_logs FOR SELECT
  USING (
    auth.uid() = modified_user_id OR
    auth.uid() = modified_by_user_id OR
    EXISTS (
      SELECT 1 FROM user_roles_permissions urp
      JOIN roles_permissions rp ON urp.role_permission_id = rp.role_permission_id
      JOIN roles r ON rp.role_id = r.role_id
      WHERE urp.user_id = auth.uid() AND r.name = 'owner'
    )
  );
```

---

## Implementation Files

### Core Auth Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Protects dashboard routes, refreshes sessions |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/server.ts` | Server-side Supabase client (with cookies) |
| `app/login/page.tsx` | Login page with email validation |
| `app/login/actions.ts` | Server action to check user existence |
| `app/auth/callback/route.ts` | Handles magic link callback and permission check |
| `components/auth/sign-out-button.tsx` | Reusable sign-out component |

### Protected Routes

All routes under these patterns require authentication:
- `/overview`
- `/call-logs`
- `/analytics`
- `/settings/*`

Unauthenticated users are redirected to `/login`.

---

## Supabase Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For server actions
```

### URL Configuration (Supabase Dashboard)

**Authentication → URL Configuration:**

Development:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

Production:
- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:**
  - `https://your-domain.vercel.app/auth/callback`
  - `https://your-domain.vercel.app/**`

### Email Templates

**Authentication → Email Templates → Magic Link**

Certus-branded email template with dark mode support:

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">

  <!-- Certus Logo/Header -->
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 28px; font-weight: 700; color: #ef4444; margin: 0;">
      Certus
    </h1>
  </div>

  <!-- Main Content Card -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 32px;">

        <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 16px 0; text-align: center;">
          Welcome Back
        </h2>

        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0 0 32px 0;">
          Tap the button below to sign in to your account
        </p>

        <!-- Sign In Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 32px 0;">
              <a href="{{ .ConfirmationURL }}"
                 style="display: inline-block; font-size: 16px; font-weight: 600; padding: 12px 32px; background: #ef4444; color: #ffffff !important; text-decoration: none; border-radius: 12px;">
                Sign In
              </a>
            </td>
          </tr>
        </table>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">
            Or copy and paste this link:
          </p>
          <p style="font-size: 12px; word-break: break-all; margin: 0;">
            <a href="{{ .ConfirmationURL }}" style="color: #ef4444 !important; text-decoration: none;">{{ .ConfirmationURL }}</a>
          </p>
        </div>

      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
    <tr>
      <td align="center">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">
          This link expires in 1 hour
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          Need help? <a href="mailto:support@certus.com" style="color: #ef4444 !important; text-decoration: none; font-weight: 500;">Contact support</a>
        </p>
      </td>
    </tr>
  </table>

</div>
```

---

## User Management

### Adding New Users

Users must be added in this order:

1. **Add to `auth.users`** (via Supabase Dashboard or Admin API)
2. **Add to `user_roles_permissions`**

```sql
-- Step 1: Get user UUID from auth.users
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Step 2: Assign permission set
INSERT INTO user_roles_permissions (user_id, role_permission_id)
VALUES ('user-uuid-from-step-1', 1);  -- 1 = Staff Default permission set
```

### Creating Custom Permission Sets

```sql
-- Create a custom "Manager Advanced" permission set
INSERT INTO roles_permissions (role_id, permission_ids, name, description)
VALUES (
  3,  -- manager role_id
  ARRAY[1, 2, 3, 4],  -- permissions 1-4
  'Manager Advanced',
  'Extended permissions for senior managers'
);

-- Assign to a user
UPDATE user_roles_permissions
SET role_permission_id = (
  SELECT role_permission_id FROM roles_permissions
  WHERE role_id = 3 AND name = 'Manager Advanced'
)
WHERE user_id = 'user-uuid';
```

### Changing User Permissions

```sql
-- Change user's permission set
UPDATE user_roles_permissions
SET
  role_permission_id = 5,  -- New permission set ID
  updated_at = NOW()
WHERE user_id = 'user-uuid';

-- Log the change in audit table
INSERT INTO user_audit_logs (
  modified_user_id,
  modified_by_user_id,
  action,
  changes
) VALUES (
  'user-uuid',
  'admin-user-uuid',
  'role_changed',
  '{"old_role_permission_id": 1, "new_role_permission_id": 5}'::jsonb
);
```

### Revoking Access

```sql
-- Remove user's permissions (they can't log in anymore)
DELETE FROM user_roles_permissions WHERE user_id = 'user-uuid';

-- Log the revocation
INSERT INTO user_audit_logs (
  modified_user_id,
  modified_by_user_id,
  action,
  changes
) VALUES (
  'user-uuid',
  'admin-user-uuid',
  'deleted',
  '{"reason": "User left company"}'::jsonb
);
```

---

## Security Considerations

### Current Implementation

✅ **Strengths:**
- Users must be pre-approved (added to `auth.users` by admin)
- Double permission check (login + callback)
- Service role key only used server-side
- RLS policies protect sensitive data
- Audit trail for all permission changes
- Magic links (no password to leak)
- HTTP-only session cookies

✅ **RBAC Benefits:**
- Flexible permission management
- Multiple permission sets per role
- Easy to add new permissions
- Clear audit trail

### Rate Limits

Current Supabase rate limits:
- **Email sending:** 30 per hour
- **Sign-in attempts:** 30 per 5 minutes per IP
- **Token refreshes:** 30 per 5 minutes per IP

---

## Testing the Auth Flow

### Test Scenario 1: Successful Login

1. Ensure user exists in `auth.users` and `user_roles_permissions`
2. Visit `/login`
3. Enter email → "Check your email for the magic link!"
4. Click magic link in email
5. Redirected to `/overview`
6. User is logged in with correct permissions

### Test Scenario 2: Email Not in auth.users

1. Enter email that doesn't exist in `auth.users`
2. Should see "Email not found. Please contact your administrator."

### Test Scenario 3: No Permissions Assigned

1. User exists in `auth.users` but not in `user_roles_permissions`
2. Enter email → "No permissions assigned. Please contact your administrator."

### Test Scenario 4: Sign Out

1. While logged in, click avatar dropdown in top-right
2. Click "Sign Out"
3. Redirected to `/login`
4. Middleware blocks access to dashboard

---

## Troubleshooting

### "Email not found" error

**Check:**
1. User exists in `auth.users`: `SELECT * FROM auth.users WHERE email = 'user@example.com'`
2. Email is correctly formatted (lowercase, trimmed)
3. Service role key is set in `.env.local`

### "No permissions assigned" error

**Check:**
1. User has row in `user_roles_permissions`
2. `role_permission_id` points to valid `roles_permissions` row
3. RLS policies are correct

### Magic link not received

**Check:**
1. Supabase email template is correctly formatted (no `<style>` tags)
2. Email rate limits not exceeded (30/hour)
3. Spam folder
4. Supabase Auth logs for errors

### Session expires immediately

**Check:**
1. Callback route is working: `/auth/callback`
2. Middleware is refreshing sessions
3. Browser cookies are enabled
4. No conflicting middleware redirects

---

## Related Documentation

- [Architecture](../architecture.md) - Overall system architecture
- [PRD](../prd.md) - Product requirements and user stories
- [Page Map](../ux/page_map.md) - User flows and navigation
