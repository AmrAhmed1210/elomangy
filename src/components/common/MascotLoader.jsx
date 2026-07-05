// Shared "loading" moment — the flask mascot bounces instead of a plain
// gray spinner. Used across full-page loading states.
export default function MascotLoader({ text, size = "md" }) {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  return (
    <div className="text-center">
      <img
        src="/logo-mark.png"
        alt=""
        className={`mx-auto mb-4 ${sizes[size] || sizes.md} object-contain animate-mascot-bounce drop-shadow-sm`}
      />
      {text && <p className="text-chalkboard-light">{text}</p>}
    </div>
  );
}
