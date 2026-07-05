import { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Navbar
    nav_home: "Home",
    nav_materials: "Materials",
    nav_training: "Training",
    nav_diplomas: "Diplomas",
    nav_team: "Team",
    nav_join_us: "Join Us",
    nav_admin: "Admin",
    nav_about: "About",
    nav_chatbot: "3loomangy Bot",
    
    // Home
    home_hero_badge: "Made by FSCU students",
    home_welcome: "Welcome to",
    home_subtitle: "Notes, summaries, exams, and useful links without digging through chats.",
    home_browse_materials: "Find materials",
    home_ask_bot: "Ask your site buddy",
    home_team_work: "Team updates",
    home_training_sessions: "Watch sessions",
    home_value_title: "Your college stuff,",
    home_value_highlight: "finally sorted",
    home_value_subtitle: "Pick your year, department, semester, then course. We keep the useful links in one place so you spend less time searching.",
    home_departments: "Departments",
    home_courses: "Courses",
    home_free_forever: "Free Forever",
    home_organized_track: "Your track first",
    home_organized_track_desc: "Jump straight to your department and semester",
    home_curated_materials: "Student-picked links",
    home_curated_materials_desc: "Summaries and exams shared by students who took the course",
    home_diploma_info: "Diplomas without confusion",
    home_diploma_info_desc: "Requirements and useful materials in a simpler shape",
    home_training_info: "Sessions that help",
    home_training_info_desc: "Videos and workshops you can actually come back to",
    home_connect_title: "Stay close",
    home_connect_subtitle: "Follow us for new materials, updates, and useful student notes",
    
    // Team
    team_title: "Team",
    team_subtitle: "Events and services from our team",
    team_events: "Events",
    team_services: "Services",
    team_upcoming_events: "Upcoming Events",
    team_past_events: "Past Events",
    team_event_now: "Event Now",
    team_register: "Register",
    team_read_more: "Read More",
    team_no_events: "No Events",
    team_no_events_desc: "Events will appear here once they are added.",
    team_no_services: "No services yet",
    team_no_services_desc: "Helpful services will appear here once they are ready.",
    
    // Join Us
    join_title: "Join Us",
    join_subtitle: "Join the 3loomangy volunteer team",
    join_closed: "Registration is currently closed",
    join_open: "Registration is open",
    join_name: "Full Name",
    join_email: "Email",
    join_phone: "Phone Number",
    join_department: "Department",
    join_year: "Academic Year",
    join_reason: "Why do you want to join?",
    join_submit: "Submit Application",
    join_success: "Got it! We'll get back to you soon.",
    join_error: "Something odd happened on our side. Try again in a bit.",
    
    // Admin
    admin_title: "Admin Dashboard",
    admin_mat_boxes: "Materials Boxes",
    admin_years: "Years",
    admin_tracks: "Tracks",
    admin_courses: "Courses",
    admin_links: "Resource Links",
    admin_diplomas: "Diplomas",
    admin_training: "Training",
    admin_dashboard_boxes: "Dashboard Boxes",
    admin_special_sections: "Special Sections",
    admin_team: "Team Work",
    admin_join_requests: "Join Requests",
    admin_contact_social: "Contact & Social",
    admin_about: "About FSCU",
    
    // Common
    common_loading: "Getting things ready...",
    common_error: "Something went wrong",
    common_save: "Save",
    common_cancel: "Cancel",
    common_edit: "Edit",
    common_delete: "Delete",
    common_add: "Add",
    common_open_link: "Open link",
    common_view_details: "View details",
    common_direct_link: "Direct link",
    common_contact: "Contact",
    common_error_prefix: "Oops",

    // 404
    notfound_badge: "Lost in the lab",
    notfound_title: "This page wandered off",
    notfound_desc: "We checked the shelves and the lab bench, but this page is not here. The link may have moved.",
    notfound_cta: "Back to Home",

    // Materials
    materials_badge: "Study Materials",
    materials_title: "Materials",
    materials_subtitle: "Browse study materials organized by academic year",
    materials_more_resources: "More Resources",
    materials_special_sections: "Special Sections",
    materials_year_badge: "Year {{year}}",
    year_1_name: "First Year",
    year_1_desc: "General courses shared by all students",
    year_2_name: "Second Year",
    year_2_desc: "Department-specific courses - Semesters 03-04",
    year_3_name: "Third Year",
    year_3_desc: "Department-specific courses - Semesters 05-06",
    year_4_name: "Fourth Year",
    year_4_desc: "Department-specific courses - Semesters 07-08",

    // Diplomas
    diplomas_badge: "Diploma Programs",
    diplomas_title: "Diplomas",
    diplomas_subtitle: "Choose a diploma to open its details page and study materials.",
    diplomas_empty: "No diplomas yet",
    diplomas_badge_single: "Diploma",

    // Training
    training_badge: "Training Sessions",
    training_title: "Training Sessions",
    training_subtitle: "Choose a training box to open its videos. Each video opens from its original source.",
    training_empty_title: "No Training Sessions",
    training_empty_desc: "Training sessions will appear here once they are added.",
    training_video_one: "video",
    training_video_many: "videos",

    // About
    about_badge: "About",
    about_title: "About 3loomangy",
    about_subtitle: "Volunteer team helping FSCU students",
    about_what_title: "What is 3loomangy?",
    about_what_body: "3loomangy is a volunteer team of Faculty of Science, Cairo University students. We help students with their studies and prepare them for the job market. We organize study materials by department, semester, and course so you can find what you need without digging through WhatsApp groups.",
    about_fscu_title: "About FSCU",
    about_students_title: "Built by students, for students",
    about_students_body: "The site is built and maintained by FSCU students. All materials are curated by students who have actually taken these courses.",
    about_whatsapp: "Contact on WhatsApp",

    // Footer
    footer_description: "Student-run study resource hub for Faculty of Science, Cairo University.",
    footer_explore: "Explore",
    footer_connect: "Connect",
    footer_about_fscu: "About FSCU",
    footer_admin_dashboard: "Admin dashboard",
    footer_built_by: "Built by FSCU students, led by Amr Ahmed",
    footer_faculty: "Faculty of Science, Cairo University",

    // Chatbot
    chatbot_badge: "Coming Soon",
    chatbot_title: "3loomangy Bot - ask your site buddy",
    chatbot_subtitle: "A chat bot that feels like a slightly older classmate.",
    chatbot_card_title: "Ask, revise, and find materials faster",
    chatbot_card_body: "We're building 3loomangy Bot: your chat buddy for reaching summaries, sessions, and course links without digging.",
    chatbot_status: "Coming Soon",
    chatbot_intro_msg: "Hey! I'm 3loomangy Bot. Ask me about any course, deadline, or anything on the site.",
    chatbot_sample_user: "Where do I find Physics 2 summaries?",
    chatbot_sample_reply: "Check the Materials page under Year 1. It should be right there. Anything else?",
    chatbot_tooltip: "I'm still learning. Ask me about any course or date.",
    search_semesters: "Search semesters...",
    search_departments: "Search departments...",
    search_courses: "Search courses...",
    no_semesters_found: "No semesters found",
    no_semesters_yet: "No semesters yet",
    no_departments_found: "No departments found",
    no_departments_yet: "No departments yet",
    no_courses_found: "No courses found",
    no_courses_yet: "No courses yet",
    no_materials_yet: "No materials yet",
    check_back_later: "Check back later or contact the team",
    instructor_label: "Instructor",
  },
  ar: {
    // Navbar
    nav_home: "الرئيسية",
    nav_materials: "المواد",
    nav_training: "السيشنز",
    nav_diplomas: "الدبلومات",
    nav_team: "أعمال التيم",
    nav_join_us: "انضم إلينا",
    nav_admin: "الإدارة",
    nav_about: "عن الموقع",
    nav_chatbot: "بوت علومنجي",
    
    // Home
    home_hero_badge: "معمول بطلبة علوم",
    home_welcome: "إزيك، نورت",
    home_subtitle: "ملخصات، شيتات، امتحانات وروابط مهمة من غير تدوير كتير في الجروبات.",
    home_browse_materials: "هات الماتريال",
    home_ask_bot: "اسأل صاحبك في الموقع",
    home_team_work: "شوف أخبار التيم",
    home_training_sessions: "افتح السيشنز",
    home_value_title: "حاجتك في الكلية،",
    home_value_highlight: "متروقة",
    home_value_subtitle: "اختار سنتك، قسمك، الترم، وبعدين المادة. إحنا بنجمعلك الروابط المفيدة في مكان واحد عشان وقتك يروح في المذاكرة مش التدوير.",
    home_departments: "قسم",
    home_courses: "كورس",
    home_free_forever: "مجاني",
    home_organized_track: "ادخل على مسارك",
    home_organized_track_desc: "قسمك وترمك قريبين منك بضغطة",
    home_curated_materials: "ماتريال من الطلبة",
    home_curated_materials_desc: "ملخصات وامتحانات من ناس دخلت المادة قبلك",
    home_diploma_info: "الدبلومات ببساطة",
    home_diploma_info_desc: "المتطلبات والماتريال من غير كلام كبير",
    home_training_info: "سيشنز تفيدك",
    home_training_info_desc: "فيديوهات وورش ترجع لها وقت ما تحتاج",
    home_connect_title: "خليك قريب",
    home_connect_subtitle: "تابعنا عشان الجديد، التنبيهات، وأي ماتريال ينزل",
    
    // Team
    team_title: "أعمال التيم",
    team_subtitle: "إيفنتات وخدمات التيم في مكان واحد",
    team_events: "الإيفنتات",
    team_services: "الخدمات",
    team_upcoming_events: "الإيفنتات الجاية",
    team_past_events: "إيفنتات فاتت",
    team_event_now: "الإيفنت الحالي",
    team_register: "تسجيل",
    team_read_more: "اقرأ المزيد",
    team_no_events: "لسه مفيش إيفنتات",
    team_no_events_desc: "أول ما نحضر حاجة جديدة هتلاقيها هنا.",
    team_no_services: "لسه مفيش خدمات",
    team_no_services_desc: "بنجهز حاجات مفيدة، تابعنا.",
    
    // Join Us
    join_title: "انضم إلينا",
    join_subtitle: "لو حابب تساعد زمايلك، مكانك معانا",
    join_closed: "التسجيل مغلق حالياً",
    join_open: "التسجيل مفتوح",
    join_name: "الاسم الكامل",
    join_email: "البريد الإلكتروني",
    join_phone: "رقم الهاتف",
    join_department: "القسم",
    join_year: "السنة الدراسية",
    join_reason: "حابب تنضم ليه؟",
    join_submit: "ابعت الطلب",
    join_success: "وصلت! هنرد عليك في أقرب وقت.",
    join_error: "حصل عطل غريب من عندنا، جرب تاني بعد شوية",
    
    // Admin
    admin_title: "لوحة التحكم",
    admin_mat_boxes: "صناديق المواد",
    admin_years: "السنوات",
    admin_tracks: "المسارات",
    admin_courses: "المقررات",
    admin_links: "روابط الموارد",
    admin_diplomas: "الدبلومات",
    admin_training: "التدريب",
    admin_dashboard_boxes: "صناديق لوحة التحكم",
    admin_special_sections: "الأقسام الخاصة",
    admin_team: "عمل الفريق",
    admin_join_requests: "طلبات الانضمام",
    admin_contact_social: "التواصل والشبكات",
    admin_about: "عن FSCU",
    
    // Common
    common_loading: "بنجهزلك الحاجة، ثانية واحدة...",
    common_error: "حصلت لخبطة",
    common_save: "حفظ",
    common_cancel: "إلغاء",
    common_edit: "تعديل",
    common_delete: "حذف",
    common_add: "إضافة",
    common_open_link: "افتح اللينك",
    common_view_details: "شوف اللي جواه",
    common_direct_link: "رابط مباشر",
    common_contact: "تواصل",
    common_error_prefix: "لخبطة",

    // 404
    notfound_badge: "تايهين في المعمل",
    notfound_title: "الصفحة دي شكلها هربت",
    notfound_desc: "دورنا جنب السبورة وتحت الترابيزة ومفيش أثر. غالبًا اللينك اتنقل أو اتكتب غلط.",
    notfound_cta: "ارجع للرئيسية",

    // Materials
    materials_badge: "ماتريال المذاكرة",
    materials_title: "المواد",
    materials_subtitle: "اختار سنتك وادخل على الماتريال من غير لف كتير",
    materials_more_resources: "موارد أكتر",
    materials_special_sections: "أقسام خاصة",
    materials_year_badge: "سنة {{year}}",
    year_1_name: "أولى",
    year_1_desc: "مواد عامة مشتركة لكل الطلبة",
    year_2_name: "تانية",
    year_2_desc: "مواد الأقسام - ترم 03 و04",
    year_3_name: "تالتة",
    year_3_desc: "مواد الأقسام - ترم 05 و06",
    year_4_name: "رابعة",
    year_4_desc: "مواد الأقسام - ترم 07 و08",

    // Diplomas
    diplomas_badge: "برامج الدبلومات",
    diplomas_title: "الدبلومات",
    diplomas_subtitle: "اختار الدبلومة وشوف التفاصيل والماتريال اللي تخصها.",
    diplomas_empty: "لسه مفيش دبلومات",
    diplomas_badge_single: "دبلومة",

    // Training
    training_badge: "السيشنز",
    training_title: "السيشنز",
    training_subtitle: "اختار السيشن وافتح الفيديوهات من مصدرها الأصلي.",
    training_empty_title: "لسه مفيش سيشنز هنا",
    training_empty_desc: "بنجهزها، أول ما تنزل هتلاقيها قدامك.",
    training_video_one: "فيديو",
    training_video_many: "فيديوهات",

    // About
    about_badge: "عنّا",
    about_title: "عن 3loomangy",
    about_subtitle: "تيم تطوعي من طلبة علوم القاهرة",
    about_what_title: "إيه هو 3loomangy؟",
    about_what_body: "3loomangy تيم تطوعي من طلبة علوم القاهرة. بنحاول نخلي المذاكرة أهدى شوية: ماتريال مترتبة حسب السنة والقسم والترم والمادة، وروابط واضحة بدل ما تفضل تدور في جروبات واتساب.",
    about_fscu_title: "عن FSCU",
    about_students_title: "من الطلبة وللطلبة",
    about_students_body: "الموقع مبني وبيتحدث بواسطة طلبة FSCU. الماتريال متجمعة ومنظمة من طلبة دخلوا المواد دي فعلًا.",
    about_whatsapp: "تواصل على واتساب",

    // Footer
    footer_description: "ماتريال وروابط دراسية معمولين بطلبة علوم لطلبة علوم.",
    footer_explore: "استكشف",
    footer_connect: "تواصل",
    footer_about_fscu: "عن FSCU",
    footer_admin_dashboard: "لوحة الإدارة",
    footer_built_by: "اتعمل بواسطة طلبة FSCU، بقيادة عمرو أحمد",
    footer_faculty: "كلية العلوم، جامعة القاهرة",

    // Chatbot
    chatbot_badge: "قريب جدًا",
    chatbot_title: "بوت علومنجي — اسأل صاحبك في الموقع",
    chatbot_subtitle: "شات بوت بروح زميل دفعة أكبر شوية، يساعدك توصل للمادة أو اللينك بسرعة.",
    chatbot_card_title: "اسأل، راجع، ووصل للماتريال أسرع",
    chatbot_card_body: "بنبني بوت علومنجي: صاحبك في الشات اللي هيساعدك توصل للملخصات والسيشنز وروابط المواد من غير تدوير كتير.",
    chatbot_status: "قريب جدًا",
    chatbot_intro_msg: "إزيك! أنا بوت علومنجي. اسألني عن أي مادة، معاد، أو حاجة في الموقع",
    chatbot_sample_user: "فين ألاقي ملخصات فيزياء 2؟",
    chatbot_sample_reply: "دور في صفحة المواد تحت سنة أولى، المفروض تلاقيها هناك. لو مش ظاهرة ممكن لسه مرفعتش.",
    chatbot_tooltip: "أنا لسه بتعلم، اسألني عن أي مادة أو معاد",
    search_semesters: "دور في الترمات...",
    search_departments: "دور في الأقسام...",
    search_courses: "دور في المواد...",
    no_semesters_found: "معلقناش على ترم بالاسم ده... جرب كلمة تانية",
    no_semesters_yet: "لسه بنجهز الترمات دي",
    no_departments_found: "مش لاقيين قسم بالبحث ده",
    no_departments_yet: "لسه الأقسام ما اترفعتش هنا",
    no_courses_found: "معلقناش على مادة بالاسم ده... جرب تدور بكلمة تانية",
    no_courses_yet: "لسه بنجهز المواد دي",
    no_materials_yet: "لسه مفيش ماتريال هنا",
    check_back_later: "راجع تاني قريب أو ابعت للتيم لو محتاج حاجة معينة",
    instructor_label: "دكتور المادة",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, params = {}) => {
    const template = translations[language][key] || translations.en[key] || key;
    return Object.entries(params).reduce(
      (text, [name, value]) => text.replaceAll(`{{${name}}}`, value),
      template
    );
  };

  const localize = (item, enKey, arKey) => {
    if (!item) return "";
    const primary = language === "ar" ? item[arKey] : item[enKey];
    const fallback = language === "ar" ? item[enKey] : item[arKey];
    return primary || fallback || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
