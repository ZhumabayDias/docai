from pathlib import Path

from app.database import get_db
from app.repositories.user_repository import UserRepository

from fastapi.responses import RedirectResponse
from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.config import CLIENT_ID
from app.security import create_access_token, get_current_user

from app.services.github_service import (
    find_user,
    get_access_token,
    get_user,
)

templates = Jinja2Templates(directory=str(Path(__file__).resolve().parents[1] / "templates"))

router = APIRouter()


@router.get("/")
def root(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request},
    )


@router.get("/api/login/github")
@router.get("/login/github")
def github_login():
    url = f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}"

    return RedirectResponse(url)


@router.get("/api/auth/github/callback")
@router.get("/auth/github/callback")
def callback(code: str, db: Session = Depends(get_db)):
    try:
        token = get_access_token(code)
        headers = find_user(token)
        github_user = get_user(headers)
        repository = UserRepository(db)
        saved_user = repository.upsert_from_github(github_user, token)
        jwt_token = create_access_token(saved_user.id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    response = RedirectResponse(url="/dashboard", status_code=303)

    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        samesite="lax",
        path="/",
    )

    return response

