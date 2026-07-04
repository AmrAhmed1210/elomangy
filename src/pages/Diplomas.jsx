import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Diplomas() {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDiplomas() {
      try {
        const { data, error: diplomasError } = await supabase
          .from("diplomas")
          .select("*")
          .order("order");

        if (diplomasError) throw diplomasError;
        setDiplomas(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDiplomas();
  }, []);

  if (loading) return <LoadingDiplomas />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="transition-colors hover:text-lab-teal">Home</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">Diplomas</span>
        </nav>

        <div className="mb-12">
          <span className="mb-4 inline-block rounded-sm border-2 border-answer-green/30 bg-answer-green/10 px-4 py-2 font-mono-smallcaps text-sm text-answer-green">
            Diploma Programs
          </span>
          <h1 className="mb-4 bg-gradient-to-r from-answer-green via-lab-teal to-lab-teal-light bg-clip-text font-display text-5xl font-bold text-transparent sm:text-6xl">
            Diplomas
          </h1>
          <p className="max-w-2xl font-mono-smallcaps text-base text-chalkboard-light">
            Choose a diploma to open its details page.
          </p>
        </div>

        {diplomas.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-graph-grid bg-white/60 py-16 text-center text-chalkboard-light">
            No diplomas yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {diplomas.map((diploma) => (
              <Link
                key={diploma.id}
                to={`/diplomas/${diploma.slug}`}
                className="rounded-card border border-graph-grid bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-answer-green hover:shadow-lg"
              >
                <h2 className="font-display text-2xl font-bold text-chalkboard">{diploma.name}</h2>
                {diploma.name_ar && <p className="mt-2 text-sm text-chalkboard-light">{diploma.name_ar}</p>}
                <span className="mt-5 inline-flex rounded-card bg-answer-green/10 px-3 py-2 text-sm font-semibold text-answer-green">
                  Details
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingDiplomas() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-4 border-lab-teal" />
        <p className="text-lg text-chalkboard-light">Loading...</p>
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
