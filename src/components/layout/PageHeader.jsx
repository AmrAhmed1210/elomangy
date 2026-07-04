import { Link } from "react-router-dom";

export default function PageHeader({ badge, badgeColor = "lab-teal", title, subtitle, breadcrumbs = [] }) {
  const badgeColors = {
    "lab-teal": "bg-lab-teal/10 border-lab-teal/20 text-lab-teal",
    "answer-green": "bg-answer-green/10 border-answer-green/20 text-answer-green",
    "periodic-orange": "bg-periodic-orange/10 border-periodic-orange/20 text-periodic-orange",
    "accent-purple": "bg-accent-purple/10 border-accent-purple/20 text-accent-purple",
  };

  const gradientColors = {
    "lab-teal": "from-lab-teal via-lab-teal-light to-answer-green",
    "answer-green": "from-answer-green via-lab-teal to-lab-teal-light",
    "periodic-orange": "from-periodic-orange via-lab-teal to-answer-green",
    "accent-purple": "from-accent-purple via-lab-teal to-answer-green",
  };

  return (
    <>
      {breadcrumbs.length > 0 && (
        <nav className="mb-5 flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-chalkboard-light" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="mx-2 text-chalkboard-light/40">/</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="rounded-md px-1 py-1 hover:text-lab-teal focus-visible:ring-2 focus-visible:ring-lab-teal/20 transition-colors">{crumb.label}</Link>
              ) : (
                <span className="rounded-md px-1 py-1 text-lab-teal">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
        {badge && (
          <div className="inline-block mb-4">
            <span className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide sm:px-4 ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          </div>
        )}
        <h1 className={`font-display font-bold text-3xl leading-[1.08] sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r ${gradientColors[badgeColor]} mb-4`}>
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto max-w-2xl text-base leading-7 text-chalkboard-light sm:text-lg">
            {subtitle}
          </p>
        )}
      </header>
    </>
  );
}