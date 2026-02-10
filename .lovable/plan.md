

## Plan: Remove Student Profiling/Consent System + Remove Signup Passcode Barrier

### Part 1: Remove Signup Passcode Requirement

The signup currently requires a passcode (hardcoded as "08132010") which blocks account creation. We'll remove this barrier entirely.

**Files to modify:**

1. **`src/hooks/useAuthFlow.ts`** -- Remove the passcode verification block (lines 50-63), remove imports for `getSecureSetting`, `logSecurityEvent`, `secureStorage`. Simplify signup to just call `supabase.auth.signUp` directly without any passcode check.

2. **`src/components/home/AuthDialog.tsx`** -- Remove the passcode input field and related state (`passcode`, `passcodeError`). The signup form will only need email and password.

---

### Part 2: Remove Student Profiling & Consent System

**Files to delete (7 files):**

| File | Reason |
|------|--------|
| `src/components/classroom/components/ConsentRecordDialog.tsx` | Consent recording UI |
| `src/components/classroom/components/StudentProfilingToggle.tsx` | Profiling on/off toggle |
| `src/hooks/useStudentProfilingStatus.ts` | Fetches profiling/consent status |
| `src/hooks/useConversationProfiling.ts` | Triggers analyze-and-profile edge function |
| `src/hooks/useDistrictConsent.ts` | District-level consent hook |
| `src/components/teacher/dashboard/StudentProfileViewer.tsx` | Profile viewer dialog |
| `supabase/functions/analyze-and-profile/index.ts` | Edge function that analyzes conversations and writes profiles |

**Files to modify (7 files):**

1. **`src/components/classroom/ClassStudentsList.tsx`**
   - Remove imports of `ConsentRecordDialog` and `StudentProfileViewer`
   - Remove `consentDialogStudent` and `profileViewerStudent` state
   - Remove `onOpenConsentDialog` and `onOpenProfileViewer` props from `StudentMetricsTable`
   - Remove the consent dialog and profile viewer rendering at the bottom

2. **`src/components/classroom/components/StudentMetricsTable.tsx`**
   - Remove `useStudentProfilingStatus` import and usage
   - Remove "AI Profiling" table column header
   - Remove `onOpenConsentDialog` and `onOpenProfileViewer` from props
   - Remove `profilingStatus`, `onProfilingUpdate`, `onConsentUpdate` props passed to `StudentTableRow`

3. **`src/components/classroom/components/StudentTableRow.tsx`**
   - Remove `StudentProfilingToggle` import
   - Remove all profiling-related props (`profilingStatus`, `onProfilingUpdate`, `onConsentUpdate`, `onOpenConsentDialog`, `onOpenProfileViewer`)
   - Remove the entire "AI Profiling" table cell (the column with toggle, consent button, and view profile button)

4. **`src/hooks/useVoiceConversation.ts`**
   - Remove the `useConversationProfiling` import
   - Remove the `triggerProfiling` usage
   - Remove the block (lines ~183-199) that calls `analyze-and-profile` edge function after voice sessions

5. **`src/components/practice/hooks/useChatMessages.ts`**
   - Remove `useConversationProfiling` import and `triggerProfiling` usage
   - Remove all profiling-related refs and constants (`profilingTriggeredRef`, `userMessageCountRef`, `PROFILING_INTERVAL`)
   - Remove `triggerProfilingNow` callback and the `useEffect` that triggers profiling on unmount
   - Remove profiling calls in `handleSubmit` and `clearConversation`

6. **`src/components/practice/hooks/useChallengeChat.ts`**
   - Same as useChatMessages: remove all profiling imports, refs, callbacks, and triggers

7. **`src/hooks/useStudentProficiency.ts`**
   - Remove the `student_learning_profiles` query (priority 1 source)
   - Simplify to use certification history first, then fall back to conversation setting

**Edge functions to modify (2 files):**

8. **`supabase/functions/chat-with-tutor/index.ts`**
   - Remove the block that fetches `student_learning_profiles` and `student_conversation_memory`
   - Remove usage of `studentProfile` in the prompt -- AI starts fresh every conversation

9. **`supabase/functions/generate-personalized-flashcards/index.ts`** (if it references learning profiles)
   - Remove or simplify the `student_learning_profiles` query

**Edge function to delete and undeploy:**
- `supabase/functions/analyze-and-profile/` -- delete files and undeploy

---

### Part 3: Database Cleanup

Drop tables that are no longer needed:
- `student_learning_profiles`
- `student_conversation_memory`
- `parental_consent_records`

---

### Summary

| Action | Count |
|--------|-------|
| Files to delete | 7 (6 frontend + 1 edge function) |
| Files to modify | 9 |
| Edge functions to undeploy | 1 |
| DB tables to drop | 3 |
| Result | No passcode needed for signup, no AI memory between conversations, no profiling/consent UI |

