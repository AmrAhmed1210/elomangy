import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import VideoCard from "../components/training/VideoCard";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import { useLanguage } from "../contexts/LanguageContext";

export default function CategoryDetail() {
  const { sessionId, categoryId } = useParams();
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [category, setCategory] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        
        if (sessionError || !sessionData) {
          setError("Session not found");
          setLoading(false);
          return;
        }
        
        setSession(sessionData);

        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('training_categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        
        if (categoryError || !categoryData) {
          setError("Category not found");
          setLoading(false);
          return;
        }
        
        setCategory(categoryData);

        // Fetch videos for this category
        const { data: videosData, error: videosError } = await supabase
          .from('training_videos')
          .select('*')
          .eq('session_id', sessionId)
          .eq('category_id', categoryId)
          .order('order');
        
        if (videosError) throw videosError;
        setVideos(videosData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryData();
  }, [sessionId, categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white dark:via-slate-950 to-lab-teal/5 p-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
            <Link to="/" className="hover:text-lab-teal transition-colors">{t("nav_home")}</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <Link to="/training-sessions" className="hover:text-lab-teal transition-colors">{t("nav_training")}</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <span className="text-lab-teal">One sec, fetching that for you...</span>
          </nav>
          
          <div className="centered-card-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LoadingSkeleton key={i} type="video" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white dark:via-slate-950 to-lab-teal/5 p-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
            <Link to="/" className="hover:text-lab-teal transition-colors">{t("nav_home")}</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <Link to="/training-sessions" className="hover:text-lab-teal transition-colors">{t("nav_training")}</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <span className="text-lab-teal">Error</span>
          </nav>
          
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-chalkboard font-semibold">Something went a bit wrong on our end</p>
            <p className="text-chalkboard-light text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white dark:via-slate-950 to-lab-teal/5 p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">{t("nav_home")}</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <Link to="/training-sessions" className="hover:text-lab-teal transition-colors">{t("nav_training")}</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <Link to={`/training-sessions/${sessionId}`} className="hover:text-lab-teal transition-colors">{session.title}</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">{category.name}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-answer-green/10 border-2 border-answer-green/30 rounded-sm font-mono-smallcaps text-answer-green text-sm">
              Category
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl text-chalkboard mb-3">{category.name}</h1>
          {category.description && (
            <p className="font-mono-smallcaps text-chalkboard-light text-sm max-w-2xl">{category.description}</p>
          )}
        </div>

        {/* Videos */}
        <h2 className="font-display font-semibold text-2xl text-chalkboard mb-6">Videos</h2>
        {videos.length === 0 ? (
          <EmptyState
            title="No videos yet"
            description="Videos will show up here once they're uploaded."
            variant="excited"
          />
        ) : (
          <div className="centered-card-grid">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
