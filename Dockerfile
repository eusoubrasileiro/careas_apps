# syntax=docker/dockerfile:1

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN CI=false npm run build

# Stage 2: Production image
FROM python:3.12-slim AS production
WORKDIR /app

# Install git (needed to clone aidbag from GitHub)
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Install aidbag from GitHub (private repo, needs a PAT).
# The token comes in as a BuildKit secret, NOT a build-arg: build-args are recorded in the
# image config history and would be readable by anyone who pulls the published image.
RUN --mount=type=secret,id=github_token \
    pip install --no-cache-dir \
        "aidbag @ git+https://$(cat /run/secrets/github_token)@github.com/eusoubrasileiro/aidbag.git"

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend (Vite outputs to dist/)
# Flask expects static_folder='../build' relative to /app, so copy to /build
COPY --from=frontend-builder /app/frontend/dist /build/

# Environment
ENV FLASK_APP=backend.main
ENV APP_ENV=production

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "backend.main:app"]
