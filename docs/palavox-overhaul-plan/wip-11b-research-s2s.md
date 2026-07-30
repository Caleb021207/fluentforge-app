# WIP 11b — Provider Research: Native Realtime Speech-to-Speech (S2S)

Planning-phase research for the Palavox voice overhaul. Scope: **native realtime speech-to-speech offerings** (single-model audio-in/audio-out). Companion docs: `wip-11a-voice-current-state.md` (current stack), doc 11c/11d (STT/TTS + pronunciation-assessment tracks, separate scope), doc 16 (hands-on latency/quality study to be run before any decision).

**All web sources accessed 2026-07-30.** Every material claim is labeled:

- **[documented]** — vendor docs / pricing page / official announcement
- **[reported]** — third-party source (benchmarks, press, forums); treat as unverified
- **[estimate]** — our math; formula and assumptions shown

Vendor performance claims (latency, "best-in-class" anything) are always labeled as claims, never as measurements. Nothing here is a measurement of ours; doc 16 exists to produce those.

---

## 0. Scope and evaluation frame

Use cases evaluated (from the planning brief):

| # | Use case | What S2S must provide |
|---|---|---|
| UC1 | Realtime spoken conversation for beginners (accented, mispronounced, code-switched speech; English AND Spanish targets) | Robust ASR-side handling of non-native speech, controllable persona, slow speech, constrained vocabulary, barge-in |
| UC2 | Pronunciation drills / minimal pairs / read-aloud with phoneme-level scoring | Phoneme/GOP-level scoring — **no S2S API provides this** (see §8.1) |
| UC3 | Dictation | Not an S2S job; STT track (doc 11c) |
| UC4 | TTS lesson audio at scale (cacheable) | Not an S2S job; TTS track (doc 11d) |
| UC5 | Async post-session analysis | Session transcripts/audio export from the S2S session |
| UC6 | Synchronized classroom use: 25–35 students speaking simultaneously on school networks / Chromebooks | Concurrency ceiling ≥ 35 per classroom (× classrooms), WebSocket/WebRTC that survives school firewalls, Chromebook-friendly client |

So S2S is really being purchased for **UC1 + UC6**, with UC5 as an exhaust product. UC2/3/4 need different tools regardless of vendor choice.

---

## 1. Common cost model (used for every vendor)

### 1.1 Formulas

```
P_in   = price per minute of user (input) audio
P_out  = price per minute of model (output) audio
a_in   = user-speech minutes per conversation-minute   (default 0.5)
a_out  = model-speech minutes per conversation-minute  (default 0.5)
OH     = per-minute overhead (context re-reads, platform fee, system prompt)

conv_min            = a_in·P_in + a_out·P_out + OH
lesson_10           = 10 × conv_min
cost_at_N_concurrent = N × 60 × conv_min          ($/hour of wall-clock)
monthly_10k_MAU     = 600,000 × conv_min          (10,000 MAU × 60 voice-min/mo)
```

### 1.2 Assumptions (explicit)

