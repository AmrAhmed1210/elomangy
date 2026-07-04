import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { useLanguage } from "../contexts/LanguageContext";

const FACULTY_LEVELS = {
  en: ["First Year", "Second Year", "Third Year", "Fourth Year"],
  ar: ["أولى", "تانية", "تالتة", "رابعة"],
};

export default function JoinUs() {
  const { t, language } = useLanguage();
  const [joinConfig, setJoinConfig] = useState({ is_open: false, message: "" });
  const [configLoading, setConfigLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    faculty_level: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadJoinConfig() {
      const { data } = await supabase.from("site_config").select("join_requests_open, join_requests_message").eq("id", 1).single();
      if (data) {
        setJoinConfig({
          is_open: data.join_requests_open ?? false,
          message: data.join_requests_message ?? "",
        });
      }
      setConfigLoading(false);
    }
    loadJoinConfig();
  }, []);

  function friendlyError(error) {
    if (error.code === "23505" || error.message.includes("duplicate")) {
      return language === "ar" ? "الإيميل ده بعت طلب قبل كده." : "This email has already submitted a request.";
    }
    return error.message || (language === "ar" ? "حصلت مشكلة. جرّب تاني." : "Something went wrong. Please try again.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.from("join_requests").insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        faculty_level: formData.faculty_level,
        message: formData.message.trim() || null,
        status: "new",
      });

      if (error) throw error;

      setMessage({ type: "success", text: t("join_success") });
      setFormData({ name: "", email: "", phone: "", faculty_level: "", message: "" });
    } catch (err) {
      setMessage({ type: "error", text: friendlyError(err) });
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  if (configLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-4 border-lab-teal" />
            <p className="text-lg text-chalkboard-light">{t("common_loading")}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!joinConfig.is_open) {
    return (
      <PageLayout>
        <PageHeader
          badge={t("join_title")}
          badgeColor="periodic-orange"
          title={t("join_title")}
          subtitle={joinConfig.message || t("join_closed")}
          breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_join_us") }]}
        />
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-chalkboard mb-3">{t("join_closed")}</h3>
            <p className="text-chalkboard-light leading-relaxed">
              {joinConfig.message || t("join_closed")}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        badge={t("join_title")}
        badgeColor="periodic-orange"
        title={t("join_title")}
        subtitle={t("join_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_join_us") }]}
      />

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl ${
                message.type === "success"
                  ? "bg-answer-green/10 border border-answer-green/30 text-answer-green"
                  : "bg-periodic-orange/10 border border-periodic-orange/30 text-periodic-orange"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-chalkboard mb-2">
                {t("join_name")} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard placeholder:text-chalkboard-light/50 focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all"
                placeholder={t("join_name")}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-chalkboard mb-2">
                {t("join_email")} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard placeholder:text-chalkboard-light/50 focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-chalkboard mb-2">
                {t("join_phone")}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard placeholder:text-chalkboard-light/50 focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all"
                placeholder="+20 1xx xxxx xxxx"
              />
            </div>

            <div>
              <label htmlFor="faculty_level" className="block text-sm font-semibold text-chalkboard mb-2">
                {t("join_year")} *
              </label>
              <select
                id="faculty_level"
                name="faculty_level"
                value={formData.faculty_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all"
              >
                <option value="">{t("join_year")}</option>
                {FACULTY_LEVELS[language].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-chalkboard mb-2">
                {t("join_reason")}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard placeholder:text-chalkboard-light/50 focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all resize-none"
                placeholder={t("join_reason")}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t("common_loading") : t("join_submit")}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
