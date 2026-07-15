from enum import StrEnum


class DeploymentStatus(StrEnum):
    QUEUED = "Queued"
    BUILDING = "Building"
    STARTING = "Starting"
    HEALTHY = "Healthy"
    STOPPING = "Stopping"
    STOPPED = "Stopped"
    FAILED = "Failed"

    @property
    def is_active(self) -> bool:
        return self in {
            DeploymentStatus.QUEUED,
            DeploymentStatus.BUILDING,
            DeploymentStatus.STARTING,
            DeploymentStatus.STOPPING,
        }

    @property
    def is_terminal(self) -> bool:
        return self in {
            DeploymentStatus.STOPPED,
            DeploymentStatus.FAILED,
        }

    @property
    def is_stable_serving(self) -> bool:
        return self is DeploymentStatus.HEALTHY
