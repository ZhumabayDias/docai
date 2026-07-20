import { ArrowRight, Bell, Github, LogOut, Rocket, ShieldAlert, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">Settings</h1>
        <p className="mt-1 text-sm text-brand-muted">Manage your account and platform preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <h2 className="text-lg font-bold text-brand">Profile</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-surface-subtle text-lg font-bold text-brand">
              {user?.avatar_url ? (
                <img alt={user.login} className="h-full w-full object-cover" src={user.avatar_url} />
              ) : (
                user?.login?.slice(0, 1).toUpperCase() ?? "U"
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand">{user?.login ?? "Not available"}</p>
              <p className="mt-1 text-xs text-brand-muted">
                Account ID {user?.id ?? "Not available"}
              </p>
            </div>
          </div>
          <Button
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={() => {
              navigate("/profile");
            }}
            variant="secondary"
          >
            View full profile
          </Button>
        </div>
      </Card>

      {/* GitHub Connection */}
      <Card>
        <h2 className="text-lg font-bold text-brand">GitHub Connection</h2>
        <p className="mt-2 text-sm text-brand-muted">
          Your GitHub account is used to import and deploy repositories.
        </p>
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-brand-muted" />
            <span className="text-sm font-semibold text-brand">GitHub</span>
          </div>
          {user ? (
            <span className="inline-flex h-7 w-fit items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/10 px-3 text-xs font-bold text-accent-green">
              Connected
            </span>
          ) : (
            <span className="inline-flex h-7 w-fit items-center gap-2 rounded-full border border-surface-border bg-surface-raised px-3 text-xs font-bold text-brand-muted">
              Not available
            </span>
          )}
        </div>
        <Button className="mt-4" disabled variant="secondary">
          Disconnect &middot; Coming soon
        </Button>
      </Card>

      {/* Platform Preferences */}
      <Card>
        <h2 className="text-lg font-bold text-brand">Platform Preferences</h2>
        <div className="mt-4 divide-y divide-surface-border">
          <PreferenceRow
            description="Region used for new deployments"
            icon={<Rocket className="h-4 w-4" />}
            title="Default Region"
          />
          <PreferenceRow
            description="Deploy automatically when new commits are pushed"
            icon={<Github className="h-4 w-4" />}
            title="Automatic Deployments"
          />
          <PreferenceRow
            description="Get notified about deployment status changes"
            icon={<Bell className="h-4 w-4" />}
            title="Deployment Notifications"
          />
        </div>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-lg font-bold text-brand">Account</h2>
        <div className="mt-4 flex flex-col gap-3 rounded-md border border-surface-border bg-surface-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-brand-muted" />
            <div>
              <p className="text-sm font-semibold text-brand">{user?.login ?? "Not available"}</p>
              <p className="text-xs text-brand-muted">Signed in with GitHub</p>
            </div>
          </div>
          <Button
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              void logout();
            }}
            variant="secondary"
          >
            Log out
          </Button>
        </div>

        <div className="mt-6 rounded-md border border-accent-red/30 bg-accent-red/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-red">
            <ShieldAlert className="h-4 w-4" />
            Danger Zone
          </div>
          <p className="mt-2 text-sm text-brand-muted">
            Permanently delete your account and all associated projects and deployments.
          </p>
          <Button className="mt-3" disabled variant="secondary">
            Delete Account &middot; Coming soon
          </Button>
        </div>
      </Card>
    </div>
  );
}

type PreferenceRowProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

function PreferenceRow({ title, description, icon }: PreferenceRowProps) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-brand-muted">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-brand">{title}</p>
          <p className="mt-1 text-xs text-brand-muted">{description}</p>
        </div>
      </div>
      <span className="inline-flex h-7 w-fit items-center rounded-full border border-surface-border bg-surface-raised px-3 text-xs font-bold text-brand-muted">
        Coming soon
      </span>
    </div>
  );
}
