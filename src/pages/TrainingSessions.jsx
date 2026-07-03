import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import SessionCard from "../components/training/SessionCard";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";

export default function TrainingSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const q = query(collection(db, "trainingSessions"), orderBy("order"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
            <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
            <span className="mx-2 text-chalkboard-light/50">/</span>
            <span className="text-lab-teal">Training Sessions</span>
          </nav>
          
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-lab-teal/10 border-2 border-lab-teal/30 rounded-sm font-mono-smallcaps text-lab-teal text-sm">
                Training Sessions
              </span>
            </div>
            <h1 className="font-display font-bold text-6xl text-transparent bg-clip-text bg-gradient-to-r from-lab-teal via-lab-teal-light to-answer-green mb-4">
              Training Sessions
            </h1>
            <p className="font-mono-smallcaps text-chalkboard-light text-base max-w-2xl">
              Browse training sessions and enhance your skills
            </p>
          </div>

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
            <span className="text-lab-teal">Training Sessions</span>
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
          <span className="text-lab-teal">Training Sessions</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-lab-teal/10 border-2 border-lab-teal/30 rounded-sm font-mono-smallcaps text-lab-teal text-sm">
              Training Sessions
            </span>
          </div>
          <h1 className="font-display font-bold text-6xl text-transparent bg-clip-text bg-gradient-to-r from-lab-teal via-lab-teal-light to-answer-green mb-4">
            Training Sessions
          </h1>
          <p className="font-mono-smallcaps text-chalkboard-light text-base max-w-2xl">
            Browse training sessions and enhance your skills
          </p>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            title="No Training Sessions"
            description="Training sessions will appear here once they are added."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
