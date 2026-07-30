/**
 * Adapter registry. Providers are constructed only via this registry keyed
 * by name — same rule as the production registry sketch in plan 11 §6.1
 * ("providers are constructed only via a registry").
 */

import type { AdapterFactory } from "./types.ts";
import referencePassthrough from "./reference-passthrough.ts";
import deepgram from "./deepgram.ts";
import assemblyai from "./assemblyai.ts";
import openai from "./openai.ts";

export const ADAPTERS: Record<string, AdapterFactory> = {
  "reference-passthrough": referencePassthrough,
  deepgram,
  assemblyai,
  openai,
};

export const ADAPTER_NAMES = Object.keys(ADAPTERS);
