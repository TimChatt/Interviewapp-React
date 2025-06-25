# Interviewapp Monorepo

This repository contains both the React frontend and FastAPI backend for the Interview Analysis application.

- `client/` – React application originally from `Interviewapp-React`.
- `server/` – FastAPI backend originally from `InterviewappBE`.

Each directory retains its own dependencies and deployment configuration.

## Docker Deployment

The provided `Dockerfile` builds the React frontend and serves it alongside the
FastAPI backend. Railway reads `railway.json` to build and start the container.

```bash
docker build -t interviewapp .
docker run -p 8000:8000 interviewapp
```

## Troubleshooting 502 Errors

If you see `502 Bad Gateway` responses for `/` or `favicon.ico` after deployment,
ensure the backend is binding to `0.0.0.0` and that the built React files are
mounted correctly:

1. **Server Host** – the start script runs:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

   Confirm your process manager executes this command.

2. **Static Files** – `server/main.py` mounts the `client_build` directory using
   FastAPI's `StaticFiles` so that `/` returns `index.html` from the React build.
