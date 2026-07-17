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

# Base domain used to build the public https://{subdomain}.{DEPLOYMENT_SUBDOMAIN_BASE}
# deployment URL (see app.services.subdomain_service). This PR only prepares the
# backend for subdomain-based URLs; it does NOT configure DNS/Nginx/wildcard
# routing for this domain yet (that is PR-2).
DEPLOYMENT_SUBDOMAIN_BASE = os.getenv("DEPLOYMENT_SUBDOMAIN_BASE", "docai.site")

# IPs allowed to call the internal /internal/routing/resolve endpoint (see
# app.routes.routing). This endpoint is only ever meant to be called by the
# platform's own Nginx via `auth_request`, never by end users, so it is
# additionally locked down to a small trusted-caller allowlist regardless of
# whether it happens to be reachable on the network.
ROUTING_TRUSTED_PROXY_IPS = {
    ip.strip()
    for ip in os.getenv("ROUTING_TRUSTED_PROXY_IPS", "127.0.0.1,::1").split(",")
    if ip.strip()
}

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

