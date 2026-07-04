import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";

export default function TrainingSessions() {
  const [sessions, setSessions] = useState([]);
  const [videosBySession, setVideosBySession] = useState({});
  const [openId, setOpenId] = useState("");
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
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="transition-colors hover:text-lab-teal">Home</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">Training Sessions</span>
        </nav>

        <div className="mb-12">
          <span className="mb-4 inline-block rounded-sm border-2 border-lab-teal/30 bg-lab-teal/10 px-4 py-2 font-mono-smallcaps text-sm text-lab-teal">
            Training Sessions
          </span>
          <h1 className="mb-4 bg-gradient-to-r from-lab-teal via-lab-teal-light to-answer-green bg-clip-text font-display text-5xl font-bold text-transparent sm:text-6xl">
            Training Sessions
          </h1>
          <p className="max-w-2xl font-mono-smallcaps text-base text-chalkboard-light">
            Click a training title to show its videos. Videos open at their original source.
          </p>
        </div>

        {sessions.length === 0 ? (
          <EmptyState title="No Training Sessions" description="Training sessions will appear here once they are added." />
        ) : (
          <div className="grid gap-5">
            {sessions.map((session) => {
              const open = openId === session.id;
              const videos = videosBySession[session.id] || [];

              return (
                <article key={session.id} className="rounded-card border border-graph-grid bg-white/90 p-5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? "" : session.id)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <h2 className="font-display text-2xl font-bold text-chalkboard">{session.title}</h2>
                      {session.description && <p className="mt-1 text-sm leading-6 text-chalkboard-light">{session.description}</p>}
                    </div>
                    <span className="rounded-card bg-lab-teal/10 px-3 py-2 text-sm font-semibold text-lab-teal">
                      {open ? "Hide" : `${videos.length} videos`}
                    </span>
                  </button>

                  {open && (
                    <div className="mt-5 grid gap-3 border-t border-graph-grid pt-5 md:grid-cols-2">
                      {videos.length === 0 ? (
                        <p className="text-sm text-chalkboard-light">No videos added yet.</p>
                      ) : (
                        videos.map((video) => (
                          <a
                            key={video.id}
                            href={video.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-card border border-lab-teal/20 bg-lab-teal/5 p-4 transition hover:border-lab-teal hover:bg-lab-teal/10"
                          >
                            <span className="text-xs font-semibold uppercase text-lab-teal">Video</span>
                            <p className="mt-2 font-display text-lg font-semibold text-chalkboard">{video.title}</p>
                            {video.duration && <p className="mt-1 text-sm text-chalkboard-light">{video.duration}</p>}
                          </a>
                        ))
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 h-40 max-w-2xl rounded-card bg-white/40" />
        <div className="grid gap-5">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5">
      <p className="text-lg font-medium text-periodic-orange">Error: {error}</p>
    </div>
  );
}
