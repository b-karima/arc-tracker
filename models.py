from datetime import date
from pydantic import BaseModel
from typing import Optional


class EntryCreate(BaseModel):
    habit_id: int
    date: date
    completed: bool = True
    note: Optional[str] = None

class HabitCreate(BaseModel):
    name: str
    category: str
    