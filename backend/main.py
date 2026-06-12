from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.db.database import init_db, close_db
from app.db.migrate import run_migrations
from app.routers.auth_router import router as auth_router
from app.routers.users_router import router as users_router
from app.routers.upload_router import router as upload_router
from app.routers.items_router import router as items_router
from app.routers.locations_router import router as locations_router
from app.routers.entities_router import router as entities_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize DB pool and run migrations on startup."""
    # Startup
    await init_db()
    await run_migrations()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title=settings.app_name,
    description="API for Warehouse Management System",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3010",
        "http://127.0.0.1:3010",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(upload_router)
app.include_router(items_router)
app.include_router(locations_router)
app.include_router(entities_router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "Warehouse API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
