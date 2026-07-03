import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Card from "../components/common/Card";

export default function Diplomas() {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDiplomas() {
      try {
        const q = query(collection(db, "diplomas"), orderBy("order"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDiplomas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDiplomas();
  }, []);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div><p className="text-chalkboard-light text-lg">Loading...</p></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-periodic-orange text-lg font-medium">Error: {error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2 text-chalkboard-light/50">/</span>
          <span className="text-lab-teal">Diplomas</span>
        </nav>
        
        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-answer-green/10 border-2 border-answer-green/30 rounded-sm font-mono-smallcaps text-answer-green text-sm">
              Diploma Programs
            </span>
          </div>
          <h1 className="font-display font-bold text-6xl text-transparent bg-clip-text bg-gradient-to-r from-answer-green via-lab-teal to-lab-teal-light mb-4">
            Diplomas
          </h1>
          <p className="font-mono-smallcaps text-chalkboard-light text-base max-w-2xl">
            Explore faculty diploma programs and their requirements
          </p>
        </div>

        {diplomas.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50"><div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg></div><p className="text-chalkboard-light text-lg font-medium">No diplomas yet</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diplomas.map((diploma) => (
              <Card
                key={diploma.id}
                to={`/diplomas/${diploma.slug}`}
                title={diploma.name}
                subtitle={diploma.nameAr}
                iconColor="answer-green"
                hoverColor="answer-green"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
