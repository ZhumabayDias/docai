import subprocess
from pathlib import Path
from types import SimpleNamespace

from app.constants.project_status import ProjectStatus
from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.security import create_access_token
from app.services.deploy_service import DeployService
from app.services.deployment_failure import DeploymentFailureCode


VITE_PACKAGE_JSON = """
{
  "scripts": { "build": "vite build" },
  "dependencies": { "vite": "latest", "react": "latest" }
}
"""


CRA_PACKAGE_JSON = """
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
"""


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


def create_project(db_session, user, **overrides):
    values = {
        "user_id": user.id,
        "repo_id": 42,
        "repo_name": "docai-demo",
        "repo_full_name": f"{user.login}/docai-demo",
        "default_branch": "main",
        "private": False,
        "clone_url": "https://github.com/example/docai-demo.git",
    }
    values.update(overrides)
    project = Project(**values)
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


def authenticated_client(client_without_server_exceptions, db_session):
    user = create_user(db_session)
    client_without_server_exceptions.cookies.set("access_token", create_access_token(user.id))
    return client_without_server_exceptions, user


def write_frontend(project_dir: Path, package_json: str = VITE_PACKAGE_JSON):
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "package.json").write_text(package_json)


def deploy_api(client, project):
    return client.post(f"/api/projects/{project.id}/deploy")


def assert_deployment_failure_response(response, code, message):
    assert response.status_code in {422, 500}
    assert response.json() == {
        "detail": {
            "code": code.value,
            "message": message,
        }
    }


def test_frontend_detection_failure_returns_structured_safe_error_and_persists_failed(
    client_without_server_exceptions, db_session, monkeypatch
):
    client, user = authenticated_client(client_without_server_exceptions, db_session)
    project = create_project(db_session, user)

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            Path(command[3]).mkdir(parents=True, exist_ok=True)
            return SimpleNamespace(stdout="cloned\n", returncode=0)
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    response = deploy_api(client, project)

    assert response.status_code == 422
    assert_deployment_failure_response(
        response,
        DeploymentFailureCode.FRONTEND_NOT_DETECTED,
        "No supported frontend application was detected.",
    )

    db_session.refresh(project)
    assert project.status == ProjectStatus.FAILED
    assert project.deployment_error == "No supported frontend application was detected."


def test_clone_failure_returns_safe_error_and_persists_failed(
    client_without_server_exceptions, db_session, monkeypatch
):
    client, user = authenticated_client(client_without_server_exceptions, db_session)
    project = create_project(db_session, user)
    secret = "https://oauth2:SUPER_SECRET_TOKEN@github.com/user/repo.git"

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            raise subprocess.CalledProcessError(128, command, stderr=secret)
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    response = deploy_api(client, project)

    assert_deployment_failure_response(
        response,
        DeploymentFailureCode.CLONE_FAILED,
        "Repository clone failed.",
    )

    body = response.text
    db_session.refresh(project)
    assert project.status == ProjectStatus.FAILED
    assert project.deployment_error == "Repository clone failed."
    assert "SUPER_SECRET_TOKEN" not in body
    assert "SUPER_SECRET_TOKEN" not in project.deployment_error


def test_docker_build_failure_returns_single_build_boundary_error(
    client_without_server_exceptions, db_session, monkeypatch
):
    client, user = authenticated_client(client_without_server_exceptions, db_session)
    project = create_project(db_session, user)

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            write_frontend(Path(command[3]))
            return SimpleNamespace(stdout="cloned\n", returncode=0)
        if command[:2] == ["docker", "build"]:
            raise subprocess.CalledProcessError(1, command, stderr="npm run build failed")
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    response = deploy_api(client, project)

    assert_deployment_failure_response(
        response,
        DeploymentFailureCode.CONTAINER_BUILD_FAILED,
        "Application build failed.",
    )

    db_session.refresh(project)
    assert project.status == ProjectStatus.FAILED
    assert project.deployment_error == "Application build failed."


