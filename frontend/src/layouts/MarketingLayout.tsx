import { Outlet } from "react-router-dom";

import { LandingNavbar } from "../components/LandingNavbar";
import { MarketingFooter } from "../components/MarketingFooter";

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <LandingNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
