from fastapi import Depends, HTTPException, APIRouter
from sqlite3 import Connection
from uuid import uuid4
from models import ItemInput
from helper.auth_helper import get_user_from_token
from helper.db_helper import get_db

router = APIRouter()


@router.post('/boards/{board_id}/{column_id}')
def add_item_in_column(item: ItemInput, board_id: str, column_id: str, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
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
    cursor.execute(
        """
        SELECT id, title FROM columns
        WHERE id = ? AND board_id = ?;
        """,
        (column_id, board_id)
    )
    column = cursor.fetchone()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found.")
    cursor.execute(
        """
        SELECT position FROM items
        WHERE column_id = ?
        ORDER BY position DESC;
        """,
        (column_id,)
    )
    last_position = cursor.fetchone()
    position = last_position[0] + 1
    cursor.execute(
        """
        INSERT INTO items (id, column_id, title, description, position, created_by)
        VALUES (?, ?, ?, ?, ?, ?);
        """,
        (str(uuid4())[:10], column_id, item.title,
         item.description, position, current_user)
    )
    db.commit()
    return {"message": "Item added successfully."}


@router.delete('/boards/{item_id}')
def delete_item(item_id: str, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, created_by FROM items
        WHERE id = ?;
        """,
        (item_id,)
    )
    item = cursor.fetchone()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    if item[1] != current_user:
        raise HTTPException(
            status_code=401, detail="You are not authorized to delete this item.")
    cursor.execute(
        """
        DELETE FROM items
        WHERE id = ?;
        """,
        (item_id,)
    )
    db.commit()
    return {"message": "Item deleted successfully."}
