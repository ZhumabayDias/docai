from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import text

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{(BASE_DIR / 'users.db').as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


class Base(DeclarativeBase):
    pass

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_mvp_project_columns():
    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as connection:
        tables = connection.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'")
        ).fetchall()

        if not tables:
            return

        existing_columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(projects)")).fetchall()
        }

        columns = {
            "deployment_url": "VARCHAR",
            "deployment_port": "INTEGER",
            "container_name": "VARCHAR",
            "subdomain": "VARCHAR",
        }

        for column_name, column_type in columns.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(f"ALTER TABLE projects ADD COLUMN {column_name} {column_type}")
                )
