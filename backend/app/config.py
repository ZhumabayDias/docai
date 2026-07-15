from dotenv import load_dotenv
import os

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEPLOYMENTS_DIR = BASE_DIR / "deployments"

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

DEPLOYMENT_BASE_URL = os.getenv("DEPLOYMENT_BASE_URL", "http://127.0.0.1")
DEPLOYMENT_PORT_START = int(os.getenv("DEPLOYMENT_PORT_START", "9000"))
DEPLOYMENT_PORT_END = int(os.getenv("DEPLOYMENT_PORT_END", "9999"))

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

SECRET_KEY = os.getenv("SECRET_KEY", "very_secure_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

DEPLOYMENT_ENGINE_ENABLED = (
    os.getenv("DEPLOYMENT_ENGINE_ENABLED", "false").strip().lower()
    in {"1", "true", "yes", "on"}
)

