import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import MarkdownText from "../components/chat/MarkdownText";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";

const SESSION_KEY = "3loomangy_bot_session_id";

const ERROR_REPLY = [
  "إزيك يا علومنجي! نورت الموقع يا بطل 🌟",
  "---",
  "**في مشكلة تقنية بسيطة** 🔧",
  "",
  "جرب تاني بعد ثواني — أو تواصل مع تيم علومنجي!",
].join("\n");

function readFileAsAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve({
        mimeType: file.type || "application/octet-stream",
        data: base64,
        name: file.name,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Chatbot() {
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", content: t("chatbot_welcome") },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const seen = localStorage.getItem("3loomangy_bot_tooltip_seen");
    if (!seen) {
      const timer = setTimeout(() => setShowTooltip(true), 900);
      localStorage.setItem("3loomangy_bot_tooltip_seen", "1");
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const attachment = await readFileAsAttachment(file);
      setPendingAttachment(attachment);
      if (!input.trim()) {
        setInput(`ساعدني في الملف ده: ${file.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !pendingAttachment) || sending) return;

    const displayText = text || `📎 ${pendingAttachment?.name ?? "ملف مرفق"}`;
    const attachmentSnapshot = pendingAttachment;

    setMessages((prev) => [...prev, { role: "user", content: displayText }]);
    setInput("");
    setPendingAttachment(null);
    setSending(true);

    try {
      // صياغة المرفق بالهيكل الدقيق الذي يتوقعه السيرفر وموديل Gemini
      const formattedAttachments = attachmentSnapshot ? [{
        inlineData: {
          mimeType: attachmentSnapshot.mimeType,
          data: attachmentSnapshot.data
        },
        name: attachmentSnapshot.name
      }] : undefined;

      const payload = {
        message: text || `حلّل الملف المرفق: ${attachmentSnapshot?.name ?? "attachment"}`,
        session_id: sessionStorage.getItem(SESSION_KEY) || undefined,
        ...(formattedAttachments ? { attachments: formattedAttachments } : {}),
      };

      const { data, error } = await supabase.functions.invoke("olomangy-chat", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.session_id) sessionStorage.setItem(SESSION_KEY, data.session_id);

      setMessages((prev) => [
        ...prev,
        { role: "model", content: data?.reply || ERROR_REPLY },
      ]);
    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages((prev) => [...prev, { role: "model", content: ERROR_REPLY }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <PageLayout>
      <PageHeader
        badge={t("chatbot_badge")}
        badgeColor="accent-purple"
        title={t("chatbot_title")}
        subtitle={t("chatbot_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_chatbot") }]}
      />

      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
        <div className="relative overflow-visible rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] p-6 shadow-[var(--shadow-soft)] sm:p-8 flex flex-col">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-accent-purple via-lab-teal to-answer-green" />
          <div className="mb-6 flex items-center justify-between gap-4 shrink-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                <span className="grid h-14 w-14 place-items-center">
                  <img src="/logo-mark.png" alt="" className="h-14 w-14 object-contain animate-listen-nod drop-shadow-sm" />
                </span>
                <span className="absolute -bottom-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-answer-green px-1.5 text-[10px] font-black text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  AI
                </span>
                {showTooltip && (
                  <div className="absolute left-1/2 top-full z-10 mt-3 w-56 -translate-x-1/2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] p-3 text-xs leading-5 text-chalkboard shadow-xl animate-scale-in">
                    <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[var(--surface-border)] bg-[var(--surface-card-strong)]" />
                    {t("chatbot_tooltip")}
                    <button
                      onClick={() => setShowTooltip(false)}
                      className="mt-2 block text-[11px] font-bold text-lab-teal press-squish"
                    >
                      {t("common_ok")}
                    </button>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-wrap-balance font-display text-xl font-bold leading-tight text-chalkboard sm:text-2xl">
                  {t("chatbot_card_title")}
                </h2>
                <p className="mt-1 text-sm text-chalkboard-light">{t("chatbot_status")}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-accent-purple/25 bg-accent-purple/10 px-3 py-1 text-xs font-black uppercase text-accent-purple">
              Beta
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 min-h-[300px] max-h-[500px] space-y-3 overflow-y-auto pe-1 mb-4">
            {messages.map((m, i) => (
              <ChatBubble key={i} align={m.role === "user" ? "end" : "start"} text={m.content} />
            ))}
            {sending && (
              <div className="chat-bubble-pop flex w-fit items-center gap-2 rounded-2xl border border-[var(--surface-border)] bg-white/70 px-4 py-3 text-chalkboard-light shadow-sm dark:bg-slate-900/70">
                <span className="animate-bounce text-lg">🧪</span>
                <span className="text-sm">{t("chatbot_loading")}</span>
              </div>
            )}
          </div>

          {pendingAttachment && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-lab-teal/30 bg-lab-teal/5 px-3 py-2 text-xs text-lab-teal">
              <span>📎 {pendingAttachment.name}</span>
              <button
                type="button"
                onClick={() => setPendingAttachment(null)}
                className="ms-auto font-bold hover:opacity-70"
                aria-label="remove attachment"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-[var(--surface-border)] pt-4 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--surface-border)] bg-white/70 text-chalkboard transition hover:border-lab-teal hover:text-lab-teal disabled:opacity-50 dark:bg-slate-900/70"
              aria-label="upload file"
            >
              📎
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatbot_input_placeholder") || "اسأل علومنجي..."}
              disabled={sending}
              className="min-h-12 flex-1 rounded-xl border border-[var(--surface-border)] bg-white/70 px-4 text-sm text-chalkboard outline-none focus:border-lab-teal dark:bg-slate-900/70"
            />
            <button
              type="submit"
              disabled={sending || (!input.trim() && !pendingAttachment)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lab-teal text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 press-squish"
              aria-label="send"
            >
              ➤
            </button>
          </form>
        </div>

        <aside className="relative overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-gradient-to-br from-lab-teal to-slate-950 p-6 text-white shadow-[var(--shadow-lift)] sm:p-8">
          <img
            src="/logo-mark.png"
            alt=""
            className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rotate-[-10deg] object-contain opacity-15"
          />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/65">{t("chatbot_badge")}</p>
              <h3 className="mt-4 text-wrap-balance font-display text-3xl font-black leading-tight sm:text-4xl">
                {t("chatbot_title")}
              </h3>
              <p className="mt-5 max-w-md text-base leading-8 text-white/78">
                {t("chatbot_card_body")}
              </p>
            </div>
            <Link
              to="/materials"
              className="inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-lab-teal shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50 press-squish"
            >
              {t("home_browse_materials")}
            </Link>
          </div>
        </aside>
      </section>
    </PageLayout>
  );
}

function ChatBubble({ align, text }) {
  const isEnd = align === "end";
  return (
    <div className={`flex ${isEnd ? "justify-end" : "justify-start"}`}>
      <div
        className={`chat-bubble-pop max-w-[88%] overflow-wrap-anywhere rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isEnd
            ? "bg-lab-teal text-white"
            : "border border-[var(--surface-border)] bg-white/75 text-chalkboard dark:bg-slate-900/75"
        }`}
      >
        {isEnd ? text : <MarkdownText text={text} />}
      </div>
    </div>
  );
}