# Coding Guidelines & Best Practices

## 1. Database Migrations & Seeders
- **Rule:** Always use an append-only sequence for migrations.
- **Naming Convention:** `001_<description>.sql`, `002_<description>.sql`.
- Example: `001_master_data.sql`, `002_inventory_tables.sql`.
- **Constraint:** Never mutate past migrations. If a schema change is needed, create a new sequential file (e.g., `003_add_expiry_column.sql`).
- **Seeders:** For every migration, there MUST be a corresponding dev stage seeder file (e.g., `seed_001_<description>.sql`). This ensures the dev environment is always populated with mock data (like an initial Admin user, test locations, dummy entities, etc.) upon spin-up.

## 2. Backend Syntax & Best Practices (FastAPI + Python)
- **Typing:** Use strict type hinting everywhere.
- **Async:** Since `asyncpg` is used, ensure all DB operations are non-blocking `await` calls.
- **Data Transfer Objects (DTOs):** Always use Pydantic models for request/response validation. Do not leak raw DB dictionaries directly to the API response without parsing them through Pydantic.
- **Error Handling:** Use FastAPI `HTTPException`. Do not catch generic `Exception` without logging the stack trace.
- **Dependency Injection:** Use FastAPI's `Depends` for providing the `asyncpg.Pool` to your Repositories, and inject Repositories into Services.
- **Imports:** Group imports: standard library first, third-party second, local imports third.

## 3. Frontend Syntax & Best Practices (React + TypeScript)
- **Component Structure:**
  - One component per file.
  - Use PascalCase for component files (e.g., `BatchSelector.tsx`).
  - Keep components pure where possible. Extract complex logic into custom hooks.
- **State Management:**
  - **Server State:** Use `tanstack/react-query` exclusively. No `useEffect` for data fetching!
  - **Local State:** Use standard `useState`.
- **Styling:**
  - Use TailwindCSS utility classes. Avoid inline styles (`style={{...}}`).
  - Use `clsx` or `tailwind-merge` for conditional class joining.
- **Types:**
  - Define interfaces for all API responses in a central `types/api.ts` file.
  - No `any` types allowed. Use `unknown` if strictly necessary.
