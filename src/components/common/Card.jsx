import { Link } from "react-router-dom";

// Shared Card component for consistent styling across Materials and Diplomas
// Used by: YearCard, TrackCard, SemesterCard, CourseCard, DiplomaCard
export default function Card({ 
  to, 
  title, 
  subtitle, 
  badge, 
  icon, 
  iconColor = "lab-teal",
  hoverColor = "lab-teal",
  children,
  className = ""
}) {
  const colorClasses = {
    "lab-teal": {
      bg: "from-lab-teal to-lab-teal-dark",
      bgLight: "from-lab-teal/5 to-lab-teal/10",
      text: "text-lab-teal",
      border: "border-lab-teal/30",
      tagBg: "bg-lab-teal/10",
      tagText: "text-lab-teal",
      glow: "hover:shadow-lab-teal/20"
    },
    "answer-green": {
      bg: "from-answer-green to-answer-green/80",
      bgLight: "from-answer-green/5 to-answer-green/10",
      text: "text-answer-green",
      border: "border-answer-green/30",
      tagBg: "bg-answer-green/10",
      tagText: "text-answer-green",
      glow: "hover:shadow-answer-green/20"
    },
    "periodic-orange": {
      bg: "from-periodic-orange to-periodic-orange-dark",
      bgLight: "from-periodic-orange/5 to-periodic-orange/10",
      text: "text-periodic-orange",
      border: "border-periodic-orange/30",
      tagBg: "bg-periodic-orange/10",
      tagText: "text-periodic-orange",
      glow: "hover:shadow-periodic-orange/20"
    },
    "lab-teal-light": {
      bg: "from-lab-teal-light to-lab-teal",
      bgLight: "from-lab-teal-light/5 to-lab-teal-light/10",
      text: "text-lab-teal-light",
      border: "border-lab-teal-light/30",
      tagBg: "bg-lab-teal-light/10",
      tagText: "text-lab-teal-light",
      glow: "hover:shadow-lab-teal-light/20"
    }
  };

  const colors = colorClasses[hoverColor] || colorClasses["lab-teal"];

  const cardContent = (
    <div className="group relative bg-gradient-to-br from-white to-specimen-bg border border-graph-grid rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
      {/* Specimen tag-style icon */}
      {icon && (
        <div className={`absolute top-4 right-4 ${colors.tagBg} ${colors.border} border-2 rounded-sm px-3 py-1.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <div className={`w-6 h-6 ${colors.tagText}`}>{icon}</div>
        </div>
      )}
      
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
      
      <div className="relative z-10">
        {badge && (
          <div className={`inline-block mb-3 px-2 py-1 ${colors.tagBg} ${colors.tagText} text-xs font-mono font-mono-smallcaps border ${colors.border} rounded-sm`}>
            {badge}
          </div>
        )}
        
        <h3 className={`font-display font-bold text-2xl text-chalkboard mb-3 group-hover:${colors.text} transition-colors group-hover:scale-105 transform origin-left duration-300`}>{title}</h3>
        
        {subtitle && (
          <p className="text-chalkboard-light font-medium text-lg mb-6 group-hover:text-chalkboard transition-colors">{subtitle}</p>
        )}
        
        {children}
        
        {to && (
          <div className={`flex items-center ${colors.text} font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 mt-4`}>
            <span>View Details</span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className={className}>{cardContent}</Link>;
  }

  return <div className={className}>{cardContent}</div>;
}
