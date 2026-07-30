/**
 * SELF-TEST ADAPTER — NOT A BENCHMARK.
 *
 * Returns each clip's own reference transcript as the "hypothesis" without
 * reading any audio. Its only purpose is to verify the harness plumbing
 * end-to-end (manifest validation → scoring → aggregation → report):
 * a correct harness must score exactly 0% WER everywhere on this adapter.
 *
 * It exists so the harness can be exercised with ZERO recordings and ZERO
 * fabricated results (workstream 0.6 rule). gates.ts forces every gate to
 * insufficient-data when this adapter is used, and the report carries a
 * self-test banner.
 */

import { resolve } from "node:path";
import type { AdapterFactory, ProviderAdapter } from "./types.ts";

const referencePassthrough: AdapterFactory = (ctx): ProviderAdapter => {
  // Map both raw and resolved clip paths to the reference text so lookups
  // work however the runner resolves paths.
  const byPath = new Map<string, string>();
  for (const clip of ctx.manifest.clips) {
    const text = clip.reference.normalizedTranscript ?? clip.reference.transcript;
    byPath.set(clip.path, text);
    byPath.set(resolve(ctx.manifestDir, clip.path), text);
  }
  return {
    name: "reference-passthrough",
    selfTestOnly: true,
    async transcribe(clipPath: string): Promise<string> {
      const text = byPath.get(clipPath) ?? byPath.get(resolve(ctx.manifestDir, clipPath));
      if (text === undefined) {
        throw new Error(`reference-passthrough: clip path not in manifest: ${clipPath}`);
      }
      return text;
    },
  };
};

export default referencePassthrough;
