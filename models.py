import datetime
from pydantic import BaseModel


class HabitCreate(BaseModel):
    name: str
    category: str


class EntryCreate(BaseModel):
    habit_id: int
    date: datetime.date
    completed: bool = True
    note: str | None = None
