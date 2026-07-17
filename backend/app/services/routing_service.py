"""Business rules for resolving a public hostname to a running deployment.

`RoutingService.resolve_hostname()` is the *only* place in the system that
decides whether a hostname may be routed and where to. Nginx never makes
this decision itself — it only forwards the raw Host it received to the
internal `/internal/routing/resolve` endpoint (see `app.routes.routing`)
and relays whatever this service decided.
"""

import ipaddress
import logging
import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Protocol

from app.config import DEPLOYMENT_SUBDOMAIN_BASE
from app.constants.project_status import ProjectStatus

logger = logging.getLogger("app.routing")

# RFC 1035 §2.3.4 limits.
MAX_HOSTNAME_LENGTH = 253
MAX_LABEL_LENGTH = 63

# A single DNS label: starts and ends with an alphanumeric character, with
# only letters, digits, and hyphens in between (no leading/trailing '-').
_LABEL_PATTERN = re.compile(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$")

# Characters that have no legitimate place in a Host header value and are
# common markers of header/path injection or Host-header attacks.
_FORBIDDEN_CHARS = (" ", "\t", "\r", "\n", "/", "\\", "?", "#", "@", ",", "%")

RESERVED_SUBDOMAINS = frozenset(
    {
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
    }
)


class RoutingRejectionReason(str, Enum):
    MALFORMED_HOSTNAME = "malformed_hostname"
    INVALID_BASE_DOMAIN = "invalid_base_domain"
    MISSING_SUBDOMAIN = "missing_subdomain"
    INVALID_LABEL = "invalid_label"
    RESERVED_SUBDOMAIN = "reserved_subdomain"
    UNKNOWN_SUBDOMAIN = "unknown_subdomain"
    INACTIVE_DEPLOYMENT = "inactive_deployment"


class RoutingResolutionError(Exception):
    """Raised whenever a hostname cannot (or must not) be routed.

    `reason` is a stable machine-readable code (see RoutingRejectionReason)
    that callers use to pick an HTTP status code; `message` is a
    human-readable detail safe to log or return to an operator.
    """

    def __init__(self, reason: RoutingRejectionReason, message: str):
        self.reason = reason
        self.message = message
        super().__init__(message)


@dataclass(frozen=True)
class RoutingResult:
    project_id: int
    deployment_port: int
    subdomain: str
    status: str


class RoutingRepositoryProtocol(Protocol):
    """What RoutingService needs from a repository — satisfied by
    `RoutingRepository.find_by_subdomain`."""

    def find_by_subdomain(self, subdomain: str):
        ...


class RoutingService:
    def __init__(
        self,
        repository: RoutingRepositoryProtocol,
        base_domain: str = DEPLOYMENT_SUBDOMAIN_BASE,
    ):
        self.repository = repository
        self.base_domain = base_domain.strip().lower()

    def resolve_hostname(self, raw_hostname: Optional[str]) -> RoutingResult:
        """Validate `raw_hostname` and resolve it to a running deployment.

        Raises `RoutingResolutionError` for any hostname that is malformed,
        outside our domain, reserved, unknown, or not currently RUNNING.
        Never trusts `raw_hostname` at face value: it is normalized and
        strictly validated before ever being used to look anything up.
        """
        subdomain = self._validate_and_extract_subdomain(raw_hostname)
        record = self.repository.find_by_subdomain(subdomain)

        if record is None:
            self._reject(
                RoutingRejectionReason.UNKNOWN_SUBDOMAIN,
                raw_hostname,
                subdomain,
                f"No project is registered for subdomain '{subdomain}'",
            )

        if record.status != ProjectStatus.RUNNING or not record.deployment_port:
            self._reject(
                RoutingRejectionReason.INACTIVE_DEPLOYMENT,
                raw_hostname,
                subdomain,
                f"Deployment status is '{record.status}', not RUNNING",
                project_id=record.project_id,
            )

        result = RoutingResult(
            project_id=record.project_id,
            deployment_port=record.deployment_port,
            subdomain=subdomain,
            status=record.status,
        )

        logger.info(
            "routing.resolved",
            extra={
                "hostname": raw_hostname,
                "subdomain": result.subdomain,
                "project_id": result.project_id,
                "deployment_port": result.deployment_port,
                "result": "routed",
            },
        )
        return result

    # -- hostname validation ------------------------------------------------

    def _validate_and_extract_subdomain(self, raw_hostname: Optional[str]) -> str:
        if not raw_hostname:
            self._reject_malformed(raw_hostname, "Missing or empty Host header")

        hostname = raw_hostname.strip()

        # Reject header/path injection and stray whitespace before doing
        # anything else with the value (including lowercasing it).
        if not hostname or any(char in hostname for char in _FORBIDDEN_CHARS):
            self._reject_malformed(raw_hostname, "Hostname contains forbidden characters")

        # Reject non-ASCII / invalid unicode outright; we don't support IDN.
        try:
            hostname.encode("ascii")
        except UnicodeEncodeError:
            self._reject_malformed(raw_hostname, "Hostname contains non-ASCII characters")

        # Never trust the Host header's case.
        hostname = hostname.lower()

        # Strip a trailing ":port" if present; reject anything that looks
        # like a spoofed/malformed authority component (e.g. IPv6-style
        # multiple colons, which we don't support here).
        if hostname.count(":") > 1:
            self._reject_malformed(raw_hostname, "Malformed host (unexpected multiple colons)")
        if ":" in hostname:
            hostname, _, port_part = hostname.partition(":")
            if not port_part.isdigit():
                self._reject_malformed(raw_hostname, "Malformed port suffix in Host header")

        if not hostname or len(hostname) > MAX_HOSTNAME_LENGTH:
            self._reject_malformed(raw_hostname, "Hostname is empty or exceeds maximum length")

        if hostname in ("localhost",) or self._looks_like_ip_address(hostname):
            self._reject_malformed(raw_hostname, "Hostname is a loopback name or raw IP address")

        suffix = f".{self.base_domain}"

        if hostname == self.base_domain:
            self._reject(
                RoutingRejectionReason.MISSING_SUBDOMAIN,
                raw_hostname,
                None,
                "Hostname has no subdomain",
            )

        if not hostname.endswith(suffix):
            self._reject(
                RoutingRejectionReason.INVALID_BASE_DOMAIN,
                raw_hostname,
                None,
                f"Hostname does not belong to '{self.base_domain}'",
            )

        subdomain = hostname[: -len(suffix)]

        if not subdomain:
            self._reject(
                RoutingRejectionReason.MISSING_SUBDOMAIN,
                raw_hostname,
                None,
                "Hostname has no subdomain",
            )

        # e.g. "sub.sub.docai.site" -> subdomain == "sub.sub": reject, we
        # only support a single label in front of the base domain.
        if "." in subdomain:
            self._reject(
                RoutingRejectionReason.MALFORMED_HOSTNAME,
                raw_hostname,
                subdomain,
                "Subdomain must be a single DNS label",
            )

        if len(subdomain) > MAX_LABEL_LENGTH or not _LABEL_PATTERN.match(subdomain):
            self._reject(
                RoutingRejectionReason.INVALID_LABEL,
                raw_hostname,
                subdomain,
                "Subdomain label is invalid or exceeds 63 characters",
            )

        if subdomain in RESERVED_SUBDOMAINS:
            self._reject(
                RoutingRejectionReason.RESERVED_SUBDOMAIN,
                raw_hostname,
                subdomain,
                f"Subdomain '{subdomain}' is reserved",
            )

        return subdomain

    @staticmethod
    def _looks_like_ip_address(hostname: str) -> bool:
        try:
            ipaddress.ip_address(hostname)
            return True
        except ValueError:
            return False

    def _reject_malformed(self, raw_hostname: Optional[str], message: str) -> None:
        self._reject(RoutingRejectionReason.MALFORMED_HOSTNAME, raw_hostname, None, message)

    def _reject(
        self,
        reason: RoutingRejectionReason,
        raw_hostname: Optional[str],
        subdomain: Optional[str],
        message: str,
        project_id: Optional[int] = None,
    ) -> None:
        logger.warning(
            "routing.rejected",
            extra={
                "hostname": raw_hostname,
                "subdomain": subdomain,
                "project_id": project_id,
                "deployment_port": None,
                "reason": reason.value,
            },
        )
        raise RoutingResolutionError(reason, message)
