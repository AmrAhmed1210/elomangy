import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceLinkList from "../components/ResourceLinkList";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import MascotLoader from "../components/common/MascotLoader";
import EmptyState from "../components/common/EmptyState";
import { useLanguage } from "../contexts/LanguageContext";

export default function DiplomaDetail() {
  const { slug } = useParams();
  const { t, localize } = useLanguage();
  const [diploma, setDiploma] = useState(null);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: diplomaData, error: diplomaError } = await supabase
          .from('diplomas')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (diplomaError || !diplomaData) {
          setError("Diploma not found");
          setLoading(false);
          return;
        }
        setDiploma(diplomaData);

        const { data: linksData, error: linksError } = await supabase
          .from('resource_links')
          .select('*')
          .eq('parent_type', 'diploma')
          .eq('parent_id', diplomaData.id)
          .order('order');
        
        if (linksError) throw linksError;
        setResourceLinks(linksData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <MascotLoader text={t("common_loading")} />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 bg-periodic-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-chalkboard font-semibold">{t("common_error")}</p>
            <p className="text-chalkboard-light text-sm mt-1">{error}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        badge={t("diplomas_badge_single")}
        badgeColor="answer-green"
        title={localize(diploma, "name", "name_ar")}
        subtitle={diploma.name_ar}
        breadcrumbs={[
          { to: "/", label: t("nav_home") },
          { to: "/diplomas", label: t("nav_diplomas") },
          { label: localize(diploma, "name", "name_ar") },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {diploma.description && (
          <div className="glass-card p-6 sm:p-8">
            <p className="text-chalkboard leading-relaxed text-lg">{diploma.description}</p>
          </div>
        )}

        {diploma.eligibility && (
          <div className="glass-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-chalkboard mb-3">{t("diplomas_eligibility")}</h2>
            <p className="text-chalkboard leading-relaxed">{diploma.eligibility}</p>
          </div>
        )}

        {resourceLinks.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-chalkboard mb-6">{t("diplomas_resources")}</h2>
            <ResourceLinkList links={resourceLinks} />
          </div>
        )}

        {resourceLinks.length === 0 && (
          <EmptyState 
            title={t("no_materials_yet")} 
            description={t("check_back_later")} 
            variant="excited" 
          />
        )}
      </div>
    </PageLayout>
  );
}
