export default function ResourceLinkList({ links }) {
  if (!links || links.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50">
        <div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-chalkboard-light text-lg font-medium">No materials yet</p>
        <p className="text-sm text-chalkboard-light mt-2">Check back later or contact the team</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white border border-graph-grid rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-lab-teal/50 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-chalkboard group-hover:text-lab-teal transition-colors duration-200">{link.label}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-lab-teal/10 text-lab-teal text-xs font-mono rounded-md capitalize">{link.type}</span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <div className="w-10 h-10 bg-lab-teal/10 rounded-lg flex items-center justify-center group-hover:bg-lab-teal group-hover:text-white transition-all duration-300">
                <svg className="w-5 h-5 text-lab-teal group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
