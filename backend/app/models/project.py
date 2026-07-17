from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from app.database import Base


from datetime import datetime
from typing import Optional

from app.constants.project_status import ProjectStatus


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )

    repo_id: Mapped[int] = mapped_column(index=True)

    repo_name: Mapped[str]
    repo_full_name: Mapped[str]

    default_branch: Mapped[str]

    private: Mapped[bool]

    clone_url: Mapped[str]

    # Uniqueness of subdomain is enforced at the application layer (see
    # SubdomainService), not via a DB-level UNIQUE constraint: SQLite's
    # `ALTER TABLE ADD COLUMN` (used by the lightweight migration helper in
    # app.database) cannot add a UNIQUE constraint to an existing table.
    subdomain: Mapped[Optional[str]] = mapped_column(nullable=True, index=True)

    status: Mapped[str] = mapped_column(default=ProjectStatus.CREATED)

    deployment_url: Mapped[Optional[str]] = mapped_column(nullable=True)
    deployment_port: Mapped[Optional[int]] = mapped_column(nullable=True)
    container_name: Mapped[Optional[str]] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="projects"
    )
