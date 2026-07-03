import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import CategoryCard from "../components/training/CategoryCard";
import VideoCard from "../components/training/VideoCard";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";

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
        const sessionDoc = await getDoc(doc(db, "trainingSessions", sessionId));
        if (!sessionDoc.exists()) {
          setError("Session not found");
          setLoading(false);
          return;
        }
        
        const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };
        setSession(sessionData);

        // Based on mode, fetch either categories or videos
        if (sessionData.mode === 'categories') {
          // Fetch categories for this session
          const categoriesQuery = query(
            collection(db, "trainingCategories"),
            where("sessionId", "==", sessionId),
            orderBy("order")
          );
          const categoriesSnapshot = await getDocs(categoriesQuery);
          const categoriesData = categoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData);
        } else {
          // Fetch videos for this session (no category)
          const videosQuery = query(
            collection(db, "trainingVideos"),
            where("sessionId", "==", sessionId),
            where("categoryId", "==", null),
            orderBy("order")
          );
          const videosSnapshot = await getDocs(videosQuery);
          const videosData = videosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setVideos(videosData);
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
      <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
            <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <Link to="/training-sessions" className="hover:text-lab-teal transition-colors">Training Sessions</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <span className="text-lab-teal">Loading...</span>
          </nav>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LoadingSkeleton key={i} type="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
            <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <Link to="/training-sessions" className="hover:text-lab-teal transition-colors">Training Sessions</Link>
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
              <p className="text-periodic-orange text-lg font-medium">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <Link to="/training-sessions" className="hover:text-lab-teal transition-colors">Training Sessions</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">{session.title}</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block mb-4">
            <span className={`px-4 py-2 ${session.mode === 'categories' ? 'bg-answer-green/10 border-answer-green/30 text-answer-green' : 'bg-lab-teal/10 border-lab-teal/30 text-lab-teal'} border-2 rounded-sm font-mono-smallcaps text-sm`}>
              {session.mode === 'categories' ? 'Categorized Session' : 'Direct Videos'}
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl text-chalkboard mb-3">{session.title}</h1>
          {session.description && (
            <p className="font-mono-smallcaps text-chalkboard-light text-sm max-w-2xl">{session.description}</p>
          )}
        </div>

        {/* Mode: Categories */}
        {session.mode === 'categories' && (
          <>
            <h2 className="font-display font-semibold text-2xl text-chalkboard mb-6">Categories</h2>
            {categories.length === 0 ? (
              <EmptyState
                title="No Categories"
                description="Categories will appear here once they are added."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <h2 className="font-display font-semibold text-2xl text-chalkboard mb-6">Videos</h2>
            {videos.length === 0 ? (
              <EmptyState
                title="No Videos"
                description="Videos will appear here once they are added."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
