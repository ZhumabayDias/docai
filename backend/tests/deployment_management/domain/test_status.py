from app.deployment_management.domain.status import DeploymentStatus


def test_deployment_status_values_match_rfc_states():
    assert [status.value for status in DeploymentStatus] == [
        "Queued",
        "Building",
        "Starting",
        "Healthy",
        "Stopping",
        "Stopped",
        "Failed",
    ]


def test_deployment_status_categories_match_rfc():
    assert DeploymentStatus.QUEUED.is_active
    assert DeploymentStatus.BUILDING.is_active
    assert DeploymentStatus.STARTING.is_active
    assert DeploymentStatus.STOPPING.is_active

    assert DeploymentStatus.HEALTHY.is_stable_serving
    assert not DeploymentStatus.HEALTHY.is_terminal

    assert DeploymentStatus.STOPPED.is_terminal
    assert DeploymentStatus.FAILED.is_terminal
