from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import user, board, column, item

app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(user.router, tags=["User"])
app.include_router(board.router, tags=["Board"])
app.include_router(column.router, tags=["Column"])
app.include_router(item.router, tags=["Item"])
