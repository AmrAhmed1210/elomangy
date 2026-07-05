import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import Fuse from "fuse.js";
import { useLanguage } from "../contexts/LanguageContext";
import MascotLoader from "../components/common/MascotLoader";

export default function SemesterDetail() {
  const { t, localize } = useLanguage();
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
        const { data: semData, error: semError } = await supabase
          .from('semesters')
          .select('*')
          .eq('id', semesterId)
          .single();

        if (semError || !semData) {
          setError("Semester not found");
          setLoading(false);
          return;
        }
        setSemester(semData);

        if (trackSlug) {
          const { data: trackData, error: trackError } = await supabase
            .from('tracks')
            .select('*')
            .eq('slug', trackSlug)
            .single();
          if (!trackError && trackData) {
            setTrack(trackData);
          }
        }

        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('semester_id', semesterId)
          .order('order');

        if (courseError) throw courseError;
        setCourses(courseData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [trackSlug, semesterId]);

  const filteredCourses = searchQuery
    ? new Fuse(courses, { keys: ["code", "name", "instructor"], threshold: 0.3 }).search(searchQuery).map(r => r.item)
    : courses;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <MascotLoader text={t("common_loading")} />
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

  const breadcrumbs = [
    { to: "/", label: t("nav_home") },
    { to: "/materials", label: t("nav_materials") },
  ];
  if (year) breadcrumbs.push({ to: `/materials/year/${year}`, label: t("materials_year_badge", { year }) });
  if (track && trackSlug) breadcrumbs.push({ to: `/materials/year/${year}/${trackSlug}`, label: localize(track, "name", "name_ar") });
  breadcrumbs.push({ label: semester.label });

  return (
    <PageLayout>
      <PageHeader
        badge={semester.label}
        title={semester.label}
        subtitle={track ? localize(track, "name", "name_ar") : undefined}
        breadcrumbs={breadcrumbs}
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
          placeholder={t("search_courses")}
          className="search-input"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/40 backdrop-blur-sm">
          <div className="w-14 h-14 bg-graph-grid/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-chalkboard-light font-medium">{searchQuery ? t("no_courses_found") : t("no_courses_yet")}</p>
        </div>
      ) : (
        <div className="centered-card-grid">
          {filteredCourses.map((course, i) => (
            <Card
              key={course.id}
              to={course.link ? undefined : `/materials/course/${course.id}`}
              externalLink={course.link || undefined}
              title={localize(course, "name", "name_ar")}
              badge={course.code}
              iconColor="lab-teal-light"
              hoverColor="lab-teal-light"
              className={`stagger-${Math.min(i + 1, 8)}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            >
              {course.instructor && <p className="text-chalkboard-light text-sm">{course.instructor}</p>}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
