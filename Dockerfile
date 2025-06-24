# 🟢 Build React client
FROM node:18 AS client-build
WORKDIR /client

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Copy the rest of the client code and build it
COPY client/ ./
RUN npm run build

# 🟢 Build Python backend and final image
FROM python:3.11-slim

# Install system dependencies for psycopg2 and other packages
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Python env setup
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
COPY server/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copy backend code
COPY server/ ./

# Copy built frontend into backend folder
# ✅ Make sure comment is ABOVE the instruction
# Copies the full built React client into the backend's /client_build
COPY --from=client-build /client/build ./client_build

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port and run app
EXPOSE 8000
CMD ["./start.sh"]
