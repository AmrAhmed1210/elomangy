// Shared empty-state block. Instead of a flat gray "no data" message, the
// mascot shows up with a mood that matches the moment:
//  - "idle"    default — nothing here yet, but it's coming (gentle float)
//  - "search"  a search came up empty (tilted, slightly faded)
//  - "excited" a section is about to fill up soon (little bounce)
const VARIANT_STYLES = {
  idle: "opacity-90 animate-[float_6s_ease-in-out_infinite]",
  search: "opacity-80 -rotate-6 grayscale-[25%]",
  excited: "opacity-95 animate-mascot-bounce",
};

export default function EmptyState({ icon, title, description, text, variant = "idle" }) {
  const heading = title || text;

  return (
    <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50 dark:bg-slate-900/30">
      <div className="w-20 h-20 mx-auto mb-4">
        {icon || (
          <img
            src="/logo-mark.png"
            alt=""
            className={`w-full h-full object-contain ${VARIANT_STYLES[variant] || VARIANT_STYLES.idle}`}
          />
        )}
      </div>
      {heading && <h3 className="text-chalkboard text-lg font-bold mb-2">{heading}</h3>}
      {description && <p className="text-chalkboard-light">{description}</p>}
    </div>
  );
}
