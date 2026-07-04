// Decorative colorful blurred bubbles for cards
// Creates a very subtle animated background effect with soft colored glows
export default function CardBubbles({ color = "var(--color-lab-teal)" }) {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-35 transition-opacity duration-1000">
      {/* Extra large, very soft glow - top right */}
      <div
        className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-[120px] animate-[float_35s_ease-in-out_infinite]"
        style={{ backgroundColor: color, opacity: 0.4 }}
      />
      
      {/* Large, very soft glow - bottom left */}
      <div
        className="absolute -bottom-28 -left-28 w-64 h-64 rounded-full blur-[100px] animate-[float-reverse_40s_ease-in-out_infinite]"
        style={{ backgroundColor: color, opacity: 0.35 }}
      />
    </div>
  );
}