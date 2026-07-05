import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DEFAULTS = {
  whatsappNumber: "+201025005751",
  facebookUrl: "https://facebook.com/3loomangy",
  youtubeUrl: "https://youtube.com/@3loomangy",
  linkedinUrl: "https://linkedin.com/company/3loomangy",
  whatsappChannelUrl: "",
  aboutFscuContent: "",
  aboutFscuContentAr: "",
  aboutWhatTitle: "",
  aboutWhatTitleAr: "",
  aboutWhatBody: "",
  aboutWhatBodyAr: "",
  aboutFscuTitle: "",
  aboutFscuTitleAr: "",
  aboutStudentsTitle: "",
  aboutStudentsTitleAr: "",
  aboutStudentsBody: "",
  aboutStudentsBodyAr: "",
  extraLinks: [],
};

export default function useSiteConfig() {
  const [config, setConfig] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [configResult, linksResult] = await Promise.all([
          supabase.from('site_config').select('*').eq('id', 1).single(),
          supabase.from('social_links').select('*').order('order', { ascending: true }),
        ]);
        const { data, error } = configResult;

        if (data && !error) {
          setConfig({
            whatsappNumber: data.whatsapp_number || DEFAULTS.whatsappNumber,
            facebookUrl: data.facebook_url || DEFAULTS.facebookUrl,
            youtubeUrl: data.youtube_url || DEFAULTS.youtubeUrl,
            linkedinUrl: data.linkedin_url || DEFAULTS.linkedinUrl,
            whatsappChannelUrl: data.whatsapp_channel_url || DEFAULTS.whatsappChannelUrl,
            aboutFscuContent: data.about_fscu_content || DEFAULTS.aboutFscuContent,
            aboutFscuContentAr: data.about_fscu_content_ar || DEFAULTS.aboutFscuContentAr,
            aboutWhatTitle: data.about_what_title || DEFAULTS.aboutWhatTitle,
            aboutWhatTitleAr: data.about_what_title_ar || DEFAULTS.aboutWhatTitleAr,
            aboutWhatBody: data.about_what_body || DEFAULTS.aboutWhatBody,
            aboutWhatBodyAr: data.about_what_body_ar || DEFAULTS.aboutWhatBodyAr,
            aboutFscuTitle: data.about_fscu_title || DEFAULTS.aboutFscuTitle,
            aboutFscuTitleAr: data.about_fscu_title_ar || DEFAULTS.aboutFscuTitleAr,
            aboutStudentsTitle: data.about_students_title || DEFAULTS.aboutStudentsTitle,
            aboutStudentsTitleAr: data.about_students_title_ar || DEFAULTS.aboutStudentsTitleAr,
            aboutStudentsBody: data.about_students_body || DEFAULTS.aboutStudentsBody,
            aboutStudentsBodyAr: data.about_students_body_ar || DEFAULTS.aboutStudentsBodyAr,
            extraLinks: linksResult.data ?? [],
          });
        }
      } catch {
        // fall back to defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { config, loading };
}