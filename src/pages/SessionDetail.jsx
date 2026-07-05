import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import CategoryCard from "../components/training/CategoryCard";
import VideoCard from "../components/training/VideoCard";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

export default function SessionDetail() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSessionData() {
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

        // Based on mode, fetch either categories or videos
        if (sessionData.mode === 'categories') {
          // Fetch categories for this session
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('training_categories')
            .select('*')
            .eq('session_id', sessionId)
            .order('order');
          
          if (categoriesError) throw categoriesError;
          setCategories(categoriesData || []);
        } else {
          // Fetch videos for this session (no category)
          const { data: videosData, error: videosError } = await supabase
            .from('training_videos')
            .select('*')
            .eq('session_id', sessionId)
            .is('category_id', null)
            .order('order');
          
          if (videosError) throw videosError;
          setVideos(videosData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSessionData();
  }, [sessionId]);

  if (loading) {
    return (
      <PageLayout>
        <div className="centered-card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
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
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        badge={session.mode === "categories" ? "Categories" : "Videos"}
        badgeColor={session.mode === "categories" ? "answer-green" : "lab-teal"}
        title={session.title}
        subtitle={session.description || "Choose a video to watch it at its original source."}
        breadcrumbs={[
          { to: "/", label: "Home" },
          { to: "/training-sessions", label: "Training Sessions" },
          { label: session.title },
        ]}
      />

        {/* Mode: Categories */}
        {session.mode === 'categories' && (
          <>
            <h2 className="mb-6 text-center font-display text-2xl font-bold text-chalkboard">Categories</h2>
            {categories.length === 0 ? (
              <EmptyState
                title="Nothing here yet"
                description="We're still preparing these categories — check back soon."
                variant="excited"
              />
            ) : (
              <div className="centered-card-grid">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} sessionId={sessionId} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Mode: Videos */}
        {session.mode === 'videos' && (
          <>
            <h2 className="mb-6 text-center font-display text-2xl font-bold text-chalkboard">Videos</h2>
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
          </>
        )}
    </PageLayout>
  );
}
