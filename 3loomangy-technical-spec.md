# 3loomangy Platform — Technical Build Specification
### From Zero to Production | React + Vite + Firebase (100% Free Tier)

**Audience:** This document is written for the developers who will build this project. It is based on a full crawl of the current live site (`3loomangyana.site`, built on Google Sites) so the data model reflects real, existing content rather than assumptions, plus new features requested by the team that don't exist on the current site yet (Diplomas directory, Team Work/Events/Services, and a faculty-aware AI assistant).

---

## 1. Executive Summary

`3loomangyana.site` is a Google Sites–based academic resource hub for FSCU (Faculty of Science, Cairo University) students, run by the student group **3loomangy**. It organizes study materials in a deep hierarchy (Department → Semester → Course → Google Drive folders) and currently requires manual page creation for every single course — there is a literal note on every page:

> "If you need to add a newable data in website, contact us"

That sentence is the entire justification for this rebuild: **content changes should never require a developer or a new page.** Everything must be data-driven and editable from an Admin Dashboard.

**Goal:** Rebuild the same functional scope — plus search, plus a Diplomas directory, plus a Team Work/Events/Services hub, plus AI — as a React + Vite SPA backed entirely by Firebase's free tier. Total infrastructure cost target: **$0/month**.

---

## 2. Site Audit — What Currently Exists

Crawled and confirmed from the live site on 2026-07-03.

### 2.1 Top-level navigation
```
Home
About FSCU
Materials  (mega-menu, see 2.2)
Training Sessions
Join Us
```

### 2.2 Materials hierarchy (confirmed structure)

```
Materials
├── College Materials
│   ├── New Summaries 2025/2026
│   │   ├── First Level New Summaries 2025/2026
│   │   ├── Second Level New Summaries 2025/2026
│   │   ├── Third Level New Summaries 2025/2026
│   │   └── Fourth Level New Summaries 2025/2026
│   ├── First Level
│   │   ├── Semester 01  (12 courses, e.g. Math 131 - Calculus 1, Phys 101 - Physics, ...)
│   │   ├── Semester 02  (12 courses)
│   │   └── Recruitments (4 courses: U101 Computer, U102 English, U103 Human Rights, U104 Principles of Law)
│   ├── Astrophysics        (Semesters 05, 07, 08)
│   ├── Biochemistry        (Semesters 03–08, 7 courses avg per semester)
│   ├── Biophysics          (Semesters 03–08)
│   ├── Chemistry/Microbiology (Semesters 03–08)
│   ├── Chemistry/Zoology   (Semesters 03–08)
│   ├── Geochemistry        (Semesters 03–06, mostly empty placeholders)
│   ├── Geophysics          (Semesters 03–06)
│   ├── Special Space       (flat page, no sub-semesters)
│   ├── Biotechnology       (2 semesters)
│   ├── Special Physics     (Semesters 03–08)
│   ├── Special Chemistry   (Semesters 03–05)
│   ├── Chemistry/Botany    (flat page, empty)
│   └── Computer Science    (Semesters 03–07)
├── امتحانات المعادلة (Equivalency Exams)  — flat page, Arabic slug
├── Pre - Master and Diploma  — flat page
└── Other Links  — flat page
```

**Key observations:**
- There are **13 departments/tracks** total, all under "College Materials". This list is not final — the Admin Dashboard must let the team add a new track at any time (e.g. a future "Zoology" or "Entomology" track) without a code change or redeploy. This is already true of the `tracks` collection design in section 7; section 16.1 shows the exact admin screen for it.
- Department pages are **not uniform**: some have named semesters, some are flat single pages with no children, some semesters exist but have zero courses listed yet (placeholders for future content)
- "First Level" is special — it has a `Recruitments` bucket (general/humanities requirement courses) in addition to Semester 01 and 02
- Course naming convention: `{Code} {Number} - {English Course Name}` (e.g. `Math 131 - Calculus 1`, `Biochem352 - Proteins`). Spacing between code and number is inconsistent in the source (`Chem316` vs `Chem 316`) — **the new system must not depend on this pattern for parsing; store code and name as separate explicit fields.**
- Three sections outside "College Materials" are flat single-purpose pages, one of them (`امتحانات-المعادلة`) has an **Arabic URL slug** — the new router must support Unicode slugs or provide an English-slug alternative with an Arabic display name.
- **"Pre - Master and Diploma"** exists today as a single flat link-dump page. This is being upgraded into a full first-class **Diplomas directory** (see section 2.7) instead of staying a flat page — this is a real gap in the current site the team specifically asked to fix.

