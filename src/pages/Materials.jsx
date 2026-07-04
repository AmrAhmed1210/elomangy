import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Card from "../components/common/Card";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";

const YEARS = [
  { id: 1, name: "First Year", description: "General courses shared by all students", iconColor: "lab-teal" },
  { id: 2, name: "Second Year", description: "Department-specific courses — Semesters 03–04", iconColor: "periodic-orange" },
  { id: 3, name: "Third Year", description: "Department-specific courses — Semesters 05–06", iconColor: "answer-green" },
  { id: 4, name: "Fourth Year", description: "Department-specific courses — Semesters 07–08", iconColor: "accent-purple" },
];

const YEAR_ICONS = [
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
];

const BOX_COLORS = ["lab-teal", "periodic-orange", "answer-green", "accent-purple", "accent-blue", "lab-teal-light"];

export default function Materials() {
  const [dashboardBoxes, setDashboardBoxes] = useState([]);

  useEffect(() => {
    async function loadBoxes() {
      const { data } = await supabase
        .from("dashboard_boxes")
        .select("*")
        .order("order", { ascending: true });
      setDashboardBoxes(data || []);
    }
    loadBoxes();
  }, []);

  return (
    <PageLayout>
      <PageHeader
        badge="Study Materials"
        title="Materials"
        subtitle="Browse study materials organized by academic year"
        breadcrumbs={[{ to: "/", label: "Home" }, { label: "Materials" }]}
      />

      {/* Year cards */}
      <div className="centered-card-grid">
        {YEARS.map((year, i) => (
          <Card
            key={year.id}
            to={`/materials/year/${year.id}`}
            title={year.name}
            subtitle={year.description}
            badge={`Year ${year.id}`}
            iconColor={year.iconColor}
            hoverColor={year.iconColor}
            className={`stagger-${i + 1}`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={YEAR_ICONS[i]} />
              </svg>
            }
          />
        ))}
      </div>

      {/* Dashboard boxes from admin */}
      {dashboardBoxes.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-chalkboard mb-5">More Resources</h2>
          <div className="centered-card-grid">
            {dashboardBoxes.map((box, i) => {
              const color = BOX_COLORS[i % BOX_COLORS.length];
              return (
                <Card
                  key={box.id}
                  to={box.link ? undefined : `/materials/box/${box.id}`}
                  externalLink={box.link || undefined}
                  title={box.title}
                  subtitle={box.description || box.title_ar}
                  iconColor={color}
                  hoverColor={color}
                  className={`stagger-${Math.min(i + 1, 8)}`}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
