import { Link } from "react-router-dom";
import CardBubbles from "./CardBubbles";

// Shared Card component — one visual language used everywhere on the site
// (Materials years, Dashboard boxes, Diplomas, Training Sessions, Categories):
// a thin gradient top edge, a small colored icon chip, a pill badge, a title,
// a subtitle, playful colored bubbles in the background, and a footer link
// that becomes more visible on hover.
export default function Card({
  to,
  externalLink,
  title,
  subtitle,
  badge,
  icon,
  iconColor = "lab-teal",
  hoverColor = "lab-teal",
  children,
  className = "",
}) {
  const palette = {
    "lab-teal": { from: "from-lab-teal", to: "to-lab-teal-light", text: "text-lab-teal", border: "border-lab-teal/20", bg: "bg-lab-teal/10", raw: "var(--color-lab-teal)" },
    "answer-green": { from: "from-answer-green", to: "to-lab-teal-light", text: "text-answer-green", border: "border-answer-green/20", bg: "bg-answer-green/10", raw: "var(--color-answer-green)" },
    "periodic-orange": { from: "from-periodic-orange", to: "to-periodic-orange-dark", text: "text-periodic-orange", border: "border-periodic-orange/20", bg: "bg-periodic-orange/10", raw: "var(--color-periodic-orange)" },
    "lab-teal-light": { from: "from-lab-teal-light", to: "to-lab-teal", text: "text-lab-teal-light", border: "border-lab-teal-light/20", bg: "bg-lab-teal-light/10", raw: "var(--color-lab-teal-light)" },
    "accent-purple": { from: "from-accent-purple", to: "to-lab-teal-light", text: "text-accent-purple", border: "border-accent-purple/20", bg: "bg-accent-purple/10", raw: "var(--color-accent-purple)" },
    "accent-blue": { from: "from-accent-blue", to: "to-lab-teal-light", text: "text-accent-blue", border: "border-accent-blue/20", bg: "bg-accent-blue/10", raw: "var(--color-accent-blue)" },
  };

  const colors = palette[hoverColor] || palette["lab-teal"];
  const iconColors = palette[iconColor] || colors;
  const isExternal = Boolean(externalLink);
  const linkTarget = externalLink || to;

  const content = (
    <article className="group relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)] group-active:translate-y-0">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors.from} ${colors.to}`} />
      <CardBubbles color={colors.raw} />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
        {badge && (
          <span className={`inline-flex max-w-[calc(100%-3rem)] truncate rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${iconColors.border} ${iconColors.bg} ${iconColors.text}`}>
            {badge}
          </span>
        )}
        {icon && (
          <span className={`ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconColors.border} ${iconColors.bg} ${iconColors.text}`}>
            {icon}
          </span>
        )}
        {isExternal && !badge && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-xs text-slate-500">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            رابط مباشر
          </span>
        )}
      </div>

      <h3 className="font-display text-2xl font-bold leading-tight text-chalkboard transition-colors group-hover:text-[var(--card-hover-color)]">
        {title}
      </h3>

      {subtitle && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-chalkboard-light">{subtitle}</p>
      )}

      {children}

      {linkTarget && (
        <div className={`mt-auto flex items-center gap-2 pt-6 text-sm font-bold ${colors.text}`}>
          <span>{isExternal ? "فتح الرابط" : "عرض التفاصيل"}</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isExternal ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            )}
          </svg>
        </div>
      )}
      </div>
    </article>
  );

  const hoverTextVar = { "--card-hover-color": `var(--color-${hoverColor})` };

  if (isExternal) {
    return (
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        style={hoverTextVar}
        className={`group block h-full rounded-2xl focus-visible:ring-4 focus-visible:ring-lab-teal/20 ${className}`}
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} style={hoverTextVar} className={`group block h-full rounded-2xl focus-visible:ring-4 focus-visible:ring-lab-teal/20 ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <div style={hoverTextVar} className={`h-full ${className}`}>
      {content}
    </div>
  );
}