import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// A minimal "there's more below" cue. Portals straight into document.body so
// it is always positioned against the real viewport, never against some
// nested layout container. Fades in only when there's real content below the
// fold, and disappears the moment the user starts scrolling.
export default function ScrollHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function evaluate() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nearTop = window.scrollY < 32;
      setVisible(scrollable > 140 && nearTop);
    }

    evaluate();
    const raf = requestAnimationFrame(evaluate);
    const timeout = setTimeout(evaluate, 500);

    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);

    const observer = new MutationObserver(evaluate);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
      observer.disconnect();
    };
  }, []);

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}
    >
      {/* soft fade so the arrow doesn't sit on a hard edge */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: 72,
          background: "linear-gradient(to top, var(--surface-page, #f8fafc), transparent)",
        }}
      />
      <div
        style={{
          position: "relative",
          marginBottom: 14,
          animation: "scrollHintBob 1.8s ease-in-out infinite",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-lab-teal, #0d9488)" strokeWidth="2">
          <path d="M12 4v14M12 18l-5-5M12 18l5-5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
          <path d="M12 10v8M12 18l-4-4M12 18l4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <style>{`
        @keyframes scrollHintBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>,
    document.body
  );
}