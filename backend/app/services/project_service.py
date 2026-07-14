from fastapi import HTTPException, status

from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.services.github_service import find_user, get_repo, get_repos
from app.schemas.project import GitHubRepositoryResponse


class ProjectService:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository

    def get_github_repositories(self, current_user: User) -> list[GitHubRepositoryResponse]:
        headers = find_user(current_user.access_token)
        repos = get_repos(headers)

        imported_repo_ids = {
            project.repo_id
            for project in self.repository.get_all_by_user(current_user.id)
            if project.repo_id is not None
        }

        return [
            GitHubRepositoryResponse(
                id=repo["id"],
                name=repo["name"],
                private=repo["private"],
                default_branch=repo["default_branch"],
            )
            for repo in repos
            if repo["id"] not in imported_repo_ids
        ]

    def import_from_github(self, repo_id: int, current_user: User) -> Project:
        headers = find_user(current_user.access_token)
        repo = get_repo(headers, repo_id)

        if repo is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found",
            )

        if self.repository.exists_by_repo_id(current_user.id, repo_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Repository already imported",
            )

        project = Project(
            user_id=current_user.id,
            repo_id=repo["id"],
            repo_name=repo["name"],
            repo_full_name=repo["full_name"],
            default_branch=repo["default_branch"],
            private=repo["private"],
            clone_url=repo["clone_url"],
        )

        return self.repository.create(project)