1. **50/50 talk split** (`a_in = a_out = 0.5`). Beginner lessons are probably tutor-heavy (model speaks more), which *raises* cost for every token-priced vendor since output audio is 3–4× the input price. A tutor-heavy 40/60 split raises token-vendor numbers ~15–20%. [estimate]
2. **Token-billed vendors bill only committed speech** (server VAD trims silence) for input. For Gemini Live this is uncertain — the model listens continuously — so a "continuous listening" variant (`a_in = 1.0`) is also shown. [estimate]
3. **Context re-billing**: token-based realtime APIs re-read the whole conversation on every model turn. With prompt caching this is cheap but not zero; modeled explicitly for OpenAI (§2.5). Real-world bills consistently run above naive per-minute math for this reason ([reported] https://hackernoon.com/openai-realtime-api-pricing-in-2026-real-world-data-from-4000-measured-sessions).
4. **Per-minute-billed vendors** (ElevenLabs, Hume, Grok) bill wall-clock connected minutes, so `a_in/a_out` don't apply — silence costs the same as speech.
5. Optional input transcription (needed for UC5 analytics) is an add-on for OpenAI/Gemini and is **not** included in the base math.
6. Concurrency-scenario $/hour assumes every session is active the full hour (worst case = classroom block).

---

## 2. OpenAI Realtime API (incumbent)

### 2.1 Current models & prices

Current model family (newest first), from the official pricing page ([documented] https://developers.openai.com/api/docs/pricing):

| Model | Audio in / cached / out (per 1M tokens) | Text in / cached / out (per 1M) |
|---|---|---|
| **gpt-realtime-2.1** (flagship, released 2026-07-06) | $32.00 / $0.40 / $64.00 | $4.00 / $0.40 / $24.00 |
| **gpt-realtime-2.1-mini** | $10.00 / $0.30 / $20.00 | $0.60 / $0.06 / $2.40 |
| gpt-realtime-2, gpt-realtime-1.5, gpt-realtime (legacy) | $32 / $0.40 / $64 | $4 / $0.40 / $16–24 |
| gpt-realtime-mini (legacy) | $10 / $0.30 / $20 | $0.60 / $0.06 / $2.40 |

Specialized siblings: `gpt-realtime-translate` (live translation) and `gpt-live-transcribe` ([documented] https://developers.openai.com/api/docs/guides/realtime). Release of 2.1/2.1-mini with "p95 voice latency cut ≥25%" claim: [reported] https://www.marktechpost.com/2026/07/06/openai-gpt-realtime-2-1-mini-reasoning-realtime-api/ (vendor claim relayed by press).

**Audio token conversion**: 1 min user audio ≈ 600 input tokens; 1 min model audio ≈ 1,200 output tokens. Long-standing conversion, consistent with OpenAI's original "$0.06/min in, $0.24/min out at $100/$200 per 1M" equivalence. [reported] (multi-source: https://www.layer3labs.io/guides/openai-realtime-api-pricing, https://www.forasoft.com/blog/article/openai-realtime-api-pricing; original equivalence https://openai.com/index/introducing-the-realtime-api/ — page returned 403 on fetch, not re-verified today).

Per-minute equivalents [estimate from documented token prices + reported conversion]:

- gpt-realtime-2.1: **$0.0192/min heard, $0.0768/min spoken**
- gpt-realtime-2.1-mini: **$0.006/min heard, $0.024/min spoken**

### 2.2 Capabilities vs our use cases

- **Transports: WebRTC, WebSocket, and SIP** [documented] https://developers.openai.com/api/docs/guides/realtime. WebRTC with ephemeral client tokens is exactly Palavox's current architecture (wip-11a §3). WebSocket path is available as a school-firewall fallback (443/TLS).
- **Turn detection**: server VAD and **semantic VAD** (`turn_detection: {type: "semantic_vad"}`), or `null` for push-to-talk [documented] https://developers.openai.com/api/docs/guides/realtime-conversations. Semantic VAD matters for beginners who pause mid-sentence — plain silence-VAD interrupts them.
- **Barge-in**: automatic response cancellation on user speech + `conversation.item.truncate` to keep model context honest [documented, same page].
- **Speaking speed**: output `speed` parameter in session audio config [documented] https://openai.github.io/openai-agents-python/ref/realtime/config/ and API reference; range 0.25–1.5 [reported, range not re-verified today]. This is a genuine differentiator for beginner listening comprehension — most rivals only offer prompt-based "please speak slowly."
- **Session cap: 60 minutes** [documented] https://developers.openai.com/api/docs/guides/realtime-conversations — fine for 10-min lessons.
- **Instruction following**: GPT-Realtime-2 claimed +13.8% on Audio MultiChallenge vs 1.5 [reported vendor claim via https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/a-new-chapter-for-realtime-ai-reasoning-translation-and-real-time-transcription/4517124]. Constrained-vocabulary personas are prompt-enforced only — no hard guarantee; must be tested in doc 16.
- **Multimodal**: text+audio+image in, text+audio out; 128k context; 32k max output [documented] https://developers.openai.com/api/docs/models/gpt-realtime-2.1.

### 2.3 Quality / accent / Spanish evidence

- Artificial Analysis Big Bench Audio (speech reasoning, **not** an accent-robustness test): GPT-Realtime-2 (high) ≈ 96.6%, gpt-realtime-2.1 (high) ≈ 96%, 2.1 minimal-reasoning ≈ 87%, legacy gpt-realtime-mini ≈ 64%; time-to-first-audio ≈ 0.97–1.22 s across variants. [reported] https://artificialanalysis.ai/speech-to-speech (JS-heavy page; numbers cross-checked against https://x.com/ArtificialAnlys/status/2001388724987527353 and the AA S2S index article).
- **The mini-tier reasoning gap (64% legacy mini vs 96% flagship) is the headline risk**: the cheap tier that makes classroom economics work was measurably much weaker; 2.1-mini's score needs checking in doc 16.
- Spanish: supported (multilingual model; official translation sibling). No public per-language quality benchmark. Palavox's own history (wip-11a §2) records GPT Realtime voices judged weak for many languages in Oct 2025 — worth re-testing on 2.1. [observed→requires re-test]
- No public benchmark on non-native/beginner accented speech for any vendor in this doc. [reported gap]

### 2.4 Concurrency, rate limits, process to raise

- **No hard concurrent-session cap since 2025-02-03** [documented changelog, relayed by https://www.codewords.ai/blog/openai-api-rate-limits]. Practical ceiling = TPM budget.
- gpt-realtime-2.1 TPM by tier [documented] https://developers.openai.com/api/docs/models/gpt-realtime-2.1: T1 40k, T2 200k, T3 800k, T4 4M, T5 15M (RPM 200→20k).
- An active session consumes ≈10k TPM incl. cached re-reads [estimate: 300 in + 600 out audio tokens + ~9k cached context per minute]. → **T1 ≈ 4 concurrent, T2 ≈ 20, T3 ≈ 80, T4 ≈ 400, T5 ≈ 1,500** [estimate]. A 35-student classroom needs ≥T3; tiers rise automatically with spend history; beyond T5 = sales.

### 2.5 Cost math

Base conv-min [estimate]: `0.5×$0.0192 + 0.5×$0.0768 = $0.048`.
Context overhead, 10-min lesson, 20 model turns, ~9k final audio-token context: cumulative re-read ≈ 90k tokens, nearly all cached @ $0.40/1M ≈ **+$0.036/lesson** (2.1) — i.e. OH ≈ $0.004/min. Effective:

| Metric | gpt-realtime-2.1 | 2.1-mini |
|---|---|---|
| Conversation-minute | **$0.052** | **$0.018** |
| 10-min lesson | **$0.52** | **$0.18** |
| $/hr @ 10 / 50 / 100 / 500 / 1000 concurrent | $31 / $156 / $312 / $1,560 / $3,120 | $11 / $54 / $108 / $540 / $1,080 |
| 10k MAU × 60 min/mo (600k min) | **$31,200/mo** | **$10,800/mo** |

All [estimate] per §1 formulas. Real-world telemetry suggests naive math undershoots by 20–60% without disciplined caching/truncation [reported] https://hackernoon.com/openai-realtime-api-pricing-in-2026-real-world-data-from-4000-measured-sessions.

### 2.6 Privacy / K-12 posture

- API data **not used for training** by default; abuse-monitoring retention ≤30 days; **`/v1/realtime` is ZDR-eligible** (approval via sales); Modified Abuse Monitoring available; regional data storage incl. US; regional processing US/EU/UAE for select endpoints. [documented] https://developers.openai.com/api/docs/guides/your-data
- No K-12-specific API program; FERPA/COPPA compliance is Palavox's obligation as operator, with OpenAI as processor under their DPA. ZDR + no-training is a workable district story but must be negotiated. [documented terms + estimate of posture]
- Under-13 users cannot be OpenAI's direct users per Terms; API products where Palavox is the deployer are the standard pattern — needs counsel review, same as every vendor here.

### 2.7 Lock-in

Proprietary event protocol, but the **largest ecosystem** (Agents SDK, LiveKit/Pipecat adapters) and a true second source: **Azure Voice Live / Azure OpenAI serves the same gpt-realtime family** under Microsoft's EDU-friendly compliance umbrella ([documented] https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/realtime-2, https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-faq). Lowest practical lock-in of the native-S2S options.

---

## 3. Google Gemini Live API

### 3.1 Models & prices ([documented] https://ai.google.dev/gemini-api/docs/pricing)

| Model | Audio in | Audio out | Text in/out |
|---|---|---|---|
| `gemini-2.5-flash-native-audio-preview-12-2025` | $3.00/1M tok | $12.00/1M tok | $0.50 / $2.00 per 1M |
| `gemini-3.1-flash-live-preview` | **$3.00/1M or $0.005/min** | **$12.00/1M or $0.018/min** | $0.75 / $4.50 per 1M |
| `gemini-3.5-live-translate-preview` | $3.50/1M or $0.0053/min | $21.00/1M or $0.0315/min | — |

Free tier: Live API usable at no charge (with tight limits). [documented same page] Note the per-minute equivalents are now printed on Google's own pricing page — the only vendor to do so.

**Caution: every current Live model is a `-preview`.** Google has repeatedly rotated Live model IDs (native-audio-preview-09-2025 → 12-2025 → 3.1-live-preview); expect forced migrations. [documented naming; churn [reported] via forum threads]

### 3.2 Capabilities vs use cases

- **WebSocket only** (stateful WSS; client-to-server or server-proxy). No WebRTC transport. [documented] https://ai.google.dev/gemini-api/docs/live — WSS on 443 is actually the most school-firewall-tolerant option.
- Session limits: **15 min audio-only / 2 min audio+video without compression**; **unlimited with context-window compression** (sliding window); ~10-min connection slices with session resumption + GoAway warnings. Context: 128k (native audio). [documented] https://ai.google.dev/gemini-api/docs/live-guide
- VAD: automatic, with `startOfSpeechSensitivity`/`endOfSpeechSensitivity`, `prefixPaddingMs`, `silenceDurationMs`; manual activity events possible; **barge-in supported**. [documented, same page]
- **Proactive audio** (model can decide not to respond) and **affective dialog** — 2.5 native audio only, v1beta. Proactive audio is pedagogically interesting (don't respond to teacher cross-talk in a classroom). [documented, same page]
- **97 languages incl. Spanish (`es`)** [documented live-guide]. No documented output speed parameter — "speak slowly" is prompt-only. [documented absence]
- Ephemeral-token support for client connections exists but Palavox would still likely proxy via Supabase; not verified today. [reported]

### 3.3 Quality evidence

- Big Bench Audio: **Gemini 3.1 Flash Live (high) ≈ 97%** but TTFA ≈ 2.99 s; 2.5 Flash Native Audio Dialog ≈ 69% at **0.63 s TTFA**; 2.5 Native Audio Thinking 92% at 3.87 s. [reported] https://artificialanalysis.ai/speech-to-speech, https://x.com/rohanpaul_ai/status/1977802278087311743 — classic speed/quality trade; the fast dialog model is the weak reasoner.
- Code-switching: auto language detection is a mixed blessing — forum reports of unwanted language flips on accented/mixed input. Directly relevant to beginner ESL; must test. [reported, low confidence]

### 3.4 Concurrency & limits

- Official rate-limit page now expresses tiers as spend-based caps (Tier 1 = $10/10-min spend, Tier 2–3 = $200/10-min) and does not print Live session caps [documented] https://ai.google.dev/gemini-api/docs/rate-limits.
- Live-specific: free tier 3 concurrent sessions, 1M TPM [reported mirror https://gemini-api.apidog.io/doc-965865]; **Tier 1 ≈ 50 concurrent; Tier 2 ≈ 1,000** — but a July 2026 forum thread reports a Tier-2 project still enforced at 50 [reported] https://discuss.ai.google.dev/t/gemini-live-api-tier-2-project-still-limited-to-50-concurrent-connections-and-billed-as-tier-1/94634. **50 concurrent is only ~1.5 classrooms** — this must be resolved with Google before Gemini is viable for UC6.
- Raising limits: spend-tier progression (automatic-ish) + forum/support escalation; Vertex AI route has separate, negotiable quotas.

### 3.5 Cost math [estimate]

Using documented per-minute prices (3.1-flash-live): conv-min = `0.5×$0.005 + 0.5×$0.018` = **$0.0115**; continuous-listening variant (`a_in=1.0`) = **$0.0140**. Context re-billing under compression is not clearly documented — flag ±2× uncertainty until doc 16 measures real `usageMetadata`.

| Metric | Value (talk-time · continuous) |
|---|---|
| Conversation-minute | **$0.0115 · $0.0140** |
| 10-min lesson | **$0.12 · $0.14** |
| $/hr @ 10/50/100/500/1000 | $6.90/$34.50/$69/$345/$690 · $8.40/$42/$84/$420/$840 |
| 600k min/mo | **$6,900 · $8,400** |

Roughly **4× cheaper than gpt-realtime-2.1, ~1.5× cheaper than 2.1-mini**.

### 3.6 Privacy / K-12

- Paid tier: prompts/responses **not used to improve products**; abuse-monitoring logs retained **55 days**; **ZDR available per-project by request**. Live API caveat: session resumption stores conversation state up to 24 h (must not configure `SessionResumptionConfig` under ZDR); Search grounding storage can't be disabled. [documented] https://ai.google.dev/gemini-api/docs/zdr, https://ai.google.dev/gemini-api/docs/usage-policies
- K-12: the strong Google story ("Gemini for Education," FERPA/COPPA commitments) applies to **Workspace for Education / the Gemini app, not the developer API** [documented] https://blog.google/products-and-platforms/products/education/gemini-enterprise-grade-data-protection/. For an API product serving minors, the defensible route is **Vertex AI** under the Google Cloud DPA — separate pricing/quota surface, same models. [estimate of posture]
- AI Studio / Developer API terms have age restrictions unsuited to direct minor use; Palavox-as-operator pattern again — counsel review required.

### 3.7 Lock-in

Proprietary WS protocol; second surface (Vertex) is still Google. Preview-model churn is the bigger operational lock-in cost. Medium.

---

## 4. ElevenLabs Agents Platform (historical incumbent; cascaded, not native S2S)

Included for continuity (Palavox used ElevenLabs until ~Apr 2025, wip-11a §2) and because it competes for the same budget. Architecture is **STT→LLM→TTS orchestration, not a native S2S model** — evaluate accordingly.

### 4.1 Pricing ([documented] https://elevenlabs.io/pricing/agents)

| Plan | $/mo | Incl. agent minutes | Concurrent calls |
|---|---|---|---|
| Free | $0 | 15 | 4 |
| Starter | $6 | 75 | 6 |
| Creator | $22 ($11 first mo) | 275 | 10 |
| Pro | $99 | 1,238 | 20 |
| Scale | $299 | 3,738 | 30 |
| Business | $990 | 12,375 | 40 |

- Overage: **$0.08/min** on all listed plans; **burst pricing $0.16/min** temporarily above the concurrency cap; text messages $0.003. **LLM usage billed separately on top** ([documented] same page; ~$0.01–0.03/min typical [estimate]). Enterprise: custom rates (~$0.05–0.06/min [reported] https://www.cekura.ai/blogs/elevenlabs-pricing).
- Annual-business per-minute ≈ $0.08; Creator/Pro effective ≈ $0.10 [reported] https://www.cloudtalk.io/blog/elevenlabs-pricing/.

### 4.2 The historical "~5 concurrent" constraint — verified against current docs

The owner-reported ~5-concurrent cap (wip-11a §2, [requires validation]) is consistent with ElevenLabs' **TTS/streaming concurrency tiers, which still list Creator = 5** (Free 2 / Starter 3 / Creator 5 / Pro 10 / Scale-Business 15) [documented] https://help.elevenlabs.io/hc/en-us/articles/14312733311761. In the 2024–early-2025 era, Conversational AI drew on these same plan concurrency limits. **Today the Agents platform has its own, higher ladder (4→40 + burst + enterprise)** [documented pricing page], so the historical constraint is real but no longer the binding number. A 30–35-student classroom still requires Scale/Business minimum, and >40 needs enterprise or burst at 2× price.

### 4.3 Fit, quality, privacy

- Capabilities: excellent voices incl. Spanish, per-voice speed control, full pipeline transparency (you pick the STT, LLM, TTS), WebRTC + WebSocket SDKs, tool calling. Latency is inherently pipeline-bound: ~1 s+ typical [reported] https://deepgram.com/learn/is-elevenlabs-real-time-what-developers-need-to-know.
- **Zero Retention Mode** (enterprise; per-agent toggle), DPA, EU data residency, HIPAA via BAA; some integrations force ZRM for COPPA-sensitive contexts. No K-12-specific program. [documented] https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode, https://elevenlabs.io/dpa
- Big Bench Audio: N/A (depends on chosen LLM).

### 4.4 Cost math [estimate]

Wall-clock billing: conv-min = $0.08 + LLM ≈ **$0.09–0.11** (self-serve) / ~$0.06 (enterprise, reported).

| Metric | Self-serve | Enterprise (reported) |
|---|---|---|
| 10-min lesson | **$0.90–1.10** | ~$0.60 |
| $/hr @ 10/50/100/500/1000 | $54–66 / $270–330 / $540–660 / $2.7–3.3k / $5.4–6.6k | ~60% of that |
| 600k min/mo | **$54,000–66,000** | ~$36,000 |

**5–8× the token-priced native S2S options at scale.** Concurrency >40 not self-serve.

### 4.5 Lock-in

Platform-level (agent configs, voice IDs, conversation storage) but pipeline components are swappable in principle. The bigger issue is paying a per-minute platform premium forever.

---

## 5. Amazon Nova Sonic / Nova 2 Sonic (AWS Bedrock)

### 5.1 Models & prices

- **Nova 2 Sonic** `amazon.nova-2-sonic-v1:0`, launched 2025-12-02; 1M-token context, 64K max output; **speech+text in, speech+text out**; API: `InvokeModelWithBidirectionalStream` (HTTP/2); regions: us-east-1, us-west-2, eu-north-1, ap-northeast-1 (in-region only). [documented] https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-sonic.html
- Pricing: **speech in $3.00/1M tok, speech out $12.00/1M tok; text in $0.33/1M, text out $2.75/1M** [reported] https://rywalker.com/research/aws-nova-2-sonic, https://llm-stats.com/models/nova-2-sonic (the AWS pricing-page fetch did not surface the Sonic table; verify at https://aws.amazon.com/bedrock/pricing/ before final doc). Nova Sonic v1: $3.40/$13.60 speech [reported, same sources].
- Audio tokenization rate is **not publicly documented**; third-party estimates put combined speech I/O at **~$0.015–0.02/min** [reported] rywalker.com, https://www.adwaitx.com/amazon-nova-2-sonic-real-time-voice-ai/.

### 5.2 Capabilities vs use cases

- **Latency claim: "<700 ms"** [documented vendor claim] https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-nova-2-sonic-real-time-conversational-ai. AA measured TTFA ≈ 1.14 s [reported].
- Big Bench Audio: **Nova 2.0 Sonic ≈ 88%** [reported AA] — between Gemini's fast dialog model (69%) and GPT flagship (96%).
- **Languages: 7 — English, French, Italian, German, Spanish, + Portuguese, Hindi (polyglot voices)** [documented what's-new]. Spanish is in. Barge-in supported; robustness to noise/speaking styles is a vendor claim [documented claim, unmeasured].
- 1M context + async tool calling + cross-modal text/voice switching in-session [documented what's-new]. No output speed parameter [documented absence].
- **No browser-facing endpoint**: requires AWS SigV4 + HTTP/2 bidirectional streaming → must proxy through a backend. **Poor fit for Supabase Deno edge functions** (AWS SDK bidirectional streaming support outside Node is immature); AgentCore Runtime now offers WebSocket and WebRTC bidirectional front-ends [documented] https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-webrtc/ — but that pulls in a second AWS runtime product. **Highest integration cost of any option here.** [estimate]

### 5.3 Concurrency & quotas

Default account quotas exist per model/region; adjustable via Service Quotas console; **on-demand invocation quotas require an account-manager request** and priority goes to accounts already consuming their allocation [documented] https://docs.aws.amazon.com/nova/latest/nova2-userguide/quotas.html. The specific default concurrent-stream number for (2) Sonic is not printed in the public docs we fetched; community reports suggest low defaults (~20) for v1 [reported, low confidence]. **Action item: read the account's actual quota in the console before any pilot.**

### 5.4 Cost math [estimate]

Assuming Gemini-like tokenization (25–32 tok/s ⇒ in ≈ $0.0045–0.0058/min, out ≈ $0.018–0.023/min): conv-min ≈ `0.5×0.005 + 0.5×0.020` ≈ **$0.013** (corroborates reported $0.015/min combined).

| Metric | Value |
|---|---|
| Conversation-minute | **≈$0.013** (±30%) |
| 10-min lesson | **≈$0.13** |
| $/hr @ 10/50/100/500/1000 | $7.80 / $39 / $78 / $390 / $780 |
| 600k min/mo | **≈$7,800** |

### 5.5 Privacy / K-12

Strongest infrastructure story: "your content is not used to improve the base models and is not shared with any model providers"; content encrypted and stays in-region [documented] https://aws.amazon.com/bedrock/faqs/. AWS DPA + FERPA-eligible-services posture is district-procurement-friendly. In-region us-east-1 processing. [documented + estimate of posture]

### 5.6 Lock-in

AWS-only model, AWS-only transport, possible AgentCore dependency. High lock-in, mitigated only by Bedrock also hosting other (non-S2S) models.

---

## 6. Hume EVI

### 6.1 Prices ([documented] https://www.hume.ai/pricing)

Versions: **EVI 3** and **EVI 4-mini**. Free: 5 min/mo. Pay-go per-minute by plan: Starter/Creator **$0.07**, Pro **$0.06** (1,200 min incl.), Scale **$0.05** (5,000 min), Business **$0.04** (12,500 min), Enterprise custom. **Concurrency: 1–5 (Free/Starter), 5 (Creator/Pro), 20 (Scale), 30 (Business)**, enterprise custom.

### 6.2 Fit & quality

- EVI 3: S2S with strong prosody/emotion control and instructible speaking style; **English + Spanish only** [documented/reported] https://dev.hume.ai/docs/speech-to-speech-evi/faq — actually matches Palavox's two target languages.
- EVI 4-mini adds 11 languages (en, ja, ko, es, fr, pt, it, de, ru, hi, ar) [reported] https://dev.hume.ai/changelog.
- Latency: vendor claims sub-300 ms model response; practical ~1.2 s reported; EVI 4-mini ~100 ms faster [reported] https://research.contrary.com/company/hume-ai, Hume blog.
- Emotion measurement (expression scores per utterance) is unique and pedagogically interesting (frustration detection in drills) — but unvalidated for minors, and emotion inference on children is a COPPA/DPA red flag for districts. [estimate]
- No K-12 posture, small vendor, acquisition risk. Concurrency 30 = one classroom without enterprise. Cost math: conv-min $0.04–0.07 wall-clock → 10-min lesson **$0.40–0.70**; 600k min/mo **$24k–42k**. [estimate from documented prices]

---

## 7. Other credible S2S

- **xAI Grok Voice Agent API** — beta 2026-07; **$0.05/min** ($3/hr) audio; Grok Voice Think Fast 2.0 at **$0.08/min**; +$0.01/min telephony; tool calls billed per-1k. [reported] https://pondero.ai/news/2026-07-03-xai-voice-agent-builder/, https://www.eesel.ai/blog/grok-voice-agent-builder-pricing. Big Bench Audio ≈92–97% (Think Fast) — top-tier reasoning [reported AA X post]. Brand-new platform; no privacy/K-12 track record; xAI's data practices are a district-sales liability today. Watchlist, not shortlist. 600k min/mo = $30k–48k wall-clock [estimate].
- **Azure Voice Live API (GA)** — unified realtime S2S service exposing the gpt-realtime family + Azure voices, pricing tiered by model [documented] https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-faq, https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/azure-ai-voice-live-api-what%E2%80%99s-new-and-the-pricing-announcement/4428687. Matters for two reasons: (a) second source for OpenAI realtime models under EDU-standard Microsoft agreements (FERPA/COPPA posture districts already accept); (b) same vendor as the Azure Pronunciation Assessment API that UC2 needs anyway (doc 11c/d). Exact per-minute rates not extracted — follow up if shortlisted.
- **Alibaba Qwen Omni realtime / StepFun Step-Audio** — sit at the top of AA's S2S reasoning index as of July 2026 [reported, low confidence — AA page extraction was partially garbled]. China-hosted APIs are a non-starter for US K-12 procurement; Qwen Omni weights are openly licensed → relevant only as a future self-host option.
- **Open source (Kyutai Moshi/Unmute, etc.)** — no managed offering with classroom-grade concurrency; self-hosting GPU fleets for 1,000 concurrent is its own program. Out of scope for 2026 planning. [estimate]

---

## 8. Cross-cutting analysis

### 8.1 Use-case fit matrix

| Use case | OpenAI RT | Gemini Live | ElevenLabs | Nova 2 Sonic | Hume EVI |
|---|---|---|---|---|---|
| UC1 beginner conversation (EN+ES) | Strong; speed param; semantic VAD | Strong; cheap; VAD tunable; preview churn | Good; pipeline control; $$$ | Good; 7 langs; no browser client | OK; EN+ES; low concurrency |
| UC2 phoneme-level scoring | **None of these provide phoneme/GOP scoring.** S2S models give impressionistic feedback only; a dedicated pronunciation-assessment engine (doc 11c/d: Azure PA, SpeechAce, etc.) is required regardless of S2S choice. LLM-transcript "pronunciation analysis" (current state, wip-11a §1) is not a real signal. |||||
| UC3 dictation | Overkill; use STT track ||||| 
| UC4 cacheable lesson TTS | Wrong tool; realtime audio out costs $0.077/min (2.1) vs commodity TTS; use TTS track ||||| 
| UC5 async analysis | Transcripts via API events; ZDR compatible | Transcripts; ZDR caveats (resumption) | Built-in convo storage (or ZRM) | Text output stream | Built-in + emotion data |
| UC6 classroom 25–35 concurrent | Yes ≥Tier 3 [estimate] | Blocked at ~50/project until Tier-2 quota fix [reported] | Scale/Business plan (30/40 cap) | Quota unknown — verify | Business cap 30 |

### 8.2 Classroom economics (30 students, 1 hour, all speaking)

$/class-hour [estimate, §1 formulas]: **Gemini ≈ $21–25 · Nova 2 ≈ $23 · gpt-realtime-2.1-mini ≈ $32 · Hume ≈ $90–126 · gpt-realtime-2.1 ≈ $94 · Grok ≈ $90–144 · ElevenLabs ≈ $162–198.** At 10k MAU (600k min/mo) the spread is $7k–66k/mo — provider choice is a ~10× budget decision.

### 8.3 School-network reality

WebSocket-over-443 (Gemini, OpenAI WS, ElevenLabs WS, Hume) is the safest transport through school firewalls; WebRTC (OpenAI, ElevenLabs, AgentCore) needs UDP/TURN validation on district networks — a doc 16 test item. Chromebooks handle both in Chrome; Safari/iOS supports WebRTC and WS (consumer market). Nova Sonic requires a server proxy in all cases — on Supabase/Deno this likely means new infrastructure (Node service or AgentCore).

### 8.4 Recommendation shape (for synthesis doc, not final)

1. **Default candidate: OpenAI gpt-realtime-2.1-mini** (incumbent architecture, ZDR, speed control, semantic VAD, Azure second-source) **if** doc 16 shows mini-tier quality suffices for A1 learners — else cost jumps 3× to flagship.
2. **Cost challenger: Gemini Live 3.1-flash-live** — ~1.5–4× cheaper, printed per-minute pricing, 97-language coverage; blocked on the concurrent-session quota question and preview churn.
3. **District-procurement dark horse: Nova 2 Sonic** (via AWS agreements) if the proxy-transport cost is acceptable; **Azure Voice Live** as the OpenAI-with-EDU-compliance variant.
4. ElevenLabs returns only as a TTS vendor (doc 11d), not as the conversation platform — the economics that pushed Palavox off it in 2025 are still adverse at 5–8×.
5. Every option requires the same two Palavox-side builds regardless: a separate pronunciation-assessment engine (UC2) and a provider-abstraction layer (Pipecat/LiveKit-style) to keep S2S swappable.

### 8.5 Open questions for doc 16 (hands-on study)

1. Accent robustness: no vendor publishes non-native/child-speech benchmarks — record a beginner-speech test set (adult consented proxies for minors) and measure comprehension/misfire rates per vendor.
2. gpt-realtime-2.1-mini vs 2.1 quality gap on constrained-vocab tutoring prompts.
3. Gemini: actual billed tokens per 10-min session under context compression; actual enforced concurrency at Tier 2.
4. Nova: actual account quota; feasibility of Deno-adjacent proxy; measured TTFA on school-like networks.
5. Barge-in behavior with hesitant beginner speech (semantic VAD vs Gemini sensitivity tuning vs Nova).
6. "Speak slowly / stay within word list" compliance rates per vendor (scripted probe set).

---

## 9. Summary table

| | **OpenAI Realtime (gpt-realtime-2.1 / -mini)** | **Google Gemini Live (3.1-flash-live-preview)** | **ElevenLabs Agents** | **Amazon Nova 2 Sonic** | **Hume EVI 3 / 4-mini** | **xAI Grok Voice** |
|---|---|---|---|---|---|---|
| Architecture | Native S2S | Native S2S (native-audio) | Cascaded STT→LLM→TTS platform | Native S2S | Native S2S | Native S2S |
| Unit price [documented] | Audio $32/$64 per 1M tok (mini $10/$20); cached in $0.40 | Audio in $3/1M ($0.005/min), out $12/1M ($0.018/min) | $0.08/min + LLM; burst $0.16/min | Speech $3/$12 per 1M tok [reported] | $0.04–0.07/min by plan | $0.05/min ($0.08 Think Fast 2.0) [reported] |
| Conv-minute [estimate] | **$0.052 / $0.018** | **$0.012–0.014** | **$0.09–0.11** | **≈$0.013** | **$0.04–0.07** | **$0.05–0.08** |
| 10-min lesson [estimate] | $0.52 / $0.18 | $0.12–0.14 | $0.90–1.10 | ≈$0.13 | $0.40–0.70 | $0.50–0.80 |
| 600k min/mo (10k MAU) [estimate] | $31.2k / $10.8k | $6.9–8.4k | $54–66k | ≈$7.8k | $24–42k | $30–48k |
| Concurrency ceiling | No session cap; TPM-bound (~T3 ≈ 80, T5 ≈ 1,500 [estimate]) | Free 3; T1 ~50; T2 ~1,000 docs vs 50 enforced [reported] | Plan-capped 4→40 + burst; enterprise above | Account quota, unpublished; console check needed | 5→30 by plan; enterprise above | New; undocumented |
| Transports | **WebRTC + WS + SIP** | WS only | WebRTC + WS SDKs | HTTP/2 via AWS SDK (server proxy required) | WS | WS/WebRTC (new) |
| Turn-taking | Server VAD + **semantic VAD**; barge-in; **output speed 0.25–1.5** | Tunable VAD; barge-in; proactive audio; no speed param | Pipeline VAD; barge-in; per-voice speed | VAD + barge-in; no speed param | Barge-in; instructible prosody | Barge-in |
| Spanish | Yes (multilingual) | Yes (97 langs) | Yes (strong TTS) | Yes (7 langs) | EVI 3: EN+ES only; 4-mini: 11 langs | Yes [reported] |
| Reasoning benchmark (Big Bench Audio) [reported] | 96% flagship / 64% legacy mini | 97% high (slow) / 69% fast dialog | n/a (LLM-dependent) | 88% | not listed | 92–97% |
| Latency (TTFA) [reported; vendor claims labeled] | ~1.0–1.2 s AA; "-25% p95" claim | 0.63 s (fast) – 3.0 s (high) AA | ~1 s+ (pipeline) | claim <700 ms; AA 1.14 s | claim <300 ms; ~1.2 s practical | ~0.7 s AA |
| Retention / ZDR | 30-day default; **ZDR-eligible /v1/realtime**; US data residency | 55-day abuse logs; **ZDR per-project**; resumption caveat | ZRM (enterprise, per-agent); EU residency | **No training use, no sharing, in-region encrypted** | Unclear; thin docs | Unclear |
| K-12 / DPA posture | DPA + ZDR; no EDU program; Azure second source helps | Developer API weak for minors; **Vertex route for FERPA/COPPA** | DPA/ZRM; no K-12 program | **AWS agreements; district-friendly** | None stated; emotion-AI on minors is a red flag | None; liability today |
| Lock-in | Low-medium (ecosystem + Azure second source) | Medium (preview churn, Google-only) | Medium-high (platform fee forever) | High (AWS-only transport/model) | High (small vendor) | High (new vendor) |
| Biggest open risk | Mini-tier quality for A1 learners | Enforced concurrency ≈50; model churn | 5–8× cost at scale | Proxy infra on Deno stack; unpublished quotas | Concurrency + minors posture | Track record |

*Prices/limits captured 2026-07-30; realtime-voice pricing has changed materially every ~6 months since 2024 — re-verify at decision time.*
