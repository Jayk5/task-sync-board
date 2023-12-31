from fastapi import Depends, HTTPException, APIRouter, WebSocket, WebSocketDisconnect
from sqlite3 import Connection
from uuid import uuid4
from models import ItemInput
from helper.auth_helper import get_user_from_token
from helper.db_helper import get_db
from api.routes.sockets import broadcast_to_board_clients

router = APIRouter()


@router.post('/boards/{board_id}/{column_id}')
async def add_item_in_column(item_input: ItemInput, board_id: str, column_id: str, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
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
    if last_position is None:
        position = 0
    else:
        position = last_position[0] + 1
    cursor.execute(
        """
        INSERT INTO items (id, column_id, title, description, position, created_by)
        VALUES (?, ?, ?, ?, ?, ?);
        """,
        (str(uuid4())[:10], column_id, item_input.title,
         item_input.description, position, current_user)
    )
    db.commit()
    message = {"type": "update", "board_id": board_id}
    await broadcast_to_board_clients(board_id, message)
    return {"message": "Item added successfully."}


@router.delete('/item/{item_id}')
async def delete_item(item_id: str, current_user: str = Depends(get_user_from_token), db: Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, created_by, column_id FROM items
        WHERE id = ?;
        """,
        (item_id,)
    )
    item = cursor.fetchone()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    # Uncomment this if you want to restrict users from deleting other users' items.
    # TODO: Add this feature in the frontend before uncommenting.

    # if item[1] != current_user:
    #     raise HTTPException(
    #         status_code=401, detail="You are not authorized to delete this item.")
    cursor.execute(
        """
        DELETE FROM items
        WHERE id = ?;
        """,
        (item_id,)
    )
    cursor.execute(
        """
        SELECT id, board_id FROM columns
        WHERE id = ?;
        """,
        (item[2],)
    )
    column = cursor.fetchone()
    board_id = column[1]
    db.commit()
    message = {"type": "update", "board_id": board_id}
    await broadcast_to_board_clients(board_id, message)
    return {"message": "Item deleted successfully."}
