from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import (
    GitHubRepositoryResponse,
    ProjectDetailResponse,
    ProjectImportRequest,
    ProjectResponse,
)
from app.security import get_current_user
from app.services.deploy_service import DeployService
from app.services.project_service import ProjectService

router = APIRouter(prefix="/api/projects", tags=["api-projects"])

@router.get("/repositories", response_model=list[GitHubRepositoryResponse])
def get_repositories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):  
    repository = ProjectRepository(db)

    service = ProjectService(repository)

    return service.get_github_repositories(current_user)
    
@router.get("", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = ProjectRepository(db)
    return repository.get_all_by_user(current_user.id)


@router.post("/import", response_model=ProjectResponse)
def import_project(
    payload: ProjectImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = ProjectRepository(db)
    service = ProjectService(repository)
    return service.import_from_github(payload.repo_id, current_user)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = ProjectRepository(db)
    project = repository.get_by_id_and_user(project_id, current_user.id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.post("/{project_id}/deploy", response_model=ProjectResponse)
def deploy_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = ProjectRepository(db)
    project = repository.get_by_id_and_user(project_id, current_user.id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    service = DeployService(repository)
    return service.deploy(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = ProjectRepository(db)
    project = repository.get_by_id_and_user(project_id,current_user.id)

    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    repository.delete(project)
    

