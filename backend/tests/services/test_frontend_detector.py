import json

import pytest

from app.services.frontend_detector import (
    FrontendDetectionError,
    detect_frontend_root,
    resolve_frontend_directory,
)


def write_package_json(
    directory,
    *,
    build=True,
    react=True,
    vite=True,
    extra_dependencies=None,
    extra_scripts=None,
):
    directory.mkdir(parents=True, exist_ok=True)

    scripts = {}
    if build:
        scripts["build"] = "vite build"
    if extra_scripts:
        scripts.update(extra_scripts)

    dependencies = {}
    if react:
        dependencies["react"] = "^18.0.0"
    if vite:
        dependencies["vite"] = "^5.0.0"
    if extra_dependencies:
        dependencies.update(extra_dependencies)

    (directory / "package.json").write_text(
        json.dumps({"scripts": scripts, "dependencies": dependencies})
    )


def write_backend_marker(directory):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "requirements.txt").write_text("fastapi\n")


# TEST 1 — frontend at repository root


def test_detects_root_when_frontend_is_at_repository_root(tmp_path):
    write_package_json(tmp_path)

    assert detect_frontend_root(tmp_path) == "."


# TEST 2 — conventional backend/ + frontend/


def test_detects_frontend_directory_in_fullstack_repo(tmp_path):
    write_backend_marker(tmp_path / "backend")
    write_package_json(tmp_path / "frontend")

    assert detect_frontend_root(tmp_path) == "frontend"


# TEST 3 — server/ + client/


def test_detects_client_directory(tmp_path):
    write_backend_marker(tmp_path / "server")
    write_package_json(tmp_path / "client")

    assert detect_frontend_root(tmp_path) == "client"


# TEST 4 — api/ + web/


def test_detects_web_directory(tmp_path):
    write_backend_marker(tmp_path / "api")
    write_package_json(tmp_path / "web")

    assert detect_frontend_root(tmp_path) == "web"


# TEST 5 — backend/ + website/


def test_detects_website_directory(tmp_path):
    write_backend_marker(tmp_path / "backend")
    website_dir = tmp_path / "website"
    write_package_json(website_dir)
    (website_dir / "vite.config.js").write_text("export default {}")

    assert detect_frontend_root(tmp_path) == "website"


# TEST 6 — no frontend anywhere


def test_raises_when_no_frontend_is_found(tmp_path):
    write_backend_marker(tmp_path / "backend")

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)


# TEST 7 — generated directories are ignored


def test_ignores_package_json_inside_node_modules(tmp_path):
    write_package_json(tmp_path / "node_modules" / "fake-app")

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)


def test_ignores_other_generated_and_hidden_directories(tmp_path):
    for name in ("dist", "build", ".git", ".cache", "__pycache__", "venv"):
        write_package_json(tmp_path / name)

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)


# TEST 8 — nested frontend within allowed depth


def test_detects_frontend_nested_two_levels_deep(tmp_path):
    web_dir = tmp_path / "apps" / "web"
    write_package_json(web_dir)
    (web_dir / "vite.config.ts").write_text("export default {}")

    assert detect_frontend_root(tmp_path) == "apps/web"


# TEST 9 — frontend deeper than the allowed search depth


def test_does_not_scan_deeper_than_max_search_depth(tmp_path):
    write_package_json(tmp_path / "apps" / "web" / "ui")

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)


# TEST 10 — multiple candidates


def test_prefers_stronger_named_candidate_deterministically(tmp_path):
    # Both otherwise-identical, but "frontend" is a preferred name and
    # "admin" is not, so this must resolve deterministically rather than
    # raising an ambiguity error.
    write_package_json(tmp_path / "frontend")
    write_package_json(tmp_path / "admin")

    assert detect_frontend_root(tmp_path) == "frontend"


def test_raises_clear_error_on_genuinely_ambiguous_candidates(tmp_path):
    # Neither "admin" nor "dashboard" is a preferred directory name, and
    # both have identical evidence, so automatic selection would be
    # unsafe.
    write_package_json(tmp_path / "admin")
    write_package_json(tmp_path / "dashboard")

    with pytest.raises(FrontendDetectionError) as exc_info:
        detect_frontend_root(tmp_path)

    message = str(exc_info.value)
    assert "admin" in message
    assert "dashboard" in message


def test_stronger_evidence_wins_over_weaker_candidate(tmp_path):
    # "admin" has more corroborating signals than "frontend", so it should
    # win even though "frontend" is the preferred name — evidence is the
    # primary signal, name is only a tie-breaker.
    write_package_json(tmp_path / "frontend")
    admin_dir = tmp_path / "admin"
    write_package_json(
        admin_dir,
        extra_dependencies={"react-dom": "^18.0.0", "@vitejs/plugin-react": "^4.0.0"},
        extra_scripts={"dev": "vite", "preview": "vite preview"},
    )
    (admin_dir / "vite.config.ts").write_text("export default {}")

    assert detect_frontend_root(tmp_path) == "admin"


# TEST 11 — path traversal protection


def test_resolve_frontend_directory_rejects_escaping_paths(tmp_path):
    repository_root = tmp_path / "repo"
    repository_root.mkdir()

    with pytest.raises(FrontendDetectionError):
        resolve_frontend_directory(repository_root, "../../etc")


def test_resolve_frontend_directory_accepts_safe_relative_roots(tmp_path):
    repository_root = tmp_path / "repo"
    (repository_root / "frontend").mkdir(parents=True)

    resolved = resolve_frontend_directory(repository_root, "frontend")

    assert resolved == repository_root / "frontend"


def test_resolve_frontend_directory_root_returns_repository_root_unchanged(tmp_path):
    repository_root = tmp_path / "repo"
    repository_root.mkdir()

    resolved = resolve_frontend_directory(repository_root, ".")

    assert resolved == repository_root


# Additional qualification checks


def test_directory_without_build_script_does_not_qualify(tmp_path):
    write_package_json(tmp_path, build=False)

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)


def test_directory_without_react_or_vite_does_not_qualify(tmp_path):
    write_package_json(tmp_path, react=False, vite=False)

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)


def test_malformed_package_json_is_skipped_not_raised_as_crash(tmp_path):
    (tmp_path / "broken").mkdir()
    (tmp_path / "broken" / "package.json").write_text("{not valid json")

    with pytest.raises(FrontendDetectionError):
        detect_frontend_root(tmp_path)
