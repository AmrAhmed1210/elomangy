import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authStateContext";
import { supabase } from "../lib/supabase";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (currentUser) => {
    const email = currentUser?.email;

    if (!email) {
      setAdmin(null);
      return null;
    }

    const { data, error } = await supabase
      .from("admins")
      .select("email, role")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Unable to check admin access", error);
      setAdmin(null);
      return null;
    }

    setAdmin(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const currentSession = data.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      await checkAdmin(currentSession?.user);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      checkAdmin(nextSession?.user).finally(() => setLoading(false));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/admin/login`;

    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAdmin: Boolean(admin),
      loading,
      session,
      signInWithGoogle,
      signOut,
      user,
    }),
    [admin, loading, session, signInWithGoogle, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
