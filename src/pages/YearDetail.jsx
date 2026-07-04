import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import Fuse from "fuse.js";

// Fixed year metadata
const YEAR_INFO = {
  1: { name: "First Year", description: "General courses shared by all students" },
  2: { name: "Second Year", description: "Department-specific courses - Semesters 03-04" },
  3: { name: "Third Year", description: "Department-specific courses - Semesters 05-06" },
  4: { name: "Fourth Year", description: "Department-specific courses - Semesters 07-08" },
};

export default function YearDetail() {
  const { year } = useParams();
  const [semesters, setSemesters] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const yearNum = parseInt(year);
  const yearData = YEAR_INFO[yearNum];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (yearNum === 1) {
          // Year 1: Fetch semesters with year=1 (no track filter)
          const { data, error } = await supabase
            .from('semesters')
            .select('*')
            .eq('year', 1)
            .order('order');
          
          if (error) throw error;
          setSemesters(data || []);
        } else {
          // Years 2-4: Fetch tracks that have semesters for this year
          const { data: semesterData, error: semError } = await supabase
            .from('semesters')
            .select('track_id')
            .eq('year', yearNum);
          
          if (semError) throw semError;
          
          const trackIds = [...new Set(semesterData.map((s) => s.track_id))];
          
          if (trackIds.length > 0) {
            const { data: tracksData, error: trackError } = await supabase
              .from('tracks')
              .select('*')
              .in('id', trackIds)
              .order('order');
            
            if (trackError) throw trackError;
            setTracks(tracksData || []);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [yearNum]);

  // Client-side filter for search
  const filteredSemesters = searchQuery
    ? new Fuse(semesters, { keys: ["label"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : semesters;

  const filteredTracks = searchQuery
    ? new Fuse(tracks, { keys: ["name", "nameAr"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : tracks;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div>
        <p className="text-chalkboard-light text-lg">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-periodic-orange text-lg font-medium">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <Link to="/materials" className="hover:text-lab-teal transition-colors">Materials</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">{yearData.name}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="font-display font-bold text-4xl text-chalkboard mb-3">{yearData.name}</h1>
          <p className="font-mono-smallcaps text-chalkboard-light text-sm">{yearData.description}</p>
        </div>

        {/* Scoped Search */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${yearNum === 1 ? "semesters" : "departments"}...`}
            className="w-full max-w-md px-4 py-3 border border-graph-grid rounded-xl bg-white text-chalkboard placeholder-chalkboard-light focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal"
          />
        </div>

        {yearNum === 1 ? (
          <>
            <h2 className="text-2xl font-semibold text-chalkboard mb-6">Semesters</h2>
            {filteredSemesters.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50">
                <div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-chalkboard-light text-lg font-medium">No semesters found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSemesters.map((semester) => (
                  <Card
                    key={semester.id}
                    to={`/materials/year/${yearNum}/semester/${semester.id}`}
                    title={semester.label}
                    iconColor="lab-teal"
                    hoverColor="lab-teal"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <h2 className="text-2xl font-semibold text-chalkboard mb-6">Departments</h2>
            {filteredTracks.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50">
                <div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-chalkboard-light text-lg font-medium">No departments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTracks.map((track) => (
                  <Card
                    key={track.id}
                    to={`/materials/year/${yearNum}/${track.slug}`}
                    title={track.name}
                    subtitle={track.nameAr}
                    iconColor="periodic-orange"
                    hoverColor="periodic-orange"
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
