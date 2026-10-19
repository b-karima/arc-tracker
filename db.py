import os
import sqlite3

DB_PATH = os.environ.get("ARC_DB", "arc.db")

SCHEMA = """
CREATE TABLE habits (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT ''
);
CREATE TABLE entries (
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    PRIMARY KEY (habit_id, date)
);
CREATE INDEX entries_date ON entries(date);
"""

DEFAULT_HABITS = [
    ("Boire de l'eau", "Santé"),
    ("Sport", "Santé"),
    ("Manger sain", "Santé"),
    ("Dormir 8 h", "Santé"),
    ("Lire", "Esprit"),
    ("Méditer", "Esprit"),
    ("Journal", "Esprit"),
    ("Pas de réseaux sociaux", "Esprit"),
    ("Être productive", "Travail"),
    ("Skin care", "Soin"),
]


def connect() -> sqlite3.Connection:
    # FastAPI opens, uses and closes a request's connection in different threads,
    # one after the other. The connection is never shared between requests.
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init() -> None:
    """Create the schema and default habits on first run only.

    user_version marks the database as set up, so habits the user deletes
    do not come back on the next restart.
    """
    conn = connect()
    try:
        if conn.execute("PRAGMA user_version").fetchone()[0] == 0:
            with conn:
                conn.executescript(SCHEMA)
                conn.executemany("INSERT INTO habits (name, category) VALUES (?, ?)", DEFAULT_HABITS)
                conn.execute("PRAGMA user_version = 1")
    finally:
        conn.close()


def get():
    """FastAPI dependency: one connection per request."""
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()
