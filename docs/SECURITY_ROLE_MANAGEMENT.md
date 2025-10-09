# User Roles & Authorization Security

## ⚠️ CRITICAL: Role Management Architecture

### Authorization (SECURITY-CRITICAL)

**Source of Truth:** `user_roles` table
- Primary table for all authorization decisions
- Backed by `app_role` enum ('admin', 'moderator', 'user')
- Protected by Row-Level Security (RLS)

**Check Function:** `has_role(user_id, role)`
- Security definer function (runs with elevated privileges)
- Prevents RLS recursion issues
- Used in ALL RLS policies for role-based access

**Used In:**
- All RLS policies on sensitive tables
- Backend authorization checks
- Server-side validation

### Display Only (NOT FOR AUTHORIZATION)

**Source:** `profiles.role` (text field)
- **Purpose:** Frontend display ONLY (user dashboard, UI labels)
- **Protection:** Database trigger prevents updates after initial insert
- **DO NOT USE FOR:** Authorization decisions, access control, security checks

**Database Protection:**
```sql
-- Trigger prevents role manipulation
CREATE TRIGGER enforce_role_immutability
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_update();
```

## 🔒 Security Best Practices

### When Adding Role Checks:

✅ **CORRECT - Use has_role():**
```typescript
// Backend/RLS Policy
const { data } = await supabase.rpc('has_role', { 
  _user_id: userId, 
  _role: 'admin' 
});

// In RLS Policy
CREATE POLICY "Admins only"
ON some_table
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

❌ **WRONG - Direct role query:**
```typescript
// NEVER DO THIS!
const { data } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();

if (data.role === 'admin') { /* ... */ }
```

### Role Assignment:

✅ **CORRECT - Use user_roles table:**
```sql
-- Grant admin role
INSERT INTO user_roles (user_id, role)
VALUES (user_id, 'admin');

-- Revoke admin role
DELETE FROM user_roles
WHERE user_id = user_id AND role = 'admin';
```

❌ **WRONG - Update profiles.role:**
```sql
-- This will FAIL with trigger error
UPDATE profiles 
SET role = 'admin' 
WHERE id = user_id;
```

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           AUTHORIZATION (Secure)                │
├─────────────────────────────────────────────────┤
│  user_roles table                               │
│  ↓                                              │
│  has_role() function (SECURITY DEFINER)        │
│  ↓                                              │
│  RLS Policies                                   │
│  ↓                                              │
│  Access Granted/Denied                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           DISPLAY (Cosmetic)                    │
├─────────────────────────────────────────────────┤
│  profiles.role (READ-ONLY)                     │
│  ↓                                              │
│  Frontend UI Labels                            │
│  ↓                                              │
│  User Dashboard Display                        │
└─────────────────────────────────────────────────┘
```

## 🔍 Security Audit Results

**Audit Date:** 2025-10-09
**Status:** ✅ SECURE

### Findings:
- ✅ Authorization uses separate `user_roles` table
- ✅ All RLS policies use `has_role()` security definer function
- ✅ No client-side code attempts to modify `profiles.role`
- ✅ Database trigger prevents accidental/malicious role updates
- ✅ Clear separation between display and authorization

### Risk Assessment: **LOW**
- `profiles.role` cannot be used for privilege escalation
- All authorization decisions use secure backend functions
- Frontend display is cosmetic only and cannot affect access control

### Compliance Status:
- **FERPA:** ✅ Compliant (user roles securely managed)
- **Security Best Practices:** ✅ Compliant
- **Principle of Least Privilege:** ✅ Implemented

## 🚨 Common Mistakes to Avoid

### Mistake 1: Using profiles.role for Authorization
```typescript
// ❌ INSECURE - Can be manipulated
const profile = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();

if (profile.data.role === 'admin') {
  // Attacker could potentially manipulate this
}
```

### Mistake 2: Client-Side Role Checks Only
```typescript
// ❌ INSECURE - Client can be bypassed
const userRole = localStorage.getItem('userRole');
if (userRole === 'admin') {
  // Attacker can set localStorage
}
```

### Mistake 3: Hardcoded Credentials
```typescript
// ❌ INSECURE - Credentials exposed in code
const ADMIN_EMAILS = ['admin@example.com'];
if (ADMIN_EMAILS.includes(user.email)) {
  // Anyone can read source code
}
```

## 📝 Migration History

### 2025-10-09: Quick Fix Implementation
- Added `prevent_role_update()` trigger function
- Created `enforce_role_immutability` trigger
- Added database comment documenting display-only status
- **Impact:** Hardened security, prevented role manipulation

### Pre-existing Architecture:
- `user_roles` table created with `app_role` enum
- `has_role()` security definer function implemented
- RLS policies using `has_role()` for authorization
- **Status:** Already secure, quick fix added extra protection

## 🔗 Related Documentation

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [FERPA Compliance Guide](../FERPA_COMPLIANCE.md)

## 📞 Questions?

If you're unsure whether to use `profiles.role` or `has_role()`:
- **Always use `has_role()`** for authorization
- Only use `profiles.role` for display purposes
- When in doubt, ask the security team
