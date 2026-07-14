import importlib


def test_deployment_engine_feature_gate_defaults_disabled(monkeypatch):
    from app import config

    monkeypatch.delenv("DEPLOYMENT_ENGINE_ENABLED", raising=False)
    importlib.reload(config)

    assert config.DEPLOYMENT_ENGINE_ENABLED is False


def test_deployment_engine_feature_gate_can_be_enabled(monkeypatch):
    from app import config

    monkeypatch.setenv("DEPLOYMENT_ENGINE_ENABLED", "true")
    importlib.reload(config)

    assert config.DEPLOYMENT_ENGINE_ENABLED is True

    monkeypatch.delenv("DEPLOYMENT_ENGINE_ENABLED", raising=False)
    importlib.reload(config)
