import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSiteConfig from "../hooks/useSiteConfig";
import { useLanguage } from "../contexts/LanguageContext";

export default function Home() {
  const { config } = useSiteConfig();
  const { t } = useLanguage();
  const [departmentCount, setDepartmentCount] = useState(13);

  useEffect(() => {
    async function fetchDepartmentCount() {
      const { count } = await supabase.from("tracks").select("id", { count: "exact", head: true });
      if (count !== null) setDepartmentCount(count);
    }
    fetchDepartmentCount();
  }, []);

  return (
    <div className="page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-block mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-lab-teal/8 text-lab-teal rounded-full text-sm font-medium border border-lab-teal/15">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              {t("home_hero_badge")}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-chalkboard mb-5 font-display tracking-tight leading-[1.1]">
            {t("home_welcome")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lab-teal via-lab-teal-light to-answer-green">
              3loomangy
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-chalkboard-light mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("home_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/materials" className="btn-primary group">
              {t("home_browse_materials")}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/team" className="btn-secondary">
              {t("home_team_work")}
            </Link>
            <Link to="/training-sessions" className="btn-secondary">
              {t("home_training_sessions")}
            </Link>
          </div>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-16 sm:mb-24">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-chalkboard font-display leading-tight">
              {t("home_value_title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lab-teal to-answer-green">{t("home_value_highlight")}</span>
            </h2>
            <p className="text-base sm:text-lg text-chalkboard-light leading-relaxed">
              {t("home_value_subtitle")}
            </p>
            <div className="flex items-center gap-5 pt-2">
              {[
                { value: `${departmentCount}+`, label: t("home_departments") },
                { value: "100s", label: t("home_courses") },
                { value: t("home_free_forever"), label: "" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-5">
                  {i > 0 && <div className="w-px h-10 bg-graph-grid" />}
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-lab-teal font-display">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-chalkboard-light">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { title: t("home_organized_track"), desc: t("home_organized_track_desc"), color: "lab-teal", to: "/materials", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: t("home_curated_materials"), desc: t("home_curated_materials_desc"), color: "periodic-orange", to: "/materials", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: t("home_diploma_info"), desc: t("home_diploma_info_desc"), color: "answer-green", to: "/diplomas", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
              { title: t("home_training_info"), desc: t("home_training_info_desc"), color: "accent-purple", to: "/training-sessions", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item, i) => {
              const colorMap = {
                "lab-teal": { bg: "bg-lab-teal/8", text: "text-lab-teal", hover: "group-hover:text-lab-teal" },
                "periodic-orange": { bg: "bg-periodic-orange/8", text: "text-periodic-orange", hover: "group-hover:text-periodic-orange" },
                "answer-green": { bg: "bg-answer-green/8", text: "text-answer-green", hover: "group-hover:text-answer-green" },
                "accent-purple": { bg: "bg-accent-purple/8", text: "text-accent-purple", hover: "group-hover:text-accent-purple" },
              };
              const c = colorMap[item.color];
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className={`stagger-${i + 1} group glass-card p-5 sm:p-6 hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <h3 className={`font-bold text-base text-chalkboard mb-1 ${c.hover} transition-colors`}>{item.title}</h3>
                  <p className="text-sm text-chalkboard-light leading-relaxed">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Social CTA */}
        <div className="glass-card-dark rounded-2xl p-6 sm:p-10">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-display">{t("home_connect_title")}</h3>
            <p className="text-lab-teal-light/80 text-sm sm:text-base">{t("home_connect_subtitle")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {config.facebookUrl && <SocialButton href={config.facebookUrl} label="Facebook" />}
            {config.youtubeUrl && <SocialButton href={config.youtubeUrl} label="YouTube" />}
            {config.linkedinUrl && <SocialButton href={config.linkedinUrl} label="LinkedIn" />}
            {config.whatsappNumber && (
              <SocialButton
                href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}
                label="WhatsApp"
              />
            )}
            {config.extraLinks?.map((link) => (
              <SocialButton key={link.id} href={link.url} label={link.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialButton({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2.5 bg-white/12 backdrop-blur-sm rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5 border border-white/10"
    >
      {label}
    </a>
  );
}
