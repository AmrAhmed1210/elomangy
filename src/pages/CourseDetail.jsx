import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ResourceLinkList from "../components/ResourceLinkList";

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // First get course by id
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseError || !courseData) {
          setError("Course not found");
          setLoading(false);
          return;
        }
        setCourse(courseData);

        // Now get resource links
        const { data: linksData, error: linksError } = await supabase
          .from('resource_links')
          .select('*')
          .eq('parent_type', 'course')
          .eq('parent_id', courseId)
          .order('order');
        
        if (linksError) throw linksError;
        setLinks(linksData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div><p className="text-chalkboard-light text-lg">Loading...</p></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-periodic-orange text-lg font-medium">Error: {error}</p></div></div>;

  // NOTE: We don't have full breadcrumb data (track/semester), so we'll make a simple one
  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/materials" className="hover:text-lab-teal transition-colors">Materials</Link>
          <span className="mx-2">&gt;</span>
          <span>{course.code} - {course.name}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block px-5 py-3 bg-gradient-to-r from-lab-teal to-lab-teal-dark text-white rounded-2xl mb-6 font-mono text-xl font-bold shadow-lg">
            {course.code}
          </div>
          <h1 className="text-5xl font-bold text-chalkboard mb-3 font-display">{course.name}</h1>
          {course.instructor && (
            <p className="text-xl text-chalkboard-light">Instructor: {course.instructor}</p>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-chalkboard mb-6">Resources</h2>
        <ResourceLinkList links={links} />
      </div>
    </div>
  );
}
