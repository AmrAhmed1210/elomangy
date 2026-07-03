export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="bg-gradient-to-br from-white to-specimen-bg border border-graph-grid rounded-2xl p-8 shadow-lg">
        <div className="h-6 w-24 bg-graph-grid/30 rounded-sm mb-4 animate-pulse"></div>
        <div className="h-8 w-3/4 bg-graph-grid/30 rounded mb-3 animate-pulse"></div>
        <div className="h-4 w-full bg-graph-grid/20 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-2/3 bg-graph-grid/20 rounded animate-pulse"></div>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="bg-gradient-to-br from-white to-specimen-bg border border-graph-grid rounded-2xl overflow-hidden shadow-lg">
        <div className="aspect-video bg-graph-grid/30 animate-pulse"></div>
        <div className="p-6">
          <div className="h-6 w-3/4 bg-graph-grid/30 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-full bg-graph-grid/20 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-1/2 bg-graph-grid/20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-8 w-full bg-graph-grid/30 rounded animate-pulse"></div>
  );
}
