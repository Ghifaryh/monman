# AGENTS.md — MonMan

## Quick reference

```bash
# Backend (from backend/) — env vars required, Go does NOT auto-read .env
cp backend/.env.example backend/.env
export $(grep -v '^#' backend/.env | xargs)  # or: set -a && source backend/.env && set +a
go run ./cmd/migrate              # schema + seed categories + test user
go run ./cmd/migrate -sample      # also loads 004_dev_sample.sql (demo transactions/budgets)
go run ./cmd/server               # API on :8080 (API_PORT env)
go build ./...                    # build check (no tests exist)

# Frontend (from frontend/) — uses Bun, not npm/node
bun install                       # match bun.lock (package-lock.json is stale)
bun dev                           # Vite dev server
npm run build                     # tsc -b && vite build (typecheck included)
npm run lint                      # eslint

# Reset dev database
./reset-db.sh
```

## Architecture

- **Backend:** Go 1.24 + Chi router + SQLite (`modernc.org/sqlite`, WAL mode, single file). JWT auth (bcrypt passwords). Clean layered: `handler → service → repository`.
- **Frontend:** React 19 + Vite 7 + TanStack Router + TanStack Query + TailwindCSS v4. Bun for dev, nginx for production Docker.
- **DB:** SQLite file specified by `SQLITE_PATH` (default `./data/monman.db`). Migrations live in `backend/migrations/sqlite/` (numbered `00X_*.sql` sorted lexically).
- **Docker production:** `docker-compose.yml` — API + nginx frontend, SQLite on a named volume.

## Critical gotchas

- **PostgreSQL is legacy.** The `.github/copilot-instructions.md` and `backend/README.md` still describe a PostgreSQL setup that is no longer used. The real database is SQLite via `modernc.org/sqlite`. `docker-compose.dev.yml` has a Postgres profile only for legacy development — ignore it for new work.
- **Go doesn't read `.env` files.** The backend reads from OS environment only. Either export vars before running, or source the `.env` file.
- **Money is in cents (BIGINT).** All amounts in the API are signed integers — negative for expenses, positive for income. Rp 10.000 = 1000000. Frontend formats with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.
- **UUID primary keys** on all tables. Not auto-increment ints.
- **Local dev uses Bun** (`bun dev`, `bun install`). The `package-lock.json` exists but `bun.lock` is the authoritative lockfile.
- **`tsc -b` is the typecheck.** It's embedded in `npm run build`. No separate `typecheck` script.
- **`go run ./cmd/migrate` must run from `backend/`.** It locates the module root by walking up to find `go.mod` + `migrations/sqlite/`.
- **No CI workflow exists.** The `docs/DEPLOYMENT.md` has a template but `.github/workflows/` is empty.
- **No tests exist** anywhere — no `_test.go` files, no Jest/Vitest setup.
- **API env var `VITE_API_URL`** is baked at build time (not runtime). Defaults to `http://localhost:8080` in `client.ts`.

## Backend patterns

- **Adding a new endpoint:** Follow `docs/DEVELOPMENT.md` — models first (`internal/models/api_writes.go`), then repository, then service (`internal/service/finance.go`), then handler (`internal/api/handler.go`), then route registration in `NewHandler()`.
- **Validation errors** use `service.validationError` + `service.IsValidation(err)` → handler returns 400. Other errors return 500.
- **Protected routes** go under `r.Route("/api", ...)` with `middleware.JWTAuth(cfg)`. Get user from `middleware.GetUserFromContext(r)`.
- **New DB columns/tables** require a new migration file in `migrations/sqlite/` (numbered higher than existing files). Run `go run ./cmd/migrate` to apply.
- **JSON response envelope:** `{"status":"success", "data":{...}}` or `{"error":"message"}` via `utils.WriteJSONResponse`/`utils.WriteErrorResponse`.

## Frontend patterns

- **Router:** `src/routes/index.tsx` — layout-less `rootRoute` for login; authenticated routes under `appLayoutRoute` (wraps in `App` layout + JWT guard).
- **API calls:** Use `authenticatedRequest<T>()` from `src/api/client.ts`. Add new endpoints to `src/api/finance.ts`.
- **TanStack Query:** Mutations go in `src/hooks/useFinanceQueries.ts`. Always `invalidateQueries` on mutation success — key constants are exported (`dashboardQueryKey`, `transactionsQueryKey`, etc.).
- **Component organization:** Pages in `src/pages/`, feature-specific in `src/features/{feature}/`, shared in `src/components/`. Layouts in `src/layouts/`.
- **TailwindCSS v4** via `@tailwindcss/vite` plugin — no `tailwind.config.*` file (v4 uses CSS-based config).

## References

- `docs/DEVELOPMENT.md` — detailed walkthrough for adding full-stack features
- `docs/DEPLOYMENT.md` — production notes, backup strategy, CI template
- `backend/DATABASE.md` — full schema reference (written for Postgres era; actual schema is in `migrations/sqlite/001_schema.sql`)
- `backend/.env.example` — all backend env vars
- `.github/copilot-instructions.md` — **outdated** (Postgres focus, stale status); the codebase has moved on
