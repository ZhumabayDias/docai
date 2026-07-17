import pytest

from app.services.subdomain_service import (
    SubdomainService,
    build_base_subdomain,
    ensure_project_subdomain,
    normalize_slug_component,
)


class FakeRepository:
    """In-memory stand-in for ProjectRepository, only implementing the
    `exists_by_subdomain` lookup that SubdomainService depends on."""

    def __init__(self, existing_subdomains=None):
        self.existing = set(existing_subdomains or [])

    def exists_by_subdomain(self, subdomain: str) -> bool:
        return subdomain in self.existing

    def take(self, subdomain: str) -> None:
        self.existing.add(subdomain)


class FakeProject:
    def __init__(self, repo_name, subdomain=None):
        self.repo_name = repo_name
        self.subdomain = subdomain


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

class TestNormalizeSlugComponent:
    def test_lowercases_input(self):
        assert normalize_slug_component("ZhumabayDias") == "zhumabaydias"

    def test_replaces_spaces_with_hyphens(self):
        assert normalize_slug_component("DocAI Cloud") == "docai-cloud"

    def test_removes_invalid_hostname_characters(self):
        assert normalize_slug_component("Repo_Name!@#$%^&*()") == "reponame"

    def test_collapses_repeated_hyphens(self):
        assert normalize_slug_component("my   cool  repo") == "my-cool-repo"

    def test_strips_leading_and_trailing_hyphens(self):
        assert normalize_slug_component("  -Weird-Name-  ") == "weird-name"

    def test_handles_unicode_and_punctuation(self):
        assert normalize_slug_component("Dias's App!!") == "diass-app"


class TestBuildBaseSubdomain:
    def test_matches_spec_example(self):
        # ZhumabayDias + "DocAI Cloud" -> "zhumabaydias-docai-cloud"
        assert build_base_subdomain("ZhumabayDias", "DocAI Cloud") == (
            "zhumabaydias-docai-cloud"
        )

    def test_simple_lowercase_login_and_repo(self):
        assert build_base_subdomain("dias", "blog") == "dias-blog"

    def test_normalizes_both_components_independently(self):
        assert build_base_subdomain("Some User", "Some Repo_Name") == (
            "some-user-some-reponame"
        )


# ---------------------------------------------------------------------------
# Uniqueness
# ---------------------------------------------------------------------------

class TestSubdomainUniqueness:
    def test_returns_base_slug_when_available(self):
        repository = FakeRepository()
        service = SubdomainService(repository)

        assert service.generate_subdomain("dias", "blog") == "dias-blog"

    def test_appends_suffix_when_base_slug_taken(self):
        repository = FakeRepository(existing_subdomains={"dias-blog"})
        service = SubdomainService(repository)

        assert service.generate_subdomain("dias", "blog") == "dias-blog-2"

    def test_increments_suffix_past_multiple_collisions(self):
        repository = FakeRepository(
            existing_subdomains={"dias-blog", "dias-blog-2", "dias-blog-3"}
        )
        service = SubdomainService(repository)

        assert service.generate_subdomain("dias", "blog") == "dias-blog-4"

    def test_duplicate_repository_names_get_distinct_subdomains(self):
        # Simulates importing the same repo name twice in a row (e.g. two
        # different GitHub repos both named "docai-cloud" for the same
        # user, or a re-import after a rename collision).
        repository = FakeRepository()
        service = SubdomainService(repository)

        first = service.generate_subdomain("dias", "docai-cloud")
        repository.take(first)
        second = service.generate_subdomain("dias", "docai-cloud")

        assert first == "dias-docai-cloud"
        assert second == "dias-docai-cloud-2"
        assert first != second

    def test_uniqueness_is_checked_globally_not_per_user(self):
        # Two different users importing repos that normalize to the same
        # base slug must still get distinct subdomains, since subdomains
        # are global public hostnames.
        repository = FakeRepository(existing_subdomains={"dias-blog"})
        service = SubdomainService(repository)

        assert service.generate_subdomain("dias", "blog") == "dias-blog-2"


# ---------------------------------------------------------------------------
# ensure_project_subdomain helper
# ---------------------------------------------------------------------------

class TestEnsureProjectSubdomain:
    def test_generates_and_assigns_when_missing(self):
        repository = FakeRepository()
        project = FakeProject(repo_name="blog", subdomain=None)

        result = ensure_project_subdomain(project, repository, "dias")

        assert result == "dias-blog"
        assert project.subdomain == "dias-blog"

    def test_is_a_noop_when_subdomain_already_set(self):
        repository = FakeRepository()
        project = FakeProject(repo_name="blog", subdomain="already-set")

        result = ensure_project_subdomain(project, repository, "dias")

        assert result == "already-set"
        assert project.subdomain == "already-set"
