// A small celebratory burst of confetti pieces, used after a successful
// form submission. Purely decorative — auto-removes itself visually via
// the CSS animation (confetti-fall) defined in index.css.
const COLORS = [
  "var(--color-lab-teal)",
  "var(--color-periodic-orange)",
  "var(--color-answer-green)",
  "var(--color-accent-purple)",
  "var(--color-accent-amber)",
  "var(--color-accent-pink)",
];

export default function ConfettiBurst({ count = 18 }) {
  const pieces = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-hidden">
      {pieces.map((i) => {
        const left = Math.round((i / count) * 100 + (Math.random() * 6 - 3));
        const delay = (Math.random() * 0.3).toFixed(2);
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
