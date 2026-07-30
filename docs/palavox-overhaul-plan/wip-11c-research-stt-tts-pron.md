# WIP 11c — Research: Modular STT + TTS + Pronunciation Assessment (Pipeline Architecture)

**Status:** Working draft (planning phase — no code changes)
**Author:** Research subagent (doc 11 series)
**Date:** 2026-07-30 (all URLs accessed 2026-07-30 unless noted)
**Scope:** Component-level STT and TTS vendors for a pipeline architecture (STT -> LLM -> TTS), plus pronunciation-assessment APIs. Companion docs: 11a (current voice state), 11b (integrated realtime providers, separate workstream).

**Evidence labels used throughout:**
- `[documented]` — vendor docs/pricing page or vendor-published API (incl. Azure Retail Prices API)
- `[reported]` — third-party source (benchmark site, trade press, community answer)
- `[estimate]` — our arithmetic from documented/reported inputs; formula shown

---

## 1. Cost model: assumptions and formulas

All comparative math uses one explicit model. Change the assumptions and every number scales linearly.

**Assumptions `[estimate]`:**
- **A1.** A "conversation session-minute" = 1 wall-clock minute of an active speaking lesson with the mic open.
- **A2.** Streaming STT is billed on **connection/session duration**, not speech duration, for most vendors (AssemblyAI states this explicitly; Deepgram/Azure/AWS bill audio streamed, which equals session duration if the mic is open continuously). So mic-open STT billed minutes = session minutes. A VAD-gated client (send audio only while speech detected) could cut STT billed minutes to ~40-50% — treat that as an optimization, not the baseline.
- **A3.** In a 10-minute beginner lesson: student speaks ~4 min, AI speaks ~4 min, ~2 min silence/thinking.
- **A4.** TTS speaking rate ≈ **1,000 characters ≈ 1 minute of audio** (~155 wpm × ~6.4 chars/word incl. spaces). So 1 session-minute consumes 0.4 audio-min of TTS ≈ 400 characters.
- **A5.** LLM cost is excluded (owned by doc 11-series LLM analysis); numbers here are STT+TTS only.

**Formulas:**
```
P_conv_min       = P_stt_per_min + 0.4 × P_tts_per_audio_min          (mic-open baseline)
P_lesson_10min   = 10 × P_conv_min
P_concurrent(N)  = N × 60 × P_conv_min                                ($/hour with N sessions live)
P_month(10k MAU) = 600,000 × P_stt_per_min + 240,000 × P_tts_per_audio_min
                   (10,000 MAU × 60 session-min = 600k session-min; TTS = 0.4 × 600k = 240k audio-min = 240M chars)
P_tts_per_audio_min ≈ price per 1,000 characters   (by A4)
```

---

## 2. STT providers

### 2.1 Deepgram (Nova-3 / Flux)

