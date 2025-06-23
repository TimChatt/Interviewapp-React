# Build React client
FROM node:18 AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

# Build Python backend and final image
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY server/ ./

# Copy built frontend
COPY --from=client-build /client/build ./client_build

# Copy start script
COPY start.sh ./

EXPOSE 8000
CMD ["./start.sh"]
