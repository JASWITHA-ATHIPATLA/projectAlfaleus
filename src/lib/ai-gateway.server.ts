// Server-only helper for calling Lovable AI Gateway directly via fetch.
// We use the OpenAI-compatible chat completions endpoint with JSON mode.

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatJSON<T = unknown>(
  messages: ChatMessage[],
  opts: { model?: string } = {},
): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "raw-fetch",
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI Gateway ${res.status}: ${body || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}
