"""Subdomain generation for projects.

This module prepares projects for subdomain-based deployment URLs
(``https://<subdomain>.docai.site``). It only generates and persists the
``subdomain`` value on the ``Project`` model — it does NOT touch Nginx,
DNS, Docker networking, or request routing. Wiring an actual subdomain up
to a running deployment is out of scope for this PR (see PR-2).
"""

import re
from typing import Protocol

from app.models.project import Project

# Hostname labels may only contain lowercase letters, digits, and hyphens.
_INVALID_HOSTNAME_CHARS = re.compile(r"[^a-z0-9-]")
_REPEATED_HYPHENS = re.compile(r"-{2,}")


def normalize_slug_component(value: str) -> str:
    """Normalize a single piece of text (e.g. a GitHub login or repo name)
    into a hostname-safe slug fragment.

    Rules applied, in order:
      1. lowercase
      2. replace whitespace with '-'
      3. strip any character that isn't a-z, 0-9, or '-'
      4. collapse repeated '-' into a single '-'
      5. trim leading/trailing '-'
    """
    slug = value.strip().lower()
    slug = re.sub(r"\s+", "-", slug)
    slug = _INVALID_HOSTNAME_CHARS.sub("", slug)
    slug = _REPEATED_HYPHENS.sub("-", slug)
    return slug.strip("-")


def build_base_subdomain(github_login: str, repo_name: str) -> str:
    """Build the (not-yet-uniqued) `<github-login>-<repo-name>` slug."""
    login_slug = normalize_slug_component(github_login)
    repo_slug = normalize_slug_component(repo_name)

    parts = [part for part in (login_slug, repo_slug) if part]
    return "-".join(parts)


class SubdomainUniquenessChecker(Protocol):
    """Anything that can tell us whether a subdomain is already taken.

    `ProjectRepository` satisfies this protocol via `exists_by_subdomain`.
    """

    def exists_by_subdomain(self, subdomain: str) -> bool:
        ...


class SubdomainService:
    """Generates unique, hostname-safe subdomains for projects.

    Uniqueness is checked globally (across all users/projects), since
    subdomains will eventually be resolved as public hostnames.
    """

    def __init__(self, repository: SubdomainUniquenessChecker):
        self.repository = repository

    def generate_subdomain(self, github_login: str, repo_name: str) -> str:
        """Generate a unique subdomain for a project.

        Example:
            github_login="ZhumabayDias", repo_name="DocAI Cloud"
            -> "zhumabaydias-docai-cloud"

        If the base slug is already taken, a numeric suffix is appended:
            "dias-blog" -> "dias-blog-2" -> "dias-blog-3" -> ...
        """
        base = build_base_subdomain(github_login, repo_name)
        return self._make_unique(base)

    def _make_unique(self, base: str) -> str:
        if not self.repository.exists_by_subdomain(base):
            return base

        suffix = 2
        while True:
            candidate = f"{base}-{suffix}"
            if not self.repository.exists_by_subdomain(candidate):
                return candidate
            suffix += 1


def ensure_project_subdomain(
    project: Project,
    repository: SubdomainUniquenessChecker,
    github_login: str,
) -> str:
    """Generate and assign `project.subdomain` if it isn't already set.

    Safe to call on projects imported before this PR (which won't have a
    subdomain yet) as well as newly imported ones. Does not commit to the
    database; callers are responsible for persisting the change.
    """
    if project.subdomain:
        return project.subdomain

    service = SubdomainService(repository)
    project.subdomain = service.generate_subdomain(github_login, project.repo_name)
    return project.subdomain
