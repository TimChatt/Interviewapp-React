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