def test_container_start_failure_returns_safe_error_and_persists_failed(
    client_without_server_exceptions, db_session, monkeypatch
):
    client, user = authenticated_client(client_without_server_exceptions, db_session)
    project = create_project(db_session, user)

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            write_frontend(Path(command[3]))
            return SimpleNamespace(stdout="cloned\n", returncode=0)
        if command[:2] == ["docker", "run"]:
            raise subprocess.CalledProcessError(125, command, stderr="port unavailable")
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    response = deploy_api(client, project)

    assert_deployment_failure_response(
        response,
        DeploymentFailureCode.CONTAINER_START_FAILED,
        "Application container failed to start.",
    )

    db_session.refresh(project)
    assert project.status == ProjectStatus.FAILED
    assert project.deployment_error == "Application container failed to start."


def test_unexpected_internal_exception_is_sanitized_in_api_and_persistence(
    client_without_server_exceptions, db_session, monkeypatch
):
    client, user = authenticated_client(client_without_server_exceptions, db_session)
    project = create_project(db_session, user)
    secret = "SUPER_SECRET_TOKEN"
    absolute_path = "/opt/docai-new/backend/deployments/123/frontend"

    def fail_prepare_directory(self, project):
        raise RuntimeError(f"{secret} leaked near {absolute_path}")

    monkeypatch.setattr(DeployService, "prepare_directory", fail_prepare_directory)

    response = deploy_api(client, project)

    assert_deployment_failure_response(
        response,
        DeploymentFailureCode.DEPLOYMENT_FAILED,
        "Deployment failed unexpectedly.",
    )

    db_session.refresh(project)
    assert project.status == ProjectStatus.FAILED
    assert project.deployment_error == "Deployment failed unexpectedly."
    assert secret not in response.text
    assert absolute_path not in response.text
    assert secret not in project.deployment_error
    assert absolute_path not in project.deployment_error


def test_new_deploy_clears_previous_failure_when_building(
    db_session, monkeypatch, test_deployments_dir
):
    user = create_user(db_session)
    project = create_project(db_session, user)
    repository = ProjectRepository(db_session)
    repository.mark_failed(project, "Old failure")
    observed_state = {}

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            observed_state["status"] = project.status
            observed_state["deployment_error"] = project.deployment_error
            write_frontend(Path(command[3]))
            return SimpleNamespace(stdout="cloned\n", returncode=0)
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    DeployService(repository).deploy(project)

    assert observed_state == {
        "status": ProjectStatus.BUILDING,
        "deployment_error": None,
    }
    assert project.status == ProjectStatus.RUNNING
    assert project.deployment_error is None


def test_successful_vite_deployment_clears_error_and_runs(
    db_session, monkeypatch, test_deployments_dir
):
    user = create_user(db_session)
    project = create_project(db_session, user, deployment_error="Old failure")
    repository = ProjectRepository(db_session)

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            write_frontend(Path(command[3]), VITE_PACKAGE_JSON)
            return SimpleNamespace(stdout="cloned\n", returncode=0)
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    deployed = DeployService(repository).deploy(project)

    assert deployed.status == ProjectStatus.RUNNING
    assert deployed.deployment_error is None
    assert deployed.root_directory == "."


def test_successful_cra_deployment_clears_error_and_uses_build_output(
    db_session, monkeypatch, test_deployments_dir
):
    user = create_user(db_session)
    project = create_project(db_session, user, deployment_error="Old failure")
    repository = ProjectRepository(db_session)

    def fake_run(command, capture_output, text, check):
        if command[:2] == ["git", "clone"]:
            frontend_dir = Path(command[3]) / "frontend"
            write_frontend(frontend_dir, CRA_PACKAGE_JSON)
            return SimpleNamespace(stdout="cloned\n", returncode=0)
        return SimpleNamespace(stdout="\n", returncode=0)

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    deployed = DeployService(repository).deploy(project)

    project_dir = test_deployments_dir / str(project.id)
    dockerfile = (project_dir / "frontend" / "Dockerfile").read_text()

    assert deployed.status == ProjectStatus.RUNNING
    assert deployed.deployment_error is None
    assert deployed.root_directory == "frontend"
    assert "COPY --from=build /app/build /usr/share/nginx/html" in dockerfile
