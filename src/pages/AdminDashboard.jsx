import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const YEAR_TABS = [
  { key: "year-1", label: "First Year", year: 1 },
  { key: "year-2", label: "Second Year", year: 2 },
  { key: "year-3", label: "Third Year", year: 3 },
  { key: "year-4", label: "Fourth Year", year: 4 },
];

const ADMIN_TABS = [
  { key: "mat-boxes", label: "Materials Boxes" },
  ...YEAR_TABS,
  { key: "diplomas", label: "Diplomas" },
  { key: "training", label: "Training" },
  { key: "team", label: "Team Work" },
  { key: "team-committees", label: "Team Committees" },
  { key: "join-requests", label: "Join Requests" },
  { key: "sections", label: "Special Sections" },
  { key: "contact", label: "Contact & Links" },
  { key: "about", label: "About FSCU" },
  { key: "admins", label: "Admins" },
];

const LINK_TYPES = [
  { value: "drive_folder", label: "Drive folder" },
  { value: "drive_file", label: "Drive file" },
  { value: "pdf", label: "PDF" },
  { value: "external_link", label: "External link" },
  { value: "video", label: "Video" },
];

const emptyTrack = { name: "", name_ar: "" };
const emptyBox = { label: "", link: "" };
const emptyCourse = { code: "", name: "", instructor: "", link: "" };
const emptyLink = { label: "", type: "drive_folder", url: "" };
const emptyDiploma = { name: "", name_ar: "", description: "", eligibility: "" };
const emptyTraining = { title: "", description: "", videoUrl: "" };
const emptyDashboardBox = { title: "", title_ar: "", description: "", link: "" };
const emptyProject = { title: "", description: "", cover_image_url: "", link: "", date: "" };
const emptyEvent = { title: "", description: "", date: "", location: "", register_link: "", image_url: "", is_past: false, registration_open: true, registration_message: "" };
const emptyService = { title: "", description: "", contact_link: "" };
const emptyCommittee = { name: "", name_ar: "", description: "", description_ar: "", responsibilities: "", responsibilities_ar: "", head_name: "", contact_link: "", icon: "" };
const emptySection = { name_en: "", name_ar: "", slug: "" };
const emptySocialLink = { label: "", url: "" };
const emptyContact = { whatsapp_number: "", facebook_url: "", youtube_url: "", linkedin_url: "", whatsapp_channel_url: "" };

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState("mat-boxes");
  const activeYear = YEAR_TABS.find((tab) => tab.key === activeTab);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-900/95 px-4 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">3loomangy admin</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">Content management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Manage years, departments, boxes, courses, resource links, diplomas, training sessions, and About FSCU.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-300 sm:items-end">
            <span>{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="min-h-11 rounded-card border border-slate-700 px-4 py-2 font-medium text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
        <nav className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible" aria-label="Admin sections">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key
                  ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/40"
                  : "border border-slate-800 bg-slate-900 text-slate-200 hover:border-cyan-300 hover:text-cyan-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "mat-boxes" && <DashboardBoxesManager />}
        {activeYear && <YearContentManager key={activeYear.key} year={activeYear.year} title={activeYear.label} />}
        {activeTab === "diplomas" && <DiplomasManager />}
        {activeTab === "training" && <TrainingManager />}
        {activeTab === "team" && <TeamWorkManager />}
        {activeTab === "team-committees" && <TeamCommitteesManager />}
        {activeTab === "join-requests" && <JoinRequestsManager />}
        {activeTab === "sections" && <SpecialSectionsManager />}
        {activeTab === "contact" && <ContactManager />}
        {activeTab === "about" && <AboutManager />}
        {activeTab === "admins" && <AdminsManager />}
      </div>
    </main>
  );
}

