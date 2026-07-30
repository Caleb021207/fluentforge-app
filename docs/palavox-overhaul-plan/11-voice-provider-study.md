# 11 — Voice Provider Study (Synthesis)

**Status:** Planning deliverable — no implementation.
**Author:** Voice Infrastructure, Provider, Concurrency, and Cost Analyst (synthesis role).
**Date:** 2026-07-30. Repo `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`.
**Sources:** `wip-11a-voice-current-state.md` (current stack, verified against code), `wip-11b-research-s2s.md`, `wip-11c-research-stt-tts-pron.md`, `wip-11d-research-orchestration.md`. External URLs and access dates are in those docs; this synthesis cites them by section rather than repeating every URL.
**Labels:** [observed] (repo evidence, file:line) · [documented] (vendor docs, URL+date in source doc) · [reported] (third party) · [estimated] (our math, assumptions shown) · [proposed] (design decision for the overhaul) · [assumption] (unvalidated planning input) · [requires validation] (must be measured/confirmed before commitment).
**Convention:** "Current behavior" = what ships today on `overhaul@7cbaadd9`. "Proposed behavior" = the overhaul design in this doc. They are kept separate in every section.

---

## 1. Current-state recap (from 11a, spot-re-verified 2026-07-30)

### 1.1 The three live voice paths [observed]

| Path | Wire | Providers | Key files |
|---|---|---|---|
| **P1 "GPT-4o Realtime" (premium)** | WebRTC direct browser→OpenAI; Supabase edge fn mints ephemeral token | OpenAI Realtime (mint `gpt-realtime-2025-08-28` at `supabase/functions/premium-voice-realtime/index.ts:122`; SDP URL requests `gpt-4o-realtime-preview-2024-12-17` at `src/utils/RealtimeAudioManager.ts:272`) | `premium-voice-realtime/index.ts`, `RealtimeAudioManager.ts`, `PremiumVoicePractice.tsx` |
| **P2 "Custom Realtime AI" (premium)** | Request/response per turn: record → base64 → edge fn | Gemini 2.5 Flash STT + Gemini chat (Lovable gateway) + Azure multi-voice SSML TTS | `custom-realtime-conversation/index.ts`, `CustomRealtimeManager.ts` |
| **P3 Free voice chat** | Server STT (Gemini via `transcribe-audio`) with browser-STT fallback → `chat-with-tutor` text LLM → Azure TTS with browser-TTS fallback | Lovable/Gemini, Azure, browser APIs | `VoiceChat.tsx`, `useVoiceSpeechRecognition.ts`, `text-to-speech/index.ts` |

Plus four async LLM analysis functions (`analyze-pronunciation`, `analyze-speaking`, `analyze-conversation-quality`, `generate-pronunciation-phrase`) — all Gemini-over-text; **no acoustic signal reaches any scorer** (11a §9) [observed].

History [observed]: ElevenLabs Conversational AI powered voice until ~Apr 2025 (`package.json:15` still carries dead `@11labs/react`); OpenAI Realtime landed Oct 2025; the ~5-concurrent ElevenLabs cap that motivated the move is consistent with ElevenLabs' documented Creator-tier concurrency of 5 (11b §4.2) but the specific billing history is [requires validation] with the owner.

### 1.2 The 16 defects (D1–D16, 11a §14) — condensed

Re-verified spot checks this session [observed]: D1 identical-branch ternary at `supabase/functions/track-usage/index.ts:55`; D2 hardcoded foreign project URL `dukpljcweixxmpkiblwo.functions.supabase.co` at `RealtimeAudioManager.ts:202-204` vs `supabase/config.toml:1` `project_id = "afswfqougbfiqbkchoqj"`; D3 model mismatch (mint vs SDP above); D4 token fetch sends no body (`RealtimeAudioManager.ts:204-211`) so CEFR/language personalization is dead server-side.

| # | Sev | One-liner |
|---|---|---|
| D1 | H | Premium 15-min/month cap reads a counter nothing increments — the only real ceilings are 30 token-mints/day and a client timer |
| D2 | H | Hardcoded foreign Supabase project URL for realtime token mint |
| D3 | H | Mint model ≠ SDP model; which model serves (and bills) is unknown |
| D4 | H | Client sends no body → every learner gets the B1/English default prompt |
| D5 | H | "Pronunciation analysis" = LLM judging a browser-ASR transcript; phoneme/prosody fields permanently empty; penalizes accented speakers |
| D6 | M | Zero concurrency admission control at any layer (per-user or platform) |
| D7 | M | `sendBeacon` targets nonexistent `track-session-end`; cleanup fn has no scheduler |
| D8 | M | Quota accounting trusts client-supplied `userId`/duration; premium-pipeline STT never tracked; STT "seconds" = chunk count |
| D9 | M | Unescaped text interpolated into Azure SSML (injection/breakage) |
| D10 | M | "Whisper" branding everywhere; actual STT is Gemini prompt-transcription fed webm mislabeled `wav` |
| D11 | M | Custom-mode VAD hardcodes `en-US`; Firefox degrades to 15-s timer; no barge-in |
| D12 | M | No reconnection/ICE-restart; no Safari/iOS audio handling anywhere |
| D13 | L | Large dead/legacy surface (ElevenLabs dep, duplicate TTS utils, dead event handlers, stale marketing copy) |
| D14 | L | Base64 spread stack-overflow risk; 128 vs 32 kbps inconsistency |
| D15 | L | TTS cache per-tab, 5-min TTL — classrooms re-buy identical curriculum audio |
| D16 | L | Minors' voice-derived data retention/FERPA posture undocumented |

**Strengths to preserve** (11a §13) [observed]: ephemeral-token mint pattern; fail-closed service-role rate limiting (`_shared/authGuard.ts:24-91`); CEFR bilingual-ratio prompt tables; multi-voice SSML bilingual synthesis; graceful degradation ladders (server→browser STT/TTS); recent-phrase dedupe.

**Structural conclusion carried into the design:** the current stack has *no pronunciation signal, no concurrency control, no working cost control, and no server-side session authority*. Any provider choice must fix those four; no provider fixes them for us.

---

## 2. Provider decision matrix

### 2.1 Options scored

Conversation-capable options (S2S vendors from 11b; the modular pipeline from 11c+11d is scored as one option since its components are swappable):

