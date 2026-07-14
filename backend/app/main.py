from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS
from app.database import Base, engine
from app.routes import api_projects, auth, deploy, projects, users

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(deploy.router)
app.include_router(api_projects.router)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

Base.metadata.create_all(bind=engine)
