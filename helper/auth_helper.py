from fastapi import HTTPException, Header
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "secret"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict) -> str:
    expiration = datetime.utcnow() + timedelta(minutes=600)
    to_encode = {"exp": expiration, **data}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> str:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid access token.")


def get_user_from_token(authorization: str = Header(...)) -> str:
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid scheme.")
        user = verify_access_token(token)
        return user["id"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid access token.")
