from typing import Any
import sqlite3
from sqlite3 import Connection

DATABASE_NAME = "database.db"
DATABASE_URL = f"sqlite:///{DATABASE_NAME}"

def init_and_get_db() -> Any:
    db = sqlite3.connect(DATABASE_NAME)
    cursor = db.cursor()
    # cursor.execute(
    #     "DROP TABLE IF EXISTS users;"
    # )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        );
        """
    )
    db.commit()
    return db