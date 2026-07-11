import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceLinkList from "../components/ResourceLinkList";
import MascotLoader from "../components/common/MascotLoader";
import { useLanguage } from "../contexts/LanguageContext";

export default function SpecialSectionDetail() {
  const { slug } = useParams();
  const { t, localize } = useLanguage();
  const [section, setSection] = useState(null);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch section by slug
        const { data: sectionData, error: sectionError } = await supabase
          .from('special_sections')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (sectionError || !sectionData) {
          setError("Section not found");
          setLoading(false);
          return;
        }
        setSection(sectionData);

        // Fetch resource links for this section
        const { data: linksData, error: linksError } = await supabase
          .from('resource_links')
          .select('*')
          .eq('parent_type', 'section')
          .eq('parent_id', sectionData.id)
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white dark:via-slate-950 to-lab-teal/5 flex items-center justify-center"><div className="text-center"><MascotLoader text={t("common_loading")} size="lg" /></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white dark:via-slate-950 to-lab-teal/5 flex items-center justify-center"><div className="text-center"><img src="/logo-mark.png" alt="" className="w-16 h-16 object-contain mx-auto mb-4 -rotate-12 opacity-80" /><p className="text-chalkboard font-semibold">{t("common_error")}</p><p className="text-chalkboard-light text-sm mt-1">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white dark:via-slate-950 to-lab-teal/5 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">{t("nav_home")}</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/materials" className="hover:text-lab-teal transition-colors">{t("nav_materials")}</Link>
          <span className="mx-2">&gt;</span>
          <span>{localize(section, "name_en", "name_ar")}</span>
        </nav>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-chalkboard mb-2 font-display">{localize(section, "name_en", "name_ar")}</h1>
        </div>
        <h2 className="text-2xl font-semibold text-chalkboard mb-6">{t("materials_more_resources")}</h2>
        <ResourceLinkList links={resourceLinks} />
      </div>
    </div>
  );
}
