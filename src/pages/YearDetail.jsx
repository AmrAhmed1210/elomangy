import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import Fuse from "fuse.js";

const YEAR_INFO = {
  1: { name: "First Year", description: "General courses shared by all students", color: "lab-teal" },
  2: { name: "Second Year", description: "Department-specific courses — Semesters 03–04", color: "periodic-orange" },
  3: { name: "Third Year", description: "Department-specific courses — Semesters 05–06", color: "answer-green" },
  4: { name: "Fourth Year", description: "Department-specific courses — Semesters 07–08", color: "accent-purple" },
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
          const { data, error } = await supabase
            .from('semesters')
            .select('*')
            .eq('year', 1)
            .order('order');
          if (error) throw error;
          setSemesters(data || []);
        } else {
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

  const filteredSemesters = searchQuery
    ? new Fuse(semesters, { keys: ["label"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : semesters;

  const filteredTracks = searchQuery
    ? new Fuse(tracks, { keys: ["name", "name_ar"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : tracks;

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
        badge={`Year ${yearNum}`}
        badgeColor={yearData.color === "accent-purple" ? "lab-teal" : yearData.color}
        title={yearData.name}
        subtitle={yearData.description}
        breadcrumbs={[
          { to: "/", label: "Home" },
          { to: "/materials", label: "Materials" },
          { label: yearData.name },
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
          placeholder={`Search ${yearNum === 1 ? "semesters" : "departments"}...`}
          className="search-input"
        />
      </div>

      {yearNum === 1 ? (
        <>
          {filteredSemesters.length === 0 ? (
            <EmptyState text={searchQuery ? "No semesters found" : "No semesters yet"} />
          ) : (
            <div className="centered-card-grid">
              {filteredSemesters.map((semester, i) => (
                <Card
                  key={semester.id}
                  to={semester.link ? undefined : `/materials/year/${yearNum}/semester/${semester.id}`}
                  externalLink={semester.link || undefined}
                  title={semester.label}
                  iconColor="lab-teal"
                  hoverColor="lab-teal"
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
          {filteredTracks.length === 0 ? (
            <EmptyState text={searchQuery ? "No departments found" : "No departments yet"} />
          ) : (
            <div className="centered-card-grid">
              {filteredTracks.map((track, i) => (
                <Card
                  key={track.id}
                  to={`/materials/year/${yearNum}/${track.slug}`}
                  title={track.name}
                  subtitle={track.name_ar}
                  iconColor="periodic-orange"
                  hoverColor="periodic-orange"
                  className={`stagger-${Math.min(i + 1, 8)}`}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/40 backdrop-blur-sm">
      <div className="w-14 h-14 bg-graph-grid/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-chalkboard-light font-medium">{text}</p>
    </div>
  );
}
