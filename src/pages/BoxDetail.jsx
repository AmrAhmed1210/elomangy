import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import MascotLoader from "../components/common/MascotLoader";
import { useLanguage } from "../contexts/LanguageContext";

const TYPE_CONFIG = {
  drive_folder: { label: "Drive Folder", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", color: "accent-blue" },
  drive_file: { label: "Drive File", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "accent-blue" },
  pdf: { label: "PDF", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "periodic-orange" },
  external_link: { label: "External Link", icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14", color: "answer-green" },
  video: { label: "Video", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "accent-purple" },
};

const COLOR_MAP = {
  "accent-blue": { bg: "bg-accent-blue/10", text: "text-accent-blue", ring: "hover:ring-accent-blue/20" },
  "periodic-orange": { bg: "bg-periodic-orange/10", text: "text-periodic-orange", ring: "hover:ring-periodic-orange/20" },
  "answer-green": { bg: "bg-answer-green/10", text: "text-answer-green", ring: "hover:ring-answer-green/20" },
  "accent-purple": { bg: "bg-accent-purple/10", text: "text-accent-purple", ring: "hover:ring-accent-purple/20" },
};

export default function BoxDetail() {
  const { boxId } = useParams();
  const { t, localize } = useLanguage();
  const [box, setBox] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: boxData, error: boxError } = await supabase
          .from("dashboard_boxes")
          .select("*")
          .eq("id", boxId)
          .single();

        if (boxError || !boxData) {
          setError("Box not found");
          setLoading(false);
          return;
        }
        setBox(boxData);

        const { data: linksData, error: linksError } = await supabase
          .from("resource_links")
          .select("*")
          .eq("parent_type", "dashboard_box")
          .eq("parent_id", boxId)
          .order("order");

        if (linksError) throw linksError;
        setLinks(linksData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [boxId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <MascotLoader text="One sec, fetching that for you..." />
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
        badge={box.title_ar || box.title}
        title={box.title}
        subtitle={box.description}
        breadcrumbs={[
          { to: "/", label: "Home" },
          { to: "/materials", label: "Materials" },
          { label: box.title },
        ]}
      />

      {links.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/40 backdrop-blur-sm">
          <div className="w-14 h-14 bg-graph-grid/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-chalkboard-light font-medium text-lg">{t("no_materials_yet")}</p>
          <p className="text-sm text-chalkboard-light/70 mt-2">{t("check_back_later")}</p>
        </div>
      ) : (
        <div className="centered-card-grid">
          {links.map((link, i) => {
            const typeInfo = TYPE_CONFIG[link.type] || TYPE_CONFIG.external_link;
            const colors = COLOR_MAP[typeInfo.color] || COLOR_MAP["answer-green"];

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`stagger-${Math.min(i + 1, 8)} group relative bg-white/80 backdrop-blur-sm border border-graph-grid/80 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-400 transform hover:-translate-y-1 overflow-hidden ring-1 ring-transparent ${colors.ring}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${colors.bg} opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeInfo.icon} />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-chalkboard group-hover:text-lab-teal transition-colors truncate">{link.label}</h3>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-semibold rounded-md`}>
                      {typeInfo.label}
                    </span>
                  </div>

                  <div className="shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-lab-teal transition-colors">
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