- **O1** OpenAI gpt-realtime-2.1 (flagship S2S) — incumbent architecture
- **O2** OpenAI gpt-realtime-2.1-mini (S2S)
- **O3** Azure Voice Live (same gpt-realtime family under Microsoft terms; GA) — second source for O1/O2
- **O4** Google Gemini Live (3.1-flash-live-preview, S2S)
- **O5** Amazon Nova 2 Sonic (S2S, Bedrock)
- **O6** Hume EVI 3 / 4-mini (S2S)
- **O7** xAI Grok Voice Agent (S2S, beta)
- **O8** ElevenLabs Agents (cascaded managed platform; historical incumbent)
- **O9** Modular cascaded pipeline: Deepgram Nova-3-multilingual or AssemblyAI Universal-Streaming STT + mini-class text LLM + Azure Neural TTS + Azure Pronunciation Assessment, orchestrated on LiveKit/Pipecat (11c §§2-4, 11d §§1-2)
- **O10** Vapi / Retell managed voice-agent platforms (scored jointly; 11d §§2.3-2.4)

### 2.2 Scores

Scale 0–5 (5 best). Every score is [estimated] — a synthesis judgment over the [documented]/[reported] evidence in 11b/11c/11d; the evidence label in the "basis" column governs. **Beginner/accented EN+ES recognition has no published benchmark for any vendor — that entire row is capped [requires validation] pending §5's eval set.**

| Criterion (weight) | O1 RT-2.1 | O2 RT-mini | O3 AzVoiceLive | O4 Gemini | O5 Nova2 | O6 Hume | O7 Grok | O8 11Labs | O9 Pipeline | O10 Vapi/Retell | Basis |
|---|---|---|---|---|---|---|---|---|---|---|---|
| EN+ES beginner/accented recognition (H) | 3? | 2? | 3? | 3? | 3? | 2? | 2? | 3? | **4?** (Nova-3 10-lang / U-3 Pro 6-lang code-switch claims; Speechmatics Melia wildcard) | 3? | [reported claims]; all "?" = [requires validation] |
| Phoneme-level pronunciation data (H) | 0 | 0 | 1 (same contract family as Azure PA) | 0 | 0 | 0 | 0 | 0 | **5** (Azure PA: IPA phonemes, NBestPhonemes, es-ES/es-MX) | 0 | [documented] 11c §4; no S2S API returns phonemes (11b §8.1) |
| Latency (M) | 4 (TTFA ~1.0–1.2 s) | 4 | 4 | 3 (0.63 s fast model is the weak reasoner; 3 s high) | 4 (1.14 s) | 3 | 4 | 3 (~1 s+ pipeline) | 3 (500–800 ms tuned; 600–1,300 typical) | 3 | [reported] AA / 11d §4 |
| Turn detection / barge-in (H) | 5 (server + **semantic VAD**, truncate) | 5 | 5 | 4 (tunable VAD, proactive audio) | 4 | 3 | 3 | 4 | **5** (Smart Turn v3: open weights, 23 langs incl. ES, ~12 ms; LiveKit turn-detector) | 4 | [documented] 11b §§2-3, 11d §1 |
| Speaking-speed control (M) | **5** (output `speed` 0.25–1.5) | 5 | 5 | 1 (prompt-only) | 1 | 3 (instructible prosody) | 2 | 4 (per-voice speed) | **5** (SSML prosody rate + per-voice params) | 3 | [documented] 11b §2.2, 11c §3 |
| Browser/mobile: Safari/iOS + Chromebook (H) | 4 (WebRTC+WS) | 4 | 4 | 4 (WSS 443) | 1 (**no browser endpoint; server proxy mandatory**) | 3 | 3 | 4 | 4 (WebRTC via LiveKit/Daily incl. iOS Safari; WS fallback) | 3 | [documented] 11b §§2-5, 11d §7 |
| School-network viability (H) | 4 (WS fallback; WebRTC needs TURN/TLS 443) | 4 | 4 | 4 | 2 | 3 | 3 | 3 | **5** (managed TURN/TLS 443, WS fallback transport, Pattern F floor) | 3 | [documented/reported] 11d §7 |
| Concurrency ceiling + raise process (H) | 4 (no session cap; TPM tiers T3≈80…T5≈1,500 [estimated]; auto tier growth) | 4 | 4 (Azure quota tickets) | **1** (docs say T2≈1,000 but 50 enforced per [reported] forum thread) | 2 (quota unpublished; console check) | 1 (plan caps 5→30) | 2 (undocumented) | 2 (plan caps 4→40; burst 2×) | 4 (Deepgram 150–225 WSS / AAI 100 streams-min / Azure ~100 default, all raisable; LiveKit Scale 600 agents) | 3 (pay-per-line) | [documented/reported] 11b §§2-7, 11c §5.2, 11d §6 |
| Privacy / K-12 posture (H) | 3 (ZDR-eligible; DPA; no EDU program) | 3 | **5** (Microsoft EDU terms districts already accept) | 2 (developer API weak for minors; Vertex route needed) | 4 (AWS agreements; in-region; no training) | 1 (emotion AI on minors = red flag) | 1 | 2 (ZRM enterprise-only) | 4–5 (Azure PA/TTS under Azure terms; STT vendor DPA needed; self-host = strongest story) | 1 (ZDR $1k/mo add-on) | [documented] 11b §§2.6-7, 11c §6, 11d §8 |
| Retention controls (M) | 4 (30-day default; ZDR realtime by approval) | 4 | 4 | 3 (55-day; ZDR per-project; resumption caveat) | 4 | 2 | 1 | 3 | 4 (Deepgram zero-retention default; AAI opt-out+delete; Azure region-pinned) | 2 | [documented] same |
| Observability (M) | 3 (event stream; you build metrics) | 3 | 3 | 3 | 2 | 2 | 2 | 4 (built-in convo storage) | **5** (own the pipeline: per-stage timings, transcripts, recordings) | 4 (dashboards) | [documented/estimated] |
| Lock-in (M) | 4 (largest ecosystem + Azure second source) | 4 | 3 (Azure-only surface) | 2 (preview churn; Google-only) | 1 (AWS transport+model) | 1 | 1 | 2 | **5** (every stage swappable; OSS orchestration) | 1 (runtime is theirs) | [documented/estimated] 11b, 11d |
| Implementation complexity on our stack (M) | **5** (already built) | 5 (config change) | 4 | 3 (WS proxy or client WS + token svc) | 1 (SigV4 HTTP/2 proxy or AgentCore) | 3 | 3 | 3 (SDK re-adopt) | 2 (**new agent-host component required** — §3.4) | 4 | [observed] current code + [estimated] |
| Cost at scale (H) | 1 ($0.052/min → $31k/mo @600k min) | 3 ($0.018 → $10.8k) | 2–3 (Azure rates TBD) | 4 ($0.012–0.014 → $7–8.4k) | 4 (≈$0.013 → ≈$7.8k) | 2 ($24–42k) | 2 ($30–48k) | 1 ($54–66k) | **5** ($0.009–0.018 STT+TTS+LLM+hosting → $6–12k incl. orchestration) | 1 ($37–69k) | [estimated] from [documented] prices; 11b §9, 11c §5, 11d §6 |

