from enum import StrEnum


class FailureCategory(StrEnum):
    SOURCE_FAILURE = "source_failure"
    BUILD_FAILURE = "build_failure"
    EXECUTION_FAILURE = "execution_failure"
    HEALTH_CHECK_FAILURE = "health_check_failure"
    CLEANUP_FAILURE = "cleanup_failure"
    POLICY_REJECTION = "policy_rejection"
    PLATFORM_FAILURE = "platform_failure"
