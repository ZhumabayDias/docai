from pathlib import Path
from types import SimpleNamespace

import pytest

from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.services.deploy_service import DeployService


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


def create_project(db_session, user, repo_name="docai-demo", subdomain=None):
    project = Project(
        user_id=user.id,
        repo_id=42,
        repo_name=repo_name,
        repo_full_name=f"{user.login}/{repo_name}",
        default_branch="main",
        private=False,
        clone_url="https://github.com/example/docai-demo.git",
        subdomain=subdomain,
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture()
def fake_docker_and_git(monkeypatch):
    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            project_dir = Path(command[3])
            project_dir.mkdir(parents=True, exist_ok=True)
            (project_dir / "package.json").write_text(
                """
                {
                  "scripts": { "build": "vite build" },
                  "dependencies": { "vite": "latest", "react": "latest" }
                }
                """
            )
            return SimpleNamespace(stdout="cloned\n", returncode=0)

        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)


def test_deployment_url_uses_existing_subdomain(
    db_session, fake_docker_and_git, test_deployments_dir
):
    user = create_user(db_session)
    project = create_project(db_session, user, subdomain="octocat-docai-demo")
    repository = ProjectRepository(db_session)
    service = DeployService(repository)

    deployed = service.deploy(project)

    assert deployed.deployment_url == "https://octocat-docai-demo.docai.site"
    assert "127.0.0.1" not in deployed.deployment_url
    assert ":9000" not in deployed.deployment_url


def test_deployment_url_backfills_subdomain_for_legacy_project(
    db_session, fake_docker_and_git, test_deployments_dir
):
    # Simulates a project imported before this PR existed, so it has no
    # subdomain saved yet.
    user = create_user(db_session)
    project = create_project(db_session, user, subdomain=None)
    assert project.subdomain is None

    repository = ProjectRepository(db_session)
    service = DeployService(repository)

    deployed = service.deploy(project)

    assert deployed.subdomain == "octocat-docai-demo"
    assert deployed.deployment_url == "https://octocat-docai-demo.docai.site"


def test_deployment_port_is_still_tracked_independently_of_subdomain(
    db_session, fake_docker_and_git, test_deployments_dir
):
    # PR-1 must not change Docker port allocation, even though the port is
    # no longer part of the public deployment_url.
    user = create_user(db_session)
    project = create_project(db_session, user)
    repository = ProjectRepository(db_session)
    service = DeployService(repository)

    deployed = service.deploy(project)

    assert deployed.deployment_port == 9000
    assert str(deployed.deployment_port) not in deployed.deployment_url
