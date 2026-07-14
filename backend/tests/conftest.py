import sys
import shutil
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import Base, get_db
from app.routes import api_projects, deploy


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
    )

    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def test_deployments_dir(tmp_path):
    deployments_dir = tmp_path / "deployments"
    deployments_dir.mkdir()

    try:
        yield deployments_dir
    finally:
        shutil.rmtree(deployments_dir, ignore_errors=True)
        assert not deployments_dir.exists()


@pytest.fixture(autouse=True)
def isolated_deployment_workspace(monkeypatch, test_deployments_dir):
    monkeypatch.setattr("app.config.DEPLOYMENTS_DIR", test_deployments_dir)
    monkeypatch.setattr("app.services.deploy_service.DEPLOYMENTS_DIR", test_deployments_dir)
    return test_deployments_dir


@pytest.fixture()
def legacy_app(db_session):
    app = FastAPI()

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.include_router(deploy.router)
    app.include_router(api_projects.router)

    return app


@pytest.fixture()
def client(legacy_app):
    return TestClient(legacy_app)


@pytest.fixture()
def client_without_server_exceptions(legacy_app):
    return TestClient(legacy_app, raise_server_exceptions=False)