### 2.3 Course page structure (confirmed via `Math 131 - Calculus 1`)

Every course page is minimal: a title, then a short list of external links. Example:

```
Math 131 - Calculus 1
→ Materials            (Google Drive folder link)
→ 3loomangy Summaries  (Google Drive folder link)
→ Exams                (Google Drive folder link)
```

This confirms **the platform does not host files itself** — it only stores metadata + Google Drive folder links, categorized by resource type (raw materials / team-made summaries / past exams). This is important: **no file storage system needs to be built.** The new site should replicate this exact link-list pattern, generalized into N resource links per course rather than hardcoded to 3. The same pattern (a resource-link list attached to a parent) is reused for Diplomas in section 2.7 — one component serves both, see section 8.

### 2.4 Footer (present on every page)
- Text: "If you need to add a newable data in website, contact us" → this becomes obsolete once the Admin Dashboard ships
- WhatsApp direct link (`api.whatsapp.com/send?phone=+201025005751`)
- Facebook page
- YouTube channel
- LinkedIn company page
- WhatsApp Channel link

These five links should become configurable fields in Firestore (a single `siteConfig` document), not hardcoded in components, so the team can update them without a deploy.

### 2.5 Join Us page
Renders with no crawlable static form content — it's almost certainly a Google Form embedded via iframe on the live site. In the rebuild this becomes a native Firestore-backed form (see section 15).

### 2.6 Gaps in the current site (things this rebuild should fix)
1. No search — a student must click through Department → Semester → Course to find one file
2. No way to add content without site-editor access to the whole Google Site
3. Inconsistent structure per department (some flat, some nested) — confusing for both students and whoever maintains it
4. Dead/empty semester placeholders are visible to students (e.g. Geochemistry Semester 03 shows a page with nothing in it)
5. No distinction between public info pages and admin-only actions
6. No AI-assisted way to find the right course/material, and no AI that can answer general "what is FSCU / what is this diploma / what is 3loomangy" questions
7. "Pre - Master and Diploma" is a flat, unstructured link dump — no per-diploma description, eligibility, or organized materials
8. No dedicated place to showcase the team's own work — events, community services, and projects the team runs are scattered across social media instead of the site

### 2.7 NEW — Diplomas Directory (requested addition, does not exist on current site in this form)

**Requirement (from the client):** the team wants a proper directory of diplomas available at the faculty. A student clicks a diploma card → lands on an info page for that diploma → from there can open its materials (which live on Google Drive, same external-link pattern as courses), see a description of what the diploma covers, and any related study resources — organized, not a link dump.

This reuses the exact same resource-link pattern already proven in section 2.3, so no new file-hosting mechanism is needed. See schema in section 7 (`diplomas`, reusing `resourceLinks`) and routing in section 9.

### 2.8 NEW — Team Work Hub (requested addition)

**Requirement (from the client):** a section showcasing 3loomangy's own work as a team — split into three admin-manageable areas:
- **Projects** — things the team has built or produced (reports, publications, past initiatives)
- **Events** — activities the team has run or participated in (with dates, optionally past/upcoming)
- **Services** — ongoing things the team offers to students (e.g. tutoring, printing help, mentorship, whatever the team currently runs on an ad-hoc basis)

All three are simple admin-editable collections following the same CRUD pattern as everything else in section 16, so the team can keep this current without touching code. See schema in section 7 and routing in section 9.

---

## 3. Target Stack

| Layer | Technology | Free tier limit (relevant) |
|---|---|---|
| Frontend build | React 18 + Vite | n/a, open source |
| Styling | Tailwind CSS | n/a, open source |
| Routing | React Router v6 | n/a, open source |
| Hosting | Firebase Hosting | 10 GB storage, 360 MB/day transfer |
| Database | Cloud Firestore (Native mode) | 1 GB storage, 50K reads/day, 20K writes/day, 20K deletes/day |
| Auth | Firebase Authentication | Unlimited on Google/Email providers |
| Serverless functions | Firebase Cloud Functions (2nd gen) | 2M invocations/month |
| AI | Gemini API (`gemini-2.0-flash`) | Free tier request quota, sufficient for a student-scale chatbot |
| File storage | **Not needed** — content stays as Google Drive links, matching current behavior |
| CI/CD | GitHub Actions + Firebase Hosting integration | Free for public/private repos under GitHub's standard Actions minutes |

