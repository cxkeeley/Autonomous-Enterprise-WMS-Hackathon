# =============================================================================
# Backend Dockerfile — FastAPI + Uvicorn
# =============================================================================
# Multi-stage: install deps in a build stage, runtime in a lean final image.

# ---- Build stage ----
FROM python:3.10-slim AS builder

WORKDIR /build

# Install system deps needed for psycopg2 / bcrypt compilation (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ---- Runtime stage ----
FROM python:3.10-slim

# Create non-root user
RUN groupadd -r warehouse && useradd -r -g warehouse -d /app -s /bin/false warehouse

WORKDIR /app

# Copy installed packages from builder to a system-wide location
COPY --from=builder /root/.local /usr/local

# Copy application code
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p /app/uploads && chown -R warehouse:warehouse /app

USER warehouse

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
