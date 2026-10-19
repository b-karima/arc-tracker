import pytest
from fastapi.testclient import TestClient

import db
import main


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", str(tmp_path / "test.db"))
    with TestClient(main.app) as c:
        yield c


def test_default_habits_are_seeded_once(client):
    habits = client.get("/api/habits").json()
    assert len(habits) == 10
    for h in habits:
        client.delete(f"/api/habits/{h['id']}")

    with TestClient(main.app) as restarted:  # same database, app starts again
        assert restarted.get("/api/habits").json() == []


def test_check_and_uncheck_a_day(client):
    url = "/api/habits/1/days/2026-10-17"
    assert client.put(url).status_code == 204
    assert client.put(url).status_code == 204  # checking twice is harmless

    entries = client.get("/api/entries?start=2026-10-01&end=2026-10-31").json()
    assert entries == [{"habit_id": 1, "date": "2026-10-17"}]
    assert client.get("/api/entries?start=2026-11-01&end=2026-11-30").json() == []

    assert client.delete(url).status_code == 204
    assert client.get("/api/entries?start=2026-10-01&end=2026-10-31").json() == []


def test_deleting_a_habit_deletes_its_days(client):
    client.put("/api/habits/1/days/2026-10-17")
    client.delete("/api/habits/1")
    assert client.get("/api/entries?start=2026-10-01&end=2026-10-31").json() == []


def test_unknown_habit_or_bad_input_is_refused(client):
    assert client.put("/api/habits/999/days/2026-10-17").status_code == 404
    assert client.put("/api/habits/1/days/2026-02-30").status_code == 422
    assert client.post("/api/habits", json={"name": "   "}).status_code == 422
    assert client.put("/api/habits/999", json={"name": "x"}).status_code == 404


def test_create_and_rename_habit(client):
    created = client.post("/api/habits", json={"name": " Python 1 h ", "category": "Tech"}).json()
    assert created["name"] == "Python 1 h"
    renamed = client.put(f"/api/habits/{created['id']}", json={"name": "Python 2 h", "category": "Tech"})
    assert renamed.json()["name"] == "Python 2 h"