No paid service is required anywhere in this stack for the expected traffic of a single-faculty student group.

---

## 4. Prerequisites

- Node.js LTS
- Git
- A GitHub organization/repo for the team
- A Google account to own the Firebase project (recommend a dedicated team Google account, not a personal one, so ownership doesn't depend on one person)
- Firebase CLI: `npm install -g firebase-tools`

---

## 5. Step 1 — Scaffold the Project

```bash
npm create vite@latest 3loomangy-web -- --template react
cd 3loomangy-web
npm install
npm install firebase react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Recommended additional dependency for client-side fuzzy search (see section 13):
```bash
npm install fuse.js
```

---

## 6. Step 2 — Firebase Project Setup

1. `console.firebase.google.com` → Add Project → name it `3loomangy` (or similar)
2. Disable Google Analytics unless the team wants it
3. Enable **Authentication** → Sign-in method → enable Google provider (and Email/Password if you also want non-Google login)
4. Enable **Firestore Database** → Create in **Production mode**, choose a region close to Egypt (e.g. `europe-west1`)
5. Enable **Hosting** (activate now, deploy later)
6. Register a Web App under Project Settings → copy the `firebaseConfig` object

`src/lib/firebase.js`:
```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app);
```

`.env.local` (never commit this file — add to `.gitignore`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Note for the team: the Firebase web config is not a secret in the traditional sense (it's visible in any deployed app's network tab), but keeping it in env vars is still best practice for multi-environment setups (dev/staging/prod Firebase projects).

---

## 7. Step 3 — Firestore Data Model

Designed directly from the audit in section 2, extended with the Diplomas and Team Work requirements. Flat collections with reference fields (not nested subcollections) — this keeps queries simple and avoids Firestore's subcollection query limitations.

```
tracks (collection)                 // was "Departments" — matches site's own term "College Materials" children
  {trackId}
    name: "Biochemistry"
    nameAr: "الكيمياء الحيوية"
    slug: "biochemistry"
    order: 4
    isFlat: false                   // true for tracks like "Special Space", "Chemistry/Botany" with no semesters

semesters (collection)
  {semesterId}
    trackId: ref → tracks
    label: "Semester 03"            // free text, matches site convention "Semester 0X"
    order: 3

courses (collection)
  {courseId}
    semesterId: ref → semesters
    code: "Chem 241"                // stored separately from name — do NOT parse from a combined string
    name: "Organic Chemistry"
    instructor: ""                  // optional, empty in current site but useful going forward
    order: 1

resourceLinks (collection)          // replaces the fixed "Materials / Summaries / Exams" 3-link pattern
                                     // reused by courses, specialSections, AND diplomas (via parentType/parentId)
  {linkId}
    parentType: "course"            // enum: course | section | diploma
    parentId: ref                   // → courses.{id} | specialSections.{id} | diplomas.{id}
    label: "3loomangy Summaries"    // free text so it's not hardcoded to 3 categories
    type: "drive_folder"            // enum: drive_folder | drive_file | pdf | external_link | video
    url: "https://drive.google.com/..."
    order: 1

specialSections (collection)        // for the 2 remaining flat pages outside College Materials
  {sectionId}                       // ("Pre - Master and Diploma" is promoted to its own `diplomas` collection, see below)
    slug: "equivalency-exams"       // English slug for routing
    nameAr: "امتحانات المعادلة"
    nameEn: "Equivalency Exams"
    order: 1
    // links stored via resourceLinks with parentType: "section"

diplomas (collection)               // NEW — replaces the flat "Pre - Master and Diploma" page
  {diplomaId}
    name: "Diploma in Biotechnology"
    nameAr: "دبلومة التكنولوجيا الحيوية"
    slug: "biotechnology-diploma"
    description: "..."              // shown on the diploma's own info page
    eligibility: "..."               // optional free text, e.g. required GPA / prerequisite level
    order: 1
    // materials/studies stored via resourceLinks with parentType: "diploma"
    // clicking a diploma card → DiplomaPage → shows description + its resourceLinks (same UI pattern as CoursePage)

