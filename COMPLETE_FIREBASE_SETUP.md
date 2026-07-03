# 3loomangy Platform - Complete Firebase Firestore Setup

This document outlines the complete Firestore structure and sample data needed for the entire 3loomangy platform.

---

## Firestore Collections Overview

### Core Collections
1. **tracks** - Department/track information
2. **semesters** - Semester information
3. **courses** - Course information
4. **resourceLinks** - External resource links (reused by courses, sections, diplomas)
5. **specialSections** - Flat pages (equivalency exams, other links)
6. **diplomas** - Diploma information
7. **trainingSessions** - Training session information
8. **trainingCategories** - Training categories
9. **trainingVideos** - Training videos
10. **siteConfig** - Site configuration (single document)

### Admin Collections
11. **admins** - Admin user whitelist
12. **joinRequests** - Join us form submissions

### Team Work Collections
13. **teamProjects** - Team projects
14. **teamEvents** - Team events
15. **teamServices** - Team services

---

## 1. `tracks` Collection

Stores department/track information for Materials.

**Document Structure:**
```javascript
{
  name: string,           // English name (e.g., "Biochemistry")
  nameAr: string,         // Arabic name (e.g., "الكيمياء الحيوية")
  slug: string,           // URL slug (e.g., "biochemistry")
  order: number,          // Display order
  isFlat: boolean        // true for flat tracks with no semesters
}
```

**Sample Data:**
```javascript
{
  name: "Biochemistry",
  nameAr: "الكيمياء الحيوية",
  slug: "biochemistry",
  order: 4,
  isFlat: false
}

{
  name: "Special Space",
  nameAr: "الفضاء الخاص",
  slug: "special-space",
  order: 10,
  isFlat: true
}
```

---

## 2. `semesters` Collection

Stores semester information for each track.

**Document Structure:**
```javascript
{
  trackId: string,        // Reference to tracks document ID
  label: string,          // Semester label (e.g., "Semester 03")
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  trackId: "biochemistry-track-id",
  label: "Semester 03",
  order: 3
}

{
  trackId: "biochemistry-track-id",
  label: "Semester 04",
  order: 4
}
```

---

## 3. `courses` Collection

Stores course information for each semester.

**Document Structure:**
```javascript
{
  semesterId: string,     // Reference to semesters document ID
  code: string,           // Course code (e.g., "Chem 241")
  name: string,           // Course name (e.g., "Organic Chemistry")
  instructor: string,     // Optional instructor name
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  semesterId: "semester-03-id",
  code: "Chem 241",
  name: "Organic Chemistry",
  instructor: "Dr. Ahmed",
  order: 1
}

{
  semesterId: "semester-03-id",
  code: "Biochem 251",
  name: "Biochemistry I",
  instructor: "Dr. Mohamed",
  order: 2
}
```

---

## 4. `resourceLinks` Collection

Stores external resource links. Reused by courses, special sections, and diplomas.

**Document Structure:**
```javascript
{
  parentType: string,     // "course", "section", or "diploma"
  parentId: string,       // Reference to parent document ID
  label: string,          // Link label (e.g., "3loomangy Summaries")
  type: string,           // "drive_folder", "drive_file", "pdf", "external_link", "video"
  url: string,            // Full URL
  order: number           // Display order
}
```

**Sample Data - Course Links:**
```javascript
{
  parentType: "course",
  parentId: "course-chem241-id",
  label: "Materials",
  type: "drive_folder",
  url: "https://drive.google.com/folder/...",
  order: 1
}

{
  parentType: "course",
  parentId: "course-chem241-id",
  label: "3loomangy Summaries",
  type: "drive_folder",
  url: "https://drive.google.com/folder/...",
  order: 2
}

{
  parentType: "course",
  parentId: "course-chem241-id",
  label: "Exams",
  type: "drive_folder",
  url: "https://drive.google.com/folder/...",
  order: 3
}
```

**Sample Data - Diploma Links:**
```javascript
{
  parentType: "diploma",
  parentId: "diploma-biotech-id",
  label: "Study Materials",
  type: "drive_folder",
  url: "https://drive.google.com/folder/...",
  order: 1
}

{
  parentType: "diploma",
  parentId: "diploma-biotech-id",
  label: "Past Exams",
  type: "drive_folder",
  url: "https://drive.google.com/folder/...",
  order: 2
}
```

