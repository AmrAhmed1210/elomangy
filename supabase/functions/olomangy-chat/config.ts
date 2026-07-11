export const EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIM = 768;
/** Ordered fallback chain — first model that succeeds wins. */
export const CHAT_MODELS = [
  "gemini-2.5-flash-lite",   // primary: fast, cheap, current
  "gemini-3.5-flash",        // fallback: newest generation
];

export const NO_MATERIALS_MESSAGE =
  "الماتيريال دي مش موجودة في الداتا بيز حالياً يا صاحبي، بس ولا تشيل هم! هبلغ تيم علومنجي يوفروها ويرفعوها على الموقع في أسرع وقت! 🚀";

export const SYSTEM_INSTRUCTION = `
أنت "علومنجي بوت" (3loomangy Bot) 🧪 - المساعد الذكي الرسمي لطلاب كلية العلوم جامعة القاهرة (FSCU) على منصة "علومنجي".

شخصيتك: متحمس، محفّز، ودود، مصري طبيعي — زي الصاحب والزميل اللي بيشرح وبيشجع.
قاعدة التحية (إلزامية): ابدأ كل رد بتحية مصرية دافئة (مثال: "إزيك يا علومنجي! نورت الموقع يا بطل 🌟") ثم ضع خطاً فاصلاً "---" قبل الإجابة.
التنسيق: استخدم Markdown بوضوح (عناوين bold، نقاط، فقرات مفصولة بـ "---"). لا تكتب جداراً نصياً مسطحاً.

خريطة روابط الموقع (Site Map) - استخدمها لبناء الروابط مباشرة دون اختلاق:
- الصفحة الرئيسية: \`/\`
- عن المنصة: \`/about\`
- الماتيريال (المواد الدراسية): \`/materials\`
- مواد سنة دراسية محددة: \`/materials/year/:year\` (حيث :year هي 1, 2, 3, 4)
- مواد قسم معين داخل سنة: \`/materials/year/:year/:trackSlug\` (مثال: \`/materials/year/2/biochemistry\`)
- مواد فصل دراسي معين (ترم):
  - بدون قسم: \`/materials/year/:year/semester/:semesterId\`
  - مع قسم: \`/materials/year/:year/:trackSlug/semester/:semesterId\`
- صفحة المادة التفصيلية: \`/materials/course/:courseId\`
- صفحة الصناديق/الأقسام الإضافية: \`/materials/box/:boxId\`
- الأقسام الخاصة (مثل امتحانات المعادلة): \`/materials/section/:slug\` (مثال: \`/materials/section/equivalency-exams\`)
- الدبلومات المتاحة: \`/diplomas\`
- صفحة دبلومة معينة: \`/diplomas/:slug\` (مثال: \`/diplomas/biotechnology-diploma\`)
- جلسات التدريب: \`/training-sessions\`
- تفاصيل سيشن تدريبي: \`/training-sessions/:sessionId\`
- تفاصيل تصنيف داخل سيشن: \`/training-sessions/:sessionId/:categoryId\`
- صفحة الفريق: \`/team\`
- صفحة انضم إلينا: \`/join-us\`

قواعد اتخاذ القرار وتوجيه الأسئلة:
1. الأسئلة الأكاديمية والعلمية العامة (مثل: حل تكامل، شرح تفاضل، كيمياء عضوية، فيزياء، برمجة، إلخ) يجب الإجابة عنها مباشرة من معرفتك الذاتية الكاملة ودون طلب أي أدوات أو البحث في قاعدة البيانات.
2. الأسئلة المتعلقة ببيانات الموقع أو لوائح كلية العلوم (مثل: شروط دبلومة معينة، عدد التراكات، كود مادة، أو روابط الماتيريال) يجب حلها باستخدام الأدوات المناسبة (Tools) المتاحة لك.
3. لا تقم أبداً باختراع أو تزييف روابط درايف أو ملفات. إذا لم تجد روابط المادة بعد استدعاء الأدوات، رد بالصيغة التالية تماماً:
"${NO_MATERIALS_MESSAGE}"
`.trim();

export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "list_tracks",
        description: "Returns a list of all tracks (departments) in the Faculty of Science, Cairo University, along with their slugs and names. Use this to find available tracks/departments.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "list_diplomas",
        description: "Returns a list of all postgraduate diplomas offered by the Faculty of Science, Cairo University, including their descriptions and eligibility criteria.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "list_training_sessions",
        description: "Returns a list of all training sessions available on the platform, including their titles, descriptions, and modes (videos or categories).",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
      {
        name: "list_courses",
        description: "Get the list of courses for a specific track, optionally filtered by year or semester label (e.g. 'Semester 03').",
        parameters: {
          type: "OBJECT",
          properties: {
            track_slug: {
              type: "STRING",
              description: "The slug of the track/department (e.g., 'biochemistry', 'biophysics', 'chemistry-microbiology', 'geology').",
            },
            year: {
              type: "INTEGER",
              description: "The academic year (1, 2, 3, or 4).",
            },
            semester_label: {
              type: "STRING",
              description: "The semester label (e.g., 'Semester 01', 'Semester 02', etc.). Match using fuzzy name search.",
            },
          },
          required: ["track_slug"],
        },
      },
      {
        name: "get_resource_links",
        description: "Retrieve direct resource links (Google Drive folders, files, summaries, etc.) for a specific course, special section, or diploma.",
        parameters: {
          type: "OBJECT",
          properties: {
            parent_type: {
              type: "STRING",
              description: "The type of parent, must be one of: 'course', 'section', 'diploma'.",
            },
            parent_name_or_slug: {
              type: "STRING",
              description: "The course code (e.g. 'Chem 241', 'Math 131'), course name, special section slug (e.g. 'equivalency-exams'), or diploma slug (e.g. 'biotechnology-diploma').",
            },
          },
          required: ["parent_type", "parent_name_or_slug"],
        },
      },
      {
        name: "search_site_content",
        description: "Search across the student guide knowledge base (via vector search) and other structural site contents to find relevant policies, regulations, materials, or team information.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description: "The search query (Arabic or English) for vector search or structural content matching.",
            },
            category: {
              type: "STRING",
              description: "Optional category to filter search: 'knowledge_base', 'courses', 'diplomas', 'training', 'team', or 'all'.",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
];