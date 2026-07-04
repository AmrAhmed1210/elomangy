import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import ResourceLinkList from "../components/ResourceLinkList";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

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

        if (!trackData.is_flat) {
          const { data: semData, error: semError } = await supabase
            .from('semesters')
            .select('*')
            .eq('track_id', trackData.id)
            .order('order');
          if (semError) throw semError;
          setSemesters(semData || []);
        } else {
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-3 border-lab-teal mb-4" />
        <p className="text-chalkboard-light">Loading...</p>
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
        badge={track.name}
        title={track.name}
        subtitle={track.name_ar}
        breadcrumbs={[
          { to: "/", label: "Home" },
          { to: "/materials", label: "Materials" },
          { label: track.name },
        ]}
      />

      {!track.is_flat ? (
        <>
          {semesters.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/40 backdrop-blur-sm">
              <div className="w-14 h-14 bg-graph-grid/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-chalkboard-light font-medium">No semesters yet</p>
            </div>
          ) : (
            <div className="centered-card-grid">
              {semesters.map((sem, i) => (
                <Card
                  key={sem.id}
                  to={sem.link ? undefined : `/materials/${trackSlug}/${sem.id}`}
                  externalLink={sem.link || undefined}
                  title={sem.label}
                  iconColor="periodic-orange"
                  hoverColor="periodic-orange"
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
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-chalkboard mb-5 font-display">Resources</h2>
          <ResourceLinkList links={resourceLinks} />
        </>
      )}
    </PageLayout>
  );
}
