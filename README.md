# arc-tracker

A self-hosted habit tracker, built with FastAPI, SQLite and React. The interface is in French.

- **Monthly grid:** one box per habit and per day, grouped by category.
- **Today:** a short checklist for your phone, with a counter like `6/10`.
- **Habits:** add, rename, recategorize or delete them from the app. It starts with 10 default habits.

There is no login. Run it on your own machine or home network, not on the open internet.

## Run

Requires Python 3.12+ and Node.js 20+ (`brew install python@3.12 node`).

```bash
./start.sh
```

The first run installs everything. Then open http://localhost:8000, or the address it prints for your phone (same Wi-Fi). Data is stored in `arc.db`.

## Run with Docker

```bash
docker compose up -d --build
```

Then open http://localhost:8000. The data lives in the `arc-data` Docker volume (`/data/arc.db`).

## Develop

```bash
venv/bin/pip install -r requirements-dev.txt
venv/bin/uvicorn main:app --reload
```

Set `ARC_DB` to use another database file. To work on the front-end with hot reload, keep uvicorn running and start Vite in a second terminal:

```bash
cd frontend && npm run dev
```

Vite serves the app on http://localhost:5173 and forwards `/api` calls to uvicorn.

## Tests

```bash
venv/bin/python -m pytest
```

GitHub Actions runs the tests and builds the Docker image on every push.

## API

Interactive docs at `/docs`.

| Method | Path | Does |
| --- | --- | --- |
| GET | `/api/habits` | List habits |
| POST | `/api/habits` | Create a habit `{name, category}` |
| PUT | `/api/habits/{id}` | Rename or change category |
| DELETE | `/api/habits/{id}` | Delete a habit and its history |
| GET | `/api/entries?start=YYYY-MM-DD&end=YYYY-MM-DD` | Checked days in a range |
| PUT | `/api/habits/{id}/days/{YYYY-MM-DD}` | Check a day |
| DELETE | `/api/habits/{id}/days/{YYYY-MM-DD}` | Uncheck a day |

## License

MIT, see [LICENSE](LICENSE).
