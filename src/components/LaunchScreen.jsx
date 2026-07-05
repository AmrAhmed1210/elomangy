import { useEffect, useState } from "react";

export default function LaunchScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fading out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2500);

    // Remove from DOM after fade completes (3.5 seconds total)
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-lab-teal via-lab-teal-dark to-answer-green transition-opacity duration-1000 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-center">
        {/* Logo animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <img
            src="/logo-mark.png"
            alt="3loomangy"
            className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto animate-[bounce_1s_ease-in-out_infinite]"
          />
        </div>

        {/* Text animation */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-display animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
          3loomangy
        </h1>
        <p className="text-white/80 text-sm sm:text-base mt-2 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
          Your study resource hub
        </p>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mt-6 animate-[fadeInUp_0.8s_ease-out_0.7s_both]">
          <div className="w-2 h-2 bg-white rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" />
          <div className="w-2 h-2 bg-white rounded-full animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
          <div className="w-2 h-2 bg-white rounded-full animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
