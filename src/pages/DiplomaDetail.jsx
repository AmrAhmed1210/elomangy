import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceLinkList from "../components/ResourceLinkList";
import MascotLoader from "../components/common/MascotLoader";

export default function DiplomaDetail() {
  const { slug } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch diploma by slug
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

        // Fetch resource links for this diploma
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><MascotLoader text="One sec, fetching that for you..." size="lg" /></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><img src="/logo-mark.png" alt="" className="w-16 h-16 object-contain mx-auto mb-4 -rotate-12 opacity-80" /><p className="text-chalkboard font-semibold">Something went a bit wrong on our end</p><p className="text-chalkboard-light text-sm mt-1">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/diplomas" className="hover:text-lab-teal transition-colors">Diplomas</Link>
          <span className="mx-2">&gt;</span>
          <span>{diploma.name}</span>
        </nav>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-chalkboard mb-2 font-display">{diploma.name}</h1>
          <p className="text-2xl text-chalkboard-light font-medium mb-6" dir="rtl">{diploma.nameAr}</p>
          <div className="bg-white border border-graph-grid rounded-2xl p-6 shadow-sm mb-6">
            <p className="text-chalkboard leading-relaxed text-lg">{diploma.description}</p>
          </div>
          {diploma.eligibility && (
            <div className="bg-white border border-graph-grid rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-chalkboard mb-3">Eligibility</h2>
              <p className="text-chalkboard leading-relaxed">{diploma.eligibility}</p>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-chalkboard mb-6">Resources</h2>
        <ResourceLinkList links={resourceLinks} />
      </div>
    </div>
  );
}
