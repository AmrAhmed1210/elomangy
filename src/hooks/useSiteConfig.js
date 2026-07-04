import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DEFAULTS = {
  whatsappNumber: "+201025005751",
  facebookUrl: "https://facebook.com/3loomangy",
  youtubeUrl: "https://youtube.com/@3loomangy",
  linkedinUrl: "https://linkedin.com/company/3loomangy",
  whatsappChannelUrl: "",
  aboutFscuContent: "",
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