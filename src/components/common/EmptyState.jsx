export default function EmptyState({ icon, title, description }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-graph-grid rounded-2xl bg-white/50 dark:bg-slate-900/30">
      <div className="w-20 h-20 mx-auto mb-4">
        {icon || (
          <img
            src="/logo-mark.png"
            alt=""
            className="w-full h-full object-contain opacity-90 animate-[float_6s_ease-in-out_infinite]"
          />
        )}
      </div>
      <h3 className="text-chalkboard text-lg font-bold mb-2">{title}</h3>
      <p className="text-chalkboard-light">{description}</p>
    </div>
  );
}