import { Outlet } from "react-router-dom";

import { Navbar } from "../components/Navbar";
import { MobileNavigation, Sidebar } from "../components/Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-base text-brand">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar />
          <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
