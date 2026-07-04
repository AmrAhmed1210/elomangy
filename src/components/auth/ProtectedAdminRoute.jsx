import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-card border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="mt-4 h-8 w-full rounded bg-slate-100 animate-pulse" />
          <div className="mt-3 h-8 w-4/5 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
