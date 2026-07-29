/**
 * Thin server-only wrapper around the Lovable AI Gateway.
 * The key never leaves the edge runtime.
 */

const BASE = "https://ai.gateway.lovable.dev/v1";

export class GatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function apiKey(): string {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

export interface ChatOptions {
  model: string;
  system?: string;
  prompt: string;
  /** Ask the model for a JSON object response. */
  json?: boolean;
  maxTokens?: number;
}

export async function chat({ model, system, prompt, json, maxTokens }: ChatOptions): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ],
  };
  if (json) body.response_format = { type: "json_object" };
  if (maxTokens) body.max_tokens = maxTokens;
  // GPT-5.6 family rejects tool/effort defaults; keep reasoning off where supported.
  if (model.startsWith("openai/gpt-5.6")) body.reasoning_effort = "none";

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new GatewayError(res.status, `AI gateway ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** Chat call that must return JSON. Returns null when the model output is unusable. */
export async function chatJson<T = any>(opts: ChatOptions): Promise<T | null> {
  const raw = await chat({ ...opts, json: true });
  return parseJson<T>(raw);
}

export function parseJson<T = any>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch { /* fall through */ }
    }
    return null;
  }
}

export async function embed(text: string, model = "google/gemini-embedding-001"): Promise<number[] | null> {
  const res = await fetch(`${BASE}/embeddings`, {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: text.slice(0, 4000) }),
  });
  if (!res.ok) {
    console.error("embedding failed", res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const data = await res.json();
  const vec = data?.data?.[0]?.embedding;
  return Array.isArray(vec) ? vec : null;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
