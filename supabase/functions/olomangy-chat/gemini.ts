// supabase/functions/olomangy-chat/gemini.ts

import { SYSTEM_INSTRUCTION, GEMINI_TOOLS, CHAT_MODELS, EMBED_DIM, EMBED_MODEL } from "./config.ts";
import { executeTool } from "./tools.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

export type Attachment = {
  mimeType: string;
  data: string; // base64
  name?: string;
};

export type HistoryMessage = {
  role: string;
  content: string;
};

export async function embed(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBED_DIM,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || !data?.embedding?.values) {
    throw new Error(`embed() failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data.embedding.values;
}

function buildParts(
  text: string,
  attachments?: Attachment[]
): { text?: string; inlineData?: { mimeType: string; data: string } }[] {
  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];
  if (text) parts.push({ text });
  for (const att of attachments ?? []) {
    if (att.data && att.mimeType) {
      parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    }
  }
  return parts;
}

export async function generateReply(opts: {
  apiKey: string;
  supabase: SupabaseClient;
  history: HistoryMessage[];
  userMessage: string;
  attachments?: Attachment[];
}): Promise<string> {
  const { apiKey, supabase, history, userMessage, attachments } = opts;

  // Try each model in the fallback chain
  const errors: string[] = [];
  for (const model of CHAT_MODELS) {
    try {
      console.log(`[MODEL] Trying ${model}...`);
      const result = await _callModel(model, opts);
      return result;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.warn(`[MODEL FALLBACK] ${model} failed: ${msg}`);
      errors.push(`${model}: ${msg}`);
      // If it's a rate-limit (429) or model-not-found (404), try next model
      if (msg.includes("429") || msg.includes("404") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("not found") || msg.includes("no longer available")) {
        continue;
      }
      // For other errors (auth, malformed request, etc.) don't bother retrying
      throw err;
    }
  }
  throw new Error(`All models exhausted. Errors: ${errors.join(" | ")}`);
}

/** Internal: run the agentic loop against a single model. */
async function _callModel(
  model: string,
  opts: {
    apiKey: string;
    supabase: SupabaseClient;
    history: HistoryMessage[];
    userMessage: string;
    attachments?: Attachment[];
  }
): Promise<string> {
  const { apiKey, supabase, history, userMessage, attachments } = opts;

  const contents: any[] = [];

  // 1. Build chat history in Gemini format
  for (const msg of history) {
    if (!msg.content?.trim()) continue;
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // 2. Append current user message and attachments
  contents.push({
    role: "user",
    parts: buildParts(userMessage, attachments),
  });

  let loopCount = 0;
  const maxLoops = 5;

  while (loopCount < maxLoops) {
    loopCount++;
    console.log(`[GEMINI CALL] model=${model} turn=${loopCount}, contents=${contents.length}`);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          tools: GEMINI_TOOLS,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error(`[GEMINI API ERROR] model=${model} HTTP ${res.status}:`, JSON.stringify(data));
      throw new Error(`Gemini HTTP ${res.status}: ${data?.error?.message ?? JSON.stringify(data)}`);
    }

    const candidate = data?.candidates?.[0];
    if (!candidate) {
      console.error("[GEMINI ERROR] No candidate returned:", JSON.stringify(data));
      throw new Error("Gemini returned empty candidates list");
    }

    const parts = candidate.content?.parts;
    if (!parts || parts.length === 0) {
      console.error("[GEMINI ERROR] Empty parts returned:", JSON.stringify(data));
      throw new Error("Gemini returned content with no parts");
    }

    // Push the model candidate response to context history
    contents.push(candidate.content);

    // Filter parts for functionCalls
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length > 0) {
      console.log(`[GEMINI TOOL REQUEST] Model requested ${functionCalls.length} function calls`);

      const toolResponses: any[] = [];
      for (const p of functionCalls) {
        const { name, args } = p.functionCall;
        const result = await executeTool(name, args, supabase, apiKey);

        toolResponses.push({
          functionResponse: {
            name,
            response: result,
          },
        });
      }

      // Append the tool execution responses as a new user message block
      contents.push({
        role: "user",
        parts: toolResponses,
      });

      // Continue the loop to get Gemini's next turn response
      continue;
    }

    // If no functionCalls, we are done! Extract text content.
    const text = parts
      .map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!text) {
      console.warn("[GEMINI WARNING] No text returned but also no function call:", JSON.stringify(candidate));
      return "عذراً يا صاحبي، حصلت مشكلة بسيطة في معالجة الرد. جرب تاني كده؟";
    }

    return text;
  }

  throw new Error("Exceeded maximum tool calling loop iterations");
}