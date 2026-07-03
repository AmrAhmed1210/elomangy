import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Card from "../components/common/Card";
import Fuse from "fuse.js";

export default function SemesterDetail() {
  const { year, trackSlug, semesterId } = useParams();
  const [track, setTrack] = useState(null);
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Get semester by ID directly
        const semDoc = await getDocs(collection(db, "semesters"));
        const targetSem = semDoc.docs.find((doc) => doc.id === semesterId);
        if (!targetSem) {
          setError("Semester not found");
          setLoading(false);
          return;
        }
        const semObj = { id: targetSem.id, ...targetSem.data() };
        setSemester(semObj);

        // Get track if trackSlug is provided (not for Year 1)
        if (trackSlug) {
          const trackQuery = query(collection(db, "tracks"), where("slug", "==", trackSlug));
          const trackSnapshot = await getDocs(trackQuery);
          if (!trackSnapshot.empty) {
            const trackData = trackSnapshot.docs[0];
            setTrack({ id: trackData.id, ...trackData.data() });
          }
        }

        // Get courses linked to semesterId
        const courseQuery = query(
          collection(db, "courses"),
          where("semesterId", "==", semesterId),
          orderBy("order")
        );
        const courseSnapshot = await getDocs(courseQuery);
        const courseData = courseSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(courseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [trackSlug, semesterId]);

  // Client-side filter for search
  const filteredCourses = searchQuery
    ? new Fuse(courses, { keys: ["code", "name"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : courses;

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div><p className="text-chalkboard-light text-lg">Loading...</p></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-periodic-orange text-lg font-medium">Error: {error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <Link to="/materials" className="hover:text-lab-teal transition-colors">Materials</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          {year && <Link to={`/materials/year/${year}`} className="hover:text-lab-teal transition-colors">Year {year}</Link>}
          {year && <span className="mx-2 text-chalkboard-light/50">/</span>}
          {track && <Link to={`/materials/year/${year}/${trackSlug}`} className="hover:text-lab-teal transition-colors">{track.name}</Link>}
          {track && <span className="mx-2 text-chalkboard-light/50">/</span>}
          <span className="text-lab-teal">{semester.label}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="font-display font-bold text-4xl text-chalkboard mb-3">{semester.label}</h1>
          {track && <p className="font-mono-smallcaps text-chalkboard-light text-sm">{track.name}</p>}
        </div>

        {/* Scoped Search */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full max-w-md px-4 py-3 border border-graph-grid rounded-xl bg-white text-chalkboard placeholder-chalkboard-light focus:outline-none focus:ring-2 focus:ring-lab-teal/50 focus:border-lab-teal"
          />
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50"><div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg></div><p className="text-chalkboard-light text-lg font-medium">{searchQuery ? "No courses found" : "No courses yet"}</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                to={`/materials/course/${course.id}`}
                title={course.name}
                badge={course.code}
                iconColor="lab-teal-light"
                hoverColor="lab-teal-light"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              >
                {course.instructor && <p className="text-chalkboard-light mb-6">Instructor: {course.instructor}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
