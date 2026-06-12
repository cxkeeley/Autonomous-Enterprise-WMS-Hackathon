# =============================================================================
# Deployment Guide — Warehouse Management System
# =============================================================================
#
# This document covers two deployment modes:
#   1. Development (local) — PostgreSQL runs natively, app runs via CLI
#   2. Production (Docker)  — Everything runs in containers via docker-compose
# =============================================================================

## Prerequisites

- Docker & Docker Compose v2 (for production)
- Python 3.10+ (for local dev backend)
- Node.js 22+ (for local dev frontend)
- PostgreSQL 17 (for local dev database)

---

## 1. Development Environment (Local)

In development, PostgreSQL runs natively on your machine. The backend and
frontend run via their respective CLIs for hot-reload.

### 1.1 Database Setup

```bash
# Ensure PostgreSQL is running and create the database
createdb warehouse_db

# Or via psql:
psql -U postgres -c "CREATE DATABASE warehouse_db;"
```

### 1.2 Backend Setup

```bash
cd backend

# Create virtual environment (one-time)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit .env or set env vars)
# Default .env works for local postgres with user=postgres, password=secret
# Database URL: postgresql://postgres:secret@localhost:5432/warehouse_db

# Run migrations manually (optional — app auto-runs on startup)
python -m app.db.migrate

# Start the dev server (hot-reload enabled)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8080`.
Swagger docs at `http://localhost:8080/docs`.

### 1.3 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (hot-reload, proxies /api to backend)
npm run dev
```

The frontend is available at `http://localhost:5173`.

### 1.4 MinIO Setup (Local)

For local development, you can either:
- **Option A:** Run MinIO via Docker: `docker run -p 9000:9000 -p 9001:9001 minio/minio server /data`
- **Option B:** Use the production docker-compose but only start MinIO:
  ```bash
  docker compose up -d minio
  ```

MinIO Console: `http://localhost:9001` (login: minioadmin / minioadmin)

---

## 2. Production Environment (Docker)

In production, all services run in Docker containers orchestrated by
docker-compose. The compose file is at the project root.

> **Port convention:**
> - **Production:** frontend `:80`, backend `:8080`
> - **Dev local:** frontend `:3010`, backend `:8085`
>
> If running docker-compose in your dev environment, adjust the host ports
> in `docker-compose.yml` to avoid conflicts with other running services.

### 2.1 Quick Start

```bash
# From the project root
cd /path/to/warehouse-app

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 2.2 Service Endpoints (Production)

| Service  | URL                          | Description              |
|----------|------------------------------|--------------------------|
| Frontend | `http://localhost`           | React SPA (via Nginx)    |
| Backend  | `http://localhost:8080`      | FastAPI (direct access)  |
| API Docs | `http://localhost:8080/docs` | Swagger UI               |
| MinIO    | `http://localhost:9001`      | S3 Web Console           |
| Postgres | `localhost:5432`             | Direct DB access         |

> **Dev local endpoints:** frontend `http://localhost:3010`, backend `http://localhost:8085`

### 2.3 Environment Variables

Create a `.env` file at the project root to override defaults:

```bash
# JWT Secret — CHANGE THIS IN PRODUCTION
WMS_JWT_SECRET_KEY=your-strong-random-secret-here

# Optional overrides
WMS_JWT_EXPIRATION_MINUTES=480
WMS_MAX_UPLOAD_SIZE_MB=10
```

### 2.4 Rebuilding After Code Changes

```bash
# Rebuild and restart specific services
docker compose up -d --build backend
docker compose up -d --build frontend

# Or rebuild everything
docker compose up -d --build
```

### 2.5 Database Migrations

Migrations run automatically on backend startup via the `lifespan` event.
They are append-only — never modify a past migration file.

To add a new migration:
1. Create `backend/migrations/003_<description>.sql`
2. Rebuild and restart the backend:
   ```bash
   docker compose up -d --build backend
   ```

### 2.6 Data Persistence

Data is stored in Docker volumes:

```bash
# List volumes
docker volume ls | grep wms

# Backup PostgreSQL data
docker exec wms-postgres pg_dump -U postgres warehouse_db > backup.sql

# Restore PostgreSQL data
cat backup.sql | docker exec -i wms-postgres psql -U postgres -d warehouse_db
```

---

## 3. Architecture Diagram

```
┌─────────────┐       ┌──────────────┐       ┌────────────┐
│   Browser   │──────▶│  Nginx (80)  │──────▶│  FastAPI   │
│ (React SPA) │       │  (frontend)  │       │ (backend)  │
└─────────────┘       │  /api/* proxy│       │  :8000     │
                      └──────────────┘       └─────┬──────┘
                                                   │
                          ┌────────────────────────┼────────────┐
                          │                        │            │
                          ▼                        ▼            ▼
                   ┌─────────────┐         ┌────────────┐
                   │  PostgreSQL │         │   MinIO    │
                   │  :5432      │         │  S3 :9000  │
                   └─────────────┘         └────────────┘
```

---

## 4. Common Operations

### 4.1 View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### 4.2 Restart a Service

```bash
docker compose restart backend
```

### 4.3 Full Teardown (removes volumes/data)

```bash
docker compose down -v
```

### 4.4 Access the Database

```bash
# Via docker exec
docker exec -it wms-postgres psql -U postgres -d warehouse_db

# Via local psql (if port 5432 is exposed)
psql -h localhost -U postgres -d warehouse_db
```

### 4.5 Seed an Admin User

```bash
# After the backend is running, create an initial admin user:
curl -X POST http://localhost:8000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"username": "admin", "password": "admin123", "role": "ADMIN"}'
```

> **Note:** You need an initial admin token. One approach: connect to the DB
> directly and insert a user, or implement a seed script.

---

## 5. Troubleshooting

| Problem                          | Solution                                      |
|----------------------------------|-----------------------------------------------|
| Backend can't connect to DB      | Check `WMS_DATABASE_URL` in .env or compose   |
| MinIO connection refused         | Ensure MinIO container is healthy             |
| Frontend shows blank page        | Check Nginx logs: `docker compose logs -f frontend` |
| File upload fails (413)          | Increase `client_max_body_size` in nginx.conf |
| CORS error in browser            | Verify backend CORS origins include frontend URL |
| Migration not running            | Check `_migrations` table in PostgreSQL       |
