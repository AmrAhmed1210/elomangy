import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import { useLanguage } from "../contexts/LanguageContext";

export default function TrainingSessions() {
  const { t, localize } = useLanguage();
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
        badge={t("training_badge")}
        title={t("training_title")}
        subtitle={t("training_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_training") }]}
      />

      {sessions.length === 0 ? (
        <EmptyState title={t("training_empty_title")} description={t("training_empty_desc")} />
      ) : (
        <div className="centered-card-grid">
          {sessions.map((session, index) => {
            const videos = videosBySession[session.id] || [];

            return (
              <Card
                key={session.id}
                to={`/training-sessions/${session.id}`}
                title={localize(session, "title", "title_ar")}
                subtitle={localize(session, "description", "description_ar")}
                badge={`${videos.length} ${videos.length === 1 ? t("training_video_one") : t("training_video_many")}`}
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
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium text-periodic-orange">{t("common_error_prefix")}: {error}</p>
    </div>
  );
}
