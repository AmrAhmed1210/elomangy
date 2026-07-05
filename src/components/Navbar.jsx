import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchOverlay from "./common/SearchOverlay";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const NAV_LINKS = [
  { to: "/", labelKey: "nav_home", match: (p) => p === "/" },
  { to: "/materials", labelKey: "nav_materials", match: (p) => p === "/materials" || p.startsWith("/materials/") },
  { to: "/training-sessions", labelKey: "nav_training", match: (p) => p === "/training-sessions" || p.startsWith("/training-sessions/") },
  { to: "/diplomas", labelKey: "nav_diplomas", match: (p) => p === "/diplomas" || p.startsWith("/diplomas/") },
  { to: "/team", labelKey: "nav_team", match: (p) => p === "/team" },
  { to: "/join-us", labelKey: "nav_join_us", match: (p) => p === "/join-us" },
  { to: "/chatbot", labelKey: "nav_chatbot", match: (p) => p === "/chatbot" },
  { to: "/about", labelKey: "nav_about", match: (p) => p === "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

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
      <nav className="sticky top-0 z-40 border-b border-[var(--surface-border)] bg-[var(--surface-nav)] shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_14px_50px_rgba(0,0,0,0.38)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-3">
            {/* Logo */}
            <Link to="/" className="group flex shrink-0 items-center gap-2">
              <img
                src="/logo-mark.png"
                alt="3loomangy"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lab-teal to-lab-teal-dark font-display group-hover:opacity-90 transition-opacity">
                3loomangy
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 rounded-2xl border border-[var(--surface-border)] bg-white/55 p-1 shadow-sm dark:bg-slate-950/35">
              {NAV_LINKS.map(({ to, labelKey, match }) => {
                const active = match(location.pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-3.5 py-2 text-sm font-bold transition-all duration-200 rounded-xl ${
                      active
                        ? "text-lab-teal bg-lab-teal/10 shadow-sm"
                        : "text-chalkboard-light hover:text-chalkboard hover:bg-white/70 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    {t(labelKey)}
                    {active && (
                      <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-lab-teal to-lab-teal-light rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* Language switcher */}
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="ms-2 flex min-h-10 items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] px-3 py-1.5 shadow-sm transition-all hover:border-lab-teal/40 hover:bg-lab-teal/5 dark:hover:bg-lab-teal/10 group press-squish"
                aria-label="Switch language"
              >
                <span className="text-sm font-medium text-chalkboard-light dark:text-slate-300 group-hover:text-lab-teal transition-colors">
                  {language === "en" ? "العربية" : "English"}
                </span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="ms-1 flex min-h-10 items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] px-3 py-1.5 shadow-sm transition-all hover:border-lab-teal/40 hover:bg-lab-teal/5 dark:hover:bg-lab-teal/10 group press-squish"
                aria-label="Toggle theme"
              >
                <span className="icon-flip" data-flipped={isDark}>
                  {isDark ? (
                    <svg className="w-4 h-4 text-chalkboard-light dark:text-slate-300 group-hover:text-lab-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-chalkboard-light dark:text-slate-300 group-hover:text-lab-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Search button with Ctrl+K hint */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="ms-1 flex min-h-10 items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] px-3 py-1.5 shadow-sm transition-all hover:border-lab-teal/40 hover:bg-lab-teal/5 dark:hover:bg-lab-teal/10 group press-squish"
                aria-label="Search"
              >
                <svg className="w-4 h-4 text-chalkboard-light dark:text-slate-300 group-hover:text-lab-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <kbd className="hidden lg:inline text-[10px] font-mono text-chalkboard-light/50 dark:text-slate-400/50 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-lab-teal/10 transition-colors press-squish"
                aria-label="Switch language"
              >
                <span className="text-sm font-medium text-chalkboard-light dark:text-slate-300">
                  {language === "en" ? "ع" : "En"}
                </span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-lab-teal/10 transition-colors press-squish"
                aria-label="Toggle theme"
              >
                <span className="icon-flip" data-flipped={isDark}>
                  {isDark ? (
                    <svg className="w-5 h-5 text-chalkboard-light dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-chalkboard-light dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </span>
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-lab-teal/10 transition-colors press-squish"
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-chalkboard-light dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-lab-teal/10 transition-colors press-squish"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg className="w-5 h-5 text-chalkboard dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {NAV_LINKS.map(({ to, labelKey, match }) => {
                const active = match(location.pathname);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-lab-teal/10 text-lab-teal"
                        : "text-chalkboard-light hover:bg-white/70 hover:text-chalkboard dark:hover:bg-slate-800/70"
                    }`}
                  >
                    {t(labelKey)}
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