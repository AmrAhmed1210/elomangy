import { Link } from "react-router-dom";
import useSiteConfig from "../hooks/useSiteConfig";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

export default function About() {
  const { config, loading } = useSiteConfig();

  const paragraphs = config.aboutFscuContent
    ? config.aboutFscuContent.split("\n\n").filter(Boolean)
    : [];

  return (
    <PageLayout>
      <PageHeader
        badge="About"
        title="About 3loomangy"
        subtitle="Student-run platform for FSCU"
        breadcrumbs={[{ to: "/", label: "Home" }, { label: "About" }]}
      />

      <div className="max-w-3xl space-y-6">
        <div className="glass-card p-6 sm:p-8 border-l-4 border-l-lab-teal">
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">What is 3loomangy?</h3>
          <p className="text-chalkboard-light leading-relaxed">
            3loomangy is a student-run platform for Faculty of Science, Cairo University students. We organize study materials by department, semester, and course so you can find what you need without digging through WhatsApp groups.
          </p>
        </div>

        {!loading && paragraphs.length > 0 && (
          <div className="glass-card p-6 sm:p-8 border-l-4 border-l-answer-green">
            <h3 className="font-display font-semibold text-xl text-chalkboard mb-4">About FSCU</h3>
            <div className="space-y-4 text-chalkboard-light leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 border-l-4 border-l-periodic-orange">
          <h3 className="font-display font-semibold text-xl text-chalkboard mb-3">Built by students, for students</h3>
          <p className="text-chalkboard-light leading-relaxed">
            The site is built and maintained by FSCU students. All materials are curated by students who have actually taken these courses.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link to="/materials" className="btn-primary text-sm px-6 py-3">
            Browse Materials
          </Link>
          {config.whatsappNumber && (
            <a
              href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-6 py-3"
            >
              Contact on WhatsApp
            </a>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
