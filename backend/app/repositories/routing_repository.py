"""Database access for hostname-to-deployment routing lookups.

This repository is intentionally "dumb": it only fetches raw project
routing data by subdomain. It does not decide whether a hostname is
valid, whether a deployment is reachable, or anything else — all of
that lives in `app.services.routing_service.RoutingService`.
"""

from dataclasses import dataclass
from typing import Optional

from sqlalchemy.orm import Session

from app.models.project import Project


@dataclass(frozen=True)
class ProjectRoutingRecord:
    """A minimal, read-only projection of a Project for routing purposes.

    Deliberately narrower than the full `Project` ORM model so that
    `RoutingService` only ever sees the fields it needs to make a
    decision, and can't accidentally reach into unrelated project data.
    """

    project_id: int
    subdomain: str
    deployment_port: Optional[int]
    status: str


class RoutingRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_subdomain(self, subdomain: str) -> Optional[ProjectRoutingRecord]:
        """Look up a project by its exact subdomain.

        Returns None if no project has this subdomain. Callers decide what
        that means (e.g. "unknown subdomain" rejection) — this method just
        reports what's in the database.
        """
        project = (
            self.db.query(Project)
            .filter(Project.subdomain == subdomain)
            .first()
        )

        if project is None:
            return None

        return ProjectRoutingRecord(
            project_id=project.id,
            subdomain=project.subdomain,
            deployment_port=project.deployment_port,
            status=project.status,
        )
