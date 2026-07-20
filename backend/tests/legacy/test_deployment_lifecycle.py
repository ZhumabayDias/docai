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
def fake_docker_daemon(monkeypatch):
    """Simulates a docker daemon: builds produce a new image id each time,
    `docker images -q` reports the currently tagged image id, and
    rm/rmi/stop calls actually remove tracked state so idempotency can be
    verified (repeated calls on missing resources do not raise)."""

    state = {
        "containers": set(),
        "images": {},  # image_name -> image_id
        "build_count": 0,
        "calls": [],
    }

    def fake_run(command, capture_output, text, check):
        state["calls"].append(command)

        if command[:2] == ["git", "clone"]:
            project_dir = Path(command[3])
            project_dir.mkdir(parents=True, exist_ok=True)
            (project_dir / "package.json").write_text(
                """
                {
                  "scripts": { "build": "vite build" },
                  "dependencies": {
                    "vite": "latest",
                    "react": "latest"
                  }
                }
                """
            )
            return SimpleNamespace(stdout="cloned\n", returncode=0)

        if command[:2] == ["docker", "images"]:
            image_name = command[3]
            image_id = state["images"].get(image_name, "")
            return SimpleNamespace(stdout=f"{image_id}\n" if image_id else "\n", returncode=0)

        if command[:2] == ["docker", "build"]:
            image_name = command[3]
            state["build_count"] += 1
            state["images"][image_name] = f"img-{state['build_count']}"
            return SimpleNamespace(stdout="built\n", returncode=0)

        if command[:2] == ["docker", "run"]:
            container_name = command[4]
            state["containers"].add(container_name)
            return SimpleNamespace(stdout="started\n", returncode=0)

        if command[:2] == ["docker", "stop"]:
            container_name = command[2]
            # Idempotent: succeeds even if container is not running/missing.
            return SimpleNamespace(stdout="", returncode=0)

        if command[:3] == ["docker", "rm", "-f"]:
            container_name = command[3]
            state["containers"].discard(container_name)
            return SimpleNamespace(stdout="", returncode=0)

        if command[:3] == ["docker", "rmi", "-f"]:
            target = command[3]
            for image_name, image_id in list(state["images"].items()):
                if target in (image_name, image_id):
                    del state["images"][image_name]
            return SimpleNamespace(stdout="", returncode=0)

        raise AssertionError(f"Unexpected docker command: {command}")

    monkeypatch.setattr("app.services.deploy_service.subprocess.run", fake_run)

    return state


def test_deployment_url_returned_by_list_and_detail_endpoints(
    authenticated_client,
    db_session,
    fake_docker_daemon,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    deploy_response = client.post(f"/api/projects/{project.id}/deploy")
    assert deploy_response.status_code == 200
    assert deploy_response.json()["deployment_url"] == "https://octocat-docai-demo.docai.site"

    list_response = client.get("/api/projects")
    assert list_response.status_code == 200
    [listed_project] = [
        item for item in list_response.json() if item["id"] == project.id
    ]
    assert listed_project["deployment_url"] == "https://octocat-docai-demo.docai.site"

    detail_response = client.get(f"/api/projects/{project.id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["deployment_url"] == "https://octocat-docai-demo.docai.site"


def test_delete_removes_container_image_directory_and_db_row(
    authenticated_client,
    db_session,
    fake_docker_daemon,
    test_deployments_dir,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    deploy_response = client.post(f"/api/projects/{project.id}/deploy")
    assert deploy_response.status_code == 200

    project_dir = test_deployments_dir / str(project.id)
    container_name = f"docai-project-{project.id}"
    image_name = f"docai-project-{project.id}:latest"

    assert project_dir.is_dir()
    assert container_name in fake_docker_daemon["containers"]
    assert image_name in fake_docker_daemon["images"]

    delete_response = client.delete(f"/api/projects/{project.id}")
    assert delete_response.status_code == 204

    assert not project_dir.exists()
    assert container_name not in fake_docker_daemon["containers"]
    assert image_name not in fake_docker_daemon["images"]

    get_response = client.get(f"/api/projects/{project.id}")
    assert get_response.status_code == 404


def test_delete_is_idempotent_when_resources_already_gone(
    authenticated_client,
    db_session,
    fake_docker_daemon,
    test_deployments_dir,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    deploy_response = client.post(f"/api/projects/{project.id}/deploy")
    assert deploy_response.status_code == 200

    # Simulate an operator having already removed the docker resources
    # out-of-band before the delete request arrives.
    container_name = f"docai-project-{project.id}"
    image_name = f"docai-project-{project.id}:latest"
    fake_docker_daemon["containers"].discard(container_name)
    fake_docker_daemon["images"].pop(image_name, None)

    delete_response = client.delete(f"/api/projects/{project.id}")

    assert delete_response.status_code == 204
    assert not (test_deployments_dir / str(project.id)).exists()


def test_delete_succeeds_for_never_deployed_project(
    authenticated_client,
    db_session,
    fake_docker_daemon,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    delete_response = client.delete(f"/api/projects/{project.id}")

    assert delete_response.status_code == 204


def test_redeploy_keeps_single_container_image_and_directory(
    authenticated_client,
    db_session,
    fake_docker_daemon,
    test_deployments_dir,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    first = client.post(f"/api/projects/{project.id}/deploy")
    second = client.post(f"/api/projects/{project.id}/deploy")

    assert first.status_code == 200
    assert second.status_code == 200

    container_name = f"docai-project-{project.id}"
    image_name = f"docai-project-{project.id}:latest"

    # Only one container/image identity exists for the project.
    assert list(fake_docker_daemon["containers"]).count(container_name) == 1
    assert image_name in fake_docker_daemon["images"]

    # The stale image from the first build was removed by the second deploy.
    assert fake_docker_daemon["images"][image_name] == "img-2"

    # Exactly one deployment directory exists for the project.
    deployment_dirs = [
        p for p in test_deployments_dir.iterdir() if p.name == str(project.id)
    ]
    assert len(deployment_dirs) == 1


def test_full_lifecycle_deploy_redeploy_delete_deploy(
    authenticated_client,
    db_session,
    fake_docker_daemon,
    test_deployments_dir,
):
    client, user = authenticated_client
    project = create_project(db_session, user)

    container_name = f"docai-project-{project.id}"
    image_name = f"docai-project-{project.id}:latest"
    project_dir = test_deployments_dir / str(project.id)

    assert client.post(f"/api/projects/{project.id}/deploy").status_code == 200
    assert client.post(f"/api/projects/{project.id}/deploy").status_code == 200

    assert client.delete(f"/api/projects/{project.id}").status_code == 204
    assert container_name not in fake_docker_daemon["containers"]
    assert image_name not in fake_docker_daemon["images"]
    assert not project_dir.exists()
    assert client.get(f"/api/projects/{project.id}").status_code == 404

    # Re-importing and deploying again must work cleanly after deletion.
    new_project = create_project(db_session, user)
    redeploy_response = client.post(f"/api/projects/{new_project.id}/deploy")

    assert redeploy_response.status_code == 200
    assert redeploy_response.json()["status"] == ProjectStatus.RUNNING
    assert (test_deployments_dir / str(new_project.id)).is_dir()