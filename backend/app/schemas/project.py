from datetime import datetime
from typing import Optional
from pydantic import ConfigDict
from pydantic import BaseModel

class ProjectCreate(BaseModel):
    repo_id: int
    repo_name: str
    repo_full_name: str
    default_branch: str
    private: bool
    clone_url: str


class ProjectImportRequest(BaseModel):
    repo_id: int


class GitHubRepositoryResponse(BaseModel):
    id: int
    name: str
    private: bool
    default_branch: str


class ProjectResponse(BaseModel):
    id: int 
    repo_name: str
    status: str
    created_at: datetime
    deployment_url: Optional[str] = None
    subdomain: Optional[str] = None

    model_config = ConfigDict(from_attributes=True )


class ProjectDetailResponse(BaseModel):
    id:int
    repo_name:str
    repo_full_name: str
    clone_url:str
    default_branch:str
    private: bool
    status: str
    deployment_url: Optional[str] = None
    subdomain: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