function DashboardBoxesManager() {
  const [boxes, setBoxes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [boxForm, setBoxForm] = useState(emptyDashboardBox);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [editingBoxId, setEditingBoxId] = useState("");
  const [editingLinkId, setEditingLinkId] = useState("");
  const selectedBox = boxes.find((b) => b.id === selectedBoxId);
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadBoxes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("dashboard_boxes").select("*").order("order", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setBoxes([]);
    } else {
      setBoxes(data ?? []);
    }
    setLoading(false);
  }, [showMessage]);

  const loadLinks = useCallback(async (boxId) => {
    if (!boxId) { setLinks([]); return; }
    const { data, error } = await supabase
      .from("resource_links")
      .select("*")
      .eq("parent_type", "dashboard_box")
      .eq("parent_id", boxId)
      .order("order", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setLinks([]);
    } else {
      setLinks(data ?? []);
    }
  }, [showMessage]);

  useEffect(() => { loadBoxes(); }, [loadBoxes]);
  useEffect(() => { loadLinks(selectedBoxId); setLinkForm(emptyLink); setEditingLinkId(""); }, [loadLinks, selectedBoxId]);

  async function saveBox(event) {
    event.preventDefault();
    const title = boxForm.title.trim();
    if (!title) { showMessage("error", "Please enter a box title."); return; }
    setBusy(true);
    const payload = {
      title,
      title_ar: boxForm.title_ar.trim() || null,
      description: boxForm.description.trim() || null,
      link: boxForm.link.trim() || null,
    };
    const request = editingBoxId
      ? supabase.from("dashboard_boxes").update(payload).eq("id", editingBoxId)
      : supabase.from("dashboard_boxes").insert({ ...payload, order: boxes.length });
    const { data, error } = await request.select().single();
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setBoxForm(emptyDashboardBox);
      setEditingBoxId("");
      await loadBoxes();
      if (!editingBoxId && data?.id) setSelectedBoxId(data.id);
      showMessage("success", editingBoxId ? "Box updated." : "Box added to Materials page.");
    }
    setBusy(false);
  }

  async function saveBoxLink(event) {
    event.preventDefault();
    await saveResourceLink({
      event,
      editingId: editingLinkId,
      form: linkForm,
      links,
      parentId: selectedBoxId,
      parentType: "dashboard_box",
      reset: () => { setLinkForm(emptyLink); setEditingLinkId(""); },
      reload: () => loadLinks(selectedBoxId),
      setBusy,
      showMessage,
    });
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel
        breadcrumb={["Materials Boxes", selectedBox?.title].filter(Boolean)}
        message={message}
        kicker="Materials page dashboard"
        title="Materials Boxes"
      />
      <p className="text-sm text-slate-400 -mt-3">
        These boxes appear as cards on the public <strong>Materials</strong> page (alongside Years 1–4).
        If a box has a <strong>direct link</strong>, clicking it goes to that URL.
        If not, it opens a detail page showing the sub-links you add here.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Left: box list + form */}
        <AdminPanel title="Dashboard Boxes" description="Add, edit, and reorder boxes shown on the Materials page.">
          <form onSubmit={saveBox} className="grid gap-3">
            <TextField label="Box title" value={boxForm.title} onChange={(title) => setBoxForm({ ...boxForm, title })} placeholder="Equivalency Exams" />
            <TextField label="Arabic title (optional)" value={boxForm.title_ar} onChange={(title_ar) => setBoxForm({ ...boxForm, title_ar })} placeholder="امتحانات المعادلة" />
            <TextareaField label="Description (optional)" value={boxForm.description} onChange={(description) => setBoxForm({ ...boxForm, description })} />
            <TextField label="Direct link (optional)" type="url" value={boxForm.link} onChange={(link) => setBoxForm({ ...boxForm, link })} placeholder="https://drive.google.com/..." />
            <p className="text-xs text-slate-500 -mt-1">If set, clicking this box on the Materials page opens the link directly. Otherwise it opens a page with sub-links.</p>
            <FormActions busy={busy} editing={Boolean(editingBoxId)} createLabel="+ Add Box" saveLabel="Save Box" onCancel={() => { setEditingBoxId(""); setBoxForm(emptyDashboardBox); }} />
          </form>
          <div className="mt-5">
            {loading ? (
              <LoadingRows />
            ) : (
              <AdminList
                emptyText="No dashboard boxes yet. Add one to show it on the Materials page."
                rows={boxes}
                selectedId={selectedBoxId}
                getTitle={(b) => b.title}
                getSubtitle={(b) => b.link ? `Direct link: ${b.link}` : b.description}
                onSelect={(b) => setSelectedBoxId(b.id)}
                onEdit={(b) => {
                  setEditingBoxId(b.id);
                  setBoxForm({ title: b.title ?? "", title_ar: b.title_ar ?? "", description: b.description ?? "", link: b.link ?? "" });
                }}
                onDelete={(b) => deleteRow("dashboard_boxes", b, b.title, async () => {
                  if (selectedBoxId === b.id) setSelectedBoxId("");
                  await loadBoxes();
                }, setBusy, showMessage)}
                onMoveUp={(b) => moveRow("dashboard_boxes", boxes, b, "up", loadBoxes, setBusy, showMessage)}
                onMoveDown={(b) => moveRow("dashboard_boxes", boxes, b, "down", loadBoxes, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>

        {/* Right: sub-links for selected box */}
        <AdminPanel
          title="Box sub-links"
          description={selectedBox ? (selectedBox.link ? `"${selectedBox.title}" has a direct link — sub-links won't show on the public site.` : `Links shown when students click "${selectedBox.title}".`) : "Choose a box to manage its sub-links."}
        >
          {selectedBox ? (
            <>
              <LinkForm
                busy={busy}
                editing={Boolean(editingLinkId)}
                form={linkForm}
                onCancel={() => { setEditingLinkId(""); setLinkForm(emptyLink); }}
                onChange={setLinkForm}
                onSubmit={saveBoxLink}
              />
              <div className="mt-5">
                <AdminList
                  emptyText="No sub-links yet."
                  rows={links}
                  getTitle={(l) => l.label}
                  getSubtitle={(l) => `${linkTypeLabel(l.type)} - ${l.url}`}
                  onEdit={(l) => { setEditingLinkId(l.id); setLinkForm({ label: l.label ?? "", type: l.type ?? "drive_folder", url: l.url ?? "" }); }}
                  onDelete={(l) => deleteRow("resource_links", l, l.label, () => loadLinks(selectedBoxId), setBusy, showMessage)}
                  onMoveUp={(l) => moveRow("resource_links", links, l, "up", () => loadLinks(selectedBoxId), setBusy, showMessage)}
                  onMoveDown={(l) => moveRow("resource_links", links, l, "down", () => loadLinks(selectedBoxId), setBusy, showMessage)}
                />
              </div>
            </>
          ) : (
            <EmptyPrompt text="Select a box to manage its sub-links." />
          )}
        </AdminPanel>
      </div>
    </section>
  );
}

function YearContentManager({ title, year }) {
  const needsDepartments = year > 1;
  const [tracks, setTracks] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [selectedBoxId, setSelectedBoxId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [trackForm, setTrackForm] = useState(emptyTrack);
  const [boxForm, setBoxForm] = useState(emptyBox);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [editingTrackId, setEditingTrackId] = useState("");
  const [editingBoxId, setEditingBoxId] = useState("");
  const [editingCourseId, setEditingCourseId] = useState("");
  const [editingLinkId, setEditingLinkId] = useState("");

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId);
  const selectedBox = boxes.find((box) => box.id === selectedBoxId);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const boxOwnerReady = !needsDepartments || selectedTrackId;

  const breadcrumb = useMemo(() => {
    const items = [title];
    if (selectedTrack) items.push(selectedTrack.name);
    if (selectedBox) items.push(selectedBox.label);
    if (selectedCourse) items.push(selectedCourse.name);
    return items;
  }, [selectedBox, selectedCourse, selectedTrack, title]);

  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadTracks = useCallback(async () => {
    if (!needsDepartments) {
      setTracks([]);
      return;
    }

    const { data, error } = await supabase.from("tracks").select("*").order("order", { ascending: true });

    if (error) {
      showMessage("error", friendlyError(error.message));
      setTracks([]);
    } else {
      setTracks(data ?? []);
    }
  }, [needsDepartments, showMessage]);

  const loadBoxes = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("semesters").select("*").eq("year", year).order("order", { ascending: true });
    query = needsDepartments ? query.eq("track_id", selectedTrackId || "00000000-0000-0000-0000-000000000000") : query.is("track_id", null);
    const { data, error } = await query;

    if (error) {
      showMessage("error", friendlyError(error.message));
      setBoxes([]);
    } else {
      setBoxes(data ?? []);
    }
    setLoading(false);
  }, [needsDepartments, selectedTrackId, showMessage, year]);

  const loadCourses = useCallback(async (boxId) => {
    if (!boxId) {
      setCourses([]);
      return;
    }

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("semester_id", boxId)
      .order("order", { ascending: true });

    if (error) {
      showMessage("error", friendlyError(error.message));
      setCourses([]);
    } else {
      setCourses(data ?? []);
    }
  }, [showMessage]);

  const loadLinks = useCallback(async (courseId) => {
    if (!courseId) {
      setLinks([]);
      return;
    }

    const { data, error } = await supabase
      .from("resource_links")
      .select("*")
      .eq("parent_type", "course")
      .eq("parent_id", courseId)
      .order("order", { ascending: true });

    if (error) {
      showMessage("error", friendlyError(error.message));
      setLinks([]);
    } else {
      setLinks(data ?? []);
    }
  }, [showMessage]);

  useEffect(() => {
    setMessage({ type: "", text: "" });
    loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    loadBoxes();
    setSelectedBoxId("");
    setSelectedCourseId("");
    setBoxForm(emptyBox);
    setCourseForm(emptyCourse);
    setLinkForm(emptyLink);
    setEditingBoxId("");
    setEditingCourseId("");
    setEditingLinkId("");
  }, [loadBoxes]);

  useEffect(() => {
    loadCourses(selectedBoxId);
    setSelectedCourseId("");
    setCourseForm(emptyCourse);
    setLinkForm(emptyLink);
    setEditingCourseId("");
    setEditingLinkId("");
  }, [loadCourses, selectedBoxId]);

  useEffect(() => {
    loadLinks(selectedCourseId);
    setLinkForm(emptyLink);
    setEditingLinkId("");
  }, [loadLinks, selectedCourseId]);

  async function saveTrack(event) {
    event.preventDefault();
    const name = trackForm.name.trim();
    if (!name) {
      showMessage("error", "Please enter a department name.");
      return;
    }

    setBusy(true);
    const payload = {
      name,
      name_ar: trackForm.name_ar.trim() || null,
      slug: slugify(name),
      is_flat: false,
    };
    const request = editingTrackId
      ? supabase.from("tracks").update(payload).eq("id", editingTrackId)
      : supabase.from("tracks").insert({ ...payload, order: tracks.length });
    const { data, error } = await request.select().single();

    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setTrackForm(emptyTrack);
      setEditingTrackId("");
      await loadTracks();
      if (!editingTrackId && data?.id) setSelectedTrackId(data.id);
      showMessage("success", editingTrackId ? "Department updated." : "Department added. Add its first box next.");
    }
    setBusy(false);
  }

  async function saveBox(event) {
    event.preventDefault();
    const label = boxForm.label.trim();
    if (!label) {
      showMessage("error", "Please enter a box name.");
      return;
    }
    if (needsDepartments && !selectedTrackId) {
      showMessage("error", "Choose a department first.");
      return;
    }

    setBusy(true);
    const payload = { label, year, track_id: needsDepartments ? selectedTrackId : null, link: boxForm.link.trim() || null };
    const request = editingBoxId
      ? supabase.from("semesters").update(payload).eq("id", editingBoxId)
      : supabase.from("semesters").insert({ ...payload, order: boxes.length });
    const { data, error } = await request.select().single();

    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setBoxForm(emptyBox);
      setEditingBoxId("");
      await Promise.all([loadBoxes(), loadTracks()]);
      if (!editingBoxId && data?.id) setSelectedBoxId(data.id);
      showMessage("success", editingBoxId ? "Box updated." : "Box added.");
    }
    setBusy(false);
  }

  async function saveCourse(event) {
    event.preventDefault();
    if (!selectedBoxId) return;
    const name = courseForm.name.trim();
    const code = courseForm.code.trim();
    const instructor = courseForm.instructor.trim();
    if (!name || !code) {
      showMessage("error", "Please enter the course name and course code.");
      return;
    }

    setBusy(true);
    const payload = { semester_id: selectedBoxId, name, code, instructor, link: courseForm.link.trim() || null };
    const request = editingCourseId
      ? supabase.from("courses").update(payload).eq("id", editingCourseId)
      : supabase.from("courses").insert({ ...payload, order: courses.length });
    const { data, error } = await request.select().single();

    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setCourseForm(emptyCourse);
      setEditingCourseId("");
      await loadCourses(selectedBoxId);
      if (!editingCourseId && data?.id) setSelectedCourseId(data.id);
      showMessage("success", editingCourseId ? "Course updated." : "Course added.");
    }
    setBusy(false);
  }

  async function saveCourseLink(event) {
    event.preventDefault();
    await saveResourceLink({
      event,
      editingId: editingLinkId,
      form: linkForm,
      links,
      parentId: selectedCourseId,
      parentType: "course",
      reset: () => {
        setLinkForm(emptyLink);
        setEditingLinkId("");
      },
      reload: () => loadLinks(selectedCourseId),
      setBusy,
      showMessage,
    });
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={breadcrumb} message={message} kicker="Academic content" title={`${title} content`} />

      <div className={`grid gap-5 ${needsDepartments ? "xl:grid-cols-[0.9fr_1fr_1.4fr]" : "xl:grid-cols-[1fr_1.4fr]"}`}>
        {needsDepartments && (
          <AdminPanel title="Departments" description={`Add and choose departments for ${title}.`}>
            <TrackForm
              busy={busy}
              editing={Boolean(editingTrackId)}
              form={trackForm}
              onCancel={() => {
                setEditingTrackId("");
                setTrackForm(emptyTrack);
              }}
              onChange={setTrackForm}
              onSubmit={saveTrack}
            />
            <div className="mt-5">
              <AdminList
                emptyText="No departments yet. Add a department first."
                rows={tracks}
                selectedId={selectedTrackId}
                getTitle={(track) => track.name}
                getSubtitle={(track) => track.name_ar}
                onSelect={(track) => setSelectedTrackId(track.id)}
                onEdit={(track) => {
                  setEditingTrackId(track.id);
                  setTrackForm({ name: track.name ?? "", name_ar: track.name_ar ?? "" });
                }}
                onDelete={(track) =>
                  deleteRow("tracks", track, track.name, async () => {
                    if (selectedTrackId === track.id) setSelectedTrackId("");
                    await loadTracks();
                  }, setBusy, showMessage)
                }
                onMoveUp={(track) => moveRow("tracks", tracks, track, "up", loadTracks, setBusy, showMessage)}
                onMoveDown={(track) => moveRow("tracks", tracks, track, "down", loadTracks, setBusy, showMessage)}
              />
            </div>
          </AdminPanel>
        )}

        <AdminPanel title="Boxes" description={boxOwnerReady ? "Create any box name. Examples: Semester 1, Recruitments, Practical." : "Choose a department first."}>
          {boxOwnerReady ? (
            <>
              <BoxForm
                busy={busy}
                editing={Boolean(editingBoxId)}
                form={boxForm}
                onCancel={() => {
                  setEditingBoxId("");
                  setBoxForm(emptyBox);
                }}
                onChange={setBoxForm}
                onSubmit={saveBox}
              />
              <div className="mt-5">
                {loading ? (
                  <LoadingRows />
                ) : (
                  <AdminList
                    emptyText="No boxes yet."
                    rows={boxes}
                    selectedId={selectedBoxId}
                    getTitle={(box) => box.label}
                    getSubtitle={(box) => box.link ? `Direct link: ${box.link}` : null}
                    onSelect={(box) => setSelectedBoxId(box.id)}
                    onEdit={(box) => {
                      setEditingBoxId(box.id);
                      setBoxForm({ label: box.label ?? "", link: box.link ?? "" });
                    }}
                    onDelete={(box) =>
                      deleteRow("semesters", box, box.label, async () => {
                        if (selectedBoxId === box.id) setSelectedBoxId("");
                        await Promise.all([loadBoxes(), loadTracks()]);
                      }, setBusy, showMessage)
                    }
                    onMoveUp={(box) => moveRow("semesters", boxes, box, "up", loadBoxes, setBusy, showMessage)}
                    onMoveDown={(box) => moveRow("semesters", boxes, box, "down", loadBoxes, setBusy, showMessage)}
                  />
                )}
              </div>
            </>
          ) : (
            <EmptyPrompt text="Select or add a department to manage boxes." />
          )}
        </AdminPanel>

        <AdminPanel title="Courses and links" description={selectedBox ? `Courses inside ${selectedBox.label}. Select a course to add its links here.` : "Choose a box first."}>
          {selectedBox ? (
            <>
              <CourseForm
                busy={busy}
                editing={Boolean(editingCourseId)}
                form={courseForm}
                onCancel={() => {
                  setEditingCourseId("");
                  setCourseForm(emptyCourse);
                }}
                onChange={setCourseForm}
                onSubmit={saveCourse}
              />
              <div className="mt-5">
                <CourseCardList
                  emptyText="No courses in this box yet."
                  courses={courses}
                  selectedId={selectedCourseId}
                  onSelect={(course) => setSelectedCourseId(course.id)}
                  onEdit={(course) => {
                    setEditingCourseId(course.id);
                    setCourseForm({ code: course.code ?? "", name: course.name ?? "", instructor: course.instructor ?? "", link: course.link ?? "" });
                  }}
                  onDelete={(course) =>
                    deleteRow("courses", course, course.name, async () => {
                      if (selectedCourseId === course.id) setSelectedCourseId("");
                      await loadCourses(selectedBoxId);
                    }, setBusy, showMessage)
                  }
                  onMoveUp={(course) => moveRow("courses", courses, course, "up", () => loadCourses(selectedBoxId), setBusy, showMessage)}
                  onMoveDown={(course) => moveRow("courses", courses, course, "down", () => loadCourses(selectedBoxId), setBusy, showMessage)}
                />
              </div>

              <div className="mt-6 rounded-card border border-cyan-300/20 bg-slate-950/70 p-4">
                <div className="mb-4">
                  <h4 className="font-display text-lg font-bold text-white">
                    {selectedCourse ? `Links for ${selectedCourse.name}` : "Course links"}
                  </h4>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedCourse ? "Add Drive files, PDFs, videos, or external links for the selected course." : "Select a course above to add links."}
                  </p>
                </div>

                {selectedCourse ? (
                  <>
                    <LinkForm
                      busy={busy}
                      editing={Boolean(editingLinkId)}
                      form={linkForm}
                      onCancel={() => {
                        setEditingLinkId("");
                        setLinkForm(emptyLink);
                      }}
                      onChange={setLinkForm}
                      onSubmit={saveCourseLink}
                    />
                    <div className="mt-5">
                      <AdminList
                        emptyText="No links for this course yet."
                        rows={links}
                        getTitle={(link) => link.label}
                        getSubtitle={(link) => `${linkTypeLabel(link.type)} - ${link.url}`}
                        onEdit={(link) => {
                          setEditingLinkId(link.id);
                          setLinkForm({ label: link.label ?? "", type: link.type ?? "drive_folder", url: link.url ?? "" });
                        }}
                        onDelete={(link) => deleteRow("resource_links", link, link.label, () => loadLinks(selectedCourseId), setBusy, showMessage)}
                        onMoveUp={(link) => moveRow("resource_links", links, link, "up", () => loadLinks(selectedCourseId), setBusy, showMessage)}
                        onMoveDown={(link) => moveRow("resource_links", links, link, "down", () => loadLinks(selectedCourseId), setBusy, showMessage)}
                      />
                    </div>
                  </>
                ) : (
                  <EmptyPrompt text="Select a course to manage its links." />
                )}
              </div>
            </>
          ) : (
            <EmptyPrompt text="Select a box to manage courses." />
          )}
        </AdminPanel>
      </div>
    </section>
  );
}

