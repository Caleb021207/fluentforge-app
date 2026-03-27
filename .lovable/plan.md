

## Plan: Onboarding Wizard + Teacher Mass Signup

### Overview

After signup, users land on an onboarding wizard (replacing the current `NoProfileState` access-code-only screen). The wizard has 3 steps:
1. **Select role** (Student or Teacher)
2. **Select native & target language**
3. **For teachers**: Option to bulk-create student accounts by entering a roster (emails + passwords). For students: just confirm and go.

A new edge function `bulk-create-students` will use the Supabase Admin API to create student accounts, auto-assign them to the teacher's class, and return credentials.

### Fix Build Error First

**`src/hooks/useVoiceConversation.ts`** line 38 — duplicate `const { awardXP } = useGamification();`. Remove the duplicate line.

---

### Part 1: Onboarding Wizard Component

**Create `src/components/onboarding/OnboardingWizard.tsx`**
- 3-step wizard with progress indicator
- **Step 1 - Role**: Two big cards — "I'm a Student" / "I'm a Teacher"
- **Step 2 - Languages**: Reuse the existing `LanguageSelectField` components for native + target language selection
- **Step 3a (Teacher)**: Shows a "Create Your Class" form (class name) + bulk student roster input (table with rows: name, email, password). Teacher can add/remove rows. A "Create Accounts" button calls the edge function.
- **Step 3b (Student)**: Shows an access code input to join a class (optional, can skip)
- On completion: updates the user's profile (role, native_language, target_language) and navigates to `/profile`

**Modify `src/components/profile/NoProfileState.tsx`**
- Replace the current access-code-only UI with the new `OnboardingWizard` component
- Keep the `onProfileUpdate` callback

**Modify `src/pages/Profile.tsx`**
- No changes needed — it already renders `NoProfileState` when profile has no role

---

### Part 2: Edge Function for Bulk Student Creation

**Create `supabase/functions/bulk-create-students/index.ts`**
- Accepts: `{ students: [{ name, email, password }], class_id: string }`
- Validates JWT — only authenticated teachers can call this
- Uses `supabase.auth.admin.createUser()` for each student (with `email_confirm: true` so they can log in immediately)
- Creates profile entries with role = "student", native/target language from teacher's settings
- Enrolls each student in the teacher's class via `student_enrollments`
- Returns list of created accounts (email + temporary password) so teacher can distribute

---

### Part 3: Profile Update on Wizard Completion

**Modify `src/hooks/useAuthFlow.ts`** or create a helper
- After the wizard, call `supabase.from('profiles').update({ role, native_language, target_language }).eq('id', user.id)`
- For teachers, also create a class record in the `classes` table

---

### Part 4: Auto-confirm Email Signups

Use `cloud--configure_auth` to enable auto-confirm for email signups so teachers and the bulk-created students can log in immediately without email verification.

---

### Database Changes

**Migration**: Add a class creation step during onboarding — no new tables needed, existing `classes`, `student_enrollments`, and `profiles` tables cover everything.

---

### Summary

| Item | Action |
|------|--------|
| Fix duplicate `awardXP` | Remove line 38 in `useVoiceConversation.ts` |
| `OnboardingWizard.tsx` | New component — 3-step role/language/roster wizard |
| `NoProfileState.tsx` | Replace with onboarding wizard |
| `bulk-create-students` edge function | New — uses admin API to create student accounts in bulk |
| Auth config | Enable auto-confirm emails |
| Files modified | 3 |
| Files created | 2 |

