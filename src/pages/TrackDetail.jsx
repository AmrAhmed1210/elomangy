import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceLinkList from "../components/ResourceLinkList";

export default function TrackDetail() {
  const { trackSlug } = useParams();
  const [track, setTrack] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch track by slug
        const { data: trackData, error: trackError } = await supabase
          .from('tracks')
          .select('*')
          .eq('slug', trackSlug)
          .single();
        
        if (trackError || !trackData) {
          setError("Track not found");
          setLoading(false);
          return;
        }
        setTrack(trackData);

        // If not flat, fetch semesters
        if (!trackData.is_flat) {
          const { data: semData, error: semError } = await supabase
            .from('semesters')
            .select('*')
            .eq('track_id', trackData.id)
            .order('order');
          
          if (semError) throw semError;
          setSemesters(semData || []);
        } else {
          // If flat, fetch resource links directly linked to this track
          const { data: linksData, error: linksError } = await supabase
            .from('resource_links')
            .select('*')
            .eq('parent_type', 'track')
            .eq('parent_id', trackData.id);
          
          if (linksError) throw linksError;
          setResourceLinks(linksData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [trackSlug]);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div><p className="text-chalkboard-light text-lg">Loading...</p></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-periodic-orange text-lg font-medium">Error: {error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-8 text-sm text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/materials" className="hover:text-lab-teal transition-colors">Materials</Link>
          <span className="mx-2">&gt;</span>
          <span>{track.name}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-chalkboard mb-2 font-display">{track.name}</h1>
          <p className="text-2xl text-chalkboard-light font-medium" dir="rtl">{track.name_ar}</p>
        </div>

        {!track.is_flat ? (
          <div>
            <h2 className="text-2xl font-semibold text-chalkboard mb-6">Semesters</h2>
            {semesters.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50"><div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg></div><p className="text-chalkboard-light text-lg font-medium">No semesters yet</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {semesters.map((sem) => (
                  <Link
                    key={sem.id}
                    to={`/materials/${trackSlug}/${sem.id}`}
                    className="group relative bg-gradient-to-br from-white to-periodic-orange/5 border border-graph-grid rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-periodic-orange/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-periodic-orange/10 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-lab-teal/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-lab-teal/10 transition-colors duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-periodic-orange to-periodic-orange-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-2xl text-chalkboard mb-3 group-hover:text-periodic-orange transition-colors">{sem.label}</h3>
                      <div className="flex items-center text-periodic-orange font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <span>View Courses</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-chalkboard mb-6">Resources</h2>
            <ResourceLinkList links={resourceLinks} />
          </div>
        )}
      </div>
    </div>
  );
}
