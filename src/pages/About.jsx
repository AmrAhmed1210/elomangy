import { Link } from "react-router-dom";
import useSiteConfig from "../hooks/useSiteConfig";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
  const { config, loading } = useSiteConfig();
  const { t } = useLanguage();

  const paragraphs = config.aboutFscuContent
    ? config.aboutFscuContent.split("\n\n").filter(Boolean)
    : [];

  return (
    <PageLayout>
      <PageHeader
        badge={t("about_badge")}
        title={t("about_title")}
        subtitle={t("about_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_about") }]}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card p-6 sm:p-8 border-l-4 border-l-lab-teal">
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">{t("about_what_title")}</h3>
          <p className="text-chalkboard-light leading-relaxed">
            {t("about_what_body")}
          </p>
        </div>

        {!loading && paragraphs.length > 0 && (
          <div className="glass-card p-6 sm:p-8 border-l-4 border-l-answer-green">
            <h3 className="font-display font-semibold text-xl text-chalkboard mb-4">{t("about_fscu_title")}</h3>
            <div className="space-y-4 text-chalkboard-light leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 border-l-4 border-l-periodic-orange">
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">{t("about_students_title")}</h3>
          <p className="text-chalkboard-light leading-relaxed">
            {t("about_students_body")}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link to="/materials" className="btn-primary text-sm px-6 py-3">
            {t("home_browse_materials")}
          </Link>
          {config.whatsappNumber && (
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-6 py-3"
            >
              {t("about_whatsapp")}
            </a>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
