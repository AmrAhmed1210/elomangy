import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import ResourceLinkList from "../components/ResourceLinkList";

export default function DiplomaDetail() {
  const { slug } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch diploma by slug
        const diplomaQuery = query(collection(db, "diplomas"), where("slug", "==", slug));
        const diplomaSnapshot = await getDocs(diplomaQuery);
        if (diplomaSnapshot.empty) {
          setError("Diploma not found");
          setLoading(false);
          return;
        }
        const diplomaData = diplomaSnapshot.docs[0];
        const diplomaObj = { id: diplomaData.id, ...diplomaData.data() };
        setDiploma(diplomaObj);

        // Fetch resource links for this diploma
        const linksQuery = query(
          collection(db, "resourceLinks"),
          where("parentType", "==", "diploma"),
          where("parentId", "==", diplomaObj.id),
          orderBy("order")
        );
        const linksSnapshot = await getDocs(linksQuery);
        const linksData = linksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResourceLinks(linksData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-lab-teal mb-4"></div><p className="text-chalkboard-light text-lg">Loading...</p></div></div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 bg-periodic-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-periodic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-periodic-orange text-lg font-medium">Error: {error}</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-specimen-bg via-white to-lab-teal/5 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm text-chalkboard-light">
          <Link to="/" className="hover:text-lab-teal transition-colors">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/diplomas" className="hover:text-lab-teal transition-colors">Diplomas</Link>
          <span className="mx-2">&gt;</span>
          <span>{diploma.name}</span>
        </nav>
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-chalkboard mb-2 font-display">{diploma.name}</h1>
          <p className="text-2xl text-chalkboard-light font-medium mb-6" dir="rtl">{diploma.nameAr}</p>
          <div className="bg-white border border-graph-grid rounded-2xl p-6 shadow-sm mb-6">
            <p className="text-chalkboard leading-relaxed text-lg">{diploma.description}</p>
          </div>
          {diploma.eligibility && (
            <div className="bg-white border border-graph-grid rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-chalkboard mb-3">Eligibility</h2>
              <p className="text-chalkboard leading-relaxed">{diploma.eligibility}</p>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-chalkboard mb-6">Resources</h2>
        <ResourceLinkList links={resourceLinks} />
      </div>
    </div>
  );
}
