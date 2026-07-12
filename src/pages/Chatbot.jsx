import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "../components/layout/PageLayout";
import PageHeader from "../components/layout/PageHeader";
import MarkdownText from "../components/chat/MarkdownText";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../lib/supabase";

const SESSION_KEY = "3loomangy_bot_session_id";

const ERROR_REPLIES = {
  ar: [
    "إزيك يا علومنجي! نورت الموقع يا بطل 🌟",
    "---",
    "**في مشكلة تقنية بسيطة** 🔧",
    "",
    "جرب تاني بعد ثواني — أو تواصل مع تيم علومنجي!",
  ].join("\n"),
  en: [
    "Hey Olomangy! Welcome back champ 🌟",
    "---",
    "**We're facing a minor technical issue** 🔧",
    "",
    "Please try again in a few seconds — or reach out to the Olomangy team!",
  ].join("\n")
};

const SUGGESTIONS = {
  ar: [
    { text: "أين أجد ملخصات سنة أولى؟", icon: "📚" },
    { text: "ما هي أقسام الكلية المتاحة؟", icon: "🏢" },
    { text: "ما هي شروط الدبلومات؟", icon: "🎓" },
    { text: "عايز اتفرج على السيشنز والورش", icon: "💻" },
  ],
  en: [
    { text: "Where can I find Year 1 summaries?", icon: "📚" },
    { text: "What are the available college departments?", icon: "🏢" },
    { text: "What are the diploma requirements?", icon: "🎓" },
    { text: "Show me the training sessions and workshops", icon: "💻" },
  ]
};

const LOCAL_TEXT = {
  ar: {
    clear_chat: "مسح المحادثة",
    info_title: "لوحة التحكم الذكية",
    features_title: "العمليات المدعومة ✨",
    upload_tip: "ارفع ملف PDF للمحاضرة أو صورة شيت وسأقوم بتلخيصها.",
    materials_tip: "ابحث عن أكواد المقررات والمحاضرات للترم والمسار الأكاديمي.",
    college_tip: "اسأل عن أقسام وشروط التشعيب لطلاب كلية العلوم.",
    beta_badge: "نسخة تفاعلية",
    quick_questions: "المطالبات السريعة المقترحة 💡",
    typing: "يتم تحليل المعطيات والبحث في الدليل الأكاديمي...",
    active_status: "النواة الذكية نشطة",
    close: "إغلاق",
    about_desc: "مساعد علومنجي الذكي مدمج بنظام ذكاء اصطناعي ونظام ملاحة محلي لمساعدتك في تصفح الموقع والكلية بكفاءة.",
    capabilities_header: "ما يمكن للمساعد الذكي فعله: ⚡",
    welcome_header: "أنا رفيقك الرقمي لمساعدتك في تصفح المواد ولوائح كلية العلوم جامعة القاهرة في ثوانٍ معدودة."
  },
  en: {
    clear_chat: "Clear Chat",
    info_title: "Smart Control Panel",
    features_title: "Supported Operations ✨",
    upload_tip: "Upload a lecture PDF or sheet photo and I will summarize it.",
    materials_tip: "Query course codes and link paths for any semester.",
    college_tip: "Inquire about majoring details and requirements in FSCU.",
    beta_badge: "Interactive Beta",
    quick_questions: "Suggested Quick Prompts 💡",
    typing: "Analyzing inputs and querying database...",
    active_status: "AI Core Active",
    close: "Close",
    about_desc: "Olomangy Bot is powered by AI and local database indexing to guide you through materials, schedules, and regulations.",
    capabilities_header: "What the Assistant can do: ⚡",
    welcome_header: "Your digital classmate helping you navigate study materials and regulations of Faculty of Science, Cairo University."
  }
};

function readFileAsAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve({
        mimeType: file.type || "application/octet-stream",
        data: base64,
        name: file.name,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Chatbot() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const localText = LOCAL_TEXT[language] || LOCAL_TEXT.en;
  const currentErrorReply = ERROR_REPLIES[language] || ERROR_REPLIES.en;
  const currentSuggestions = SUGGESTIONS[language] || SUGGESTIONS.en;

  // We prepend the welcome message dynamically, so its language updates instantly.
  const welcomeMessage = { role: "model", content: t("chatbot_welcome") };
  const allMessages = messages.length === 0 ? [] : [welcomeMessage, ...messages];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const attachment = await readFileAsAttachment(file);
      setPendingAttachment(attachment);
      if (!input.trim()) {
        const arPrompt = `ساعدني في الملف ده: ${file.name}`;
        const enPrompt = `Help me with this file: ${file.name}`;
        setInput(language === "ar" ? arPrompt : enPrompt);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function executeMessage(text, attachment) {
    if (sending) return;

    const displayText = text || (language === "ar" ? `📎 ملف مرفق: ${attachment?.name}` : `📎 Attached: ${attachment?.name}`);
    
    setMessages((prev) => [...prev, { role: "user", content: displayText }]);
    setSending(true);

    try {
      const formattedAttachments = attachment ? [{
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        },
        name: attachment.name
      }] : undefined;

      const payload = {
        message: text || `Analyze the attached file: ${attachment?.name ?? "attachment"}`,
        session_id: sessionStorage.getItem(SESSION_KEY) || undefined,
        ...(formattedAttachments ? { attachments: formattedAttachments } : {}),
      };

      const { data, error } = await supabase.functions.invoke("olomangy-chat", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.session_id) sessionStorage.setItem(SESSION_KEY, data.session_id);

      setMessages((prev) => [
        ...prev,
        { role: "model", content: data?.reply || currentErrorReply },
      ]);
    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages((prev) => [...prev, { role: "model", content: currentErrorReply }]);
    } finally {
      setSending(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text && !pendingAttachment) return;

    setInput("");
    const attachmentToUpload = pendingAttachment;
    setPendingAttachment(null);
    await executeMessage(text, attachmentToUpload);
  }

  async function handleQuickQuestion(text) {
    if (sending) return;
    await executeMessage(text, null);
  }

  function handleClearChat() {
    sessionStorage.removeItem(SESSION_KEY);
    setMessages([]);
  }

  const isAttachmentImage = pendingAttachment?.mimeType?.startsWith("image/");
  const imagePreviewSrc = isAttachmentImage ? `data:${pendingAttachment.mimeType};base64,${pendingAttachment.data}` : null;

  return (
    <PageLayout>
      <PageHeader
        badge={t("chatbot_badge")}
        badgeColor="accent-purple"
        title={t("chatbot_title")}
        subtitle={t("chatbot_subtitle")}
        breadcrumbs={[{ to: "/", label: t("nav_home") }, { label: t("nav_chatbot") }]}
      />

      <div className="mx-auto max-w-6xl w-full px-1">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* SIDEBAR: Clean, Typographic Dashboard Panel */}
          <aside className="hidden lg:flex lg:col-span-4 flex-col justify-between gap-6 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] p-6 shadow-2xl relative overflow-hidden h-full">
            {/* Glowing Orbs */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-lab-teal/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col gap-6">
              
              {/* Bot Meta Info */}
              <div className="flex flex-col items-center text-center pb-5 border-b border-[var(--surface-border)]">
                <div className="relative mb-4">
                  {/* Glowing Ring Animation */}
                  <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-dashed border-lab-teal animate-[spin_12s_linear_infinite]" />
                  <div className="absolute -inset-1.5 w-27 h-27 rounded-full border border-accent-purple/35 animate-[spin_8s_linear_infinite_reverse] opacity-60" />
                  
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-[var(--surface-border)] shadow-xl relative z-10 p-2">
                    <img src="/logo-mark.png" alt="Olomangy Mascot" className="w-16 h-16 object-contain animate-mascot-bounce" />
                  </div>
                  
                  <span className="absolute bottom-0 right-1 flex h-5 w-5 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-answer-green opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-answer-green border-2 border-white dark:border-slate-800"></span>
                  </span>
                </div>
                
                <h3 className="font-display font-black text-xl text-chalkboard mt-1">{t("chatbot_card_title")}</h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-0.5 text-[10px] font-black rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20 uppercase tracking-widest">
                    {localText.beta_badge}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-answer-green bg-answer-green/10 px-2 py-0.5 rounded-full border border-answer-green/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-answer-green animate-ping" />
                    <span>{language === 'ar' ? 'متصل بالدليل' : 'Index Online'}</span>
                  </div>
                </div>
              </div>

              {/* Bot Specs Panel (Clean typographic list, no boxed rows) */}
              <div className="space-y-4">
                <h4 className="font-display font-black text-xs text-chalkboard-light/75 uppercase tracking-wider mb-1">{localText.features_title}</h4>
                
                <div className="flex gap-3.5 items-start text-xs leading-relaxed text-chalkboard-light py-2 border-b border-[var(--surface-border)]/50">
                  <span className="text-lg select-none">📎</span>
                  <div>
                    <strong className="font-display font-bold text-chalkboard block mb-0.5">{language === "ar" ? "شرح وتلخيص الملفات" : "File Explanation"}</strong>
                    <p className="text-[11px] text-chalkboard-light/80">{localText.upload_tip}</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start text-xs leading-relaxed text-chalkboard-light py-2 border-b border-[var(--surface-border)]/50">
                  <span className="text-lg select-none">📚</span>
                  <div>
                    <strong className="font-display font-bold text-chalkboard block mb-0.5">{language === "ar" ? "المناهج والملخصات" : "Browse Courses & Notes"}</strong>
                    <p className="text-[11px] text-chalkboard-light/80">{localText.materials_tip}</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start text-xs leading-relaxed text-chalkboard-light py-2">
                  <span className="text-lg select-none">🎓</span>
                  <div>
                    <strong className="font-display font-bold text-chalkboard block mb-0.5">{language === "ar" ? "لوائح الكلية والتشعيب" : "College Regulations"}</strong>
                    <p className="text-[11px] text-chalkboard-light/80">{localText.college_tip}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] text-chalkboard-light/80 leading-relaxed mb-4">
                {localText.about_desc}
              </p>
              <Link
                to="/materials"
                className="w-full inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-lab-teal via-lab-teal-light to-answer-green px-4 py-2.5 text-sm font-black text-white shadow-lg hover:shadow-xl transition hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0 active:scale-100 press-squish"
              >
                {t("home_browse_materials")}
              </Link>
            </div>
          </aside>

          {/* MAIN CHAT CONSOLE */}
          <div className="lg:col-span-8 flex flex-col rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-card-strong)] shadow-2xl relative overflow-hidden h-[630px] sm:h-[680px]">
            {/* Top Multi-color Rainbow Bar */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent-purple via-accent-blue via-lab-teal via-answer-green to-periodic-orange z-10 animate-pulse" />
            
            {/* Console Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--surface-border)] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lab-teal/20 via-accent-purple/10 to-transparent flex items-center justify-center border border-[var(--surface-border)] shadow-md">
                    <img src="/logo-mark.png" alt="Mascot Avatar" className="w-9 h-9 object-contain" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-answer-green opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-answer-green border border-white dark:border-slate-800"></span>
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-chalkboard flex items-center gap-1.5 leading-none">
                    {language === "ar" ? "مساعد علومنجي الذكي" : "3loomangy AI Core"}
                  </h3>
                  <span className="text-[10px] font-extrabold text-answer-green mt-1.5 block tracking-wide">
                    {localText.active_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Info button for mobile views */}
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="lg:hidden p-2.5 rounded-2xl border border-[var(--surface-border)] bg-white/60 dark:bg-slate-800/60 text-chalkboard hover:text-lab-teal hover:border-lab-teal transition press-squish shadow-sm"
                  aria-label="info"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Clear Chat Button */}
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-red-500 hover:bg-red-500/10 rounded-2xl border border-red-500/20 hover:border-red-500/30 transition press-squish shadow-sm bg-white/40 dark:bg-slate-900/40"
                    title={localText.clear_chat}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">{localText.clear_chat}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth relative flex flex-col"
              style={{ 
                backgroundImage: 'radial-gradient(var(--color-graph-grid) 1.2px, transparent 1.2px)', 
                backgroundSize: '22px 22px' 
              }}
            >
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  /* EXCITING WELCOME PORTAL DASHBOARD (Clean, no giant capability boxes) */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 flex flex-col items-center justify-center py-8 text-center select-none"
                  >
                    
                    {/* Animated Holographic Core */}
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-lab-teal animate-[spin_16s_linear_infinite]" />
                      <div className="absolute w-24 h-24 rounded-full border border-dashed border-accent-purple/40 animate-[spin_8s_linear_infinite_reverse]" />
                      <div className="absolute w-36 h-36 rounded-full bg-lab-teal/5 dark:bg-lab-teal/10 blur-2xl animate-pulse" />
                      
                      <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-lab-teal/30 via-accent-purple/20 to-white/40 dark:to-slate-900/40 backdrop-blur-xl flex items-center justify-center border border-white/40 dark:border-slate-800/40 shadow-2xl relative z-10">
                        <img src="/logo-mark.png" alt="Core Mascot" className="w-12 h-12 object-contain animate-mascot-bounce" />
                      </div>
                    </div>
                    
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-lab-teal via-accent-purple to-periodic-orange mb-3 px-4">
                      {t("chatbot_welcome")}
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-chalkboard-light max-w-md px-6 leading-relaxed mb-10 font-medium">
                      {localText.welcome_header}
                    </p>

                    {/* SUGGESTED FLOATING STARTER CHIPS (Styled as sleek rounded tags) */}
                    <div className="w-full max-w-xl px-4 flex flex-col items-center">
                      <h3 className="font-display font-black text-xs text-chalkboard-light/65 uppercase tracking-wider mb-4">
                        {localText.quick_questions}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2.5 justify-center">
                        {currentSuggestions.map((s, idx) => (
                          <motion.button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickQuestion(s.text)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + idx * 0.05 }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-chalkboard-light hover:text-lab-teal hover:border-lab-teal bg-white/70 dark:bg-slate-900/70 border border-[var(--surface-border)] rounded-full hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer shadow-sm hover:shadow-md press-squish"
                          >
                            <span>{s.icon}</span>
                            <span>{s.text}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  /* MESSAGE CHAT STREAM */
                  <div className="space-y-5">
                    {allMessages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <ChatBubble align={m.role === "user" ? "end" : "start"} text={m.content} />
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* CYBERPUNK TYPING INDICATOR */}
                {sending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--surface-border)] bg-white/80 dark:bg-slate-900/80 px-4 py-3.5 text-chalkboard shadow-md backdrop-blur-md">
                      <span className="animate-mascot-bounce text-2xl select-none">🧪</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-chalkboard-light tracking-wide uppercase">{localText.typing}</span>
                        <div className="flex gap-1.5 items-center mt-1">
                          <div className="h-2 w-2 bg-gradient-to-r from-lab-teal to-lab-teal-light rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="h-2 w-2 bg-gradient-to-r from-lab-teal to-lab-teal-light rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="h-2 w-2 bg-gradient-to-r from-lab-teal to-lab-teal-light rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* HORIZONTAL QUICK ACTIONS BAR (Shown during active chat) */}
            {messages.length > 0 && !sending && (
              <div className="px-4 pt-2.5 pb-1 shrink-0 bg-gradient-to-t from-white/30 to-transparent dark:from-slate-900/10">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x mask-fade-edges">
                  {currentSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickQuestion(s.text)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--surface-border)] bg-white/80 dark:bg-slate-900/80 hover:border-lab-teal hover:bg-white dark:hover:bg-slate-800 text-[11px] font-black text-chalkboard-light hover:text-lab-teal whitespace-nowrap transition cursor-pointer press-squish snap-center shadow-sm hover:shadow"
                    >
                      <span>{s.icon}</span>
                      <span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Floating Style Input Console Bar */}
            <div className="border-t border-[var(--surface-border)] p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shrink-0">
              
              {/* Image / Attachment Preview Box */}
              {pendingAttachment && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-3.5 flex items-center gap-3 rounded-2xl border border-lab-teal/30 bg-lab-teal/5 dark:bg-lab-teal/10 p-2.5 text-xs text-lab-teal relative shadow-inner"
                >
                  {imagePreviewSrc ? (
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-lab-teal/35 bg-white flex-shrink-0 shadow">
                      <img src={imagePreviewSrc} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-lab-teal/20 flex items-center justify-center text-xl flex-shrink-0 shadow">
                      📄
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-black truncate text-[11px] text-chalkboard">{pendingAttachment.name}</p>
                    <p className="text-[10px] text-chalkboard-light/85 mt-0.5">
                      {isAttachmentImage ? (language === "ar" ? "صورة مرفقة جاهزة للمراجعة" : "Image attached - ready") : (language === "ar" ? "مستند PDF جاهز للمراجعة" : "Document attached - ready")}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-600 transition flex items-center justify-center"
                    aria-label="remove attachment"
                  >
                    ✕
                  </button>
                </motion.div>
              )}

              {/* Form Controls */}
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[var(--surface-border)] bg-white/80 text-chalkboard hover:border-lab-teal hover:text-lab-teal disabled:opacity-50 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 transition press-squish text-xl shadow-sm hover:shadow"
                  aria-label="upload file"
                  title={language === "ar" ? "إرفاق ملف" : "Attach File"}
                >
                  📎
                </button>
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chatbot_input_placeholder") || "اسأل علومنجي..."}
                  disabled={sending}
                  className="min-h-12 flex-1 rounded-2xl border border-[var(--surface-border)] bg-white/80 px-4 text-sm text-chalkboard outline-none focus:border-lab-teal focus:bg-white dark:bg-slate-900/70 dark:focus:bg-slate-900 focus:ring-4 focus:ring-lab-teal/15 transition shadow-sm"
                />
                
                <button
                  type="submit"
                  disabled={sending || (!input.trim() && !pendingAttachment)}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-lab-teal to-lab-teal-dark hover:from-lab-teal hover:to-lab-teal-light text-white shadow-lg hover:shadow-xl disabled:shadow-none transition disabled:opacity-50 disabled:hover:scale-100 hover:scale-105 active:scale-95 press-squish text-xl"
                  aria-label="send"
                >
                  <svg className={`w-5 h-5 transform ${language === "ar" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

        </section>
      </div>

      {/* MOBILE INFO DRAWER SHEET */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            
            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="relative w-full max-w-lg bg-[var(--surface-card-strong)] border-t border-[var(--surface-border)] rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[88vh] overflow-y-auto"
            >
              {/* Drag Handle Bar */}
              <div className="mx-auto w-12 h-1.5 rounded-full bg-[var(--surface-border)] mb-5" />

              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="absolute top-5 right-5 p-2 text-chalkboard-light/70 hover:text-chalkboard hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                aria-label="close modal"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center pb-5 border-b border-[var(--surface-border)] mb-5">
                <div className="relative mb-3.5">
                  {/* Glowing Rings for Mobile */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full border border-dashed border-lab-teal animate-[spin_10s_linear_infinite]" />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-lab-teal/20 to-accent-purple/20 flex items-center justify-center border border-[var(--surface-border)] shadow-md">
                    <img src="/logo-mark.png" alt="Mascot" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="absolute bottom-0 right-0 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-answer-green opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-answer-green border border-white"></span>
                  </span>
                </div>
                <h3 className="font-display font-black text-lg text-chalkboard">{t("chatbot_card_title")}</h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 text-[9px] font-black rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20 uppercase tracking-widest">
                    {localText.beta_badge}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-answer-green bg-answer-green/10 px-2 py-0.5 rounded-full border border-answer-green/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-answer-green animate-pulse" />
                    <span>{language === 'ar' ? 'متصل' : 'Connected'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-display font-black text-xs text-chalkboard-light uppercase tracking-wider">{localText.features_title}</h4>
                
                <div className="flex gap-3 items-start text-xs leading-relaxed text-chalkboard-light bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-[var(--surface-border)]">
                  <span className="text-base select-none">📎</span>
                  <div>
                    <strong className="font-display font-bold text-chalkboard block mb-0.5">{language === "ar" ? "شرح وتلخيص الملفات" : "File Explanation"}</strong>
                    <p className="text-[11px] text-chalkboard-light/90">{localText.upload_tip}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start text-xs leading-relaxed text-chalkboard-light bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-[var(--surface-border)]">
                  <span className="text-base select-none">📚</span>
                  <div>
                    <strong className="font-display font-bold text-chalkboard block mb-0.5">{language === "ar" ? "المستودع والمناهج" : "Syllabus Repository"}</strong>
                    <p className="text-[11px] text-chalkboard-light/90">{localText.materials_tip}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start text-xs leading-relaxed text-chalkboard-light bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-[var(--surface-border)]">
                  <span className="text-base select-none">🎓</span>
                  <div>
                    <strong className="font-display font-bold text-chalkboard block mb-0.5">{language === "ar" ? "شؤون التشعيب والأقسام" : "Academic Rules"}</strong>
                    <p className="text-[11px] text-chalkboard-light/90">{localText.college_tip}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-xs text-chalkboard-light/80 leading-relaxed">
                  {localText.about_desc}
                </p>
                <Link
                  to="/materials"
                  onClick={() => setShowInfoModal(false)}
                  className="w-full inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-lab-teal to-lab-teal-dark px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 press-squish"
                >
                  {t("home_browse_materials")}
                </Link>
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="w-full inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--surface-border)] bg-white/40 dark:bg-slate-900/40 text-chalkboard-light px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50 press-squish"
                >
                  {localText.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

function ChatBubble({ align, text }) {
  const isEnd = align === "end";
  return (
    <div className={`flex ${isEnd ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`max-w-[85%] overflow-wrap-anywhere rounded-2xl px-4 py-3.5 text-sm shadow-md leading-relaxed ${
          isEnd
            ? "bg-gradient-to-tr from-lab-teal to-lab-teal-dark dark:from-teal-600 dark:to-teal-800 text-white rounded-br-none"
            : "border border-white/20 dark:border-slate-800/30 bg-white/70 dark:bg-slate-900/70 text-chalkboard rounded-bl-none backdrop-blur-md"
        }`}
      >
        {isEnd ? (
          <p className="whitespace-pre-line font-medium">{text}</p>
        ) : (
          <MarkdownText text={text} />
        )}
      </div>
    </div>
  );
}