---

## 5. `specialSections` Collection

Stores flat pages outside College Materials (equivalency exams, other links).

**Document Structure:**
```javascript
{
  slug: string,           // English slug for routing
  nameAr: string,         // Arabic name
  nameEn: string,         // English name
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  slug: "equivalency-exams",
  nameAr: "امتحانات المعادلة",
  nameEn: "Equivalency Exams",
  order: 1
}

{
  slug: "other-links",
  nameAr: "روابط أخرى",
  nameEn: "Other Links",
  order: 2
}
```

---

## 6. `diplomas` Collection

Stores diploma information.

**Document Structure:**
```javascript
{
  name: string,           // English name
  nameAr: string,         // Arabic name
  slug: string,           // URL slug
  description: string,    // Description
  eligibility: string,     // Optional eligibility requirements
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  name: "Diploma in Biotechnology",
  nameAr: "دبلومة التكنولوجيا الحيوية",
  slug: "biotechnology-diploma",
  description: "Comprehensive biotechnology diploma covering genetic engineering, molecular biology, and bioprocessing.",
  eligibility: "Bachelor's degree in Science with minimum GPA 2.5",
  order: 1
}

{
  name: "Diploma in Bioinformatics",
  nameAr: "دبلومة المعلوماتية الحيوية",
  slug: "bioinformatics-diploma",
  description: "Learn computational biology, data analysis, and bioinformatics tools.",
  eligibility: "Bachelor's degree in Science or Computer Science",
  order: 2
}
```

---

## 7. `trainingSessions` Collection

Stores training session information.

**Document Structure:**
```javascript
{
  title: string,          // Session title
  description: string,    // Optional description
  mode: string,           // "videos" or "categories"
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  title: "Web Development Fundamentals",
  description: "Learn the basics of web development with HTML, CSS, and JavaScript",
  mode: "videos",
  order: 1
}

{
  title: "Advanced Programming",
  description: "Deep dive into advanced programming concepts",
  mode: "categories",
  order: 2
}
```

---

## 8. `trainingCategories` Collection

Stores category information for categorized training sessions.

**Document Structure:**
```javascript
{
  sessionId: string,      // Reference to trainingSessions document ID
  name: string,           // Category name
  description: string,    // Optional description
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  sessionId: "session-2-id",
  name: "Soft Skills",
  description: "Communication, teamwork, and leadership skills",
  order: 1
}

{
  sessionId: "session-2-id",
  name: "Technical Skills",
  description: "Programming, databases, and system design",
  order: 2
}
```

---

## 9. `trainingVideos` Collection

Stores video information for training sessions.

**Document Structure:**
```javascript
{
  sessionId: string,      // Reference to trainingSessions document ID
  categoryId: string,     // Reference to trainingCategories document ID (null for direct videos)
  title: string,          // Video title
  description: string,    // Optional description
  youtubeUrl: string,     // Full YouTube URL
  thumbnail: string,      // Optional custom thumbnail URL
  duration: string,      // Optional duration (e.g., "15:30")
  order: number           // Display order
}
```

**Sample Data - Direct Videos:**
```javascript
{
  sessionId: "session-1-id",
  categoryId: null,
  title: "Introduction to HTML",
  description: "Learn the basics of HTML structure and elements",
  youtubeUrl: "https://www.youtube.com/watch?v=example1",
  thumbnail: "https://example.com/thumb1.jpg",
  duration: "12:30",
  order: 1
}
```

**Sample Data - Categorized Videos:**
```javascript
{
  sessionId: "session-2-id",
  categoryId: "category-1-id",
  title: "Effective Communication",
  description: "Learn how to communicate effectively in teams",
  youtubeUrl: "https://www.youtube.com/watch?v=example3",
  duration: "20:00",
  order: 1
}
```

---

## 10. `siteConfig` Collection

Single document for site-wide configuration.

**Document Structure:**
```javascript
{
  whatsappNumber: string,        // WhatsApp number
  facebookUrl: string,          // Facebook page URL
  youtubeUrl: string,           // YouTube channel URL
  linkedinUrl: string,          // LinkedIn company page URL
  whatsappChannelUrl: string,   // WhatsApp channel URL
  aboutFscuContent: string      // About FSCU content (markdown or plain text)
}
```

