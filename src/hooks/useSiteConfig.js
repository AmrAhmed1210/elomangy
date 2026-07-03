import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const DEFAULTS = {
  whatsappNumber: "+201025005751",
  facebookUrl: "https://facebook.com/3loomangy",
  youtubeUrl: "https://youtube.com/@3loomangy",
  linkedinUrl: "https://linkedin.com/company/3loomangy",
  whatsappChannelUrl: "",
  aboutFscuContent: "",
};

export default function useSiteConfig() {
  const [config, setConfig] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "siteConfig", "main"));
        if (snap.exists()) {
          setConfig({ ...DEFAULTS, ...snap.data() });
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
