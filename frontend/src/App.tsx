import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { MarketingLayout } from "./layouts/MarketingLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { DeployPage } from "./pages/DeployPage";
import { DocumentationPage } from "./pages/DocumentationPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { LandingPage } from "./pages/LandingPage";
import { MarketingPlaceholderPage } from "./pages/MarketingPlaceholderPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { PricingPage } from "./pages/PricingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/contact" element={<MarketingPlaceholderPage title="Contact" />} />
      </Route>
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
