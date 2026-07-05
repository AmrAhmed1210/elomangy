import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { supabase } from "../../lib/supabase";

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState({ tracks: [], courses: [], semesters: [], diplomas: [], sessions: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // The parent component handles opening, but we can trigger it via a custom event
          window.dispatchEvent(new CustomEvent("open-search"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      if (allData.tracks.length === 0) {
        setLoading(true);
        Promise.all([
          supabase.from('tracks').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('semesters').select('*'),
          supabase.from('diplomas').select('*'),
          supabase.from('training_sessions').select('*'),
        ])
          .then(([tracksRes, coursesRes, semestersRes, diplomasRes, sessionsRes]) => {
            setAllData({
              tracks: tracksRes.data || [],
              courses: coursesRes.data || [],
              semesters: semestersRes.data || [],
              diplomas: diplomasRes.data || [],
              sessions: sessionsRes.data || [],
            });
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, allData.tracks.length]);

  useEffect(() => {
    if (!query || loading) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    // Tag each item with its type for display
    const taggedItems = [
      ...allData.courses.map(c => ({ ...c, _type: "course", _label: c.name, _sub: c.code, _to: c.link || `/materials/course/${c.id}`, _isExternal: Boolean(c.link) })),
      ...allData.tracks.map(t => ({ ...t, _type: "department", _label: t.name, _sub: t.name_ar, _to: `/materials/year/2/${t.slug}` })),
      ...allData.semesters.map(s => ({ ...s, _type: "semester", _label: s.label, _sub: null, _to: s.link || null, _isExternal: Boolean(s.link) })),
      ...allData.diplomas.map(d => ({ ...d, _type: "diploma", _label: d.name, _sub: d.name_ar, _to: `/diplomas/${d.slug}` })),
      ...allData.sessions.map(s => ({ ...s, _type: "training", _label: s.title, _sub: s.description, _to: `/training-sessions/${s.id}` })),
    ];

    const fuse = new Fuse(taggedItems, {
      keys: ["_label", "_sub", "code", "name", "label", "title", "name_ar"],
      threshold: 0.35,
      includeScore: true,
    });

    const searchResults = fuse.search(query).slice(0, 12);
    setResults(searchResults.map((r) => r.item));
    setSelectedIndex(0);
  }, [query, allData, loading]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      const item = results[selectedIndex];
      if (item._to) {
        if (item._isExternal) {
          window.open(item._to, "_blank", "noopener,noreferrer");
        } else {
          navigate(item._to);
        }
        onClose();
      }
    }
  }, [results, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  const TYPE_COLORS = {
    course: "bg-lab-teal/10 text-lab-teal",
    department: "bg-periodic-orange/10 text-periodic-orange",
    semester: "bg-accent-blue/10 text-accent-blue",
    diploma: "bg-answer-green/10 text-answer-green",
    training: "bg-accent-purple/10 text-accent-purple",
  };

  const TYPE_LABELS = {
    course: "Course",
    department: "Department",
    semester: "Semester",
    diploma: "Diploma",
    training: "Training",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-4 sm:pt-[12vh] animate-fade-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-chalkboard/45 backdrop-blur-md" />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] shadow-2xl backdrop-blur-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search 3loomangy"
      >
        {/* Search input */}
        <div className="border-b border-graph-grid/60 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-lab-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search courses, departments, diplomas, training..."
              className="min-h-11 flex-1 bg-transparent text-base text-chalkboard outline-none placeholder-chalkboard-light/60"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-mono rounded-md border border-slate-200">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[68vh] overflow-y-auto sm:max-h-[52vh]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-lab-teal mb-2" />
              <p className="text-chalkboard-light text-sm">Getting things ready...</p>
            </div>
          ) : query && results.length === 0 ? (
            <div className="p-8 text-center">
              <img
                src="/logo-mark.png"
                alt=""
                className="mx-auto mb-3 h-14 w-14 object-contain -rotate-6 opacity-80 grayscale-[35%]"
              />
              <p className="text-chalkboard-light font-medium">We didn't catch anything on that one</p>
              <p className="text-chalkboard-light/60 text-sm mt-1">Try a different word, or check the spelling</p>
            </div>
          ) : !query ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-chalkboard">Find anything fast</p>
              <p className="mt-1 text-sm text-chalkboard-light/70">Type a course, department, diploma, or training title.</p>
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <span key={key} className={`px-2.5 py-1 ${TYPE_COLORS[key]} text-xs font-bold rounded-full`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-1.5 p-2">
              {results.map((item, index) => {
                const typeColor = TYPE_COLORS[item._type] || "bg-slate-100 text-slate-600";
                const typeLabel = TYPE_LABELS[item._type] || item._type;

                const content = (
                  <div className={`rounded-2xl px-3 py-3 flex items-center gap-3 transition-all cursor-pointer ${
                    index === selectedIndex ? "bg-lab-teal/10 ring-1 ring-lab-teal/20" : "hover:bg-slate-50"
                  }`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${typeColor}`}>
                      <span className="text-xs font-black">{typeLabel.slice(0, 1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-2 py-0.5 ${typeColor} text-[10px] font-bold uppercase tracking-wider rounded-full`}>
                          {typeLabel}
                        </span>
                        {item._isExternal && (
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </div>
                      <p className="font-semibold text-chalkboard text-sm truncate">{item._label}</p>
                      {item._sub && <p className="text-xs text-chalkboard-light truncate mt-0.5">{item._sub}</p>}
                    </div>
                    <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );

                if (item._isExternal && item._to) {
                  return (
                    <a key={item.id} href={item._to} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                      {content}
                    </a>
                  );
                }

                if (item._to) {
                  return (
                    <Link key={item.id} to={item._to} onClick={onClose}>
                      {content}
                    </Link>
                  );
                }

                return <div key={item.id}>{content}</div>;
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="hidden sm:flex px-4 py-2.5 border-t border-graph-grid/60 items-center gap-3 text-xs text-chalkboard-light/60">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Up/Down</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> Open</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Esc</kbd> Close</span>
          </div>
        )}
      </div>
    </div>
  );
}
