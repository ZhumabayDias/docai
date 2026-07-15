import pytest

from app.deployment_management.domain.failures import FailureCategory


def test_failure_categories_match_rfc_categories():
    assert {category.value for category in FailureCategory} == {
        "source_failure",
        "build_failure",
        "execution_failure",
        "health_check_failure",
        "cleanup_failure",
        "policy_rejection",
        "platform_failure",
    }


def test_failure_category_rejects_unknown_category():
    with pytest.raises(ValueError):
        FailureCategory("unknown_failure")
