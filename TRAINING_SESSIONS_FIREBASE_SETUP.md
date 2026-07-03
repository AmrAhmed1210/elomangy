# Training Sessions - Firebase Firestore Setup

This document outlines the Firestore structure and sample data needed for the Training Sessions feature.

## Firestore Collections

### 1. `trainingSessions` Collection

Stores training session information.

**Document Structure:**
```javascript
{
  title: string,           // Session title (e.g., "Web Development Bootcamp")
  description: string,     // Optional description
  mode: string,           // Either "videos" or "categories"
  order: number           // Display order (lower = first)
}
```

**Sample Data:**
```javascript
// Session 1 - Direct Videos Mode
{
  title: "Web Development Fundamentals",
  description: "Learn the basics of web development with HTML, CSS, and JavaScript",
  mode: "videos",
  order: 1
}

// Session 2 - Categories Mode
{
  title: "Advanced Programming",
  description: "Deep dive into advanced programming concepts",
  mode: "categories",
  order: 2
}
```

---

### 2. `trainingCategories` Collection
*(Only needed for sessions with mode: "categories")*

Stores category information for categorized sessions.

**Document Structure:**
```javascript
{
  sessionId: string,      // Reference to trainingSessions document ID
  name: string,           // Category name (e.g., "Soft Skills")
  description: string,    // Optional description
  order: number           // Display order within the session
}
```

**Sample Data:**
```javascript
// Category 1
{
  sessionId: "session-2-id",
  name: "Soft Skills",
  description: "Communication, teamwork, and leadership skills",
  order: 1
}

// Category 2
{
  sessionId: "session-2-id",
  name: "Technical Skills",
  description: "Programming, databases, and system design",
  order: 2
}

// Category 3
{
  sessionId: "session-2-id",
  name: "AI Basics",
  description: "Introduction to artificial intelligence and machine learning",
  order: 3
}
```

---

### 3. `trainingVideos` Collection

Stores video information for all sessions.

**Document Structure:**
```javascript
{
  sessionId: string,      // Reference to trainingSessions document ID
  categoryId: string,     // Reference to trainingCategories document ID (null for direct videos)
  title: string,          // Video title
  description: string,    // Optional description
  youtubeUrl: string,     // Full YouTube URL (e.g., "https://www.youtube.com/watch?v=...")
  thumbnail: string,      // Optional custom thumbnail URL
  duration: string,      // Optional duration (e.g., "15:30")
  order: number          // Display order
}
```

**Sample Data - Direct Videos (categoryId: null):**
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

{
  sessionId: "session-1-id",
  categoryId: null,
  title: "CSS Fundamentals",
  description: "Styling web pages with CSS",
  youtubeUrl: "https://www.youtube.com/watch?v=example2",
  duration: "18:45",
  order: 2
}
```

**Sample Data - Categorized Videos:**
```javascript
// Videos in "Soft Skills" category
{
  sessionId: "session-2-id",
  categoryId: "category-1-id",
  title: "Effective Communication",
  description: "Learn how to communicate effectively in teams",
  youtubeUrl: "https://www.youtube.com/watch?v=example3",
  duration: "20:00",
  order: 1
}

{
  sessionId: "session-2-id",
  categoryId: "category-1-id",
  title: "Team Leadership",
  description: "Leadership skills for team management",
  youtubeUrl: "https://www.youtube.com/watch?v=example4",
  duration: "25:30",
  order: 2
}

// Videos in "Technical Skills" category
{
  sessionId: "session-2-id",
  categoryId: "category-2-id",
  title: "Advanced JavaScript",
  description: "Deep dive into JavaScript concepts",
  youtubeUrl: "https://www.youtube.com/watch?v=example5",
  duration: "45:00",
  order: 1
}
```

---

## How to Add Data

### Option 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project
3. Go to Firestore Database
4. Create the collections and add documents following the structure above

### Option 2: Using Firebase Admin SDK (Recommended for bulk data)

Create a seed script in your project:

```javascript
// scripts/seed-training-sessions.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedTrainingSessions() {
  try {
    // Add Session 1 - Direct Videos
    const session1Ref = await addDoc(collection(db, 'trainingSessions'), {
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of web development',
      mode: 'videos',
      order: 1
    });

    // Add videos for Session 1
    await addDoc(collection(db, 'trainingVideos'), {
      sessionId: session1Ref.id,
      categoryId: null,
      title: 'Introduction to HTML',
      description: 'Learn HTML basics',
      youtubeUrl: 'https://www.youtube.com/watch?v=example1',
      duration: '12:30',
      order: 1
    });

    // Add Session 2 - Categories
    const session2Ref = await addDoc(collection(db, 'trainingSessions'), {
      title: 'Advanced Programming',
      description: 'Advanced programming concepts',
      mode: 'categories',
      order: 2
    });

    // Add categories for Session 2
    const category1Ref = await addDoc(collection(db, 'trainingCategories'), {
      sessionId: session2Ref.id,
      name: 'Soft Skills',
      description: 'Communication and leadership',
      order: 1
    });

    // Add videos for Category 1
    await addDoc(collection(db, 'trainingVideos'), {
      sessionId: session2Ref.id,
      categoryId: category1Ref.id,
      title: 'Effective Communication',
      description: 'Learn communication skills',
      youtubeUrl: 'https://www.youtube.com/watch?v=example3',
      duration: '20:00',
      order: 1
    });

    console.log('Training sessions seeded successfully!');
  } catch (error) {
    console.error('Error seeding training sessions:', error);
  }
}

seedTrainingSessions();
```

---

## Indexes Required

For the queries to work efficiently, you may need to create composite indexes in Firebase Console:

1. Go to Firestore Database → Indexes
2. Create the following indexes:

**For `trainingCategories`:**
- Fields: `sessionId` (ascending), `order` (ascending)
- Collection: `trainingCategories`

**For `trainingVideos` (direct videos):**
- Fields: `sessionId` (ascending), `categoryId` (ascending), `order` (ascending)
- Collection: `trainingVideos`

---

## Security Rules

Update your Firestore security rules to allow read access for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Training Sessions - read for all authenticated users
    match /trainingSessions/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Restrict to admin in production
    }
    
    // Training Categories - read for all authenticated users
    match /trainingCategories/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Restrict to admin in production
    }
    
    // Training Videos - read for all authenticated users
    match /trainingVideos/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Restrict to admin in production
    }
  }
}
```

---

## Testing

After adding data, test the feature:

1. Navigate to `/training-sessions` - Should show all sessions
2. Click a session with `mode: "videos"` - Should show videos directly
3. Click a session with `mode: "categories"` - Should show categories
4. Click a category - Should show videos for that category
5. Click a video - Should open YouTube in a new tab

---

## Notes

- YouTube URLs can be in any format (watch, youtu.be, embed) - the app will extract the video ID automatically
- Thumbnails are optional - if not provided, the app will use YouTube's default thumbnail
- Duration is optional - if not provided, the duration badge won't show
- The `order` field determines the display order - use sequential numbers (1, 2, 3, ...)
- For future admin dashboard integration, you'll need to implement CRUD operations for all three collections
