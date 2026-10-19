import datetime
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

import db
from models import HabitIn


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init()
    yield


app = FastAPI(lifespan=lifespan)
DB = Annotated[sqlite3.Connection, Depends(db.get)]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/habits")
def list_habits(conn: DB):
    return [dict(row) for row in conn.execute("SELECT id, name, category FROM habits ORDER BY id")]


@app.post("/api/habits", status_code=201)
def create_habit(habit: HabitIn, conn: DB):
    with conn:
        cur = conn.execute(
            "INSERT INTO habits (name, category) VALUES (?, ?)", (habit.name, habit.category)
        )
    return {"id": cur.lastrowid, **habit.model_dump()}


@app.put("/api/habits/{habit_id}")
def update_habit(habit_id: int, habit: HabitIn, conn: DB):
    with conn:
        cur = conn.execute(
            "UPDATE habits SET name = ?, category = ? WHERE id = ?",
            (habit.name, habit.category, habit_id),
        )
    if cur.rowcount == 0:
        raise HTTPException(404, "Habitude introuvable")
    return {"id": habit_id, **habit.model_dump()}


@app.delete("/api/habits/{habit_id}", status_code=204)
def delete_habit(habit_id: int, conn: DB):
    with conn:
        cur = conn.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    if cur.rowcount == 0:
        raise HTTPException(404, "Habitude introuvable")


@app.get("/api/entries")
def list_entries(start: datetime.date, end: datetime.date, conn: DB):
    rows = conn.execute(
        "SELECT habit_id, date FROM entries WHERE date BETWEEN ? AND ?",
        (start.isoformat(), end.isoformat()),
    )
    return [dict(row) for row in rows]


# The client decides which day is "today": the server may run in another time zone.
@app.put("/api/habits/{habit_id}/days/{day}", status_code=204)
def check_day(habit_id: int, day: datetime.date, conn: DB):
    try:
        with conn:
            conn.execute(
                "INSERT OR IGNORE INTO entries (habit_id, date) VALUES (?, ?)",
                (habit_id, day.isoformat()),
            )
    except sqlite3.IntegrityError:
        raise HTTPException(404, "Habitude introuvable")


@app.delete("/api/habits/{habit_id}/days/{day}", status_code=204)
def uncheck_day(habit_id: int, day: datetime.date, conn: DB):
    with conn:
        conn.execute(
            "DELETE FROM entries WHERE habit_id = ? AND date = ?", (habit_id, day.isoformat())
        )


# Built React app (frontend/dist). Mounted last so it does not shadow the API.
FRONTEND = Path(__file__).parent / "frontend" / "dist"
if FRONTEND.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")
