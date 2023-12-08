from fastapi import Depends, HTTPException, APIRouter
from sqlite3 import Connection
from uuid import uuid4
from helper.auth_helper import get_user_from_token
from helper.db_helper import get_db
from models import BoardInput

router = APIRouter()


@router.post("/boards")
def post_new_board(board_input: BoardInput, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    board_id = str(uuid4())[:10]
    # Add the board
    cursor.execute(
        """
        INSERT INTO boards (id, title, created_by)
        VALUES (?, ?, ?);
        """,
        (board_id, board_input.title, current_user)
    )
    # Add the default columns
    cursor.execute(
        """
        INSERT INTO columns (id, board_id, title, position)
        VALUES (?, ?, ?, ?);
        """,
        (str(uuid4())[:10], board_id, "To Do", 0)
    )
    cursor.execute(
        """
        INSERT INTO columns (id, board_id, title, position)
        VALUES (?, ?, ?, ?);
        """,
        (str(uuid4())[:10], board_id, "In Progress", 1)
    )
    cursor.execute(
        """
        INSERT INTO columns (id, board_id, title, position)
        VALUES (?, ?, ?, ?);
        """,
        (str(uuid4())[:10], board_id, "Done", 2)
    )
    db.commit()
    return {"id": board_id, "message": "Board created successfully."}


@router.get("/boards")
def get_boards(current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, title FROM boards
        WHERE created_by = ?;
        """,
        (current_user,)
    )
    boards = cursor.fetchall()
    cols = ["id", "title"]
    boards = [dict(zip(cols, board)) for board in boards]
    return {"boards": boards}


@router.get("/boards/{board_id}")
def get_one_board(current_user: str = Depends(get_user_from_token), board_id: str = None, db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, title FROM boards
        WHERE id = ? AND created_by = ?;
        """,
        (board_id, current_user)
    )
    board = cursor.fetchone()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found.")
    cols = ["id", "title"]
    cursor.execute(
        """
        SELECT id, title, position FROM columns
        WHERE board_id = ?
        ORDER BY position;
        """,
        (board_id,)
    )
    columns = cursor.fetchall()
    cols = ["id", "title", "position"]
    columns = [dict(zip(cols, column)) for column in columns]
    for column in columns:
        cursor.execute(
            """
            SELECT id, title, description, position FROM items
            WHERE column_id = ?
            ORDER BY position;
            """,
            (column["id"],)
        )
        items = cursor.fetchall()
        cols = ["id", "title", "description", "position"]
        column["items"] = [dict(zip(cols, item)) for item in items]
    return {"board": dict(zip(cols, board)), "columns": columns}
