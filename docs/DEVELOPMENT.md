# MonMan development guide

This project is a **small full-stack app**: a **Go** HTTP API (Chi + SQLite) and a **React + Vite** SPA. This document is a personal checklist so you can add features without relying on memory or on a single assistant session.

---

## Why backend first, then frontend?

1. **The API is the contract.** JSON field names, HTTP methods, and status codes are what both sides must agree on. If you build the UI first, you often guess wrong and rewrite it.
2. **You can test the API with `curl` or Bruno/Postman** before any React code exists.
3. **The frontend is “just” a client** of that contract: `fetch`, types, and React Query.

You *can* sketch UI copy or wireframes first for clarity—but for **implementation order**, **models → persistence → HTTP → client → UI** keeps rework low.

---

## Adding a new endpoint (backend)

Work **top-down in design** but **bottom-up in code** inside the server: **data shape → database (if needed) → service rules → HTTP handler → route registration**.

### 1. Request/response types (`internal/models/`)

- Put JSON bodies and shared DTOs in **`internal/models/api_writes.go`** (or a small new file if the file gets huge).
- Example: `CreateAccountRequest`, `CreateTransactionRequest` — see `api_writes.go`.

**Why:** Handlers decode JSON into structs; services return IDs or validation errors. Keeping types in one place avoids drift between handler and service.

### 2. Repository layer (`internal/repository/`)

- Add or extend a repository if you need **new SQL** (queries, inserts).
- Example: `AccountRepository.Create` in **`internal/repository/account.go`**.
- Another example: complex reads in **`internal/repository/budget.go`** (`ListBudgetCardsPayload`, `loadBudgetLineItemsMapped`).

**Why:** SQL stays out of HTTP handlers; you can test SQL-shaped logic in isolation (or at least read it in one file).

### 3. Service layer (`internal/service/finance.go` or `user.go`)

- Implement **`FinanceService.YourMethod`** (or `UserService`) with:
  - Input validation (non-empty strings, allowed enums, positive amounts).
  - Use **`validationError{...}`** for client mistakes; the handler maps those to **400**. See existing **`IsValidation(err)`** usage in **`internal/api/handler.go`**.
- Call repositories; return domain errors or `uuid.UUID` IDs.

**Why:** Business rules (e.g. “expense only with `budget_id`”) live here, not in Chi routes.

### 4. HTTP handler (`internal/api/handler.go`)

- Add **`handleYourThing`**:
  - `middleware.GetUserFromContext(r)` for protected routes under `/api` (JWT already applied in **`NewHandler`**).
  - `json.NewDecoder(r.Body).Decode(&req)`.
  - Call service; on **`IsValidation`** → 400 + message; on other errors → 500 log + generic message.

### 5. Register the route (**same file**, `NewHandler`)

- **`r.Route("/api", ...)`** for JWT-protected routes.
- Chi path params: **`r.Post("/budgets/{budgetID}/common-purchases", ...)`** pattern — see **`handleAppendBudgetCommonPurchases`**.
- Example route block: **`internal/api/handler.go`** roughly lines **79–93**.

### 6. Wiring (only if you add a new repository)

- **`NewHandler`** wires repos into services. If you add a **new** repository type, you must **`repository.New...(database.DB)`** and pass it into **`NewFinanceService(...)`** (or extend the constructor). Today: **`txRepo`, `accRepo`, `catRepo`, `budRepo`**.

### 7. Migrations (`migrations/sqlite/`)

- If you add tables/columns, add a **new numbered `00x_*.sql`** file and run **`go run ./cmd/migrate`** (from `backend/` with `SQLITE_PATH` / env as in **`.env.example`**).
- See **`cmd/migrate/main.go`** and **`internal/db/connection.go`** (`ApplySQLiteMigrations`).

---

## Reference chain: “create account” (end-to-end backend)

| Step | File | What to look at |
|------|------|-----------------|
| Model | `internal/models/api_writes.go` | `CreateAccountRequest` |
| Repo | `internal/repository/account.go` | `Create(...)` |
| Service | `internal/service/finance.go` | `CreateAccount` |
| HTTP + route | `internal/api/handler.go` | `handleCreateAccount`, `r.Post("/accounts", ...)` |

---

## Adding the same feature (frontend)

Work in this order so TypeScript and cache invalidation stay consistent.

### 1. API client (`frontend/src/api/finance.ts`)

- Add **types** for the response (or reuse existing).
- Add **`export async function yourCall(...)`** using **`authenticatedRequest`** from **`frontend/src/api/client.ts`** (JWT from `localStorage`).
- Follow **`createAccount`**, **`createTransaction`**, **`getBudgets`** as patterns.

### 2. React Query (`frontend/src/hooks/useFinanceQueries.ts`)

- Add a **query key** if it’s a new resource list (e.g. `accountsQueryKey`).
- **`useQuery`** for GET; **`useMutation`** for POST/PUT/DELETE.
- In **`onSuccess`** of mutations, **`invalidateQueries`** for whatever must refresh: **`dashboardQueryKey`**, **`transactionsQueryKey`**, **`budgetsQueryKey`**, **`accountsQueryKey`** — match what the backend change affects.

### 3. UI component (e.g. `frontend/src/pages/TransactionsPage.tsx`)

- Call the hook; on submit, **`mutate`** or **`mutateAsync`**; show errors from **`onError`** or local state.

### 4. Environment

- **`VITE_API_URL`** defaults in **`client.ts`** to `http://localhost:8080` — set in **`.env`** for other hosts.

---

## Reference chain: “create account” (frontend)

| Step | File | What to look at |
|------|------|-----------------|
| API | `frontend/src/api/finance.ts` | `createAccount`, `CreateAccountPayload` |
| Query/mutation | `frontend/src/hooks/useFinanceQueries.ts` | `useCreateAccountMutation` |
| UI | `frontend/src/pages/TransactionsPage.tsx` | Quick “add rekening” block + `createAcc.mutate` |

---

## Concepts worth studying (and where they appear)

These are not “you must master today,” but they explain *why* the code is structured this way.

| Idea | Where in MonMan | Why it matters |
|------|------------------|----------------|
| **Layered architecture** | handler → service → repository | Change SQL without changing HTTP; change validation without changing SQL strings in handlers. |
| **Validation vs server errors** | `validationError` + `IsValidation` in `finance.go` / `handler.go` | 400 = your input is wrong; 500 = bug or DB down. |
| **JWT middleware** | `internal/middleware/` + `r.Use(middleware.JWTAuth)` on `/api` | Every protected handler gets `user_id` from the token. |
| **React Query cache** | `invalidateQueries` after mutations | UI stays in sync without manual `refetch` everywhere. |
| **SQLite triggers** | `migrations/sqlite/001_schema.sql` | Some invariants (e.g. budget `spent_amount`) are enforced in the DB, not only in Go. |
| **Chi route tree** | `NewHandler` in `handler.go` | Clear map of public vs authenticated routes. |

If you want a **small algorithm topic**: **`db.BackendRoot`** in **`internal/db/connection.go`** walks up directories to find migrations — a simple **search** pattern, not recursion in the mathematical sense, but same idea: try, move up, stop when found.

---

## Quick sanity checks before you open a PR

- **Backend:** `go build ./...` from `backend/` (or your CI).
- **Frontend:** `npm run build` from `frontend/`.
- **Manual:** log in, hit the new flow, watch Network tab for status **201/200** and JSON shape.

---

## Further reading

- **Deploy & CI/CD, SQLite in production:** [DEPLOYMENT.md](./DEPLOYMENT.md)
