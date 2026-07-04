import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

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
    <PageLayout>
      <PageHeader
        badge="Diploma Programs"
        badgeColor="answer-green"
        title="Diplomas"
        subtitle="Choose a diploma to open its details page and study materials."
        breadcrumbs={[{ to: "/", label: "Home" }, { label: "Diplomas" }]}
      />

      {diplomas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-graph-grid bg-[var(--surface-card)] py-16 text-center text-chalkboard-light">
          No diplomas yet
        </div>
      ) : (
        <div className="centered-card-grid">
          {diplomas.map((diploma, index) => (
            <Card
              key={diploma.id}
              to={`/diplomas/${diploma.slug}`}
              title={diploma.name}
              subtitle={diploma.name_ar}
              badge="Diploma"
              hoverColor="answer-green"
              className={`stagger-${Math.min(index + 1, 8)}`}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function LoadingDiplomas() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-4 border-lab-teal" />
        <p className="text-lg text-chalkboard-light">Loading...</p>
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium text-periodic-orange">Error: {error}</p>
    </div>
  );
}
