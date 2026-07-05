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
    nav_chatbot: "Chatbot",
    
    // Home
    home_hero_badge: "FSCU Student Resources",
    home_welcome: "Welcome to",
    home_subtitle: "Your study resource hub for Faculty of Science, Cairo University",
    home_browse_materials: "Browse Materials",
    home_team_work: "Team Work",
    home_training_sessions: "Training Sessions",
    home_value_title: "Everything you need,",
    home_value_highlight: "organized",
    home_value_subtitle: "Summaries, lecture notes, and past exams — sorted by department, semester, and course. No more digging through WhatsApp groups.",
    home_departments: "Departments",
    home_courses: "Courses",
    home_free_forever: "Free Forever",
    home_organized_track: "Organized by Track",
    home_organized_track_desc: "Find your department and semester instantly",
    home_curated_materials: "Curated Materials",
    home_curated_materials_desc: "Summaries and exams from students who took the course",
    home_diploma_info: "Diploma Info",
    home_diploma_info_desc: "Requirements and materials for faculty diplomas",
    home_training_info: "Training Sessions",
    home_training_info_desc: "Video tutorials and skill-building workshops",
    home_connect_title: "Connect with us",
    home_connect_subtitle: "Follow us for updates, tips, and new materials",
    
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
    team_no_services: "No Services",
    team_no_services_desc: "Services will appear here once they are added.",
    
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
    join_success: "Application submitted successfully!",
    join_error: "Error submitting application",
    
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
    common_loading: "Loading...",
    common_error: "Error",
    common_save: "Save",
    common_cancel: "Cancel",
    common_edit: "Edit",
    common_delete: "Delete",
    common_add: "Add",
    common_open_link: "Open link",
    common_view_details: "View details",
    common_direct_link: "Direct link",
    common_contact: "Contact",
    common_error_prefix: "Error",

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
    chatbot_title: "3loomangy Chatbot",
    chatbot_subtitle: "A smarter study assistant is on the way.",
    chatbot_card_title: "Ask, revise, and find materials faster",
    chatbot_card_body: "We are preparing a chat experience that helps you reach summaries, sessions, and course links with less searching.",
    chatbot_status: "Coming Soon",
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
    nav_chatbot: "علومنجي بوت",
    
    // Home
    home_hero_badge: "موارد طلاب كلية العلوم",
    home_welcome: "مرحباً بك في",
    home_subtitle: "مركز مواردك الدراسية لكلية العلوم، جامعة القاهرة",
    home_browse_materials: "تصفح المواد",
    home_team_work: "عمل الفريق",
    home_training_sessions: "السيشنز",
    home_value_title: "كل ما تحتاجه،",
    home_value_highlight: "ومتنظم",
    home_value_subtitle: "ملخصات، ملاحظات المحاضرات، وامتحانات سابقة — مرتبة حسب القسم والفصل والمقرر. لا مزيد من البحث في مجموعات واتساب.",
    home_departments: "الأقسام",
    home_courses: "المقررات",
    home_free_forever: "مجانية للأبد",
    home_organized_track: "مرتبة حسب المسار",
    home_organized_track_desc: "اعثر على قسمك وفصلك الدراسي فوراً",
    home_curated_materials: "مواد مختارة",
    home_curated_materials_desc: "ملخصات وامتحانات من الطلاب الذين درسوا المقرر",
    home_diploma_info: "معلومات الدبلومات",
    home_diploma_info_desc: "المتطلبات والمواد لدبلومات الكلية",
    home_training_info: "السيشنز",
    home_training_info_desc: "فيديوهات وورش تساعدك تطور مهاراتك خطوة بخطوة",
    home_connect_title: "تواصل معنا",
    home_connect_subtitle: "تابعنا للحصول على التحديثات والنصائح والمواد الجديدة",
    
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
    team_no_events_desc: "الإيفنتات هتظهر هنا أول ما تتضاف.",
    team_no_services: "لا توجد خدمات",
    team_no_services_desc: "ستظهر الخدمات هنا بمجرد إضافتها.",
    
    // Join Us
    join_title: "انضم إلينا",
    join_subtitle: "انضم لتيم علومنجي التطوعي",
    join_closed: "التسجيل مغلق حالياً",
    join_open: "التسجيل مفتوح",
    join_name: "الاسم الكامل",
    join_email: "البريد الإلكتروني",
    join_phone: "رقم الهاتف",
    join_department: "القسم",
    join_year: "السنة الدراسية",
    join_reason: "لماذا تريد الانضمام؟",
    join_submit: "إرسال الطلب",
    join_success: "طلبك اتبعت بنجاح! هنرجع لك قريب.",
    join_error: "خطأ في إرسال الطلب",
    
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
    common_loading: "جاري التحميل...",
    common_error: "خطأ",
    common_save: "حفظ",
    common_cancel: "إلغاء",
    common_edit: "تعديل",
    common_delete: "حذف",
    common_add: "إضافة",
    common_open_link: "افتح الرابط",
    common_view_details: "شوف التفاصيل",
    common_direct_link: "رابط مباشر",
    common_contact: "تواصل",
    common_error_prefix: "خطأ",

    // Materials
    materials_badge: "ماتريال المذاكرة",
    materials_title: "المواد",
    materials_subtitle: "تصفح الماتريال مرتبة حسب السنة الدراسية",
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
    diplomas_subtitle: "اختار الدبلومة عشان تفتح تفاصيلها والماتريال الخاصة بيها.",
    diplomas_empty: "لسه مفيش دبلومات",
    diplomas_badge_single: "دبلومة",

    // Training
    training_badge: "السيشنز",
    training_title: "السيشنز",
    training_subtitle: "اختار السيشن وافتح الفيديوهات من مصدرها الأصلي.",
    training_empty_title: "لسه مفيش سيشنز",
    training_empty_desc: "السيشنز هتظهر هنا أول ما تتضاف.",
    training_video_one: "فيديو",
    training_video_many: "فيديوهات",

    // About
    about_badge: "عنّا",
    about_title: "عن 3loomangy",
    about_subtitle: "تيم تطوعي من طلبة علوم القاهرة",
    about_what_title: "إيه هو 3loomangy؟",
    about_what_body: "3loomangy تيم تطوعي من طلبة كلية العلوم جامعة القاهرة. بنساعد الطلبة في المذاكرة وبنأهلهم لسوق العمل. بنرتب الماتريال حسب القسم والترم والمادة عشان توصل للي محتاجه من غير تدوير كتير في جروبات واتساب.",
    about_fscu_title: "عن FSCU",
    about_students_title: "من الطلبة وللطلبة",
    about_students_body: "الموقع مبني وبيتحدث بواسطة طلبة FSCU. الماتريال متجمعة ومنظمة من طلبة دخلوا المواد دي فعلًا.",
    about_whatsapp: "تواصل على واتساب",

    // Footer
    footer_description: "مركز ماتريال دراسية معمول بطلبة كلية العلوم جامعة القاهرة.",
    footer_explore: "استكشف",
    footer_connect: "تواصل",
    footer_about_fscu: "عن FSCU",
    footer_admin_dashboard: "لوحة الإدارة",
    footer_built_by: "اتعمل بواسطة طلبة FSCU، بقيادة عمرو أحمد",
    footer_faculty: "كلية العلوم، جامعة القاهرة",

    // Chatbot
    chatbot_badge: "قريب جدًا",
    chatbot_title: "علومنجي بوت",
    chatbot_subtitle: "مساعد مذاكرة أذكى جاي في الطريق.",
    chatbot_card_title: "اسأل، راجع، ووصل للماتريال أسرع",
    chatbot_card_body: "بنجهز تجربة شات تساعدك تلاقي الملخصات والسيشنز وروابط المواد من غير تدوير كتير.",
    chatbot_status: "Coming Soon",
    search_semesters: "دور في الترمات...",
    search_departments: "دور في الأقسام...",
    search_courses: "دور في المواد...",
    no_semesters_found: "مفيش ترمات بالبحث ده",
    no_semesters_yet: "لسه مفيش ترمات",
    no_departments_found: "مفيش أقسام بالبحث ده",
    no_departments_yet: "لسه مفيش أقسام",
    no_courses_found: "مفيش مواد بالبحث ده",
    no_courses_yet: "لسه مفيش مواد",
    no_materials_yet: "لسه مفيش ماتريال",
    check_back_later: "راجع تاني قريب أو تواصل مع التيم",
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