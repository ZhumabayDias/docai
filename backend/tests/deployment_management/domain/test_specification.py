from dataclasses import FrozenInstanceError

import pytest

from app.deployment_management.domain.specification import (
    DeploymentLineage,
    DeploymentSpecification,
    ReleaseInput,
)


def make_release_input() -> ReleaseInput:
    return ReleaseInput(
        source_repository="https://github.com/example/docai-demo.git",
        source_reference="main",
        source_revision="abc123",
    )


def make_specification(**overrides) -> DeploymentSpecification:
    values = {
        "version": 1,
        "release_input": make_release_input(),
        "execution_class": "web",
        "health_policy": {
            "path": "/health",
            "timeout_seconds": 10,
            "expected_statuses": [200, 204],
        },
        "configuration_version": "project-config-v1",
        "environment": {
            "variables": {
                "LOG_LEVEL": "info",
            },
            "secret_handles": {
                "OPENAI_API_KEY": "secret-version-1",
            },
        },
    }
    values.update(overrides)
    return DeploymentSpecification(**values)


def test_release_input_requires_resolved_revision():
    with pytest.raises(ValueError):
        ReleaseInput(
            source_repository="https://github.com/example/docai-demo.git",
            source_reference="main",
            source_revision="",
        )


def test_specification_is_immutable():
    specification = make_specification()

    with pytest.raises(FrozenInstanceError):
        specification.execution_class = "worker"


def test_specification_freezes_nested_mutable_input():
    health_policy = {
        "path": "/health",
        "expected_statuses": [200],
    }
    specification = make_specification(health_policy=health_policy)

    health_policy["path"] = "/changed"
    health_policy["expected_statuses"].append(204)

    assert specification.health_policy["path"] == "/health"
    assert specification.health_policy["expected_statuses"] == (200,)

    with pytest.raises(TypeError):
        specification.health_policy["path"] = "/mutated"


def test_specification_rejects_secret_bearing_fields():
    with pytest.raises(ValueError, match="secret field"):
        make_specification(environment={"TOKEN": "raw-secret-value"})


def test_specification_allows_versioned_secret_handles():
    specification = make_specification(
        environment={
            "secret_handles": {
                "OPENAI_API_KEY": "secret-version-1",
            },
        },
    )

    assert specification.environment["secret_handles"]["OPENAI_API_KEY"] == "secret-version-1"


def test_specification_rejects_provider_specific_fields():
    with pytest.raises(ValueError, match="provider field"):
        make_specification(health_policy={"path": "/health", "container_id": "abc"})


def test_specification_can_record_immutable_lineage_reference():
    lineage = DeploymentLineage(
        parent_deployment_id="deployment-previous",
        reason="redeploy",
    )

    specification = make_specification(lineage=lineage)

    assert specification.lineage == lineage

    with pytest.raises(FrozenInstanceError):
        lineage.reason = "rollback"
