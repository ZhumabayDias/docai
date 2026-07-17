from pathlib import Path

from app.database import get_db
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectResponse
from app.models.project import Project
from app.models.user import User
from app.security import get_current_user
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, HTTPException, status, Form, Request
from fastapi.templating import Jinja2Templates

from app.services.github_service import find_user, get_repo
from app.services.subdomain_service import SubdomainService
from fastapi.responses import RedirectResponse

router = APIRouter()

templates = Jinja2Templates(directory=str(Path(__file__).resolve().parents[1] / "templates"))

@router.get("/projects")
def get_projects(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    repository = ProjectRepository(db)

    projects = repository.get_all_by_user(current_user.id)

    return templates.TemplateResponse(
        request=request,
        name="projects.html",
        context={
            "request": request,
            "projects": projects,
            "user": current_user,
        },
    )



@router.post("/projects/import")
def import_project(
    repo_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repository = ProjectRepository(db)

    headers = find_user(current_user.access_token)

    repo = get_repo(headers, repo_id)

    if repo is None:
        raise HTTPException(
            status_code=404,
            detail="Repository not found",
        )
    

    if repository.exists_by_repo_id(current_user.id, repo_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Repository already imported"
        )
    

    db_project = Project(
        user_id=current_user.id,
        repo_id=repo["id"],
        repo_name=repo["name"],
        repo_full_name=repo["full_name"],
        default_branch=repo["default_branch"],
        private=repo["private"],
        clone_url=repo["clone_url"],
    )

    subdomain_service = SubdomainService(repository)
    db_project.subdomain = subdomain_service.generate_subdomain(
        current_user.login, repo["name"]
    )

    repository.create(db_project)

    return RedirectResponse(
        url="/projects",
        status_code=303,
    )
    


@router.get("/projects/{project_id}")
def project_details(
    project_id:int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    repository = ProjectRepository(db)

    project = repository.get_by_id_and_user(
        project_id, current_user.id
    )


    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
    return templates.TemplateResponse(
        request=request,
        name="project.html",
        context={
            "request":request,
            "project": project
        }
    )
