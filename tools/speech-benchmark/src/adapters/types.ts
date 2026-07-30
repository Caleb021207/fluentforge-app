/**
 * Provider adapter contract for the benchmark harness (workstream 0.6;
 * plan 11 §5.2 "every vendor scored through the §6 abstraction so re-runs
 * are one command"). This is the bench-side sibling of the production
 * SttProvider sketch in plan 11 §6.1 — deliberately smaller: batch, one
 * clip in, one hypothesis out.
 */

import type { EvalLanguage } from "../wer.ts";
import type { EvalManifest } from "../manifest.ts";

export interface ProviderAdapter {
  /** Registry id, e.g. "reference-passthrough", "deepgram". */
  name: string;
  /**
   * True only for harness self-test adapters. Runs made with such an
   * adapter are labeled NOT A BENCHMARK and every gate is forced to
   * insufficient-data (gates.ts).
   */
  selfTestOnly?: boolean;
  /** Produce a hypothesis transcript for one clip. */
  transcribe(clipPath: string, language: EvalLanguage): Promise<string>;
}

export interface AdapterContext {
  manifest: EvalManifest;
  /** Absolute directory of the manifest file; clip paths resolve against it. */
  manifestDir: string;
}

export type AdapterFactory = (ctx: AdapterContext) => ProviderAdapter;
