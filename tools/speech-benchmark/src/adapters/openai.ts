/**
 * OpenAI transcription adapter — STUB (workstream 0.6: no network calls
 * implemented as live defaults). Candidate for comparing the incumbent
 * family on the same harness (plan 11 §5.1 measurements 5 and 8).
 *
 * Note plan 11 §3.2: gpt-4o-transcribe-family models lack word timestamps +
 * confidence (11c §2.2) — fine for batch WER, disqualifying for dictation.
 *
 * Before implementing: owner approval + Zero Data Retention endpoints
 * verified for the account per plan 11 §5.3.
 */

import type { AdapterFactory, ProviderAdapter } from "./types.ts";

/** Env vars this adapter will need once approved. */
export const REQUIRED_ENV = ["OPENAI_API_KEY"] as const;

const openai: AdapterFactory = (): ProviderAdapter => ({
  name: "openai",
  async transcribe(): Promise<string> {
    throw new Error(
      "openai adapter is a stub: live transcription requires API key + owner approval. " +
        `Needed env vars: ${REQUIRED_ENV.join(", ")} (Zero Data Retention endpoints verified ` +
        "per plan 11 §5.3). " +
        "No network calls are implemented as live defaults (workstream 0.6).",
    );
  },
});

export default openai;
