from fastapi import FastAPI
from api.routes import user, board, column, item

app = FastAPI()

app.include_router(user.router, tags=["User"])
app.include_router(board.router, tags=["Board"])
app.include_router(column.router, tags=["Column"])
app.include_router(item.router, tags=["Item"])
