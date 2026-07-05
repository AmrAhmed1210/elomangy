import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="page-enter flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-periodic-orange/25 bg-periodic-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-periodic-orange">
        {t("notfound_badge")}
      </span>

      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-lab-teal/10 blur-2xl" />
        <img
          src="/mascot_flask.png"
          alt=""
          className="relative mx-auto h-32 w-32 -rotate-12 object-contain opacity-90 drop-shadow-sm sm:h-40 sm:w-40 animate-[float_6s_ease-in-out_infinite]"
        />
      </div>

      <h1 className="font-display text-4xl font-extrabold text-chalkboard sm:text-5xl">
        4<span className="text-transparent bg-clip-text bg-gradient-to-r from-lab-teal to-answer-green">0</span>4
      </h1>
      <h2 className="mt-3 font-display text-xl font-bold text-chalkboard sm:text-2xl">
        {t("notfound_title")}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-base leading-7 text-chalkboard-light">
        {t("notfound_desc")}
      </p>

      <Link to="/" className="btn-primary mt-8 group">
        <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t("notfound_cta")}
      </Link>
    </div>
  );
}
