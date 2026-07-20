from enum import Enum


class DeploymentFailureCode(str, Enum):
    FRONTEND_NOT_DETECTED = "FRONTEND_NOT_DETECTED"
    CLONE_FAILED = "CLONE_FAILED"
    CONTAINER_BUILD_FAILED = "CONTAINER_BUILD_FAILED"
    CONTAINER_START_FAILED = "CONTAINER_START_FAILED"
    DEPLOYMENT_FAILED = "DEPLOYMENT_FAILED"


class DeploymentFailure(Exception):
    def __init__(
            self,
            code: DeploymentFailureCode,
            message: str,
            http_status_code: int = 500
    ):
        self.code = code
        self.message = message
        self.http_status_code = http_status_code
        super().__init__(message)


def frontend_not_detected_failure() -> DeploymentFailure:
    return DeploymentFailure(
        DeploymentFailureCode.FRONTEND_NOT_DETECTED,
        "No supported frontend application was detected.",
        http_status_code=422,
    )


def clone_failed_failure() -> DeploymentFailure:
    return DeploymentFailure(
        DeploymentFailureCode.CLONE_FAILED,
        "Repository clone failed.",
    )


def container_build_failed_failure() -> DeploymentFailure:
    return DeploymentFailure(
        DeploymentFailureCode.CONTAINER_BUILD_FAILED,
        "Application build failed.",
    )


def container_start_failed_failure() -> DeploymentFailure:
    return DeploymentFailure(
        DeploymentFailureCode.CONTAINER_START_FAILED,
        "Application container failed to start.",
    )


def deployment_failed_failure() -> DeploymentFailure:
    return DeploymentFailure(
        DeploymentFailureCode.DEPLOYMENT_FAILED,
        "Deployment failed unexpectedly.",
    )
