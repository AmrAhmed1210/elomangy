import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AdminLogin() {
  const { isAdmin, loading, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    if (user && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, loading, navigate, user]);

  return (
    <main className="min-h-[70vh] bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto flex max-w-md flex-col gap-8">
        <Link to="/" className="text-sm font-medium text-cyan-200 hover:text-white">
          Back to 3loomangy
        </Link>

        <section className="rounded-card border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/40">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Control mode</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">Admin login</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Sign in with the Google account that has been added to the Supabase admins table.
          </p>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-8 flex min-h-11 w-full items-center justify-center gap-3 rounded-card bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
            </svg>
            Login with Google
          </button>
        </section>
      </div>
    </main>
  );
}
