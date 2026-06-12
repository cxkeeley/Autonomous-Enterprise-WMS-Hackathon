import asyncio
import os
import asyncpg
from app.config.settings import settings

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "migrations")


async def run_migrations() -> None:
    """Run all pending SQL migration and seeder files in sequential order."""
    conn = await asyncpg.connect(dsn=settings.database_url)
    try:
        # Ensure migrations tracking table exists
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS _migrations (
                filename VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        all_files = sorted(
            f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql")
        )

        # Run migrations first (numbered files), then seeders (seed_* files)
        migrations = [f for f in all_files if not f.startswith("seed_")]
        seeders = [f for f in all_files if f.startswith("seed_")]

        for filename in migrations + seeders:
            row = await conn.fetchrow(
                "SELECT 1 FROM _migrations WHERE filename = $1", filename
            )
            if row:
                print(f"[SKIP] {filename} already applied")
                continue

            filepath = os.path.join(MIGRATIONS_DIR, filename)
            with open(filepath, "r") as f:
                sql = f.read()

            print(f"[RUN] {filename}...")
            await conn.execute(sql)
            await conn.execute(
                "INSERT INTO _migrations (filename) VALUES ($1)", filename
            )
            print(f"[DONE] {filename}")

        print("All migrations and seeders applied successfully.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migrations())
