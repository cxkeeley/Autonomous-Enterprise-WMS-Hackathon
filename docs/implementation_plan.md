# Warehouse Application Architecture & Planning

I have generated the full documentation suite for your AI development team (DeepSeek + Claude Code). You will find the complete architecture, API contracts, and Sprint plans in the generated artifacts.

## Generated Documents
1. **[Product Requirements Document (PRD)](file:///home/darwin/.gemini/antigravity/brain/13d86cfe-e740-42c7-a8d1-52bfbc329365/PRD.md):** Details the domain logic, item types, operations, and tracking mechanisms.
2. **[Technical Specification Document (TSD)](file:///home/darwin/.gemini/antigravity/brain/13d86cfe-e740-42c7-a8d1-52bfbc329365/TSD.md):** Details the 2-layer asyncpg backend architecture, DB schema, and React component strategy.
3. **[API Contract](file:///home/darwin/.gemini/antigravity/brain/13d86cfe-e740-42c7-a8d1-52bfbc329365/API_Contract.md):** JSON structures and endpoint definitions.
4. **[Sprint Plan](file:///home/darwin/.gemini/antigravity/brain/13d86cfe-e740-42c7-a8d1-52bfbc329365/Sprint_Plan.md):** Step-by-step phases designed perfectly for an agentic workflow.
5. **[Coding Guidelines & Best Practices](file:///home/darwin/.gemini/antigravity/brain/13d86cfe-e740-42c7-a8d1-52bfbc329365/Coding_Guidelines.md):** Strict syntax, DB migration rules (append-only), and frontend/backend standards for your AI team.

## User Review Required
> [!IMPORTANT]
> Please review the generated documents. Once you approve the SQL schema, API paths, and component strategy, you can hand these artifacts directly to your DeepSeek + Claude Code agents to begin development!

## Proposed Architecture Highlight
*   **Backend:** Pure `asyncpg` queries executed in a Repository layer, abstracted by a Service layer. No ORMs used.
*   **Frontend:** Vite + React + React Query for server-state management. Highly reusable components (`DataTable`, `BatchSelector`, `StatusBadge`) designed to map to specific UI needs across multiple pages.
