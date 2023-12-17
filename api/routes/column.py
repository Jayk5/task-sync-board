from fastapi import Depends, HTTPException, APIRouter
from sqlite3 import Connection
from uuid import uuid4
from helper.auth_helper import get_user_from_token
from helper.db_helper import get_db
from models import ColumnInput

router = APIRouter()


@router.post("/boards/addcol/{board_id}")
def add_column_in_board(board_id: str, column_input: ColumnInput, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, title FROM boards
        WHERE id = ?;
        """,
        (board_id,)
    )
    board = cursor.fetchone()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found.")
    cursor.execute(
        """
        SELECT position FROM columns
        WHERE board_id = ?
        ORDER BY position DESC;
        """,
        (board_id,)
    )
    last_position = cursor.fetchone()
    position = last_position[0] + 1
    cursor.execute(
        """
        INSERT INTO columns (id, board_id, title, position)
        VALUES (?, ?, ?, ?);
        """,
        (str(uuid4())[:10], board_id, column_input.title, position)
    )
    db.commit()
    return {"message": "Column added successfully."}


@router.delete("/boards/delcol/{column_id}")
def delete_column(column_id: str, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, title FROM columns
        WHERE id = ?;
        """,
        (column_id,)
    )
    column = cursor.fetchone()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found.")
    cursor.execute(
        """
        DELETE FROM columns
        WHERE id = ?;
        """,
        (column_id,)
    )
    cursor.execute(
        """
        DELETE FROM items
        WHERE column_id = ?;
        """,
        (column_id,)
    )
    db.commit()
    return {"message": "Column deleted successfully."}
