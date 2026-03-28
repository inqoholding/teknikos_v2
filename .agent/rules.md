# AI Agent Coordination Rules (Coreveta)

This file defines the shared standards and communication protocols for all AI agents (Codex, Antigravity, etc.) working on the Coreveta project.

## 1. Coding & Routing Standards
- **Express Wildcards**: Always use standard Express wildcard syntax `*` (e.g., `/api/auth/*`) instead of custom or non-standard wildcards like `{*any}`. 
- **Validation**: Use **Zod** for all input validation.schemas should be centralized in `backend/src/lib/validation.ts` or close to the route they protect.
- **RESTful Principles**: Follow standard HTTP methods (GET, POST, PATCH, DELETE) and return appropriate status codes (400, 401, 403, 404, 429, 500).

## 2. Environment & URL Handling
- **No Hardcoded IPs**: Do NOT hardcode the VPS IP (`156.67.220.110`) or domain (`app.coreveta.com`) directly in logic. Use `env.BETTER_AUTH_URL` or `env.FRONTEND_URL`.
- **Dynamic Protocols**: Logic for secure cookies should depend on `env.BETTER_AUTH_URL.startsWith("https://")`.
- **Trusted Origins**: Use `backend/src/lib/origins.ts` to manage allowed origins. Ensure it handles both IP and Domain access if required.

## 3. Communication & State
- **Task Tracking**: All agents MUST update the root `task.md` (or the brain's task artifact) to signal current progress and avoid duplicate or conflicting work.
- **Atomic Operations**: Try to complete one logical feature or fix at a time before moving to the next.
- **Error Reporting**: If a change causes a regression (e.g., broken login), prioritize fixing the regression immediately.

## 4. Security & Compliance
- **CSRF Protection**: All sensitive write operations (POST/PATCH/DELETE) MUST pass through `requireCsrf` and include the `x-teknikos-csrf: 1` header.
- **Rate Limiting**: Use Redis-backed rate limiting for public and sensitive endpoints. Avoid blocking legitimate administrative access.
- **Data Privacy**: Ensure all PI/legal requirements (Privacy Policy, TOS) are linked and functional.

## 5. Conflict Resolution
- If one agent finds a file in an inconsistent state (e.g., broken syntax or non-standard logic), it MUST fix it to meet these standards before proceeding with new features.
