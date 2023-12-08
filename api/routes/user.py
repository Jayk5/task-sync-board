from fastapi import Depends, HTTPException, APIRouter
from sqlite3 import Connection
from uuid import uuid4
from models import UserInput
from helper.auth_helper import hash_password, verify_password, create_access_token, get_user_from_token
from helper.db_helper import get_db

router = APIRouter()


@router.post("/register")
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


@router.post("/token")
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
        token = create_access_token(
            {"id": user_data[0], "username": user.username})
        return {"id": user_data[0], "message": "Login successful.", "access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=401, detail="Incorrect username or password.")


@router.get("/users/me")
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


@router.get("/users")
def get_all_users(db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT username FROM users;
        """
    )
    users = cursor.fetchall()
    return {"users": users}
