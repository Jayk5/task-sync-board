from fastapi import FastAPI, Depends, HTTPException, Header
from sqlite3 import Connection
from uuid import uuid4
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database import init_and_get_db
from models import UserInput

app = FastAPI()

SECRET_KEY = "secret"
ALGORITHM = "HS256"

def get_db() -> Connection:
    db = init_and_get_db()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict) -> str:
    expiration = datetime.utcnow() + timedelta(minutes=60)
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

@app.post("/register")
def register_user(user: UserInput, db: Connection = Depends(get_db)):
    cursor = db.cursor()
    user_id = str(uuid4())[:8]
    hashed_password = hash_password(user.password)
    try:
        cursor.execute(
            """
            INSERT INTO users (id, username, password)
            VALUES (?, ?, ?);
            """,
            (user_id, user.username, hashed_password)
        )
    except Exception:
        raise HTTPException(status_code=409, detail="User already exists.")
    db.commit()
    token = create_access_token({"id": user_id, "username": user.username})
    return {"id": user_id, "message": "User created successfully.", "access_token": token, "token_type": "bearer"}

@app.post("/token")
def login_user(user: UserInput, db: Connection = Depends(get_db)):
    cursor = db.cursor()
    print(user.username, user.password)
    cursor.execute(
        """
        SELECT id, password FROM users
        WHERE username = ?;
        """,
        (user.username,)
    )
    user_data = cursor.fetchone()
    if user_data and verify_password(user.password, user_data[1]):
        token = create_access_token({"id": user_data[0], "username": user.username})
        return {"id": user_data[0], "message": "Login successful.", "access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Incorrect username or password.")
    
@app.get("/users/me")
def get_user(current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT * FROM users
        WHERE id = ?;
        """,
        (current_user,)
    )
    user = cursor.fetchone()
    cols = ["id", "username", "password"]
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"details": dict(zip(cols, user))}
    
@app.get("/users")
def get_all_users(db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT username FROM users;
        """
    )
    users = cursor.fetchall()
    return {"users": users}