**Sample Data:**
```javascript
{
  whatsappNumber: "+201025005751",
  facebookUrl: "https://facebook.com/3loomangy",
  youtubeUrl: "https://youtube.com/@3loomangy",
  linkedinUrl: "https://linkedin.com/company/3loomangy",
  whatsappChannelUrl: "https://whatsapp.com/channel/...",
  aboutFscuContent: "FSCU (Faculty of Science, Cairo University) is one of Egypt's premier scientific institutions..."
}
```

---

## 11. `admins` Collection

Admin user whitelist. Document ID = admin email.

**Document Structure:**
```javascript
{
  role: string,          // "admin"
  addedAt: timestamp     // When admin was added
}
```

**Sample Data:**
```javascript
// Document ID: admin@example.com
{
  role: "admin",
  addedAt: "2026-07-03T12:00:00Z"
}
```

---

## 12. `joinRequests` Collection

Stores Join Us form submissions.

**Document Structure:**
```javascript
{
  name: string,          // Applicant name
  email: string,         // Applicant email
  phone: string,         // Applicant phone
  faculty_level: string,  // Faculty level (e.g., "Year 3")
  message: string,       // Optional message
  createdAt: timestamp,  // Submission timestamp
  status: string         // "new" or "reviewed"
}
```

**Sample Data:**
```javascript
{
  name: "Ahmed Mohamed",
  email: "ahmed@example.com",
  phone: "+201234567890",
  faculty_level: "Year 3",
  message: "I want to join the team",
  createdAt: "2026-07-03T12:00:00Z",
  status: "new"
}
```

---

## 13. `teamProjects` Collection

Stores team projects information.

**Document Structure:**
```javascript
{
  title: string,          // Project title
  description: string,    // Project description
  coverImageUrl: string,  // Optional cover image URL
  link: string,           // Optional project link
  date: timestamp,        // Project date
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  title: "Science Fair 2025",
  description: "Annual science fair organized by 3loomangy",
  coverImageUrl: "https://example.com/science-fair.jpg",
  link: "https://example.com/science-fair-report",
  date: "2025-05-15T00:00:00Z",
  order: 1
}
```

---

## 14. `teamEvents` Collection

Stores team events information.

**Document Structure:**
```javascript
{
  title: string,          // Event title
  description: string,    // Event description
  date: timestamp,        // Event date
  isPast: boolean,        // true for past events, false for upcoming
  location: string,       // Optional location
  registerLink: string    // Optional registration link
}
```

**Sample Data:**
```javascript
{
  title: "Workshop: Research Methods",
  description: "Learn research methodology and scientific writing",
  date: "2026-08-20T14:00:00Z",
  isPast: false,
  location: "FSCU, Hall 3",
  registerLink: "https://forms.google.com/..."
}
```

---

## 15. `teamServices` Collection

Stores team services information.

**Document Structure:**
```javascript
{
  title: string,          // Service title
  description: string,    // Service description
  contactLink: string,    // Contact link (e.g., WhatsApp)
  order: number           // Display order
}
```

**Sample Data:**
```javascript
{
  title: "Free Tutoring",
  description: "Free tutoring sessions for first-year students",
  contactLink: "https://wa.me/201025005751",
  order: 1
}

{
  title: "Printing Help",
  description: "Help with printing and formatting academic papers",
  contactLink: "https://wa.me/201025005751",
  order: 2
}
```

---

## How to Add Data

### Option 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project
3. Go to Firestore Database
4. Create collections and add documents following the structure above

### Option 2: Seed Script (Recommended)

Create a seed script to populate all collections:

```javascript
// scripts/seed-firestore.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  try {
    // Seed tracks
    const biochemTrack = await addDoc(collection(db, 'tracks'), {
      name: 'Biochemistry',
      nameAr: 'الكيمياء الحيوية',
      slug: 'biochemistry',
      order: 4,
      isFlat: false
    });

    // Seed semesters
    const semester3 = await addDoc(collection(db, 'semesters'), {
      trackId: biochemTrack.id,
      label: 'Semester 03',
      order: 3
    });

    // Seed courses
    await addDoc(collection(db, 'courses'), {
      semesterId: semester3.id,
      code: 'Chem 241',
      name: 'Organic Chemistry',
      instructor: 'Dr. Ahmed',
      order: 1
    });

    // Seed diplomas
    await addDoc(collection(db, 'diplomas'), {
      name: 'Diploma in Biotechnology',
      nameAr: 'دبلومة التكنولوجيا الحيوية',
      slug: 'biotechnology-diploma',
      description: 'Comprehensive biotechnology diploma',
      eligibility: 'Bachelor\'s degree with minimum GPA 2.5',
      order: 1
    });

    // Seed site config
    await setDoc(doc(db, 'siteConfig', 'main'), {
      whatsappNumber: '+201025005751',
      facebookUrl: 'https://facebook.com/3loomangy',
      youtubeUrl: 'https://youtube.com/@3loomangy',
      linkedinUrl: 'https://linkedin.com/company/3loomangy',
      whatsappChannelUrl: 'https://whatsapp.com/channel/...',
      aboutFscuContent: 'FSCU is one of Egypt\'s premier scientific institutions...'
    });

    console.log('Firestore seeded successfully!');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  }
}

seedFirestore();
```

