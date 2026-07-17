from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.services import project_service as project_service_module
from app.services.project_service import ProjectService


def create_user(db_session, user_id=1, login="ZhumabayDias"):
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


def fake_repo(repo_id=1, name="DocAI Cloud", full_name=None, private=False):
    return {
        "id": repo_id,
        "name": name,
        "full_name": full_name or f"user/{name}",
        "default_branch": "main",
        "private": private,
        "clone_url": f"https://github.com/user/{name}.git",
    }


def test_import_generates_and_saves_subdomain(db_session, monkeypatch):
    user = create_user(db_session)
    repository = ProjectRepository(db_session)
    service = ProjectService(repository)

    repo = fake_repo(repo_id=1, name="DocAI Cloud")
    monkeypatch.setattr(project_service_module, "find_user", lambda token: {})
    monkeypatch.setattr(project_service_module, "get_repo", lambda headers, repo_id: repo)

    project = service.import_from_github(repo_id=1, current_user=user)

    assert project.subdomain == "zhumabaydias-docai-cloud"


def test_import_assigns_incrementing_subdomain_on_repeated_repo_name(
    db_session, monkeypatch
):
    user = create_user(db_session)
    repository = ProjectRepository(db_session)
    service = ProjectService(repository)

    monkeypatch.setattr(project_service_module, "find_user", lambda token: {})

    first_repo = fake_repo(repo_id=1, name="Blog")
    monkeypatch.setattr(
        project_service_module, "get_repo", lambda headers, repo_id: first_repo
    )
    first_project = service.import_from_github(repo_id=1, current_user=user)

    # A second, distinct GitHub repo that also normalizes to "blog".
    second_repo = fake_repo(repo_id=2, name="blog")
    monkeypatch.setattr(
        project_service_module, "get_repo", lambda headers, repo_id: second_repo
    )
    second_project = service.import_from_github(repo_id=2, current_user=user)

    assert first_project.subdomain == "zhumabaydias-blog"
    assert second_project.subdomain == "zhumabaydias-blog-2"


def test_import_subdomain_uniqueness_is_global_across_users(db_session, monkeypatch):
    user_one = create_user(db_session, user_id=1, login="dias")
    user_two = create_user(db_session, user_id=2, login="dias-clone")
    repository = ProjectRepository(db_session)
    service = ProjectService(repository)

    monkeypatch.setattr(project_service_module, "find_user", lambda token: {})

    # Force both users' generated base slugs to collide by monkeypatching
    # the underlying slug builder for this test only.
    import app.services.subdomain_service as subdomain_service_module

    monkeypatch.setattr(
        subdomain_service_module,
        "build_base_subdomain",
        lambda login, repo_name: "shared-slug",
    )

    repo = fake_repo(repo_id=1, name="anything")
    monkeypatch.setattr(project_service_module, "get_repo", lambda headers, repo_id: repo)
    project_one = service.import_from_github(repo_id=1, current_user=user_one)

    repo_two = fake_repo(repo_id=2, name="anything-else")
    monkeypatch.setattr(
        project_service_module, "get_repo", lambda headers, repo_id: repo_two
    )
    project_two = service.import_from_github(repo_id=2, current_user=user_two)

    assert project_one.subdomain == "shared-slug"
    assert project_two.subdomain == "shared-slug-2"
