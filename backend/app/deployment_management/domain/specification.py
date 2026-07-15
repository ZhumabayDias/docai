from dataclasses import dataclass
from types import MappingProxyType
from typing import Any, Mapping


SECRET_FIELD_NAMES = {
    "access_token",
    "api_key",
    "client_secret",
    "credential",
    "credentials",
    "password",
    "private_key",
    "secret",
    "token",
}

PROVIDER_FIELD_NAMES = {
    "container_id",
    "image",
    "namespace",
    "node_name",
    "pod_name",
}


@dataclass(frozen=True, slots=True)
class ReleaseInput:
    source_repository: str
    source_revision: str
    source_reference: str | None = None

    def __post_init__(self) -> None:
        _require_non_empty("source_repository", self.source_repository)
        _require_non_empty("source_revision", self.source_revision)

        if self.source_reference is not None:
            _require_non_empty("source_reference", self.source_reference)


@dataclass(frozen=True, slots=True)
class DeploymentLineage:
    parent_deployment_id: str
    reason: str

    def __post_init__(self) -> None:
        _require_non_empty("parent_deployment_id", self.parent_deployment_id)
        _require_non_empty("reason", self.reason)


@dataclass(frozen=True, slots=True)
class DeploymentSpecification:
    version: int
    release_input: ReleaseInput
    execution_class: str
    health_policy: Mapping[str, Any]
    configuration_version: str
    environment: Mapping[str, Any] | None = None
    lineage: DeploymentLineage | None = None

    def __post_init__(self) -> None:
        if self.version < 1:
            raise ValueError("version must be greater than or equal to 1")

        _require_non_empty("execution_class", self.execution_class)
        _require_non_empty("configuration_version", self.configuration_version)
        _validate_safe_mapping("health_policy", self.health_policy)

        if self.environment is not None:
            _validate_safe_mapping("environment", self.environment)

        object.__setattr__(self, "health_policy", _freeze_mapping(self.health_policy))

        if self.environment is not None:
            object.__setattr__(self, "environment", _freeze_mapping(self.environment))


def _require_non_empty(field_name: str, value: str) -> None:
    if value.strip() == "":
        raise ValueError(f"{field_name} must not be empty")


def _freeze_mapping(value: Mapping[str, Any]) -> Mapping[str, Any]:
    return MappingProxyType(
        {
            key: _freeze_value(nested_value)
            for key, nested_value in value.items()
        }
    )


def _freeze_value(value: Any) -> Any:
    if isinstance(value, Mapping):
        return _freeze_mapping(value)

    if isinstance(value, list | tuple):
        return tuple(_freeze_value(item) for item in value)

    if isinstance(value, set | frozenset):
        return frozenset(_freeze_value(item) for item in value)

    return value


def _validate_safe_mapping(field_name: str, value: Mapping[str, Any]) -> None:
    if not isinstance(value, Mapping):
        raise TypeError(f"{field_name} must be a mapping")

    _validate_safe_mapping_keys(field_name, value)


def _validate_safe_mapping_keys(field_name: str, value: Mapping[str, Any]) -> None:
    for key, nested_value in value.items():
        if not isinstance(key, str):
            raise TypeError(f"{field_name} keys must be strings")

        normalized_key = key.strip().lower()

        if normalized_key == "":
            raise ValueError(f"{field_name} keys must not be empty")

        if normalized_key in SECRET_FIELD_NAMES:
            raise ValueError(f"{field_name} must not contain secret field '{key}'")

        if normalized_key in PROVIDER_FIELD_NAMES:
            raise ValueError(f"{field_name} must not contain provider field '{key}'")

        if isinstance(nested_value, Mapping):
            _validate_safe_mapping_keys(f"{field_name}.{key}", nested_value)