function DiplomasManager() {
  const [diplomas, setDiplomas] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedDiplomaId, setSelectedDiplomaId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [diplomaForm, setDiplomaForm] = useState(emptyDiploma);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [editingDiplomaId, setEditingDiplomaId] = useState("");
  const [editingLinkId, setEditingLinkId] = useState("");
  const selectedDiploma = diplomas.find((diploma) => diploma.id === selectedDiplomaId);
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadDiplomas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("diplomas").select("*").order("order", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setDiplomas([]);
    } else {
      setDiplomas(data ?? []);
    }
    setLoading(false);
  }, [showMessage]);

  const loadLinks = useCallback(async (diplomaId) => {
    if (!diplomaId) {
      setLinks([]);
      return;
    }
    const { data, error } = await supabase
      .from("resource_links")
      .select("*")
      .eq("parent_type", "diploma")
      .eq("parent_id", diplomaId)
      .order("order", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setLinks([]);
    } else {
      setLinks(data ?? []);
    }
  }, [showMessage]);

  useEffect(() => {
    loadDiplomas();
  }, [loadDiplomas]);

  useEffect(() => {
    loadLinks(selectedDiplomaId);
    setLinkForm(emptyLink);
    setEditingLinkId("");
  }, [loadLinks, selectedDiplomaId]);

  async function saveDiploma(event) {
    event.preventDefault();
    const name = diplomaForm.name.trim();
    if (!name) {
      showMessage("error", "Please enter the diploma name.");
      return;
    }
    setBusy(true);
    const payload = {
      name,
      name_ar: diplomaForm.name_ar.trim() || null,
      slug: slugify(name),
      description: diplomaForm.description.trim() || null,
      eligibility: diplomaForm.eligibility.trim() || null,
    };
    const request = editingDiplomaId
      ? supabase.from("diplomas").update(payload).eq("id", editingDiplomaId)
      : supabase.from("diplomas").insert({ ...payload, order: diplomas.length });
    const { data, error } = await request.select().single();
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setDiplomaForm(emptyDiploma);
      setEditingDiplomaId("");
      await loadDiplomas();
      if (!editingDiplomaId && data?.id) setSelectedDiplomaId(data.id);
      showMessage("success", editingDiplomaId ? "Diploma updated." : "Diploma added.");
    }
    setBusy(false);
  }

  async function saveDiplomaLink(event) {
    event.preventDefault();
    await saveResourceLink({
      event,
      editingId: editingLinkId,
      form: linkForm,
      links,
      parentId: selectedDiplomaId,
      parentType: "diploma",
      reset: () => {
        setLinkForm(emptyLink);
        setEditingLinkId("");
      },
      reload: () => loadLinks(selectedDiplomaId),
      setBusy,
      showMessage,
    });
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Diplomas", selectedDiploma?.name].filter(Boolean)} message={message} kicker="Diplomas" title="Diplomas admin" />
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <AdminPanel title="Diplomas" description="Add, edit, delete, and reorder diploma cards. The page URL is generated automatically.">
          <DiplomaForm
            busy={busy}
            editing={Boolean(editingDiplomaId)}
            form={diplomaForm}
            onCancel={() => {
              setEditingDiplomaId("");
              setDiplomaForm(emptyDiploma);
            }}
            onChange={setDiplomaForm}
            onSubmit={saveDiploma}
          />
          <div className="mt-5">
            {loading ? (
              <LoadingRows />
            ) : (
              <AdminList
                emptyText="No diplomas yet."
                rows={diplomas}
                selectedId={selectedDiplomaId}
                getTitle={(diploma) => diploma.name}
                getSubtitle={(diploma) => diploma.name_ar}
                onSelect={(diploma) => setSelectedDiplomaId(diploma.id)}
                onEdit={(diploma) => {
                  setEditingDiplomaId(diploma.id);
                  setDiplomaForm({
                    name: diploma.name ?? "",
                    name_ar: diploma.name_ar ?? "",
                    description: diploma.description ?? "",
                    eligibility: diploma.eligibility ?? "",
                  });
                }}
                onDelete={(diploma) =>
                  deleteRow("diplomas", diploma, diploma.name, async () => {
                    if (selectedDiplomaId === diploma.id) setSelectedDiplomaId("");
                    await loadDiplomas();
                  }, setBusy, showMessage)
                }
                onMoveUp={(diploma) => moveRow("diplomas", diplomas, diploma, "up", loadDiplomas, setBusy, showMessage)}
                onMoveDown={(diploma) => moveRow("diplomas", diplomas, diploma, "down", loadDiplomas, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Diploma resource links" description={selectedDiploma ? `Links shown as cards for ${selectedDiploma.name}.` : "Choose a diploma first."}>
          {selectedDiploma ? (
            <>
              <LinkForm
                busy={busy}
                editing={Boolean(editingLinkId)}
                form={linkForm}
                onCancel={() => {
                  setEditingLinkId("");
                  setLinkForm(emptyLink);
                }}
                onChange={setLinkForm}
                onSubmit={saveDiplomaLink}
              />
              <div className="mt-5">
                <AdminList
                  emptyText="No diploma links yet."
                  rows={links}
                  getTitle={(link) => link.label}
                  getSubtitle={(link) => `${linkTypeLabel(link.type)} - ${link.url}`}
                  onEdit={(link) => {
                    setEditingLinkId(link.id);
                    setLinkForm({ label: link.label ?? "", type: link.type ?? "drive_folder", url: link.url ?? "" });
                  }}
                  onDelete={(link) => deleteRow("resource_links", link, link.label, () => loadLinks(selectedDiplomaId), setBusy, showMessage)}
                  onMoveUp={(link) => moveRow("resource_links", links, link, "up", () => loadLinks(selectedDiplomaId), setBusy, showMessage)}
                  onMoveDown={(link) => moveRow("resource_links", links, link, "down", () => loadLinks(selectedDiplomaId), setBusy, showMessage)}
                />
              </div>
            </>
          ) : (
            <EmptyPrompt text="Select a diploma to manage its links." />
          )}
        </AdminPanel>
      </div>
    </section>
  );
}

const emptyAddVideo = { videoUrl: "" };

function TrainingManager() {
  const [sessions, setSessions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [form, setForm] = useState(emptyTraining);
  const [addVideoForm, setAddVideoForm] = useState(emptyAddVideo);
  const [addVideoBusy, setAddVideoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("training_sessions").select("*").order("order", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setSessions([]);
    } else {
      setSessions(data ?? []);
    }
    setLoading(false);
  }, [showMessage]);

  const loadVideos = useCallback(async (sessionId) => {
    if (!sessionId) {
      setVideos([]);
      return;
    }
    const { data, error } = await supabase
      .from("training_videos")
      .select("*")
      .eq("session_id", sessionId)
      .is("category_id", null)
      .order("order", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setVideos([]);
    } else {
      setVideos(data ?? []);
    }
  }, [showMessage]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    loadVideos(selectedSessionId);
  }, [loadVideos, selectedSessionId]);

  async function saveTraining(event) {
    event.preventDefault();
    const title = form.title.trim();
    const videoUrl = form.videoUrl.trim();
    if (!title || !videoUrl) {
      showMessage("error", "Please enter a training title and video URL.");
      return;
    }

    setBusy(true);
    const { data: session, error: sessionError } = await supabase
      .from("training_sessions")
      .insert({
        key: uniqueKey(title),
        title,
        description: form.description.trim() || null,
        mode: "videos",
        order: sessions.length,
      })
      .select()
      .single();

    if (sessionError) {
      showMessage("error", friendlyError(sessionError.message));
      setBusy(false);
      return;
    }

    const expandedVideos = await expandPlaylistIfPossible(videoUrl);
    const videoRows = expandedVideos.map((video, index) => ({
      session_id: session.id,
      category_id: null,
      title: video.title || title,
      description: "",
      youtube_url: video.url,
      duration: "",
      order: index,
    }));

    const { error: videoError } = await supabase.from("training_videos").insert(videoRows);
    if (videoError) {
      showMessage("error", friendlyError(videoError.message));
    } else {
      setForm(emptyTraining);
      await loadSessions();
      setSelectedSessionId(session.id);
      showMessage("success", expandedVideos.length > 1 ? "Training group added with playlist videos." : "Training group added.");
    }
    setBusy(false);
  }

  async function addVideoToSession(event) {
    event.preventDefault();
    if (!selectedSessionId) return;
    const videoUrl = addVideoForm.videoUrl.trim();
    if (!videoUrl) {
      showMessage("error", "Please enter a video or playlist URL.");
      return;
    }

    setAddVideoBusy(true);
    const expandedVideos = await expandPlaylistIfPossible(videoUrl);
    const startOrder = videos.length;
    const videoRows = expandedVideos.map((video, index) => ({
      session_id: selectedSessionId,
      category_id: null,
      title: video.title || selectedSession?.title || "Untitled video",
      description: "",
      youtube_url: video.url,
      duration: "",
      order: startOrder + index,
    }));

    const { error } = await supabase.from("training_videos").insert(videoRows);
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setAddVideoForm(emptyAddVideo);
      await loadVideos(selectedSessionId);
      showMessage("success", expandedVideos.length > 1 ? `Added ${expandedVideos.length} videos from the playlist.` : "Video added to this group.");
    }
    setAddVideoBusy(false);
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Training", selectedSession?.title].filter(Boolean)} message={message} kicker="Training sessions" title="Training admin" />
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <AdminPanel title="Add training group" description="Add a title and a YouTube or Drive link. Playlist expansion uses the Supabase function when it is available.">
          <TrainingForm busy={busy} form={form} onChange={setForm} onSubmit={saveTraining} />
          <div className="mt-5">
            {loading ? (
              <LoadingRows />
            ) : (
              <AdminList
                emptyText="No training groups yet."
                rows={sessions}
                selectedId={selectedSessionId}
                getTitle={(session) => session.title}
                getSubtitle={(session) => session.description}
                onSelect={(session) => setSelectedSessionId(session.id)}
                onEdit={(session) => {
                  setForm({ title: session.title ?? "", description: session.description ?? "", videoUrl: "" });
                  showMessage("success", "Edit the title here, then add a new link if needed.");
                }}
                onDelete={(session) =>
                  deleteRow("training_sessions", session, session.title, async () => {
                    if (selectedSessionId === session.id) setSelectedSessionId("");
                    await loadSessions();
                  }, setBusy, showMessage)
                }
                onMoveUp={(session) => moveRow("training_sessions", sessions, session, "up", loadSessions, setBusy, showMessage)}
                onMoveDown={(session) => moveRow("training_sessions", sessions, session, "down", loadSessions, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Videos in selected group" description={selectedSession ? `Videos under ${selectedSession.title}.` : "Choose a training group to see its videos."}>
          {selectedSession ? (
            <div className="grid gap-5">
              <form onSubmit={addVideoToSession} className="grid gap-3 rounded-card border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-slate-200">+ Add another video to "{selectedSession.title}"</p>
                <TextField
                  label="Video or playlist URL"
                  type="url"
                  value={addVideoForm.videoUrl}
                  onChange={(videoUrl) => setAddVideoForm({ ...addVideoForm, videoUrl })}
                  placeholder="https://youtube.com/..."
                />
                <p className="text-xs text-slate-500 -mt-1">A playlist URL will add every video inside it to this group.</p>
                <button
                  type="submit"
                  disabled={addVideoBusy}
                  className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addVideoBusy ? "Adding..." : "+ Add Video"}
                </button>
              </form>

              <AdminList
                emptyText="No videos in this group yet."
                rows={videos}
                getTitle={(video) => video.title}
                getSubtitle={(video) => video.youtube_url}
                onEdit={(video) => window.open(video.youtube_url, "_blank", "noopener,noreferrer")}
                onDelete={(video) => deleteRow("training_videos", video, video.title, () => loadVideos(selectedSessionId), setBusy, showMessage)}
                onMoveUp={(video) => moveRow("training_videos", videos, video, "up", () => loadVideos(selectedSessionId), setBusy, showMessage)}
                onMoveDown={(video) => moveRow("training_videos", videos, video, "down", () => loadVideos(selectedSessionId), setBusy, showMessage)}
                editLabel="Open"
              />
            </div>
          ) : (
            <EmptyPrompt text="Select a training group first." />
          )}
        </AdminPanel>
      </div>
    </section>
  );
}

const emptyAboutForm = {
  about_what_title: "",
  about_what_title_ar: "",
  about_what_body: "",
  about_what_body_ar: "",
  about_fscu_title: "",
  about_fscu_title_ar: "",
  about_fscu_content: "",
  about_fscu_content_ar: "",
  about_students_title: "",
  about_students_title_ar: "",
  about_students_body: "",
  about_students_body_ar: "",
};

const ABOUT_COLUMNS = Object.keys(emptyAboutForm).join(", ");

function AboutManager() {
  const [form, setForm] = useState(emptyAboutForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadAbout() {
      const { data, error } = await supabase.from("site_config").select(ABOUT_COLUMNS).eq("id", 1).single();
      if (error) {
        setMessage({ type: "error", text: friendlyError(error.message) });
      } else if (data) {
        const sanitized = Object.fromEntries(
          Object.keys(emptyAboutForm).map((key) => [key, data[key] ?? ""])
        );
        setForm(sanitized);
      }
      setLoading(false);
    }
    loadAbout();
  }, []);

  async function saveAbout(event) {
    event.preventDefault();
    setBusy(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim() ? value : null])
    );
    const { error } = await supabase.from("site_config").update(payload).eq("id", 1);
    setMessage(error ? { type: "error", text: friendlyError(error.message) } : { type: "success", text: "About page saved." });
    setBusy(false);
  }

  function set(key) {
    return (value) => setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) return <EmptyPrompt text="Loading About page content..." />;

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["About Page"]} message={message} kicker="Site content" title="About page admin" />
      <form onSubmit={saveAbout} className="grid gap-5">
        <AdminPanel title='Section 1 — "What is 3loomangy?"' description="Explains what the team does. Keep it clear this is a volunteer student initiative, not the student union or the faculty administration.">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Title (English)" value={form.about_what_title} onChange={set("about_what_title")} placeholder="What is 3loomangy?" />
            <TextField label="Title (Arabic)" value={form.about_what_title_ar} onChange={set("about_what_title_ar")} placeholder="إيه هو 3loomangy؟" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TextareaField label="Body (English)" value={form.about_what_body} onChange={set("about_what_body")} />
            <TextareaField label="Body (Arabic)" value={form.about_what_body_ar} onChange={set("about_what_body_ar")} />
          </div>
        </AdminPanel>

        <AdminPanel title="Section 2 — About FSCU" description="General info about the Faculty of Science, Cairo University. Supports multiple paragraphs — separate them with a blank line.">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Title (English)" value={form.about_fscu_title} onChange={set("about_fscu_title")} placeholder="About FSCU" />
            <TextField label="Title (Arabic)" value={form.about_fscu_title_ar} onChange={set("about_fscu_title_ar")} placeholder="عن FSCU" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-slate-300">Content (English)</span>
              <textarea
                value={form.about_fscu_content}
                onChange={(event) => set("about_fscu_content")(event.target.value)}
                rows={8}
                className="mt-1 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-slate-300">Content (Arabic)</span>
              <textarea
                value={form.about_fscu_content_ar}
                onChange={(event) => set("about_fscu_content_ar")(event.target.value)}
                rows={8}
                dir="rtl"
                className="mt-1 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel title="Section 3 — Built by students, for students">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Title (English)" value={form.about_students_title} onChange={set("about_students_title")} placeholder="Built by students, for students" />
            <TextField label="Title (Arabic)" value={form.about_students_title_ar} onChange={set("about_students_title_ar")} placeholder="من الطلبة وللطلبة" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TextareaField label="Body (English)" value={form.about_students_body} onChange={set("about_students_body")} />
            <TextareaField label="Body (Arabic)" value={form.about_students_body_ar} onChange={set("about_students_body_ar")} />
          </div>
        </AdminPanel>

        <button
          type="submit"
          disabled={busy}
          className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save About Page"}
        </button>
      </form>
    </section>
  );
}