### 2.3 Matrix reading [estimated]

1. **No single provider covers the product.** The highest-weight pedagogical requirement — phoneme-level pronunciation data for drills — is provided by *zero* S2S vendors and only by dedicated PA engines (Azure PA, SpeechAce, ELSA). So the real decision is not "which S2S vendor" but "how little S2S do we need, wrapped around a pipeline we control."
2. **O9 (modular pipeline) wins on cost, phonemes, lock-in, observability, school-network** and loses only on implementation complexity — because it forces the new hosting component (§3.4). That complexity is a one-time cost; the S2S premium is forever.
3. **O2 (gpt-realtime-2.1-mini) is the best S2S complement**: incumbent architecture, semantic VAD, output speed control, ZDR path, and Azure Voice Live (O3) as a genuine second source under EDU-friendly terms. Its open risk is quality: legacy mini scored 64% vs 96% flagship on Big Bench Audio [reported]; 2.1-mini must be re-tested (§5).
4. **O4 (Gemini) is the cost challenger but is blocked** for classroom use until the enforced-50-concurrent question is resolved with Google, and preview-model churn makes it a poor foundation [reported].
5. **O5–O8, O10 are eliminated** for the core path: Nova 2 Sonic on integration cost (no browser endpoint) despite good price/compliance; Hume on concurrency + emotion-AI-on-minors posture; Grok on track record; ElevenLabs on 5–8× economics (the same force that pushed Palavox off it in 2025); Vapi/Retell on a 5–7× orchestration premium plus paywalled ZDR — we'd pay for telephony DNA we never use.

---

## 3. Architecture options A–F, recommendation, and the hosting question

Patterns follow the owner spec / 11d §4. Latency and cost per 10-min lesson are [estimated] from [documented]/[reported] unit prices (assumptions in 11d §§4-5: 10 min mic-open, ~4 min agent speech, ~40 turns, mini-class brain).

### 3.1 Options with tradeoffs

| Pattern | What it is | Voice-to-voice latency | $/10-min lesson | Dominant failure modes |
|---|---|---|---|---|
| **A. Native S2S** (current P1) | One model, audio in/out | ~300–800 ms [reported] | mini $0.25–1.00; flagship $0.80–3.20 [estimated] | Weak curriculum control (prompt-only); no phoneme data; cost scales with session length; vendor concurrency/TPM ceilings hit exactly during synchronized classes; silent-drop (no reconnect today, D12) |
| **B. Cascaded streaming** STT→LLM→TTS | Orchestrated pipeline, per-turn context injection | 600–1,300 ms typical; 500–800 ms tuned [reported] | $0.22–0.29 active / $0.13–0.19 reserved [estimated] | More moving parts per turn (3 vendor calls); tuning burden (VAD hold, sentence-chunked TTS); latency regressions if any stage degrades |
| **C. Deterministic-first** STT→matcher→LLM-only-on-deviation→cached TTS | Scripted drills/dialogue: expected answer known; 60–80% of turns skip the LLM; prompt lines pre-generated + CDN-cached | 300–600 ms on drill turns [estimated] — *faster than S2S* | ≈$0.16 active / ≈$0.07 reserved [estimated] | Matcher false-negatives frustrate learners (needs fuzzy/phoneme-aware matching); only works where curriculum defines expectations |
| **D. Hybrid routing by activity** | A (or B) for open conversation; C for drills/scripted; STT-only for dictation; cached TTS for lesson audio | per segment | ≈$0.10–0.20 blended [estimated] | Routing complexity; mode-transition UX seams; two stacks to operate until consolidation |
| **E. Async analysis sidecar** | Record session audio; batch STT + Azure PA post-session for phoneme/error taxonomy | +0 ms realtime | +$0.05–0.22 adder [estimated] | Recording consent/retention obligations (minors — §5.3); results latency (fine for reports) |
| **F. Degraded floor** | Text chat + browser `speechSynthesis` (+ push-to-talk clip upload) | 250–600 ms [estimated] | ≈$0.01 [estimated] | Robotic voices (notably ES on Chromebooks); no acoustic scoring; must be an explicit graceful mode, not an error state |

### 3.2 Recommendation

**PRIMARY [proposed]: Pattern D — hybrid routing on a LiveKit-based agent layer, pipeline-first.**

Routing by activity type [proposed]:

| Activity | Route | Why |
|---|---|---|
| Pronunciation drills / minimal pairs / read-aloud | **C** + **Azure Pronunciation Assessment** inline (scripted mode, `NBestPhonemes`) | Only source of real phoneme evidence (fixes D5); fastest perceived turns; cheapest |
| Scripted dialogue (curriculum-defined turns) | **C** with LLM-on-deviation; all prompt lines pre-generated Azure Neural TTS, CDN-cached (fixes D15) | Deterministic, cacheable, controllable |
| Guided conversation (bounded topics, A1/A2) | **B** — streaming STT (Deepgram Nova-3-multilingual or AssemblyAI U-3; bake-off in §5) → mini-class text LLM with per-turn curriculum context → streaming Azure Neural TTS with SSML rate control | Full curriculum control + transcript exhaust for assessment; slow-speech control via SSML |
| Open conversation (premium tier) | **A** — gpt-realtime-2.1-mini via existing ephemeral-token pattern, **if** §5 quality gate passes; else B with a stronger brain | Best prosody/latency where control matters least; smallest surface at S2S prices |
| Dictation | STT-only (word timestamps + confidence required — disqualifies gpt-4o-transcribe family [documented] 11c §2.2) | — |
| Lesson/listening audio | Pre-generated cached TTS (UC4) | ~$6 one-time for a 5,000-utterance curriculum [estimated] 11c §5.3 |
| Async speaking reports | **E** — batch self-hosted faster-whisper (~$0.005/audio-hr [reported]) + Azure PA batch | Collapses analysis cost |
| Network-degraded / quota-exhausted | **F** floor (preserves the existing degradation-ladder strength) | School reality |

