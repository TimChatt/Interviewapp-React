# 🟢 Build React client
FROM node:18 AS client-build
WORKDIR /client

# Copy the client package.json + lock file
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Copy rest of client code
COPY client/ ./

# Build React app
RUN npm run build

# 🟢 Backend
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
COPY server/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copy backend code
COPY server/ ./

# Mount static frontend
COPY --from=client-build /client/build ./client_build

# Start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose and run
EXPOSE 8000
CMD ["./start.sh"]
