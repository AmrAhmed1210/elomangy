import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { useLanguage } from "../contexts/LanguageContext";

export default function Chatbot() {
  const { t } = useLanguage();

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
        <div className="relative overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-purple via-lab-teal to-answer-green" />
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lab-teal text-lg font-black text-white shadow-lg shadow-lab-teal/25">
                3
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-chalkboard">{t("chatbot_card_title")}</h2>
                <p className="mt-1 text-sm text-chalkboard-light">{t("chatbot_status")}</p>
              </div>
            </div>
            <span className="rounded-full border border-accent-purple/25 bg-accent-purple/10 px-3 py-1 text-xs font-black uppercase text-accent-purple">
              Beta
            </span>
          </div>

          <div className="space-y-3">
            <ChatBubble align="start" text={t("chatbot_card_body")} />
            <ChatBubble align="end" text={t("chatbot_status")} />
            <div className="flex w-fit items-center gap-2 rounded-2xl border border-[var(--surface-border)] bg-white/70 px-4 py-3 text-chalkboard-light shadow-sm dark:bg-slate-900/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lab-teal" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-lab-teal [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-lab-teal [animation-delay:240ms]" />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-[var(--surface-border)] bg-gradient-to-br from-lab-teal to-slate-950 p-6 text-white shadow-[var(--shadow-lift)] sm:p-8">
          <div className="flex h-full flex-col justify-between gap-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-white/65">{t("chatbot_badge")}</p>
              <h3 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
                {t("chatbot_title")}
              </h3>
              <p className="mt-5 max-w-md text-base leading-8 text-white/78">
                {t("chatbot_card_body")}
              </p>
            </div>
            <Link
              to="/materials"
              className="inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-black text-lab-teal shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
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
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm ${
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
