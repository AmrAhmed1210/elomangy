import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

const YEARS = [
  { id: 1, name: "First Year", description: "General courses shared by all students", iconColor: "lab-teal" },
  { id: 2, name: "Second Year", description: "Department-specific courses — Semesters 03–04", iconColor: "periodic-orange" },
  { id: 3, name: "Third Year", description: "Department-specific courses — Semesters 05–06", iconColor: "answer-green" },
  { id: 4, name: "Fourth Year", description: "Department-specific courses — Semesters 07–08", iconColor: "lab-teal-light" },
];

export default function Materials() {
  return (
    <PageLayout>
      <PageHeader
        badge="Study Materials"
        title="Materials"
        subtitle="Browse study materials organized by academic year"
        breadcrumbs={[{ to: "/", label: "Home" }, { label: "Materials" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {YEARS.map((year) => (
          <Card
            key={year.id}
            to={`/materials/year/${year.id}`}
            title={year.name}
            subtitle={year.description}
            badge={`Year ${year.id}`}
            iconColor={year.iconColor}
            hoverColor={year.iconColor}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        ))}
      </div>
    </PageLayout>
  );
}
