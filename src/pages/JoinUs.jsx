import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

const FACULTY_LEVELS = ["First Year", "Second Year", "Third Year", "Fourth Year"];

export default function JoinUs() {
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
    if (error.code === "23505") return "This email has already submitted a request.";
    if (error.message.includes("duplicate")) return "This email has already submitted a request.";
    return error.message || "Something went wrong. Please try again.";
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

      setMessage({ type: "success", text: "Your request has been submitted successfully! We'll get back to you soon." });
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
            <p className="text-lg text-chalkboard-light">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!joinConfig.is_open) {
    return (
      <PageLayout>
        <PageHeader
          badge="Join Us"
          badgeColor="periodic-orange"
          title="Join Our Team"
          subtitle={joinConfig.message || "Applications are currently closed. Check back later!"}
          breadcrumbs={[{ to: "/", label: "Home" }, { label: "Join Us" }]}
        />
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="w-20 h-20 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-chalkboard mb-3">Applications Closed</h3>
            <p className="text-chalkboard-light leading-relaxed">
              {joinConfig.message || "We are not currently accepting new team applications. Please check back later for updates."}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        badge="Join Us"
        badgeColor="periodic-orange"
        title="Join Our Team"
        subtitle="Fill out the form below to join our team and contribute to 3loomangy"
        breadcrumbs={[{ to: "/", label: "Home" }, { label: "Join Us" }]}
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
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard placeholder:text-chalkboard-light/50 focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-chalkboard mb-2">
                Email *
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
                Phone (optional)
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
                Faculty Level *
              </label>
              <select
                id="faculty_level"
                name="faculty_level"
                value={formData.faculty_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all"
              >
                <option value="">Select your level</option>
                {FACULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-chalkboard mb-2">
                Message (optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard placeholder:text-chalkboard-light/50 focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal transition-all resize-none"
                placeholder="Tell us about yourself and why you want to join..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
