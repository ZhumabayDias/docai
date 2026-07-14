import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects" element={<PlaceholderPage title="Projects" />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