**Rationale [estimated/proposed]:** (a) it is the only shape that delivers phoneme-level feedback, which the curriculum docs require and no S2S provides; (b) blended cost ~$0.10–0.20/lesson vs $0.25–3.20 S2S-only — the difference between district pricing working and not working (§4.5); (c) every stage is swappable behind the §6 interface, ending the ElevenLabs-style hostage dynamic; (d) it preserves the incumbent OpenAI path as the premium conversation mode and as the migration control (§6.3), rather than betting the product on a rewrite.

**FALLBACK [proposed]:** per layer, pre-contracted: S2S — **Azure Voice Live** (same model family, EDU-grade terms) [documented 11b §7]; STT — the Deepgram/AssemblyAI bake-off *loser* kept warm behind the interface (both browser-token WS, near-identical contracts); TTS — Amazon Polly Neural (speech marks, cache-replay explicitly allowed) [documented 11c §3]; PA — SpeechAce (CEFR rubrics, ~2.8× Azure price) [documented 11c §4.2]; orchestration — Pipecat/Daily (OSS, reserved instances at $0.0005/min) or self-host LiveKit (Apache-2.0) [documented 11d §2].

### 3.3 What this replaces (current → proposed)

- P1 stays (bug-fixed: D2/D3/D4) as "open conversation, premium," now behind the router and admission control.
- P2 (Custom Realtime) is **retired** — Pattern B is its correct implementation (streaming, barge-in, real VAD instead of an `en-US`-hardcoded hack, D11).
- P3 free chat becomes Pattern B on free-tier quotas with the F floor; `transcribe-audio`'s Gemini-prompt STT is replaced by the contracted STT vendor (fixes D10).
- LLM-transcript "pronunciation analysis" is retired in favor of Azure PA inline (drills) + Pattern E (reports) — fixes D5.

### 3.4 The hosting gap: Supabase Deno cannot run agent workers

**Current behavior [observed]:** all server code is Supabase Edge Functions (Deno, request-scoped, short-lived — see `supabase/functions/*`). Patterns B/C/D need a **persistent, stateful worker per session** holding open sockets to STT/LLM/TTS for minutes at a time, running VAD/turn models. Edge functions cannot do this (11d §1, "Agent compute hosting") — a new hosting component is required no matter which vendor wins.

**Options [estimated from documented pricing, 11d §2]:**

| | H1. LiveKit Cloud (managed) | H2. Self-host LiveKit or Pipecat OSS (container host: Fly.io/Cloud Run/Railway class) | H3. Plain WebSocket relay on a container host (no framework) |
|---|---|---|---|
| What you run | Agent code only; SFU/TURN/scaling managed | SFU + TURN fleet + agent workers + autoscaling | One Node/Deno service terminating WSS from browser, relaying to provider WS, doing VAD server-side |
| Cost | $50/mo Ship (20 concurrent) → $500/mo Scale (**600 concurrent agents**) + $0.01/agent-min [documented] | Compute + egress ≈ $1–3k/mo at 10k-MAU volume [estimated]; no platform fee | ≈$50–300/mo compute at pilot scale [estimated] |
| Concurrency raise | Self-serve tiers → Enterprise >600 [documented] | You own it (autoscaling for synchronized-class bursts is exactly the hard case) | You own it |
| School networks | Managed TURN/TLS 443, reconnection, jitter [documented] | You operate TURN | WSS/443 only — firewall-friendly but no WebRTC recovery under packet loss |
| What you rebuild | Nothing | Ops for SFU/TURN | Turn detection, barge-in, reconnection, backpressure, observability — i.e., the orchestration framework, badly |
| K-12 story | DPA via Enterprise; HIPAA-eligible + residency at Scale [documented]; no public K-12 program [estimated] | **Strongest** — student audio only leaves to contracted model vendors | Mid |
| Fit | **Recommended start** | **Planned end-state option** if district DPAs or margins demand it (framework code is identical) | Rejected except as a Gemini/OpenAI-WS spike harness |

**Recommendation [proposed]: H1 now, H2 preserved.** Write agents on LiveKit Agents (Apache-2.0) so H1→H2 is a deployment change, not a rewrite. H3 is rejected as a production path: it re-implements the exact failure modes (VAD, barge-in, reconnect) that are current defects D11/D12.

**Auth/quota integration [proposed]** (reuses observed strengths, fixes D1/D6/D7/D8):

1. Browser calls new edge fn `voice-session-token` with Supabase JWT + `{activityType, lessonId, cefrLevel, l1, l2}`. It runs the existing `guardPaidRequest` fail-closed pattern (`_shared/authGuard.ts:24-91` [observed]) **plus a new `can_start_voice_session` RPC**: per-user concurrent-session cap (1), per-org/classroom concurrency ledger, monthly-minutes check against a counter the *agent* maintains (below). Returns a short-TTL LiveKit room token — same ephemeral-token discipline as today's P1 mint [observed].
2. Agent worker (holds the Supabase service-role key) is the **single accounting authority**: inserts a `voice_sessions` row on join, heartbeats `minutes_used` every 30 s, finalizes on leave. Client-supplied usage numbers are no longer trusted anywhere (fixes D8); abandoned tabs are closed by a **pg_cron** job expiring sessions with stale heartbeats (fixes D7 — replaces the unscheduled `cleanup-voice-sessions`).
3. Existing `consume_rate_limit` counters stay as the per-endpoint backstop; monthly caps move to the server-maintained counter (fixes D1).
4. Classroom admission: a `class_voice_sessions` view gives teachers/org admins a live concurrency count; the token fn rejects the 31st concurrent seat in a 30-seat class with a queue-position response rather than a hard error [proposed].

---

## 4. Cost formulas and capacity model

All [estimated] from [documented] unit prices in 11b §9, 11c §§5-7, 11d §§5-6. LLM brain excluded where noted is ≤$0.002/min for mini-class models [estimated, 11d §3] and does not change conclusions.

### 4.1 Formulas

