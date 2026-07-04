import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchOverlay from "./common/SearchOverlay";

const NAV_LINKS = [
  { to: "/", label: "Home", match: (p) => p === "/" },
  { to: "/materials", label: "Materials", match: (p) => p === "/materials" || p.startsWith("/materials/") },
  { to: "/training-sessions", label: "Training", match: (p) => p === "/training-sessions" || p.startsWith("/training-sessions/") },
  { to: "/diplomas", label: "Diplomas", match: (p) => p === "/diplomas" || p.startsWith("/diplomas/") },
  { to: "/team", label: "Team", match: (p) => p === "/team" },
  { to: "/join-us", label: "Join Us", match: (p) => p === "/join-us" },
  { to: "/about", label: "About", match: (p) => p === "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for global Ctrl+K event from SearchOverlay
  useEffect(() => {
    function handleOpenSearch() {
      setIsSearchOpen(true);
    }
    window.addEventListener("open-search", handleOpenSearch);
    return () => window.removeEventListener("open-search", handleOpenSearch);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-xl border-b border-graph-grid/60 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lab-teal to-lab-teal-dark font-display hover:opacity-90 transition-opacity shrink-0"
            >
              3loomangy
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ to, label, match }) => {
                const active = match(location.pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                      active
                        ? "text-lab-teal bg-lab-teal/5"
                        : "text-chalkboard-light hover:text-chalkboard hover:bg-slate-50"
                    }`}
                  >
                    {label}
                    {active && (
                      <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-lab-teal to-lab-teal-light rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Search button with Ctrl+K hint */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-graph-grid/80 bg-white hover:border-lab-teal/40 hover:bg-lab-teal/5 transition-all group"
                aria-label="Search"
              >
                <svg className="w-4 h-4 text-chalkboard-light group-hover:text-lab-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden lg:inline text-[10px] font-mono text-chalkboard-light/50 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-lg hover:bg-lab-teal/10 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2.5 rounded-lg hover:bg-lab-teal/10 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg className="w-5 h-5 text-chalkboard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4 border-t border-graph-grid/40 mt-1 pt-3 animate-slide-down">
              {NAV_LINKS.map(({ to, label, match }) => {
                const active = match(location.pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-lab-teal/10 text-lab-teal"
                        : "text-chalkboard-light hover:bg-slate-50 hover:text-chalkboard"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
