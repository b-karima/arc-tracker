import datetime
from pydantic import BaseModel
from typing import Optional


class HabitCreate(BaseModel):
    name: str
    category: str


class EntryCreate(BaseModel):
    habit_id: int
    date: datetime.date
    completed: bool = True
    note: Optional[str] = None
