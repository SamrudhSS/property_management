# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# --- Stage 2: Python Backend & Final Image ---
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY data /app/data
COPY input_messages /app/input_messages

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000}"]
