from app.models.project import Project
from app.constants.project_status import ProjectStatus
from sqlalchemy.orm import Session

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, project: Project):
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_all_by_user(self, user_id: int):
        return (self.db.query(Project).filter(Project.user_id == user_id).all())

    def get_by_id(self, project_id: int):
        return self.db.query(Project).filter(Project.id == project_id).first()

    def delete(self, project: Project):
        self.db.delete(project)
        self.db.commit()

        return project

    def exists_by_repo_id(self, user_id, repo_id):
            return (
                 self.db.query(Project).filter(
                      Project.user_id == user_id, 
                      Project.repo_id == repo_id).first() is not None
                 )

    def exists_by_subdomain(self, subdomain: str) -> bool:
        return (
            self.db.query(Project)
            .filter(Project.subdomain == subdomain)
            .first()
            is not None
        )
    

    def get_by_id_and_user(
              self,
              project_id:int,
              user_id:int
    ):
        return (
              self.db.query(Project).filter(
                   Project.id == project_id,
                   Project.user_id == user_id
              ).first()
         )
    

    def update_status(
              self,
              project: Project,
              status: str
    ):
         project.status = status
         self.db.commit()
         self.db.refresh(project)

         return project

    def mark_building(
              self,
              project: Project
    ):
         project.status = ProjectStatus.BUILDING
         project.deployment_error = None
         self.db.commit()
         self.db.refresh(project)

         return project

    def mark_running(
              self,
              project: Project,
              deployment_url: str,
              deployment_port: int,
              container_name: str,
              root_directory: str | None = None
    ):
         project.status = ProjectStatus.RUNNING
         project.deployment_url = deployment_url
         project.deployment_port = deployment_port
         project.container_name = container_name
         project.root_directory = root_directory
         project.deployment_error = None
         self.db.commit()
         self.db.refresh(project)

         return project

    def mark_failed(
              self,
              project: Project,
              deployment_error: str | None = None
    ):
         project.status = ProjectStatus.FAILED
         project.deployment_error = deployment_error
         self.db.commit()
         self.db.refresh(project)

         return project
