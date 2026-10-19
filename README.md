# arc-tracker

A self-hosted habit tracker, built with FastAPI, SQLite and React. The interface is in French.

- **Monthly grid:** one box per habit and per day, grouped by category.
- **Today:** a short checklist for your phone, with a counter like `6/10`.
- **Habits:** add, rename, recategorize or delete them from the app. It starts with 10 default habits.

There is no login. Run it on your own machine or home network, not on the open internet.

## Run with Docker

```bash
docker compose up -d --build
```

Then open http://localhost:8000. The data lives in the `arc-data` Docker volume (`/data/arc.db`).

## Run locally

Requires Python 3.12+ and Node.js 20+.

```bash
git clone git@github.com:b-karima/arc-tracker.git
cd arc-tracker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
(cd frontend && npm install && npm run build)
uvicorn main:app --reload
```

Then open http://127.0.0.1:8000. Data is stored in `arc.db`; set `ARC_DB` to use another file.

To work on the front-end with hot reload, keep uvicorn running and start Vite in a second terminal:

```bash
cd frontend && npm run dev
```

Vite serves the app on http://localhost:5173 and forwards `/api` calls to uvicorn.

## Tests

```bash
python -m pytest
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
