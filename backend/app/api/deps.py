import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.api.models.orm.user import User
from app.api.models.orm.token_blacklist import TokenBlacklist

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)



def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    jti: str = payload.get("jti")
    if jti and db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first():
        raise credentials_exception

    raw_sub: str = payload.get("sub")
    if raw_sub is None:
        raise credentials_exception

    try:
        user_id = uuid.UUID(raw_sub)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> User | None:
    if not token:
        return None
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None