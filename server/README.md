# InterviewappBE

This project is a FastAPI backend that integrates with the Ashby hiring platform and OpenAI. Data is stored in a PostgreSQL database using SQLAlchemy and Alembic for migrations.

## Key Components
- **main.py** – core FastAPI application; registers routers and schedules background sync tasks.
- **ashbyapi.py** – helper utilities and router for syncing data from Ashby.
- **routers/** – smaller routers for user and policy management.
- **models.py** – SQLAlchemy models.
- **deps.py** – shared database engine/session and admin utilities.

## Development
1. Install dependencies from `requirements.txt`.
2. Set environment variables for `DATABASE_URL`, `ASHBY_API_KEY`, and `OPENAI_API_KEY`.
3. Run `uvicorn main:app` to start the API server.
4. Optional: run `python -m py_compile $(git ls-files '*.py')` to verify syntax.
