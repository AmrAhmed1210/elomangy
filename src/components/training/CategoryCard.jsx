import { Link } from "react-router-dom";

export default function CategoryCard({ category, sessionId }) {
  return (
    <Link
      to={`/training-sessions/${sessionId}/${category.id}`}
      className="group relative bg-gradient-to-br from-white to-specimen-bg border border-graph-grid rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-answer-green/5 to-lab-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Category badge */}
        <div className="inline-block mb-3 px-3 py-1 bg-answer-green/10 border-2 border-answer-green/30 rounded-sm font-mono-smallcaps text-answer-green text-xs">
          Category
        </div>
        
        <h3 className="font-display font-bold text-2xl text-chalkboard mb-3 group-hover:text-answer-green transition-colors group-hover:scale-105 transform origin-left duration-300">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-chalkboard-light font-medium text-lg mb-6 group-hover:text-chalkboard transition-colors line-clamp-2">
            {category.description}
          </p>
        )}
        
        {/* View Details indicator */}
        <div className="flex items-center text-answer-green font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 mt-4">
          <span>View Videos</span>
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
