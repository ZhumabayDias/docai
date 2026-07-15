import json
from pathlib import Path
import subprocess
import shutil
from urllib.parse import quote

from app.config import (
    DEPLOYMENT_BASE_URL,
    DEPLOYMENT_PORT_END,
    DEPLOYMENT_PORT_START,
    DEPLOYMENTS_DIR,
)
from app.constants.project_status import ProjectStatus
from app.models.project import Project
from app.repositories.project_repository import ProjectRepository


DOCKERFILE = """FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY .docai/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
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
.git
.env
.env.*
"""


class DeployService:

    def __init__(self, repository: ProjectRepository):
        self.repository = repository


    def deploy(self, project:Project):
        self.repository.update_status(
            project,
            ProjectStatus.BUILDING
        )

        try:
            project_dir = self.prepare_directory(project)

            self.clone_repository(
                project,
                project_dir
            )

            self.validate_react_vite_project(project_dir)
            self.write_docker_assets(project_dir)

            image_name = self.get_image_name(project)
            container_name = self.get_container_name(project)
            deployment_port = self.get_deployment_port(project)

            previous_image_id = self.get_image_id(image_name)

            self.remove_existing_container(container_name)
            self.build_image(image_name, project_dir)
            self.run_container(container_name, image_name, deployment_port)

            self.remove_stale_image(image_name, previous_image_id)

            deployment_url = self.get_deployment_url(deployment_port)
            self.repository.mark_running(
                project,
                deployment_url,
                deployment_port,
                container_name,
            )

        except Exception:
            self.repository.mark_failed(project)
            raise

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


    def validate_react_vite_project(self, project_dir: Path):
        package_json_path = project_dir / "package.json"

        if not package_json_path.exists():
            raise ValueError("Only React/Vite repositories with package.json are supported")

        package_json = json.loads(package_json_path.read_text())
        scripts = package_json.get("scripts", {})
        dependencies = {
            **package_json.get("dependencies", {}),
            **package_json.get("devDependencies", {}),
        }

        if "build" not in scripts:
            raise ValueError("React/Vite repositories must define an npm build script")

        if "vite" not in dependencies or "react" not in dependencies:
            raise ValueError("Only React/Vite repositories are supported")


    def write_docker_assets(self, project_dir: Path):
        docai_dir = project_dir / ".docai"
        docai_dir.mkdir(exist_ok=True)
        (project_dir / "Dockerfile").write_text(DOCKERFILE)
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


    def get_deployment_url(self, deployment_port: int):
        return f"{DEPLOYMENT_BASE_URL}:{deployment_port}"


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