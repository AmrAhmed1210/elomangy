import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { supabase } from "../../lib/supabase";

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState({ tracks: [], courses: [], diplomas: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && allData.tracks.length === 0) {
      setLoading(true);
      // Fetch all searchable data from Supabase
      Promise.all([
        supabase.from('tracks').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('diplomas').select('*'),
      ])
        .then(([tracksRes, coursesRes, diplomasRes]) => {
          setAllData({
            tracks: tracksRes.data || [],
            courses: coursesRes.data || [],
            diplomas: diplomasRes.data || [],
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, allData.tracks.length]);

  useEffect(() => {
    if (!query || loading) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(
      [...allData.tracks, ...allData.courses, ...allData.diplomas],
      {
        keys: ["name", "nameAr", "code", "title"],
        threshold: 0.3,
        includeScore: true,
      }
    );

    const searchResults = fuse.search(query).slice(0, 10);
    setResults(searchResults.map((r) => r.item));
  }, [query, allData, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="p-4 border-b border-graph-grid">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, tracks, diplomas..."
              className="flex-1 text-lg outline-none text-chalkboard placeholder-chalkboard-light"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-chalkboard-light hover:text-chalkboard transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-chalkboard-light">Loading...</div>
          ) : query && results.length === 0 ? (
            <div className="p-8 text-center text-chalkboard-light">No results found</div>
          ) : !query ? (
            <div className="p-8 text-center text-chalkboard-light">Type to search...</div>
          ) : (
            <div className="divide-y divide-graph-grid">
              {results.map((item) => {
                let to, type, label;
                if (item.code) {
                  // Course
                  to = `/materials/course/${item.id}`;
                  type = "Course";
                  label = item.code;
                } else if (item.slug && item.name) {
                  // Track
                  to = `/materials/year/2/${item.slug}`;
                  type = "Track";
                  label = item.name;
                } else if (item.slug && item.title) {
                  // Diploma
                  to = `/diplomas/${item.slug}`;
                  type = "Diploma";
                  label = item.title;
                }

                return (
                  <Link
                    key={item.id}
                    to={to}
                    onClick={onClose}
                    className="block p-4 hover:bg-lab-teal/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-lab-teal uppercase">{type}</span>
                        <p className="font-medium text-chalkboard">{label}</p>
                        {item.nameAr && <p className="text-sm text-chalkboard-light" dir="rtl">{item.nameAr}</p>}
                      </div>
                      <svg className="w-5 h-5 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
