from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.security import get_current_user
from app.services.deployment_failure import DeploymentFailure
from app.services.deploy_service import DeployService

router = APIRouter()

@router.post("/projects/{project_id}/deploy")
def deploy_project(
    project_id:int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repository = ProjectRepository(db)

    project = repository.get_by_id_and_user(
        project_id,
        current_user.id
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    
    service = DeployService(repository)

    try:
        service.deploy(project)
    except DeploymentFailure as failure:
        raise HTTPException(
            status_code=failure.http_status_code,
            detail={
                "code": failure.code.value,
                "message": failure.message,
            },
        ) from failure

    return {
        "status": project.status
    }
