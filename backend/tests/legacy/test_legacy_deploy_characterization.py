import subprocess
from pathlib import Path
from types import SimpleNamespace

import pytest

from app.constants.project_status import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.security import create_access_token


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


def create_project(db_session, user):
    project = Project(
        user_id=user.id,
        repo_id=42,
        repo_name="docai-demo",
        repo_full_name=f"{user.login}/docai-demo",
        default_branch="main",
        private=False,
        clone_url="https://github.com/example/docai-demo.git",
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture()
def authenticated_client(client, db_session):
    user = create_user(db_session)
    client.cookies.set("access_token", create_access_token(user.id))
    return client, user


@pytest.fixture()
def legacy_deploy_success(monkeypatch):
    calls = []

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            project_dir = Path(command[3])
            project_dir.mkdir(parents=True, exist_ok=True)
            (project_dir / "package.json").write_text(
                """
                {
                  "scripts": {
                    "build": "vite build"
                  },
                  "dependencies": {
                    "@vitejs/plugin-react": "latest",
                    "vite": "latest",
                    "react": "latest",
                    "react-dom": "latest"
                  }
                }
                """
            )

        calls.append(
            {
                "command": command,
                "capture_output": capture_output,
                "text": text,
                "check": check,
            }
        )
        return SimpleNamespace(stdout="cloned\n")

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    return calls


def test_api_deploy_mutates_project_status_to_running(
    authenticated_client,
    db_session,
    legacy_deploy_success,
    test_deployments_dir,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    initial_read = client.get(f"/api/projects/{project.id}")
    assert initial_read.status_code == 200
    assert initial_read.json()["status"] == ProjectStatus.CREATED

    response = client.post(f"/api/projects/{project.id}/deploy")

    assert response.status_code == 200
    assert response.json()["id"] == project.id
    assert response.json()["status"] == ProjectStatus.RUNNING
    assert response.json()["deployment_url"] == "http://127.0.0.1:9000"
    assert legacy_deploy_success == [
        {
            "command": [
                "git",
                "clone",
                project.clone_url,
                str(test_deployments_dir / str(project.id)),
            ],
            "capture_output": True,
            "text": True,
            "check": True,
        },
        {
            "command": [
                "docker",
                "rm",
                "-f",
                f"docai-project-{project.id}",
            ],
            "capture_output": True,
            "text": True,
            "check": False,
        },
        {
            "command": [
                "docker",
                "build",
                "-t",
                f"docai-project-{project.id}:latest",
                str(test_deployments_dir / str(project.id)),
            ],
            "capture_output": True,
            "text": True,
            "check": True,
        },
        {
            "command": [
                "docker",
                "run",
                "-d",
                "--name",
                f"docai-project-{project.id}",
                "-p",
                "9000:80",
                f"docai-project-{project.id}:latest",
            ],
            "capture_output": True,
            "text": True,
            "check": True,
        }
    ]
    assert (test_deployments_dir / str(project.id)).is_dir()
    assert (test_deployments_dir / str(project.id) / "Dockerfile").is_file()
    assert (test_deployments_dir / str(project.id) / ".docai" / "nginx.conf").is_file()

    read_after_deploy = client.get(f"/api/projects/{project.id}")
    assert read_after_deploy.status_code == 200
    assert read_after_deploy.json()["status"] == ProjectStatus.RUNNING
    assert read_after_deploy.json()["deployment_url"] == "http://127.0.0.1:9000"


def test_legacy_html_deploy_route_returns_status_only(
    authenticated_client,
    db_session,
    legacy_deploy_success,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    response = client.post(f"/projects/{project.id}/deploy")

    assert response.status_code == 200
    assert response.json() == {"status": ProjectStatus.RUNNING}


def test_deploy_failure_persists_failed_project_status(
    client_without_server_exceptions,
    db_session,
    monkeypatch,
):
    user = create_user(db_session)
    project = create_project(db_session, user)
    client_without_server_exceptions.cookies.set("access_token", create_access_token(user.id))

    def fake_run(*args, **kwargs):
        raise subprocess.CalledProcessError(returncode=128, cmd=args[0])

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    response = client_without_server_exceptions.post(f"/api/projects/{project.id}/deploy")

    assert response.status_code == 500

    read_after_failure = client_without_server_exceptions.get(f"/api/projects/{project.id}")
    assert read_after_failure.status_code == 200
    assert read_after_failure.json()["status"] == ProjectStatus.FAILED


def test_project_read_and_deploy_are_scoped_to_current_user(
    authenticated_client,
    db_session,
    legacy_deploy_success,
):
    client, _ = authenticated_client
    other_user = create_user(db_session, user_id=2, login="other-user")
    other_project = create_project(db_session, other_user)

    read_response = client.get(f"/api/projects/{other_project.id}")
    deploy_response = client.post(f"/api/projects/{other_project.id}/deploy")

    assert read_response.status_code == 404
    assert read_response.json() == {"detail": "Project not found"}
    assert deploy_response.status_code == 404
    assert deploy_response.json() == {"detail": "Project not found"}
    assert legacy_deploy_success == []


def test_deploy_requires_authentication(client, db_session, legacy_deploy_success):
    user = create_user(db_session)
    project = create_project(db_session, user)

    response = client.post(f"/api/projects/{project.id}/deploy")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}
    assert legacy_deploy_success == []