```
conv_min(route) = P_stt + f_tts·P_tts + P_llm + P_host + f_pa·P_pa
  P_stt  = streaming STT $/mic-open-min           (0.0025 AAI · 0.0058 DG-multi)
  f_tts  = agent-speech fraction × cache-miss rate (0.4 × miss; miss≈1.0 conv, ≈0.15 scripted)
  P_tts  = $/audio-min                             (0.015 Azure Neural PAYG; →0.006 committed)
  P_llm  = brain $/min                             (0.0003–0.002 mini-class)
  P_host = orchestration $/agent-min               (0.01 LiveKit Cloud; 0.0005 Pipecat reserved; ~0.002–0.004 self-host)
  f_pa·P_pa = assessed fraction × $0.0217/min Azure PA (drills only)

s2s_min = a_in·P_in + a_out·P_out + OH             (11b §1; mini ≈ $0.018–0.025 incl. context re-reads)

lesson_10 = 10 × conv_min(blend)
hour_at_N = N × 60 × conv_min
month     = Σ_activity (MAU × min/mo × mix_share × conv_min) + platform fees
```

**Route unit costs [estimated]:**

| Route | $/min (active hosting) | $/min (optimized: reserved/self-host + committed TTS) |
|---|---|---|
| C drills (incl. PA on 25% of minutes) | ≈$0.022 | ≈$0.012 |
| C scripted dialogue (cached TTS) | ≈$0.018 | ≈$0.008 |
| B guided conversation | ≈$0.022–0.029 | ≈$0.013–0.019 |
| A open conversation (RT-2.1-mini + transport) | ≈$0.028–0.035 | ≈$0.028 (S2S price is the floor) |
| Blended lesson (25% drills / 35% scripted / 25% guided / 15% open) | **≈$0.022** | **≈$0.013** |
| Status-quo trajectory for comparison: A-only flagship | $0.052–0.08+ | — |

### 4.2 Concurrency scenarios ($/wall-clock-hour, blended recommended stack)

`hour_at_N = N × 60 × conv_min`:

| N concurrent | Active ($0.022) | Optimized ($0.013) | Ceiling checks [documented/reported] |
|---|---|---|---|
| 10 | $13 | $8 | Everything on entry tiers; LiveKit Ship $50/mo |
| 50 | $66 | $39 | LiveKit Scale ($500/mo, 600-agent cap); all STT vendors OK |
| 100 | $132 | $78 | Azure STT default quota ≈100 → support ticket; Deepgram WSS 150–225 headroom |
| 500 | $660 | $390 | Deepgram/AAI enterprise raises; OpenAI ≥T4 for the S2S share; Azure commitment tier |
| 1,000 | $1,320 | $780 | LiveKit Enterprise (>600); enterprise agreements across vendors — start negotiations at ~350 sustained |

**Expansion processes** [documented]: LiveKit self-serve→Enterprise; Deepgram/AAI sales contact; Azure quota ticket; OpenAI spend-tier auto-growth then sales; Google Live-API concurrency **must be contractually resolved, not assumed** [reported].

### 4.3 Synchronized classroom (30 concurrent per class × N classes)

Per class-hour ≈ 30 × 60 × conv_min ≈ **$40 active / $23 optimized**; a 10-min speaking block ≈ **$6.60 / $3.90 per class** [estimated].

| N classes simultaneous | Concurrent sessions | $/school-hour | Binding constraint |
|---|---|---|---|
| 1 | 30 | $40 / $23 | none |
| 5 | 150 | $198 / $117 | Deepgram WSS default band |
| 10 | 300 | $396 / $234 | LiveKit Scale OK (≤600); OpenAI tier if S2S share active; TURN relay bandwidth on district uplink [requires validation §5] |
| 20 | 600 | $792 / $468 | LiveKit Enterprise threshold; multi-vendor enterprise quotas |

Design note [proposed]: classroom mode should route **C-heavy (no S2S)** — drills and scripted dialogue are the classroom activities anyway, and C's cached-TTS/deterministic turns cut both cost and network load exactly where 30 uplinks share one Wi-Fi AP.

### 4.4 10k MAU monthly scenarios

Usage bands [assumption — no current telemetry exists to calibrate; instrumenting this is Phase 0]: light = 20 voice-min/MAU/mo, expected = 60, heavy = 150.

| Scenario | Total min/mo | Recommended active | Recommended optimized | A-only mini | A-only flagship |
|---|---|---|---|---|---|
| Light | 200k | **$4.4k** | $2.6k | $5.0k | $10.4k |
| Expected | 600k | **$13.2k** | $7.8k | $15k (11d: $21–66k with context drift) | $31.2k+ |
| Heavy | 1.5M | **$33k** | $19.5k | $37.5k+ | $78k+ |

(+$500–1,000/mo platform fees: LiveKit Scale, Supabase, CDN.) Add Pattern E async analysis at ~$0.05–0.22/lesson where enabled [estimated].

### 4.5 Per-learner economics and gross margin

| Metric | Active | Optimized |
|---|---|---|
| Per conversation-minute (blended) | $0.022 | $0.013 |
| Per 10-min speaking lesson | $0.22 | $0.13 |
| Per active-learner-month — light/expected/heavy | $0.44 / $1.32 / $3.30 | $0.26 / $0.78 / $1.95 |

