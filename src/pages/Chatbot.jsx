import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { useLanguage } from "../contexts/LanguageContext";

export default function Chatbot() {
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("3loomangy_bot_tooltip_seen");
    if (!seen) {
      const timer = setTimeout(() => setShowTooltip(true), 900);
      localStorage.setItem("3loomangy_bot_tooltip_seen", "1");
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <PageLayout>
      <PageHeader
        badge={t("chatbot_badge")}
        badgeColor="accent-purple"
        title={t("chatbot_title")}
        subtitle={t("chatbot_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_chatbot") }]}
      />

      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="relative overflow-visible rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-accent-purple via-lab-teal to-answer-green" />
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                <span className="grid h-16 w-16 place-items-center">
                  <img src="/logo-mark.png" alt="" className="h-16 w-16 object-contain animate-listen-nod drop-shadow-sm" />
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

          <div className="space-y-3">
            <ChatBubble align="start" text={t("chatbot_intro_msg")} delay="0ms" />
            <ChatBubble align="end" text={t("chatbot_sample_user")} delay="120ms" />
            <ChatBubble align="start" text={t("chatbot_sample_reply")} delay="240ms" />
            <div className="chat-bubble-pop flex w-fit items-center gap-2 rounded-2xl border border-[var(--surface-border)] bg-white/70 px-4 py-3 text-chalkboard-light shadow-sm dark:bg-slate-900/70 [animation-delay:360ms]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lab-teal" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-lab-teal [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-lab-teal [animation-delay:240ms]" />
            </div>
          </div>
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

function ChatBubble({ align, text, delay = "0ms" }) {
  const isEnd = align === "end";
  return (
    <div className={`flex ${isEnd ? "justify-end" : "justify-start"}`}>
      <div
        style={{ animationDelay: delay }}
        className={`chat-bubble-pop max-w-[82%] overflow-wrap-anywhere rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${
          isEnd
            ? "bg-lab-teal text-white"
            : "border border-[var(--surface-border)] bg-white/75 text-chalkboard dark:bg-slate-900/75"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
