/**
 * 3loomangy — Complete Firestore Seed Script
 *
 * Seeds all 15 collections with idempotent upserts (safe to re-run).
 *
 * Prerequisites:
 *   1. npm install (firebase-admin is a devDependency)
 *   2. Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path
 *   3. Run: npm run seed
 *
 * Options:
 *   --force   Overwrite siteConfig and upsert all docs (default: skip existing)
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(readFileSync(join(__dirname, "seed-data.json"), "utf8"));
const FORCE = process.argv.includes("--force");
const BATCH_SIZE = 450;

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("\n❌ GOOGLE_APPLICATION_CREDENTIALS is not set.");
  console.error("   Export the path to your Firebase service account JSON file:");
  console.error("   set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\service-account.json\n");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
const { Timestamp, FieldValue } = admin.firestore;

const stats = {};

function bump(collection, action = "written") {
  if (!stats[collection]) stats[collection] = { written: 0, skipped: 0 };
  stats[collection][action]++;
}

async function commitBatch(batch, count, label) {
  if (count === 0) return { batch: db.batch(), count: 0 };
  await batch.commit();
  console.log(`   ↳ committed ${count} ${label}`);
  return { batch: db.batch(), count: 0 };
}

async function findOne(collection, field, value) {
  const snap = await db.collection(collection).where(field, "==", value).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function findSemester(trackId, label) {
  const snap = await db
    .collection("semesters")
    .where("trackId", "==", trackId)
    .where("label", "==", label)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

async function findCourse(semesterId, code) {
  const snap = await db
    .collection("courses")
    .where("semesterId", "==", semesterId)
    .where("code", "==", code)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

async function findResourceLink(parentType, parentId, label) {
  const snap = await db
    .collection("resourceLinks")
    .where("parentType", "==", parentType)
    .where("parentId", "==", parentId)
    .where("label", "==", label)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

// ─── Seeders ───────────────────────────────────────────────────────────────

async function seedTracks() {
  console.log("\n📁 tracks");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const track of seedData.tracks) {
    const existing = await findOne("tracks", "slug", track.slug);
    if (existing && !FORCE) {
      ids[track.slug] = existing.id;
      bump("tracks", "skipped");
      continue;
    }
    const ref = existing ? existing.ref : db.collection("tracks").doc();
    batch.set(ref, track, { merge: true });
    ids[track.slug] = ref.id;
    bump("tracks");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "tracks"));
  }
  await commitBatch(batch, count, "tracks");
  return ids;
}

async function seedSemesters(trackIds) {
  console.log("\n📁 semesters");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const sem of seedData.semesters) {
    const trackId = trackIds[sem.trackSlug];
    if (!trackId) {
      console.warn(`   ⚠ track not found: ${sem.trackSlug}`);
      continue;
    }
    const key = `${sem.trackSlug}|${sem.label}`;
    const existing = await findSemester(trackId, sem.label);
    if (existing && !FORCE) {
      ids[key] = existing.id;
      bump("semesters", "skipped");
      continue;
    }
    const { trackSlug, ...data } = sem;
    const ref = existing ? existing.ref : db.collection("semesters").doc();
    batch.set(ref, { trackId, label: data.label, order: data.order, year: data.year }, { merge: true });
    ids[key] = ref.id;
    bump("semesters");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "semesters"));
  }
  await commitBatch(batch, count, "semesters");
  return ids;
}

async function seedCourses(semesterIds) {
  console.log("\n📁 courses");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const course of seedData.courses) {
    const semesterId = semesterIds[course.semesterKey];
    if (!semesterId) {
      console.warn(`   ⚠ semester not found: ${course.semesterKey}`);
      continue;
    }
    const existing = await findCourse(semesterId, course.code);
    if (existing && !FORCE) {
      ids[course.code] = existing.id;
      bump("courses", "skipped");
      continue;
    }
    const { semesterKey, ...data } = course;
    const ref = existing ? existing.ref : db.collection("courses").doc();
    batch.set(ref, { ...data, semesterId }, { merge: true });
    ids[course.code] = ref.id;
    bump("courses");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "courses"));
  }
  await commitBatch(batch, count, "courses");
  return ids;
}

async function seedDiplomas() {
  console.log("\n📁 diplomas");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const diploma of seedData.diplomas) {
    const existing = await findOne("diplomas", "slug", diploma.slug);
    if (existing && !FORCE) {
      ids[diploma.slug] = existing.id;
      bump("diplomas", "skipped");
      continue;
    }
    const ref = existing ? existing.ref : db.collection("diplomas").doc();
    batch.set(ref, diploma, { merge: true });
    ids[diploma.slug] = ref.id;
    bump("diplomas");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "diplomas"));
  }
  await commitBatch(batch, count, "diplomas");
  return ids;
}

async function seedSpecialSections() {
  console.log("\n📁 specialSections");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const section of seedData.specialSections) {
    const existing = await findOne("specialSections", "slug", section.slug);
    if (existing && !FORCE) {
      ids[section.slug] = existing.id;
      bump("specialSections", "skipped");
      continue;
    }
    const ref = existing ? existing.ref : db.collection("specialSections").doc();
    batch.set(ref, section, { merge: true });
    ids[section.slug] = ref.id;
    bump("specialSections");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "specialSections"));
  }
  await commitBatch(batch, count, "specialSections");
  return ids;
}

async function seedResourceLinks(parentMaps) {
  console.log("\n📁 resourceLinks");
  const { courseIds, diplomaIds, sectionIds } = parentMaps;
  let batch = db.batch();
  let count = 0;

  for (const link of seedData.resourceLinks) {
    let parentId;
    if (link.parentType === "course") parentId = courseIds[link.parentKey];
    else if (link.parentType === "diploma") parentId = diplomaIds[link.parentKey];
    else if (link.parentType === "section") parentId = sectionIds[link.parentKey];

    if (!parentId) {
      console.warn(`   ⚠ parent not found: ${link.parentType}/${link.parentKey}`);
      continue;
    }

    const existing = await findResourceLink(link.parentType, parentId, link.label);
    if (existing && !FORCE) {
      bump("resourceLinks", "skipped");
      continue;
    }

    const { parentKey, ...data } = link;
    const ref = existing ? existing.ref : db.collection("resourceLinks").doc();
    batch.set(ref, { ...data, parentId }, { merge: true });
    bump("resourceLinks");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "resourceLinks"));
  }
  await commitBatch(batch, count, "resourceLinks");
}

async function seedTrainingSessions() {
  console.log("\n📁 trainingSessions");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const session of seedData.trainingSessions) {
    const existing = await findOne("trainingSessions", "title", session.title);
    if (existing && !FORCE) {
      ids[session.key] = existing.id;
      bump("trainingSessions", "skipped");
      continue;
    }
    const { key, ...data } = session;
    const ref = existing ? existing.ref : db.collection("trainingSessions").doc();
    batch.set(ref, data, { merge: true });
    ids[key] = ref.id;
    bump("trainingSessions");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "trainingSessions"));
  }
  await commitBatch(batch, count, "trainingSessions");
  return ids;
}

async function seedTrainingCategories(sessionIds) {
  console.log("\n📁 trainingCategories");
  const ids = {};
  let batch = db.batch();
  let count = 0;

  for (const cat of seedData.trainingCategories) {
    const sessionId = sessionIds[cat.sessionKey];
    if (!sessionId) continue;

    const snap = await db
      .collection("trainingCategories")
      .where("sessionId", "==", sessionId)
      .where("name", "==", cat.name)
      .limit(1)
      .get();

    const existing = snap.empty ? null : snap.docs[0];
    const mapKey = `${cat.sessionKey}|${cat.name}`;

    if (existing && !FORCE) {
      ids[mapKey] = existing.id;
      ids[cat.name] = existing.id;
      bump("trainingCategories", "skipped");
      continue;
    }

    const { sessionKey, ...data } = cat;
    const ref = existing ? existing.ref : db.collection("trainingCategories").doc();
    batch.set(ref, { ...data, sessionId }, { merge: true });
    ids[mapKey] = ref.id;
    ids[cat.name] = ref.id;
    bump("trainingCategories");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "trainingCategories"));
  }
  await commitBatch(batch, count, "trainingCategories");
  return ids;
}

async function seedTrainingVideos(sessionIds, categoryIds) {
  console.log("\n📁 trainingVideos");
  let batch = db.batch();
  let count = 0;

  for (const video of seedData.trainingVideos) {
    const sessionId = sessionIds[video.sessionKey];
    if (!sessionId) continue;

    const categoryId = video.categoryKey
      ? categoryIds[`${video.sessionKey}|${video.categoryKey}`] ?? categoryIds[video.categoryKey] ?? null
      : null;

    const snap = await db
      .collection("trainingVideos")
      .where("sessionId", "==", sessionId)
      .where("title", "==", video.title)
      .limit(1)
      .get();

    const existing = snap.empty ? null : snap.docs[0];
    if (existing && !FORCE) {
      bump("trainingVideos", "skipped");
      continue;
    }

    const { sessionKey, categoryKey, ...data } = video;
    const ref = existing ? existing.ref : db.collection("trainingVideos").doc();
    batch.set(ref, { ...data, sessionId, categoryId }, { merge: true });
    bump("trainingVideos");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "trainingVideos"));
  }
  await commitBatch(batch, count, "trainingVideos");
}

async function seedSiteConfig() {
  console.log("\n📁 siteConfig/main");
  await db.collection("siteConfig").doc("main").set(seedData.siteConfig, { merge: !FORCE });
  stats.siteConfig = { written: 1, skipped: 0 };
  console.log("   ↳ siteConfig/main upserted");
}

async function seedAdmins() {
  console.log("\n📁 admins");
  for (const adminUser of seedData.admins) {
    const ref = db.collection("admins").doc(adminUser.email);
    const existing = await ref.get();
    if (existing.exists && !FORCE) {
      bump("admins", "skipped");
      continue;
    }
    await ref.set({
      role: adminUser.role,
      addedAt: existing.exists ? existing.data().addedAt : FieldValue.serverTimestamp(),
    }, { merge: true });
    bump("admins");
    console.log(`   ↳ ${adminUser.email}`);
  }
}

async function seedTeamProjects() {
  console.log("\n📁 teamProjects");
  let batch = db.batch();
  let count = 0;

  for (const project of seedData.teamProjects) {
    const existing = await findOne("teamProjects", "title", project.title);
    if (existing && !FORCE) {
      bump("teamProjects", "skipped");
      continue;
    }
    const ref = existing ? existing.ref : db.collection("teamProjects").doc();
    batch.set(ref, {
      ...project,
      date: Timestamp.fromDate(new Date(project.date)),
    }, { merge: true });
    bump("teamProjects");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "teamProjects"));
  }
  await commitBatch(batch, count, "teamProjects");
}

async function seedTeamEvents() {
  console.log("\n📁 teamEvents");
  let batch = db.batch();
  let count = 0;

  for (const event of seedData.teamEvents) {
    const existing = await findOne("teamEvents", "title", event.title);
    if (existing && !FORCE) {
      bump("teamEvents", "skipped");
      continue;
    }
    const ref = existing ? existing.ref : db.collection("teamEvents").doc();
    batch.set(ref, {
      ...event,
      date: Timestamp.fromDate(new Date(event.date)),
    }, { merge: true });
    bump("teamEvents");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "teamEvents"));
  }
  await commitBatch(batch, count, "teamEvents");
}

async function seedTeamServices() {
  console.log("\n📁 teamServices");
  let batch = db.batch();
  let count = 0;

  for (const service of seedData.teamServices) {
    const existing = await findOne("teamServices", "title", service.title);
    if (existing && !FORCE) {
      bump("teamServices", "skipped");
      continue;
    }
    const ref = existing ? existing.ref : db.collection("teamServices").doc();
    batch.set(ref, service, { merge: true });
    bump("teamServices");
    count++;
    if (count >= BATCH_SIZE) ({ batch, count } = await commitBatch(batch, count, "teamServices"));
  }
  await commitBatch(batch, count, "teamServices");
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   3loomangy Firestore Seed               ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`Mode: ${FORCE ? "FORCE (overwrite)" : "idempotent (skip existing)"}`);

  const trackIds = await seedTracks();
  const semesterIds = await seedSemesters(trackIds);
  const courseIds = await seedCourses(semesterIds);
  const diplomaIds = await seedDiplomas();
  const sectionIds = await seedSpecialSections();
  await seedResourceLinks({ courseIds, diplomaIds, sectionIds });
  const sessionIds = await seedTrainingSessions();
  const categoryIds = await seedTrainingCategories(sessionIds);
  await seedTrainingVideos(sessionIds, categoryIds);
  await seedSiteConfig();
  await seedAdmins();
  await seedTeamProjects();
  await seedTeamEvents();
  await seedTeamServices();

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ✅ Seed completed successfully!         ║");
  console.log("╚══════════════════════════════════════════╝\n");
  console.log("Summary:");
  for (const [col, s] of Object.entries(stats)) {
    console.log(`  ${col.padEnd(20)} written: ${s.written}, skipped: ${s.skipped}`);
  }
  console.log("\nNext steps:");
  console.log("  1. Deploy firestore.rules and firestore.indexes.json");
  console.log("  2. Replace admin@3loomangy.com in seed-data.json with your real admin email");
  console.log("  3. Run the app: npm run dev\n");
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