**Consumer ($8–15/mo [assumption from brief]):** expected-usage voice COGS $0.78–1.32 = **9–16% of an $8 plan, 5–9% of $15** — healthy; even heavy users stay under 41%/22%. A-only flagship at expected usage is $3.12/mo = 21–39% of price — the current P1 economics do not survive consumer pricing without the D1 cap actually working [estimated].
**District ($4–8/student/yr [assumption — flagged per brief; must be validated against real district deals]):** revenue is $0.33–0.67/student/**month**. Expected-band usage exceeds revenue at $4/yr even optimized. District viability therefore **requires** [estimated → proposed]: (a) C-heavy classroom routing (~$0.008–0.012/min), (b) cached curriculum TTS, (c) enforced speaking-minute allocations (e.g., 20–30 min/student/mo → COGS $0.16–0.36/mo), and (d) reserved/self-host hosting at volume. Under those four levers: COGS ≈ $2–4.30/student/yr vs $4–8 revenue — thin at $4, workable at $8. **S2S-only architectures are unsellable at district price points; this, not latency, is the decisive architecture argument.**
Break-even sanity check: at $6/student/yr and optimized C-heavy $0.010/min, the allocation ceiling is 50 min/student/mo [estimated].

---

## 5. Reproducible benchmark plan (required before any migration)

This is the validation program the migration is gated on. It operationalizes 11a §15's 14 measurements plus the eval set every research doc flags as missing.

### 5.1 The 14 measurements (from 11a §15, made reproducible)

Each gets a scripted harness in `bench/` (new, planning-approved location TBD), runs ≥30 trials across network profiles {office, throttled 3G-class, school-firewall sim (UDP blocked, TLS-inspecting proxy)}, and emits JSON rows into the §6.2 telemetry schema so bench and production numbers are directly comparable [proposed].

| # | Measurement | Method | Pass target [proposed] |
|---|---|---|---|
| 1 | Token-mint RTT + WebRTC time-to-first-assistant-audio (P1) | instrumented client, 30 trials × 3 networks | p50 ≤ 1.5 s, p95 ≤ 3 s TTFA |
| 2 | P2 per-turn latency decomposition (record-stop→STT→LLM→TTS→first audio) | server timestamps per hop | baseline only (path retires) |
| 3 | Barge-in latency (P1); confirm P2 has none | inject speech during agent audio; measure audio-stop | p50 ≤ 400 ms |
| 4 | VAD end-of-turn delay vs actual speech end | annotated utterances, 4 browsers × desktop/mobile | p50 ≤ 700 ms; zero premature cutoffs on 2-s mid-sentence pauses |
| 5 | STT WER per candidate (current Gemini-prompt STT vs Deepgram Nova-3-multi vs AAI U-3 Pro vs Azure vs Speechmatics Melia) on §5.2 eval set | offline scoring, NIST-style normalization | see gates §6.4 |
| 6 | Pronunciation-score validity: current LLM scorer vs Azure PA vs SpeechAce vs 2 human raters on same recordings | Pearson/Spearman vs expert ratings; per-phoneme confusion on minimal pairs | PA-vs-expert r ≥ 0.7; LLM path documented as invalid (expected) |
| 7 | TTS naturalness/intelligibility (Azure Neural vs Polly vs gpt-4o-mini-tts), 16 kHz/32 kbps vs higher; SSML-rate slow speech; multi-voice seam artifacts | MOS panel (n≥15 incl. ESL listeners) | MOS ≥ 4.0 at chosen format; slow-rate intelligibility gain measurable |
| 8 | Which model actually serves P1 (D3) + per-language speaking quality on 2.1 vs 2.1-mini | session.created event capture; scripted probes | resolve D3; mini gate §6.4 |
| 9 | True $/min per path vs in-code estimators | provider billing exports vs telemetry | estimator error ≤ ±10% |
| 10 | Real concurrency ceilings: OpenAI tier, Azure TTS TPS, Deepgram/AAI streams, LiveKit tier; classroom-of-30 synthetic burst (30 simultaneous joins <5 s) | load harness on H1 | 30-burst: 0 admission failures, p95 join ≤ 4 s |
| 11 | TTS cache hit rate: current (per-tab 5-min) vs proposed CDN curriculum cache | replay one lesson across 30 simulated clients | proposed hit rate ≥ 85% on scripted lines |
| 12 | Accounting drift: client timer vs `usage_tracking` vs `student_usage_limits` vs provider invoices | reconciliation script | post-fix drift ≤ 2% |
| 13 | Drop/reconnect: forced network blips mid-session per path; abandoned-tab leakage | toxiproxy-style interruption at 60 s | proposed stack: auto-resume ≤ 5 s, session accounting closes within 2 min |
| 14 | Safari/iOS + iPad + Chromebook matrix: getUserMedia, AudioContext resume, codec support, all routes | device lab checklist (physical devices, not simulators) | all routes usable or explicitly F-floored per device |

### 5.2 Beginner-L2 / child WER eval set [proposed]

No vendor publishes beginner-L2 or child WER (11b §8.5, 11c §6) — this set is the study's core asset.

- **Composition:** 3–4 hours, two directions: (a) ESL — L1 backgrounds sampled from the platform's actual top UI languages (Spanish, Gujarati, Korean, +2; per translation packs [observed]), speaking A1/A2 English; (b) English speakers producing A1/A2 Spanish. Per speaker: 20 scripted curriculum utterances (drawn from the wip-curriculum docs), 10 minimal pairs, 2 min spontaneous answers, 5 code-switched utterances. Include deliberate disfluencies, long mid-sentence pauses, and classroom background noise overlays (for VAD/turn tests, not WER).
- **Child speech:** recruit consented 8–13-year-olds *only* under guardian consent (below); if recruitment stalls, ship the adult-L2 set first and treat child WER as a district-pilot gate — do not fake it with pitch-shifted adult audio [proposed].
- **Reference:** human double-transcription with adjudication; phoneme annotation on the minimal-pair subset by a trained annotator (target inter-rater κ ≥ 0.8).
- **Scoring:** WER overall + per L1 group + per CEFR band; code-switch segment accuracy; per-vendor hallucination rate on silence/short utterances (a known Whisper-family failure [reported]).
- **Reproducibility:** frozen audio + references versioned in private storage; scoring container pinned; every vendor scored through the §6 abstraction so re-runs are one command.

### 5.3 Consent and privacy notes [proposed; counsel review required]

- Purpose-limited written consent (benchmarking + provider evaluation only), separate guardian consent + child assent for minors; compensation disclosed; explicit list of vendors the audio will be sent to; deletion on request; retention ≤ 24 months.
- Prefer newly recorded consented audio over production learner audio. **Current behavior [observed]:** repo documents no consent/retention framework for voice-derived data (D16) — production audio must not be used for benchmarking until doc-15's governance work lands.
- Vendor-side: run evals only under no-training/ZDR-mode accounts (Deepgram `mip_opt_out`, AAI training opt-out, OpenAI ZDR endpoints, Azure region-pinned) [documented in 11c].
- COPPA/FERPA note: benchmarking is Palavox acting as itself, not as a school's agent — keep school-sourced audio out of scope entirely.

---

## 6. Provider abstraction, telemetry, migration, rollback, go/no-go

### 6.1 TypeScript-level contracts [proposed]

Goal: every provider decision in this doc reversible behind stable interfaces; bench harness and production share them. (Sketch — final signatures in the implementation RFC.)

```ts
// ---- capability discovery ----
interface VoiceProviderInfo {
  id: string;                          // "deepgram-nova3-multi", "openai-rt-2.1-mini", ...
  kind: "stt" | "tts" | "s2s" | "pa" | "turn";
  languages: LangTag[];                // BCP-47
  capabilities: {
    wordTimestamps?: boolean; wordConfidence?: boolean; codeSwitching?: boolean;
    phonemeScores?: boolean; nBestPhonemes?: boolean; prosodyScores?: LangTag[];
    speedControl?: "param" | "ssml" | "prompt" | null;
    semanticTurn?: boolean; bargeIn?: boolean;
    transports: ("webrtc" | "wss" | "http")[];
    retention: { mode: "zdr" | "opt-out" | "default"; maxDays: number | null };
  };
}

// ---- streaming STT ----
interface SttStream {
  push(frame: AudioFrame): void;                 // PCM16 mono, declared sampleRate
  end(): Promise<void>;
  on(ev: "partial" | "final", cb: (t: Transcript) => void): void;
  on(ev: "error", cb: (e: ProviderError) => void): void;
}
interface Transcript {
  text: string; lang: LangTag; isFinal: boolean;
  words: { w: string; startMs: number; endMs: number; conf: number; lang?: LangTag }[];
}
interface SttProvider { start(o: { lang: LangTag | "multi"; keyterms?: string[];
  session: SessionCtx }): Promise<SttStream>; }

// ---- TTS (deterministic cache contract is part of the interface) ----
interface TtsRequest { text: string; voiceId: string; lang: LangTag;
  rate?: number /* 0.5–1.5 */; ssml?: boolean; }
