import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Card from "../components/common/Card";
import Fuse from "fuse.js";

export default function TrackYearDetail() {
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
        
        // Fetch track by slug
        const trackQ = query(
          collection(db, "tracks"),
          where("slug", "==", trackSlug)
        );
        const trackSnapshot = await getDocs(trackQ);
        if (trackSnapshot.empty) {
          setError("Track not found");
          return;
        }
        const trackData = { id: trackSnapshot.docs[0].id, ...trackSnapshot.docs[0].data() };
        setTrack(trackData);

        // Fetch semesters for this track and year
        const semQ = query(
          collection(db, "semesters"),
          where("trackId", "==", trackData.id),
          where("year", "==", yearNum),
          orderBy("order")
        );
        const semSnapshot = await getDocs(semQ);
        setSemesters(semSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [yearNum, trackSlug]);

  // Client-side filter for search
  const filteredSemesters = searchQuery
    ? new Fuse(semesters, { keys: ["label"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : semesters;

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
          <Link to={`/materials/year/${year}`} className="hover:text-lab-teal transition-colors">Year {year}</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">{track.name}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="font-display font-bold text-4xl text-chalkboard mb-3">{track.name}</h1>
          <p className="font-mono-smallcaps text-chalkboard-light text-sm" dir="rtl">{track.nameAr}</p>
        </div>

        {/* Scoped Search */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search semesters..."
            className="w-full max-w-md px-4 py-3 border border-graph-grid rounded-xl bg-white text-chalkboard placeholder-chalkboard-light focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal"
          />
        </div>

        <h2 className="text-2xl font-semibold text-chalkboard mb-6">Semesters</h2>
        {filteredSemesters.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50">
            <div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-chalkboard-light text-lg font-medium">{searchQuery ? "No semesters found" : "No semesters yet"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSemesters.map((semester) => (
              <Card
                key={semester.id}
                to={`/materials/year/${year}/${trackSlug}/semester/${semester.id}`}
                title={semester.label}
                iconColor="lab-teal-light"
                hoverColor="lab-teal-light"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
