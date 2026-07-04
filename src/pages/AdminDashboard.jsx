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
  ...YEAR_TABS,
  { key: "diplomas", label: "Diplomas" },
  { key: "training", label: "Training" },
  { key: "about", label: "About FSCU" },
];

const LINK_TYPES = [
  { value: "drive_folder", label: "Drive folder" },
  { value: "drive_file", label: "Drive file" },
  { value: "pdf", label: "PDF" },
  { value: "external_link", label: "External link" },
  { value: "video", label: "Video" },
];

const emptyTrack = { name: "", name_ar: "" };
const emptyBox = { label: "" };
const emptyCourse = { code: "", name: "", instructor: "" };
const emptyLink = { label: "", type: "drive_folder", url: "" };
const emptyDiploma = { name: "", name_ar: "", description: "", eligibility: "" };
const emptyTraining = { title: "", description: "", videoUrl: "" };

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState("year-1");
  const activeYear = YEAR_TABS.find((tab) => tab.key === activeTab);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/95 px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">3loomangy admin</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white">Content management</h1>
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

      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-5 flex flex-wrap gap-2">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-11 rounded-card px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-cyan-300 text-slate-950"
                  : "border border-slate-800 bg-slate-900 text-slate-200 hover:border-cyan-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeYear && <YearContentManager key={activeYear.key} year={activeYear.year} title={activeYear.label} />}
        {activeTab === "diplomas" && <DiplomasManager />}
        {activeTab === "training" && <TrainingManager />}
        {activeTab === "about" && <AboutManager />}
      </div>
    </main>
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
    const payload = { label, year, track_id: needsDepartments ? selectedTrackId : null };
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
    const payload = { semester_id: selectedBoxId, name, code, instructor };
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
                    onSelect={(box) => setSelectedBoxId(box.id)}
                    onEdit={(box) => {
                      setEditingBoxId(box.id);
                      setBoxForm({ label: box.label ?? "" });
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
                <AdminList
                  emptyText="No courses in this box yet."
                  rows={courses}
                  selectedId={selectedCourseId}
                  getTitle={(course) => course.name}
                  getSubtitle={(course) => [course.code, course.instructor].filter(Boolean).join(" - ")}
                  onSelect={(course) => setSelectedCourseId(course.id)}
                  onEdit={(course) => {
                    setEditingCourseId(course.id);
                    setCourseForm({ code: course.code ?? "", name: course.name ?? "", instructor: course.instructor ?? "" });
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

function TrainingManager() {
  const [sessions, setSessions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [form, setForm] = useState(emptyTraining);
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
          ) : (
            <EmptyPrompt text="Select a training group first." />
          )}
        </AdminPanel>
      </div>
    </section>
  );
}

function AboutManager() {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadAbout() {
      const { data, error } = await supabase.from("site_config").select("about_fscu_content").eq("id", 1).single();
      if (error) {
        setMessage({ type: "error", text: friendlyError(error.message) });
      } else {
        setContent(data?.about_fscu_content ?? "");
      }
    }
    loadAbout();
  }, []);

  async function saveAbout(event) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("site_config").update({ about_fscu_content: content }).eq("id", 1);
    setMessage(error ? { type: "error", text: friendlyError(error.message) } : { type: "success", text: "About FSCU content saved." });
    setBusy(false);
  }

  return (
    <section className="grid gap-5">
      <HeaderPanel breadcrumb={["About FSCU"]} message={message} kicker="Site content" title="About FSCU admin" />
      <AdminPanel title="About FSCU content" description="Edit the text shown on the public About page and used later by the assistant.">
        <form onSubmit={saveAbout} className="grid gap-3">
          <label>
            <span className="text-sm font-medium text-slate-300">About FSCU text</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={14}
              className="mt-1 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-fit rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save About FSCU"}
          </button>
        </form>
      </AdminPanel>
    </section>
  );
}

function HeaderPanel({ breadcrumb, kicker, message, title }) {
  return (
    <div className="rounded-card border border-slate-800 bg-slate-900 p-5">
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
    <section className="rounded-card border border-slate-800 bg-slate-900 p-5">
      <div className="min-h-20">
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
      <TextField label="Box name" value={form.label} onChange={(label) => onChange({ label })} placeholder="Semester 1" />
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
        className="mt-1 min-h-11 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
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
        className="mt-1 w-full rounded-card border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function FormActions({ busy, createLabel, editing, onCancel, saveLabel }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 rounded-card bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving..." : editing ? saveLabel : createLabel}
      </button>
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-card border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300"
        >
          Cancel
        </button>
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

  return (
    <ul className="grid gap-2">
      {rows.map((row, index) => {
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
      className={`min-h-9 rounded-card border px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
        danger ? "border-red-400/40 text-red-200 hover:bg-red-950/60" : "border-slate-700 text-slate-200 hover:border-cyan-300 hover:text-cyan-100"
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
