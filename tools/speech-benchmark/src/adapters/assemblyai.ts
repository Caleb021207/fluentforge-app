/**
 * AssemblyAI Universal-Streaming (U-3 Pro) adapter — STUB (workstream 0.6:
 * no network calls implemented as live defaults; plan 11 §5.1 measurement 5
 * bake-off candidate).
 *
 * Before implementing: owner approval + an AssemblyAI account with the
 * training opt-out and deletion controls enabled per plan 11 §5.3, and
 * signed terms covering the consented eval audio.
 */

import type { AdapterFactory, ProviderAdapter } from "./types.ts";

/** Env vars this adapter will need once approved. */
export const REQUIRED_ENV = ["ASSEMBLYAI_API_KEY"] as const;

const assemblyai: AdapterFactory = (): ProviderAdapter => ({
  name: "assemblyai",
  async transcribe(): Promise<string> {
    throw new Error(
      "assemblyai adapter is a stub: live transcription requires API key + owner approval. " +
        `Needed env vars: ${REQUIRED_ENV.join(", ")} (account must have training opt-out ` +
        "and deletion controls enabled per plan 11 §5.3). " +
        "No network calls are implemented as live defaults (workstream 0.6).",
    );
  },
});

export default assemblyai;
