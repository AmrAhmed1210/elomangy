import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hchputsaplxctwlitmns.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Load seed data
const seedData = JSON.parse(readFileSync(join(__dirname, 'seed-data.json'), 'utf-8'));

async function seed() {
  console.log('🌱 Starting Supabase seed...');

  try {
    // 1. Seed tracks
    console.log('📚 Seeding tracks...');
    const tracksData = seedData.tracks.map(track => ({
      name: track.name,
      name_ar: track.nameAr,
      slug: track.slug,
      order: track.order,
      is_flat: track.isFlat
    }));
    
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .insert(tracksData)
      .select();
    
    if (tracksError) throw tracksError;
    console.log(`✅ Inserted ${tracks.length} tracks`);

    // Create track slug to ID map
    const trackMap = {};
    tracks.forEach(track => {
      trackMap[track.slug] = track.id;
    });

    // 2. Seed semesters
    console.log('📅 Seeding semesters...');
    const semestersData = seedData.semesters.map(sem => ({
      track_id: trackMap[sem.trackSlug],
      label: sem.label,
      year: sem.year,
      order: sem.order
    }));

    const { data: semesters, error: semestersError } = await supabase
      .from('semesters')
      .insert(semestersData)
      .select();
    
    if (semestersError) throw semestersError;
    console.log(`✅ Inserted ${semesters.length} semesters`);

    // Create semester key to ID map
    const semesterMap = {};
    semesters.forEach(sem => {
      const track = tracks.find(t => t.id === sem.track_id);
      const trackSlug = track ? track.slug : 'unknown';
      semesterMap[`${trackSlug}|${sem.label}`] = sem.id;
    });

    // 3. Seed courses
    console.log('📖 Seeding courses...');
    const coursesData = seedData.courses.map(course => ({
      semester_id: semesterMap[course.semesterKey],
      code: course.code,
      name: course.name,
      instructor: course.instructor,
      order: course.order
    }));

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .insert(coursesData)
      .select();
    
    if (coursesError) throw coursesError;
    console.log(`✅ Inserted ${courses.length} courses`);

    // Create course code to ID map
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course.code] = course.id;
    });

    // 4. Seed special sections
    console.log('📄 Seeding special sections...');
    const specialSectionsData = seedData.specialSections.map(section => ({
      slug: section.slug,
      name_en: section.nameEn,
      name_ar: section.nameAr,
      order: section.order
    }));
    
    const { data: specialSections, error: specialSectionsError } = await supabase
      .from('special_sections')
      .insert(specialSectionsData)
      .select();
    
    if (specialSectionsError) throw specialSectionsError;
    console.log(`✅ Inserted ${specialSections.length} special sections`);

    // Create section slug to ID map
    const sectionMap = {};
    specialSections.forEach(section => {
      sectionMap[section.slug] = section.id;
    });

    // 5. Seed diplomas
    console.log('🎓 Seeding diplomas...');
    const diplomasData = seedData.diplomas.map(diploma => ({
      name: diploma.name,
      name_ar: diploma.nameAr,
      slug: diploma.slug,
      description: diploma.description,
      eligibility: diploma.eligibility,
      order: diploma.order
    }));
    
    const { data: diplomas, error: diplomasError } = await supabase
      .from('diplomas')
      .insert(diplomasData)
      .select();
    
    if (diplomasError) throw diplomasError;
    console.log(`✅ Inserted ${diplomas.length} diplomas`);

    // Create diploma slug to ID map
    const diplomaMap = {};
    diplomas.forEach(diploma => {
      diplomaMap[diploma.slug] = diploma.id;
    });

    // 6. Seed resource links
    console.log('🔗 Seeding resource links...');
    const resourceLinksData = seedData.resourceLinks.map(link => {
      let parentId;
      let parentType;

      if (link.parentType === 'course') {
        parentId = courseMap[link.parentKey];
        parentType = 'course';
      } else if (link.parentType === 'diploma') {
        parentId = diplomaMap[link.parentKey];
        parentType = 'diploma';
      } else if (link.parentType === 'section') {
        parentId = sectionMap[link.parentKey];
        parentType = 'section';
      }

      return {
        parent_type: parentType,
        parent_id: parentId,
        label: link.label,
        type: link.type,
        url: link.url,
        order: link.order
      };
    });

    const { data: resourceLinks, error: resourceLinksError } = await supabase
      .from('resource_links')
      .insert(resourceLinksData)
      .select();
    
    if (resourceLinksError) throw resourceLinksError;
    console.log(`✅ Inserted ${resourceLinks.length} resource links`);

    // 7. Seed training sessions
    console.log('🎥 Seeding training sessions...');
    const trainingSessionsData = seedData.trainingSessions.map(session => ({
      key: session.key,
      title: session.title,
      description: session.description,
      mode: session.mode,
      order: session.order
    }));
    
    const { data: trainingSessions, error: trainingSessionsError } = await supabase
      .from('training_sessions')
      .insert(trainingSessionsData)
      .select();
    
    if (trainingSessionsError) throw trainingSessionsError;
    console.log(`✅ Inserted ${trainingSessions.length} training sessions`);

    // Create session key to ID map
    const sessionMap = {};
    trainingSessions.forEach(session => {
      sessionMap[session.key] = session.id;
    });

    // 8. Seed training categories
    console.log('📂 Seeding training categories...');
    const trainingCategoriesData = seedData.trainingCategories.map(cat => ({
      session_id: sessionMap[cat.sessionKey],
      name: cat.name,
      description: cat.description,
      order: cat.order
    }));

    const { data: trainingCategories, error: trainingCategoriesError } = await supabase
      .from('training_categories')
      .insert(trainingCategoriesData)
      .select();
    
    if (trainingCategoriesError) throw trainingCategoriesError;
    console.log(`✅ Inserted ${trainingCategories.length} training categories`);

    // Create category name to ID map
    const categoryMap = {};
    trainingCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // 9. Seed training videos
    console.log('🎬 Seeding training videos...');
    const trainingVideosData = seedData.trainingVideos.map(video => ({
      session_id: sessionMap[video.sessionKey],
      category_id: video.categoryKey ? categoryMap[video.categoryKey] : null,
      title: video.title,
      description: video.description,
      youtube_url: video.youtubeUrl,
      duration: video.duration,
      order: video.order
    }));

    const { data: trainingVideos, error: trainingVideosError } = await supabase
      .from('training_videos')
      .insert(trainingVideosData)
      .select();
    
    if (trainingVideosError) throw trainingVideosError;
    console.log(`✅ Inserted ${trainingVideos.length} training videos`);

    // 10. Seed site config
    console.log('⚙️ Seeding site config...');
    const { error: siteConfigError } = await supabase
      .from('site_config')
      .update({
        whatsapp_number: seedData.siteConfig.whatsappNumber,
        facebook_url: seedData.siteConfig.facebookUrl,
        youtube_url: seedData.siteConfig.youtubeUrl,
        linkedin_url: seedData.siteConfig.linkedinUrl,
        whatsapp_channel_url: seedData.siteConfig.whatsappChannelUrl,
        about_fscu_content: seedData.siteConfig.aboutFscuContent
      })
      .eq('id', 1);
    
    if (siteConfigError) throw siteConfigError;
    console.log('✅ Updated site config');

    // 11. Seed admins
    console.log('👤 Seeding admins...');
    const { error: adminsError } = await supabase
      .from('admins')
      .insert(seedData.admins);
    
    if (adminsError) throw adminsError;
    console.log(`✅ Inserted ${seedData.admins.length} admins`);

    // 12. Seed team projects
    console.log('🚀 Seeding team projects...');
    const teamProjectsData = seedData.teamProjects.map(project => ({
      title: project.title,
      description: project.description,
      cover_image_url: project.coverImageUrl,
      link: project.link,
      date: project.date,
      order: project.order
    }));

    const { data: teamProjects, error: teamProjectsError } = await supabase
      .from('team_projects')
      .insert(teamProjectsData)
      .select();
    
    if (teamProjectsError) throw teamProjectsError;
    console.log(`✅ Inserted ${teamProjects.length} team projects`);

    // 13. Seed team events
    console.log('📅 Seeding team events...');
    const teamEventsData = seedData.teamEvents.map(event => ({
      title: event.title,
      description: event.description,
      date: event.date,
      is_past: event.isPast,
      location: event.location,
      register_link: event.registerLink
    }));

    const { data: teamEvents, error: teamEventsError } = await supabase
      .from('team_events')
      .insert(teamEventsData)
      .select();
    
    if (teamEventsError) throw teamEventsError;
    console.log(`✅ Inserted ${teamEvents.length} team events`);

    // 14. Seed team services
    console.log('🛠️ Seeding team services...');
    const teamServicesData = seedData.teamServices.map(service => ({
      title: service.title,
      description: service.description,
      contact_link: service.contactLink,
      order: service.order
    }));

    const { data: teamServices, error: teamServicesError } = await supabase
      .from('team_services')
      .insert(teamServicesData)
      .select();
    
    if (teamServicesError) throw teamServicesError;
    console.log(`✅ Inserted ${teamServices.length} team services`);

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