- **Pricing `[documented]`** (https://deepgram.com/pricing): Nova-3 monolingual streaming **$0.0048/min** PAYG ($0.0042 Growth); Nova-3 **multilingual streaming $0.0058/min** PAYG ($0.0050 Growth); prerecorded $0.0077/$0.0092. Flux (conversational, turn-taking model): English $0.0065/min streaming, multilingual $0.0078/min. Free **$200 credit** PAYG; Growth = $4k+/yr prepay, up to 20% off.
- **Concurrency `[documented]`** (pricing page): up to **50 concurrent (REST)**, **150–225 concurrent (WebSocket)** depending on plan; higher via enterprise contact.
- **Accuracy — vendor claims `[documented claim]`** (https://deepgram.com/learn/introducing-nova-3-speech-to-text-api): streaming median WER **6.84%** vs 14.92% "next-best competitor"; batch median WER 5.26%. These are vendor-selected test sets — not measurements.
- **Accuracy — independent `[reported]`** (https://artificialanalysis.ai/speech-to-text): Nova-3 AA-WER **5.2%**, $4.30/1,000 min. Mid-pack vs AssemblyAI Universal-3 Pro (3.1%) and Azure MAI-Transcribe-1.5 (2.4%) on English-dominant test sets. No published beginner-L2/accented breakdown.
- **Spanish + code-switching `[documented claim]`**: Nova-3 multilingual does **real-time code-switching across 10 languages incl. English + Spanish** in one stream, no language routing. This is the headline differentiator for code-switched ESL classrooms; verify on our own audio.
- **Word data `[documented]`**: word-level timestamps + per-word confidence in every response; keyterm prompting (up to 100 terms — useful for lesson vocab).
- **Latency `[documented claim]`**: "comparable to Nova-2," typically sub-300 ms partials; no SLA figure published.
- **Browser `[documented]`**: WebSocket API + JS SDK; works from browsers incl. Safari/iOS (send PCM via AudioWorklet). Temp-token auth supported.
- **Data/compliance `[documented]`** (https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program, https://developers.deepgram.com/trust-security/data-privacy-compliance): Model Improvement Program discount/participation is opt-out via `mip_opt_out=true` (opted-out requests retained only for processing); SOC 2 Type II, GDPR, HIPAA. No published K-12/FERPA program; DPA on request. US processing default; EU/dedicated via enterprise.

### 2.2 OpenAI (whisper-1, gpt-4o-transcribe family, gpt-transcribe)

- **Pricing `[documented]`** (https://developers.openai.com/api/docs/pricing): **gpt-transcribe $0.0045/min** (current recommended model), **gpt-4o-transcribe $0.006/min**, **gpt-4o-mini-transcribe $0.003/min**, **Whisper $0.006/min**. Realtime API (for live-mic transcription): gpt-realtime-2.1 audio in $32/M tokens; gpt-realtime-2.1-mini audio in $10/M tokens.
- **Streaming `[documented]`** (https://developers.openai.com/api/docs/guides/speech-to-text): `stream=true` gives delta events for **completed files** only; for **live microphone audio you must use the Realtime API** transcription sessions (`gpt-live-transcribe`), i.e. different plumbing and token-based billing. WebRTC + WebSocket supported.
- **Word timestamps `[documented]`**: `timestamp_granularities[]` is **whisper-1 only**. gpt-4o-transcribe family returns **no word-level timestamps** and no documented confidence. This is disqualifying for dictation karaoke-highlighting and for aligning corrections — a major modular-pipeline weakness.
- **Accuracy `[reported]`** (Artificial Analysis): gpt-4o-transcribe AA-WER 4.0%; Whisper large-v2 4.1%.
- **Spanish/code-switching**: broad multilingual (whisper lineage, 98 languages `[documented]`), but transcription targets one language at a time; no documented mid-utterance code-switch support. Whisper is known to hallucinate on silence/short accented utterances `[reported]` (widely replicated in ASR literature/community).
- **Retention `[documented]`** (https://developers.openai.com/api/docs/guides/your-data): API default retention up to 30 days for abuse monitoring; **`/v1/audio/transcriptions` is ZDR-eligible and effectively zero-retention by default**; Realtime requires ZDR approval. No training on API data by default. No K-12-specific program.
- **Limits**: usage-tier RPM/TPM; no hard published streaming-session concurrency cap `[documented]`.

### 2.3 AssemblyAI (Universal-Streaming / Universal-3)

- **Pricing `[documented]`** (https://www.assemblyai.com/pricing): **Universal-Streaming $0.15/hr = $0.0025/min** (English AND multilingual, same price); Universal-3.5 Pro realtime $0.45/hr; async Universal-2 $0.15/hr, Universal-3.5 Pro $0.21/hr. **$50 free credit.** Billing is on **WebSocket-open duration** (idle time billable) `[documented]` — matches our mic-open model exactly.
- **Concurrency `[documented]`**: free tier 5 new streams/min; paid 100 new streams/min; higher via contact. Marketing for Universal-3 Pro claims "unlimited concurrency" `[reported]` — treat as sales claim.
- **Accuracy `[reported]`** (Artificial Analysis): Universal 3.8%, **Universal-3 Pro 3.1% AA-WER** — best-in-class among dedicated STT vendors on these sets.
- **Latency `[documented claim]`** (https://www.assemblyai.com/blog/introducing-multilingual-universal-streaming): **~300 ms P50**; immutable transcripts (no retroactive rewrites — simplifies UI).
- **Spanish + code-switching `[documented claim]`** (https://www.assemblyai.com/blog/multilingual-speech-to-text-api-universal-3-pro): Universal-3 Pro streaming does native **mid-sentence code-switching across 6 languages incl. Spanish**, sub-300 ms.
- **Word data `[documented]`** (docs universal-streaming): word timings in ms + per-word confidence.
- **Browser**: WebSocket v3 API with temporary tokens for browser clients `[documented]`; Safari-compatible (plain WebSocket + PCM).
- **Data/compliance `[documented]`** (https://support.assemblyai.com/articles/2240096256, https://www.assemblyai.com/legal/data-processing-addendum): async transcripts stored **indefinitely by default** but deletable via DELETE endpoint; **streaming ZDR available when opted out of model training**; EU processing option; SOC 2; DPA with SCCs. No published FERPA/COPPA program — DPA conversation required for K-12.

### 2.4 Azure AI Speech STT

- **Pricing `[documented]`** (Azure Retail Prices API, prices.azure.com, eastus, accessed 2026-07-30):
  - **S1 real-time STT $1.00/hr = $0.0167/min**; batch $0.18/hr; fast transcription $0.36/hr; custom real-time $1.20/hr.
  - **Enhanced Feature Audio $0.30/hr** (the add-on meter for pronunciation assessment / language ID / diarization on real-time).
  - **Commitment tiers**: 2K hrs $1,600/mo ($0.80/hr) → 10K $6,500 ($0.65) → 50K $25,000 ($0.50) → 100K $40,000 ($0.40/hr); overage at tier rate.
  - Free F0: 5 audio-hours/mo `[documented]` (https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/).
- **Accuracy `[reported]`** (Artificial Analysis): new Azure **MAI-Transcribe-1.5 leads the leaderboard at 2.4% AA-WER** ($6/1,000 min) — pricing/productization of that model vs classic Speech service should be re-verified at decision time.
- **Spanish**: es-ES, es-MX and most LatAm locales supported `[documented]`; continuous language ID for 2+ candidate languages (an enhanced feature, $0.30/hr) rather than true token-level code-switching.
- **Word data `[documented]`**: word-level offsets/durations + confidence (detailed format); 100-ns offset units.
- **Browser `[documented]`**: Speech SDK for JavaScript runs in browsers incl. Safari over WebSocket; token auth via your backend. Best-in-class browser SDK maturity.
- **Concurrency `[reported]`**: default real-time concurrency quota ~100 concurrent recognitions per resource, raised via Azure support request. Verify current quota doc at decision time.
- **Data/compliance**: no training on customer data; processing pinned to the Azure region you deploy; Microsoft Product Terms cover FERPA/COPPA commitments and Azure is the incumbent in US K-12 districts `[reported — verify against Microsoft Trust Center during procurement]`. Strongest EDU procurement story of the field.

### 2.5 Google Cloud STT (v2)

- **Pricing `[reported]`** (pricing page fetch truncated; values via https://cloud.google.com/speech-to-text/pricing cross-checked with https://costbench.com/software/ai-transcription-apis/google-speech-to-text/ and https://diyai.io/ai-tools/speech-to-text/google-cloud-speech-to-text-pricing/): v2 standard/streaming **$0.016/min**, tiered: 500k–1M min $0.01, 1M–2M $0.008, >2M $0.004; dynamic batch ~$0.003/min. 60 free min/mo.
- **Accuracy `[reported]`**: Chirp family strong multilingual; on Artificial Analysis the Google entry that ranks highly is Gemini 2.5 Pro (2.9% AA-WER, $11.39/1k min) — an LLM, not the STT v2 API.
- **Streaming transport**: v2 streaming is **gRPC**; no browser-native WebSocket — requires a server-side proxy (a real cost for our Supabase edge architecture) `[reported — verify in docs]`.
- **Code-switching**: multi-language recognition picks one language per request/segment; no mid-utterance code-switch claim.
- **Data/compliance**: no training on customer data, DPA, regional endpoints (us/eu) `[reported]`.
- Word timestamps + confidence supported `[documented in API reference]`.

### 2.6 Amazon Transcribe

- **Pricing `[documented]`** (https://aws.amazon.com/transcribe/pricing/): **streaming $0.01/min**, batch $0.006/min (T1, first 250k min/mo; T2 -38%, T3 -58%); billed per second, 15-s minimum; free 60 min/mo × 12 months.
- **Accuracy `[reported]`** (Artificial Analysis): Amazon "Nova 2 Pro" 4.9% AA-WER / $3.10 per 1k min (AWS's newer model family; classic Transcribe not separately ranked).
- **Spanish**: es-ES/es-US supported; language identification included `[documented]`; no mid-utterance code-switching claim.
- **Browser**: streaming via WebSocket with SigV4 presigned URLs — feasible from browser but the most plumbing of any vendor here `[reported]`.
- **Data note `[reported — verify]`**: AWS AI services may use content to improve services **unless** you set the org-level AI-services opt-out policy; set it before any student audio flows.
- Word timestamps + confidence supported `[documented]`.

### 2.7 Speechmatics

- **Pricing**: pricing page `[documented]` (https://www.speechmatics.com/pricing): free **50 hrs/mo STT + 1M chars TTS**; Pro "from $0.129/hr" (batch); volume discounts >500 hrs. Real-time ~**$0.0067/min (~$0.40/hr)** `[reported]` (https://www.gladia.io/blog/speechmatics-vs-gladia). Enterprise = contact.
- **Accuracy `[reported]`**: Speechmatics Enhanced 4.0% AA-WER at $12.50/1k min on Artificial Analysis (their premium batch tier).
- **Code-switching `[documented claim]`** (https://www.speechmatics.com/company/articles-and-news/introducing-melia-multilingual-speech-to-text-model): **Melia does native code-switching across 56+ languages in a single pass** — strongest code-switch claim in the market; validate on our audio.
- Known for accented-speech robustness marketing; no published L2-beginner WER. Word timings + confidence available `[reported]`. WebSocket real-time API; browser use via temp tokens `[reported]`.

### 2.8 ElevenLabs Scribe (STT) — noted for completeness

- **Scribe v2: $0.22/hr ≈ $0.0037/min** `[documented]` (https://elevenlabs.io/pricing/api). Realtime variant exists; young product, limited independent accuracy data. Not a primary candidate.

### 2.9 Cartesia Ink (STT) — noted for completeness

- Plan-bundled hours: Free ~1.85 h, Pro ~9.3 h/$5, Startup ~115.7 h/$49, Scale ~740.7 h/$299 → effective **~$0.40–0.54/hr** `[estimate from documented plan bundles]` (https://cartesia.ai/pricing). Ink 2 released with Sonic 3.5 (2026-06) `[reported]`. Young product; no independent WER data.

### 2.10 Self-hosted Whisper / faster-whisper economics

- **GPU rental `[reported]`**: RunPod L4 24 GB ≈ **$0.39–0.43/hr** (https://gpus.io/en/providers/runpod, July 2026).
- **Throughput `[reported]`**: faster-whisper large-v3 gives 5–6× vanilla Whisper; an RTX 3090-class card transcribes 1 hr audio in <1 min batch (https://gigagpu.com/whisper-vs-faster-whisper-speed/); SaladCloud benchmark: 1M audio-hours for $5,110 ≈ **$0.005 per audio-hour batch** (https://blog.salad.com/whisper-large-v3/); large-v3-turbo INT8 fits ~1.6 GB VRAM → 25+ model instances per L40S (https://www.e2enetworks.com/blog/benchmarking-asr-models-nvidia-l4-parakeet-whisper-nemotron).
- **Streaming estimate `[estimate]`**: assume ~10 concurrent live streams per L4 with whisper-streaming/turbo chunking (community figures, low confidence): $0.43/hr ÷ 10 = **$0.043/session-hr ≈ $0.0007/min** — ~3.5× cheaper than AssemblyAI. But: chunked latency (1–2 s, worse than any managed streaming vendor), whisper hallucination on silence/short L2 utterances `[reported]`, no calibrated word confidence, no code-switching mid-utterance, plus MLOps burden (autoscaling for synchronized classroom bursts is exactly the hard case). **Verdict: compelling for use case 5 (async post-session re-analysis at $0.005/audio-hr) — not recommended for live paths at our scale.**

---

## 3. TTS providers

Reminder: lesson audio (use case 4) is **cacheable**; conversation audio (use case 1) is not. Determinism matters for cache: same text+voice+params should produce reusable audio. All vendors allow caching/replay of generated audio within their terms except where noted; Polly states cache-and-replay is explicitly allowed `[documented]`.

| Vendor / model | Price | ≈ $/audio-min `[estimate A4]` | TTFB claim | Spanish/non-EN | Notes |
|---|---|---|---|---|---|
| **Azure Neural** | $15/1M chars; commit tiers → $6–12/1M overage `[documented, Retail API]` | $0.015 (→$0.006 committed) | <300 ms `[reported]` | 140+ locales, many es-* voices, styles `[documented]` | SSML incl. rate control + **phoneme tags** (IPA input — pedagogy gold); Neural HD $22/1M |
| **Amazon Polly** | Std $4/1M; Neural $16/1M; Generative $30/1M; Long-form $100/1M `[documented]` | $0.004–0.030 | no figure published | es-ES/es-MX/es-US voices `[documented]` | SSML + speech marks (word timings for karaoke highlighting); explicit cache-replay OK |
| **Google TTS** | Std/WaveNet $4/1M; Neural2 $16/1M; Chirp 3 HD $30/1M; Studio $160/1M `[reported]` (pricing page truncated; texttolab/costbench, free tier 4M std + 1M premium chars/mo) | $0.004–0.030 | no figure published | broad es support `[documented]` | SSML, rate control |
| **OpenAI gpt-4o-mini-tts** | $12/1M audio tokens ≈ **$0.015/min** `[documented]`; tts-1 $15/1M chars; tts-1-hd $30/1M | $0.015 | no official figure; ~200–500 ms `[reported]` | good multilingual, no per-locale voices | instructable style ("speak slowly, kindly") but **non-deterministic across calls** — weaker cache story; no SSML |
| **ElevenLabs Flash v2.5** | **$0.05/1k chars**; Multilingual v2 $0.10/1k `[documented]` (elevenlabs.io/pricing/api) | $0.05 / $0.10 | **~75 ms model latency** `[documented claim]` | 32 langs (Flash) / 70+ (v3, not realtime) `[documented]` | concurrency 4–40 by plan `[documented]` — a hard cap for classroom bursts below enterprise |
| **Cartesia Sonic 3.5** | 1 credit/char; Pro $5/100k, Startup $49/1.25M, Scale $299/8M → **$0.037–0.05/1k chars** `[estimate from documented plans]` | ~$0.037–0.05 | **90 ms std / 40 ms Turbo** `[documented claim]` | 42 languages incl. Spanish `[documented claim]` | fastest TTFB claims in market; WebSocket streaming; plan-based concurrency slots |
| **Deepgram Aura-2** | $0.030/1k chars ($0.027 Growth) `[documented]` | $0.030 | sub-200 ms claimed `[reported]` | limited language coverage vs others — verify es voices | convenient if Deepgram STT chosen (one vendor) |

**Speed control for learners** (slow playback for beginners): Azure/Google/Polly via SSML `prosody rate` `[documented]`; ElevenLabs/Cartesia via voice-speed params `[documented]`; OpenAI via prompt instruction (imprecise). Azure SSML `<phoneme>` + Polly speech-marks are uniquely useful for minimal-pair prompts and word-highlight follow-along.

---

## 4. Pronunciation assessment (critical for use case 2)

### 4.1 Azure Pronunciation Assessment — primary candidate

Source: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment `[documented]`.

- **Returns:** `AccuracyScore` at **phoneme, syllable (en-US only), word, and full-text** levels; `FluencyScore`; `CompletenessScore` (scripted); `ProsodyScore` (**en-US only** — stress, intonation, speed, rhythm, incl. Monotone/UnexpectedBreak/MissingBreak error types); `PronScore` composite; word-level `ErrorType` (None/Omission/Insertion/Mispronunciation).
- **Phoneme detail:** IPA alphabet; per-phoneme offsets/durations; **`NBestPhonemes` returns top-N candidate phonemes actually spoken** — exactly what a minimal-pair drill needs (did the student say /i/ or /ɪ/?). Miscue (omission/insertion) in scripted mode ≤30 s; continuous mode for longer audio (no `EnableMiscue`).
- **Modes:** scripted (reading — reference text) and **unscripted** (speaking — no reference text; MS recommends running Azure STT first, then scripted assessment against the recognized text for best accuracy).
- **Languages:** ~30+ locales; doc explicitly discusses Spanish **es-ES and es-MX** ("try each locale, use the one that scores higher") — so both learning directions (EN for ESL, ES for Spanish learners) are covered. Syllable + prosody are en-US-only; phoneme-level accuracy works for es-*.
- **SDKs:** C#, C++, Java, Python, **JavaScript (browser)**, Obj-C, Swift `[documented]` — works in our React client via Speech SDK JS over WebSocket, Safari included.
- **Pricing:** billed as standard STT plus the **Enhanced Feature Audio meter $0.30/hr** on real-time → **$1.30/hr total = $0.0217/min** `[documented via Azure Retail Prices API + reported confirmation at learn.microsoft QA 5608069]`; enhanced features included at no extra charge on batch ($0.18/hr) `[reported]`.
  - **Per drill `[estimate]`:** 8-s read-aloud = (8/3600) × $1.30 = **$0.0029**. 100 drills/student/mo × 10k students = 1M drills = **$2,889/mo**.

### 4.2 SpeechAce

Source: https://www.speechace.com/api-plans/ `[documented]`.

- **Plans:** Basic **$40/mo** (5,000 × 15-s requests incl., overage **$0.008/15-s request**, 30-s max audio): word/sentence pronunciation scores, **phoneme + syllable feedback**, custom phoneme sequences. Pro **$80/mo** (10,000 requests, 45-s max): + fluency, **IELTS/CEFR/PTE/TOEIC rubric scores**, lexical stress, intonation, pausing/pitch/rate metrics. Premium **$125/mo** (10k requests, overage $0.0125, 2-min max): + transcription, vocab/grammar/coherence, task achievement.
- **Languages `[documented]`:** English (US, UK), French (FR, CA), **Spanish (ES, MX)**.
- **Fit:** purpose-built for language pedagogy (rubrics map to CEFR — aligns with our band system); per-utterance cost ~2.8× Azure ($0.008 vs $0.0029 per 8-s drill `[estimate]`); volume/annual discounts by contact. K-12/FERPA posture not published — DPA inquiry required.
- **Scale check `[estimate]`:** 1M drills/mo ≈ $8,000 vs Azure $2,889.

### 4.3 ELSA API

- Consumer app pricing is public ($159.99/yr Premium) but **API pricing is contact-sales only**; no public per-call rates `[reported]` (https://www.getapp.com/emerging-technology-software/a/elsa-speech-recognition-api/). Returns per-phoneme color-coded scores, word stress, fluency, intonation, IELTS/TOEFL prediction `[reported]`. Strong L2-specialist reputation (trained on accented L2 speech). Action: request pricing + DPA if Azure phoneme scoring proves weak on beginner audio.

### 4.4 Speechmatics

- No phoneme-level pronunciation-scoring product — STT/translation only `[documented — absence on product pages]`. **Excluded from PA shortlist**; remains an STT code-switching candidate (§2.7).

### 4.5 PA suitability summary

For minimal pairs the decisive feature is **spoken-phoneme evidence** (not just a low score on the target word): Azure `NBestPhonemes` `[documented]` and SpeechAce custom-phoneme scoring `[documented]` both provide it; ELSA likely does `[reported]`. Azure is the only one that also solves STT+TTS procurement in the same FERPA-friendly contract.

---

## 5. Computed cost scenarios

### 5.1 Cost per conversation-minute and 10-min lesson `[estimate — formulas §1]`

| Pipeline stack (STT + TTS) | $/conv-min | $/10-min lesson |
|---|---|---|
| AssemblyAI U-Streaming + Azure Neural | 0.0025 + 0.4×0.015 = **$0.0085** | **$0.085** |
| OpenAI 4o-mini-transcribe + gpt-4o-mini-tts | 0.003 + 0.006 = **$0.009** | $0.090 |
| Deepgram Nova-3 multi + Azure Neural | 0.0058 + 0.006 = **$0.0118** | $0.118 |
| AssemblyAI + Cartesia Sonic (Scale eff.) | 0.0025 + 0.4×0.0374 = **$0.0175** | $0.175 |
| Deepgram Nova-3 multi + Aura-2 | 0.0058 + 0.4×0.030 = **$0.0178** | $0.178 |
| AssemblyAI + ElevenLabs Flash | 0.0025 + 0.4×0.05 = **$0.0225** | $0.225 |
| Azure STT + Azure Neural (PAYG) | 0.0167 + 0.006 = **$0.0227** | $0.227 |

(For comparison, integrated realtime — doc 11b's scope: OpenAI gpt-realtime-2.1 audio tokens or Deepgram/AssemblyAI Voice-Agent bundles at ~$0.068–0.163/min `[documented]` — i.e. **4–15× the modular pipeline**.)

### 5.2 Cost at N concurrent sessions ($/hour while all N are live) `[estimate]`

`P = N × 60 × P_conv_min`; cheap stack = AssemblyAI+Azure ($0.0085), mid stack = Deepgram multi+Aura-2 ($0.0178):

| N concurrent | Cheap stack $/hr | Mid stack $/hr | Cap check |
|---|---|---|---|
| 10 | $5.10 | $10.68 | all vendors OK on entry paid tiers |
| 30 (one classroom) | $15.30 | $32.04 | OK; ElevenLabs needs Scale+ (26–40 concurrency) `[documented]` |
| 50 | $25.50 | $53.40 | OK (Deepgram WSS 150+, AAI 100 new streams/min) |
| 100 | $51.00 | $106.80 | OK on paid tiers; Azure default quota ~100 — raise via support `[reported]` |
| 500 | $255.00 | $534.00 | needs enterprise/quota raises: Deepgram >225 WSS, AAI contact, ElevenLabs enterprise |
| 1,000 | $510.00 | $1,068.00 | enterprise agreements everywhere; Azure commitment tier advisable |

Concurrency-raise processes: Deepgram Growth/enterprise contact `[documented]`; AssemblyAI support contact `[documented]`; Azure support ticket quota request `[reported]`; Google/AWS console quota requests `[documented process]`; ElevenLabs/Cartesia plan upgrade then enterprise `[documented]`.

### 5.3 10,000 MAU × 60 voice-min/month (600k session-min; 240k TTS audio-min = 240M chars) `[estimate]`

| Component | Monthly cost |
|---|---|
| STT: AssemblyAI U-Streaming | 600k × $0.0025 = **$1,500** |
| STT: OpenAI 4o-mini-transcribe | $1,800 |
| STT: ElevenLabs Scribe v2 | $2,200 |
| STT: Deepgram Nova-3 multilingual | $3,480 (Growth $3,000) |
| STT: Amazon Transcribe streaming | $6,000 |
| STT: Azure real-time | $10,000 PAYG; **$6,500 on 10K-hr commitment tier** |
| STT: Google v2 | 500k×0.016 + 100k×0.01 = $9,000 |
| STT: self-hosted whisper (batch re-analysis only) | 10k audio-hrs × $0.005 ≈ **$50** `[reported basis]` |
| TTS: Azure Neural | 240M × $15/1M = **$3,600** PAYG (~$2,700 with 80M commit + overage) |
| TTS: gpt-4o-mini-tts | $3,600 |
| TTS: Polly/Google Neural tier | $3,840 |
| TTS: Deepgram Aura-2 | $7,200 |
| TTS: Cartesia (Scale effective) | ~$8,976 |
| TTS: ElevenLabs Flash | $12,000 |
| **Representative total (AAI + Azure TTS)** | **≈$5,100/mo ≈ $0.51/MAU** before caching & LLM |

**Caching upside `[estimate]`:** lesson audio (use case 4) is deterministic text — a curriculum of 5,000 utterances × 80 chars ≈ 400k chars ≈ **$6 one-time** at Azure rates, then $0 marginal. Cache-first design pushes the TTS line above toward conversation-only volume (roughly halves it, assuming half of AI speech is templated).

---

## 6. Fit against Palavox use cases

1. **Realtime beginner conversation (EN + ES targets):** Modular pipeline at $0.009–0.018/min is 4–15× cheaper than integrated realtime. Code-switching evidence: Deepgram Nova-3 (10-lang) `[documented claim]`, AssemblyAI U-3 Pro (6-lang) `[documented claim]`, Speechmatics Melia (56-lang) `[documented claim]`. **No vendor publishes beginner-L2/child WER — we must run our own eval set (recorded Palavox learner audio) before committing.**
2. **Pronunciation drills:** Azure PA is the only option combining phoneme-level scores + NBestPhonemes + es-ES/es-MX + browser JS SDK + $0.0029/drill. SpeechAce is the pedagogy-native fallback (CEFR rubrics) at ~2.8× the price. Prosody/syllable scoring is en-US-only on Azure — Spanish-direction prosody feedback has no off-the-shelf vendor.
3. **Dictation:** needs word timestamps + confidence → Deepgram/AssemblyAI/Azure/Google/AWS all fine `[documented]`; **gpt-4o-transcribe family fails this requirement** (no word timestamps) `[documented]`.
4. **TTS lesson audio at scale:** cacheable → cheapest deterministic vendor wins: Azure Neural or Polly Neural at $15–16/1M chars with SSML rate control; premium voices (Cartesia/ElevenLabs) unjustified for cached content.
5. **Async post-session analysis:** batch prices collapse: Azure batch $0.18/hr, AssemblyAI $0.15/hr, self-hosted whisper ~$0.005/hr `[reported]` — self-hosting only makes sense here.
6. **Synchronized classrooms (25–35 concurrent):** every major STT vendor handles 35 concurrent on paid tiers; the pinch points are ElevenLabs TTS concurrency (4–40 by plan) and Azure default quotas (support ticket). School-network reality (shared NAT, Chromebooks) favors plain WebSocket transports (Deepgram/AAI/Azure) over gRPC (Google) or SigV4 WebSocket plumbing (AWS).

**Compliance snapshot for K-12:** Azure strongest (region pinning, FERPA/COPPA in Product Terms `[reported — verify]`, no data training `[documented]`); OpenAI transcription endpoints ZDR-by-default `[documented]`; Deepgram zero-retention default + MIP opt-out flag `[documented]`; AssemblyAI needs opt-out + delete-API discipline `[documented]`; AWS needs org-level AI opt-out policy set `[reported — verify]`; ElevenLabs/Cartesia/SpeechAce: DPA conversations required, no published K-12 posture.

**Key risks / open items:**
- No public accented-beginner/child WER data anywhere → build a 2–3 hr labeled eval set from consented Palavox audio; test Deepgram Nova-3 multi, AAI U-3 Pro, Azure, Speechmatics Melia. (This is the single highest-leverage next step.)
- Azure "MAI-Transcribe-1.5" leaderboard result (2.4% `[reported]`) suggests Azure's STT is being upgraded — recheck model naming/pricing at decision time.
- Cartesia/ElevenLabs plan-bundle pricing makes marginal cost ambiguous at scale — get enterprise quotes before comparing seriously.
- Latency figures above are vendor claims except where marked; measure TTFB/partial-latency from a school-like network in the pilot.

---

## 7. Summary table

| Provider / product | Role | Unit price (PAYG) `[label]` | $/conv-min contribution `[estimate]` | Streaming | Word timings + confidence | Spanish / code-switch | Latency (claimed) | Browser (Safari) | K-12 / retention posture | Verdict for Palavox |
|---|---|---|---|---|---|---|---|---|---|---|
| **AssemblyAI Universal-Streaming** | STT | $0.15/hr = $0.0025/min `[documented]` | $0.0025 | WebSocket, session-billed | yes + yes `[documented]` | 6-lang code-switch (U-3 Pro) `[documented claim]` | ~300 ms P50 `[claim]` | yes (temp tokens) | ZDR w/ training opt-out; delete API `[documented]` | **Top STT candidate — cheapest + best AA-WER; verify L2 audio** |
| **Deepgram Nova-3 multilingual** | STT | $0.0058/min `[documented]` | $0.0058 | WebSocket | yes + yes `[documented]` | 10-lang real-time code-switch `[documented claim]` | <300 ms typical `[claim]` | yes | zero-retention default; MIP opt-out `[documented]` | **Co-favorite — strongest code-switch claim; keyterms for vocab** |
| **Azure Speech STT** | STT | $1.00/hr; commit → $0.40–0.80/hr `[documented, Retail API]` | $0.0167 | WebSocket (JS SDK) | yes + yes `[documented]` | es-ES/es-MX; lang-ID not token-level | partials <500 ms `[reported]` | yes, best SDK | strongest (region pinning, EDU terms) `[reported]` | Premium price justified mainly if bundled w/ PA + TTS |
| OpenAI gpt-4o-mini-transcribe | STT | $0.003/min `[documented]` | $0.003 | live mic only via Realtime API | **no word timestamps** `[documented]` | multilingual, no code-switch | n/a | WebRTC | transcription ZDR default `[documented]` | Rejected for dictation/drills (no timings); OK as fallback |
| Google STT v2 | STT | $0.016/min tiered→$0.004 `[reported]` | $0.016 | gRPC (proxy needed) | yes | no mid-utterance switch | n/a | no (proxy) | good DPA `[reported]` | Rejected — transport friction + price |
| Amazon Transcribe | STT | $0.01/min streaming `[documented]` | $0.01 | WebSocket (SigV4) | yes | no mid-utterance switch | n/a | possible, complex | opt-out policy required `[reported]` | Back-bench |
| Speechmatics (Melia) | STT | RT ~$0.40/hr `[reported]`; free 50 hr/mo `[documented]` | ~$0.0067 | WebSocket | yes `[reported]` | 56-lang code-switch `[documented claim]` | n/a | yes | DPA on request | Wildcard — include in eval bake-off |
| Self-hosted faster-whisper | STT (batch) | ~$0.005/audio-hr batch `[reported]` | ~$0.0007 (live, low conf.) | DIY chunked | yes / uncalibrated | per-segment only | 1–2 s `[reported]` | n/a (server) | fully self-controlled | **Use for async analysis only (use case 5)** |
| **Azure Neural TTS** | TTS | $15/1M chars; commit → $6–12 `[documented, Retail API]` | $0.006 (0.4×) | HTTP/WebSocket stream | SSML + phoneme tags | 140+ locales incl. es-* `[documented]` | <300 ms `[reported]` | server-side; cache to client | same as Azure STT | **Top TTS candidate — price + SSML + EDU posture** |
| Amazon Polly Neural | TTS | $16/1M chars `[documented]` | $0.0064 | HTTP stream | speech marks (word timings) | es-ES/MX/US `[documented]` | n/a | server-side | cache-replay explicitly allowed `[documented]` | Strong alternate; speech marks great for highlighting |
| OpenAI gpt-4o-mini-tts | TTS | ≈$0.015/min `[documented]` | $0.006 | HTTP stream | none (no SSML) | good, instructable | ~200–500 ms `[reported]` | server-side | 30-day / ZDR-eligible `[documented]` | OK for conversational voice; weak cache determinism |
| Cartesia Sonic 3.5 | TTS | ~$0.037–0.05/1k chars `[estimate from plans]` | ~$0.015 | WebSocket | speed param | 42 langs `[claim]` | **40–90 ms TTFB** `[claim]` | yes | enterprise DPA | If perceived-latency becomes the differentiator |
| ElevenLabs Flash v2.5 | TTS | $0.05/1k chars `[documented]` | $0.02 | WebSocket | speed param | 32 langs `[documented]` | ~75 ms model `[claim]` | yes | ZRM enterprise `[reported]` | Rejected on price + concurrency caps (4–40) |
| **Azure Pronunciation Assessment** | PA | $1.30/hr RT (STT $1.00 + $0.30 add-on) `[documented, Retail API]` ≈ $0.0029 per 8-s drill `[estimate]` | — | real-time or batch | phoneme IPA + NBestPhonemes + miscue `[documented]` | **es-ES + es-MX** `[documented]`; prosody/syllable en-US only | interactive `[documented]` | **JS SDK in browser** `[documented]` | Azure posture | **Selected direction for drills/minimal pairs — pilot on real learner audio** |
| SpeechAce | PA | $40–125/mo + $0.008/15-s request `[documented]` | — | request/response | phoneme + syllable, CEFR/IELTS rubrics `[documented]` | en, fr, **es-ES/es-MX** `[documented]` | n/a | REST from backend | DPA inquiry needed | Fallback / rubric enrichment if Azure phoneme quality disappoints |
| ELSA API | PA | contact-sales `[reported]` | — | real-time `[reported]` | per-phoneme colors, stress `[reported]` | EN-learner focus | n/a | n/a | unknown | Get quote only if both above fail on L2 audio |
| Speechmatics (PA) | PA | — | — | — | no phoneme scoring `[documented absence]` | — | — | — | — | Excluded from PA |

**Headline `[estimate]`:** modular pipeline lands at **$0.009–0.018 per conversation-minute** (STT+TTS, ex-LLM) → **$0.09–0.18 per 10-min lesson**, **~$15–32/hr for a 30-student classroom**, **~$5.1k–10k/mo at 10k MAU × 60 min** — versus $0.068–0.163/min for integrated voice-agent bundles. Pronunciation assessment adds ~$0.003 per drill on Azure.
