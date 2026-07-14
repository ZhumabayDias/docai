import { Bell, Github, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "./Button";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-surface-border bg-surface-base/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">
            DocAI Cloud
          </p>
          <h1 className="truncate text-xl font-bold text-brand">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="hidden items-center gap-3 rounded-md border border-surface-border bg-surface-subtle px-3 py-2 text-left transition-all duration-200 hover:border-brand-muted hover:bg-surface-raised sm:flex"
            onClick={() => {
              navigate("/profile");
            }}
            type="button"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand text-xs font-bold text-surface-base">
              {user?.avatar_url ? (
                <img alt={user.login} className="h-full w-full object-cover" src={user.avatar_url} />
              ) : (
                user?.login?.slice(0, 1).toUpperCase() ?? "U"
              )}
            </div>
            <span className="max-w-40 truncate text-sm font-semibold text-brand">
              {user?.login ?? "GitHub user"}
            </span>
          </button>

          <Button
            aria-label="Notifications"
            className="h-11 w-11 rounded-lg border border-surface-border bg-zinc-800 p-0 text-white shadow-sm transition-all duration-200 hover:bg-zinc-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-white/20"
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            variant="ghost"
          />
          <Button
            aria-label="Logout"
            className="h-11 w-11 rounded-lg border border-red-900 bg-red-950 p-0 text-red-400 shadow-sm transition-all duration-200 hover:bg-red-700 hover:text-white hover:shadow-[0_0_18px_rgba(239,68,68,0.18)] focus-visible:ring-2 focus-visible:ring-red-400/20"
            icon={<LogOut className="h-5 w-5" />}
            title="Logout"
            onClick={() => {
              void logout();
            }}
            variant="ghost"
          />
        </div>
      </div>
    </header>
  );
}