teamProjects (collection)           // NEW — Team Work hub, "Projects" tab
  {projectId}
    title: "..."
    description: "..."
    coverImageUrl: ""                // optional, external image URL (e.g. Drive/Imgur link — no Storage bucket needed)
    link: ""                         // optional, e.g. link to the report/output itself
    date: timestamp
    order: 1

teamEvents (collection)             // NEW — Team Work hub, "Events" tab
  {eventId}
    title: "..."
    description: "..."
    date: timestamp
    isPast: false                    // drives "Upcoming" vs "Past" tabs
    location: ""                     // optional
    registerLink: ""                 // optional

teamServices (collection)           // NEW — Team Work hub, "Services" tab
  {serviceId}
    title: "..."                     // e.g. "Free Tutoring", "Printing Help"
    description: "..."
    contactLink: ""                  // e.g. WhatsApp link for that specific service
    order: 1

trainings (collection)
  {trainingId}
    title: "..."
    description: "..."
    date: timestamp
    registerLink: "..."
    isPast: false

joinRequests (collection)
  {requestId}
    name, email, phone, faculty_level, message
    createdAt: timestamp
    status: "new" | "reviewed"

admins (collection, doc ID = admin's email)
  {email}
    role: "admin"
    addedAt: timestamp

siteConfig (single document: siteConfig/main)
  whatsappNumber: "+201025005751"
  facebookUrl: "..."
  youtubeUrl: "..."
  linkedinUrl: "..."
  whatsappChannelUrl: "..."
  aboutFscuContent: "..."          // markdown or plain text, editable from Admin — this is also fed to the AI, see section 14
```

**Design note on `resourceLinks`:** a single link table with a `parentType`/`parentId` pair (instead of three near-duplicate tables for courses/sections/diplomas) keeps one form, one admin screen, and one query pattern for every "list of external links attached to something" case across the whole site — courses, flat sections, and diplomas all render through the same `<ResourceLinkList parentType parentId />` component.

**Why flat collections instead of nesting departments → semesters → courses as subcollections:** Firestore collection-group queries and security rules are simpler to reason about with top-level collections + reference fields, and it avoids deep-path reads when you just want "all courses for search indexing."

---

## 8. Step 4 — Folder Structure

```
src/
  components/
    layout/
      Navbar.jsx
      Footer.jsx
      MegaMenu.jsx          // replicates the deep Materials dropdown, driven by Firestore data
    common/
      SearchBar.jsx
      LoadingSpinner.jsx
      Breadcrumbs.jsx
      ResourceLinkList.jsx   // shared list-of-external-links UI, used by Course/Section/Diploma pages
    materials/
      TrackCard.jsx
      SemesterList.jsx
      CourseList.jsx
    diplomas/
      DiplomaCard.jsx
    team/
      ProjectCard.jsx
      EventCard.jsx
      ServiceCard.jsx
    admin/
      AdminSidebar.jsx
      DataTable.jsx
      EntityForm.jsx          // generic form reused for tracks/semesters/courses/diplomas/projects/events/services
      JoinRequestsTable.jsx
      SiteConfigForm.jsx
    ai/
      ChatWidget.jsx
  pages/
    Home.jsx
    AboutFSCU.jsx
    Materials.jsx            // lists all tracks
    TrackPage.jsx            // lists semesters for a track (handles isFlat tracks by showing courses directly)
    SemesterPage.jsx         // lists courses for a semester
    CoursePage.jsx           // lists resource links for a course
    SpecialSectionPage.jsx   // renders remaining flat sections (equivalency exams, other links)
    Diplomas.jsx              // NEW — grid of all diploma cards
    DiplomaPage.jsx           // NEW — description + resource links for one diploma
    TeamWork.jsx               // NEW — tabbed hub: Projects / Events / Services
    TrainingSessions.jsx
    JoinUs.jsx
    AdminLogin.jsx
    admin/
      AdminDashboard.jsx
      AdminTracks.jsx
      AdminCourses.jsx
      AdminDiplomas.jsx        // NEW
      AdminTeamWork.jsx        // NEW — manages projects/events/services in one tabbed screen
      AdminTrainings.jsx
      AdminJoinRequests.jsx
      AdminSiteConfig.jsx
  context/
    AuthContext.jsx
  hooks/
    useFirestoreCollection.js
    useFirestoreDoc.js
  lib/
    firebase.js
  routes/
    AppRoutes.jsx
    ProtectedAdminRoute.jsx
  App.jsx
  main.jsx
```

---

## 9. Step 5 — Routing

```
/                                     → Home
/about-fscu                          → AboutFSCU
/materials                           → Materials (grid of all tracks)
/materials/:trackSlug                → TrackPage
/materials/:trackSlug/:semesterId    → SemesterPage
/course/:courseId                    → CoursePage
/section/:sectionSlug                → SpecialSectionPage (equivalency exams, other links)
/diplomas                            → Diplomas (grid of diploma cards)                [NEW]
/diplomas/:diplomaSlug                → DiplomaPage (description + materials)           [NEW]
/team                                 → TeamWork (tabs: Projects / Events / Services)    [NEW]
/team/projects/:projectId             → optional deep link into a single project        [NEW, optional]
/training-sessions                   → TrainingSessions
/join-us                             → JoinUs
/admin/login                         → AdminLogin
/admin                               → AdminDashboard (protected)
/admin/tracks                        → AdminTracks (protected)
/admin/courses                       → AdminCourses (protected)
/admin/diplomas                      → AdminDiplomas (protected)                        [NEW]
/admin/team-work                     → AdminTeamWork (protected)                        [NEW]
/admin/trainings                     → AdminTrainings (protected)
/admin/join-requests                 → AdminJoinRequests (protected)
/admin/site-config                   → AdminSiteConfig (protected)
```

Handle the Arabic-slug page (`امتحانات-المعادلة`) via the `specialSections.slug` field — store it with an English slug (`equivalency-exams`) for the URL and keep the Arabic label as display-only text (`nameAr`), so routing never depends on non-ASCII characters in the path. Diploma slugs follow the same convention (`diplomas.slug`, English, with `nameAr` for display).

---

## 10. Step 6 — Authentication & Admin Access

**Requirement (from the client):** any visitor uses the site anonymously; if a signed-in user's email exists in the `admins` collection, they get access to `/admin`. This is a whitelist model, not a role picked at signup.

`src/context/AuthContext.jsx`:
```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        const snap = await getDoc(doc(db, "admins", currentUser.email));
        setIsAdmin(snap.exists());
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

`src/routes/ProtectedAdminRoute.jsx`:
```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
}
```

**Adding the first admin:** since `admins` write is locked down (see security rules below), the very first admin document must be created manually via the Firebase Console (Firestore → `admins` collection → add doc with the admin's email as the document ID). After that, whether additional admins can self-manage the list is a product decision — recommended default: keep it console-only to avoid privilege-escalation bugs.

---

## 11. Step 7 — Firestore Security Rules

The frontend route guard is UX only. The real access control is here.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    match /tracks/{doc}          { allow read: if true; allow write: if isAdmin(); }
    match /semesters/{doc}       { allow read: if true; allow write: if isAdmin(); }
    match /courses/{doc}         { allow read: if true; allow write: if isAdmin(); }
    match /resourceLinks/{doc}   { allow read: if true; allow write: if isAdmin(); }
    match /specialSections/{doc} { allow read: if true; allow write: if isAdmin(); }
    match /diplomas/{doc}        { allow read: if true; allow write: if isAdmin(); }
    match /teamProjects/{doc}    { allow read: if true; allow write: if isAdmin(); }
    match /teamEvents/{doc}      { allow read: if true; allow write: if isAdmin(); }
    match /teamServices/{doc}    { allow read: if true; allow write: if isAdmin(); }
    match /trainings/{doc}       { allow read: if true; allow write: if isAdmin(); }
    match /siteConfig/{doc}      { allow read: if true; allow write: if isAdmin(); }

    match /joinRequests/{doc} {
      allow create: if true;              // anyone can submit the form
      allow read, update, delete: if isAdmin();
    }

    match /admins/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false;              // console-only, see section 10
    }
  }
}
```

Deploy with:
```bash
firebase deploy --only firestore:rules
```

---

## 12. Step 8 — Rendering the Materials Hierarchy

Example for `TrackPage.jsx` (handles both nested tracks and flat tracks like "Special Space"):

```jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function TrackPage() {
  const { trackSlug } = useParams();
  const [track, setTrack] = useState(null);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    (async () => {
      const trackQ = query(collection(db, "tracks"), where("slug", "==", trackSlug));
      const trackSnap = await getDocs(trackQ);
      if (trackSnap.empty) return;
      const trackData = { id: trackSnap.docs[0].id, ...trackSnap.docs[0].data() };
      setTrack(trackData);

      if (!trackData.isFlat) {
        const semQ = query(
          collection(db, "semesters"),
          where("trackId", "==", trackData.id),
          orderBy("order")
        );
        const semSnap = await getDocs(semQ);
        setSemesters(semSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    })();
  }, [trackSlug]);

  if (!track) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{track.name}</h1>
      {track.isFlat ? (
        <CourseList directTrackId={track.id} />
      ) : (
        semesters.map(s => <SemesterCard key={s.id} semester={s} />)
      )}
    </div>
  );
}
```

`DiplomaPage.jsx` follows the identical pattern to `CoursePage.jsx`, just querying `diplomas` by `slug` and rendering `<ResourceLinkList parentType="diploma" parentId={diploma.id} />` below the description text.

Required composite indexes (Firestore will prompt you the first time these queries run in production, or predefine them in `firestore.indexes.json`):
- `semesters`: `trackId ASC, order ASC`
- `courses`: `semesterId ASC, order ASC`
- `resourceLinks`: `parentType ASC, parentId ASC, order ASC`
- `teamEvents`: `isPast ASC, date DESC`

---

## 13. Step 9 — Search

Given the content volume seen in the audit (13 tracks × up to 8 semesters × up to a dozen courses — a few hundred course documents total, plus a handful of diplomas), this comfortably fits client-side fuzzy search without needing a paid search service.

```bash
npm install fuse.js
```

```jsx
import Fuse from "fuse.js";
import { useMemo, useState } from "react";

