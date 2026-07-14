from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from app.database import Base


from datetime import datetime

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

    status: Mapped[str] = mapped_column(default=ProjectStatus.CREATED)

    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="projects"
    )
