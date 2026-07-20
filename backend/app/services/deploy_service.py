from pathlib import Path
import logging
import subprocess
import shutil
from urllib.parse import quote

from app.config import (
    DEPLOYMENT_PORT_END,
    DEPLOYMENT_PORT_START,
    DEPLOYMENT_SUBDOMAIN_BASE,
    DEPLOYMENTS_DIR,
)
from app.constants.project_status import ProjectStatus
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.services.deployment_failure import (
    DeploymentFailure,
    clone_failed_failure,
    container_build_failed_failure,
    container_start_failed_failure,
    deployment_failed_failure,
    frontend_not_detected_failure,
)
from app.services.frontend_detector import (
    DetectedFrontend,
    FrontendDetectionError,
    classify_frontend_directory,
    detect_frontend,
    resolve_frontend_directory,
)
from app.services.subdomain_service import ensure_project_subdomain

logger = logging.getLogger("app.deploy")


DOCKERFILE_TEMPLATE = """FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY .docai/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/{build_output_directory} /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
"""

NGINX_CONF = """server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""

DOCKERIGNORE = """node_modules
dist
build
.git
.env
.env.*
"""


class DeployService:

    def __init__(self, repository: ProjectRepository):
        self.repository = repository


    def deploy(self, project:Project):
        self.repository.mark_building(project)

        try:
            project_dir = self.prepare_directory(project)

            try:
                self.clone_repository(
                    project,
                    project_dir
                )
            except subprocess.CalledProcessError as error:
                raise clone_failed_failure() from error

            try:
                detected_frontend = self.detect_frontend(project_dir)
                frontend_dir = resolve_frontend_directory(
                    project_dir,
                    detected_frontend.root_directory,
                )

                self.validate_supported_frontend(frontend_dir, detected_frontend)
            except FrontendDetectionError as error:
                raise frontend_not_detected_failure() from error

            self.write_docker_assets(
                frontend_dir,
                detected_frontend.output_directory,
            )

            image_name = self.get_image_name(project)
            container_name = self.get_container_name(project)
            deployment_port = self.get_deployment_port(project)

            previous_image_id = self.get_image_id(image_name)

            self.remove_existing_container(container_name)
            try:
                self.build_image(image_name, frontend_dir)
            except subprocess.CalledProcessError as error:
                raise container_build_failed_failure() from error

            try:
                self.run_container(container_name, image_name, deployment_port)
            except subprocess.CalledProcessError as error:
                raise container_start_failed_failure() from error

            self.remove_stale_image(image_name, previous_image_id)

            deployment_url = self.get_deployment_url(project)
            self.repository.mark_running(
                project,
                deployment_url,
                deployment_port,
                container_name,
                root_directory=detected_frontend.root_directory,
            )

        except DeploymentFailure as failure:
            logger.exception(
                "deployment.failed",
                extra={"project_id": project.id, "code": failure.code.value},
            )
            self.repository.mark_failed(project, failure.message)
            raise
        except Exception as error:
            failure = deployment_failed_failure()
            logger.exception("deployment.unexpected_failed", extra={"project_id": project.id})
            self.repository.mark_failed(project, failure.message)
            raise failure from error

        return project


    def delete(self, project: Project):
        container_name = self.get_container_name(project)
        image_name = self.get_image_name(project)

        self.stop_container(container_name)
        self.remove_existing_container(container_name)
        self.remove_image(image_name)
        self.remove_project_directory(project)

        return project
    

    def get_project_directory(self, project):
        return DEPLOYMENTS_DIR / str(project.id)
    

    def prepare_directory(self, project):
        project_dir = self.get_project_directory(project)

        if project_dir.exists():
            shutil.rmtree(project_dir)

        project_dir.mkdir(parents=True)

        return project_dir
    

    def clone_repository(
            self,
            project:Project,
            project_dir: Path
    ):
        clone_url = self.get_authenticated_clone_url(project)
        result = subprocess.run(
            [
                "git",
                "clone",
                clone_url,
                str(project_dir)
            ],
            capture_output=True,
            text=True,
            check=True
        )

        print(result.stdout)


    def get_authenticated_clone_url(self, project: Project):
        if not project.private:
            return project.clone_url

        token = getattr(project.user, "access_token", "")

        if token == "":
            return project.clone_url

        encoded_token = quote(token, safe="")
        return project.clone_url.replace(
            "https://",
            f"https://x-access-token:{encoded_token}@",
            1,
        )


    def detect_frontend(self, project_dir: Path) -> DetectedFrontend:
        """Detect which repository-relative directory contains the
        deployable frontend. See `app.services.frontend_detector` for the
        detection rules.
        """
        return detect_frontend(project_dir)


    def detect_frontend_root(self, project_dir: Path) -> str:
        """Backward-compatible wrapper returning only the frontend root."""
        return self.detect_frontend(project_dir).root_directory


    def validate_supported_frontend(
            self,
            project_dir: Path,
            detected_frontend: DetectedFrontend | None = None
    ):
        classified_frontend = classify_frontend_directory(project_dir)

        if detected_frontend is None:
            return

        if (
            classified_frontend.build_type != detected_frontend.build_type
            or classified_frontend.output_directory != detected_frontend.output_directory
        ):
            raise ValueError("Detected frontend classification changed during validation")


    def validate_react_vite_project(self, project_dir: Path):
        """Backward-compatible validation wrapper for older callers/tests."""
        self.validate_supported_frontend(project_dir)


    def write_docker_assets(self, project_dir: Path, build_output_directory: str = "dist"):
        docai_dir = project_dir / ".docai"
        docai_dir.mkdir(exist_ok=True)
        dockerfile = DOCKERFILE_TEMPLATE.format(
            build_output_directory=build_output_directory
        )
        (project_dir / "Dockerfile").write_text(dockerfile)
        (project_dir / ".dockerignore").write_text(DOCKERIGNORE)
        (docai_dir / "nginx.conf").write_text(NGINX_CONF)


    def get_image_name(self, project: Project):
        return f"docai-project-{project.id}:latest"


    def get_container_name(self, project: Project):
        return f"docai-project-{project.id}"


    def get_deployment_port(self, project: Project):
        port_count = DEPLOYMENT_PORT_END - DEPLOYMENT_PORT_START + 1

        if port_count < 1:
            raise ValueError("DEPLOYMENT_PORT_END must be greater than or equal to DEPLOYMENT_PORT_START")

        return DEPLOYMENT_PORT_START + ((project.id - 1) % port_count)


    def get_deployment_url(self, project: Project) -> str:
        """Build the public deployment URL for a project.

        Uses `https://{project.subdomain}.{DEPLOYMENT_SUBDOMAIN_BASE}`
        instead of the old `http://IP:PORT` scheme. This URL is not yet
        wired up to real routing (no Nginx/DNS changes in this PR) — it is
        only stored on the project record in preparation for PR-2.

        Projects imported before subdomains existed are backfilled lazily
        here, so every deploy ends up with a subdomain regardless of when
        the project was imported.
        """
        github_login = project.user.login
        subdomain = ensure_project_subdomain(project, self.repository, github_login)

        return f"https://{subdomain}.{DEPLOYMENT_SUBDOMAIN_BASE}"


    def remove_existing_container(self, container_name: str):
        subprocess.run(
            [
                "docker",
                "rm",
                "-f",
                container_name,
            ],
            capture_output=True,
            text=True,
            check=False,
        )


    def get_image_id(self, image_name: str) -> str:
        result = subprocess.run(
            [
                "docker",
                "images",
                "-q",
                image_name,
            ],
            capture_output=True,
            text=True,
            check=False,
        )

        return result.stdout.strip()


    def remove_stale_image(self, image_name: str, previous_image_id: str):
        if previous_image_id == "":
            return

        current_image_id = self.get_image_id(image_name)

        if current_image_id == previous_image_id:
            return

        subprocess.run(
            [
                "docker",
                "rmi",
                "-f",
                previous_image_id,
            ],
            capture_output=True,
            text=True,
            check=False,
        )


    def stop_container(self, container_name: str):
        subprocess.run(
            [
                "docker",
                "stop",
                container_name,
            ],
            capture_output=True,
            text=True,
            check=False,
        )


    def remove_image(self, image_name: str):
        subprocess.run(
            [
                "docker",
                "rmi",
                "-f",
                image_name,
            ],
            capture_output=True,
            text=True,
            check=False,
        )


    def remove_project_directory(self, project: Project):
        project_dir = self.get_project_directory(project)

        if project_dir.exists():
            shutil.rmtree(project_dir)


    def build_image(self, image_name: str, project_dir: Path):
        subprocess.run(
            [
                "docker",
                "build",
                "-t",
                image_name,
                str(project_dir),
            ],
            capture_output=True,
            text=True,
            check=True,
        )


    def run_container(
            self,
            container_name: str,
            image_name: str,
            deployment_port: int
    ):
        subprocess.run(
            [
                "docker",
                "run",
                "-d",
                "--name",
                container_name,
                "-p",
                f"{deployment_port}:80",
                image_name,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
