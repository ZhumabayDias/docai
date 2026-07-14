from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    github_id: Mapped[int] = mapped_column(unique=True, index=True)
    login: Mapped[str] = mapped_column(unique=True, index=True)
    avatar_url: Mapped[str]
    access_token: Mapped[str] = mapped_column(unique=True)


    projects = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan"
    )