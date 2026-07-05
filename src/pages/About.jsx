import { Link } from "react-router-dom";
import useSiteConfig from "../hooks/useSiteConfig";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
  const { config, loading } = useSiteConfig();
  const { t, localize } = useLanguage();

  // Admin-controlled content, per language, falling back to the built-in defaults
  // so the page never looks empty before an admin fills these in.
  const whatTitle = localize(config, "aboutWhatTitle", "aboutWhatTitleAr") || t("about_what_title");
  const whatBody = localize(config, "aboutWhatBody", "aboutWhatBodyAr") || t("about_what_body");
  const fscuTitle = localize(config, "aboutFscuTitle", "aboutFscuTitleAr") || t("about_fscu_title");
  const fscuContent = localize(config, "aboutFscuContent", "aboutFscuContentAr");
  const studentsTitle = localize(config, "aboutStudentsTitle", "aboutStudentsTitleAr") || t("about_students_title");
  const studentsBody = localize(config, "aboutStudentsBody", "aboutStudentsBodyAr") || t("about_students_body");

  const paragraphs = fscuContent ? fscuContent.split("\n\n").filter(Boolean) : [];

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
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">{whatTitle}</h3>
          <p className="text-chalkboard-light leading-relaxed">
            {whatBody}
          </p>
        </div>

        {!loading && paragraphs.length > 0 && (
          <div className="glass-card p-6 sm:p-8 border-l-4 border-l-answer-green">
            <h3 className="font-display font-semibold text-xl text-chalkboard mb-4">{fscuTitle}</h3>
            <div className="space-y-4 text-chalkboard-light leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 border-l-4 border-l-periodic-orange">
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">{studentsTitle}</h3>
          <p className="text-chalkboard-light leading-relaxed">
            {studentsBody}
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