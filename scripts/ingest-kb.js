// scripts/ingest-kb.js
// يقرأ ملفات JSON (زي kb_seed_daleel_altalib.json) ويعمل embedding لكل chunk
// عن طريق Gemini، ويحطها في kb_documents / kb_chunks على Supabase.
//
// تشغيل:
//   node scripts/ingest-kb.js scripts/kb_seed_daleel_altalib.json
//
// لازم يكون عندك في .env.local (أو env vars):
//   SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (مش الـ anon key -- محتاجين نتخطى الـ RLS)
//   GEMINI_API_KEY=...

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// .env.local دايماً في جذر المشروع (مجلد فوق scripts/) - مش في scripts/ نفسها.
// بنقراه يدوي بدل ما نعتمد على مكتبة dotenv، لأنها ممكن تفشل بصمت مع بعض
// أنواع الترميز (encoding) أو نهايات الأسطر في ويندوز.
function loadEnvLocal() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dirname, "../.env.local");

    if (!fs.existsSync(envPath)) {
        console.error(`❌ ملف .env.local مش موجود في: ${envPath}`);
        process.exit(1);
    }

    const raw = fs.readFileSync(envPath, "utf-8").replace(/^\uFEFF/, ""); // شيل BOM لو موجود
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        // شيل علامات التنصيص لو المتغير محاط بيها
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }

    console.log(`✔ اتقرا .env.local من: ${envPath}`);
}

loadEnvLocal();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBED_MODEL = "gemini-embedding-001"; // text-embedding-004 القديم اتلغى
const EMBED_DIM = 768; // لازم يتطابق مع vector(768) في السكيما

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / GEMINI_API_KEY in env.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function embed(text) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
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
    if (!res.ok) {
        throw new Error(`Gemini embed failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data.embedding.values; // array of 768 floats
}

async function main() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Usage: node scripts/ingest-kb.js <path-to-kb_seed.json>");
        process.exit(1);
    }

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { document, chunks } = raw;

    console.log(`Ingesting "${document.title}" (${chunks.length} chunks)...`);

    // 1) upsert the document row (skip if a doc with same file_name+title exists)
    let { data: existing } = await supabase
        .from("kb_documents")
        .select("id")
        .eq("title", document.title)
        .maybeSingle();

    let documentId = existing?.id;

    if (documentId) {
        console.log(`Document already exists (${documentId}). Deleting old chunks first...`);
        await supabase.from("kb_chunks").delete().eq("document_id", documentId);
    } else {
        const { data: inserted, error } = await supabase
            .from("kb_documents")
            .insert({
                title: document.title,
                source_type: document.source_type,
                file_name: document.file_name || null,
            })
            .select("id")
            .single();
        if (error) throw error;
        documentId = inserted.id;
    }

    // 2) embed + insert each chunk (sequential to respect rate limits;
    //    bump concurrency later if needed)
    for (const chunk of chunks) {
        const embedding = await embed(chunk.content);
        const { error } = await supabase.from("kb_chunks").insert({
            document_id: documentId,
            chunk_index: chunk.chunk_index,
            content: chunk.content,
            embedding,
            metadata: chunk.metadata || {},
        });
        if (error) throw error;
        console.log(`  chunk ${chunk.chunk_index} done (page ${chunk.metadata?.page ?? "?"})`);
    }

    console.log("Done ✅");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});