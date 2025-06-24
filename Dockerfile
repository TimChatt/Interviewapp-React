# Build React client
FROM node:18 AS client-build
WORKDIR /client
COPY client/ ./                # ✅ Copies the full client directory including package.json and source files
RUN npm install
RUN npm run build

# Build Python backend and final image
FROM python:3.11-slim

# 🟢 Install system dependencies needed by psycopg2 and others
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY server/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copy backend code
COPY server/ ./

# Copy built frontend
COPY --from=client-build /client/build ./client_build

# Copy start script
COPY start.sh ./

EXPOSE 8000
CMD ["./start.sh"]
