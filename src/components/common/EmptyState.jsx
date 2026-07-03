export default function EmptyState({ icon, title, description }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50">
      <div className="w-16 h-16 bg-graph-grid/30 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon || (
          <svg className="w-8 h-8 text-chalkboard-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-chalkboard text-lg font-bold mb-2">{title}</h3>
      <p className="text-chalkboard-light">{description}</p>
    </div>
  );
}
