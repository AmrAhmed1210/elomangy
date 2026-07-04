import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useSiteConfig from "../../hooks/useSiteConfig";

export default function Footer() {
  const { config } = useSiteConfig();
  const { isAdmin } = useAuth();
  const waLink = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="relative mt-auto border-t border-graph-grid bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-lab-teal to-lab-teal-dark">
              3loomangy
            </Link>
            <p className="mt-3 text-sm text-chalkboard-light leading-relaxed max-w-xs">
              Student-run study resource hub for Faculty of Science, Cairo University.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-chalkboard mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/materials", label: "Materials" },
                { to: "/diplomas", label: "Diplomas" },
                { to: "/training-sessions", label: "Training Sessions" },
                { to: "/about", label: "About FSCU" },
                ...(isAdmin ? [{ to: "/admin", label: "Admin dashboard" }] : []),
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-chalkboard-light hover:text-lab-teal transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-chalkboard mb-4">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {config.facebookUrl && (
                <SocialIcon href={config.facebookUrl} label="Facebook">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </SocialIcon>
              )}
              {config.youtubeUrl && (
                <SocialIcon href={config.youtubeUrl} label="YouTube">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </SocialIcon>
              )}
              {config.linkedinUrl && (
                <SocialIcon href={config.linkedinUrl} label="LinkedIn">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </SocialIcon>
              )}
              {waLink && (
                <SocialIcon href={waLink} label="WhatsApp">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </SocialIcon>
              )}
              {config.extraLinks?.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 h-10 rounded-xl bg-lab-teal/10 text-lab-teal hover:bg-lab-teal hover:text-white transition-all duration-300 text-xs font-semibold"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-graph-grid flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-chalkboard-light">
          <p>© {new Date().getFullYear()} 3loomangy — Built by FSCU students</p>
          <p className="font-mono-smallcaps">Faculty of Science, Cairo University</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 flex items-center justify-center rounded-xl bg-lab-teal/10 text-lab-teal hover:bg-lab-teal hover:text-white transition-all duration-300 hover:scale-110"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">{children}</svg>
    </a>
  );
}