
from app.models.user import User

class UserRepository:
    def __init__(self, db):
        self.db = db

    def create(self, user: User):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all(self):
        return self.db.query(User).order_by(User.id.desc()).all()

    def get_by_github_id(self, github_id: int):
        return self.db.query(User).filter(User.github_id == github_id).first()

    def upsert_from_github(self, github_user, access_token: str):
        user = self.get_by_github_id(github_user.github_id)

        if user is None:
            user = User(
                github_id=github_user.github_id,
                login=github_user.login,
                avatar_url=github_user.avatar_url,
                access_token=access_token,
            )
            self.db.add(user)
        else:
            user.login = github_user.login
            user.avatar_url = github_user.avatar_url
            user.access_token = access_token

        self.db.commit()
        self.db.refresh(user)
        return user
    
