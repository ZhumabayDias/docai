from datetime import datetime, timedelta, UTC

from fastapi import HTTPException, status, Depends, Request

from sqlalchemy.orm import Session

from jose import jwt, JWTError

from app.models.user import User
from app.database import get_db

from app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM


def create_access_token(user_id:int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        return int(user_id )
    
    except JWTError:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
   
   token = request.cookies.get("access_token")

   if token is None:
       raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
       )
   
   
   user_id = verify_access_token(token)

   user = db.get(User, user_id)

   if user is None:
       raise HTTPException(
           status_code=status.HTTP_401_UNAUTHORIZED,
           detail="User not found",

       )
   
   return user

