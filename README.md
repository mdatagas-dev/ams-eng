# ams-eng

Engineering asset management: condition, custody, and immutable history for equipment across departments. Next.js 16 (App Router) frontend + Express 5 API, Prisma 7 on PostgreSQL. Two separate processes.

## Quickstart (local)

Requires Node 20+ and a running PostgreSQL.

```bash
cp .env.example .env   # set DATABASE_URL + BOOTSTRAP_* passwords
npm install
npm run db:migrate     # apply migrations
npm run db:seed        # optional: bootstrap users + sample data

# two terminals:
npm run dev:api        # Express API on :4000
npm run dev            # Next dev server on :3000
```

## Production (PM2)

Install PM2 once on the host:

```bash
npm install --global pm2
```

Build and start both processes:

```bash
npm run db:deploy
npm run db:seed       # optional: bootstrap users + sample data
npm run build:api
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

- Web UI: http://localhost:3000
- API: http://localhost:4000/api

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (required) |
| `API_PORT` / `API_HOST` | Express bind address (defaults `4000` / `127.0.0.1`) |
| `API_URL` | Base URL the Next process uses to reach the API |
| `COOKIE_SECURE` | Set to `true` when serving through HTTPS |
| `BOOTSTRAP_SUPERUSER_*` | Name/username/password for the first super-user (seed only) |
| `BOOTSTRAP_ADMIN_*` | Name/username/password for the first admin (seed only) |

Bootstrap users are only created when all three fields of each set are filled in, and only on first seed.

## Verify changes

```bash
npm run lint && npm run typecheck && npm test
```

`typecheck` covers both tsconfigs (root Next app + `server/`).

## Structure

- `app/` — Next App Router. `(workspace)/` is authenticated; `login/` and `checkout/cabinet/[id]/` are public.
- `server/` — Express 5 API (routes, auth, input validation). Compiled to `dist/server/`.
- `prisma/` — schema, migrations, seed.
- `components/` — shadcn/ui + app components.
- `lib/` — shared frontend helpers (`api.ts` is the server-only HTTP client for the Express API).

See `AGENTS.md` for the full command reference and architecture conventions.
