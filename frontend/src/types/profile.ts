export interface GitHubProfile {
  github_id: number;
  login: string;
  avatar_url: string;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string | null;
  followers?: number | null;
  following?: number | null;
  public_repos?: number | null;
  created_at?: string | null;
  html_url?: string | null;
  type?: string | null;
  site_admin?: boolean | null;
}