function SearchBar({ allCourses }) {
  const [q, setQ] = useState("");
  const fuse = useMemo(
    () => new Fuse(allCourses, { keys: ["code", "name"], threshold: 0.35 }),
    [allCourses]
  );
  const results = q ? fuse.search(q).map(r => r.item) : [];

  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a course..." />
      {results.map(c => <SearchResultItem key={c.id} course={c} />)}
    </div>
  );
}
```

`allCourses` should be fetched once (all `courses` docs, ~a few hundred rows) and cached client-side (React Query or a simple context) rather than re-fetched on every keystroke. Optionally merge `diplomas` into the same searchable index (`keys: ["code","name"]` → add `keys: ["name"]` for diplomas) so a search for "biotech" surfaces the diploma card too, not just courses.

> Scale note: if the catalog grows past a few thousand documents, migrate to Algolia's free tier (10K records / 10K searches per month) or a self-hosted Firestore + Meilisearch bridge. Not needed at current or near-future scale.

---

## 14. Step 10 — AI Assistant (Gemini, Free Tier)

Do not call Gemini directly from the frontend with an unrestricted key. Route it through a Cloud Function so the key never ships to the browser.

**Scope of the assistant (per client requirement):** it should do two things, not just one —
1. Help a student find the right course/material/diploma ("where do I find Organic Chemistry summaries?" → point to `/materials/chemistry-microbiology/...` or the right diploma page)
2. Answer general questions about the faculty and the team itself ("what is FSCU?", "what does 3loomangy do?", "what's the Biotechnology diploma about?") using the `siteConfig.aboutFscuContent` text and diploma descriptions as grounding, so it doesn't invent facts about the faculty.

```bash
firebase init functions
cd functions
npm install @google/generative-ai
```

`functions/index.js`:
```js
const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp();
const geminiKey = defineSecret("GEMINI_API_KEY");

