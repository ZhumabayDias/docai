import { Navigate, Outlet } from "react-router-dom";

import { LoadingSpinner } from "./LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
