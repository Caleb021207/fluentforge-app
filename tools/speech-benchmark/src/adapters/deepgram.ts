/**
 * Deepgram Nova-3-multilingual adapter — STUB (workstream 0.6: no network
 * calls implemented as live defaults; plan 11 §5.1 measurement 5 bake-off
 * candidate).
 *
 * Before implementing: owner approval + a Deepgram account configured with
 * training opt-out (`mip_opt_out`) / zero retention per plan 11 §5.3, and
 * signed terms covering the consented eval audio.
 */

import type { AdapterFactory, ProviderAdapter } from "./types.ts";

/** Env vars this adapter will need once approved. */
export const REQUIRED_ENV = ["DEEPGRAM_API_KEY"] as const;

const deepgram: AdapterFactory = (): ProviderAdapter => ({
  name: "deepgram",
  async transcribe(): Promise<string> {
    throw new Error(
      "deepgram adapter is a stub: live transcription requires API key + owner approval. " +
        `Needed env vars: ${REQUIRED_ENV.join(", ")} (account must have training opt-out ` +
        "(mip_opt_out) / zero-retention configured per plan 11 §5.3). " +
        "No network calls are implemented as live defaults (workstream 0.6).",
    );
  },
});

export default deepgram;
