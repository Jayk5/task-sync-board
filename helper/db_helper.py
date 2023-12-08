from sqlite3 import Connection
from database import init_and_get_db


def get_db() -> Connection:
    db = init_and_get_db()
    try:
        yield db
    finally:
        db.close()
