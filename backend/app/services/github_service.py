import httpx

from app.config import CLIENT_ID, CLIENT_SECRET
from app.schemas.user import GitHubProfileResponse, UserResponse



def get_access_token(code: str) -> str:
    response = httpx.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
        },
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    return payload["access_token"]


def find_user(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def get_user(headers: dict[str, str]) -> UserResponse:
    profile = get_profile(headers)

    return UserResponse(
        github_id=profile.github_id,
        login=profile.login,
        avatar_url=profile.avatar_url,
    )


def get_profile(headers: dict[str, str]) -> GitHubProfileResponse:
    response = httpx.get(
        "https://api.github.com/user",
        headers=headers,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    return GitHubProfileResponse(
        github_id=data["id"],
        login=data["login"],
        avatar_url=data["avatar_url"],
        name=data.get("name"),
        bio=data.get("bio"),
        company=data.get("company"),
        location=data.get("location"),
        blog=data.get("blog"),
        followers=data.get("followers"),
        following=data.get("following"),
        public_repos=data.get("public_repos"),
        created_at=data.get("created_at"),
        html_url=data.get("html_url"),
        type=data.get("type"),
        site_admin=data.get("site_admin"),
    )


def get_repos(headers: dict[str, str]):
    response = httpx.get(
        "https://api.github.com/user/repos",
        headers=headers,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def get_repo(headers: dict[str, str], repo_id:int):
    repos = get_repos(headers)

    for repo in repos:
        if repo["id"] == repo_id:
            return repo
        
    return None
