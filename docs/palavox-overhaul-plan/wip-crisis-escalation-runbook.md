# Crisis Escalation Runbook (WIP)

**Plan ref:** 15 §3.4 (crisis-escalation path), 19 #7 (default-approved safety scope).
**Status:** implemented for the detection + learner-facing-message layers (Workstream 0.5);
notification plumbing is `[proposed]` — lands Phase 6. **This document is operational
guidance, not legal advice.** The §3.4 spec notes the full escalation policy requires
policy + legal sign-off before the notification layer ships.

**Code of record:** `supabase/functions/_shared/safetyContext.ts` —
`shouldEscalate()` (detection), `crisisResourceMessage()` / `CRISIS_ESCALATION_LINE`
(learner-facing templates). Keep this document and that module in sync; the test suite
(`tests/server-pure/safetyContext.test.ts`) pins the escalation line's presence in the
strict policy block.

---

## 1. Trigger categories

Detection runs server-side on learner input in `chat-with-tutor` and
`custom-realtime-conversation` (transcript). It is a conservative keyword/pattern screen
for EN/ES/PT/FR that **supplements** provider moderation (plan 15 §3.3 layer A) — it is
not the only net, and it is tuned to avoid false alarms on benign ESL sentences
("I want to learn to kill time" does not trigger).

| Category | What it means | Example signals (not exhaustive) |
|---|---|---|
| `self_harm` | Learner expresses suicidal ideation or intent to self-injure | "kill myself", "I want to die", "suicid…", "me quiero morir", "quero morrer" |
| `abuse` | Learner discloses being physically hurt or unsafe, usually at home | "my stepdad hits me", "scared to go home", "me pega", "me maltratan" |
| `violence` | Learner expresses intent to harm others, or weapon-at-school signals | "I will kill them", "bring a gun to school", "voy a matar a …" |

**Hard rule — no silent blocking.** A crisis-flagged message is never swallowed by a
generic content filter or an empty refusal. The learner always receives the supportive
resource message below. (In `chat-with-tutor` the crisis screen deliberately runs
*before* the legacy blocklist for exactly this reason.)

## 2. Learner-facing message templates

All templates end with the exact escalation line (`CRISIS_ESCALATION_LINE`), written for
a US school context:

> Your safety matters more than any lesson. Please talk to a trusted adult right away —
> your teacher, a school counselor, or a family member. In the United States you can call
> or text 988 (Suicide & Crisis Lifeline) at any time, or text HOME to 741741 to reach
> the Crisis Text Line.

Category-specific openers (from `crisisResourceMessage()`):

| Category | Full message |
|---|---|
| `self_harm` | "Thank you for telling me — that took courage." + escalation line |
| `abuse` | "I am so sorry this is happening. It is not your fault." + escalation line |
| `violence` | "It sounds like someone could get hurt, and that is serious." + escalation line |
| (uncategorized) | "I am glad you told me." + escalation line |

The same guidance is embedded in every AI system prompt via
`buildSafetyPolicyBlock()`, so the tutor model itself redirects-and-refers when it
recognizes crisis content the keyword screen missed.

`[proposed]` Localization: templates are English-only today. Localized variants across
the 41 UI languages, plus region-appropriate helplines for non-US deployments, are a
localization-phase work item (plan 13; 15 §3.4a "localized").

## 3. What gets logged

**No verbatim minors' content in logs — ever.** A crisis event logs **category +
timestamp + user id only** (the id is needed for staff follow-up and is consistent with
the IDs-only logging rule, plan 15 R9):

```
safety_event: category=self_harm user=<uuid> at=<ISO timestamp>
```

Currently these are edge-function console logs (visible in Supabase function logs).
`[proposed]` Phase 6: a service-role-write `safety_event` row adjacent to
`data_access_audit` (plan 15 §3.4b) — category, learner id, tenant, timestamp,
transcript *reference* (never raw text) — so events are queryable rather than buried in
log streams.

## 4. Teacher / admin notification path `[proposed — notification plumbing lands Phase 6]`

Nothing is auto-sent today; there is no notification infrastructure in the current
codebase. The target path per plan 15 §3.4c–d:

1. For rostered minors, a privacy-preserving flag (category + date, **not** the
   transcript) surfaces to the school's designated contact, per the district's
   configured escalation policy in `district_settings`.
2. Never auto-contact external parties (parents, authorities, hotlines) without a
   configured, consented path — district policy decides who is notified and how.
3. Delivery mechanism (in-app teacher dashboard flag vs. email digest) is a Phase 6
   design decision requiring the notification plumbing plus policy + legal sign-off.

Until that lands, discovery of safety events is manual: support staff reviewing
function logs (see §5).

## 5. What support staff should do

When a `safety_event` log entry is found (or a school reports a concern):

1. **Do not pull the learner's transcript by default.** Confirm the event via the log
   line (category + timestamp + user id). Access the underlying conversation only if
   the school's designated contact requests it through the proper channel — that read
   is a FERPA-sensitive access and must be audited (`data_access_audit` once wired,
   plan 15 §4.3 `[proposed]`).
2. **Notify the school's designated contact** (teacher/admin of record for the
   learner's class) with category + date only. `[proposed]` formal contact registry in
   `district_settings`; until then, use the class's teacher of record.
3. **Never contact the learner directly** outside the product, and never contact
   parents/guardians directly — that is the school's role under its own policies.
4. **For `violence` signals involving weapons at school:** treat as urgent; escalate to
   the school contact the same day.
5. **Record the action taken** (who was notified, when) in the internal support
   tracker. `[proposed]` Phase 6 moves this into the `safety_event` row lifecycle.
6. Support staff are not crisis counselors: do not attempt clinical assessment. The
   product's job is redirect-and-refer (988 / Crisis Text Line / trusted adult), and
   the school's job is intervention.

## 6. Known limitations (honest state)

- Keyword screening is best-effort EN/ES/PT/FR; the other UI languages rely on the
  system-prompt policy + provider moderation (`[requires validation]` multilingual
  moderation accuracy, plan 15 §7.6).
- Deliberately conservative matching means some real disclosures (e.g. an unqualified
  "he touched me") will not keyword-match; the injected policy block instructs the
  model to redirect-and-refer in those cases, and provider output moderation
  (plan 15 §3.3) is the layer that closes this gap when it lands.
- Realtime voice (`premium-voice-realtime`) carries the policy in session instructions
  but has no server-side transcript screen mid-session (15 §3.3 option D limit);
  post-session transcript review is the compensating control `[proposed]`.
- No notification plumbing yet (§4) — events are log-only until Phase 6.
