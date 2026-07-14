from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
import time
from app.constants.project_status import ProjectStatus

from pathlib import Path
from app.config import DEPLOYMENTS_DIR

import subprocess
import shutil

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

            time.sleep(3)
            self.repository.update_status(project, ProjectStatus.RUNNING)


        except Exception:
            self.repository.update_status(project, ProjectStatus.FAILED)
            raise

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
        
        result = subprocess.run(
            [
                "git",
                "clone",
                project.clone_url,
                str(project_dir)
            ],
            capture_output=True,
            text=True,
            check=True
        )

        print(result.stdout)


