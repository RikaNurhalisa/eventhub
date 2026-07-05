import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Menunggu state auth dimuat dari localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 font-medium">Memuat EventHub...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root: redirect ke login atau dashboard tergantung status auth */}
      <Route
        path="/"
        element={
          isAuthenticated()
            ? <Navigate to={isAdmin() ? "/admin" : "/dashboard"} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* Auth routes — redirect jika sudah login */}
      <Route
        path="/login"
        element={
          isAuthenticated()
            ? <Navigate to={isAdmin() ? "/admin" : "/dashboard"} replace />
            : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated()
            ? <Navigate to={isAdmin() ? "/admin" : "/dashboard"} replace />
            : <RegisterPage />
        }
      />

      {/* User dashboard (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected admin route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;