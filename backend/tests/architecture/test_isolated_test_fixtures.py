from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]


def test_database_fixture_does_not_use_developer_database(db_session):
    bind_url = db_session.get_bind().url

    assert bind_url.get_backend_name() == "sqlite"
    assert bind_url.database is None
    assert str(BACKEND_DIR / "users.db") not in str(bind_url)


def test_deployment_workspace_fixture_does_not_use_shared_directory(
    test_deployments_dir,
):
    shared_deployments_dir = BACKEND_DIR / "deployments"

    assert test_deployments_dir.exists()
    assert test_deployments_dir != shared_deployments_dir
    assert shared_deployments_dir not in test_deployments_dir.parents


def test_deployment_workspace_patch_is_applied_to_legacy_imports(
    test_deployments_dir,
):
    from app import config
    from app.services import deploy_service

    assert config.DEPLOYMENTS_DIR == test_deployments_dir
    assert deploy_service.DEPLOYMENTS_DIR == test_deployments_dir
