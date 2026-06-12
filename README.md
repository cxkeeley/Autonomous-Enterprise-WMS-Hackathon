# Autonomous Enterprise WMS 🤖📦

An enterprise-grade Warehouse Management System (WMS) built entirely by autonomous AI coding agents (Claude/DeepSeek) under the architectural guidance of a human Tech Lead. 

This repository serves as a **benchmark test of local AI capabilities** and a demonstration of the modern software development paradigm.

---

## 🧪 The Experiment: A Paradigm Shift in Development

In traditional software engineering, a team (Backend Developer, Frontend Developer, UI/UX Designer) would require **1 to 2 weeks** to negotiate API contracts, scaffold infrastructure, and write the boilerplate required for a production-ready application of this scale.

**This entire system was built from an empty folder in under 3 hours.**

### The New Workflow
This experiment successfully proves that the bottleneck of software engineering has shifted:
1. **The Human is the Architect:** Instead of typing code, the human engineer writes strict foundational documents (`PRD.md`, `TSD.md`, `API_Contract.md`) and acts as the Product Owner.
2. **The AI is the Executor:** The AI agent reads the architectural constraints and autonomously executes them across a 4-sprint Agile plan—writing SQL, configuring Docker, and building React components.
3. **The Human is the QA Auditor:** The human oversees the Git branching strategy, catches infinite loops, audits database row-level locking for race conditions, and validates the UI.

---

## 🏗️ Architecture & Tech Stack

This isn't a Minimum Viable Product (MVP). This is a highly decoupled, scalable architecture designed to mimic real enterprise environments.

- **Frontend:** React + Vite + TypeScript + TailwindCSS.
- **Backend:** Python FastAPI.
- **Database:** PostgreSQL 17.
- **Storage:** MinIO (S3-compatible Object Storage for receipt uploads).
- **Infrastructure:** Fully Dockerized (`docker-compose`) with Nginx reverse proxying.

### Key Architectural Decisions
- **No ORM:** We strictly avoided ORMs (like SQLAlchemy) to ensure maximum performance and explicit control over transactions. All database queries use pure, raw SQL via `asyncpg`.
- **Atomic Transactions:** The Goods Receipt (`/inward`) and FIFO Dispatch (`/outward`) operations use `conn.transaction()` with strict `SELECT ... FOR UPDATE` row-level locking to completely eliminate race conditions and negative inventory.
- **Append-Only Migrations:** Database schema evolves through strict append-only `.sql` migrations (`001`, `002`, `003`), accompanied by mandatory Dev-Stage Seeders to guarantee testable state.
- **Strict Role-Based Access (RBAC):** JWT-secured endpoints separating Admins, Managers, and Operators.

---

## 🚀 How to Run

The system is fully containerized. You do not need to install Python or Node locally.

```bash
# Clone the repository
git clone <repository-url>
cd warehouse-app

# Spin up the infrastructure
docker compose up -d --build
```

### Services
Once the containers are healthy, the application maps to the following local ports:
- **Frontend App:** [http://localhost:3080](http://localhost:3080)
- **FastAPI Backend Swagger Docs:** [http://localhost:8088/docs](http://localhost:8088/docs)
- **MinIO S3 Console:** [http://localhost:9001](http://localhost:9001) *(Login: minioadmin / minioadmin)*
- **PostgreSQL Database:** `localhost:5434`

### Default Login
Because the migrations automatically run the Dev-Stage Seeders, you can immediately log in:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📈 Sprints Completed
- [x] **Sprint 1:** Security (JWT) & Master Data Foundation (Items, Locations, Entities).
- [x] **Sprint 2:** Inbound Operations (Atomic transactions) & Real-Time Inventory Ledger.
- [x] **Sprint 3:** FIFO/FEFO Algorithmic Dispatch Engine & Outbound Operations UI.
- [x] **Sprint 4:** Production Routing (WIP Transfers), Cycle Adjustments, & Final Polish.