const TEAM_SUBTABS = [
  { key: "events", label: "Events" },
  { key: "services", label: "Services" },
];

function TeamWorkManager() {
  const [activeSubTab, setActiveSubTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [eventNowId, setEventNowId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [editingEventId, setEditingEventId] = useState("");
  const [editingServiceId, setEditingServiceId] = useState("");
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadEvents = useCallback(async () => {
    const { data, error } = await supabase.from("team_events").select("*").order("date", { ascending: false });
    if (error) showMessage("error", friendlyError(error.message));
    else setEvents(data ?? []);
  }, [showMessage]);

  const loadServices = useCallback(async () => {
    const { data, error } = await supabase.from("team_services").select("*").order("order");
    if (error) showMessage("error", friendlyError(error.message));
    else setServices(data ?? []);
  }, [showMessage]);

  const loadEventNow = useCallback(async () => {
    const { data } = await supabase.from("site_config").select("event_now_id").eq("id", 1).single();
    if (data?.event_now_id) setEventNowId(data.event_now_id);
  }, []);

  useEffect(() => {
    Promise.all([loadEvents(), loadServices(), loadEventNow()]).finally(() => setLoading(false));
  }, [loadEvents, loadServices, loadEventNow]);

  async function saveEvent(event) {
    event.preventDefault();
    const title = eventForm.title.trim();
    if (!title) { showMessage("error", "Please enter an event title."); return; }
    setBusy(true);
    const payload = {
      title,
      description: eventForm.description.trim() || null,
      date: eventForm.date || null,
      location: eventForm.location.trim() || null,
      register_link: eventForm.register_link.trim() || null,
      image_url: eventForm.image_url.trim() || null,
      is_past: eventForm.is_past,
      registration_open: eventForm.registration_open,
      registration_message: eventForm.registration_message.trim() || null,
    };
    const request = editingEventId
      ? supabase.from("team_events").update(payload).eq("id", editingEventId)
      : supabase.from("team_events").insert(payload);
    const { error } = await request;
    if (error) showMessage("error", friendlyError(error.message));
    else {
      setEventForm(emptyEvent);
      setEditingEventId("");
      await loadEvents();
      showMessage("success", editingEventId ? "Event updated." : "Event added.");
    }
    setBusy(false);
  }

  async function saveService(event) {
    event.preventDefault();
    const title = serviceForm.title.trim();
    if (!title) { showMessage("error", "Please enter a service title."); return; }
    setBusy(true);
    const payload = {
      title,
      description: serviceForm.description.trim() || null,
      contact_link: serviceForm.contact_link.trim() || null,
    };
    const request = editingServiceId
      ? supabase.from("team_services").update(payload).eq("id", editingServiceId)
      : supabase.from("team_services").insert({ ...payload, order: services.length });
    const { error } = await request;
    if (error) showMessage("error", friendlyError(error.message));
    else {
      setServiceForm(emptyService);
      setEditingServiceId("");
      await loadServices();
      showMessage("success", editingServiceId ? "Service updated." : "Service added.");
    }
    setBusy(false);
  }

  async function saveEventNow(event) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("site_config").update({ event_now_id: eventNowId || null }).eq("id", 1);
    if (error) showMessage("error", friendlyError(error.message));
    else showMessage("success", "Event Now updated.");
    setBusy(false);
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Team Work"]} message={message} kicker="Team content" title="Manage team events and services" />
      
      {/* Event Now Control */}
      <AdminPanel title="Event Now" description="Select the current event to highlight on the Team page.">
        <form onSubmit={saveEventNow} className="grid gap-3">
          <label>
            <span className="text-sm font-medium text-slate-300">Select Event</span>
            <select
              value={eventNowId}
              onChange={(e) => setEventNowId(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
            >
              <option value="">None</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} {e.date ? `(${new Date(e.date).toLocaleDateString()})` : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Set Event Now"}
          </button>
        </form>
      </AdminPanel>
      
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TEAM_SUBTABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSubTab(tab.key)}
            className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeSubTab === tab.key
                ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/40"
                : "border border-slate-800 bg-slate-900 text-slate-200 hover:border-cyan-300 hover:text-cyan-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "events" && (
        <AdminPanel title="Events" description="Add, edit, and manage team events.">
          <form onSubmit={saveEvent} className="grid gap-3">
            <TextField label="Event title" value={eventForm.title} onChange={(title) => setEventForm({ ...eventForm, title })} placeholder="Event name" />
            <TextareaField label="Description (optional)" value={eventForm.description} onChange={(description) => setEventForm({ ...eventForm, description })} />
            <TextField label="Date" type="date" value={eventForm.date} onChange={(date) => setEventForm({ ...eventForm, date })} />
            <TextField label="Location (optional)" value={eventForm.location} onChange={(location) => setEventForm({ ...eventForm, location })} placeholder="Event location" />
            <TextField label="Image URL (optional)" type="url" value={eventForm.image_url} onChange={(image_url) => setEventForm({ ...eventForm, image_url })} placeholder="https://..." />
            <TextField label="Registration link (optional)" type="url" value={eventForm.register_link} onChange={(register_link) => setEventForm({ ...eventForm, register_link })} placeholder="https://..." />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={eventForm.is_past} onChange={(e) => setEventForm({ ...eventForm, is_past: e.target.checked })} className="rounded border-slate-700 bg-slate-950" />
              Mark as past event
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={eventForm.registration_open} onChange={(e) => setEventForm({ ...eventForm, registration_open: e.target.checked })} className="rounded border-slate-700 bg-slate-950" />
              Registration open
            </label>
            <TextField label="Registration message (shown when closed)" value={eventForm.registration_message} onChange={(registration_message) => setEventForm({ ...eventForm, registration_message })} placeholder="Registration closed" />
            <FormActions busy={busy} editing={Boolean(editingEventId)} createLabel="+ Add Event" saveLabel="Save Event" onCancel={() => { setEditingEventId(""); setEventForm(emptyEvent); }} />
          </form>
          <div className="mt-5">
            {loading ? <LoadingRows /> : (
              <AdminList
                emptyText="No events yet."
                rows={events}
                getTitle={(e) => e.title}
                getSubtitle={(e) => `${e.date ? new Date(e.date).toLocaleDateString() : ''} ${e.location ? `• ${e.location}` : ''} ${e.is_past ? '(Past)' : ''}`}
                onEdit={(e) => { setEditingEventId(e.id); setEventForm({ title: e.title ?? "", description: e.description ?? "", date: e.date ?? "", location: e.location ?? "", register_link: e.register_link ?? "", image_url: e.image_url ?? "", is_past: e.is_past ?? false, registration_open: e.registration_open ?? true, registration_message: e.registration_message ?? "" }); }}
                onDelete={(e) => deleteRow("team_events", e, e.title, loadEvents, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>
      )}

      {activeSubTab === "services" && (
        <AdminPanel title="Services" description="Add, edit, and reorder team services.">
          <form onSubmit={saveService} className="grid gap-3">
            <TextField label="Service title" value={serviceForm.title} onChange={(title) => setServiceForm({ ...serviceForm, title })} placeholder="Service name" />
            <TextareaField label="Description (optional)" value={serviceForm.description} onChange={(description) => setServiceForm({ ...serviceForm, description })} />
            <TextField label="Contact link (optional)" type="url" value={serviceForm.contact_link} onChange={(contact_link) => setServiceForm({ ...serviceForm, contact_link })} placeholder="https://..." />
            <FormActions busy={busy} editing={Boolean(editingServiceId)} createLabel="+ Add Service" saveLabel="Save Service" onCancel={() => { setEditingServiceId(""); setServiceForm(emptyService); }} />
          </form>
          <div className="mt-5">
            {loading ? <LoadingRows /> : (
              <AdminList
                emptyText="No services yet."
                rows={services}
                getTitle={(s) => s.title}
                getSubtitle={(s) => s.description}
                onEdit={(s) => { setEditingServiceId(s.id); setServiceForm({ title: s.title ?? "", description: s.description ?? "", contact_link: s.contact_link ?? "" }); }}
                onDelete={(s) => deleteRow("team_services", s, s.title, loadServices, setBusy, showMessage)}
                onMoveUp={(s) => moveRow("team_services", services, s, "up", loadServices, setBusy, showMessage)}
                onMoveDown={(s) => moveRow("team_services", services, s, "down", loadServices, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>
      )}
    </section>
  );
}

const emptyTeamIntroForm = {
  team_intro_title: "",
  team_intro_title_ar: "",
  team_intro_body: "",
  team_intro_body_ar: "",
};

const TEAM_INTRO_COLUMNS = Object.keys(emptyTeamIntroForm).join(", ");

function TeamCommitteesManager() {
  const [introForm, setIntroForm] = useState(emptyTeamIntroForm);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [committeeForm, setCommitteeForm] = useState(emptyCommittee);
  const [editingCommitteeId, setEditingCommitteeId] = useState("");
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadIntro = useCallback(async () => {
    const { data, error } = await supabase.from("site_config").select(TEAM_INTRO_COLUMNS).eq("id", 1).single();
    if (error) {
      setMessage({ type: "error", text: friendlyError(error.message) });
    } else if (data) {
      const sanitized = Object.fromEntries(
        Object.keys(emptyTeamIntroForm).map((key) => [key, data[key] ?? ""])
      );
      setIntroForm(sanitized);
    }
  }, [showMessage]);

  const loadCommittees = useCallback(async () => {
    const { data, error } = await supabase.from("team_committees").select("*").order("order", { ascending: true });
    if (error) showMessage("error", friendlyError(error.message));
    else setCommittees(data ?? []);
  }, [showMessage]);

  useEffect(() => {
    Promise.all([loadIntro(), loadCommittees()]).finally(() => setLoading(false));
  }, [loadIntro, loadCommittees]);

  async function saveIntro(event) {
    event.preventDefault();
    setBusy(true);
    const payload = Object.fromEntries(
      Object.entries(introForm).map(([key, value]) => [key, value.trim() ? value : null])
    );
    const { error } = await supabase.from("site_config").update(payload).eq("id", 1);
    setMessage(error ? { type: "error", text: friendlyError(error.message) } : { type: "success", text: "Intro saved." });
    setBusy(false);
  }

  async function saveCommittee(event) {
    event.preventDefault();
    const name = committeeForm.name.trim();
    if (!name) { showMessage("error", "Please enter a committee name."); return; }
    setBusy(true);
    const payload = Object.fromEntries(
      Object.entries(committeeForm).map(([key, value]) => [key, value.trim() ? value : null])
    );
    if (editingCommitteeId) {
      const { error } = await supabase.from("team_committees").update(payload).eq("id", editingCommitteeId);
      setMessage(error ? { type: "error", text: friendlyError(error.message) } : { type: "success", text: "Committee updated." });
    } else {
      const { error } = await supabase.from("team_committees").insert([{ ...payload, order: committees.length }]);
      setMessage(error ? { type: "error", text: friendlyError(error.message) } : { type: "success", text: "Committee added." });
    }
    if (!message.type) {
      setCommitteeForm(emptyCommittee);
      setEditingCommitteeId("");
      loadCommittees();
    }
    setBusy(false);
  }

  function setIntro(key) {
    return (value) => setIntroForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) return <EmptyPrompt text="Loading team committees..." />;

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Team Committees"]} message={message} kicker="Team" title="Team committees admin" />
      
      {/* Intro Section */}
      <form onSubmit={saveIntro} className="grid gap-5">
        <AdminPanel title="Page Intro" description="Edit the intro text shown at the top of the Meet the Team page.">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Title (English)" value={introForm.team_intro_title} onChange={setIntro("team_intro_title")} placeholder="Meet the Team" />
            <TextField label="Title (Arabic)" value={introForm.team_intro_title_ar} onChange={setIntro("team_intro_title_ar")} placeholder="اعرف تيم علومنجي" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TextareaField label="Body (English)" value={introForm.team_intro_body} onChange={setIntro("team_intro_body")} />
            <TextareaField label="Body (Arabic)" value={introForm.team_intro_body_ar} onChange={setIntro("team_intro_body_ar")} />
          </div>
          <FormActions busy={busy} editing={false} createLabel="Save Intro" saveLabel="Save Intro" onCancel={() => {}} />
        </AdminPanel>
      </form>

      {/* Committees Section */}
      <AdminPanel title="Committees" description="Add, edit, and reorder team committees.">
        <form onSubmit={saveCommittee} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Name (English)" value={committeeForm.name} onChange={(name) => setCommitteeForm({ ...committeeForm, name })} placeholder="Committee name" />
            <TextField label="Name (Arabic)" value={committeeForm.name_ar} onChange={(name_ar) => setCommitteeForm({ ...committeeForm, name_ar })} placeholder="اسم اللجنة" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextareaField label="Description (English)" value={committeeForm.description} onChange={(description) => setCommitteeForm({ ...committeeForm, description })} />
            <TextareaField label="Description (Arabic)" value={committeeForm.description_ar} onChange={(description_ar) => setCommitteeForm({ ...committeeForm, description_ar })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-slate-300">Responsibilities (English)</span>
              <textarea
                value={committeeForm.responsibilities}
                onChange={(event) => setCommitteeForm({ ...committeeForm, responsibilities: event.target.value })}
                rows={6}
                className="mt-1 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-slate-300">Responsibilities (Arabic)</span>
              <textarea
                value={committeeForm.responsibilities_ar}
                onChange={(event) => setCommitteeForm({ ...committeeForm, responsibilities_ar: event.target.value })}
                rows={6}
                dir="rtl"
                className="mt-1 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
              />
            </label>
          </div>
          <TextField label="Head Name (optional)" value={committeeForm.head_name} onChange={(head_name) => setCommitteeForm({ ...committeeForm, head_name })} placeholder="Committee lead" />
          <TextField label="Contact Link (optional)" type="url" value={committeeForm.contact_link} onChange={(contact_link) => setCommitteeForm({ ...committeeForm, contact_link })} placeholder="https://..." />
          <TextField label="Icon (optional)" value={committeeForm.icon} onChange={(icon) => setCommitteeForm({ ...committeeForm, icon })} placeholder="emoji or icon key" />
          <FormActions busy={busy} editing={Boolean(editingCommitteeId)} createLabel="+ Add Committee" saveLabel="Save Committee" onCancel={() => { setEditingCommitteeId(""); setCommitteeForm(emptyCommittee); }} />
        </form>
        <div className="mt-5">
          {loading ? <LoadingRows /> : (
            <AdminList
              emptyText="No committees yet."
              rows={committees}
              getTitle={(c) => c.name}
              getSubtitle={(c) => c.description}
              onEdit={(c) => { setEditingCommitteeId(c.id); setCommitteeForm({ name: c.name ?? "", name_ar: c.name_ar ?? "", description: c.description ?? "", description_ar: c.description_ar ?? "", responsibilities: c.responsibilities ?? "", responsibilities_ar: c.responsibilities_ar ?? "", head_name: c.head_name ?? "", contact_link: c.contact_link ?? "", icon: c.icon ?? "" }); }}
              onDelete={(c) => deleteRow("team_committees", c, c.name, loadCommittees, setBusy, showMessage)}
              onMoveUp={(c) => moveRow("team_committees", committees, c, "up", loadCommittees, setBusy, showMessage)}
              onMoveDown={(c) => moveRow("team_committees", committees, c, "down", loadCommittees, setBusy, showMessage)}
            />
          )}
        </div>
      </AdminPanel>
    </section>
  );
}

function JoinRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [joinConfig, setJoinConfig] = useState({ is_open: false, message: "" });
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadRequests = useCallback(async () => {
    const { data, error } = await supabase.from("join_requests").select("*").order("created_at", { ascending: false });
    if (error) showMessage("error", friendlyError(error.message));
    else setRequests(data ?? []);
    setLoading(false);
  }, [showMessage]);

  const loadJoinConfig = useCallback(async () => {
    const { data } = await supabase.from("site_config").select("join_requests_open, join_requests_message").eq("id", 1).single();
    if (data) {
      setJoinConfig({
        is_open: data.join_requests_open ?? false,
        message: data.join_requests_message ?? "",
      });
    }
  }, []);

  useEffect(() => { loadRequests(); loadJoinConfig(); }, [loadRequests, loadJoinConfig]);

  async function markAsReviewed(request) {
    setBusy(true);
    const { error } = await supabase.from("join_requests").update({ status: "reviewed" }).eq("id", request.id);
    if (error) showMessage("error", friendlyError(error.message));
    else {
      await loadRequests();
      showMessage("success", "Request marked as reviewed.");
    }
    setBusy(false);
  }

  async function deleteRequest(request) {
    if (!window.confirm(`Delete request from "${request.name}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("join_requests").delete().eq("id", request.id);
    if (error) showMessage("error", friendlyError(error.message));
    else {
      await loadRequests();
      showMessage("success", "Request deleted.");
    }
    setBusy(false);
  }

  async function saveJoinConfig(event) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("site_config").update({
      join_requests_open: joinConfig.is_open,
      join_requests_message: joinConfig.message,
    }).eq("id", 1);
    if (error) showMessage("error", friendlyError(error.message));
    else showMessage("success", "Join requests settings updated.");
    setBusy(false);
  }

  const filteredRequests = statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Join Requests"]} message={message} kicker="Team recruitment" title="Manage join requests" />
      
      <AdminPanel title="Join requests status" description="Control whether the Join Us form is open to submissions and set a custom message.">
        <form onSubmit={saveJoinConfig} className="grid gap-3">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={joinConfig.is_open}
              onChange={(e) => setJoinConfig({ ...joinConfig, is_open: e.target.checked })}
              className="rounded border-slate-700 bg-slate-950"
            />
            <span className="font-semibold">Accepting new applications</span>
          </label>
          <TextareaField
            label="Closed message (shown when applications are closed)"
            value={joinConfig.message}
            onChange={(message) => setJoinConfig({ ...joinConfig, message })}
            placeholder="Applications are currently closed. Check back later!"
          />
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </AdminPanel>
      
      <AdminPanel title="Join requests" description="View and manage requests from students who want to join the team.">
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`min-h-9 rounded-card border px-3 py-1.5 text-xs font-semibold transition ${statusFilter === "all" ? "border-cyan-300 bg-cyan-300/10 text-cyan-100" : "border-slate-700 text-slate-300 hover:border-cyan-300"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("new")}
            className={`min-h-9 rounded-card border px-3 py-1.5 text-xs font-semibold transition ${statusFilter === "new" ? "border-cyan-300 bg-cyan-300/10 text-cyan-100" : "border-slate-700 text-slate-300 hover:border-cyan-300"}`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("reviewed")}
            className={`min-h-9 rounded-card border px-3 py-1.5 text-xs font-semibold transition ${statusFilter === "reviewed" ? "border-cyan-300 bg-cyan-300/10 text-cyan-100" : "border-slate-700 text-slate-300 hover:border-cyan-300"}`}
          >
            Reviewed
          </button>
        </div>

        {loading ? (
          <LoadingRows />
        ) : filteredRequests.length === 0 ? (
          <EmptyPrompt text={statusFilter === "all" ? "No join requests yet." : `No ${statusFilter} requests.`} />
        ) : (
          <ul className="grid gap-2">
            {filteredRequests.map((request) => (
              <li key={request.id} className="rounded-card border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{request.name}</p>
                    <p className="text-xs text-slate-400">{request.email}</p>
                    {request.phone && <p className="text-xs text-slate-400">{request.phone}</p>}
                    <p className="text-xs text-slate-500 mt-1">{request.faculty_level} • {new Date(request.created_at).toLocaleDateString()}</p>
                    {request.message && <p className="mt-2 text-xs text-slate-300 line-clamp-2">{request.message}</p>}
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${request.status === "new" ? "bg-cyan-300/10 text-cyan-200" : "bg-slate-700 text-slate-400"}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {request.status === "new" && (
                      <IconButton disabled={busy} label="Mark as reviewed" onClick={() => markAsReviewed(request)}>
                        Mark reviewed
                      </IconButton>
                    )}
                    <IconButton danger disabled={busy} label="Delete request" onClick={() => deleteRequest(request)}>
                      Delete
                    </IconButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </section>
  );
}

function SpecialSectionsManager() {
  const [sections, setSections] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sectionForm, setSectionForm] = useState(emptySection);
  const [linkForm, setLinkForm] = useState(emptyLink);
  const [editingSectionId, setEditingSectionId] = useState("");
  const [editingLinkId, setEditingLinkId] = useState("");
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const loadSections = useCallback(async () => {
    const { data, error } = await supabase.from("special_sections").select("*").order("order");
    if (error) showMessage("error", friendlyError(error.message));
    else setSections(data ?? []);
    setLoading(false);
  }, [showMessage]);

  const loadLinks = useCallback(async (sectionId) => {
    if (!sectionId) { setLinks([]); return; }
    const { data, error } = await supabase
      .from("resource_links")
      .select("*")
      .eq("parent_type", "section")
      .eq("parent_id", sectionId)
      .order("order");
    if (error) showMessage("error", friendlyError(error.message));
    else setLinks(data ?? []);
  }, [showMessage]);

  useEffect(() => { loadSections(); }, [loadSections]);
  useEffect(() => { loadLinks(selectedSectionId); setLinkForm(emptyLink); setEditingLinkId(""); }, [loadLinks, selectedSectionId]);

  async function saveSection(event) {
    event.preventDefault();
    const name_en = sectionForm.name_en.trim();
    if (!name_en) { showMessage("error", "Please enter a section name."); return; }
    setBusy(true);
    const slug = sectionForm.slug.trim() || slugify(name_en);
    const payload = {
      name_en,
      name_ar: sectionForm.name_ar.trim() || null,
      slug,
    };
    const request = editingSectionId
      ? supabase.from("special_sections").update(payload).eq("id", editingSectionId)
      : supabase.from("special_sections").insert({ ...payload, order: sections.length });
    const { data, error } = await request.select().single();
    if (error) showMessage("error", friendlyError(error.message));
    else {
      setSectionForm(emptySection);
      setEditingSectionId("");
      await loadSections();
      if (!editingSectionId && data?.id) setSelectedSectionId(data.id);
      showMessage("success", editingSectionId ? "Section updated." : "Section added.");
    }
    setBusy(false);
  }

  async function saveSectionLink(event) {
    event.preventDefault();
    await saveResourceLink({
      event,
      editingId: editingLinkId,
      form: linkForm,
      links,
      parentId: selectedSectionId,
      parentType: "section",
      reset: () => { setLinkForm(emptyLink); setEditingLinkId(""); },
      reload: () => loadLinks(selectedSectionId),
      setBusy,
      showMessage,
    });
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel
        breadcrumb={["Special Sections", selectedSection?.name_en].filter(Boolean)}
        message={message}
        kicker="Special content"
        title="Special Sections"
      />
      <p className="text-sm text-slate-400 -mt-3">
        Special sections like equivalency exams and other links that appear on the Materials page.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <AdminPanel title="Special Sections" description="Add, edit, and reorder special sections.">
          <form onSubmit={saveSection} className="grid gap-3">
            <TextField label="Section name (English)" value={sectionForm.name_en} onChange={(name_en) => setSectionForm({ ...sectionForm, name_en })} placeholder="Equivalency Exams" />
            <TextField label="Section name (Arabic, optional)" value={sectionForm.name_ar} onChange={(name_ar) => setSectionForm({ ...sectionForm, name_ar })} placeholder="امتحانات المعادلة" />
            <TextField label="Slug (optional)" value={sectionForm.slug} onChange={(slug) => setSectionForm({ ...sectionForm, slug })} placeholder="equivalency-exams" />
            <p className="text-xs text-slate-500 -mt-1">Auto-generated from English name if left blank.</p>
            <FormActions busy={busy} editing={Boolean(editingSectionId)} createLabel="+ Add Section" saveLabel="Save Section" onCancel={() => { setEditingSectionId(""); setSectionForm(emptySection); }} />
          </form>
          <div className="mt-5">
            {loading ? (
              <LoadingRows />
            ) : (
              <AdminList
                emptyText="No special sections yet."
                rows={sections}
                selectedId={selectedSectionId}
                getTitle={(s) => s.name_en}
                getSubtitle={(s) => s.name_ar}
                onSelect={(s) => setSelectedSectionId(s.id)}
                onEdit={(s) => {
                  setEditingSectionId(s.id);
                  setSectionForm({ name_en: s.name_en ?? "", name_ar: s.name_ar ?? "", slug: s.slug ?? "" });
                }}
                onDelete={(s) => deleteRow("special_sections", s, s.name_en, async () => {
                  if (selectedSectionId === s.id) setSelectedSectionId("");
                  await loadSections();
                }, setBusy, showMessage)}
                onMoveUp={(s) => moveRow("special_sections", sections, s, "up", loadSections, setBusy, showMessage)}
                onMoveDown={(s) => moveRow("special_sections", sections, s, "down", loadSections, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>

        <AdminPanel
          title="Section resources"
          description={selectedSection ? `Links shown when students click "${selectedSection.name_en}".` : "Choose a section to manage its resources."}
        >
          {selectedSection ? (
            <>
              <LinkForm
                busy={busy}
                editing={Boolean(editingLinkId)}
                form={linkForm}
                onCancel={() => { setEditingLinkId(""); setLinkForm(emptyLink); }}
                onChange={setLinkForm}
                onSubmit={saveSectionLink}
              />
              <div className="mt-5">
                <AdminList
                  emptyText="No resources yet."
                  rows={links}
                  getTitle={(l) => l.label}
                  getSubtitle={(l) => `${linkTypeLabel(l.type)} - ${l.url}`}
                  onEdit={(l) => { setEditingLinkId(l.id); setLinkForm({ label: l.label ?? "", type: l.type ?? "drive_folder", url: l.url ?? "" }); }}
                  onDelete={(l) => deleteRow("resource_links", l, l.label, () => loadLinks(selectedSectionId), setBusy, showMessage)}
                  onMoveUp={(l) => moveRow("resource_links", links, l, "up", () => loadLinks(selectedSectionId), setBusy, showMessage)}
                  onMoveDown={(l) => moveRow("resource_links", links, l, "down", () => loadLinks(selectedSectionId), setBusy, showMessage)}
                />
              </div>
            </>
          ) : (
            <EmptyPrompt text="Select a section to manage its resources." />
          )}
        </AdminPanel>
      </div>
    </section>
  );
}

function ContactManager() {
  const [contactForm, setContactForm] = useState(emptyContact);
  const [links, setLinks] = useState([]);
  const [linkForm, setLinkForm] = useState(emptySocialLink);
  const [editingLinkId, setEditingLinkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadContact = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_config")
      .select("whatsapp_number, facebook_url, youtube_url, linkedin_url, whatsapp_channel_url")
      .eq("id", 1)
      .single();
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setContactForm({
        whatsapp_number: data?.whatsapp_number ?? "",
        facebook_url: data?.facebook_url ?? "",
        youtube_url: data?.youtube_url ?? "",
        linkedin_url: data?.linkedin_url ?? "",
        whatsapp_channel_url: data?.whatsapp_channel_url ?? "",
      });
    }
  }, [showMessage]);

  const loadLinks = useCallback(async () => {
    const { data, error } = await supabase.from("social_links").select("*").order("order", { ascending: true });
    if (error) showMessage("error", friendlyError(error.message));
    else setLinks(data ?? []);
  }, [showMessage]);

  useEffect(() => {
    Promise.all([loadContact(), loadLinks()]).finally(() => setLoading(false));
  }, [loadContact, loadLinks]);

  async function saveContact(event) {
    event.preventDefault();
    setBusy(true);
    const payload = {
      whatsapp_number: contactForm.whatsapp_number.trim() || null,
      facebook_url: contactForm.facebook_url.trim() || null,
      youtube_url: contactForm.youtube_url.trim() || null,
      linkedin_url: contactForm.linkedin_url.trim() || null,
      whatsapp_channel_url: contactForm.whatsapp_channel_url.trim() || null,
    };
    const { error } = await supabase.from("site_config").update(payload).eq("id", 1);
    if (error) showMessage("error", friendlyError(error.message));
    else showMessage("success", "Contact links saved.");
    setBusy(false);
  }

  async function saveLink(event) {
    event.preventDefault();
    const label = linkForm.label.trim();
    const url = linkForm.url.trim();
    if (!label || !url) {
      showMessage("error", "Please enter a label and a URL.");
      return;
    }
    setBusy(true);
    const payload = { label, url };
    const request = editingLinkId
      ? supabase.from("social_links").update(payload).eq("id", editingLinkId)
      : supabase.from("social_links").insert({ ...payload, order: links.length });
    const { error } = await request;
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setLinkForm(emptySocialLink);
      setEditingLinkId("");
      await loadLinks();
      showMessage("success", editingLinkId ? "Link updated." : "Link added.");
    }
    setBusy(false);
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Contact & Links"]} message={message} kicker="Site content" title="Contact & social links" />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <AdminPanel title="Main contact links" description="These power the WhatsApp / Facebook / YouTube / LinkedIn buttons on the Home page and Footer.">
          {loading ? <LoadingRows /> : (
            <form onSubmit={saveContact} className="grid gap-3">
              <TextField label="WhatsApp number" value={contactForm.whatsapp_number} onChange={(whatsapp_number) => setContactForm({ ...contactForm, whatsapp_number })} placeholder="+201025005751" />
              <TextField label="Facebook URL" type="url" value={contactForm.facebook_url} onChange={(facebook_url) => setContactForm({ ...contactForm, facebook_url })} placeholder="https://facebook.com/..." />
              <TextField label="YouTube URL" type="url" value={contactForm.youtube_url} onChange={(youtube_url) => setContactForm({ ...contactForm, youtube_url })} placeholder="https://youtube.com/@..." />
              <TextField label="LinkedIn URL" type="url" value={contactForm.linkedin_url} onChange={(linkedin_url) => setContactForm({ ...contactForm, linkedin_url })} placeholder="https://linkedin.com/company/..." />
              <TextField label="WhatsApp Channel URL (optional)" type="url" value={contactForm.whatsapp_channel_url} onChange={(whatsapp_channel_url) => setContactForm({ ...contactForm, whatsapp_channel_url })} placeholder="https://whatsapp.com/channel/..." />
              <button
                type="submit"
                disabled={busy}
                className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save Contact Links"}
              </button>
            </form>
          )}
        </AdminPanel>

        <AdminPanel title="Extra links" description="Add any number of additional links (Instagram, Telegram, Discord, a specific WhatsApp group, etc.) — they show up next to the main links above.">
          <form onSubmit={saveLink} className="grid gap-3">
            <TextField label="Label" value={linkForm.label} onChange={(label) => setLinkForm({ ...linkForm, label })} placeholder="Instagram" />
            <TextField label="URL" type="url" value={linkForm.url} onChange={(url) => setLinkForm({ ...linkForm, url })} placeholder="https://instagram.com/..." />
            <FormActions busy={busy} editing={Boolean(editingLinkId)} createLabel="+ Add Link" saveLabel="Save Link" onCancel={() => { setEditingLinkId(""); setLinkForm(emptySocialLink); }} />
          </form>
          <div className="mt-5">
            {loading ? <LoadingRows /> : (
              <AdminList
                emptyText="No extra links yet."
                rows={links}
                getTitle={(l) => l.label}
                getSubtitle={(l) => l.url}
                onEdit={(l) => { setEditingLinkId(l.id); setLinkForm({ label: l.label ?? "", url: l.url ?? "" }); }}
                onDelete={(l) => deleteRow("social_links", l, l.label, loadLinks, setBusy, showMessage)}
                onMoveUp={(l) => moveRow("social_links", links, l, "up", loadLinks, setBusy, showMessage)}
                onMoveDown={(l) => moveRow("social_links", links, l, "down", loadLinks, setBusy, showMessage)}
              />
            )}
          </div>
        </AdminPanel>
      </div>
    </section>
  );
}

function AdminsManager() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [newEmail, setNewEmail] = useState("");
  const showMessage = useCallback((type, text) => setMessage({ type, text }), []);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admins")
      .select("email, role, added_at")
      .order("added_at", { ascending: true });
    if (error) {
      showMessage("error", friendlyError(error.message));
      setAdmins([]);
    } else {
      setAdmins(data ?? []);
    }
    setLoading(false);
  }, [showMessage]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  async function addAdmin(event) {
    event.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) { showMessage("error", "Please enter an email address."); return; }
    if (admins.some((admin) => admin.email.toLowerCase() === email)) {
      showMessage("error", "This email is already an admin.");
      return;
    }
    setBusy(true);
    // role is always "admin" here — only the owner row (set once, directly in the
    // database) can hold role "owner", and that row can never be created or
    // removed from this screen.
    const { error } = await supabase.from("admins").insert({ email, role: "admin" });
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      setNewEmail("");
      await loadAdmins();
      showMessage("success", `${email} can now sign in as an admin.`);
    }
    setBusy(false);
  }

  async function removeAdmin(admin) {
    if (admin.role === "owner") return; // guarded in the UI and by RLS
    if (!window.confirm(`Remove admin access for "${admin.email}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("admins").delete().eq("email", admin.email);
    if (error) {
      showMessage("error", friendlyError(error.message));
    } else {
      await loadAdmins();
      showMessage("success", `${admin.email} removed.`);
    }
    setBusy(false);
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["Admins"]} message={message} kicker="Access control" title="Manage admins" />
      <AdminPanel
        title="Add an admin"
        description="Anyone added here can sign in with that Google account and reach this dashboard."
      >
        <form onSubmit={addAdmin} className="grid gap-3 sm:max-w-md">
          <TextField
            label="Admin email"
            type="email"
            value={newEmail}
            onChange={setNewEmail}
            placeholder="teammate@gmail.com"
          />
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Adding..." : "+ Add Admin"}
          </button>
        </form>
      </AdminPanel>

      <AdminPanel title="Current admins" description="The owner account cannot be removed from here.">
        {loading ? (
          <LoadingRows />
        ) : admins.length === 0 ? (
          <EmptyPrompt text="No admins found." />
        ) : (
          <ul className="grid gap-2">
            {admins.map((admin) => {
              const isOwner = admin.role === "owner";
              const isSelf = admin.email.toLowerCase() === user?.email?.toLowerCase();
              return (
                <li
                  key={admin.email}
                  className="flex flex-col gap-2 rounded-card border border-slate-800 bg-slate-950/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {admin.email} {isSelf && <span className="text-slate-500">(you)</span>}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${isOwner ? "bg-amber-300/15 text-amber-200" : "bg-cyan-300/10 text-cyan-200"
                        }`}
                    >
                      {isOwner ? "Owner" : "Admin"}
                    </span>
                  </div>
                  <IconButton
                    danger
                    disabled={isOwner || busy}
                    label={isOwner ? "The owner cannot be removed" : "Remove admin"}
                    onClick={() => removeAdmin(admin)}
                  >
                    {isOwner ? "Protected" : "Remove"}
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
      </AdminPanel>
    </section>
  );
}

function HeaderPanel({ breadcrumb, kicker, message, title }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl shadow-slate-950/20 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-200">{kicker}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">{title}</h2>
        </div>
        <Breadcrumb items={breadcrumb} />
      </div>
      {message.text && (
        <div className={`mt-4 rounded-card border p-3 text-sm ${message.type === "error" ? "border-red-400/30 bg-red-950/40 text-red-100" : "border-emerald-400/30 bg-emerald-950/30 text-emerald-100"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ children, description, title }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

function TrackForm({ busy, editing, form, onCancel, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextField label="Department name" value={form.name} onChange={(name) => onChange({ ...form, name })} placeholder="Biochemistry" />
      <TextField label="Arabic name (optional)" value={form.name_ar} onChange={(name_ar) => onChange({ ...form, name_ar })} placeholder="الكيمياء الحيوية" />
      <FormActions busy={busy} editing={editing} createLabel="+ Add Department" saveLabel="Save Department" onCancel={onCancel} />
    </form>
  );
}

function BoxForm({ busy, editing, form, onCancel, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextField label="Box name" value={form.label} onChange={(label) => onChange({ ...form, label })} placeholder="Semester 1" />
      <TextField label="Direct link (optional)" type="url" value={form.link} onChange={(link) => onChange({ ...form, link })} placeholder="https://drive.google.com/..." />
      <p className="text-xs text-slate-500 -mt-1">If set, clicking this box opens the link directly instead of showing courses.</p>
      <FormActions busy={busy} editing={editing} createLabel="+ Add Box" saveLabel="Save Box" onCancel={onCancel} />
    </form>
  );
}

function CourseForm({ busy, editing, form, onCancel, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextField label="Course name" value={form.name} onChange={(name) => onChange({ ...form, name })} placeholder="General Chemistry" />
      <TextField label="Course code" value={form.code} onChange={(code) => onChange({ ...form, code })} placeholder="CHEM 101" />
      <TextField label="Instructor (optional)" value={form.instructor} onChange={(instructor) => onChange({ ...form, instructor })} placeholder="Dr. Name" />
      <TextField label="Direct link (optional)" type="url" value={form.link} onChange={(link) => onChange({ ...form, link })} placeholder="https://drive.google.com/..." />
      <p className="text-xs text-slate-500 -mt-1">If set, clicking this course opens the link directly instead of showing resource links.</p>
      <FormActions busy={busy} editing={editing} createLabel="+ Add Course" saveLabel="Save Course" onCancel={onCancel} />
    </form>
  );
}

function DiplomaForm({ busy, editing, form, onCancel, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextField label="Diploma name" value={form.name} onChange={(name) => onChange({ ...form, name })} placeholder="Clinical Biochemistry Diploma" />
      <TextField label="Arabic name" value={form.name_ar} onChange={(name_ar) => onChange({ ...form, name_ar })} placeholder="اسم الدبلومة بالعربي" />
      <TextareaField label="Description" value={form.description} onChange={(description) => onChange({ ...form, description })} />
      <TextareaField label="Eligibility" value={form.eligibility} onChange={(eligibility) => onChange({ ...form, eligibility })} />
      <FormActions busy={busy} editing={editing} createLabel="+ Add Diploma" saveLabel="Save Diploma" onCancel={onCancel} />
    </form>
  );
}

function TrainingForm({ busy, form, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextField label="Training title" value={form.title} onChange={(title) => onChange({ ...form, title })} placeholder="Intro to Lab Safety" />
      <TextareaField label="Description (optional)" value={form.description} onChange={(description) => onChange({ ...form, description })} />
      <TextField label="Video or playlist URL" type="url" value={form.videoUrl} onChange={(videoUrl) => onChange({ ...form, videoUrl })} placeholder="https://youtube.com/..." />
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving..." : "+ Add Training Group"}
      </button>
    </form>
  );
}

function LinkForm({ busy, editing, form, onCancel, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <TextField label="Display label" value={form.label} onChange={(label) => onChange({ ...form, label })} placeholder="Diploma Materials" />
      <label>
        <span className="text-sm font-medium text-slate-300">Link type</span>
        <select
          value={form.type}
          onChange={(event) => onChange({ ...form, type: event.target.value })}
          className="mt-1 min-h-11 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
        >
          {LINK_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </label>
      <TextField label="URL" type="url" value={form.url} onChange={(url) => onChange({ ...form, url })} placeholder="https://..." />
      <FormActions busy={busy} editing={editing} createLabel="+ Add Link" saveLabel="Save Link" onCancel={onCancel} />
    </form>
  );
}

function TextField({ label, onChange, placeholder, type = "text", value }) {
  return (
    <label>
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
      />
    </label>
  );
}

function TextareaField({ label, onChange, value }) {
  return (
    <label>
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function FormActions({ busy, createLabel, editing, onCancel, saveLabel }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving..." : editing ? saveLabel : createLabel}
      </button>
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function CourseCardList({
  courses,
  emptyText,
  onDelete,
  onEdit,
  onMoveDown,
  onMoveUp,
  onSelect,
  selectedId,
}) {
  if (courses.length === 0) return <EmptyPrompt text={emptyText} />;
  const [query, setQuery] = useState("");
  const visibleCourses = query
    ? courses.filter((course) =>
      [course.name, course.code, course.instructor]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    : courses;

  return (
    <div className="grid gap-3">
      {courses.length > 6 && (
        <TextField label="Search courses" value={query} onChange={setQuery} placeholder="Search by name, code, or instructor" />
      )}
      {visibleCourses.length === 0 ? (
        <EmptyPrompt text="No courses match this search." />
      ) : (
        <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {visibleCourses.map((course) => {
            const index = courses.findIndex((item) => item.id === course.id);
            const selected = selectedId === course.id;

            return (
              <article
                key={course.id}
                className={`rounded-card border p-4 transition ${selected
                    ? "border-cyan-300 bg-cyan-300/10 shadow-lg shadow-cyan-950/30"
                    : "border-slate-800 bg-slate-950/80 hover:border-cyan-300/70"
                  }`}
              >
                <button type="button" onClick={() => onSelect(course)} className="block w-full text-left">
                  <div className="flex min-h-20 flex-col justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {course.code && (
                          <span className="rounded-card border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
                            {course.code}
                          </span>
                        )}
                        {course.link && (
                          <span className="rounded-card border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs font-semibold text-emerald-100">
                            Direct link
                          </span>
                        )}
                      </div>
                      <h4 className="line-clamp-2 text-base font-bold text-white">{course.name}</h4>
                    </div>
                    {course.instructor && <p className="line-clamp-1 text-sm text-slate-400">{course.instructor}</p>}
                  </div>
                </button>

                <div className="mt-4 flex flex-wrap gap-1 border-t border-slate-800 pt-3">
                  <IconButton disabled={index === 0} label="Move up" onClick={() => onMoveUp?.(course)}>Up</IconButton>
                  <IconButton disabled={index === courses.length - 1} label="Move down" onClick={() => onMoveDown?.(course)}>Down</IconButton>
                  <IconButton label="Edit" onClick={() => onEdit?.(course)}>Edit</IconButton>
                  <IconButton danger label="Delete" onClick={() => onDelete?.(course)}>Delete</IconButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminList({
  editLabel = "Edit",
  emptyText,
  getSubtitle,
  getTitle,
  onDelete,
  onEdit,
  onMoveDown,
  onMoveUp,
  onSelect,
  rows,
  selectedId,
}) {
  if (rows.length === 0) return <EmptyPrompt text={emptyText} />;
  const [query, setQuery] = useState("");
  const visibleRows = query
    ? rows.filter((row) =>
      [getTitle(row), getSubtitle?.(row)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    : rows;

  return (
    <div className="grid gap-3">
      {rows.length > 6 && (
        <TextField label="Search this list" value={query} onChange={setQuery} placeholder="Type to filter..." />
      )}
      {visibleRows.length === 0 ? (
        <EmptyPrompt text="No items match this search." />
      ) : (
        <ul className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1">
          {visibleRows.map((row) => {
            const index = rows.findIndex((item) => item.id === row.id);
            const title = getTitle(row);
            const subtitle = getSubtitle?.(row);
            const selected = selectedId === row.id;

            return (
              <li
                key={row.id}
                className={`rounded-card border p-3 transition ${selected ? "border-cyan-300 bg-cyan-300/10" : "border-slate-800 bg-slate-950/80"}`}
              >
                <div className="flex gap-3">
                  {onSelect ? (
                    <button type="button" onClick={() => onSelect(row)} className="min-w-0 flex-1 text-left">
                      <RowText title={title} subtitle={subtitle} />
                    </button>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <RowText title={title} subtitle={subtitle} />
                    </div>
                  )}
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    <IconButton disabled={index === 0} label="Move up" onClick={() => onMoveUp?.(row)}>Up</IconButton>
                    <IconButton disabled={index === rows.length - 1} label="Move down" onClick={() => onMoveDown?.(row)}>Down</IconButton>
                    <IconButton label={editLabel} onClick={() => onEdit?.(row)}>{editLabel}</IconButton>
                    <IconButton danger label="Delete" onClick={() => onDelete?.(row)}>Delete</IconButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RowText({ subtitle, title }) {
  return (
    <>
      <p className="truncate text-sm font-semibold text-white">{title}</p>
      {subtitle && <p className="mt-1 line-clamp-2 break-words text-xs text-slate-400">{subtitle}</p>}
    </>
  );
}

function IconButton({ children, danger = false, disabled, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-9 rounded-card border px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${danger ? "border-red-400/40 text-red-200 hover:bg-red-950/60" : "border-slate-700 text-slate-200 hover:border-cyan-300 hover:text-cyan-100"
        }`}
    >
      {children}
    </button>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300" aria-label="Admin location">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span className="text-slate-600">/</span>}
          <span className={index === items.length - 1 ? "font-semibold text-cyan-200" : ""}>{item}</span>
        </span>
      ))}
    </nav>
  );
}

function EmptyPrompt({ text }) {
  return (
    <div className="rounded-card border border-dashed border-slate-700 bg-slate-950/60 p-5 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="grid gap-2">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-16 animate-pulse rounded-card bg-slate-800/80" />
      ))}
    </div>
  );
}

async function saveResourceLink({ editingId, form, links, parentId, parentType, reload, reset, setBusy, showMessage }) {
  if (!parentId) return;
  const label = form.label.trim();
  const url = form.url.trim();
  if (!label || !url) {
    showMessage("error", "Please enter a display label and URL.");
    return;
  }

  setBusy(true);
  const payload = { label, type: form.type, url, parent_type: parentType, parent_id: parentId };
  const request = editingId
    ? supabase.from("resource_links").update(payload).eq("id", editingId)
    : supabase.from("resource_links").insert({ ...payload, order: links.length });
  const { error } = await request;

  if (error) {
    showMessage("error", friendlyError(error.message));
  } else {
    reset();
    await reload();
    showMessage("success", editingId ? "Link updated." : "Link added.");
  }
  setBusy(false);
}

async function deleteRow(table, row, label, afterDelete, setBusy, showMessage) {
  if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
  setBusy(true);
  const { error } = await supabase.from(table).delete().eq("id", row.id);
  if (error) {
    showMessage("error", friendlyError(error.message));
  } else {
    await afterDelete();
    showMessage("success", `"${label}" deleted.`);
  }
  setBusy(false);
}

async function moveRow(table, rows, row, direction, reload, setBusy, showMessage) {
  const index = rows.findIndex((item) => item.id === row.id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) return;

  const target = rows[targetIndex];
  setBusy(true);
  const results = await Promise.all([
    supabase.from(table).update({ order: target.order ?? targetIndex }).eq("id", row.id),
    supabase.from(table).update({ order: row.order ?? index }).eq("id", target.id),
  ]);
  const error = results.find((result) => result.error)?.error;
  if (error) {
    showMessage("error", friendlyError(error.message));
  } else {
    await reload();
    showMessage("success", "Order updated.");
  }
  setBusy(false);
}

async function expandPlaylistIfPossible(url) {
  const isPlaylist = /[?&]list=/.test(url);
  if (!isPlaylist) return [{ title: "", url }];

  try {
    const { data, error } = await supabase.functions.invoke("expand-youtube-playlist", { body: { url } });
    if (error || !Array.isArray(data?.videos) || data.videos.length === 0) return [{ title: "", url }];
    return data.videos.map((video) => ({ title: video.title ?? "", url: video.url ?? video.youtube_url ?? url }));
  } catch {
    return [{ title: "", url }];
  }
}

function friendlyError(message) {
  if (!message) return "Something went wrong. Please try again.";
  if (message.toLowerCase().includes("permission")) return "You do not have permission to save this change.";
  if (message.toLowerCase().includes("duplicate")) return "This name already exists. Please choose another name.";
  return message;
}

function linkTypeLabel(value) {
  return LINK_TYPES.find((type) => type.value === value)?.label ?? "Link";
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `item-${Date.now()}`;
}

function uniqueKey(value) {
  return `${slugify(value)}-${Date.now()}`;
}