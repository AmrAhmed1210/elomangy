const TYPE_CONFIG = {
  drive_folder: { label: "Drive Folder", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", color: "accent-blue" },
  drive_file: { label: "Drive File", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "accent-blue" },
  pdf: { label: "PDF", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z", color: "periodic-orange" },
  external_link: { label: "External Link", icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14", color: "answer-green" },
  video: { label: "Video", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "accent-purple" },
};

const COLOR_MAP = {
  "accent-blue": { bg: "bg-accent-blue/10", text: "text-accent-blue", border: "border-accent-blue/20", ring: "hover:ring-accent-blue/20" },
  "periodic-orange": { bg: "bg-periodic-orange/10", text: "text-periodic-orange", border: "border-periodic-orange/20", ring: "hover:ring-periodic-orange/20" },
  "answer-green": { bg: "bg-answer-green/10", text: "text-answer-green", border: "border-answer-green/20", ring: "hover:ring-answer-green/20" },
  "accent-purple": { bg: "bg-accent-purple/10", text: "text-accent-purple", border: "border-accent-purple/20", ring: "hover:ring-accent-purple/20" },
};

export default function ResourceLinkList({ links }) {
  if (!links || links.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-graph-grid bg-[var(--surface-card)] px-5 py-14 text-center backdrop-blur-sm">
        <div className="w-14 h-14 bg-graph-grid/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-chalkboard-light font-medium text-lg">No materials yet</p>
        <p className="text-sm text-chalkboard-light/70 mt-2">Check back later or contact the team</p>
      </div>
    );
  }

  return (
    <div className="centered-card-grid">
      {links.map((link, i) => {
        const typeInfo = TYPE_CONFIG[link.type] || TYPE_CONFIG.external_link;
        const colors = COLOR_MAP[typeInfo.color] || COLOR_MAP["answer-green"];

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`stagger-${Math.min(i + 1, 8)} group relative block min-h-[136px] rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] active:translate-y-0 overflow-hidden ring-1 ring-transparent focus-visible:ring-4 focus-visible:ring-lab-teal/20 ${colors.ring}`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${colors.bg}`} />
            <div className="flex items-start gap-3.5">
              <div className={`shrink-0 w-11 h-11 ${colors.bg} ${colors.border} border rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeInfo.icon} />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-chalkboard group-hover:text-lab-teal transition-colors text-sm sm:text-base line-clamp-2">{link.label}</h3>
                <span className={`inline-block mt-2 px-2.5 py-1 ${colors.bg} ${colors.text} text-xs font-bold rounded-full`}>
                  {typeInfo.label}
                </span>
              </div>

              <div className="shrink-0 w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-lab-teal transition-colors">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
