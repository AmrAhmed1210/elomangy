import { Link } from "react-router-dom";

export default function PageHeader({ badge, badgeColor = "lab-teal", title, subtitle, breadcrumbs = [] }) {
  const badgeColors = {
    "lab-teal": "bg-lab-teal/10 border-lab-teal/30 text-lab-teal",
    "answer-green": "bg-answer-green/10 border-answer-green/30 text-answer-green",
    "periodic-orange": "bg-periodic-orange/10 border-periodic-orange/30 text-periodic-orange",
  };

  const gradientColors = {
    "lab-teal": "from-lab-teal via-lab-teal-light to-answer-green",
    "answer-green": "from-answer-green via-lab-teal to-lab-teal-light",
    "periodic-orange": "from-periodic-orange via-lab-teal to-answer-green",
  };

  return (
    <>
      {breadcrumbs.length > 0 && (
        <nav className="mb-6 text-sm font-mono-smallcaps text-chalkboard-light" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-2 text-chalkboard-light/50">/</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-lab-teal transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-lab-teal">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="mb-12 sm:mb-16">
        {badge && (
          <div className="inline-block mb-4">
            <span className={`px-4 py-2 border-2 rounded-sm font-mono-smallcaps text-sm ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          </div>
        )}
        <h1 className={`font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r ${gradientColors[badgeColor]} mb-4 leading-tight`}>
          {title}
        </h1>
        {subtitle && (
          <p className="font-mono-smallcaps text-chalkboard-light text-base max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </>
  );
}