---

## Indexes Required

Create these composite indexes in Firebase Console for efficient queries:

1. **semesters:** `trackId ASC, order ASC`
2. **courses:** `semesterId ASC, order ASC`
3. **resourceLinks:** `parentType ASC, parentId ASC, order ASC`
4. **trainingCategories:** `sessionId ASC, order ASC`
5. **trainingVideos:** `sessionId ASC, categoryId ASC, order ASC`
6. **teamEvents:** `isPast ASC, date DESC`

---

## Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    // Public read, admin write
    match /tracks/{doc}          { allow read: if true; allow write: if isAdmin(); }
    match /semesters/{doc}       { allow read: if true; allow write: if isAdmin(); }
    match /courses/{doc}         { allow read: if true; allow write: if isAdmin(); }
    match /resourceLinks/{doc}   { allow read: if true; allow write: if isAdmin(); }
    match /specialSections/{doc} { allow read: if true; allow write: if isAdmin(); }
    match /diplomas/{doc}        { allow read: if true; allow write: if isAdmin(); }
    match /trainingSessions/{doc}{ allow read: if true; allow write: if isAdmin(); }
    match /trainingCategories/{doc}{ allow read: if true; allow write: if isAdmin(); }
    match /trainingVideos/{doc}   { allow read: if true; allow write: if isAdmin(); }
    match /siteConfig/{doc}      { allow read: if true; allow write: if isAdmin(); }
    match /teamProjects/{doc}    { allow read: if true; allow write: if isAdmin(); }
    match /teamEvents/{doc}      { allow read: if true; allow write: if isAdmin(); }
    match /teamServices/{doc}    { allow read: if true; allow write: if isAdmin(); }

    // Join requests - anyone can create, admin can read/update/delete
    match /joinRequests/{doc} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Admins - console-only
    match /admins/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false;
    }
  }
}
```

---

## Testing Checklist

After adding data, test each feature:

### Materials
- [ ] Navigate to `/materials` - Should show all tracks
- [ ] Click a track - Should show semesters (or courses if isFlat)
- [ ] Click a semester - Should show courses
- [ ] Click a course - Should show resource links
- [ ] Click a resource link - Should open in new tab

### Diplomas
- [ ] Navigate to `/diplomas` - Should show all diplomas
- [ ] Click a diploma - Should show description and resource links

### Training Sessions
- [ ] Navigate to `/training-sessions` - Should show all sessions
- [ ] Click a session with mode: "videos" - Should show videos
- [ ] Click a session with mode: "categories" - Should show categories
- [ ] Click a category - Should show videos for that category
- [ ] Click a video - Should open YouTube in new tab

### About Us
- [ ] Check footer links - Should use siteConfig values
- [ ] Check About page - Should display aboutFscuContent

### Team Work
- [ ] Navigate to `/team` - Should show Projects/Events/Services tabs
- [ ] Check each tab - Should show respective content

---

## Notes

- **Reference Fields:** When adding documents that reference other documents (e.g., `trackId` in semesters), use the actual document ID, not the slug or name
- **Order Fields:** Use sequential numbers (1, 2, 3, ...) for consistent ordering
- **Slugs:** Always use English slugs for routing; use Arabic names for display
- **Resource Links:** The same pattern is reused across courses, sections, and diplomas - just change `parentType` and `parentId`
- **YouTube URLs:** Can be in any format (watch, youtu.be, embed) - the app will extract the video ID automatically
- **Admin Access:** The first admin must be added manually via Firebase Console (document ID = admin email)
