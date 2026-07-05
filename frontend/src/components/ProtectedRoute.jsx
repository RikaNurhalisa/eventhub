import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — Melindungi route berdasarkan status login dan role.
 *
 * Props:
 *  - children: komponen yang dilindungi
 *  - requiredRole: 'admin' | 'user' | null (null = cukup login saja)
 *  - redirectTo: path tujuan jika tidak memenuhi syarat (default: /login)
 */
export default function ProtectedRoute({ children, requiredRole = null, redirectTo = "/login" }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Tunggu sampai state auth di-load dari localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // Belum login — redirect ke halaman login
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Sudah login tapi role tidak sesuai
  if (requiredRole && user?.role !== requiredRole) {
    const fallback = user?.role === "admin" ? "/admin" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
