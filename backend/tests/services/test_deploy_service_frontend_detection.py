from pathlib import Path
from types import SimpleNamespace

import pytest

from app.constants.project_status import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.security import create_access_token
from app.services.deploy_service import DeployService
from app.services.frontend_detector import FrontendDetectionError


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


def create_project(db_session, user, repo_name="docai-demo"):
    project = Project(
        user_id=user.id,
        repo_id=42,
        repo_name=repo_name,
        repo_full_name=f"{user.login}/{repo_name}",
        default_branch="main",
        private=False,
        clone_url="https://github.com/example/docai-demo.git",
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


FRONTEND_PACKAGE_JSON = """
{
  "scripts": { "build": "vite build" },
  "dependencies": { "vite": "latest", "react": "latest" }
}
"""


def fullstack_clone(command, capture_output, text, check):
    """Simulates cloning a full-stack repo: backend/ (no package.json) +
    frontend/ (a valid React/Vite app)."""
    if command[:2] == ["git", "clone"]:
        project_dir = Path(command[3])
        project_dir.mkdir(parents=True, exist_ok=True)

        backend_dir = project_dir / "backend"
        backend_dir.mkdir()
        (backend_dir / "requirements.txt").write_text("fastapi\n")

        frontend_dir = project_dir / "frontend"
        frontend_dir.mkdir()
        (frontend_dir / "package.json").write_text(FRONTEND_PACKAGE_JSON)
        (frontend_dir / "vite.config.ts").write_text("export default {}")

        return SimpleNamespace(stdout="cloned\n", returncode=0)

    return SimpleNamespace(stdout="\n", returncode=0)


def backend_only_clone(command, capture_output, text, check):
    """Simulates cloning a repo that has no deployable frontend at all."""
    if command[:2] == ["git", "clone"]:
        project_dir = Path(command[3])
        project_dir.mkdir(parents=True, exist_ok=True)

        backend_dir = project_dir / "backend"
        backend_dir.mkdir()
        (backend_dir / "requirements.txt").write_text("fastapi\n")

        return SimpleNamespace(stdout="cloned\n", returncode=0)

    return SimpleNamespace(stdout="\n", returncode=0)


def root_level_clone(command, capture_output, text, check):
    """Simulates cloning a repo whose frontend already lives at the
    repository root (pre-existing, must keep working unchanged)."""
    if command[:2] == ["git", "clone"]:
        project_dir = Path(command[3])
        project_dir.mkdir(parents=True, exist_ok=True)
        (project_dir / "package.json").write_text(FRONTEND_PACKAGE_JSON)

        return SimpleNamespace(stdout="cloned\n", returncode=0)

    return SimpleNamespace(stdout="\n", returncode=0)


# TEST 13 — full-stack deployment integration: build/runtime commands must
# operate from frontend/, not the repository root, and backend/ must be
# ignored entirely.
def test_deploy_builds_from_detected_frontend_directory_not_repo_root(
    db_session, monkeypatch, test_deployments_dir
):
    calls = []

    def fake_run(command, capture_output, text, check):
        calls.append(command)
        return fullstack_clone(command, capture_output, text, check)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    user = create_user(db_session)
    project = create_project(db_session, user)
    repository = ProjectRepository(db_session)
    service = DeployService(repository)

    deployed = service.deploy(project)

    project_dir = test_deployments_dir / str(project.id)
    frontend_dir = project_dir / "frontend"

    assert deployed.status == ProjectStatus.RUNNING
    assert deployed.root_directory == "frontend"

    # Docker build must use the frontend/ subdirectory as its build
    # context, never the repository root.
    build_commands = [command for command in calls if command[:2] == ["docker", "build"]]
    assert len(build_commands) == 1
    assert build_commands[0][-1] == str(frontend_dir)

    # Docker assets are written into frontend/, not the repository root.
    assert (frontend_dir / "Dockerfile").is_file()
    assert (frontend_dir / ".docai" / "nginx.conf").is_file()
    assert not (project_dir / "Dockerfile").is_file()

    # backend/ must never be touched by the deployment mechanism.
    assert (project_dir / "backend" / "requirements.txt").is_file()


# TEST 12 — existing root-level React/Vite deployments keep working
# exactly as before (root_directory resolves to ".").
def test_deploy_still_works_for_existing_root_level_frontend(
    db_session, monkeypatch, test_deployments_dir
):
    calls = []

    def fake_run(command, capture_output, text, check):
        calls.append(command)
        return root_level_clone(command, capture_output, text, check)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    user = create_user(db_session)
    project = create_project(db_session, user)
    repository = ProjectRepository(db_session)
    service = DeployService(repository)

    deployed = service.deploy(project)

    project_dir = test_deployments_dir / str(project.id)

    assert deployed.status == ProjectStatus.RUNNING
    assert deployed.root_directory == "."

    build_commands = [command for command in calls if command[:2] == ["docker", "build"]]
    assert build_commands[0][-1] == str(project_dir)
    assert (project_dir / "Dockerfile").is_file()


# Clean deployment failure (no supported frontend anywhere in the repo).
def test_deploy_fails_cleanly_when_no_frontend_is_detected(
    db_session, monkeypatch, test_deployments_dir
):
    monkeypatch.setattr(
        "app.services.deploy_service.subprocess.run", backend_only_clone
    )

    user = create_user(db_session)
    project = create_project(db_session, user)
    repository = ProjectRepository(db_session)
    service = DeployService(repository)

    with pytest.raises(FrontendDetectionError):
        service.deploy(project)

    assert project.status == ProjectStatus.FAILED


def test_deploy_endpoint_returns_500_and_marks_failed_when_no_frontend_detected(
    monkeypatch, legacy_app, db_session
):
    from fastapi.testclient import TestClient

    monkeypatch.setattr(
        "app.services.deploy_service.subprocess.run", backend_only_clone
    )

    client = TestClient(legacy_app, raise_server_exceptions=False)
    user = create_user(db_session)
    project = create_project(db_session, user)
    client.cookies.set("access_token", create_access_token(user.id))

    response = client.post(f"/api/projects/{project.id}/deploy")

    assert response.status_code == 500

    detail_response = client.get(f"/api/projects/{project.id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["status"] == ProjectStatus.FAILED
