# WIP-11d — Voice Orchestration Layers, Architecture Patterns, and TCO Context

**Status:** Research draft (planning phase — no code changes)
**Scope:** Orchestration layers (LiveKit, Pipecat/Daily, Vapi, Retell), architecture patterns A–F with latency budgets, text-LLM "conversation brain" costs, browser/school-network constraints, pattern-by-pattern cost comparison.
**Research date:** 2026-07-30. All prices USD. Labels: **[documented]** = vendor docs/pricing page, **[reported]** = third party, **[estimate]** = our math (assumptions shown).
**Companion docs:** wip-11a (current voice state). Provider-level pricing (STT/TTS/S2S vendors) is doc 11-series siblings' scope; representative component prices are used here only to make pattern totals comparable.

---

## 1. What orchestration layers add over raw provider SDKs

Raw provider SDKs (OpenAI Realtime, Deepgram, ElevenLabs, etc.) give you a single model connection. A production voice agent additionally needs, per session:

| Capability | Why it matters for Palavox | Who provides it |
|---|---|---|
| **Transport (WebRTC SFU + TURN)** | School networks block UDP; need managed TURN/TLS:443 relay, jitter buffers, Opus negotiation, reconnection | LiveKit (OSS SFU + Cloud), Daily (Pipecat transport), Vapi/Retell (bundled) |
| **VAD + turn detection (semantic endpointing)** | Beginners pause mid-sentence; naive silence-based endpointing cuts them off. Semantic turn models judge "is the learner done?" from audio, not just silence | LiveKit `turn-detector` plugin (open weights) [documented, https://github.com/livekit/agents/tree/main/livekit-plugins/livekit-plugins-turn-detector, 2026-07-30]; Pipecat Smart Turn v3 — open source, 23 languages (incl. Spanish), **~12 ms CPU inference** [documented, https://www.daily.co/blog/announcing-smart-turn-v3-with-cpu-inference-in-just-12ms/, 2026-07-30]; Krisp VIVA (commercial, bundled in Pipecat Cloud) |
| **Interruption / barge-in** | Learner talks over the agent; must cancel TTS + truncate LLM context correctly | All four; LiveKit Agents 1.5 added an audio-based interruption model (Apr 2026) [reported, https://callsphere.ai/blog/vw4h-build-voice-agent-livekit-agents-python-sdk, 2026-07-30] |
| **Pipeline orchestration** | Streaming STT→LLM→TTS glue, partial-transcript handling, sentence-chunked TTS, filler/latency masking | LiveKit Agents (Python, Apache-2.0; AgentsJS for TS), Pipecat (OSS Python) [documented, https://github.com/pipecat-ai/pipecat, 2026-07-30] |
| **Fallback routing** | Swap STT/LLM/TTS vendor per request on failure or by activity type; avoids the single-vendor concurrency trap that hit us with ElevenLabs (~5 sessions) | LiveKit Agents plugins + LiveKit Inference (unified model gateway); Pipecat service abstraction; Vapi/Retell dashboard-config model switching |
| **Telephony (SIP/PSTN)** | Not needed for Palavox (browser-first); Vapi/Retell's core value is here — we'd be paying for it unused | Vapi, Retell (core); LiveKit SIP, Daily SIP/PSTN (optional add-ons) |
| **Noise cancellation** | Classroom babble with 25–35 students speaking at once | Krisp VIVA in Pipecat Cloud (included ≤10k min/mo, then $0.0015/min) [documented, https://www.daily.co/pricing/pipecat-cloud/, 2026-07-30]; LiveKit Cloud noise cancellation |
| **Agent compute hosting** | **Supabase Deno edge functions cannot host a long-running voice agent process.** LiveKit Agents / Pipecat bots are persistent Python/Node workers — they need LiveKit Cloud agent deployment, Pipecat Cloud, or our own container host. This is a real architectural addition to the current stack | LiveKit Cloud (agent session minutes), Pipecat Cloud (agent-minutes), self-host containers |
| **Observability/recording** | Session traces, transcripts, audio recording for teacher review / async analysis | All four (recording billed extra on Pipecat: $0.005/min audio) [documented, same URL] |

**Positioning:** Vapi and Retell are managed end-to-end voice-agent products (fastest to ship, per-minute premium, telephony-centric, less control). LiveKit and Pipecat/Daily are frameworks + infrastructure (code-first, cheapest at scale, self-hostable, full control over curriculum logic — which Pattern C/D below requires).

---

## 2. Orchestration vendor profiles

### 2.1 LiveKit (Cloud + self-host + Agents framework)

Source: https://livekit.com/pricing (accessed 2026-07-30) [documented] unless noted.

**Plans & quotas:**

| | Build ($0/mo) | Ship ($50/mo) | Scale ($500/mo) | Enterprise |
|---|---|---|---|---|
| Agent session min included | 1,000 | 5,000 | 50,000 | custom |
| Agent session overage | — | $0.01/min | $0.01/min | custom |
| WebRTC participant min included | 5,000 | 150,000 | 1,500,000 | custom |
| WebRTC overage | — | $0.0005/min | $0.0004/min | custom |
| **Concurrent agent sessions (cap)** | **5** | **20** | **up to 600** | custom |
| Concurrent WebRTC connections | 100 | 1,000 | 5,000 | custom |
| Inference credits included | $2.50 | $5 | $50 | custom |
| Compliance | — | — | HIPAA-eligible, regional data residency, RBAC | + custom DPA |

- **LiveKit Inference** (unified model gateway, sample per-minute rates): Deepgram Nova-3 monolingual STT $0.0048/min; Cartesia Sonic TTS $0.0300/min; GPT-4o mini $0.0006/min [documented].
- **Raising limits:** tier upgrade (Build→Ship→Scale is self-serve) then Enterprise sales contact for >600 concurrent agents / >5,000 connections [documented]. This is the documented process; no per-line purchase like Vapi/Retell.
- **Self-host:** LiveKit server SFU is Apache-2.0 open source; agents deploy on your own infra alongside a self-hosted server [documented, https://docs.livekit.io/transport/self-hosting/, 2026-07-30]. Self-hosting eliminates per-minute platform fees (you pay compute + egress + TURN bandwidth) and gives the strongest data-control story for FERPA — at the cost of operating an SFU + TURN fleet sized for school-network TCP/TLS relay traffic.
- **Agents framework:** Apache-2.0, Python-first (AgentsJS for TypeScript); `AgentSession` bundles STT/LLM/TTS/VAD/turn-detection/room in one primitive [reported, https://deepwiki.com/livekit/agents + PyPI, 2026-07-30].
- **K-12 suitability:** HIPAA-eligible + data residency start at Scale [documented]. No public COPPA/FERPA/K-12 program or student-data-privacy pledge found on public pages [estimate — absence of evidence as of 2026-07-30; DPA must be negotiated via Enterprise]. Self-host is the fallback if a district DPA can't be met on Cloud.
- **Browser/SDK support:** WebRTC-native with JS/Swift/Android/Flutter/React Native SDKs; Safari/iOS supported via WebRTC (Safari ships WebRTC); TURN/TLS on 443 provided by Cloud [documented, docs.livekit.io].

### 2.2 Pipecat / Daily (Pipecat OSS + Pipecat Cloud)

Source: https://www.daily.co/pricing/pipecat-cloud/ (accessed 2026-07-30) [documented] unless noted.

- **Pipecat framework:** open-source (BSD-2) Python voice-AI pipeline framework; vendor-neutral service plugins (any STT/LLM/TTS mix) [documented, https://github.com/pipecat-ai/pipecat, 2026-07-30].
- **Pipecat Cloud** (GA Jan 2026 [reported, softcery.com 2026 platform comparison, 2026-07-30]) — agent hosting:
  - Active instances: agent-1x $0.01/min (0.5 vCPU/1GB); 2x $0.02/min; 3x $0.03/min [documented]
  - **Reserved instances: agent-1x $0.0005/min** (billed continuously: 43,200 min/mo × $0.0005 ≈ **$21.60/instance-month**) [documented rate; monthly figure is [estimate]]
  - Transport: **Daily WebRTC voice 1:1 sessions — free**; voice+video $0.004/participant-min; WebSocket transport billed by the external provider [documented]
  - Krisp VIVA noise cancellation/turn model: included ≤10k min/mo, then $0.0015/min [documented]
  - Recording: $0.005/min audio; storage $0.003/min [documented]
  - Telephony (not needed): Daily PSTN $0.018/min, SIP $0.003–0.02/min [documented]
- Daily's general WebRTC pricing: $0.004/participant-min with 10k free min/mo, graduated volume discounts to ~$0.0015 at very high volume [reported, https://www.usagepricing.com/blueprint/daily + daily.co pricing, 2026-07-30].
- **Turn detection:** Smart Turn v3 open weights, 23 languages, ~12 ms CPU inference; Pipecat runs Silero VAD → Smart Turn on VAD-low [documented, daily.co blog + docs.pipecat.ai, 2026-07-30].
- **Concurrency/rate limits:** no hard public cap published for Pipecat Cloud; scaling is instance-based (reserved + burst active) with enterprise custom pricing for high volume [documented that enterprise is "contact us"; absence of a published cap is [estimate]].
- **K-12 posture:** Daily publishes SOC 2 / HIPAA compliance [reported, daily.co site, 2026-07-30]; no public COPPA/FERPA K-12 program found [estimate]. Pipecat OSS is fully self-hostable (strongest data-control option, zero platform fee).
- **Browser support:** Daily WebRTC works across Chrome/Safari/Edge incl. iOS Safari; Pipecat also supports a plain WebSocket transport — useful as a school-firewall fallback path [documented, docs.pipecat.ai].

### 2.3 Vapi

Source: https://vapi.ai/pricing (accessed 2026-07-30) [documented].

- **Orchestration: $0.05/min** of call time. Model costs (STT/LLM/TTS) pass through **at cost**, or $0 if you bring your own API keys [documented].
- **Concurrency: 10 lines included; +$10/line/month** thereafter; Scale/Enterprise = fixed platform fee + committed volume pricing [documented].
- Free credits: ~$10 trial credit reported by third parties [reported, cloudtalk.io/cekura.ai, 2026-07-30].
- **Data retention: 14 days (calls) / 30 days (chat) default on Build; custom on Scale. Zero Data Retention is a $1,000/month add-on; HIPAA $2,000/month add-on.** SOC 2 / PCI / SSO / RBAC / data residency on Scale [documented].
- No EDU/K-12/COPPA/FERPA program found [estimate — absence as of 2026-07-30]. ZDR at $1k/mo is a meaningful floor cost for a minors-heavy product.
- Web SDK exists (browser calls via WebRTC through Daily under the hood) but the product is telephony-first [reported, vapi docs, 2026-07-30].
- Third-party all-in cost consensus: real per-minute lands $0.07–$0.33 depending on models chosen [reported, cekura.ai / softcery.com, 2026-07-30].

### 2.4 Retell

Source: https://www.retellai.com/pricing (accessed 2026-07-30) [documented].

- **Voice infrastructure: $0.055/min + platform TTS $0.015/min** (≈ $0.07/min engine floor); LLM per-minute bundles: GPT-5 nano $0.003/min … GPT-4.1 $0.045/min … Claude Sonnet-class $0.08/min … frontier $0.16/min; telephony $0.015/min (US Twilio; $0 with your own SIP) [documented].
- **Concurrency: first 20 concurrent free; +$8/concurrency/month**; enterprise custom from ~50+ [documented].
- $10 free credits [documented]. Enterprise reported from ~$8k [reported, cloudtalk.io, 2026-07-30].
- Telephony/contact-center product DNA; browser/web-call SDK exists but K-12/EDU posture: none found [estimate]. Third parties peg production totals at $0.13–$0.31/min [reported, cekura.ai/layer3labs.io, 2026-07-30].

---

## 3. Text-LLM costs for the conversation brain

Prices per **million tokens**, official pricing pages accessed 2026-07-30 [documented]:

| Model class | Input | Cached input | Output | Source |
|---|---|---|---|---|
| gpt-4o-mini | $0.15 | $0.075 | $0.60 | https://developers.openai.com/api/docs/pricing |
| gpt-5-mini | $0.25 | $0.025 | $2.00 | same |
| gpt-5-nano | $0.05 | $0.005 | $0.40 | same |
| gpt-4.1-mini | $0.40 | $0.10 | $1.60 | same |
| Claude Haiku 4.5 | $1.00 | (cache read ≈ 0.1×) | $5.00 | https://platform.claude.com/docs/en/pricing |
| Gemini 2.5 Flash | $0.30 | — | $2.50 | [reported, official pricing via pricepertoken.com/opslyft.com, 2026-07-30; 2.5 Flash deprecates 2026-10-16 → Gemini 3 Flash $0.50/$3.00 or 3.1 Flash-Lite $0.25/$1.50] |
| *(reference: realtime S2S audio)* gpt-realtime | $32 audio-in | — | $64 audio-out | developers.openai.com [documented] |
| *(reference)* gpt-realtime-mini / 2.1-mini | $10 audio-in | — | $20 audio-out | same [documented] |

**Tokens per conversation turn [estimate]** — assumptions: system prompt + curriculum context ≈ 600 tok (cache-hit after turn 1); rolling history for a beginner conversation averages ≈ 1,200 input tok/turn across a 40-turn session; beginner-directed agent replies are short, ≈ 60 output tok/turn.

**Formula:** `LLM cost per lesson = turns × (in_tok × P_in + out_tok × P_out)`

For 40 turns (48k in / 2.4k out, ignoring cache discounts → conservative):

| Brain | Cost / 10-min lesson | Cost / conv-minute |
|---|---|---|
| gpt-5-nano | $0.0034 | $0.0003 |
| gpt-4o-mini | $0.0086 | $0.0009 |
| gpt-5-mini | $0.0168 | $0.0017 |
| Gemini 2.5 Flash | $0.0204 | $0.0020 |
| Claude Haiku 4.5 | $0.0600 | $0.0060 |

**Conclusion [estimate]:** the text brain is $0.003–$0.06 per lesson — **1–2 orders of magnitude below the audio pipeline**. Model choice for the brain should be made on Spanish/ESL quality and instruction-following, not price. Prompt caching makes the gap even smaller.

---

## 4. Architecture patterns with latency budgets

Human-conversation comfort window: response within ~300–500 ms feels natural; production voice targets for 2026: p50 <250 ms (optimized) / <400 ms (standard cloud), p95 <800 ms [reported, https://telnyx.com/resources/voice-ai-agents-compared-latency + https://hamming.ai/resources/voice-ai-latency-whats-fast-whats-slow-how-to-fix-it, 2026-07-30]. Note for Palavox: beginners tolerate — and pedagogically benefit from — slightly slower, deliberate pacing, so p50 ≤800 ms is acceptable where cost/robustness demands it [estimate].

### A. Native speech-to-speech (S2S)

One model consumes and produces audio (e.g., OpenAI Realtime, our current implementation).

- **Latency:** ~300–800 ms voice-to-voice commonly reported for S2S; S2S saves ~100–200 ms vs cascaded by collapsing the pipeline [reported, telnyx/softcery latency roundups, 2026-07-30].
- **Cost [estimate]** — assumptions: OpenAI audio tokenization ≈ 600 audio-tok/min input, ≈ 1,200 audio-tok/min output [estimate, derived from OpenAI's historical ~$0.06/min-in at $100/M]; agent speaks ~4 of 10 min; context re-billing multiplier ×2.5 on input across the session (each response re-reads accumulated audio context; caching reduces this).
  - gpt-realtime-mini: input 10 min × 600 × 2.5 = 15k tok → $0.15; output 4 min × 1,200 = 4.8k tok → $0.096 ⇒ **≈ $0.25/lesson ($0.025/min)**, range **$0.25–$1.00/lesson** depending on context management/caching.
  - gpt-realtime (full): 3.2× audio rates ⇒ **≈ $0.80–$3.20/lesson**.
- **Fit:** best latency and prosody for free conversation; weakest for curriculum control (hard to force scripted drills), no phoneme-level scoring, per-vendor concurrency limits apply directly, costs scale with session length not with pedagogy.

### B. Streaming STT → small text LLM → streaming TTS (cascaded)

**Itemized latency chain (from learner stops speaking to first agent audio) [reported figures; chain assembly is [estimate]]:**

| Stage | Typical | Source |
|---|---|---|
| Mic capture + uplink (WebRTC) | 30–80 ms | [estimate; +50–150 ms if TURN/TCP relay] |
| VAD silence hold (`stop_secs`) | 200–500 ms | [documented default behavior, docs.pipecat.ai] |
| Semantic turn check (Smart Turn v3) | ~12 ms CPU | [documented, daily.co blog] |
| STT final transcript (streaming, e.g. Deepgram) | ~50–300 ms (Deepgram ~150 ms reported) | [reported, introl.com/retellai.com] |
| LLM TTFT (mini-class model) | 200–400 ms (350 ms–1 s+ for larger models) | [reported, telnyx/hamming] |
| TTS time-to-first-audio (streaming) | 75–200 ms | [reported, telnyx: ElevenLabs ~75 ms class] |
| Downlink + playout buffer | 30–80 ms | [estimate] |
| **Total** | **~600–1,300 ms typical; ~500–800 ms well-tuned** | [reported: stitched stacks 600–1,700 ms] |

- **Cost [estimate]** — components: STT full-duplex 10 min × $0.0048–0.0059 = $0.048–0.059; LLM ≈ $0.009 (gpt-4o-mini); TTS 4 min agent speech × $0.015–0.03 = $0.06–0.12; orchestration/hosting 10 min × $0.01 (LiveKit agent min or Pipecat active) = $0.10 (or ≈ $0.005 at Pipecat reserved rates); transport ≈ free–$0.005.
  ⇒ **≈ $0.22–$0.29/lesson active ($0.022–0.029/min); ≈ $0.13–$0.19/lesson on reserved instances.**
- **Fit:** full control (inject curriculum context per turn, log transcripts for assessment), vendor-swappable at every stage (fallback routing), Spanish quality controllable per component. This is the pattern the orchestration frameworks are built for.

### C. STT → deterministic curriculum layer → LLM only when needed → TTS

For scripted activities (minimal pairs, read-aloud, drills, dictation) the expected answer is known — a deterministic matcher (normalized string/phoneme match against the expected response) handles the turn, and the LLM is invoked only for open deviations, hints, or free follow-ups.

- **% of turns avoidable [estimate]:** for scripted drills, 60–80% of turns need no LLM call (expected-answer match or simple branch); for dictation ≈ 95–100% (pure STT compare); for free conversation 0%. Blended across a beginner lesson that is 50% drills: ~35–50% of all LLM calls avoided.
- **TTS is the bigger win: scripted prompt lines are cacheable.** Pre-generate lesson audio once (~$0.03/min one-time), serve from CDN/storage ⇒ marginal TTS ≈ $0 for scripted lines. Only dynamic feedback lines hit live TTS.
- **Latency:** deterministic path skips LLM TTFT and live TTS ⇒ turn-end detection + match (<10 ms) + cached-audio playout ≈ **300–600 ms** [estimate]; feels *snappier* than A or B for drills.
- **Cost [estimate]:** STT $0.05 + LLM $0.003 + live TTS $0.01 + hosting $0.10 active/$0.005 reserved ⇒ **≈ $0.16/lesson active, ≈ $0.07/lesson reserved.**

### D. Hybrid routing by activity type

Route per activity: free conversation → A (or B); drills/read-aloud → C; dictation → STT-only; lesson audio → pre-generated cached TTS (use case 4). The orchestration frameworks make this natural (one session, swappable pipeline nodes; LiveKit Agents/Pipecat both support mid-session pipeline changes).

- **Cost [estimate]:** blended for a typical beginner lesson (≈ 40% conversation / 60% scripted): 0.4 × $0.25 + 0.6 × $0.10 ≈ **$0.16/lesson (~$0.016/min)** — with S2S reserved only for the conversation segment. All-cascaded hybrid ≈ $0.10–0.20/lesson.
- **Latency:** per segment as above. This is the recommended candidate pattern for cost + pedagogy control [estimate/opinion].

### E. Async pronunciation analysis alongside realtime conversation

Realtime path (A–D) unchanged; session audio is recorded (Pipecat $0.005/min [documented]) and analyzed post-session for phoneme-level scoring and error taxonomy (use case 5) using batch STT/pronunciation-assessment providers (pricing in sibling provider doc; representative: batch STT ≈ $0.26/hr ⇒ $0.043/10-min [reported class figure]; dedicated pronunciation assessment ≈ $1/hr class ⇒ ~$0.17/10-min [reported class figure]).

- **Latency:** zero added to the realtime loop; results arrive seconds-to-minutes later — fine for post-session reports and teacher dashboards.
- **Cost adder [estimate]:** ≈ $0.05–0.22/lesson (recording + batch analysis).

### F. Low-bandwidth / degraded fallback (text + browser TTS)

When WebRTC fails (blocked UDP + broken TURN, filtered TLS) or bandwidth collapses: fall back to text chat + **browser-native `speechSynthesis`** (Web Speech API, on-device, $0) and optionally browser `SpeechRecognition` or push-to-talk audio-clip upload over HTTPS.

- **Latency:** LLM TTFT 200–400 ms + local TTS start ~50–200 ms [estimate]; immune to RTC transport issues.
- **Cost [estimate]:** LLM only ≈ **$0.01/lesson**. Quality caveat: browser TTS voices (especially Spanish on Chromebooks) are robotic; acceptable as a degraded mode only. Note ChromeOS ships local espeak/Google voices offline [reported, common knowledge — verify on target devices].

---

## 5. Pattern-by-pattern comparison — 10-minute beginner conversation (~40 learner turns)

Assumptions recap [estimate]: 10 min session; learner audio 10 min (full-duplex listening); agent speech 4 min; 40 turns; gpt-4o-mini-class brain; Deepgram-class STT $0.005/min; TTS $0.015–0.03/min; hosting $0.01/min active ($0.0005 reserved); OpenAI Realtime token assumptions per §4A.

| Pattern | Voice-to-voice latency (reported/est.) | Cost / 10-min lesson | Cost / conv-min | Curriculum control | Phoneme scoring | School-network robustness |
|---|---|---|---|---|---|---|
| **A. Native S2S** (gpt-realtime-mini) | ~300–800 ms [reported] | $0.25–$1.00 [estimate] | $0.03–$0.10 | Weak | No | WebRTC/WS; vendor-dependent TURN |
| **A′. S2S full gpt-realtime** | ~300–800 ms | $0.80–$3.20 [estimate] | $0.08–$0.32 | Weak | No | same |
| **B. Cascaded STT→LLM→TTS** | ~600–1,300 ms typical; 500–800 ms tuned [reported] | $0.22–$0.29 active / $0.13–$0.19 reserved [estimate] | $0.013–$0.029 | Full | Via STT + async | TURN/TLS:443 controllable |
| **C. Deterministic-first + LLM-on-demand** | 300–600 ms (drill turns) [estimate] | ~$0.16 active / ~$0.07 reserved [estimate] | $0.007–$0.016 | Full (scripted) | Yes (expected-answer + async) | Best (less streaming needed) |
| **D. Hybrid by activity** | per segment | ~$0.10–$0.20 [estimate] | $0.010–$0.020 | Full | Yes | Good |
| **E. + Async pronunciation analysis** | +0 ms realtime | +$0.05–$0.22 adder [estimate] | +$0.005–$0.022 | n/a | **Yes (phoneme-level)** | n/a (HTTPS batch) |
| **F. Text + browser TTS fallback** | ~250–600 ms text-to-audio [estimate] | ~$0.01 [estimate] | ~$0.001 | Full | No | Maximum (HTTPS only) |
| *(ref) Vapi-managed cascaded* | vendor-tuned, ~sub-second class [reported] | ~$0.70–$0.80 ($0.50 orchestration + ~$0.20 models) [estimate on documented unit prices] | $0.07–$0.08 | Medium (their runtime) | No | Their infra |
| *(ref) Retell-managed* | ~sub-second class [reported] | ~$0.75–$1.15 ($0.70 engine+TTS + LLM bundle; no telephony for web) [estimate on documented unit prices] | $0.075–$0.115 | Medium | No | Their infra |

**Orchestration-fee-only comparison (per conversation-minute):** LiveKit Cloud $0.01 + ~$0.0005 transport; Pipecat Cloud $0.01 active / $0.0005 reserved + free 1:1 voice transport; Vapi $0.05; Retell $0.055 (+$0.015 platform TTS). **Vapi/Retell charge 5–7× the framework platforms before any model costs** [documented unit prices; comparison is [estimate]].

---

## 6. Concurrency scaling & monthly TCO context

**Classroom reality:** synchronized use = 25–35 students speaking at once **per classroom**. Peak concurrency, not MAU, is the binding constraint. One school hour with 10 active classrooms = 250–350 concurrent sessions.

### Concurrency cost/feasibility at N simultaneous sessions [documented caps; $ math is [estimate]]

| Concurrent | LiveKit Cloud | Pipecat Cloud | Vapi | Retell |
|---|---|---|---|---|
| 10 | Ship $50/mo (cap 20) | ~10 reserved 1x ≈ $216/mo, or pure active | included (10 lines) | free (≤20) |
| 50 | Scale $500/mo (cap 600) | ~$1,080/mo reserved or active on demand | +40 lines = $400/mo + usage | +30 = $240/mo + usage |
| 100 | Scale $500/mo | ~$2,160/mo reserved (or active) | +90 = $900/mo + usage | +80 = $640/mo + usage |
| 500 | Scale $500/mo (≤600) | custom/enterprise likely | +490 = $4,900/mo + usage | enterprise (custom) |
| 1,000 | Enterprise (custom) | enterprise | enterprise | enterprise |

Notes: LiveKit's Scale tier absorbing 600 concurrent agents at a flat $500 + usage is the standout [documented cap]. Pipecat reserved instances are 20× cheaper per minute but bill 24/7 — reserved pays off only when instance utilization exceeds ~5% (43,200 min/mo × $0.0005 = $21.60 vs the same minutes at $0.01 active) [estimate]; the right shape is a reserved baseline + active burst for school-hours spikes. Vapi/Retell concurrency line items are pure adders on top of per-minute fees.

### 10,000 MAU × 60 voice-min/month = 600,000 conv-min/month

**Formula:** `monthly = base fee + orchestration(600k min) + STT + TTS + LLM (+ transport)`

| Stack | Orchestration | Components (B-pattern) | Total/mo [estimate] | $/min |
|---|---|---|---|---|
| LiveKit Cloud Scale, Pattern B | $500 + (600k−50k)×$0.01 = $6,000 | STT $3,000 + TTS $3,600–7,200 + LLM $600 + WebRTC ~$240 | **~$13.4k–17.0k** | $0.022–0.028 |
| Pipecat Cloud, Pattern B, reserved-heavy | ~$300–1,500 (utilization-dependent) | same ~$7.2k–10.8k | **~$7.5k–12.3k** | $0.013–0.021 |
| Pattern C/D on either framework | as above | LLM/TTS largely avoided/cached | **~$6k–10k** | $0.010–0.017 |
| Pattern A (gpt-realtime-mini) + LiveKit transport | $6,000 hosting + transport | S2S audio $15k–60k | **~$21k–66k** | $0.035–0.11 |
| Vapi | 600k × $0.05 = $30,000 (+lines) | models at cost ~$7k | **~$37k+** | ~$0.062 |
| Retell | 600k × $0.07 = $42,000 (+concurrency) | LLM bundles $1.8k–27k | **~$44k–69k** | $0.073–0.115 |
| Self-host LiveKit/Pipecat OSS | compute+egress (est. $1–3k) | ~$7.2k–10.8k | **~$8k–14k** | $0.014–0.023 |

Free tiers: LiveKit Build (1k agent-min, 5 concurrent) and Daily 10k WebRTC min are adequate for prototyping only; Vapi/Retell ~$10 credits [documented].

---

## 7. Browser constraints & school-network realities

- **Safari/iOS autoplay + mic:** audio playback requires a user gesture; `AudioContext` must be created/resumed inside the gesture handler. Once the page is capturing via `getUserMedia`, Safari permits AudioContext output without further gestures — so "tap to start speaking" unlocks the whole session [reported, https://webrtchacks.com/autoplay-restrictions-and-webrtc/, accessed 2026-07-30]. iOS quirks: activating the mic can force audio output to the built-in speaker (headphone/echo issues) [reported, medium.com iOS Safari note, 2026-07-30]; ongoing iOS 18.x AudioContext bugs are documented in Apple forums [reported, developer.apple.com/forums/thread/763919, 2026-07-30]. **Design rule: every voice activity starts from an explicit tap; never rely on autoplay.**
- **WebRTC on school-filtered networks:** school firewalls commonly block UDP entirely; STUN/TURN must fall back to TCP and ultimately **TURN over TLS on port 443**, which most closely resembles ordinary HTTPS to middleboxes [reported, https://blog.addpipe.com/troubleshooting-webrtc-connection-issues/ + ON24 TURN guidance, 2026-07-30]. Managed Chromebooks can further restrict candidate gathering via the `WebRtcIPHandling` enterprise policy [documented, https://chromeenterprise.google/policies/web-rtc-ip-handling/, 2026-07-30]. TURN/TCP adds relay latency and TCP head-of-line blocking under packet loss [reported]; budget +50–150 ms and degraded audio under loss [estimate]. SSL-inspecting content filters (GoGuardian/Securly/Lightspeed-class) can break WSS/WebRTC handshakes; district IT domain-allowlisting of our TURN/SFU domains is an onboarding requirement [estimate — standard EdTech deployment practice; verify per district].
- **Bandwidth:** Opus mono voice ≈ 24–32 kbps; 30 simultaneous uplinks ≈ ~1 Mbps per classroom — usually fine, but shared Wi-Fi contention and a single TURN relay path are the real risks [estimate]. Pattern F (HTTPS-only text + browser TTS) is the guaranteed-delivery floor; Pipecat's WebSocket transport is a middle fallback.
- **Chromebooks:** low-end CPUs; keep the client thin — no in-browser ML (VAD/turn models run server-side in the agent), modest DOM/audio-graph complexity; browser `speechSynthesis` available offline on ChromeOS for Pattern F [reported/estimate].

---

## 8. Data retention & compliance snapshot (orchestration layer)

| Vendor | Retention default | Zero-retention option | Compliance posture | K-12/EDU program |
|---|---|---|---|---|
| LiveKit Cloud | media not stored by default (SFU relays; recordings opt-in) [reported, docs] | effectively yes for media; Enterprise DPA for metadata | SOC 2; HIPAA-eligible + data residency at Scale [documented] | none public [estimate] — Enterprise DPA or self-host |
| Pipecat Cloud / Daily | recordings only if enabled (billed) [documented] | self-host Pipecat = full control | Daily SOC 2, HIPAA [reported] | none public [estimate] |
| Vapi | 14 days calls / 30 days chat [documented] | **ZDR $1,000/mo add-on** [documented] | SOC 2, HIPAA (+$2k/mo), PCI [documented] | none public [estimate] |
| Retell | stored for dashboard/review (configurable) [reported] | enterprise custom | SOC 2, HIPAA claims [reported] | none public [estimate] |

For a product with US-school minors (COPPA/FERPA/state student-privacy laws), none of the four offers a turnkey K-12 program — the realistic paths are (1) framework platform + negotiated DPA, or (2) self-hosted LiveKit/Pipecat where student audio never leaves our infrastructure except to the model providers we contract directly [estimate/analysis].

---

## 9. Summary table

| Dimension | LiveKit (Cloud/self-host + Agents) | Pipecat / Daily (OSS + Pipecat Cloud) | Vapi | Retell |
|---|---|---|---|---|
| What it is | WebRTC infra + OSS agent framework | OSS pipeline framework + managed agent hosting on Daily | Managed voice-agent platform | Managed voice-agent platform (contact-center DNA) |
| Orchestration cost | $0.01/agent-min + $0.0004–0.0005/participant-min; $50–500/mo tiers [documented] | $0.01/min active, $0.0005/min reserved; 1:1 voice transport free [documented] | $0.05/min + models at cost [documented] | $0.055/min + $0.015 TTS + LLM bundles [documented] |
| Concurrency & raise process | 5/20/600 by tier; Enterprise beyond [documented] | instance-based, no public cap; enterprise for volume [documented/estimate] | 10 incl.; +$10/line/mo; enterprise [documented] | 20 free; +$8/concurrency/mo; enterprise ≥50 [documented] |
| Adds over raw SDKs | SFU+TURN, Agents pipeline, turn-detector plugin, inference gateway, fallback routing, SIP | Vendor-neutral pipeline, Smart Turn v3 (12 ms, 23 langs), Krisp, WS fallback transport, recording | Full runtime, turn-taking, telephony, dashboard config | Full runtime, telephony, per-min LLM bundles |
| Self-host | Yes (Apache-2.0 SFU + agents) | Yes (Pipecat OSS; bring any transport) | No | No |
| Browser/Safari/iOS | WebRTC SDKs incl. iOS Safari; TURN/TLS 443 | Daily WebRTC incl. iOS Safari; WebSocket alt | Web SDK (telephony-first) | Web SDK (telephony-first) |
| Spanish support | Component-dependent (pick STT/TTS); turn-detector multilingual | Smart Turn v3 covers 23 languages incl. Spanish [documented] | Component-dependent | Component-dependent |
| K-12 / FERPA / COPPA | No public program; HIPAA+residency at Scale; self-host = strongest story | No public program; SOC2/HIPAA; OSS self-host option | No program; ZDR $1k/mo, HIPAA $2k/mo | No program; enterprise custom |
| 10-min lesson, Pattern B [estimate] | ~$0.22–0.29 | ~$0.13–0.29 | ~$0.70–0.80 | ~$0.75–1.15 |
| 10k MAU × 60 min/mo [estimate] | ~$13–17k (Cloud) / ~$8–14k (self-host) | ~$7.5–12.3k | ~$37k+ | ~$44k+ |
| Fit for Palavox | **Strong** — Scale tier covers classroom concurrency at flat $500 + usage; full curriculum control | **Strong** — cheapest managed hosting via reserved instances; best OSS turn detection; WS fallback | Weak — 5× orchestration premium, telephony-centric, ZDR paywalled | Weak — most expensive, contact-center focus |
| Recommended pattern | **D (hybrid): C for drills/dictation, B (or A for premium) for free conversation, E async phoneme analysis, F as school-network floor** — ~$0.10–0.20/lesson vs ~$0.25–1.00 S2S-only [estimate] | | | |

---

*End of wip-11d. Numbers marked [estimate] should be re-validated with a 2-week PoC measuring actual tokens/turn, TURN-relay rates on real district networks, and per-pattern latency percentiles before any commitment.*
