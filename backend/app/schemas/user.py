from pydantic import BaseModel, ConfigDict

class UserResponse(BaseModel):
    github_id: int
    login:str
    avatar_url:str


class GitHubProfileResponse(BaseModel):
    github_id: int
    login: str
    avatar_url: str
    name: str | None = None
    bio: str | None = None
    company: str | None = None
    location: str | None = None
    blog: str | None = None
    followers: int | None = None
    following: int | None = None
    public_repos: int | None = None
    created_at: str | None = None
    html_url: str | None = None
    type: str | None = None
    site_admin: bool | None = None


class CurrentUserResponse(BaseModel):
    id: int
    login: str
    avatar_url: str | None

    model_config = ConfigDict(from_attributes=True)