exports.askAI = onCall({ secrets: [geminiKey] }, async (request) => {
  const question = request.data.question;
  if (!question || question.length > 500) {
    throw new Error("invalid-question");
  }

  const db = getFirestore();

  // Ground the model in real data instead of letting it guess course/diploma names or FSCU facts
  const [tracksSnap, diplomasSnap, configSnap] = await Promise.all([
    db.collection("tracks").get(),
    db.collection("diplomas").get(),
    db.doc("siteConfig/main").get(),
  ]);

  const tracksList = tracksSnap.docs.map(d => d.data().name).join(", ");
  const diplomasList = diplomasSnap.docs
    .map(d => `${d.data().name}: ${(d.data().description || "").slice(0, 150)}`)
    .join("\n");
  const aboutFscu = configSnap.data()?.aboutFscuContent || "";

  const genAI = new GoogleGenerativeAI(geminiKey.value());
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(
    `You are the assistant for the 3loomangy platform, serving FSCU (Faculty of Science, Cairo University) students.\n` +
    `Background info about the faculty:\n${aboutFscu}\n\n` +
    `Available material tracks: ${tracksList}\n\n` +
    `Available diplomas:\n${diplomasList}\n\n` +
    `Answer the student's question briefly. If it's about finding materials, point them to the right track/diploma by name. ` +
    `If it's a general question about the faculty or the team, answer using only the background info above — say you're not sure rather than guessing. ` +
    `Question: ${question}`
  );

  return { answer: result.response.text() };
});
```

Set the secret once:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Frontend call:
```jsx
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

