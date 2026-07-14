import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ExternalLink, Globe, MapPin, BriefcaseBusiness, Users, GitFork, CalendarDays, BadgeInfo, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getProfile } from "../services/profile";
import type { GitHubProfile } from "../types/profile";
import { formatDateTime } from "../utils/date";

export function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProfile();
        if (isActive) {
          setProfile(data);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(getFriendlyErrorMessage(caughtError));
          setProfile(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="flex min-h-80 items-center justify-center">
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (error || profile === null) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
          <p className="font-semibold">Could not load profile</p>
          <p className="mt-2 text-sm">{error ?? "Profile data is unavailable."}</p>
          <Button
            className="mt-4"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => {
              navigate("/dashboard");
            }}
            variant="secondary"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const profileUrl = profile.html_url ?? `https://github.com/${profile.login}`;
  const blog = normalizeBlog(profile.blog);
  const joinedAt = profile.created_at ? formatDateTime(profile.created_at) : "Not available";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="h-40 w-40 overflow-hidden rounded-full border border-surface-border bg-surface-subtle">
              <img alt={profile.login} className="h-full w-full object-cover" src={profile.avatar_url} />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-brand">{profile.name ?? profile.login}</h2>
            <p className="mt-1 text-sm text-brand-muted">@{profile.login}</p>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-surface-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-brand-muted">
              <BadgeInfo className="h-3.5 w-3.5" />
              {profile.type ?? "User"}
            </div>
            <div className="mt-5 flex w-full flex-col gap-3">
              <Button
                icon={<ExternalLink className="h-4 w-4" />}
                onClick={() => {
                  window.open(profileUrl, "_blank", "noopener,noreferrer");
                }}
              >
                View on GitHub
              </Button>
              <Button
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => {
                  navigate("/dashboard");
                }}
                variant="secondary"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-accent-green">GitHub Profile</p>
                <h3 className="mt-2 text-2xl font-bold text-brand">{profile.name ?? profile.login}</h3>
                <p className="mt-1 text-sm text-brand-muted">GitHub ID {profile.github_id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatPill label="Public repos" value={profile.public_repos} />
                <StatPill label="Followers" value={profile.followers} />
                <StatPill label="Following" value={profile.following} />
              </div>
            </div>

            {profile.bio ? <p className="mt-5 text-sm leading-6 text-brand-muted">{profile.bio}</p> : null}
          </Card>

          <section className="grid gap-4 md:grid-cols-2">
            <Card>
              <ProfileField icon={<Users className="h-4 w-4" />} label="Account type" value={profile.type ?? "Not available"} />
              <ProfileField icon={<CalendarDays className="h-4 w-4" />} label="Joined date" value={joinedAt} className="mt-4" />
              <ProfileField icon={<GitFork className="h-4 w-4" />} label="Public repositories" value={profile.public_repos ?? "Not available"} className="mt-4" />
            </Card>
            <Card>
              <ProfileField icon={<MapPin className="h-4 w-4" />} label="Location" value={profile.location ?? "Not available"} />
              <ProfileField icon={<BriefcaseBusiness className="h-4 w-4" />} label="Company" value={profile.company ?? "Not available"} className="mt-4" />
              <ProfileField icon={<Globe className="h-4 w-4" />} label="Blog / Website" value={blog ?? "Not available"} className="mt-4" />
            </Card>
          </section>

          <Card>
            <h3 className="text-lg font-bold text-brand">Profile link</h3>
            <p className="mt-2 text-sm text-brand-muted break-words">{profileUrl}</p>
          </Card>
        </div>
      </section>
    </div>
  );
}

type ProfileFieldProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  className?: string;
};

function ProfileField({ icon, label, value, className }: ProfileFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
        <span className="text-accent-blue">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-sm text-brand-muted">{value}</p>
    </div>
  );
}

type StatPillProps = {
  label: string;
  value?: number | null;
};

function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-full border border-surface-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-brand-muted">
      {label}: <span className="text-brand">{value ?? "Not available"}</span>
    </div>
  );
}

function normalizeBlog(blog?: string | null) {
  if (!blog) {
    return null;
  }

  if (blog.startsWith("http://") || blog.startsWith("https://")) {
    return blog;
  }

  return `https://${blog}`;
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load profile.";
}
