import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import SearchOverlay from "./common/SearchOverlay";

const NAV_LINKS = [
  { to: "/", label: "Home", match: (p) => p === "/" },
  { to: "/materials", label: "Materials", match: (p) => p === "/materials" || p.startsWith("/materials/") },
  { to: "/training-sessions", label: "Training", match: (p) => p === "/training-sessions" || p.startsWith("/training-sessions/") },
  { to: "/diplomas", label: "Diplomas", match: (p) => p === "/diplomas" || p.startsWith("/diplomas/") },
  { to: "/about", label: "About", match: (p) => p === "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (active) =>
    active
      ? "text-lab-teal font-semibold"
      : "text-chalkboard-light hover:text-lab-teal";

  return (
    <>
      <nav className="bg-white/85 backdrop-blur-xl border-b border-graph-grid/80 sticky top-0 z-50 shadow-sm shadow-lab-teal/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              to="/"
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lab-teal to-lab-teal-dark font-display hover:opacity-90 transition-opacity shrink-0"
            >
              3loomangy
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, match }) => {
                const active = match(location.pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-lab-teal/5 ${linkClass(active)}`}
                  >
                    {label}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-lab-teal rounded-full" />
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="ml-2 p-2.5 rounded-xl hover:bg-lab-teal/10 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-lab-teal/10 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-lab-teal/10 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg className="w-6 h-6 text-chalkboard" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="md:hidden pb-4 border-t border-graph-grid/50 mt-1 pt-3 animate-fade-in">
              {NAV_LINKS.map(({ to, label, match }) => {
                const active = match(location.pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? "bg-lab-teal/10 text-lab-teal" : "text-chalkboard-light hover:bg-gray-50"}`}
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
