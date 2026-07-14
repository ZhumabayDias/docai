from pathlib import Path

from app.database import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.user import CurrentUserResponse, GitHubProfileResponse
from sqlalchemy.orm import Session
from fastapi import Depends, APIRouter, Request, Response

from fastapi.responses import RedirectResponse

from app.models.user import User
from app.security import get_current_user

from fastapi.templating import Jinja2Templates
from app.services.github_service import find_user, get_profile, get_repos

router = APIRouter()

templates = Jinja2Templates(directory=str(Path(__file__).resolve().parents[1] / "templates"))

@router.get("/api/me", response_model=CurrentUserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/api/profile", response_model=GitHubProfileResponse)
def profile_api(current_user: User = Depends(get_current_user)):
    headers = find_user(current_user.access_token)
    return get_profile(headers)


@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    repository = UserRepository(db)
    users = repository.get_all()
    return [
        {
            "id": user.id,
            "github_id": user.github_id,
            "login": user.login,
            "avatar_url": user.avatar_url,
        }
        for user in users
    ]


@router.get("/profile")
def profile(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    headers = find_user(current_user.access_token)
    repos = get_repos(headers)

    return templates.TemplateResponse(
        request=request,
        name="profile.html",
        context={
            "request": request,
            "user": current_user,
            "repos": repos,
        },
    )

@router.post("/api/logout", status_code=204)
@router.post("/logout", status_code=204)
def logout():
    response = Response(status_code=204)

    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        path="/",
    )

    return response
