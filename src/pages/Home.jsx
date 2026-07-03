import { Link } from "react-router-dom";
import useSiteConfig from "../hooks/useSiteConfig";

export default function Home() {
  const { config } = useSiteConfig();

  return (
    <div className="page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-20 sm:mb-28">
          <div className="inline-block mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-lab-teal/10 text-lab-teal rounded-full text-sm font-medium border border-lab-teal/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              FSCU Student Resources
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-chalkboard mb-6 font-display tracking-tight leading-[1.1]">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lab-teal via-lab-teal-light to-answer-green">
              3loomangy
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-chalkboard-light mb-10 max-w-2xl mx-auto leading-relaxed">
            Your study resource hub for Faculty of Science, Cairo University
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/materials" className="btn-primary group">
              Browse Materials
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/training-sessions" className="btn-secondary">
              Training Sessions
            </Link>
          </div>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 sm:mb-28">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-chalkboard font-display leading-tight">
              Everything you need, <span className="text-lab-teal">organized</span>
            </h2>
            <p className="text-lg text-chalkboard-light leading-relaxed">
              Summaries, lecture notes, and past exams — sorted by department, semester, and course. No more digging through WhatsApp groups.
            </p>
            <div className="flex items-center gap-6 pt-2">
              {[
                { value: "13+", label: "Departments" },
                { value: "100s", label: "Courses" },
                { value: "Free", label: "Forever" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-10 bg-graph-grid" />}
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-lab-teal font-display">{stat.value}</div>
                    <div className="text-sm text-chalkboard-light">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Organized by Track", desc: "Find your department and semester instantly", iconBg: "bg-lab-teal/10", iconText: "text-lab-teal", to: "/materials", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { title: "Curated Materials", desc: "Summaries and exams from students who took the course", iconBg: "bg-periodic-orange/10", iconText: "text-periodic-orange", to: "/materials", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              { title: "Diploma Info", desc: "Requirements and materials for faculty diplomas", iconBg: "bg-answer-green/10", iconText: "text-answer-green", to: "/diplomas", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
              { title: "Training Sessions", desc: "Video tutorials and skill-building workshops", iconBg: "bg-lab-teal-light/10", iconText: "text-lab-teal-light", to: "/training-sessions", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group glass-card p-6 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className={`w-6 h-6 ${item.iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-chalkboard mb-1 group-hover:text-lab-teal transition-colors">{item.title}</h3>
                <p className="text-sm text-chalkboard-light leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Social CTA */}
        <div className="glass-card-dark rounded-3xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-display">Connect with us</h3>
            <p className="text-lab-teal-light/90">Follow us for updates, tips, and new materials</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {config.facebookUrl && (
              <SocialButton href={config.facebookUrl} label="Facebook" />
            )}
            {config.youtubeUrl && (
              <SocialButton href={config.youtubeUrl} label="YouTube" />
            )}
            {config.linkedinUrl && (
              <SocialButton href={config.linkedinUrl} label="LinkedIn" />
            )}
            {config.whatsappNumber && (
              <SocialButton
                href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}
                label="WhatsApp"
              />
            )}
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
      className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105"
    >
      {label}
    </a>
  );
}