const askAI = httpsCallable(functions, "askAI");
const { data } = await askAI({ question: userInput });
```

At current data volume (a few hundred courses + a handful of diplomas), the track/diploma summaries fit comfortably in a single prompt without needing a vector database — no Pinecone/RAG setup required here, unlike MedBook.

---

## 15. Step 11 — Join Us Form

```jsx
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

async function handleSubmit(formData) {
  await addDoc(collection(db, "joinRequests"), {
    ...formData,
    status: "new",
    createdAt: serverTimestamp(),
  });
}
```

Admin side: `AdminJoinRequests.jsx` lists all documents ordered by `createdAt desc`, with a button to mark `status: "reviewed"`.

---

## 16. Step 12 — Admin Dashboard CRUD Pattern

All admin forms follow the same shape. Example for Courses:

```jsx
import { addDoc, updateDoc, deleteDoc, doc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";

async function createCourse(data) {
  return addDoc(collection(db, "courses"), data);
}
async function updateCourse(id, data) {
  return updateDoc(doc(db, "courses", id), data);
}
async function deleteCourse(id) {
  return deleteDoc(doc(db, "courses", id));
}
```

Build one generic `<DataTable />` + `<EntityForm />` pair and reuse it for tracks, semesters, courses, resourceLinks, diplomas, teamProjects, teamEvents, teamServices, and trainings — the schemas are similar enough (name/label + order + optional parent ref) that a single configurable component saves significant time versus nine bespoke CRUD screens.

### 16.1 AdminTracks — adding a brand-new department (e.g. Zoology) live

This is the exact screen that answers the "what if we add a new department next year" requirement: the team fills a form (name, Arabic name, slug, `isFlat` toggle) → `createTrack()` → the new track appears immediately in the public `Materials` mega-menu and `/materials` grid, no code change, no redeploy.

### 16.2 AdminDiplomas

Same pattern: title, Arabic title, slug, description, eligibility text, order. Once saved, `AdminDiplomas` also exposes a nested "Manage resource links" action per diploma row that opens the same `resourceLinks` form used for courses, pre-filled with `parentType: "diploma"`.

### 16.3 AdminTeamWork

One screen with three tabs (Projects / Events / Services), each backed by its own collection from section 7. Events additionally get an `isPast` toggle so the public `/team` page can split them into "Upcoming" and "Past" without a separate query.

---

## 17. Step 13 — Migrating Existing Content

Since the current site has real content (Google Drive links for dozens of courses, plus the existing "Pre - Master and Diploma" page content), don't re-type everything by hand:

1. Manually walk each course page once (or delegate to team members, one department each) and record: track, semester, course code, course name, and each resource link (label + URL). Do the same one-time pass for the current diploma page content, splitting it into individual `diplomas` documents instead of one flat page.
2. Put this into a single CSV/JSON with columns matching the Firestore schema in section 7
3. Write a one-time Node.js script using the Firebase Admin SDK to bulk-import:

```js
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const data = require("./migration-data.json");

async function migrate() {
  const batch = db.batch();
  data.tracks.forEach(t => batch.set(db.collection("tracks").doc(), t));
  data.diplomas.forEach(d => batch.set(db.collection("diplomas").doc(), d));
  // repeat per collection, chunked into batches of 500 (Firestore batch limit)
  await batch.commit();
}
migrate();
```

Run once locally with a service account key (`GOOGLE_APPLICATION_CREDENTIALS` env var), never commit the service account JSON to the repo.

---

## 18. Step 14 — Deployment

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# public directory: dist
# configure as a single-page app: Yes
# set up automatic builds with GitHub: optional, see section 19

npm run build
firebase deploy
```

Default URL: `https://<project-id>.web.app`

### Custom domain
To keep `3loomangyana.site`:
1. Firebase Console → Hosting → Add custom domain
2. Add the provided DNS records (TXT for verification, then A/CNAME) at the current domain registrar
3. No extra Firebase cost — the team keeps paying only the existing domain renewal, same as today

---

## 19. Step 15 — CI/CD

```bash
firebase init hosting:github
```

This generates a GitHub Actions workflow that deploys a preview channel on every pull request and deploys to production on merge to `main`. Recommended branch protection: require the preview deploy to succeed before merge.

---

## 20. Suggested Build Order (Roadmap)

| Phase | Scope | Notes |
|---|---|---|
| 1 | Project scaffold, Firebase project, Auth, Firestore rules | Foundation, no UI yet |
| 2 | Data model + manual seed of 2–3 tracks + 1 diploma for dev testing | Validate schema before building all UI |
| 3 | Public pages: Home, About, Materials tree, Course page | Core read-only experience |
| 4 | Diplomas directory (grid + info page + resource links) | Reuses the ResourceLinkList component from phase 3 |
| 5 | Search | Depends on courses/diplomas being queryable |
| 6 | Admin Dashboard: CRUD for tracks/semesters/courses/diplomas/links | Unblocks real content migration |
| 7 | Content migration (section 17) | Can run in parallel with phase 6 by a non-dev team member using the finished Admin UI instead of scripts, if ready in time |
| 8 | Team Work hub (Projects / Events / Services) + admin screens | Independent, can be built anytime after phase 1 |
| 9 | Join Us + Training Sessions | Independent, can be built anytime after phase 1 |
| 10 | AI Assistant | Last — depends on a populated course/diploma catalog and `aboutFscuContent` to be useful |
| 11 | Styling pass, RTL/Arabic label support, mobile responsiveness | Ongoing, but a dedicated pass before launch |
| 12 | Deploy + custom domain cutover | Final step |

---

## 21. Cost Summary

| Item | Cost |
|---|---|
| Hosting, Database, Auth, Functions, Search | $0 (free tier) |
| AI (Gemini free tier) | $0 |
| Domain | Same as current — no new cost introduced by this rebuild |
| **Total new cost** | **$0/month** |

Free tier ceilings that would need to be watched, in order of likelihood to matter first: Firestore daily read quota (50K/day) if search or the materials tree causes unusually high traffic, and Cloud Functions invocations (2M/month) for the AI assistant — both are far above what a single faculty's student traffic would realistically produce.

---

## 22. Open Questions for the Team (resolve before Phase 6)

1. Should non-console admin management (adding/removing other admins from within the dashboard) be supported, or console-only forever? Section 10 defaults to console-only for safety.
2. For "flat" tracks that currently have zero content (e.g. Geochemistry semesters, Chemistry/Botany) — hide them from the public menu until they have at least one resource link, or show them as "coming soon"?
3. Keep the exact current department names (`Chemistry/Microbiology`, `Chemistry/Zoology`, etc.) or normalize them into a cleaner naming scheme during migration? Recommend keeping them as-is for continuity with what students already search for.
4. Confirm whether `امتحانات المعادلة` needs to stay Arabic-first in the UI (title, breadcrumbs) even though the URL slug is English per section 9.
5. For Diplomas: does each diploma need its own eligibility/prerequisite text, or is a simple description enough for launch? Schema in section 7 supports both, `eligibility` can stay empty if not needed yet.
6. For Team Work: should past events stay visible forever (as a public track record of what the team has done) or auto-hide after some time? Recommend keeping them visible under a "Past" tab — it's useful social proof for `Join Us`.
