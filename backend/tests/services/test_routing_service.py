import pytest

from app.constants.project_status import ProjectStatus
from app.repositories.routing_repository import ProjectRoutingRecord
from app.services.routing_service import (
    RoutingRejectionReason,
    RoutingResolutionError,
    RoutingService,
)

BASE_DOMAIN = "docai.site"


class FakeRoutingRepository:
    """In-memory stand-in for RoutingRepository."""

    def __init__(self, records=None):
        self.records = {r.subdomain: r for r in (records or [])}

    def find_by_subdomain(self, subdomain):
        return self.records.get(subdomain)


def running_record(subdomain="dias-blog", project_id=1, port=9003):
    return ProjectRoutingRecord(
        project_id=project_id,
        subdomain=subdomain,
        deployment_port=port,
        status=ProjectStatus.RUNNING,
    )


def make_service(records=None):
    return RoutingService(FakeRoutingRepository(records), base_domain=BASE_DOMAIN)


# ---------------------------------------------------------------------------
# Successful routing
# ---------------------------------------------------------------------------

def test_successful_routing_returns_expected_result():
    service = make_service([running_record()])

    result = service.resolve_hostname("dias-blog.docai.site")

    assert result.project_id == 1
    assert result.deployment_port == 9003
    assert result.subdomain == "dias-blog"
    assert result.status == ProjectStatus.RUNNING


def test_valid_hostname_is_case_and_whitespace_normalized():
    service = make_service([running_record()])

    result = service.resolve_hostname("  Dias-Blog.DocAI.Site  ")

    assert result.subdomain == "dias-blog"


def test_valid_hostname_with_port_suffix_is_accepted():
    # Some clients/proxies include the port in the Host header.
    service = make_service([running_record()])

    result = service.resolve_hostname("dias-blog.docai.site:443")

    assert result.subdomain == "dias-blog"


# ---------------------------------------------------------------------------
# Hostname normalization
# ---------------------------------------------------------------------------

class TestNormalization:
    def test_uppercase_hostname_normalizes_to_lowercase_subdomain(self):
        service = make_service([running_record(subdomain="my-app")])
        result = service.resolve_hostname("MY-APP.DOCAI.SITE")
        assert result.subdomain == "my-app"

    def test_surrounding_whitespace_is_stripped(self):
        service = make_service([running_record(subdomain="my-app")])
        result = service.resolve_hostname("\tmy-app.docai.site\n".strip())
        assert result.subdomain == "my-app"


# ---------------------------------------------------------------------------
# Invalid / malformed hostnames
# ---------------------------------------------------------------------------

