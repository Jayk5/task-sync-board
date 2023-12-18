from fastapi import Depends, HTTPException, APIRouter, WebSocket, WebSocketDisconnect
from sqlite3 import Connection
from helper.db_helper import get_db
from models import BoardInput

router = APIRouter()

connected_users = {}


@router.websocket("/ws/boards/{board_id}")
async def websocket_get_one_board(websocket: WebSocket, board_id: str, db: Connection = Depends(get_db)):
    await websocket.accept()
    client = {"websocket": websocket, "board_id": board_id}
    if board_id in connected_users:
        connected_users[board_id].append(client)
    else:
        connected_users[board_id] = [client]
    try:
        while True:
            message = await websocket.receive_text()
            print(message)
    except WebSocketDisconnect:
        pass
    finally:
        connected_users[board_id].remove(client)
        if len(connected_users[board_id]) == 0:
            del connected_users[board_id]


async def broadcast_to_board_clients(board_id: str, message: dict):
    for client in connected_users[board_id]:
        await client["websocket"].send_json(message)
