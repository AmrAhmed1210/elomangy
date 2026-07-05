import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import { useLanguage } from "../contexts/LanguageContext";
import MascotLoader from "../components/common/MascotLoader";

const TEAM_TABS = [
  { key: "events", labelKey: "team_events" },
  { key: "services", labelKey: "team_services" },
];

export default function Team() {
  const { t, localize } = useLanguage();
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [eventNow, setEventNow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const [eventsData, servicesData, eventNowData] = await Promise.all([
          supabase.from("team_events").select("*").order("date", { ascending: false }),
          supabase.from("team_services").select("*").order("order"),
          supabase.from("site_config").select("event_now_id").eq("id", 1).single(),
        ]);

        if (eventsData.error) throw eventsData.error;
        if (servicesData.error) throw servicesData.error;

        setEvents(eventsData.data || []);
        setServices(servicesData.data || []);
        
        if (eventNowData?.data?.event_now_id) {
          const { data: eventData } = await supabase.from("team_events").select("*").eq("id", eventNowData.data.event_now_id).single();
          setEventNow(eventData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, []);

  if (loading) return <LoadingTeam />;
  if (error) return <ErrorState error={error} />;

  const upcomingEvents = events.filter((e) => !e.is_past);
  const pastEvents = events.filter((e) => e.is_past);

  return (
    <PageLayout>
      <PageHeader
        badge="Team Work"
        badgeColor="accent-purple"
        title={t("team_title")}
        subtitle={t("team_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_team") }]}
      />

      {/* Event Now Section */}
      {eventNow && (
        <div className="mb-8">
          <div className="glass-card overflow-hidden">
            <div className="relative">
              {eventNow.image_url && (
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-lab-teal/10 to-answer-green/10">
                  <img
                    src={eventNow.image_url}
                    alt={localize(eventNow, "title", "title_ar")}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-lab-teal text-white rounded-full text-sm font-bold shadow-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  {t("team_event_now")}
                </span>
              </div>
            </div>
            <div className="p-6">
              {eventNow.date && (
                <p className="text-xs font-semibold text-lab-teal mb-2">{new Date(eventNow.date).toLocaleDateString()}</p>
              )}
              <h3 className="font-display text-2xl font-bold text-chalkboard mb-2">{localize(eventNow, "title", "title_ar")}</h3>
              <p className="text-sm text-chalkboard-light line-clamp-3 mb-4">{localize(eventNow, "description", "description_ar")}</p>
              {eventNow.location && (
                <p className="text-xs text-chalkboard-light mb-4 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {eventNow.location}
                </p>
              )}
              {eventNow.registration_open !== false && eventNow.register_link && (
                <a
                  href={eventNow.register_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-lab-teal text-white rounded-full text-sm font-bold hover:bg-lab-teal-dark transition-colors"
                >
                  {t("team_register")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {eventNow.registration_open === false && (
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-full text-sm font-bold">
                  {eventNow.registration_message || "Registration Closed"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
        {TEAM_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-lab-teal text-white shadow-lg shadow-lab-teal/20"
                : "border border-[var(--surface-border)] bg-[var(--surface-card)] text-chalkboard-light hover:border-lab-teal/30 hover:text-chalkboard"
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {activeTab === "events" && (
        <EventsSection upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
      )}
      {activeTab === "services" && (
        <ServicesSection services={services} />
      )}
    </PageLayout>
  );
}

function EventsSection({ upcomingEvents, pastEvents }) {
  const { t, localize } = useLanguage();
  
  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return <EmptyState title={t("team_no_events")} description={t("team_no_events_desc")} variant="excited" />;
  }

  return (
    <div className="space-y-10">
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-chalkboard mb-6">{t("team_upcoming_events")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} isPast={false} />
            ))}
          </div>
        </div>
      )}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-chalkboard mb-6">{t("team_past_events")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} isPast={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, index, isPast }) {
  const { t, localize } = useLanguage();
  
  return (
    <div
      className={`glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300 stagger-${Math.min(index + 1, 8)}`}
    >
      {event.image_url && (
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-lab-teal/10 to-answer-green/10">
          <img
            src={event.image_url}
            alt={localize(event, "title", "title_ar")}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        {event.date && (
          <p className="text-xs font-semibold text-lab-teal mb-2">{new Date(event.date).toLocaleDateString()}</p>
        )}
        <h3 className="font-display text-xl font-bold text-chalkboard mb-2 group-hover:text-lab-teal transition-colors">
          {localize(event, "title", "title_ar")}
        </h3>
        <p className="text-sm text-chalkboard-light line-clamp-3 mb-4">{localize(event, "description", "description_ar")}</p>
        {event.location && (
          <p className="text-xs text-chalkboard-light mb-4 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </p>
        )}
        {!isPast && event.register_link && (
          <a
            href={event.register_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-lab-teal hover:text-lab-teal-dark transition-colors"
          >
            {t("team_register")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {isPast && event.register_link && (
          <a
            href={event.register_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-lab-teal hover:text-lab-teal-dark transition-colors"
          >
            {t("team_read_more")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

function ServicesSection({ services }) {
  const { t, localize } = useLanguage();
  
  if (services.length === 0) {
    return <EmptyState title={t("team_no_services")} description={t("team_no_services_desc")} variant="excited" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <div
          key={service.id}
          className={`glass-card p-6 group hover:-translate-y-1 transition-all duration-300 stagger-${Math.min(index + 1, 8)}`}
        >
          <h3 className="font-display text-xl font-bold text-chalkboard mb-2 group-hover:text-lab-teal transition-colors">
            {localize(service, "title", "title_ar")}
          </h3>
          <p className="text-sm text-chalkboard-light line-clamp-3 mb-4">{localize(service, "description", "description_ar")}</p>
          {service.contact_link && (
            <a
              href={service.contact_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-lab-teal hover:text-lab-teal-dark transition-colors"
            >
              {t("common_contact")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingTeam() {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <MascotLoader text={t("common_loading")} />
        </div>
      </div>
    </PageLayout>
  );
}

function ErrorState({ error }) {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-periodic-orange">{t("common_error_prefix")}: {error}</p>
      </div>
    </PageLayout>
  );
}