class TestInvalidHostnames:
    @pytest.mark.parametrize(
        "hostname",
        [
            "example.com",
            "notdocai.site",
            "docai.site.evil.com",
        ],
    )
    def test_unknown_or_foreign_domains_are_rejected(self, hostname):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(hostname)
        assert exc_info.value.reason == RoutingRejectionReason.INVALID_BASE_DOMAIN

    def test_missing_subdomain_is_rejected(self):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.MISSING_SUBDOMAIN

    def test_multi_label_subdomain_is_rejected(self):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("sub.sub.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME

    def test_empty_hostname_is_rejected(self):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("")
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME

    def test_none_hostname_is_rejected(self):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(None)
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME


class TestIpAndLocalhostRejection:
    @pytest.mark.parametrize(
        "hostname",
        ["127.0.0.1", "10.0.0.5", "::1", "localhost"],
    )
    def test_ip_addresses_and_localhost_are_rejected(self, hostname):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(hostname)
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME


class TestInvalidLabels:
    def test_label_exceeding_63_chars_is_rejected(self):
        service = make_service()
        long_label = "a" * 64
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(f"{long_label}.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.INVALID_LABEL

    def test_label_starting_with_hyphen_is_rejected(self):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("-dias-blog.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.INVALID_LABEL

    def test_label_ending_with_hyphen_is_rejected(self):
        service = make_service()
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("dias-blog-.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.INVALID_LABEL

    def test_maximum_valid_label_length_is_accepted(self):
        # Exactly 63 chars, so it must be accepted as *well-formed* even
        # though it's unknown (no project registered for it).
        service = make_service()
        label = "a" * 63
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(f"{label}.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.UNKNOWN_SUBDOMAIN


# ---------------------------------------------------------------------------
# Reserved names
# ---------------------------------------------------------------------------

class TestReservedSubdomains:
    @pytest.mark.parametrize(
        "reserved",
        [
            "www",
            "api",
            "admin",
            "dashboard",
            "docs",
            "pricing",
            "features",
            "deploy",
            "contact",
            "login",
            "auth",
            "mail",
            "root",
            "support",
        ],
    )
    def test_reserved_subdomain_is_rejected(self, reserved):
        # Even if somehow "registered", reserved names must never route.
        service = make_service([running_record(subdomain=reserved)])
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(f"{reserved}.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.RESERVED_SUBDOMAIN


# ---------------------------------------------------------------------------
# Unknown hostnames
# ---------------------------------------------------------------------------

class TestUnknownSubdomain:
    def test_well_formed_but_unregistered_subdomain_is_rejected(self):
        service = make_service()  # no records at all
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("nobody-here.docai.site")
        assert exc_info.value.reason == RoutingRejectionReason.UNKNOWN_SUBDOMAIN


# ---------------------------------------------------------------------------
# Inactive deployments
# ---------------------------------------------------------------------------

class TestInactiveDeployments:
    @pytest.mark.parametrize(
        "status", [ProjectStatus.FAILED, ProjectStatus.BUILDING, ProjectStatus.STOPPED, ProjectStatus.CREATED]
    )
    def test_non_running_statuses_are_rejected(self, status):
        record = ProjectRoutingRecord(
            project_id=5, subdomain="dias-blog", deployment_port=9003, status=status
        )
        service = make_service([record])

        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("dias-blog.docai.site")

        assert exc_info.value.reason == RoutingRejectionReason.INACTIVE_DEPLOYMENT

    def test_running_status_without_a_port_is_treated_as_inactive(self):
        # Defensive: a RUNNING row that's somehow missing its port (e.g.
        # data inconsistency) must never be routed to port 0/None.
        record = ProjectRoutingRecord(
            project_id=5, subdomain="dias-blog", deployment_port=None, status=ProjectStatus.RUNNING
        )
        service = make_service([record])

        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("dias-blog.docai.site")

        assert exc_info.value.reason == RoutingRejectionReason.INACTIVE_DEPLOYMENT


# ---------------------------------------------------------------------------
# Host header attacks / injection
# ---------------------------------------------------------------------------

class TestHostHeaderAttacks:
    @pytest.mark.parametrize(
        "hostname",
        [
            "dias-blog.docai.site/../../etc/passwd",
            "dias-blog.docai.site\r\nX-Injected: 1",
            "dias-blog.docai.site@evil.com",
            "dias-blog.docai.site,evil.com",
            "dias-blog.docai.site?x=1",
            "dias-blog.docai.site#frag",
            "evil.com\\dias-blog.docai.site",
        ],
    )
    def test_injection_attempts_are_rejected_as_malformed(self, hostname):
        service = make_service([running_record()])
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(hostname)
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME

    def test_multiple_colons_are_rejected(self):
        service = make_service([running_record()])
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("dias-blog.docai.site:443:80")
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME

    def test_non_numeric_port_suffix_is_rejected(self):
        service = make_service([running_record()])
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname("dias-blog.docai.site:abc")
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME


# ---------------------------------------------------------------------------
# Unicode hostnames
# ---------------------------------------------------------------------------

class TestUnicodeHostnames:
    @pytest.mark.parametrize(
        "hostname",
        [
            "diás-blog.docai.site",
            "\u0434\u0438\u0430\u0441.docai.site",  # Cyrillic homoglyph attempt
            "dias-blog.docai.sité",
        ],
    )
    def test_non_ascii_hostnames_are_rejected(self, hostname):
        service = make_service([running_record()])
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(hostname)
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME


# ---------------------------------------------------------------------------
# Maximum hostname length
# ---------------------------------------------------------------------------

class TestHostnameLength:
    def test_oversized_hostname_is_rejected(self):
        service = make_service()
        # 63-char labels joined by dots, well past the 253-char overall cap.
        label = "a" * 63
        oversized = ".".join([label] * 5) + ".docai.site"
        with pytest.raises(RoutingResolutionError) as exc_info:
            service.resolve_hostname(oversized)
        assert exc_info.value.reason == RoutingRejectionReason.MALFORMED_HOSTNAME
