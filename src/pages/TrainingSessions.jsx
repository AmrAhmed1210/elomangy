import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

export default function TrainingSessions() {
  const [sessions, setSessions] = useState([]);
  const [videosBySession, setVideosBySession] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data, error: sessionsError } = await supabase
          .from("training_sessions")
          .select("*")
          .order("order");

        if (sessionsError) throw sessionsError;
        setSessions(data || []);

        const ids = (data || []).map((session) => session.id);
        if (ids.length > 0) {
          const { data: videos, error: videosError } = await supabase
            .from("training_videos")
            .select("*")
            .in("session_id", ids)
            .order("order");

          if (videosError) throw videosError;
          setVideosBySession(groupBySession(videos || []));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  if (loading) return <TrainingLoading />;
  if (error) return <ErrorState error={error} />;

  return (
    <PageLayout>
      <PageHeader
        badge="Training Sessions"
        title="Training Sessions"
        subtitle="Choose a training box to open its videos. Each video opens from its original source."
        breadcrumbs={[{ to: "/", label: "Home" }, { label: "Training Sessions" }]}
      />

      {sessions.length === 0 ? (
        <EmptyState title="No Training Sessions" description="Training sessions will appear here once they are added." />
      ) : (
        <div className="centered-card-grid">
          {sessions.map((session, index) => {
            const videos = videosBySession[session.id] || [];

            return (
              <Card
                key={session.id}
                to={`/training-sessions/${session.id}`}
                title={session.title}
                subtitle={session.description}
                badge={`${videos.length} ${videos.length === 1 ? "video" : "videos"}`}
                hoverColor="lab-teal"
                className={`stagger-${Math.min(index + 1, 8)}`}
              />
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

function groupBySession(videos) {
  return videos.reduce((groups, video) => {
    groups[video.session_id] = [...(groups[video.session_id] || []), video];
    return groups;
  }, {});
}

function TrainingLoading() {
  return (
    <PageLayout>
      <div className="mx-auto mb-12 h-40 max-w-2xl rounded-card bg-white/40" />
      <div className="centered-card-grid">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} type="card" />
        ))}
      </div>
    </PageLayout>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium text-periodic-orange">Error: {error}</p>
    </div>
  );
}
