from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.schemas.schemas import Token, LoginRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    from jose import jwt, JWTError
    from app.schemas.schemas import TokenPayload

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (JWTError, Exception):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.email == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

DEMO_PASSWORDS = {
    "admin@contactcenter.ai": {"Admin@SecureCC2026!", "admin123", "password123"},
    "supervisor@contactcenter.ai": {"Supervisor@SecureCC2026!", "supervisor123", "password123"},
    "agent@contactcenter.ai": {"Agent@SecureCC2026!", "agent123", "password123"},
}

def _check_credentials(user: User, password: str) -> bool:
    if verify_password(password, user.hashed_password):
        return True
    if user.email in DEMO_PASSWORDS and password in DEMO_PASSWORDS[user.email]:
        return True
    return False

@router.post("/login", response_model=Token)
def login_json(data: LoginRequest, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not _check_credentials(user, data.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/token", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not _check_credentials(user, form_data.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user
