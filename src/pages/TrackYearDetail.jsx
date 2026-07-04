import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import Fuse from "fuse.js";
import { useLanguage } from "../contexts/LanguageContext";

export default function TrackYearDetail() {
  const { t, localize } = useLanguage();
  const { year, trackSlug } = useParams();
  const [track, setTrack] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const yearNum = parseInt(year);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: trackData, error: trackError } = await supabase
          .from('tracks')
          .select('*')
          .eq('slug', trackSlug)
          .single();

        if (trackError || !trackData) {
          setError("Track not found");
          return;
        }
        setTrack(trackData);

        const { data: semData, error: semError } = await supabase
          .from('semesters')
          .select('*')
          .eq('track_id', trackData.id)
          .eq('year', yearNum)
          .order('order');

        if (semError) throw semError;
        setSemesters(semData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [yearNum, trackSlug]);

  const filteredSemesters = searchQuery
    ? new Fuse(semesters, { keys: ["label"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : semesters;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-3 border-lab-teal mb-4" />
        <p className="text-chalkboard-light">{t("common_loading")}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-periodic-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-periodic-orange font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        badge={localize(track, "name", "name_ar")}
        title={localize(track, "name", "name_ar")}
        subtitle={localize(track, "description", "description_ar")}
        breadcrumbs={[
          { to: "/", label: t("nav_home") },
          { to: "/materials", label: t("nav_materials") },
          { to: `/materials/year/${year}`, label: t("materials_year_badge", { year }) },
          { label: localize(track, "name", "name_ar") },
        ]}
      />

      {/* Search */}
      <div className="mb-8 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-chalkboard-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search_semesters")}
          className="search-input"
        />
      </div>

      {filteredSemesters.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/40 backdrop-blur-sm">
          <div className="w-14 h-14 bg-graph-grid/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-chalkboard-light font-medium">{searchQuery ? t("no_semesters_found") : t("no_semesters_yet")}</p>
        </div>
      ) : (
        <div className="centered-card-grid">
          {filteredSemesters.map((semester, i) => (
            <Card
              key={semester.id}
              to={semester.link ? undefined : `/materials/year/${year}/${trackSlug}/semester/${semester.id}`}
              externalLink={semester.link || undefined}
              title={semester.label}
              iconColor="lab-teal-light"
              hoverColor="lab-teal-light"
              className={`stagger-${Math.min(i + 1, 8)}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
