import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.constants.project_status import ProjectStatus
from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.routes import routing


def create_user(db_session, user_id=1, login="octocat"):
    user = User(
        id=user_id,
        github_id=1000 + user_id,
        login=login,
        avatar_url=f"https://example.test/{login}.png",
        access_token=f"token-{login}",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def create_project(db_session, user, subdomain, status, deployment_port=9003):
    project = Project(
        user_id=user.id,
        repo_id=42,
        repo_name="docai-demo",
        repo_full_name=f"{user.login}/docai-demo",
        default_branch="main",
        private=False,
        clone_url="https://github.com/example/docai-demo.git",
        subdomain=subdomain,
        status=status,
        deployment_port=deployment_port,
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture()
def routing_app(db_session):
    app = FastAPI()

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.include_router(routing.router)
    return app


@pytest.fixture()
def routing_client(routing_app):
    return TestClient(routing_app)


@pytest.fixture(autouse=True)
def trust_test_client(monkeypatch):
    # FastAPI's TestClient identifies itself as "testclient" rather than a
    # real loopback IP, so trust it only within this test module.
    monkeypatch.setattr(
        "app.routes.routing.ROUTING_TRUSTED_PROXY_IPS", {"testclient", "127.0.0.1"}
    )


def test_successful_routing_returns_upstream_port_header(db_session, routing_client):
    user = create_user(db_session)
    create_project(db_session, user, "dias-blog", ProjectStatus.RUNNING, deployment_port=9003)

    response = routing_client.get(
        "/internal/routing/resolve",
        headers={"X-Original-Host": "dias-blog.docai.site"},
    )

    assert response.status_code == 200
    assert response.headers["X-Upstream-Port"] == "9003"
    assert response.json()["deployment_port"] == 9003
    assert response.json()["subdomain"] == "dias-blog"


def test_unknown_subdomain_returns_404(db_session, routing_client):
    response = routing_client.get(
        "/internal/routing/resolve",
        headers={"X-Original-Host": "nobody-here.docai.site"},
    )

    assert response.status_code == 404


def test_malformed_hostname_returns_400(db_session, routing_client):
    response = routing_client.get(
        "/internal/routing/resolve",
        headers={"X-Original-Host": "127.0.0.1"},
    )

    assert response.status_code == 400


def test_reserved_subdomain_returns_403(db_session, routing_client):
    response = routing_client.get(
        "/internal/routing/resolve",
        headers={"X-Original-Host": "www.docai.site"},
    )

    assert response.status_code == 403


def test_inactive_deployment_returns_503(db_session, routing_client):
    user = create_user(db_session)
    create_project(db_session, user, "dias-blog", ProjectStatus.STOPPED, deployment_port=9003)

    response = routing_client.get(
        "/internal/routing/resolve",
        headers={"X-Original-Host": "dias-blog.docai.site"},
    )

    assert response.status_code == 503


def test_untrusted_caller_is_rejected_regardless_of_hostname(
    db_session, routing_app, monkeypatch
):
    # Simulate this endpoint being hit directly by something other than
    # the platform's Nginx.
    monkeypatch.setattr("app.routes.routing.ROUTING_TRUSTED_PROXY_IPS", {"127.0.0.1"})
    client = TestClient(routing_app)

    user = create_user(db_session)
    create_project(db_session, user, "dias-blog", ProjectStatus.RUNNING)

    response = client.get(
        "/internal/routing/resolve",
        headers={"X-Original-Host": "dias-blog.docai.site"},
    )

    assert response.status_code == 403
