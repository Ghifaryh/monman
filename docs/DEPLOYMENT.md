# Deployment, CI/CD, and SQLite in production

Notes for hosting MonMan (Go API + React SPA + SQLite) without treating the database like a file you can casually copy into git.

---

## Architecture reminder

- **Backend:** `cmd/server` — listens on **`API_PORT`** (default **8080**).
- **Database:** Single **SQLite file** path from **`SQLITE_PATH`** (default **`./data/monman.db`** locally; **`/data/monman.db`** in Docker — see **`backend/Dockerfile`** and **`entrypoint.sh`**).
- **Frontend:** Static files from `npm run build` (`frontend/dist`), configured with **`VITE_API_URL`** pointing at the API origin.

---

## SQLite in production: rules of thumb

1. **Never commit** the live `.db` file to Git. Use **migrations** (`migrations/sqlite/`) as the source of truth for schema. (See **`backend/.gitignore`** — `data/`, `*.db`, WAL sidecars.)

2. **Persist the file or directory.** Containers are ephemeral. Mount a **volume** (Docker/Kubernetes) or attach **persistent disk** so `SQLITE_PATH` survives restarts. If you don’t, every deploy starts with an empty DB unless you restore a backup.

3. **WAL mode** (used by the driver DSN in **`internal/db/connection.go`**) creates **`*.db-wal`** and **`*.db-shm`** next to the main file. Back up **all three** together, or use SQLite’s **`.backup`** / **VACUUM INTO** for a consistent snapshot.

4. **Backups:** Schedule **file-level backups** of the DB path (and WAL/SHM if present) during low traffic, or use `sqlite3` backup API. Test restore on a staging instance.

5. **Single writer.** SQLite handles concurrent readers well, but **one primary writer** process is the happy path. Multiple app replicas **writing the same file over a network filesystem** is a common source of corruption — prefer **one API instance** or use a proper client/server DB (Postgres, etc.) if you need horizontal write scaling.

6. **Migrations on deploy:** Run **`migrate`** before or as part of starting the server. The repo’s **`entrypoint.sh`** runs **`migrate`** then **`server`** — good pattern for Docker; mirror that in CI/CD (deploy job runs migration step, then starts app).

---

## Environment variables (checklist)

| Variable | Role |
|----------|------|
| `SQLITE_PATH` | Absolute path to the DB file in production (e.g. `/data/monman.db`). |
| `SQLITE_MIGRATIONS_DIR` | Optional override; Docker image defaults to **`/app/migrations/sqlite`**. |
| `JWT_SECRET` | **Must** be long and random in production. |
| `API_PORT` | Often **8080** behind a reverse proxy. |
| Frontend `VITE_API_URL` | Public URL of the API (built at **`npm run build`** time — it is **not** read at runtime from the browser unless you add code for that). |

---

## Docker (already in repo)

- **`backend/Dockerfile`**: builds **`server`** and **`migrate`**, copies **`migrations/sqlite`**, sets **`SQLITE_PATH=/data/monman.db`**.
- **`entrypoint.sh`**: creates parent dir for `SQLITE_PATH`, runs migrate (with optional `-sample` fallback in script), starts server.

**Production:** mount **`-v monman-data:/data`** (or bind mount to a host path) so **`/data/monman.db`** persists.

---

## GitHub Actions: a minimal pattern

You do not have a workflow committed yet; this is a **template** you can drop in **`.github/workflows/ci.yml`**.

### Goals

- On every push/PR: **lint/test/build backend**, **lint/build frontend**.
- Optionally: **build Docker image** and push to GHCR.
- **Do not** upload your SQLite file as an artifact; **do** run migrations against a **throwaway** DB in CI if you add integration tests.

### Example workflow (outline)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.22" # match go.mod
      - run: go build ./...
      - run: go test ./...    # add tests as the project grows
      # Optional: create temp DB and migrate
      - run: |
          export SQLITE_PATH=$RUNNER_TEMP/monman-ci.db
          go run ./cmd/migrate

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

Adjust **Go version** to match **`backend/go.mod`**.

### Secrets (later)

- **Docker registry:** `GITHUB_TOKEN` or `CR_PAT` to push images.
- **Deploy:** SSH key, Kubernetes kubeconfig, or cloud provider OIDC — keep these in **GitHub Environments** with protection rules.

---

## Hosting options (high level)

| Setup | API | Frontend | SQLite |
|-------|-----|----------|--------|
| **VPS + Docker** | Container with volume on `/data` | Nginx serves `dist` or separate static host | Easiest story: single node, one volume. |
| **PaaS (Fly.io, Railway, etc.)** | One service | Static site or same app | Must enable **persistent volume**; read their SQLite docs. |
| **Split: static on CDN + API on VM** | CORS already in **`internal/middleware/cors.go`** | `VITE_API_URL` to API URL | Same as above for API disk. |

---

## What not to do

- Do not rely on SQLite on **NFS** for multiple writers.
- Do not store **secrets** in the frontend bundle (`VITE_*` is visible to users).
- Do not run **`migrate -sample`** in production if that file adds demo users/data (check **`cmd/migrate`** and **`004_`** migrations).

---

## Related files in this repo

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Production-style image |
| `backend/entrypoint.sh` | Migrate then serve |
| `backend/internal/config/config.go` | Env → config |
| `backend/internal/db/connection.go` | SQLite DSN, WAL pragmas |
| `backend/cmd/migrate/main.go` | Migration entrypoint |

For day-to-day feature work, start with **[DEVELOPMENT.md](./DEVELOPMENT.md)**.