interface TtsProvider {
  cacheKey(req: TtsRequest): string;             // stable ⇒ CDN-cacheable; null-op for non-deterministic vendors
  synthesize(req: TtsRequest, session: SessionCtx): AsyncIterable<AudioChunk>;
}

// ---- native S2S session ----
interface S2sSession {
  sendAudio(frame: AudioFrame): void;
  updateInstructions(patch: InstructionPatch): void;   // CEFR ratio, topic bounds — fixes D4 by contract
  interrupt(): void;                                    // barge-in → truncate context
  on(ev: "audio" | "transcript" | "turnStart" | "turnEnd" | "usage" | "error", cb: (p: unknown) => void): void;
  close(): Promise<UsageReport>;
}
interface S2sProvider { connect(o: { persona: PersonaSpec; speed?: number;
  turnDetection: "server" | "semantic"; session: SessionCtx }): Promise<S2sSession>; }

// ---- pronunciation assessment ----
interface PaProvider {
  assess(o: { audio: AudioRef; refText?: string; lang: "en-US" | "es-ES" | "es-MX";
    granularity: "phoneme"; nBest?: number; session: SessionCtx }): Promise<PaResult>;
}
interface PaResult {
  pronScore: number; fluency?: number; completeness?: number; prosody?: number; // prosody en-US only today
  words: { w: string; accuracy: number; errorType: "None" | "Omission" | "Insertion" | "Mispronunciation";
    phonemes: { ipa: string; accuracy: number; nBest?: { ipa: string; conf: number }[] }[] }[];
}

// ---- routing ----
type ActivityType = "drill" | "scripted_dialogue" | "guided_conversation"
                  | "open_conversation" | "dictation" | "async_analysis";
interface RoutePolicy {
  resolve(a: ActivityType, ctx: { tier: "free" | "premium" | "school"; device: DeviceClass;
    network: NetworkClass; quotaState: QuotaState }): PipelineSpec; // pattern + provider ids + fallback chain
}

// ---- session context: the auth/quota spine (§3.4) ----
interface SessionCtx { sessionId: string; userId: string; orgId?: string; classroomId?: string;
  activity: ActivityType; budget: { maxMinutes: number; hardStop: boolean }; telemetry: TelemetrySink; }
