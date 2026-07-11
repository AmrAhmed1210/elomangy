// supabase/functions/olomangy-chat/index.ts
//
// Deploy:
//   supabase functions deploy olomangy-chat
//   supabase secrets set GEMINI_API_KEY=your_key
//
// Request body:
// {
//   message: string,
//   session_id?: string,
//   attachments?: [{ mimeType: string, data: string (base64), name?: string }]
// }
//
// Response: { reply: string, session_id: string, intent: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";
import { generateReply, type Attachment } from "./gemini.ts";
import { NO_MATERIALS_MESSAGE } from "./config.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeAttachments(raw: unknown): Attachment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a) => a && typeof a === "object" && a.mimeType && a.data)
    .map((a) => ({
      mimeType: String(a.mimeType),
      data: String(a.data).replace(/^data:[^;]+;base64,/, ""),
      name: a.name ? String(a.name) : undefined,
    }))
    .slice(0, 4);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const attachments = normalizeAttachments(body.attachments);

    // Legacy single-file field support
    if (body.file && attachments.length === 0 && typeof body.file === "object" && body.file.data) {
      attachments.push({
        mimeType: body.file.mimeType ?? "application/octet-stream",
        data: String(body.file.data),
        name: body.file.name,
      });
    }

    if (!message && attachments.length === 0) {
      return jsonResponse({ error: "message or attachments required" }, 400);
    }

    const userText = message || "حلّل الملف المرفق واشرحه أو حلّ المسألة اللي فيه.";

    // ── 1. Session ──────────────────────────────────────────────────────────
    let sessionId = body.session_id as string | undefined;
    if (!sessionId) {
      const { data, error } = await supabase.from("chat_sessions").insert({}).select("id").single();
      if (error) throw error;
      sessionId = data.id;
    } else {
      await supabase
        .from("chat_sessions")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", sessionId);
    }

    // ── 2. Chat history ───────────────────────────────────────────────────
    const { data: historyRows } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = (historyRows ?? []).map((r) => ({
      role: r.role,
      content: r.content,
    }));

    // ── 3. Generate reply using Gemini function-calling orchestration ────
    let reply: string;
    try {
      reply = await generateReply({
        apiKey: GEMINI_API_KEY,
        supabase,
        history,
        userMessage: userText,
        attachments,
      });
    } catch (genErr: any) {
      console.error("[GENERATE] failed:", genErr);
      reply = [
        "إزيك يا علومنجي! نورت الموقع يا بطل 🌟",
        "---",
        "**في مشكلة تقنية بسيطة دلوقتي** 🔧",
        "",
        "جرب تاني بعد ثواني — أو تواصل مع تيم علومنجي على الواتساب!",
      ].join("\n");
    }

    // Safety net: never return the banned phrase
    if (reply.includes("معنديش المعلومة دي دلوقتي")) {
      reply = reply.replace(/معنديش المعلومة دي دلوقتي[^.!?\n]*/g, NO_MATERIALS_MESSAGE);
    }

    // ── 4. Persist messages ─────────────────────────────────────────────────
    const userStored = attachments.length
      ? `${userText}\n📎 ${attachments.map((a) => a.name ?? a.mimeType).join(", ")}`
      : userText;

    await supabase.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: userStored },
      { session_id: sessionId, role: "model", content: reply },
    ]);

    return jsonResponse({ reply, session_id: sessionId, intent: "orchestrated" });
  } catch (err) {
    console.error("[HANDLER]", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});