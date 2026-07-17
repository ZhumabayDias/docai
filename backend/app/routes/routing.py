"""Internal routing-resolution endpoint.

This endpoint exists for exactly one caller: the platform's own Nginx,
via `auth_request` (see deploy/nginx/docai-wildcard.conf). It is not part
of the public REST API, is not meant to be called by browsers or the
frontend, and makes no business decisions itself — it just delegates to
`RoutingService` and reports the result back as response headers that
Nginx reads with `auth_request_set`.

Defense in depth: even though this route is only reachable through an
`internal;` Nginx location in production, we additionally restrict it to
a small allowlist of trusted caller IPs (see ROUTING_TRUSTED_PROXY_IPS),
so it fails closed if it's ever accidentally exposed.
"""

import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.config import ROUTING_TRUSTED_PROXY_IPS
from app.database import get_db
from app.repositories.routing_repository import RoutingRepository
from app.services.routing_service import (
    RoutingRejectionReason,
    RoutingResolutionError,
    RoutingService,
)

router = APIRouter(prefix="/internal/routing", tags=["internal-routing"])

logger = logging.getLogger("app.routing")

# Maps a rejection reason to the HTTP status Nginx will see from this
# endpoint. Nginx's `auth_request` + `error_page` directives translate
# these into the actual response served to the end user (see the Nginx
# config for the corresponding named locations).
_REJECTION_STATUS_CODES = {
    RoutingRejectionReason.MALFORMED_HOSTNAME: 400,
    RoutingRejectionReason.INVALID_BASE_DOMAIN: 404,
    RoutingRejectionReason.MISSING_SUBDOMAIN: 404,
    RoutingRejectionReason.INVALID_LABEL: 400,
    RoutingRejectionReason.RESERVED_SUBDOMAIN: 403,
    RoutingRejectionReason.UNKNOWN_SUBDOMAIN: 404,
    RoutingRejectionReason.INACTIVE_DEPLOYMENT: 503,
}


def require_trusted_caller(request: Request) -> None:
    client_host = request.client.host if request.client else None

    if client_host not in ROUTING_TRUSTED_PROXY_IPS:
        logger.warning(
            "routing.untrusted_caller_rejected",
            extra={"client_host": client_host},
        )
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/resolve", dependencies=[Depends(require_trusted_caller)])
def resolve_routing(
    response: Response,
    x_original_host: str = Header(default=None, alias="X-Original-Host"),
    db: Session = Depends(get_db),
):
    service = RoutingService(RoutingRepository(db))

    try:
        result = service.resolve_hostname(x_original_host)
    except RoutingResolutionError as exc:
        status_code = _REJECTION_STATUS_CODES.get(exc.reason, 400)
        raise HTTPException(status_code=status_code, detail=exc.message)

    # Nginx captures these via auth_request_set and uses them to build the
    # proxy_pass target — it never decides the port itself.
    response.headers["X-Upstream-Port"] = str(result.deployment_port)
    response.headers["X-Project-Id"] = str(result.project_id)

    return {
        "project_id": result.project_id,
        "subdomain": result.subdomain,
        "deployment_port": result.deployment_port,
        "status": result.status,
    }
