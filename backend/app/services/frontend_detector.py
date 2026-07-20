"""Automatic detection of a deployable frontend directory inside a cloned
repository.

DocAI's deployment mechanism (see `app.services.deploy_service`) knows how
to build and run supported React static frontends, but it previously
assumed the application lived at the repository root. Many real-world
repositories instead keep the frontend in a subdirectory alongside a
backend (`frontend/`, `client/`, `web/`, `website/`, ...). This module is
responsible ONLY for figuring out *which directory* should be treated as
the deployment root and which static output directory the build produces;
it does not build, run, or otherwise execute anything.

Detection rules
----------------
A directory qualifies as a frontend candidate when it directly contains a
``package.json`` that:

  1. defines an npm ``build`` script, AND
  2. lists ``react`` among its (dev)dependencies, AND
  3. has either React/Vite evidence (``vite`` dependency, Vite build
     script, or Vite config) or Create React App evidence
     (``react-scripts`` dependency or build script).

These are exactly the requirements the deployment mechanism enforces (see
``DeployService.validate_supported_frontend``), so a directory that "looks
like a frontend" to this detector is guaranteed to also be buildable by the
existing pipeline.

Directories are additionally scored using secondary evidence so that, when
more than one directory in a repository qualifies, DocAI can deterministically
prefer the strongest candidate rather than guessing:

  +1  ``react-dom`` present in (dev)dependencies
  +1  framework dependency present (``vite`` or ``react-scripts``)
  +1  framework build script present (``vite build`` or
      ``react-scripts build``)
  +1  Vite-only framework evidence such as ``@vitejs/plugin-react`` or a
      `vite.config.{ts,js,mts,mjs}` file
  +1  a Vite ``dev``/``preview`` script or CRA ``react-scripts start``
      script is defined

Directory *name* (``frontend``, ``client``, ``web``, ``website``, ``app``)
is used only as a tie-breaker between candidates that are otherwise
equally strong evidence-wise, exactly as required: it is never the primary
signal.

Search bounds
--------------
Only the repository root plus up to ``MAX_SEARCH_DEPTH`` (2) directory
levels below it are inspected, and common generated/vendor directories
(`node_modules`, `dist`, `build`, `.git`, ...) and any hidden directory are
never descended into. This keeps detection fast and prevents it from ever
being tricked by a stray `package.json` inside `node_modules`.

Security
--------
`resolve_frontend_directory` guarantees the directory DocAI is about to run
install/build commands in is actually contained within the cloned
repository, regardless of how the relative root was produced. This
protects against path traversal if a relative root ever ends up containing
something like ``"../../etc"``.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

# Directories that are never descended into while searching for a frontend.
# These are either version control internals, generated build output, or
# third-party/vendored code that could otherwise contain misleading
# `package.json` files (e.g. inside `node_modules`).
IGNORED_DIRECTORY_NAMES = frozenset(
    {
        ".git",
        "node_modules",
        "dist",
        "build",
        "coverage",
        ".venv",
        "venv",
        "__pycache__",
        ".cache",
        ".next",
        ".pytest_cache",
        ".idea",
        ".vscode",
        "vendor",
        "target",
        ".turbo",
        ".output",
    }
)

# Directory *names* that are preferred as a tie-breaker only. Earlier
# entries win over later ones when candidates are otherwise equally strong.
PREFERRED_DIRECTORY_NAMES = ("frontend", "client", "web", "website", "app")

# Config files that indicate a Vite project. Not all Vite projects have
# every one of these, so presence of any single one is treated as evidence,
# not a hard requirement.
VITE_CONFIG_FILENAMES = (
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mts",
    "vite.config.mjs",
)

# repository root (depth 0) + up to this many directory levels below it.
MAX_SEARCH_DEPTH = 2


class FrontendDetectionError(Exception):
    """Raised when no supported frontend can be safely identified.

    Messages are intentionally free of absolute filesystem paths so they
    are safe to surface to end users (e.g. as a deployment failure
    reason).
    """


@dataclass(frozen=True, slots=True)
class FrontendCandidate:
    """A directory that qualifies as a deployable frontend."""

    relative_path: str
    build_type: str
    output_directory: str
    depth: int
    evidence_score: int
    name_priority: int
    signals: tuple[str, ...]

    @property
    def sort_key(self) -> tuple[int, int, int]:
        # Higher evidence wins, then stronger name preference, then
        # shallower directories (smaller depth) win.
        return (self.evidence_score, self.name_priority, -self.depth)


@dataclass(frozen=True, slots=True)
class DetectedFrontend:
    """The supported frontend selected for deployment."""

    root_directory: str
    build_type: str
    output_directory: str


VITE_BUILD_TYPE = "vite"
CREATE_REACT_APP_BUILD_TYPE = "create-react-app"


def detect_frontend(repository_root: Path) -> DetectedFrontend:
    """Detect the repository-relative directory containing a deployable
    frontend.

    Returns a `DetectedFrontend` with ``root_directory="."`` when the
    frontend lives at the repository root, or a POSIX-style relative path
    (e.g. ``"frontend"``, ``"apps/web"``) otherwise.

    Raises `FrontendDetectionError` if no supported frontend is found, or
    if multiple equally-strong candidates make automatic selection unsafe.
    """
    if not repository_root.is_dir():
        raise FrontendDetectionError(
            "No supported frontend application was detected in this repository."
        )

    candidates = list(_find_candidates(repository_root))

    if not candidates:
        raise FrontendDetectionError(
            "No supported frontend application was detected in this repository."
        )

    candidates.sort(key=lambda candidate: candidate.sort_key, reverse=True)
    best = candidates[0]

    tied = [
        candidate
        for candidate in candidates
        if candidate.sort_key == best.sort_key
    ]

    if len(tied) > 1:
        candidate_names = ", ".join(
            sorted(candidate.relative_path for candidate in tied)
        )
        raise FrontendDetectionError(
            "Multiple possible frontend directories were detected "
            f"({candidate_names}) and automatic selection was not safe. "
            "Remove or rename the ambiguous directories so only one "
            "supported frontend remains."
        )

    return DetectedFrontend(
        root_directory=best.relative_path,
        build_type=best.build_type,
        output_directory=best.output_directory,
    )


def detect_frontend_root(repository_root: Path) -> str:
    """Backward-compatible wrapper returning only the selected root."""
    return detect_frontend(repository_root).root_directory


def classify_frontend_directory(frontend_dir: Path) -> DetectedFrontend:
    """Classify one already-selected frontend directory.

    This is used by DeployService validation so detection and validation
    share the same package.json rules instead of drifting apart.
    """
    candidate = _evaluate_directory(frontend_dir, 0, frontend_dir)
    if candidate is None:
        raise FrontendDetectionError(
            "No supported frontend application was detected in this repository."
        )

    return DetectedFrontend(
        root_directory=".",
        build_type=candidate.build_type,
        output_directory=candidate.output_directory,
    )


def resolve_frontend_directory(repository_root: Path, relative_root: str) -> Path:
    """Resolve a repository-relative frontend root to an absolute path,
    guaranteeing the result is actually contained within the repository.

    Raises `FrontendDetectionError` if the resolved path would escape the
    repository (path traversal), regardless of where `relative_root` came
    from.
    """
    if relative_root in ("", "."):
        candidate = repository_root
    else:
        candidate = repository_root / relative_root

    repository_root_resolved = repository_root.resolve()
    candidate_resolved = candidate.resolve()

    try:
        candidate_resolved.relative_to(repository_root_resolved)
    except ValueError as error:
        raise FrontendDetectionError(
            "Detected frontend root is outside the repository and was rejected."
        ) from error

    return candidate


def _find_candidates(repository_root: Path) -> list[FrontendCandidate]:
    candidates: list[FrontendCandidate] = []

    for directory, depth in _iter_search_directories(repository_root):
        candidate = _evaluate_directory(directory, depth, repository_root)
        if candidate is not None:
            candidates.append(candidate)

    return candidates


def _iter_search_directories(repository_root: Path):
    """Yield (directory, depth) pairs for the repository root and up to
    `MAX_SEARCH_DEPTH` levels below it, never descending into ignored or
    hidden directories.
    """
    repository_root_resolved = repository_root.resolve()

    yield repository_root, 0

    frontier = [repository_root]
    for depth in range(1, MAX_SEARCH_DEPTH + 1):
        next_frontier: list[Path] = []

        for parent in frontier:
            try:
                children = sorted(
                    (path for path in parent.iterdir() if path.is_dir()),
                    key=lambda path: path.name,
                )
            except OSError:
                continue

            for child in children:
                if _is_ignored_directory(child, repository_root_resolved):
                    continue

                yield child, depth
                next_frontier.append(child)

        frontier = next_frontier


def _is_ignored_directory(directory: Path, repository_root_resolved: Path) -> bool:
    if directory.name.startswith("."):
        return True

    if directory.name in IGNORED_DIRECTORY_NAMES:
        return True

    try:
        directory.resolve().relative_to(repository_root_resolved)
    except ValueError:
        # Symlink (or similar) escaping the repository. Never follow it.
        return True

    return False


def _evaluate_directory(
    directory: Path,
    depth: int,
    repository_root: Path,
) -> FrontendCandidate | None:
    package_json_path = directory / "package.json"

    if not package_json_path.is_file():
        return None

    try:
        package_json = json.loads(package_json_path.read_text())
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return None

    if not isinstance(package_json, dict):
        return None

    scripts = package_json.get("scripts")
    if not isinstance(scripts, dict):
        scripts = {}

    dependencies_raw = package_json.get("dependencies")
    dev_dependencies_raw = package_json.get("devDependencies")
    dependencies = {
        **(dependencies_raw if isinstance(dependencies_raw, dict) else {}),
        **(dev_dependencies_raw if isinstance(dev_dependencies_raw, dict) else {}),
    }

    build_script = scripts.get("build")
    if not isinstance(build_script, str):
        build_script = ""

    build_script_normalized = build_script.lower()

    has_build_script = build_script != ""
    has_react = "react" in dependencies
    has_vite_dependency = "vite" in dependencies
    has_vite_build_script = "vite build" in build_script_normalized
    has_vite_config = any(
        (directory / filename).is_file() for filename in VITE_CONFIG_FILENAMES
    )
    has_vite = has_vite_dependency or has_vite_build_script or has_vite_config
    has_react_scripts_dependency = "react-scripts" in dependencies
    has_react_scripts_build_script = "react-scripts build" in build_script_normalized
    has_create_react_app = (
        has_react_scripts_dependency or has_react_scripts_build_script
    )

    # Minimum bar to qualify as a deployable frontend at all. This
    # intentionally mirrors DeployService.validate_supported_frontend so
    # every detected candidate is guaranteed to also pass that check.
    if not (has_build_script and has_react and (has_vite or has_create_react_app)):
        return None

    if has_create_react_app and not has_vite:
        build_type = CREATE_REACT_APP_BUILD_TYPE
        output_directory = "build"
    elif has_vite and not has_create_react_app:
        build_type = VITE_BUILD_TYPE
        output_directory = "dist"
    elif has_react_scripts_build_script and not has_vite_build_script:
        build_type = CREATE_REACT_APP_BUILD_TYPE
        output_directory = "build"
    else:
        build_type = VITE_BUILD_TYPE
        output_directory = "dist"

    signals = ["npm build script", "react dependency", f"{build_type} build type"]
    evidence_score = 0

    if "react-dom" in dependencies:
        evidence_score += 1
        signals.append("react-dom dependency")

    if build_type == VITE_BUILD_TYPE:
        if has_vite_dependency:
            evidence_score += 1
            signals.append("vite dependency")

        if has_vite_build_script:
            evidence_score += 1
            signals.append("vite build script")

        if "@vitejs/plugin-react" in dependencies:
            evidence_score += 1
            signals.append("@vitejs/plugin-react dependency")

        if has_vite_config:
            evidence_score += 1
            signals.append("vite config file")

        if "dev" in scripts or "preview" in scripts:
            evidence_score += 1
            signals.append("dev/preview script")
    else:
        if has_react_scripts_dependency:
            evidence_score += 1
            signals.append("react-scripts dependency")

        if has_react_scripts_build_script:
            evidence_score += 1
            signals.append("react-scripts build script")

        start_script = scripts.get("start")
        if isinstance(start_script, str) and "react-scripts start" in start_script.lower():
            evidence_score += 1
            signals.append("react-scripts start script")

    relative_path = (
        "."
        if directory == repository_root
        else directory.relative_to(repository_root).as_posix()
    )

    directory_name = relative_path.rsplit("/", maxsplit=1)[-1]
    name_priority = 0
    if relative_path != "." and directory_name in PREFERRED_DIRECTORY_NAMES:
        name_priority = len(PREFERRED_DIRECTORY_NAMES) - PREFERRED_DIRECTORY_NAMES.index(
            directory_name
        )

    return FrontendCandidate(
        relative_path=relative_path,
        build_type=build_type,
        output_directory=output_directory,
        depth=depth,
        evidence_score=evidence_score,
        name_priority=name_priority,
        signals=tuple(signals),
    )