```

Rules [proposed]: providers are constructed only via a registry keyed by `VoiceProviderInfo.id`; the router owns fallback chains (e.g., `["deepgram-nova3-multi","assemblyai-u3","browser-stt"]`); no component may import a vendor SDK outside its adapter; capability flags — not vendor names — gate features (e.g., dictation requires `wordTimestamps`).

### 6.2 Telemetry spec [proposed]

One event stream (Postgres table + optional export), emitted by agent workers and bench harness alike:

```
voice_events(
  ts, session_id, user_hash, org_id, activity, pattern,            -- routing context
  provider_id, event,                                              -- see catalog
  latency_ms, audio_ms, chars, tokens_in, tokens_out, cost_usd_est,
  network_class, device_class, browser, error_code, meta jsonb
)
```

Event catalog: `session_admitted|rejected|started|heartbeat|ended|expired`; `turn_started|user_audio_end|stt_final|llm_first_token|tts_first_byte|agent_audio_start|agent_audio_end|barge_in|turn_abandoned`; `provider_fallback|provider_error|reconnect_started|reconnect_ok|reconnect_failed`; `pa_result`; `cache_hit|cache_miss`; `quota_warning|quota_stop`.
Derived dashboards: voice-to-voice latency percentiles per route/provider/network; $/min actual vs modeled (reconciled monthly against provider invoices — measurement 9); WER-proxy (correction-rate) drift; classroom concurrency heatmaps; fallback/error rates per district network.
Privacy: no raw audio or transcript text in telemetry; `user_hash` salted; retention 13 months [proposed; align with doc 15].

### 6.3 Migration plan (phased; existing OpenAI path as control)

| Phase | Content | Exit criteria |
|---|---|---|
| **0. Stabilize + instrument** (pre-migration) | Fix D1–D4, D7–D9 on the current stack; add telemetry to all three paths; schedule cleanup via pg_cron; deploy `voice_sessions` ledger + admission RPC. No provider changes. | Accounting drift ≤2% (m12); D1 cap actually enforced; baseline dashboards live 2 weeks |
| **1. Benchmark study** (§5) | Eval set recorded; 14 measurements run; vendor bake-off (STT, PA, TTS, RT-2.1-mini vs 2.1) | Go/no-go gates §6.4 evaluated; provider picks signed |
| **2. Agent host + Pattern B pilot** | LiveKit Cloud Ship tier; one activity (guided conversation) behind a feature flag for ≤5% of premium users; **P1 unchanged as control cohort** | B vs P1: latency p50 within +300 ms of control, session-completion rate ≥ control, cost/min ≤ 50% of control; 2 weeks stable |
| **3. Drills on Pattern C + Azure PA** | Deterministic matcher + inline PA for pronunciation drills; retire LLM-transcript scorer for flagged cohort | PA-vs-expert validity gate met (m6); drill turn p50 ≤ 600 ms; teacher-visible phoneme reports render |
| **4. Open-conversation decision** | A/B: RT-2.1-mini (bug-fixed P1) vs Pattern B-strong for open conversation | Pick by quality gate (m8) + cost; loser becomes documented fallback |
| **5. Classroom pilot** | 1–3 real classrooms (30 concurrent), C-heavy routing, school-network profile; concurrency rehearsal (m10) | 30-burst admission clean; district-network fallback rate <5%; per-class cost within §4.3 model ±20% |
| **6. Consolidate + retire** | Route all tiers through the router; retire P2 entirely and P3's Gemini-STT; keep F floor; delete dead surface (D13) | 100% of voice minutes through new stack for 4 weeks; legacy edge fns archived (not deleted) for 2 further releases |

Scale-up triggers [proposed]: LiveKit Ship→Scale at 15 sustained concurrent; enterprise conversations (LiveKit/Deepgram-or-AAI/OpenAI) at 350 sustained; H2 self-host evaluation when platform fees exceed $2.5k/mo or a district DPA requires it.

### 6.4 Go/no-go criteria (measurable)

**GO for pipeline migration requires all of:**
1. Best-candidate STT WER on the §5.2 adult beginner-L2 set: ≤ **12%** English, ≤ **14%** Spanish, and ≤ **1.4×** the vendor's native-speech WER on the same harness (equity bound); code-switch segment accuracy ≥ 85% [proposed thresholds — calibrate against human-transcriber ceiling measured on the same set].
2. Azure PA phoneme accuracy vs expert ratings r ≥ 0.7 on minimal pairs, both en-US and es-ES/es-MX; if it fails, SpeechAce runs the same gate before any custom-model detour.
3. Pattern B voice-to-voice p50 ≤ 800 ms / p95 ≤ 1,500 ms on school-network profile (TURN/TLS-relayed).
4. Classroom burst: 30 joins <5 s, zero admission failures, zero cross-talk misattribution.
5. Measured blended cost ≤ $0.025/min active at pilot volume (±10% invoice reconciliation).
6. Safari/iOS + Chromebook matrix (m14): every route usable or explicitly F-floored, no silent failures.
7. Signed DPAs (or ZDR/no-training configurations verified) for every provider student audio reaches.

**NO-GO / redirect rules:** STT gate fails for all vendors → hold migration, keep P1/P3, expand eval set, revisit in one quarter (the pipeline is only as good as its ASR for accented beginners). RT-2.1-mini fails quality gate (m8) but flagship passes → open conversation stays flagship, premium-only, capped minutes (economics §4.5 forbid flagship at scale). Gemini concurrency resolved in writing at ≥500 → re-run cost matrix; Gemini becomes B-brain/S2S challenger.

### 6.5 Rollback plan

- Routing is data, not code: `RoutePolicy` reads per-activity flags from config; any activity can revert to `legacy_p1` / `legacy_p3` per tier/org within minutes [proposed].
- Legacy paths kept deployable (frozen, bug-fixed) until Phase 6 + 2 releases; the ephemeral-token mint stays compatible with both stacks.
- Kill switches: global `voice_disabled` (→ Pattern F), per-provider `provider_disabled` (→ next in fallback chain), per-org routing pin for districts mid-procurement.
- Data: telemetry and `voice_sessions` schemas are stack-agnostic — rollback loses no accounting. PA results are additive tables; reverting scoring never destroys prior scores.
- Rollback triggers: session-completion rate drops >10% vs control for 24 h; fallback rate >15% sustained; cost/min >2× model for 48 h; any provider retention-posture change.

---

## 7. Dependencies, risks, acceptance criteria

### 7.1 Dependencies

1. **Doc 15 (data/security)**: consent framework and retention policy for minors' audio — blocks §5 eval-set recording of children and Pattern E recording defaults (D16).
2. **Doc 12 (assessment)**: consumes PA results and transcripts; the `PaResult`/`Transcript` contracts (§6.1) are the interface it should build against.
3. **Curriculum docs**: Pattern C requires machine-readable expected answers per scripted activity — a curriculum authoring requirement, not just an engineering one.
4. **Owner/billing**: OpenAI org tier, Azure subscription (PA + TTS + possible Voice Live), Deepgram/AAI accounts with training-opt-out; ElevenLabs history confirmation [requires validation].
5. **New infra**: LiveKit Cloud account (H1); pg_cron enabled; CDN/storage bucket for cached curriculum audio.
6. **District pricing validation**: the $4–8/student/yr figure is [assumption]; §4.5's viability conclusions must be re-run against real deal terms.

### 7.2 Top risks

| Risk | L×I | Mitigation |
|---|---|---|
| No vendor's ASR is good enough for accented beginners (the unbenchmarked criterion) | M×H | §5.2 eval set is the first spend; NO-GO rule holds the incumbent stack; Speechmatics wildcard in bake-off |
| RT-2.1-mini quality insufficient → flagship economics | M×M | Hybrid design already minimizes S2S minutes; B-strong is a costed alternative for open conversation |
| New agent-host component adds an ops surface Palavox hasn't run before | M×M | H1 managed first; framework code portable to H2; Phase 2 capped at 5% cohort |
| District margins fail even optimized | M×H | Minute allocations + C-heavy routing are product decisions to make *before* district sales, not after |
| Vendor price/model churn (Gemini previews; realtime pricing has shifted ~6-monthly) | H×M | Abstraction layer + annual re-run of this matrix; contracts with price-protection where possible |
| Synchronized-class Wi-Fi/TURN reality worse than modeled | M×M | m10/m13 on real district networks in Phase 5 before any district commitment |
| Consent/compliance gap stalls benchmarking | M×M | Adult-proxy set first; child data only under doc-15 framework |

### 7.3 Acceptance criteria for this study's recommendation (measurable)

1. Phase 1 executes all 14 measurements with published harness configs; every §6.4 gate has a recorded pass/fail.
2. Post-Phase 3, ≥90% of drill turns return phoneme-level feedback (vs 0% today [observed]).
3. Post-Phase 6, blended voice COGS ≤ $0.025/min active (≤$0.015 optimized) reconciled against invoices ±10%.
4. Concurrency: a rehearsed 300-concurrent event (10 classes) with 0 admission failures and p95 join ≤ 4 s.
5. Accounting: monthly premium-minutes counter increments correctly (D1 closed), drift ≤2%; zero client-trusted usage writes remain.
6. Every provider reachable by student audio has a signed DPA or verified ZDR/no-training configuration on file.
7. Rollback exercised at least once in staging (per-activity revert to legacy path in <15 min).

---

*End of doc 11. Numbers marked [estimated] inherit the assumptions of wip-11b/c/d §1 cost models; prices captured 2026-07-30 and must be re-verified at decision time.*
