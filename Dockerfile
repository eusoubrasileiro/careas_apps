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

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn
RUN pip install --no-cache-dir "aidbag @ git+https://github.com/eusoubrasileiro/aidbag.git"

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build ./build/

# Environment
ENV FLASK_APP=backend.main
ENV APP_ENV=production

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "backend.main:app"]
