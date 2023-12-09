import sqlite3
from sqlite3 import Connection

DATABASE_NAME = "database.db"
DATABASE_URL = f"sqlite:///{DATABASE_NAME}"


def init_and_get_db() -> Connection:
    db = sqlite3.connect(DATABASE_NAME, check_same_thread=False)
    cursor = db.cursor()

    # TODO - find better alternative for this
    # cursor.execute(
    #     "DROP TABLE IF EXISTS users;"
    # )
    # cursor.execute(
    #     "DROP TABLE IF EXISTS boards;"
    # )
    # cursor.execute(
    #     "DROP TABLE IF EXISTS columns;"
    # )
    # cursor.execute(
    #     "DROP TABLE IF EXISTS items;"
    # )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(8) PRIMARY KEY,
            username VARCHAR(30) UNIQUE NOT NULL,
            password VARCHAR(30) NOT NULL
        );
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS boards (
            id VARCHAR(10) PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            created_by VARCHAR(8) NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users (id)
        );
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS columns (
            id VARCHAR(10) PRIMARY KEY,
            board_id VARCHAR(10) NOT NULL,
            title VARCHAR(50) NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (board_id) REFERENCES boards (id)
        );
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id VARCHAR(10) PRIMARY KEY,
            column_id VARCHAR(10) NOT NULL,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            position INTEGER NOT NULL,
            created_by VARCHAR(10) NOT NULL,
            FOREIGN KEY (column_id) REFERENCES columns (id),
            FOREIGN KEY (created_by) REFERENCES users (id)
        );
        """
    )
    db.commit()
    return db
