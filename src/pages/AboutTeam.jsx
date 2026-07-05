import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import EmptyState from "../components/common/EmptyState";
import { useLanguage } from "../contexts/LanguageContext";
import MascotLoader from "../components/common/MascotLoader";
import useSiteConfig from "../hooks/useSiteConfig";

export default function AboutTeam() {
  const { t, localize } = useLanguage();
  const { config, loading: configLoading } = useSiteConfig();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCommittees() {
      try {
        const { data, error } = await supabase
          .from("team_committees")
          .select("*")
          .eq("is_active", true)
          .order("order", { ascending: true });

        if (error) throw error;
        setCommittees(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCommittees();
  }, []);

  if (loading || configLoading) return <LoadingAboutTeam />;
  if (error) return <ErrorState error={error} />;

  // Admin-controlled intro, falling back to translation defaults
  const introTitle = localize(config, "teamIntroTitle", "teamIntroTitleAr") || t("about_team_intro_title");
  const introBody = localize(config, "teamIntroBody", "teamIntroBodyAr") || t("about_team_intro_body");

  return (
    <PageLayout>
      <PageHeader
        badge={t("about_team_badge")}
        badgeColor="lab-teal"
        title={t("about_team_title")}
        subtitle={t("about_team_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_about_team") }]}
      />

      {/* Intro Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="glass-card p-6 sm:p-8 border-l-4 border-l-lab-teal">
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">{introTitle}</h3>
          <p className="text-chalkboard-light leading-relaxed">{introBody}</p>
        </div>
      </div>

      {/* Committees Grid */}
      {committees.length === 0 ? (
        <EmptyState
          title={t("about_team_no_committees")}
          description={t("about_team_no_committees_desc")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees.map((committee, index) => (
            <CommitteeCard key={committee.id} committee={committee} index={index} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function CommitteeCard({ committee, index }) {
  const { localize } = useLanguage();

  const name = localize(committee, "name", "name_ar");
  const description = localize(committee, "description", "description_ar");
  const responsibilities = localize(committee, "responsibilities", "responsibilities_ar");
  const responsibilitiesParagraphs = responsibilities ? responsibilities.split("\n\n").filter(Boolean) : [];

  return (
    <div
      className={`glass-card p-6 group hover:-translate-y-1 transition-all duration-300 stagger-${Math.min(index + 1, 8)}`}
    >
      {/* Committee Name */}
      <h3 className="font-display text-xl font-bold text-chalkboard mb-2 group-hover:text-lab-teal transition-colors">
        {name}
      </h3>

      {/* Short Description */}
      {description && (
        <p className="text-sm text-chalkboard-light line-clamp-3 mb-4">{description}</p>
      )}

      {/* Responsibilities */}
      {responsibilitiesParagraphs.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-lab-teal mb-2">{t("about_team_responsibilities")}</p>
          <div className="space-y-2 text-sm text-chalkboard-light leading-relaxed">
            {responsibilitiesParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* Head Name */}
      {committee.head_name && (
        <p className="text-xs text-chalkboard-light/70 mb-4">
          <span className="font-medium">{t("about_team_head_label")}</span>: {committee.head_name}
        </p>
      )}

      {/* Contact Link */}
      {committee.contact_link && (
        <a
          href={committee.contact_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-lab-teal hover:text-lab-teal-dark transition-colors"
        >
          {t("common_contact")}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

function LoadingAboutTeam() {
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center">
        <MascotLoader />
      </div>
    </PageLayout>
  );
}

function ErrorState({ error }) {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-periodic-orange">{t("common_error_prefix")}: {error}</p>
      </div>
    </PageLayout>
  );
}
