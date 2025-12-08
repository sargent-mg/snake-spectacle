# Stage 1: Build Frontend
FROM node:18-alpine as build-frontend
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Final Image
FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy backend application code
COPY backend/ .

# Copy built frontend assets
# COPY --from=build-frontend /app/frontend/dist /app/static
# Wait, checking where Vite outputs build. Usually 'dist'.
# I'll verify that in a second, but 'dist' is standard.
COPY --from=build-frontend /app/frontend/dist /app/static

# Run the application
# We need to set the environment variable to look for static files if we make that configurable,
# but for now we'll hardcode /app/static in the python code.
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
