import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceLinkList from "../components/ResourceLinkList";

export default function SpecialSectionDetail() {
  const { slug } = useParams();
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div><p className="text-chalkboard-light text-lg">Loading...</p></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-periodic-orange text-lg font-medium">Error: {error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/materials" className="hover:text-lab-teal transition-colors">Materials</Link>
          <span className="mx-2">&gt;</span>
          <span>{section.name_ar || section.name_en}</span>
        </nav>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-chalkboard mb-2 font-display">{section.name_en}</h1>
          {section.name_ar && (
            <p className="text-2xl text-chalkboard-light font-medium mb-6" dir="rtl">{section.name_ar}</p>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-chalkboard mb-6">Resources</h2>
        <ResourceLinkList links={resourceLinks} />
      </div>
    </div>
  );
}
